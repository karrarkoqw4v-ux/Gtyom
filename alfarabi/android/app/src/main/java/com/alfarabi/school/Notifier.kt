package com.alfarabi.school

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build

/** إشعارات التطبيق: رسائل وقنوات، مكالمات واردة برنين، وإعلانات المدرسة. كلها باسم التطبيق وصورته. */
object Notifier {
    const val CH_MSG = "af_msg"
    const val CH_CALL = "af_call"
    const val CH_SCHOOL = "af_school"
    const val CH_KEEP = "af_keep"
    const val ID_KEEP = 7
    private var logo: Bitmap? = null

    private fun nm(c: Context) = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun init(c: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val m = nm(c)
        m.createNotificationChannel(NotificationChannel(CH_MSG, "الرسائل والمجموعات", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "رسائل المحادثات والمجموعات وقنوات المدرسين"; enableVibration(true); lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        })
        m.createNotificationChannel(NotificationChannel(CH_CALL, "المكالمات الواردة", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "مكالمات صوتية واردة"
            enableVibration(true); vibrationPattern = longArrayOf(0, 800, 500, 800, 500, 800)
            setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE),
                AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            )
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        })
        m.createNotificationChannel(NotificationChannel(CH_SCHOOL, "إعلانات المدرسة", NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = "الإعلانات والتحاضير والدرجات والغيابات"
        })
        m.createNotificationChannel(NotificationChannel(CH_KEEP, "حالة التطبيق", NotificationManager.IMPORTANCE_MIN).apply {
            description = "يبقي التطبيق متصلاً لاستقبال الإشعارات"; setShowBadge(false)
        })
    }

    /** شعار المدرسة دائري كصورة كبيرة بالإشعار */
    private fun logoBitmap(c: Context): Bitmap? {
        logo?.let { return it }
        return try {
            val src = c.assets.open("logo.jpg").use { BitmapFactory.decodeStream(it) } ?: return null
            val s = minOf(src.width, src.height)
            val out = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888)
            val cv = Canvas(out)
            val p = Paint(Paint.ANTI_ALIAS_FLAG)
            cv.drawCircle(s / 2f, s / 2f, s / 2f, p)
            p.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
            cv.drawBitmap(src, (s - src.width) / 2f, (s - src.height) / 2f, p)
            logo = out
            out
        } catch (_: Throwable) { null }
    }

    private fun openApp(c: Context, kind: String, tag: String): PendingIntent {
        val i = Intent(c, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            .putExtra("kind", kind).putExtra("tag", tag)
        return PendingIntent.getActivity(c, (kind + tag).hashCode(), i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    private fun builder(c: Context, ch: String): Notification.Builder =
        if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, ch) else @Suppress("DEPRECATION") Notification.Builder(c)

    fun show(c: Context, kind: String, title: String, body: String, tag: String) {
        init(c)
        val m = nm(c)
        if (Build.VERSION.SDK_INT >= 24 && !m.areNotificationsEnabled()) return
        val ch = when (kind) { "call" -> CH_CALL; "msg" -> CH_MSG; else -> CH_SCHOOL }
        val pi = openApp(c, kind, tag)
        val b = builder(c, ch)
            .setSmallIcon(R.drawable.ic_stat_school)
            .setLargeIcon(logoBitmap(c))
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(Notification.BigTextStyle().bigText(body))
            .setColor(0xFF0AA6F5.toInt())
            .setAutoCancel(true)
            .setShowWhen(true)
            .setWhen(System.currentTimeMillis())
            .setContentIntent(pi)
        if (kind == "call") {
            b.setCategory(Notification.CATEGORY_CALL)
                .setOngoing(true)
                .setAutoCancel(false)
                .setFullScreenIntent(pi, true)
                .setTimeoutAfter(45_000)
                .addAction(0, "فتح المكالمة", pi)
            if (Build.VERSION.SDK_INT < 26) {
                b.setPriority(Notification.PRIORITY_MAX)
                    .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))
                    .setVibrate(longArrayOf(0, 800, 500, 800))
            }
        } else {
            b.setCategory(if (kind == "msg") Notification.CATEGORY_MESSAGE else Notification.CATEGORY_EVENT)
            if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_HIGH).setDefaults(Notification.DEFAULT_ALL)
        }
        val n = b.build()
        if (kind == "call") n.flags = n.flags or Notification.FLAG_INSISTENT // يكرر الرنين لين يرد أو ينتهي
        try { m.notify(idFor(kind, tag), n) } catch (_: Throwable) {}
    }

    private fun idFor(kind: String, tag: String) = if (tag.isEmpty()) (System.nanoTime() and 0x7fffffff).toInt() else (kind + tag).hashCode()

    fun cancel(c: Context, tag: String) {
        val m = nm(c)
        try {
            m.cancel(idFor("call", tag)); m.cancel(idFor("msg", tag)); m.cancel(idFor("school", tag))
        } catch (_: Throwable) {}
    }

    fun keepAlive(c: Context): Notification {
        init(c)
        return builder(c, CH_KEEP)
            .setSmallIcon(R.drawable.ic_stat_school)
            .setContentTitle("ثانوية الفارابي")
            .setContentText("متصل لاستقبال الرسائل والإشعارات")
            .setOngoing(true)
            .setShowWhen(false)
            .setContentIntent(openApp(c, "keep", ""))
            .build()
    }
}
