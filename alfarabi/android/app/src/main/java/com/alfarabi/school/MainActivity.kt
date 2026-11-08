package com.alfarabi.school

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.provider.Settings
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Switch
import android.widget.TextView

class MainActivity : Activity() {
    private lateinit var root: FrameLayout
    private var cover: View? = null
    private var locking = false
    private var leftAt = 0L
    private var unlocked = false
    private var firstRun = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Notifier.init(this)
        WebHolder.activity = this
        root = FrameLayout(this)
        setContentView(root)
        val web = WebHolder.obtain(application, this)
        (web.parent as? ViewGroup)?.removeView(web)
        root.addView(web, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        applyBars(WebHolder.prefs(this).getBoolean("dark", false))
        onIntent(intent)
        firstRun = !WebHolder.prefs(this).getBoolean("setup", false)
        if (firstRun) { WebHolder.prefs(this).edit().putBoolean("setup", true).apply(); askNotifPermission(true) }
    }

    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent); onIntent(intent) }

    private fun onIntent(i: Intent?) {
        val tg = i?.getStringExtra("tag") ?: ""
        if (i?.getStringExtra("kind") == "school" && tg.startsWith("imp:")) WebHolder.pendingOpen = tg
        if (tg.startsWith("chan:")) WebHolder.pendingLink = "ch=" + tg.removePrefix("chan:")
        val d = i?.data
        if (d != null && (d.scheme == "alfarabi" || d.host == "karrarkoqw4v-ux.github.io")) {
            val c = d.getQueryParameter("c") ?: ""
            val ch = d.getQueryParameter("ch")
            val slug = if (c.isNotEmpty()) c else (d.pathSegments?.lastOrNull() ?: "")
            if (c.isNotEmpty()) WebHolder.pendingLink = "c=" + c
            else if (!ch.isNullOrEmpty()) WebHolder.pendingLink = "ch=" + ch
            else if (d.scheme == "alfarabi" && slug.isNotEmpty()) WebHolder.pendingLink = "c=" + slug
        }
        if (i?.getStringExtra("kind") == "call") {
            if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true) }
        }
    }

    override fun onStart() {
        super.onStart()
        WebHolder.activity = this
        val bioOn = WebHolder.prefs(this).getBoolean("bio", false) && Bio.available(this)
        if (!bioOn) { hideCover(); return }
        if (!unlocked || SystemClock.elapsedRealtime() - leftAt > 30_000) { unlocked = false; lock() }
    }

    override fun onStop() { super.onStop(); leftAt = SystemClock.elapsedRealtime() }
    override fun onResume() { super.onResume(); WebHolder.foreground = true; Notifier.cancel(this, "call") }
    override fun onPause() { WebHolder.foreground = false; super.onPause() }

    // ===== لون الشريطين (أعلى وأسفل الجهاز) نفس لون التطبيق =====
    fun applyBars(dark: Boolean) {
        WebHolder.prefs(this).edit().putBoolean("dark", dark).apply()
        val c = if (dark) 0xFF08101D.toInt() else 0xFFFFFFFF.toInt()
        window.statusBarColor = c
        window.navigationBarColor = c
        var f = window.decorView.systemUiVisibility
        f = if (dark) f and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv() else f or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        if (Build.VERSION.SDK_INT >= 26) f = if (dark) f and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv() else f or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        window.decorView.systemUiVisibility = f
        root.setBackgroundColor(c)
        WebHolder.web?.setBackgroundColor(c)
    }

    // ===== قفل البصمة =====
    private fun lock() {
        showCover()
        if (locking) return
        locking = true
        // ننتظر شوية حتى تكمل الشاشة ظهورها، وإلا النظام يلغي نافذة البصمة
        root.postDelayed({
            if (isFinishing) { locking = false; return@postDelayed }
            Bio.prompt(this, onOk = { locking = false; unlocked = true; hideCover() }, onFail = { locking = false })
        }, 350)
    }

    /** تفعيل أو إيقاف القفل: نتأكد أن البصمة تشتغل قبل ما نفعّله حتى ما ينقفل التطبيق على أحد */
    fun setBioLock(on: Boolean) {
        val p = WebHolder.prefs(this)
        if (!on) { p.edit().putBoolean("bio", false).apply(); return }
        if (!Bio.available(this)) { jsBio(false, "البصمة غير متوفرة بالجهاز"); return }
        Bio.prompt(this, onOk = { p.edit().putBoolean("bio", true).apply(); unlocked = true; jsBio(true, "تم تفعيل القفل بالبصمة") },
            onFail = { m -> jsBio(false, if (m == "cancel") "انلغى التحقق" else "ما تم التحقق: $m") })
    }

    private fun jsBio(ok: Boolean, msg: String) {
        runOnUiThread { WebHolder.web?.evaluateJavascript("window.__afBio&&__afBio($ok,${org.json.JSONObject.quote(msg)})", null) }
    }

    private fun showCover() {
        if (cover != null) return
        val c = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#F4F8FF")); isClickable = true
            val t = TextView(this@MainActivity).apply { text = "ثانوية الفارابي"; textSize = 22f; setTextColor(Color.parseColor("#14213D")); gravity = Gravity.CENTER }
            val b = Button(this@MainActivity).apply { text = "فتح بالبصمة"; setOnClickListener { lock() } }
            addView(t); addView(b)
        }
        cover = c
        root.addView(c, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }

    private fun hideCover() { cover?.let { root.removeView(it) }; cover = null }

    // ===== الإعدادات (5 ضغطات بأعلى الشاشة، أو أول تشغيل) =====
    fun showSettings(first: Boolean) {
        val p = WebHolder.prefs(this)
        val pad = (16 * resources.displayMetrics.density).toInt()
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(pad, pad, pad, 0); layoutDirection = View.LAYOUT_DIRECTION_RTL }
        col.addView(TextView(this).apply { text = "رابط موقع المدرسة (لرفع الصور والإشعارات). اتركه فارغاً إذا ما عندك رابط."; textSize = 13f })
        val et = EditText(this).apply {
            setText(p.getString("origin", "")); hint = "https://school.example.com"
            inputType = InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT; textDirection = View.TEXT_DIRECTION_LTR; setSingleLine()
        }
        col.addView(et)
        val bioOk = Bio.available(this)
        val sw = Switch(this).apply {
            text = if (bioOk) "قفل التطبيق بالبصمة" else "قفل البصمة (غير متوفر أو ما مسجّلة بصمة بالجهاز)"
            isChecked = p.getBoolean("bio", false) && bioOk; isEnabled = bioOk
            setPadding(0, pad, 0, pad)
        }
        col.addView(sw)
        col.addView(Button(this).apply {
            text = "السماح للتطبيق بالعمل بالخلفية"
            setOnClickListener { try { startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)) } catch (_: Exception) {} }
        })
        col.addView(TextView(this).apply { text = "\nأدوات البيانات"; textSize = 13f })
        col.addView(Button(this).apply {
            text = "فحص المزامنة مع الخادم"
            setOnClickListener { WebHolder.web?.evaluateJavascript("window.afReport&&afReport()", null) }
        })
        col.addView(Button(this).apply {
            text = "سحب البيانات من الخادم"
            setOnClickListener { WebHolder.web?.evaluateJavascript("window.afPull&&afPull()", null) }
        })
        col.addView(Button(this).apply {
            text = "رفع بيانات هذا الجهاز للخادم (استعادة)"
            setOnClickListener {
                AlertDialog.Builder(this@MainActivity).setTitle("تأكيد الرفع")
                    .setMessage("هذا يستبدل بيانات المدرسة بالخادم ببيانات هذا الجهاز. استخدمه فقط من الجهاز اللي بياناته صحيحة وكاملة، وبعد ما تسوي فحص المزامنة.")
                    .setPositiveButton("ارفع") { _, _ -> WebHolder.web?.evaluateJavascript("window.afPush&&afPush()", null) }
                    .setNegativeButton("إلغاء", null).show()
            }
        })
        col.addView(Button(this).apply {
            text = "إعدادات الإشعارات"
            setOnClickListener {
                try { startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName)) } catch (_: Exception) {}
            }
        })
        AlertDialog.Builder(this)
            .setTitle(if (first) "إعداد التطبيق" else "إعدادات التطبيق")
            .setView(android.widget.ScrollView(this).apply { addView(col) })
            .setPositiveButton("حفظ") { _, _ ->
                val o = et.text.toString().trim().trimEnd('/')
                val changed = o != p.getString("origin", "")
                p.edit().putString("origin", o).putBoolean("bio", sw.isChecked).apply()
                if (sw.isChecked) { unlocked = true }
                if (changed) WebHolder.web?.reload()
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }

    // ===== الصلاحيات =====
    fun askNotifPermission(thenSettings: Boolean = false) {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), WebHolder.REQ_NOTIF)
        } else if (thenSettings && firstRun) { firstRun = false; showSettings(true) }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            WebHolder.REQ_MEDIA -> {
                val r = WebHolder.permReq; WebHolder.permReq = null
                if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) r?.grant(r.resources) else r?.deny()
            }
            WebHolder.REQ_NOTIF -> if (firstRun) { firstRun = false; showSettings(true) }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == WebHolder.REQ_FILE) {
            val cb = WebHolder.fileCb; WebHolder.fileCb = null
            cb?.onReceiveValue(if (resultCode == RESULT_OK) WebChromeClient.FileChooserParams.parseResult(resultCode, data) else null)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val w = WebHolder.web
        if (w != null && w.canGoBack()) w.goBack() else moveTaskToBack(true) // ما نقفل التطبيق حتى يبقى يستقبل الإشعارات
    }

    override fun onDestroy() {
        WebHolder.detach()
        // إذا ما في تسجيل دخول (الخدمة غير شغّالة) نحرر الصفحة لتوفير الذاكرة
        super.onDestroy()
    }
}
