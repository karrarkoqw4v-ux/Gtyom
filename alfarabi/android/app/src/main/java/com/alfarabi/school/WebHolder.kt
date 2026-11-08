package com.alfarabi.school

import android.Manifest
import android.annotation.SuppressLint
import android.app.Application
import android.app.DownloadManager
import android.content.Context
import android.content.ContentValues
import android.content.Intent
import android.content.MutableContextWrapper
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.RenderProcessGoneDetail
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * يحتفظ بصفحة المدرسة حيّة حتى لو انغلقت الواجهة، حتى تستمر المزامنة والإشعارات والمكالمات بالخلفية.
 * نفس صفحة المتصفح بالضبط، فالبيانات والتصميم متطابقين.
 */
object WebHolder {
    const val HOST = "appassets.androidplatform.net"
    const val REQ_FILE = 31
    const val REQ_MEDIA = 32
    const val REQ_NOTIF = 33

    lateinit var app: Application
    var activity: MainActivity? = null
    var web: WebView? = null
    var fileCb: ValueCallback<Array<Uri>>? = null
    var permReq: PermissionRequest? = null
    @Volatile var foreground = false
    @Volatile var pendingOpen = ""
    private var ctx: MutableContextWrapper? = null

    fun prefs(c: Context) = c.getSharedPreferences("af", Context.MODE_PRIVATE)

    private class AssetHandler(private val c: Context) : WebViewAssetLoader.PathHandler {
        override fun handle(path: String): WebResourceResponse? {
            val p = if (path.isEmpty() || path.endsWith("/")) path + "index.html" else path
            return try {
                val mime = when (p.substringAfterLast('.', "").lowercase()) {
                    "html" -> "text/html"
                    "js", "mjs" -> "text/javascript"
                    "css" -> "text/css"
                    "json", "webmanifest" -> "application/json"
                    "svg" -> "image/svg+xml"
                    "png" -> "image/png"
                    "jpg", "jpeg" -> "image/jpeg"
                    "woff2" -> "font/woff2"
                    "ttf" -> "font/ttf"
                    else -> "application/octet-stream"
                }
                val ota = Ota.open(c, p)
                WebResourceResponse(mime, "utf-8", ota ?: c.assets.open(p)).apply { responseHeaders = mapOf("Cache-Control" to "no-cache") }
            } catch (e: IOException) {
                WebResourceResponse("text/plain", "utf-8", 404, "Not Found", emptyMap(), "".byteInputStream())
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    fun obtain(application: Application, act: MainActivity): WebView {
        app = application
        try { Ota.startup(application) } catch (_: Throwable) {}
        ctx?.baseContext = act
        web?.let { return it }
        val cw = MutableContextWrapper(act); ctx = cw
        val loader = WebViewAssetLoader.Builder().setDomain(HOST).addPathHandler("/", AssetHandler(application)).build()
        val w = WebView(cw)
        w.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            @Suppress("DEPRECATION") setRenderPriority(WebSettings.RenderPriority.HIGH)
            cacheMode = WebSettings.LOAD_DEFAULT
            textZoom = 100 // نفس حجم الخط على كل الأجهزة بغض النظر عن حجم خط النظام
            userAgentString = userAgentString + " AlfarabiApp/1.0"
        }
        w.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
        try { w.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false) } catch (_: Throwable) {}
        CookieManager.getInstance().setAcceptThirdPartyCookies(w, true)
        w.addJavascriptInterface(Bridge(), "Android")

        w.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (!request.isForMainFrame || request.url.host == HOST) return false
                try { openExternal(request.url) } catch (_: Exception) {}
                return true
            }

            override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                web = null
                try { (view.parent as? android.view.ViewGroup)?.removeView(view); view.destroy() } catch (_: Throwable) {}
                activity?.runOnUiThread { activity?.recreate() }
                return true
            }
        }

        w.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(view: WebView, cb: ValueCallback<Array<Uri>>, p: FileChooserParams): Boolean {
                fileCb?.onReceiveValue(null)
                fileCb = cb
                val a = activity
                if (a == null) { fileCb = null; cb.onReceiveValue(null); return true }
                return try { a.startActivityForResult(p.createIntent(), REQ_FILE); true } catch (e: Exception) { fileCb = null; cb.onReceiveValue(null); true }
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                val need = ArrayList<String>()
                request.resources.forEach {
                    if (it == PermissionRequest.RESOURCE_VIDEO_CAPTURE) need.add(Manifest.permission.CAMERA)
                    if (it == PermissionRequest.RESOURCE_AUDIO_CAPTURE) need.add(Manifest.permission.RECORD_AUDIO)
                }
                val miss = need.filter { app.checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }
                val a = activity
                if (miss.isEmpty()) request.grant(request.resources)
                else if (a == null) request.deny()
                else { permReq?.deny(); permReq = request; a.requestPermissions(miss.toTypedArray(), REQ_MEDIA) }
            }
        }

        w.setDownloadListener { url, ua, cd, mime, _ ->
            try {
                val name = URLUtil.guessFileName(url, cd, mime)
                when {
                    url.startsWith("data:") -> saveData(url, name)
                    url.startsWith("http") -> {
                        val r = DownloadManager.Request(Uri.parse(url))
                            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name)
                            .addRequestHeader("User-Agent", ua)
                        (app.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(r)
                        toast("بدأ التنزيل")
                    }
                    else -> toast("هذا النوع من الملفات غير مدعوم للتنزيل")
                }
            } catch (e: Throwable) { toast("تعذّر التنزيل") }
        }

        web = w
        w.loadUrl("https://$HOST/index.html")
        return w
    }

    fun detach() {
        web?.let { (it.parent as? android.view.ViewGroup)?.removeView(it) }
        ctx?.baseContext = app
        activity = null
    }

    private fun toast(t: String) { android.os.Handler(android.os.Looper.getMainLooper()).post { Toast.makeText(app, t, Toast.LENGTH_SHORT).show() } }

    private fun openExternal(u: Uri) {
        val i = Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        app.startActivity(i)
    }

    private fun saveData(url: String, name: String) {
        val head = url.substringBefore(',')
        val mime = head.removePrefix("data:").substringBefore(';').ifEmpty { "application/octet-stream" }
        val bytes = if (head.contains("base64")) Base64.decode(url.substringAfter(','), Base64.DEFAULT) else Uri.decode(url.substringAfter(',')).toByteArray()
        if (Build.VERSION.SDK_INT >= 29) {
            val cv = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, name); put(MediaStore.Downloads.MIME_TYPE, mime)
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val uri = app.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv) ?: throw IOException("insert")
            app.contentResolver.openOutputStream(uri)!!.use { it.write(bytes) }
        } else {
            val dir = app.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: throw IOException("dir")
            java.io.File(dir, name).writeBytes(bytes)
        }
        toast("تم الحفظ في التنزيلات")
    }

    class Bridge {
        @JavascriptInterface
        fun notify(kind: String, title: String, body: String, tag: String) = Notifier.school(app, title, body, "", tag, "")

        @JavascriptInterface
        fun cancelNotif(tag: String) = Notifier.cancel(app, tag)

        @JavascriptInterface
        fun isForeground(): Boolean = foreground

        /** صفحة تنتظر الفتح بعد الضغط على إشعار (مثل الإشعار المهم) */
        @JavascriptInterface
        fun pendingOpen(): String { val p = pendingOpen; pendingOpen = ""; return p }

        @JavascriptInterface
        fun notifyCall(name: String, photo: String, cid: String, g: String) = Notifier.call(app, name, photo, cid, g)

        @JavascriptInterface
        fun notifyMessage(tag: String, conv: String, isGroup: Boolean, sender: String, photo: String, text: String, ts: Long) =
            Notifier.message(app, tag, conv, isGroup, sender, photo, text, ts)

        @JavascriptInterface
        fun notifySchool(title: String, body: String, sub: String, tag: String, photo: String) =
            Notifier.school(app, title, body, sub, tag, photo)

        @JavascriptInterface
        fun requestNotifPermission() { activity?.runOnUiThread { activity?.askNotifPermission() } }

        @JavascriptInterface
        fun getOrigin(): String = prefs(app).getString("origin", "") ?: ""

        @JavascriptInterface
        fun showText(title: String, text: String) {
            activity?.runOnUiThread {
                val a = activity ?: return@runOnUiThread
                val tv = android.widget.TextView(a).apply {
                    this.text = text; textSize = 15f; setTextIsSelectable(true)
                    val p = (16 * resources.displayMetrics.density).toInt(); setPadding(p, p, p, 0)
                    layoutDirection = android.view.View.LAYOUT_DIRECTION_RTL
                }
                android.app.AlertDialog.Builder(a).setTitle(title).setView(android.widget.ScrollView(a).apply { addView(tv) }).setPositiveButton("تمام", null).show()
            }
        }

        @JavascriptInterface
        fun openSettings() { activity?.runOnUiThread { activity?.showSettings(false) } }

        /** يحفظ هوية المستخدم ويشغّل خدمة الخلفية (أو يوقفها عند تسجيل الخروج) */
        @JavascriptInterface
        fun session(uid: String, role: String, grade: String, name: String, child: String) {
            val pr = prefs(app).edit()
            if (uid.isEmpty()) pr.remove("u_uid").remove("u_role").remove("u_grade").remove("u_name").remove("u_child")
            else pr.putString("u_uid", uid).putString("u_role", role).putString("u_grade", grade).putString("u_name", name).putString("u_child", child)
            pr.apply()
            try {
                if (uid.isNotEmpty()) {
                    val i = Intent(app, KeepAliveService::class.java)
                    if (Build.VERSION.SDK_INT >= 26) app.startForegroundService(i) else app.startService(i)
                } else { Sync.stop(); app.stopService(Intent(app, KeepAliveService::class.java)) }
            } catch (_: Throwable) {}
        }

        @JavascriptInterface
        fun setBase(url: String) { if (url.startsWith("http")) prefs(app).edit().putString("base", url).apply() }

        /** هل مزامنة الخلفية الأصلية شغالة؟ إذا نعم الصفحة ما ترسل إشعارات حتى ما تتكرر */
        @JavascriptInterface
        fun nativeSync(): Boolean = Sync.healthy()

        /** اسم الجهاز الحقيقي (الموديل + الاسم اللي حطه المستخدم للجهاز) */
        @JavascriptInterface
        fun deviceInfo(): String {
            val model = (Build.MANUFACTURER.replaceFirstChar { it.uppercase() } + " " + Build.MODEL).trim()
            val user = try { android.provider.Settings.Global.getString(app.contentResolver, "device_name") } catch (_: Throwable) { null }
            val name = if (!user.isNullOrBlank() && !model.contains(user, true)) "$model ($user)" else model
            return JSONObject().put("name", name).put("model", Build.MODEL).put("brand", Build.MANUFACTURER).put("os", Build.VERSION.RELEASE).toString()
        }

        /** معرّف ثابت للجهاز (يبقى نفسه بعد تحديث التطبيق) حتى يتعرف عليه الخادم */
        @JavascriptInterface
        fun deviceToken(): String {
            val id = android.provider.Settings.Secure.getString(app.contentResolver, "android_id") ?: Build.FINGERPRINT
            val d = java.security.MessageDigest.getInstance("SHA-256").digest(("$id|alfarabi|v1").toByteArray())
            return d.joinToString("") { "%02x".format(it) }.substring(0, 32)
        }

        @JavascriptInterface
        fun setBars(dark: Boolean) { activity?.runOnUiThread { activity?.applyBars(dark) } ?: prefs(app).edit().putBoolean("dark", dark).apply() }

        @JavascriptInterface
        fun bioState(): String = JSONObject().put("available", Bio.available(app)).put("enabled", prefs(app).getBoolean("bio", false) && Bio.available(app)).toString()

        @JavascriptInterface
        fun setBio(on: Boolean) { activity?.runOnUiThread { activity?.setBioLock(on) } }

        /** ===== تحديث الواجهة عن بعد ===== */
        @JavascriptInterface fun otaVersion(): Long = Ota.version(app)
        @JavascriptInterface fun otaBad(): Long = Ota.bad(app)
        @JavascriptInterface fun otaOk() { Ota.ok(app) }
        @JavascriptInterface fun otaBegin() { Ota.begin(app) }
        @JavascriptInterface fun otaChunk(b64: String): Boolean = try { Ota.chunk(app, Base64.decode(b64, Base64.DEFAULT)) } catch (_: Throwable) { false }
        @JavascriptInterface fun otaCommit(v: Long): Boolean = Ota.commit(app, v)
        @JavascriptInterface fun appVersion(): String = try { app.packageManager.getPackageInfo(app.packageName, 0).versionName ?: "" } catch (_: Throwable) { "" }
        @JavascriptInterface fun otaReload() { web?.post { web?.reload() } }


        /** مشاركة نص أو رابط عبر نافذة المشاركة */
        @JavascriptInterface
        fun shareText(text: String) {
            try {
                val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
                app.startActivity(Intent.createChooser(i, "مشاركة").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            } catch (_: Throwable) {}
        }

        /** حفظ ملف (base64) في مجلد التنزيلات */
        @JavascriptInterface
        fun saveFile(name: String, mime: String, b64: String): Boolean = try {
            saveData("data:" + mime + ";base64," + b64, name.replace(Regex("[\\\\/:*?\"<>|]"), "_").ifEmpty { "file" }); true
        } catch (_: Throwable) { toast("تعذّر الحفظ"); false }

        /** مشاركة ملف (base64) مع أي تطبيق */
        @JavascriptInterface
        fun shareFile(name: String, mime: String, b64: String): Boolean = try {
            val dir = java.io.File(app.cacheDir, "share"); dir.mkdirs()
            dir.listFiles()?.forEach { try { it.delete() } catch (_: Throwable) {} }
            val safe = name.replace(Regex("[\\\\/:*?\"<>|]"), "_").ifEmpty { "file" }
            val f = java.io.File(dir, safe)
            f.writeBytes(Base64.decode(b64, Base64.DEFAULT))
            val uri = FileProvider.getUriForFile(app, app.packageName + ".fp", f)
            val i = Intent(Intent.ACTION_SEND).setType(mime.ifEmpty { "application/octet-stream" })
                .putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            app.startActivity(Intent.createChooser(i, "مشاركة").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION))
            true
        } catch (_: Throwable) { toast("تعذّرت المشاركة"); false }

        /** وسيط لطلبات الصفحة لخادم المدرسة (رفع الصور والإشعارات) */
        @JavascriptInterface
        fun httpFetch(id: Int, url: String, method: String, hdrJson: String, b64: String) {
            Thread {
                var status = 0; var ct = ""; var out = ""
                try {
                    val c = URL(url).openConnection() as HttpURLConnection
                    c.connectTimeout = 20000; c.readTimeout = 60000
                    c.requestMethod = method.uppercase()
                    val h = try { JSONObject(hdrJson) } catch (_: Throwable) { JSONObject() }
                    h.keys().forEach { k -> c.setRequestProperty(k, h.optString(k)) }
                    if (b64.isNotEmpty() && method.uppercase() != "GET") {
                        c.doOutput = true
                        c.outputStream.use { it.write(Base64.decode(b64, Base64.DEFAULT)) }
                    }
                    status = c.responseCode
                    ct = c.contentType ?: ""
                    val s = if (status >= 400) c.errorStream else c.inputStream
                    out = if (s != null) Base64.encodeToString(s.use { it.readBytes() }, Base64.NO_WRAP) else ""
                } catch (_: Throwable) { status = 0 }
                val js = "window.__afHttp($id,$status,${JSONObject.quote(ct)},'$out')"
                web?.post { web?.evaluateJavascript(js, null) }
            }.start()
        }
    }
}
