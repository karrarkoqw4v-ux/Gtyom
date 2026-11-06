package com.alfarabi.school

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * مزامنة بالخلفية بدون الاعتماد على الصفحة: تتابع قاعدة المدرسة مباشرة وتطلع الإشعارات حتى لو التطبيق مغلق.
 * - المحادثات والمكالمات: اتصال مباشر (SSE) لكل محادثة تخص المستخدم.
 * - الدرجات والغيابات ومنشورات القنوات: فحص كل ~25 ثانية.
 * - الإعلانات والتحاضير: فحص كل ~45 ثانية.
 */
object Sync {
    @Volatile private var gen = 0
    @Volatile var lastOk = 0L
    private val streams = HashMap<String, Int>()      // محادثة -> رقم الجيل اللي شغّلها
    private val photos = HashMap<String, String>()
    private val gnames = HashMap<String, String>()
    private val chans = HashMap<String, JSONObject?>()
    private val calls = HashMap<String, Boolean>()
    private val GN = mapOf("1" to "الأول متوسط", "2" to "الثاني متوسط", "3" to "الثالث متوسط", "4" to "الرابع العلمي", "5" to "الخامس العلمي")
    private val CANDS = listOf(
        "https://shhb-1ae9e-default-rtdb.firebaseio.com",
        "https://shhb-1ae9e-default-rtdb.europe-west1.firebasedatabase.app",
        "https://shhb-1ae9e-default-rtdb.asia-southeast1.firebasedatabase.app"
    )

    fun healthy() = System.currentTimeMillis() - lastOk < 90_000

    fun start(ctx: Context) {
        val app = ctx.applicationContext
        val my = ++gen
        synchronized(streams) { streams.clear() }
        Thread { loop(app, my) }.also { it.isDaemon = true }.start()
    }

    fun stop() { gen++; synchronized(streams) { streams.clear() } }

    private fun alive(my: Int) = my == gen
    private fun sleep(ms: Long) { try { Thread.sleep(ms) } catch (_: InterruptedException) {} }
    private fun p(c: Context) = WebHolder.prefs(c)

    private class U(val uid: String, val role: String, val grade: String, val name: String, val child: String)
    private fun user(c: Context): U? {
        val pr = p(c); val uid = pr.getString("u_uid", "") ?: ""
        if (uid.isEmpty()) return null
        return U(uid, pr.getString("u_role", "") ?: "", pr.getString("u_grade", "") ?: "", pr.getString("u_name", "") ?: "", pr.getString("u_child", "") ?: "")
    }

    // ---------- شبكة ----------
    private fun open(url: String, sse: Boolean): HttpURLConnection {
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 10_000
        c.readTimeout = if (sse) 100_000 else 15_000
        c.instanceFollowRedirects = true
        if (sse) c.setRequestProperty("Accept", "text/event-stream")
        return c
    }
    private fun get(base: String, path: String): String? = try {
        val c = open(base + path, false)
        if (c.responseCode == 200) c.inputStream.bufferedReader().use { it.readText() }.also { lastOk = System.currentTimeMillis() } else null
    } catch (_: Throwable) { null }

    private fun baseUrl(c: Context): String? {
        p(c).getString("base", "")?.takeIf { it.startsWith("http") }?.let { return it }
        for (b in CANDS) if (get(b, "/school.json?shallow=true") != null) { p(c).edit().putString("base", b).apply(); return b }
        return null
    }

    private fun okKey(s: String) = s.replace(Regex("[.#$\\[\\]/]"), "_")
    private fun nrm(s: String) = s.replace(Regex("[\\s\\u064B-\\u0652]"), "").replace(Regex("[أإآ]"), "ا").replace('ى', 'ي').replace('ة', 'ه')
    private fun same(a: String, b: String): Boolean { val x = nrm(a); val y = nrm(b); return x.length > 4 && y.length > 4 && (x == y || x.contains(y) || y.contains(x)) }

    private fun mine(g: String, u: U): Boolean = when {
        g.startsWith("dsup_") -> g == "dsup_" + u.uid
        g.startsWith("d") -> g.substring(1).split("~").contains(u.uid)
        u.role == "parent" -> g == "p"
        else -> g == (u.grade.ifEmpty { "2" })
    }

    // ---------- الحلقة الرئيسية ----------
    private fun loop(c: Context, my: Int) {
        var tick = 0
        while (alive(my)) {
            val u = user(c)
            val base = if (u != null && u.role != "admin") baseUrl(c) else null
            if (u == null || base == null) { sleep(5_000); continue }
            try {
                if (tick % 10 == 0) ensureStreams(c, base, u, my)
                if (tick % 4 == 1) pollRecords(c, base, u)
                if (tick % 7 == 3) pollSchool(c, base, u)
            } catch (_: Throwable) {}
            tick++
            sleep(6_000)
        }
    }

    private fun ensureStreams(c: Context, base: String, u: U, my: Int) {
        val keys = HashSet<String>()
        keys.add("g" + (if (u.role == "parent") "p" else u.grade.ifEmpty { "2" }))
        get(base, "/chat.json?shallow=true")?.let { txt ->
            try { val o = JSONObject(txt); o.keys().forEach { k -> if (k.startsWith("g") && mine(k.substring(1), u)) keys.add(k) } } catch (_: Throwable) {}
        }
        for (k in keys) {
            val started = synchronized(streams) { if (streams[k] == my) true else { streams[k] = my; false } }
            if (!started) Thread { stream(c, base, k, u, my) }.also { it.isDaemon = true }.start()
        }
    }

    // ---------- المحادثات والمكالمات (اتصال مباشر) ----------
    private fun stream(c: Context, base: String, key: String, u: U, my: Int) {
        val g = key.substring(1)
        while (alive(my)) {
            try {
                val conn = open("$base/chat/$key.json?orderBy=%22%24key%22&limitToLast=6", true)
                if (conn.responseCode != 200) { sleep(10_000); continue }
                val r = conn.inputStream.bufferedReader()
                var ev = ""
                while (alive(my)) {
                    val line = r.readLine() ?: break
                    lastOk = System.currentTimeMillis()
                    if (line.startsWith("event:")) ev = line.substring(6).trim()
                    else if (line.startsWith("data:") && (ev == "put" || ev == "patch")) {
                        try { onData(c, base, g, key, line.substring(5).trim(), u) } catch (_: Throwable) {}
                    }
                }
                conn.disconnect()
            } catch (_: Throwable) { sleep(5_000) }
            sleep(1_500)
        }
    }

    private fun onData(c: Context, base: String, g: String, key: String, raw: String, u: U) {
        val o = JSONObject(raw); val data = o.opt("data")
        val msgs = ArrayList<JSONObject>()
        fun add(x: Any?) { if (x is JSONObject) msgs.add(x) }
        if (data is JSONObject) {
            if (data.has("ts")) add(data) else data.keys().forEach { k -> add(data.opt(k)) }
        }
        if (msgs.isEmpty()) return
        msgs.sortBy { it.optLong("ts") }
        val pr = p(c); val tsKey = "ts_$key"
        var last = pr.getLong(tsKey, -1L)
        if (last == -1L) { // أول مرة: نعتبر الموجود مقروء
            pr.edit().putLong(tsKey, msgs.maxOf { it.optLong("ts") }).apply(); return
        }
        var mx = last
        for (m in msgs) {
            val ts = m.optLong("ts"); if (ts > mx) mx = ts
            val cv = m.optString("c", "")
            val cid = m.opt("cid")?.toString() ?: ""
            if (cv == "ca" || cv == "cd" || cv == "ce") { if (calls.remove(cid) != null) Notifier.cancel(c, "call"); continue }
            if (ts <= last || m.opt("u")?.toString() == u.uid) continue
            val age = System.currentTimeMillis() - ts
            if (cv == "cr") {
                if (age <= 45_000 && g.startsWith("d") && !g.startsWith("dsup_") && calls[cid] == null && !WebHolder.foreground) {
                    calls[cid] = true
                    val uid = m.opt("u")?.toString() ?: ""
                    Notifier.call(c, m.optString("n", "مكالمة"), photoOf(c, base, uid), cid, key.substring(1))
                }
                continue
            }
            if (cv.isNotEmpty() || age > 30 * 60_000 || WebHolder.foreground) continue
            val isGroup = !g.startsWith("d")
            val conv = if (isGroup) groupName(base, g) else m.optString("n", "")
            val uid = m.opt("u")?.toString() ?: ""
            Notifier.message(c, "chat:$g", conv, isGroup, m.optString("n", "رسالة"), photoOf(c, base, uid), preview(m), ts)
        }
        if (mx > last) pr.edit().putLong(tsKey, mx).apply()
    }

    private fun preview(m: JSONObject): String {
        val t = m.optString("t", ""); if (t.isNotEmpty()) return t
        return when {
            m.has("aud") -> "🎤 رسالة صوتية"; m.has("img") -> "📷 صورة"; m.has("vid") -> "🎬 فيديو"
            m.has("q") -> "📊 استطلاع"; m.has("f") -> "📎 ملف"; else -> "رسالة جديدة"
        }
    }

    private fun groupName(base: String, g: String): String {
        gnames[g]?.let { return it }
        val n = get(base, "/school/groups/${okKey(g)}/name.json")?.trim()?.trim('"')?.takeIf { it.isNotEmpty() && it != "null" }
        val name = n ?: if (g == "p") "أولياء الأمور" else GN[g] ?: "المجموعة"
        gnames[g] = name; return name
    }

    private fun photoOf(c: Context, base: String, uid: String): String {
        if (uid.isEmpty()) return ""
        photos[uid]?.let { return it }
        val t = get(base, "/accounts/a${okKey(uid)}/photo.json")?.trim() ?: ""
        val ph = if (t.length > 4 && t.startsWith("\"")) try { org.json.JSONTokener(t).nextValue() as? String ?: "" } catch (_: Throwable) { "" } else ""
        val out = if (ph.length in 1..350_000) ph else ""
        photos[uid] = out; return out
    }

    // ---------- الدرجات والغيابات ومنشورات القنوات ----------
    private fun pollRecords(c: Context, base: String, u: U) {
        val txt = get(base, "/records.json?orderBy=%22%24key%22&limitToLast=25") ?: return
        if (txt.trim() == "null") return
        val o = try { JSONObject(txt) } catch (_: Throwable) { return }
        val pr = p(c)
        val seen = HashSet(pr.getStringSet("rec_seen", null) ?: emptySet())
        val first = pr.getStringSet("rec_seen", null) == null
        val items = ArrayList<Pair<String, JSONObject>>()
        o.keys().forEach { k -> (o.opt(k) as? JSONObject)?.let { items.add(k to it) } }
        items.sortBy { it.second.optLong("ts") }
        for ((k, r) in items) {
            if (seen.contains(k)) continue
            seen.add(k)
            if (first || WebHolder.foreground || System.currentTimeMillis() - r.optLong("ts") > 24 * 3600_000L) continue
            when (r.optString("k")) {
                "g", "a" -> {
                    val target = if (u.role == "parent") u.child else if (u.role == "student") u.name else ""
                    if (target.isNotEmpty() && same(target, r.optString("n"))) {
                        if (r.optString("k") == "g")
                            Notifier.school(c, r.optString("n", "طالب"), r.optString("s", "المادة") + ": " + r.optString("v", "") + (r.optString("nt", "").let { if (it.isNotEmpty()) " · $it" else "" }), "نتيجة امتحان", "rec:$k", "")
                        else Notifier.school(c, r.optString("n", "طالب"), "غياب " + r.optString("d", ""), "غياب", "rec:$k", "")
                    }
                }
                "cp" -> channelPost(c, base, u, r, k)
                "imp" -> if (r.opt("uid")?.toString() != u.uid)
                    Notifier.important(c, r.optString("title", "إشعار مهم"), r.optString("body", ""), r.optString("from", "الإدارة"), "imp:$k", r.optString("img", ""))
            }
        }
        pr.edit().putStringSet("rec_seen", seen.toList().takeLast(400).toSet()).apply()
    }

    private fun channelPost(c: Context, base: String, u: U, r: JSONObject, k: String) {
        val chId = r.opt("ch")?.toString() ?: return
        val ch = chans.getOrPut(chId) { get(base, "/records/r${okKey(chId)}.json")?.let { try { JSONObject(it) } catch (_: Throwable) { null } } } ?: return
        val member = ch.optJSONObject("m")?.has("u" + okKey(u.uid)) == true
        val muted = ch.optJSONObject("mu")?.has("u" + okKey(u.uid)) == true
        if (!member || muted || ch.opt("o")?.toString() == u.uid) return
        val text = r.optString("t", "").ifEmpty { if (r.has("img")) "📷 صورة" else if (r.has("q")) "📊 استطلاع" else "منشور جديد" }
        Notifier.message(c, "chan:$chId", ch.optString("cn", "قناة"), true, ch.optString("on", "المدرس"), photoOf(c, base, ch.opt("o")?.toString() ?: ""), text, r.optLong("ts", System.currentTimeMillis()))
    }

    // ---------- الإعلانات والتحاضير ----------
    private fun pollSchool(c: Context, base: String, u: U) {
        val pr = p(c)
        for (name in listOf("announcements", "lessonPlans")) {
            val sh = get(base, "/school/info/$name.json?shallow=true") ?: continue
            val keys = try { if (sh.trim() == "null") emptyList() else JSONObject(sh).keys().asSequence().toList() } catch (_: Throwable) { continue }
            val key = "sc_$name"; val old = pr.getInt(key, -1)
            pr.edit().putInt(key, keys.size).apply()
            if (old == -1 || keys.size <= old || WebHolder.foreground) continue
            val sorted = keys.sortedBy { it.toIntOrNull() ?: Int.MAX_VALUE }
            for (k in sorted.takeLast(keys.size - old)) {
                val it = get(base, "/school/info/$name/$k.json")?.let { t -> try { JSONObject(t) } catch (_: Throwable) { null } } ?: continue
                if (name == "announcements") {
                    val tg = it.opt("target")?.toString() ?: ""
                    if (tg == "all" || tg == u.grade || (tg == "student" && it.optString("student") == u.name))
                        Notifier.school(c, it.optString("title", "إعلان جديد"), it.optString("desc", ""), "إعلان من الإدارة", "ann:$k", "")
                } else {
                    if (u.role != "teacher" && (u.role == "parent" || it.opt("grade")?.toString() == u.grade))
                        Notifier.school(c, it.optString("title", "تحضير جديد"), it.optString("description", ""),
                            "تحضير الدروس" + (it.optString("subj", "").let { s -> if (s.isNotEmpty()) " • $s" else "" }) + (GN[it.opt("grade")?.toString() ?: ""]?.let { g -> " • $g" } ?: ""), "plan:$k", "")
                }
            }
        }
    }
}
