package com.alfarabi.school

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/** بعد إعادة تشغيل الجهاز: نعيد تشغيل خدمة الإشعارات إذا كان فيه مستخدم مسجّل دخوله */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        try {
            val uid = WebHolder.prefs(c).getString("u_uid", "") ?: ""
            if (uid.isEmpty()) return
            val svc = Intent(c, KeepAliveService::class.java)
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(svc) else c.startService(svc)
        } catch (_: Throwable) {}
    }
}
