package com.khartkum.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator

/** إشعار الرحلة الجارية، وإشعار الوصول مع الرنين والاهتزاز. */
object Notif {
    const val CH_TRIP = "trip"
    const val CH_ARRIVE = "arrive"
    const val ID_TRIP = 41
    const val ID_ARRIVE = 42
    const val ACTION_END_TRIP = "com.khartkum.app.END_TRIP"
    private var ringtone: Ringtone? = null
    private val handler = Handler(Looper.getMainLooper())

    private fun nm(c: Context) = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun channels(c: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val m = nm(c)
        m.createNotificationChannel(NotificationChannel(CH_TRIP, "الرحلة الجارية", NotificationManager.IMPORTANCE_LOW).apply {
            setShowBadge(false); description = "تفاصيل رحلتك: المسافة والوقت ووقت الوصول"
        })
        m.createNotificationChannel(NotificationChannel(CH_ARRIVE, "الوصول للوجهة", NotificationManager.IMPORTANCE_HIGH).apply {
            enableVibration(true); setSound(null, null); description = "تنبيه عند الوصول"
        })
    }

    private fun openIntent(c: Context, action: String?, req: Int): PendingIntent {
        val i = Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        if (action != null) i.action = action
        return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    fun trip(c: Context, title: String, text: String, big: String, progress: Int): Notification {
        channels(c)
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, CH_TRIP) else @Suppress("DEPRECATION") Notification.Builder(c)
        return b.setSmallIcon(R.drawable.ic_stat_nav)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(Notification.BigTextStyle().bigText(big))
            .setProgress(1000, progress.coerceIn(0, 1000), false)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setColor(0xFF1D6FE0.toInt())
            .setCategory(Notification.CATEGORY_NAVIGATION)
            .setContentIntent(openIntent(c, null, 0))
            .addAction(0, "إنهاء الرحلة", openIntent(c, ACTION_END_TRIP, 1))
            .build()
    }

    fun update(c: Context, title: String, text: String, big: String, progress: Int) {
        try { nm(c).notify(ID_TRIP, trip(c, title, text, big, progress)) } catch (_: Throwable) {}
    }

    fun cancelTrip(c: Context) { try { nm(c).cancel(ID_TRIP) } catch (_: Throwable) {} }

    fun arrive(c: Context, dest: String) {
        channels(c)
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, CH_ARRIVE) else @Suppress("DEPRECATION") Notification.Builder(c)
        val n = b.setSmallIcon(R.drawable.ic_stat_nav)
            .setContentTitle("وصلت إلى وجهتك")
            .setContentText(dest)
            .setColor(0xFF12A47B.toInt())
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_ALARM)
            .setContentIntent(openIntent(c, null, 2))
            .build()
        try { nm(c).notify(ID_ARRIVE, n) } catch (_: Throwable) {}
        ring(c)
    }

    /** رنين وإهتزاز قوي لمدة قصيرة حتى ينتبه السائق. */
    private fun ring(c: Context) {
        try {
            stopRing()
            val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM) ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val r = RingtoneManager.getRingtone(c, uri)
            if (Build.VERSION.SDK_INT >= 28) {
                r.audioAttributes = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            } else @Suppress("DEPRECATION") r.streamType = android.media.AudioManager.STREAM_ALARM
            r.play(); ringtone = r
            handler.postDelayed({ stopRing() }, 8000)
        } catch (_: Throwable) {}
        try {
            @Suppress("DEPRECATION") val v = c.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            v.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 700, 350, 700, 350, 700, 350, 700), -1))
        } catch (_: Throwable) {}
    }

    fun stopRing() { try { ringtone?.stop() } catch (_: Throwable) {}; ringtone = null }
}
