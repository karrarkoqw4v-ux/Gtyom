package com.alfarabi.school

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** رسالة محادثة (نفس بنية الويب في قاعدة المدرسة: chat/g<الصف>/m<id>) */
data class Msg(val id: Long, val uid: String, val name: String, val role: String, val ts: Long, val text: String, val hasImg: Boolean = false, val sending: Boolean = false)

/** طبقة الشبكة الأصلية للمحادثات (REST على Firebase Realtime Database) */
object ChatRepo {
    private val CANDS = listOf(
        "https://shhb-1ae9e-default-rtdb.firebaseio.com",
        "https://shhb-1ae9e-default-rtdb.europe-west1.firebasedatabase.app",
        "https://shhb-1ae9e-default-rtdb.asia-southeast1.firebasedatabase.app"
    )

    class Me(val uid: String, val role: String, val grade: String, val name: String)

    fun me(c: Context): Me? {
        val p = WebHolder.prefs(c); val uid = p.getString("u_uid", "") ?: ""
        if (uid.isEmpty()) return null
        return Me(uid, p.getString("u_role", "") ?: "", p.getString("u_grade", "") ?: "", p.getString("u_name", "") ?: "")
    }

    fun roomOf(m: Me) = if (m.role == "parent") "p" else "g" + m.grade.ifEmpty { "2" }
    fun key(s: String) = s.replace(Regex("[.#$\\[\\]/]"), "_")

    private fun call(url: String, method: String, body: String? = null): String? = try {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 8000; c.readTimeout = 12000; c.requestMethod = method
        if (body != null) { c.doOutput = true; c.setRequestProperty("Content-Type", "application/json"); c.outputStream.use { it.write(body.toByteArray()) } }
        if (c.responseCode in 200..299) c.inputStream.bufferedReader().use { it.readText() } else null
    } catch (_: Throwable) { null }

    fun base(c: Context): String? {
        val p = WebHolder.prefs(c)
        p.getString("base", "")?.takeIf { it.startsWith("http") }?.let { return it }
        for (b in CANDS) if (call("$b/school.json?shallow=true", "GET") != null) { p.edit().putString("base", b).apply(); return b }
        return null
    }

    fun load(base: String, room: String, limit: Int = 60): List<Msg>? {
        val txt = call("$base/chat/$room.json?orderBy=%22%24key%22&limitToLast=$limit", "GET") ?: return null
        val o = try { JSONObject(txt) } catch (_: Throwable) { return emptyList() }
        val out = ArrayList<Msg>()
        for (k in o.keys()) {
            val m = o.optJSONObject(k) ?: continue
            if (m.has("c") || m.optLong("ts", 0) == 0L) continue   // مكالمات وأحداث
            out.add(Msg(m.optLong("id"), m.optString("u"), m.optString("n"), m.optString("r"), m.optLong("ts"), m.optString("t"), m.has("img") || m.has("vid")))
        }
        return out.sortedBy { it.ts }
    }

    fun send(base: String, room: String, me: Me, text: String): Msg? {
        val ts = System.currentTimeMillis()
        val j = JSONObject().put("id", ts).put("u", me.uid).put("n", me.name).put("r", me.role).put("ts", ts).put("t", text)
        val ok = call("$base/chat/$room/m${key(ts.toString())}.json", "PUT", j.toString()) != null
        return if (ok) Msg(ts, me.uid, me.name, me.role, ts, text) else null
    }
}
