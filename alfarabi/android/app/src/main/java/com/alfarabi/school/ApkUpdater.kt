package com.alfarabi.school

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * تحديث التطبيق نفسه (APK) تلقائياً: يقرأ ملف الإصدار الأخير من المستودع (alfarabi/dist/latest.json)،
 * وإذا كان أحدث من المثبّت يعرض نافذة «تحديث جديد»، يحمّله مع شريط تقدّم ويتحقق من البصمة (SHA-256) ثم يفتح التثبيت.
 * (أندرويد يشترط ضغطة المستخدم على «تثبيت»؛ لا يمكن التثبيت الصامت.)
 */
object ApkUpdater {
    private const val MANIFEST = "https://raw.githubusercontent.com/karrarkoqw4v-ux/Gtyom/claude/hala-yweuvu/alfarabi/dist/latest.json"

    data class Info(val code: Long, val name: String, val url: String, val sha: String, val size: Long)

    fun currentCode(c: Context): Long = try {
        val i = c.packageManager.getPackageInfo(c.packageName, 0)
        if (Build.VERSION.SDK_INT >= 28) i.longVersionCode else @Suppress("DEPRECATION") i.versionCode.toLong()
    } catch (_: Throwable) { 0L }

    fun fetch(): Info? = try {
        val c = URL(MANIFEST + "?t=" + System.currentTimeMillis()).openConnection() as HttpURLConnection
        c.connectTimeout = 8000; c.readTimeout = 10000; c.useCaches = false
        if (c.responseCode != 200) null else {
            val o = JSONObject(c.inputStream.bufferedReader().use { it.readText() })
            Info(o.optLong("versionCode"), o.optString("versionName"), o.optString("url"), o.optString("sha256").lowercase(), o.optLong("size"))
        }
    } catch (_: Throwable) { null }

    fun apkFile(c: Context) = File(c.cacheDir, "update.apk")

    /** تحميل مع تقدّم؛ يرجّع الملف بعد التحقق من البصمة أو null عند الفشل */
    fun download(c: Context, info: Info, onProgress: (Int) -> Unit): File? = try {
        val f = apkFile(c); f.delete()
        val con = URL(info.url).openConnection() as HttpURLConnection
        con.connectTimeout = 10000; con.readTimeout = 20000; con.instanceFollowRedirects = true
        if (con.responseCode != 200) null else {
            val total = if (con.contentLengthLong > 0) con.contentLengthLong else info.size
            val md = MessageDigest.getInstance("SHA-256")
            var got = 0L; var last = -1
            con.inputStream.use { ins ->
                FileOutputStream(f).use { out ->
                    val buf = ByteArray(64 * 1024)
                    while (true) {
                        val n = ins.read(buf); if (n < 0) break
                        out.write(buf, 0, n); md.update(buf, 0, n); got += n
                        if (total > 0) { val p = (got * 100 / total).toInt().coerceIn(0, 100); if (p != last) { last = p; onProgress(p) } }
                    }
                }
            }
            val sha = md.digest().joinToString("") { "%02x".format(it) }
            if (info.sha.isNotEmpty() && sha != info.sha) { f.delete(); null } else f
        }
    } catch (_: Throwable) { null }

    /** يفتح مثبّت النظام. false إذا يحتاج المستخدم يسمح «بتثبيت التطبيقات» لهذا التطبيق أولاً */
    fun install(a: Activity, f: File): Boolean {
        if (Build.VERSION.SDK_INT >= 26 && !a.packageManager.canRequestPackageInstalls()) {
            try { a.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + a.packageName))) } catch (_: Throwable) {}
            return false
        }
        val u = FileProvider.getUriForFile(a, a.packageName + ".fp", f)
        val i = Intent(Intent.ACTION_VIEW).setDataAndType(u, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        a.startActivity(i)
        return true
    }
}
