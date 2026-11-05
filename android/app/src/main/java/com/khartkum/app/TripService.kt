package com.khartkum.app

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager

/** خدمة أمامية تبقي التطبيق شغّال وتتابع الموقع أثناء الرحلة حتى لو انطفت الشاشة. */
class TripService : Service() {
    private var wake: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            release()
            if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE) else @Suppress("DEPRECATION") stopForeground(true)
            stopSelf()
            return START_NOT_STICKY
        }
        val n = Notif.trip(
            this,
            intent?.getStringExtra("title") ?: "الرحلة",
            intent?.getStringExtra("text") ?: "",
            intent?.getStringExtra("big") ?: "",
            intent?.getIntExtra("progress", 0) ?: 0
        )
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(Notif.ID_TRIP, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
            else startForeground(Notif.ID_TRIP, n)
        } catch (_: Throwable) { stopSelf(); return START_NOT_STICKY }
        if (wake == null) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "khartkum:trip").apply { acquire(6 * 60 * 60 * 1000L) }
        }
        return START_NOT_STICKY
    }

    private fun release() { try { wake?.takeIf { it.isHeld }?.release() } catch (_: Throwable) {}; wake = null }
    override fun onDestroy() { release(); super.onDestroy() }

    companion object { const val ACTION_STOP = "stop" }
}
