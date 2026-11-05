package com.alfarabi.school

import android.app.RemoteInput
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import org.json.JSONObject

/** رد سريع من الإشعار: نرسل الرسالة داخل الصفحة فتتزامن مع الخادم مثل أي رسالة. */
class ReplyReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        val tag = i.getStringExtra("tag") ?: return
        val text = RemoteInput.getResultsFromIntent(i)?.getCharSequence("reply")?.toString()?.trim().orEmpty()
        if (text.isEmpty()) return
        val g = tag.removePrefix("chat:")
        val web = WebHolder.web
        if (web == null) {
            Toast.makeText(c, "افتح التطبيق أولاً لإرسال الرد", Toast.LENGTH_LONG).show()
            return
        }
        val js = "window.afSendReply&&afSendReply(${JSONObject.quote(g)},${JSONObject.quote(text)})"
        Handler(Looper.getMainLooper()).post { web.evaluateJavascript(js, null) }
        Notifier.addSelfReply(c, tag, text)
    }
}

/** كتم الشخص 8 ساعات */
class MuteReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        val name = i.getStringExtra("name") ?: return
        Notifier.mute(c, name)
        Notifier.cancel(c, i.getStringExtra("tag") ?: "")
        Toast.makeText(c, "تم كتم $name لمدة 8 ساعات", Toast.LENGTH_SHORT).show()
    }
}

/** رفض المكالمة من الإشعار */
class DeclineReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        Notifier.cancel(c, "call")
        val g = i.getStringExtra("g") ?: return
        val cid = i.getStringExtra("cid") ?: return
        val js = "window.afDeclineCall&&afDeclineCall(${JSONObject.quote(g)},${JSONObject.quote(cid)})"
        Handler(Looper.getMainLooper()).post { WebHolder.web?.evaluateJavascript(js, null) }
    }
}
