package com.alfarabi.school

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/** خدمة أمامية تبقي التطبيق (والصفحة) شغّالين بالخلفية حتى تنزل الإشعارات والمكالمات. */
class KeepAliveService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            Sync.stop()
            if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE) else @Suppress("DEPRECATION") stopForeground(true)
            stopSelf()
            return START_NOT_STICKY
        }
        val n = Notifier.keepAlive(this)
        try {
            if (Build.VERSION.SDK_INT >= 34) startForeground(Notifier.ID_KEEP, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            else startForeground(Notifier.ID_KEEP, n)
        } catch (_: Throwable) { stopSelf(); return START_NOT_STICKY }
        Sync.start(this)
        return START_STICKY
    }

    override fun onDestroy() { super.onDestroy() }

    companion object { const val ACTION_STOP = "stop" }
}
