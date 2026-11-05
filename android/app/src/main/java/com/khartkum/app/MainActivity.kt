package com.khartkum.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
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

/** يشغّل ملفات التطبيق (مجلد assets) داخل WebView عبر عنوان https وهمي حتى تشتغل الوحدات وعامل الخدمة. */
class MainActivity : Activity() {
    private lateinit var web: WebView
    private var geoCallback: GeolocationPermissions.Callback? = null
    private var geoOrigin: String? = null

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
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onPause() { web.onPause(); super.onPause() }
    override fun onResume() { super.onResume(); web.onResume() }

    inner class Bridge {
        @JavascriptInterface
        fun keepScreenOn(on: Boolean) = runOnUiThread {
            if (on) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }

        @JavascriptInterface
        fun shareText(title: String, text: String) = runOnUiThread {
            val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, title).putExtra(Intent.EXTRA_TEXT, text)
            startActivity(Intent.createChooser(i, title))
        }
    }

    companion object {
        const val HOST = "appassets.androidplatform.net"
        const val REQ_LOC = 11
    }
}
