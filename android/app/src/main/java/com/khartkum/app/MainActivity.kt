package com.khartkum.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.WindowManager
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.ServiceWorkerClient
import android.webkit.ServiceWorkerController
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import java.io.IOException
import java.util.Locale

/** يشغّل ملفات التطبيق (مجلد assets) داخل WebView عبر عنوان https وهمي حتى تشتغل الوحدات وعامل الخدمة. */
class MainActivity : Activity() {
    private lateinit var web: WebView
    private var geoCallback: GeolocationPermissions.Callback? = null
    private var geoOrigin: String? = null
    private var tts: TextToSpeech? = null
    @Volatile private var ttsState = "init" // init | ok | missing
    private var tripActive = false
    private var focus: AudioFocusRequest? = null

    private class AssetHandler(private val act: Activity) : WebViewAssetLoader.PathHandler {
        override fun handle(path: String): WebResourceResponse? {
            val p = if (path.isEmpty() || path.endsWith("/")) path + "index.html" else path
            return try {
                val ext = p.substringAfterLast('.', "").lowercase()
                val mime = when (ext) {
                    "html" -> "text/html"
                    "js", "mjs" -> "text/javascript"
                    "css" -> "text/css"
                    "json", "webmanifest" -> "application/json"
                    "svg" -> "image/svg+xml"
                    "png" -> "image/png"
                    "jpg", "jpeg" -> "image/jpeg"
                    "woff2" -> "font/woff2"
                    "wasm" -> "application/wasm"
                    else -> "application/octet-stream"
                }
                val r = WebResourceResponse(mime, "utf-8", act.assets.open(p))
                r.responseHeaders = mapOf("Cache-Control" to "no-cache")
                r
            } catch (e: IOException) {
                WebResourceResponse("text/plain", "utf-8", 404, "Not Found", emptyMap(), "".byteInputStream())
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val loader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/", AssetHandler(this))
            .build()

        web = WebView(this)
        setContentView(web)
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setGeolocationEnabled(true)
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            // نحترم حجم خط النظام لكن بحد معقول حتى ما يخرب التصميم
            textZoom = (resources.configuration.fontScale * 100).toInt().coerceIn(90, 115)
        }
        web.addJavascriptInterface(Bridge(), "Android")
        initTts()

        // عامل الخدمة (الخرائط بدون إنترنت) يقرأ ملفاته من نفس الـ assets
        ServiceWorkerController.getInstance().setServiceWorkerClient(object : ServiceWorkerClient() {
            override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)
        })

        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == HOST) return false
                try { startActivity(Intent(Intent.ACTION_VIEW, request.url)) } catch (_: Exception) {}
                return true
            }

            override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false)
                } else {
                    geoCallback = callback
                    geoOrigin = origin
                    requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), REQ_LOC)
                }
            }
        }

        if (savedInstanceState != null) web.restoreState(savedInstanceState) else web.loadUrl("https://$HOST/index.html")
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQ_LOC) {
            val ok = grantResults.any { it == PackageManager.PERMISSION_GRANTED }
            geoCallback?.invoke(geoOrigin, ok, false)
            geoCallback = null
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // نسأل الصفحة أولاً (مثلاً شاشة الدخول)، وبعدين نرجع بسجل الصفحات، وبالنهاية نطلع
        web.evaluateJavascript("(window.__back&&window.__back())===true") { r ->
            if (r == "true") return@evaluateJavascript
            if (web.canGoBack()) web.goBack() else super.onBackPressed()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.action == Notif.ACTION_END_TRIP) web.evaluateJavascript("window.__endTrip&&window.__endTrip()", null)
    }

    // أثناء الرحلة ما نوقف الصفحة حتى يستمر الموقع والاتجاهات والإشعار والشاشة مطفية
    override fun onPause() { if (!tripActive) web.onPause(); super.onPause() }
    override fun onResume() { super.onResume(); web.onResume(); Notif.stopRing() }

    override fun onDestroy() {
        try { tts?.shutdown() } catch (_: Throwable) {}
        super.onDestroy()
    }

    private fun initTts() {
        tts = TextToSpeech(this) { st ->
            if (st != TextToSpeech.SUCCESS) { ttsState = "missing"; return@TextToSpeech }
            val t = tts ?: return@TextToSpeech
            var r = t.setLanguage(Locale("ar", "IQ"))
            if (r < TextToSpeech.LANG_AVAILABLE) r = t.setLanguage(Locale("ar"))
            ttsState = if (r >= TextToSpeech.LANG_AVAILABLE) "ok" else "missing"
            t.setAudioAttributes(AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
            t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(id: String?) {}
                override fun onDone(id: String?) { abandonFocus() }
                @Deprecated("Deprecated in Java") override fun onError(id: String?) { abandonFocus() }
            })
        }
    }

    // نخفّض صوت الموسيقى وقت الكلام
    private fun takeFocus() {
        if (Build.VERSION.SDK_INT < 26) return
        val am = getSystemService(AUDIO_SERVICE) as AudioManager
        val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
            .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
            .build()
        focus = req
        am.requestAudioFocus(req)
    }
    private fun abandonFocus() {
        if (Build.VERSION.SDK_INT < 26) return
        focus?.let { (getSystemService(AUDIO_SERVICE) as AudioManager).abandonAudioFocusRequest(it) }
        focus = null
    }

    inner class Bridge {
        @JavascriptInterface
        fun keepScreenOn(on: Boolean) = runOnUiThread {
            if (on) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }

        @JavascriptInterface
        fun speak(text: String, rate: Float, urgent: Boolean) {
            runOnUiThread {
                val t = tts ?: return@runOnUiThread
                t.setSpeechRate(rate.coerceIn(0.5f, 2f))
                takeFocus()
                t.speak(text, if (urgent) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD, null, "k" + System.nanoTime())
            }
        }

        @JavascriptInterface fun stopSpeech() = runOnUiThread { tts?.stop(); abandonFocus() }
        @JavascriptInterface fun ttsStatus(): String = ttsState
        @JavascriptInterface fun openTtsSettings() = runOnUiThread {
            try { startActivity(Intent("com.android.settings.TTS_SETTINGS")) } catch (_: Exception) { try { startActivity(Intent(android.provider.Settings.ACTION_SETTINGS)) } catch (_: Exception) {} }
        }

        @JavascriptInterface
        fun tripStart(title: String, text: String, big: String, progress: Int) = runOnUiThread {
            tripActive = true
            Notif.channels(this@MainActivity)
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
                requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQ_NOTIF)
            val i = Intent(this@MainActivity, TripService::class.java).putExtra("title", title).putExtra("text", text).putExtra("big", big).putExtra("progress", progress)
            val hasLoc = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            try {
                if (hasLoc) { if (Build.VERSION.SDK_INT >= 26) startForegroundService(i) else startService(i) }
                else Notif.update(this@MainActivity, title, text, big, progress)
            } catch (_: Throwable) { Notif.update(this@MainActivity, title, text, big, progress) }
        }

        @JavascriptInterface
        fun tripUpdate(title: String, text: String, big: String, progress: Int) = runOnUiThread {
            Notif.update(this@MainActivity, title, text, big, progress)
        }

        @JavascriptInterface
        fun tripArrive(dest: String) = runOnUiThread { endTrip(); Notif.arrive(this@MainActivity, dest) }

        @JavascriptInterface
        fun tripEnd() = runOnUiThread { endTrip() }

        @JavascriptInterface
        fun shareText(title: String, text: String) = runOnUiThread {
            val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, title).putExtra(Intent.EXTRA_TEXT, text)
            startActivity(Intent.createChooser(i, title))
        }
    }

    private fun endTrip() {
        tripActive = false
        try { startService(Intent(this, TripService::class.java).setAction(TripService.ACTION_STOP)) } catch (_: Throwable) {}
        Notif.cancelTrip(this)
    }

    companion object {
        const val REQ_NOTIF = 12
        const val HOST = "appassets.androidplatform.net"
        const val REQ_LOC = 11
    }
}
