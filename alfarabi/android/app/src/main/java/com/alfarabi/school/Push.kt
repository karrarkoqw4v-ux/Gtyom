package com.alfarabi.school

import android.content.Context
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/** إشعارات فورية عبر FCM حتى والتطبيق مغلق. الرسائل من نوع data فقط حتى يعرضها التطبيق بنفس تصميمه. */
class PushService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        getSharedPreferences("af", Context.MODE_PRIVATE).edit().putString("fcm_token", token).apply()
    }

    override fun onMessageReceived(m: RemoteMessage) {
        val d = m.data; val c = applicationContext
        fun g(k: String) = d[k] ?: ""
        try {
            when (g("k")) {
                // رسالة محادثة: من الجروب (اسم المرسل وصورته ونص الرسالة) أو من محادثة خاصة (باسم الشخص)
                "chat" -> {
                    val sn = g("sn").ifEmpty { "رسالة جديدة" }
                    val grp = g("gp") == "1"
                    val conv = if (grp) g("cv").ifEmpty { "المجموعة" } else sn
                    val tag = "chat:" + g("tag")
                    Notifier.message(c, tag, conv, grp, sn, PushPhoto.get(c, g("su")), g("b"), g("ts").toLongOrNull() ?: System.currentTimeMillis())
                }
                // تحضير: عنوان التحضير + وصفه + اسم المدرس وصورته
                "plan" -> Notifier.school(c, g("t").ifEmpty { "تحضير جديد" }, g("b"),
                    "تحضير" + (if (g("sn").isNotEmpty()) " • الأستاذ " + g("sn").removePrefix("الأستاذ ").removePrefix("أ. ") else "") + (if (g("sb").isNotEmpty()) " • " + g("sb") else ""),
                    "plan:" + g("tag"), PushPhoto.get(c, g("su")))
                // إعلان المدرسة: باسم المدرسة + عنوان الإعلان + وصفه
                "ann" -> Notifier.school(c, g("sc").ifEmpty { "ثانوية الفارابي" }, (g("t") + if (g("b").isNotEmpty()) "\n" + g("b") else ""), "إعلان من المدرسة", "ann:" + g("tag"), "")
                // درجة امتحان: اسم الطالب بالعنوان + المادة والدرجة والنسبة
                "grade" -> Notifier.school(c, g("sn").ifEmpty { "درجة امتحانك" },
                    "درجة امتحانك في " + g("sb") + ": " + g("v") + (if (g("p").isNotEmpty()) " (" + g("p") + "%)" else ""),
                    "نتيجة امتحان" + (if (g("ex").isNotEmpty()) " • " + g("ex") else ""), "grade:" + g("tag"), "")
                else -> {
                    val title = d["title"] ?: m.notification?.title ?: return
                    Notifier.school(c, title, d["body"] ?: m.notification?.body ?: "", d["sub"] ?: "", d["tag"] ?: "", d["photo"] ?: "")
                }
            }
        } catch (_: Throwable) {}
    }

    companion object {
        /** يرجع آخر توكن محفوظ، ويطلب تحديثه بالخلفية إن لم يوجد */
        fun token(c: Context): String {
            val p = c.getSharedPreferences("af", Context.MODE_PRIVATE)
            try {
                FirebaseMessaging.getInstance().token.addOnSuccessListener { t ->
                    if (!t.isNullOrEmpty()) p.edit().putString("fcm_token", t).apply()
                }
            } catch (_: Throwable) {}
            return p.getString("fcm_token", "") ?: ""
        }
    }
}

/** صورة صاحب الحساب من قاعدة المدرسة مع تخزين محلي حتى تصل الإشعارات التالية فوراً */
object PushPhoto {
    fun get(c: android.content.Context, uid: String): String {
        if (uid.isEmpty()) return ""
        val key = uid.replace(Regex("[.#$\\[\\]/]"), "_")
        val f = java.io.File(c.cacheDir, "ph_" + key.hashCode())
        try { if (f.exists() && System.currentTimeMillis() - f.lastModified() < 6 * 3600_000L) return f.readText() } catch (_: Throwable) {}
        return try {
            val base = ChatRepo.base(c) ?: return if (f.exists()) f.readText() else ""
            val u = java.net.URL("$base/accounts/$key/photo.json")
            val con = u.openConnection() as java.net.HttpURLConnection
            con.connectTimeout = 3000; con.readTimeout = 3000
            val txt = con.inputStream.bufferedReader().use { it.readText() }.trim()
            val photo = if (txt.startsWith("\"")) org.json.JSONObject("{\"p\":" + txt + "}").optString("p") else ""
            if (photo.isNotEmpty() && photo.length < 350000) { f.writeText(photo); photo } else ""
        } catch (_: Throwable) { try { if (f.exists()) f.readText() else "" } catch (_: Throwable) { "" } }
    }
}
