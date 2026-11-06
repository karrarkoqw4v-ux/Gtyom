package com.alfarabi.school

import android.content.Context
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.zip.ZipInputStream

/**
 * تحديث ملفات الواجهة عن بعد (بدون تثبيت APK جديد).
 * - الملفات تصل مُوقَّعة ومتحقَّقاً منها في الصفحة، وهنا تُفكّ بأمان داخل مجلد خاص بالتطبيق.
 * - إذا لم تُفتح النسخة الجديدة بنجاح (otaOk) يرجع التطبيق تلقائياً للملفات الأصلية.
 */
object Ota {
    private val ALLOWED = setOf("html", "js", "css", "json", "svg", "png", "jpg", "jpeg", "webp", "woff2", "ttf", "ico", "txt", "mp3", "ogg")
    private const val MAX_TOTAL = 80L * 1024 * 1024
    private const val MAX_FILES = 800

    private fun dir(c: Context) = File(c.filesDir, "ota")
    private fun tmpZip(c: Context) = File(c.cacheDir, "ota_upload.zip")
    private fun baseCode(c: Context): Long = try {
        val i = c.packageManager.getPackageInfo(c.packageName, 0)
        if (android.os.Build.VERSION.SDK_INT >= 28) i.longVersionCode else @Suppress("DEPRECATION") i.versionCode.toLong()
    } catch (_: Throwable) { 0L }

    private fun p(c: Context) = WebHolder.prefs(c)

    /** إذا بقيت نسخة جديدة غير مؤكَّدة من التشغيل السابق أو الـAPK نفسه تغيّر نرجع للأصل */
    @Volatile private var started = false
    fun startup(c: Context) {
        if (started) return; started = true
        try {
            val pr = p(c)
            val v = pr.getLong("ota_v", 0)
            if (v <= 0) return
            if (pr.getLong("ota_base", 0) != baseCode(c)) { clear(c, false); return }
            if (pr.getBoolean("ota_pending", false)) { clear(c, true); return }
            pr.edit().putBoolean("ota_pending", true).apply() // يُلغى عند otaOk
        } catch (_: Throwable) { clear(c, false) }
    }

    fun clear(c: Context, bad: Boolean) {
        try {
            val pr = p(c); val v = pr.getLong("ota_v", 0)
            dir(c).deleteRecursively()
            val e = pr.edit().putLong("ota_v", 0).putBoolean("ota_pending", false)
            if (bad && v > 0) e.putLong("ota_bad", v)
            e.apply()
        } catch (_: Throwable) {}
    }

    fun version(c: Context): Long = try { if (dir(c).isDirectory) p(c).getLong("ota_v", 0) else 0 } catch (_: Throwable) { 0 }
    fun bad(c: Context): Long = p(c).getLong("ota_bad", 0)
    fun ok(c: Context) { p(c).edit().putBoolean("ota_pending", false).apply() }

    /** يفتح ملفاً من النسخة المحدَّثة إن وُجد */
    fun open(c: Context, path: String): InputStream? {
        return try {
            if (version(c) <= 0) return null
            val root = dir(c).canonicalFile
            val f = File(root, path).canonicalFile
            if (!f.path.startsWith(root.path + File.separator) || !f.isFile) null else f.inputStream()
        } catch (_: Throwable) { null }
    }

    fun begin(c: Context) { try { tmpZip(c).delete() } catch (_: Throwable) {} }
    fun chunk(c: Context, bytes: ByteArray): Boolean = try {
        val f = tmpZip(c)
        if (f.length() + bytes.size > MAX_TOTAL) false else { FileOutputStream(f, true).use { it.write(bytes) }; true }
    } catch (_: Throwable) { false }

    /** يفكّ الـZIP إلى مجلد مؤقت بعد التحقق من المسارات والأنواع، ثم يستبدل النسخة الحالية */
    fun commit(c: Context, v: Long): Boolean {
        val zip = tmpZip(c)
        val tmp = File(c.filesDir, "ota_new")
        return try {
            tmp.deleteRecursively(); tmp.mkdirs()
            val root = tmp.canonicalFile
            var total = 0L; var n = 0; var hasIndex = false
            ZipInputStream(zip.inputStream().buffered()).use { z ->
                var e = z.nextEntry
                while (e != null) {
                    if (!e.isDirectory) {
                        val name = e.name.replace('\\', '/').trimStart('/')
                        val ext = name.substringAfterLast('.', "").lowercase()
                        if (name.contains("..") || ext !in ALLOWED) throw SecurityException("bad entry")
                        if (++n > MAX_FILES) throw SecurityException("too many")
                        val out = File(root, name).canonicalFile
                        if (!out.path.startsWith(root.path + File.separator)) throw SecurityException("path")
                        out.parentFile?.mkdirs()
                        FileOutputStream(out).use { o ->
                            val buf = ByteArray(32768); var r: Int
                            while (z.read(buf).also { r = it } > 0) { total += r; if (total > MAX_TOTAL) throw SecurityException("size"); o.write(buf, 0, r) }
                        }
                        if (name == "index.html") hasIndex = true
                    }
                    z.closeEntry(); e = z.nextEntry
                }
            }
            if (!hasIndex) throw SecurityException("no index")
            dir(c).deleteRecursively()
            if (!tmp.renameTo(dir(c))) throw SecurityException("rename")
            p(c).edit().putLong("ota_v", v).putLong("ota_base", baseCode(c)).putBoolean("ota_pending", true).apply()
            true
        } catch (_: Throwable) {
            tmp.deleteRecursively(); false
        } finally { try { zip.delete() } catch (_: Throwable) {} }
    }
}
