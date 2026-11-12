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
        val d = m.data
        val title = d["title"] ?: m.notification?.title ?: return
        val body = d["body"] ?: m.notification?.body ?: ""
        val tag = d["tag"] ?: ""
        try { Notifier.school(applicationContext, title, body, d["sub"] ?: "", tag, d["photo"] ?: "") } catch (_: Throwable) {}
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
