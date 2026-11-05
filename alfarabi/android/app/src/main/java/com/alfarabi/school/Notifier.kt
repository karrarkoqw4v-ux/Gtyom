package com.alfarabi.school

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Person
import android.app.RemoteInput
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.drawable.Icon
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.util.Base64
import java.net.HttpURLConnection
import java.net.URL

/** إشعارات بأسلوب واتساب: مكالمات باسم وصورة المتصل، رسائل تتجمع بكل محادثة مع رد وكتم، وتنبيهات المدرسة. */
object Notifier {
    const val CH_MSG = "af_msg"
    const val CH_CALL = "af_call"
    const val CH_SCHOOL = "af_school"
    const val CH_KEEP = "af_keep"
    const val ID_KEEP = 7
    const val ID_SUMMARY = 9
    const val ID_CALL = 8
    const val GROUP = "af_chats"
    private const val MUTE_MS = 8L * 60 * 60 * 1000

    private class Msg(val sender: String, val text: String, val ts: Long, val self: Boolean, val photo: Bitmap?)
    private val history = HashMap<String, ArrayList<Msg>>()
    private val meta = HashMap<String, Pair<String, Boolean>>()
    private val avatars = HashMap<String, Bitmap>()
    private var logo: Bitmap? = null

    private fun nm(c: Context) = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private fun builder(c: Context, ch: String): Notification.Builder =
        if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, ch) else @Suppress("DEPRECATION") Notification.Builder(c)

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

    // ---------- صور ----------
    private fun circle(src: Bitmap, size: Int): Bitmap {
        val s = minOf(src.width, src.height)
        val sq = Bitmap.createBitmap(src, (src.width - s) / 2, (src.height - s) / 2, s, s)
        val sc = Bitmap.createScaledBitmap(sq, size, size, true)
        val out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val cv = Canvas(out)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        cv.drawCircle(size / 2f, size / 2f, size / 2f, p)
        p.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
        cv.drawBitmap(sc, 0f, 0f, p)
        return out
    }

    private fun letterAvatar(name: String): Bitmap {
        val size = 160
        val out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val cv = Canvas(out)
        val hue = (((name.trim().firstOrNull()?.code ?: 63) * 47) % 360).toFloat()
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.HSVToColor(floatArrayOf(hue, 0.55f, 0.55f)) }
        cv.drawCircle(size / 2f, size / 2f, size / 2f, p)
        p.color = Color.WHITE; p.textSize = 84f; p.textAlign = Paint.Align.CENTER
        cv.drawText((name.trim().firstOrNull() ?: '?').toString(), size / 2f, size / 2f + 29f, p)
        return out
    }

    /** صورة الشخص: من data: أو رابط، وإذا ما في نرسم حرفه الأول بلون مثل الواجهة */
    private fun avatar(photo: String, name: String): Bitmap {
        if (photo.isNotEmpty()) {
            val key = photo.hashCode().toString()
            avatars[key]?.let { return it }
            try {
                val bytes: ByteArray? = when {
                    photo.startsWith("data:") -> Base64.decode(photo.substringAfter(','), Base64.DEFAULT)
                    photo.startsWith("http") -> {
                        val c = URL(photo).openConnection() as HttpURLConnection
                        c.connectTimeout = 4000; c.readTimeout = 4000
                        c.inputStream.use { it.readBytes() }
                    }
                    else -> null
                }
                val src = bytes?.let { BitmapFactory.decodeByteArray(it, 0, it.size) }
                if (src != null) { val b = circle(src, 160); avatars[key] = b; return b }
            } catch (_: Throwable) {}
        }
        return letterAvatar(name)
    }

    private fun logoBitmap(c: Context): Bitmap? {
        logo?.let { return it }
        return try { c.assets.open("logo.jpg").use { BitmapFactory.decodeStream(it) }?.let { circle(it, 160) }.also { logo = it } } catch (_: Throwable) { null }
    }

    // ---------- أدوات ----------
    private fun openApp(c: Context, kind: String, tag: String): PendingIntent {
        val i = Intent(c, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            .putExtra("kind", kind).putExtra("tag", tag)
        return PendingIntent.getActivity(c, (kind + tag).hashCode(), i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    private fun broadcast(c: Context, cls: Class<*>, req: Int, mutable: Boolean, fill: Intent.() -> Unit): PendingIntent {
        val i = Intent(c, cls).apply(fill)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (mutable && Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else PendingIntent.FLAG_IMMUTABLE)
        return PendingIntent.getBroadcast(c, req, i, flags)
    }

    private fun enabled(c: Context) = Build.VERSION.SDK_INT < 24 || nm(c).areNotificationsEnabled()
    private fun idOf(s: String) = s.hashCode() and 0x7fffffff

    fun isMuted(c: Context, name: String): Boolean =
        WebHolder.prefs(c).getLong("mute_$name", 0L) > System.currentTimeMillis()

    fun mute(c: Context, name: String) {
        WebHolder.prefs(c).edit().putLong("mute_$name", System.currentTimeMillis() + MUTE_MS).apply()
    }

    // ---------- المكالمات ----------
    fun call(c: Context, name: String, photo: String, cid: String, g: String) {
        init(c)
        if (!enabled(c)) return
        val av = avatar(photo, name)
        val open = openApp(c, "call", "call")
        val decline = broadcast(c, DeclineReceiver::class.java, 5, false) { putExtra("cid", cid); putExtra("g", g) }
        val b = builder(c, CH_CALL)
            .setSmallIcon(R.drawable.ic_stat_school)
            .setLargeIcon(av)
            .setContentTitle(name)
            .setContentText("مكالمة صوتية واردة")
            .setSubText("ثانوية الفارابي")
            .setColor(0xFF12A47B.toInt())
            .setCategory(Notification.CATEGORY_CALL)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(open)
            .setFullScreenIntent(open, true)
            .setTimeoutAfter(45_000)
        var styled = false
        if (Build.VERSION.SDK_INT >= 31) {
            try {
                val person = Person.Builder().setName(name).setIcon(Icon.createWithBitmap(av)).setImportant(true).build()
                b.setStyle(Notification.CallStyle.forIncomingCall(person, decline, open))
                styled = true
            } catch (_: Throwable) {}
        }
        if (!styled) {
            b.addAction(0, "رد", open).addAction(0, "رفض", decline)
            if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_MAX)
                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)).setVibrate(longArrayOf(0, 800, 500, 800))
        }
        val n = try { b.build() } catch (_: Throwable) {
            builder(c, CH_CALL).setSmallIcon(R.drawable.ic_stat_school).setLargeIcon(av).setContentTitle(name)
                .setContentText("مكالمة صوتية واردة").setContentIntent(open).setFullScreenIntent(open, true).build()
        }
        n.flags = n.flags or Notification.FLAG_INSISTENT // يكرر الرنين لين يرد أو ينتهي
        try { nm(c).notify(ID_CALL, n) } catch (_: Throwable) {}
    }

    // ---------- الرسائل (تتجمع بكل محادثة مثل واتساب) ----------
    fun message(c: Context, tag: String, conv: String, isGroup: Boolean, sender: String, photo: String, text: String, ts: Long) {
        init(c)
        if (!enabled(c) || isMuted(c, sender)) return
        val av = avatar(photo, sender)
        val list = history.getOrPut(tag) { ArrayList() }
        list.add(Msg(sender, text, ts, false, av))
        while (list.size > 8) list.removeAt(0)
        meta[tag] = Pair(conv, isGroup)
        post(c, tag)
    }

    fun addSelfReply(c: Context, tag: String, text: String) {
        val list = history.getOrPut(tag) { ArrayList() }
        list.add(Msg("أنا", text, System.currentTimeMillis(), true, null))
        while (list.size > 8) list.removeAt(0)
        post(c, tag, quiet = true)
    }

    private fun post(c: Context, tag: String, quiet: Boolean = false) {
        val list = history[tag] ?: return
        val (conv, isGroup) = meta[tag] ?: Pair("", false)
        val last = list.lastOrNull { !it.self } ?: list.last()
        val open = openApp(c, "msg", tag)
        val b = builder(c, CH_MSG)
            .setSmallIcon(R.drawable.ic_stat_school)
            .setLargeIcon(last.photo)
            .setColor(0xFF0AA6F5.toInt())
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_MESSAGE)
            .setContentIntent(open)
            .setGroup(GROUP)
            .setShowWhen(true)
            .setWhen(list.last().ts)
        if (quiet) b.setOnlyAlertOnce(true)
        if (Build.VERSION.SDK_INT >= 28) {
            val me = Person.Builder().setName("أنا").build()
            val st = Notification.MessagingStyle(me)
            if (isGroup) st.setConversationTitle(conv).setGroupConversation(true)
            list.forEach {
                val p = if (it.self) null else Person.Builder().setName(it.sender).setIcon(it.photo?.let { bm -> Icon.createWithBitmap(bm) }).build()
                st.addMessage(Notification.MessagingStyle.Message(it.text, it.ts, p))
            }
            b.setStyle(st)
        } else {
            @Suppress("DEPRECATION") val st = Notification.MessagingStyle("أنا")
            if (isGroup) st.setConversationTitle(conv)
            list.forEach { @Suppress("DEPRECATION") st.addMessage(it.text, it.ts, if (it.self) null else it.sender) }
            b.setStyle(st)
        }
        if (tag.startsWith("chat:") && Build.VERSION.SDK_INT >= 24) {
            val ri = RemoteInput.Builder("reply").setLabel("اكتب ردّك").build()
            val replyPi = broadcast(c, ReplyReceiver::class.java, idOf("r$tag"), true) { putExtra("tag", tag) }
            b.addAction(Notification.Action.Builder(Icon.createWithResource(c, R.drawable.ic_stat_school), "رد", replyPi).addRemoteInput(ri).setAllowGeneratedReplies(true).build())
        }
        val mutePi = broadcast(c, MuteReceiver::class.java, idOf("m$tag"), false) { putExtra("name", last.sender); putExtra("tag", tag) }
        b.addAction(0, "كتم " + last.sender, mutePi)
        try { nm(c).notify(idOf("m$tag"), b.build()) } catch (_: Throwable) {}
        // ملخص يجمع المحادثات تحت بعض
        try {
            val s = builder(c, CH_MSG).setSmallIcon(R.drawable.ic_stat_school).setColor(0xFF0AA6F5.toInt())
                .setContentTitle("ثانوية الفارابي").setGroup(GROUP).setGroupSummary(true).setAutoCancel(true)
                .setContentIntent(openApp(c, "msg", "")).setLargeIcon(logoBitmap(c))
            if (Build.VERSION.SDK_INT >= 26) s.setGroupAlertBehavior(Notification.GROUP_ALERT_CHILDREN)
            nm(c).notify(ID_SUMMARY, s.build())
        } catch (_: Throwable) {}
    }

    // ---------- تنبيهات المدرسة: إعلان، تحضير، درجة، غياب ----------
    fun school(c: Context, title: String, body: String, sub: String, tag: String, photo: String) {
        init(c)
        if (!enabled(c)) return
        val b = builder(c, CH_SCHOOL)
            .setSmallIcon(R.drawable.ic_stat_school)
            .setLargeIcon(if (photo.isNotEmpty()) avatar(photo, title) else logoBitmap(c))
            .setContentTitle(title)
            .setContentText(body)
            .setSubText(sub)
            .setStyle(Notification.BigTextStyle().bigText(body))
            .setColor(0xFF0AA6F5.toInt())
            .setAutoCancel(true)
            .setShowWhen(true)
            .setCategory(Notification.CATEGORY_EVENT)
            .setContentIntent(openApp(c, "school", tag))
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_DEFAULT).setDefaults(Notification.DEFAULT_ALL)
        try { nm(c).notify(if (tag.isEmpty()) (System.nanoTime() and 0x7fffffff).toInt() else idOf("s$tag"), b.build()) } catch (_: Throwable) {}
    }

    fun cancel(c: Context, tag: String) {
        try {
            val m = nm(c)
            if (tag == "call") m.cancel(ID_CALL)
            else { m.cancel(idOf("m$tag")); m.cancel(idOf("s$tag")) }
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
