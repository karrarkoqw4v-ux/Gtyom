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
        g.startsWith("dsup_") -> g == "dsup_" + u.uid || u.role == "admin"
        g.startsWith("d") -> g.substring(1).split("~").contains(u.uid)
        u.role == "admin" -> false
        u.role == "parent" -> g == "p"
        else -> g == (u.grade.ifEmpty { "2" })
    }

    // ---------- الحلقة الرئيسية ----------
    private fun loop(c: Context, my: Int) {
        var tick = 0
        while (alive(my)) {
            val u = user(c)
            val base = if (u != null) baseUrl(c) else null
            if (u == null || base == null) { sleep(5_000); continue }
            try {
                if (tick % 10 == 0) ensureStreams(c, base, u, my)
                if (tick % 3 == 1) pollRecords(c, base, u)
                if (tick % 2 == 0 && u.role != "admin") pollSchool(c, base, u)
            } catch (_: Throwable) {}
            tick++
            sleep(6_000)
        }
    }

    private fun ensureStreams(c: Context, base: String, u: U, my: Int) {
        val keys = HashSet<String>()
        if (u.role != "admin") keys.add("g" + (if (u.role == "parent") "p" else u.grade.ifEmpty { "2" }))
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
                "g", "a", "ev" -> {
                    val target = if (u.role == "parent") u.child else if (u.role == "student") u.name else ""
                    if (target.isNotEmpty() && same(target, r.optString("n"))) {
                        if (r.optString("k") == "ev") {
                            val lv = mapOf(5 to "ممتاز", 4 to "جيد جداً", 3 to "جيد", 2 to "متوسط", 1 to "ضعيف")[r.optInt("lv")] ?: ""
                            Notifier.school(c, r.optString("n", "طالب"), "تقييم جديد" + (if (r.optString("s", "").isNotEmpty()) " في " + r.optString("s") else "") + (if (lv.isNotEmpty()) ": $lv" else "") + (if (r.optString("by", "").isNotEmpty()) " — الأستاذ " + r.optString("by") else "") + (r.optString("nt", "").let { if (it.isNotEmpty()) " · $it" else "" }), "تقييم المدرس", "rec:$k", "")
                        } else if (r.optString("k") == "g")
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

    // ---------- الإعلانات والتحاضير والجدول والعطل (جديد + معدّل) ----------
    private fun items(txt: String?): List<JSONObject> {
        if (txt == null || txt.trim() == "null") return emptyList()
        return try {
            val out = ArrayList<JSONObject>()
            val t = txt.trim()
            if (t.startsWith("[")) { val a = org.json.JSONArray(t); for (i in 0 until a.length()) a.optJSONObject(i)?.let { out.add(it) } }
            else { val o = JSONObject(t); val ks = o.keys().asSequence().toList().sortedBy { it.toIntOrNull() ?: Int.MAX_VALUE }; for (k in ks) o.optJSONObject(k)?.let { out.add(it) } }
            out
        } catch (_: Throwable) { emptyList() }
    }

    /** يرجع الصيغة "المعرّف:بصمة المحتوى" حتى نكتشف الجديد والمعدّل */
    private class Fresh(val sig: String, val fire: () -> Unit)
    private fun sig(prefix: String, id: String, o: JSONObject) = "$prefix:$id:${o.toString().hashCode()}"

    private fun pollSchool(c: Context, base: String, u: U) {
        val pr = p(c)
        val seenSet = pr.getStringSet("sc_seen2", null)
        val first = seenSet == null
        val seen = HashSet(seenSet ?: emptySet())
        val fresh = ArrayList<Fresh>()
        fun mark(sg: String) { val pre = sg.substringBeforeLast(':') + ":"; seen.removeAll { it.startsWith(pre) }; seen.add(sg) }
        val myGrade = u.grade.ifEmpty { "" }

        // الإعلانات: العنوان دائماً «إشعار» + نص الإعلان
        val annTxt = get(base, "/school/info/announcements.json")
        items(annTxt).forEach { a ->
            val id = a.opt("id")?.toString() ?: a.opt("createdAt")?.toString() ?: a.optString("title")
            val sg = sig("ann", id, a)
            val tg = a.opt("target")?.toString() ?: ""
            val forMe = tg == "all" || tg == myGrade || (tg == "student" && same(a.optString("student"), u.name)) || (u.role == "parent" && tg == "student" && same(a.optString("student"), u.child))
            if (!forMe) { mark(sg); return@forEach }
            if (seen.contains(sg)) return@forEach
            val edited = seen.any { it.startsWith("ann:$id:") }
            val title = a.optString("title", "")
            val desc = a.optString("desc", "")
            val body = (if (edited) "✏️ تم تعديل الإشعار\n" else "") + (if (title.isNotEmpty() && desc.isNotEmpty()) "$title — $desc" else title + desc)
            fresh.add(Fresh(sg) { Notifier.school(c, "إشعار", body, "الإدارة • ثانوية الفارابي", "ann:$id", "") })
        }

        // تحاضير الدروس: العنوان + الوصف + اسم المدرس
        if (u.role != "teacher" && u.role != "admin") {
            items(get(base, "/school/info/lessonPlans.json")).forEach { it ->
                val id = it.opt("id")?.toString() ?: it.optString("title")
                val sg = sig("plan", id, it)
                val gr = it.opt("grade")?.toString() ?: ""
                if (!(u.role == "parent" || gr == myGrade)) { mark(sg); return@forEach }
                if (seen.contains(sg)) return@forEach
                val teacher = it.optString("teacher", "")
                val subj = it.optString("subject", it.optString("subj", ""))
                val sub = "تحضير" + (if (teacher.isNotEmpty()) " • " + (if (Regex("^(ال)?[أا]ستاذ|^أ\\.|^م\\.").containsMatchIn(teacher)) "" else "الأستاذ ") + teacher else "") + (if (subj.isNotEmpty()) " • $subj" else "") + (GN[gr]?.let { g -> " • $g" } ?: "")
                val body = it.optString("title", "تحضير جديد") + (it.optString("description", "").let { d -> if (d.isNotEmpty()) "\n$d" else "" })
                val edited = seen.any { x -> x.startsWith("plan:$id:") }
                fresh.add(Fresh(sg) { Notifier.school(c, if (edited) "تحضير معدّل" else "تحضير جديد", body, sub, "plan:$id", "") })
            }
        }

        // الجدول الأسبوعي لكل صف
        get(base, "/school/schedule.json")?.let { txt ->
            try {
                if (txt.trim() != "null") {
                    val o = JSONObject(txt)
                    o.keys().forEach { gk ->
                        val sch = o.optJSONObject(gk) ?: return@forEach
                        val sg = sig("sch", gk, sch)
                        val relevant = u.role == "teacher" || (u.role == "parent" && myGrade.isEmpty()) || gk == myGrade
                        if (!relevant) { mark(sg); return@forEach }
                        if (seen.contains(sg)) return@forEach
                        val cls = sch.optString("cls", GN[gk] ?: "الصف")
                        fresh.add(Fresh(sg) { Notifier.school(c, "الجدول المدرسي", "تم نشر/تحديث جدول $cls الأسبوعي", "جدول الحصص", "sch:$gk", "") })
                    }
                }
            } catch (_: Throwable) {}
        }

        // العطل والدوام (حدث)
        get(base, "/school/info/schoolDays.json")?.let { txt ->
            try {
                if (txt.trim() != "null") {
                    val o = JSONObject(txt)
                    o.keys().forEach { day ->
                        val d = o.optJSONObject(day) ?: return@forEach
                        val sg = sig("day", day, d)
                        if (seen.contains(sg)) return@forEach
                        val hol = d.optString("status") == "holiday"
                        val note = d.optString("note", "")
                        fresh.add(Fresh(sg) { Notifier.school(c, if (hol) "عطلة" else "دوام", "يوم $day: " + (if (hol) "عطلة" else "دوام رسمي") + (if (note.isNotEmpty()) " — $note" else ""), "الدوام المدرسي", "day:$day", "") })
                    }
                }
            } catch (_: Throwable) {}
        }

        for (f in fresh) { mark(f.sig); if (!first && !WebHolder.foreground) try { f.fire() } catch (_: Throwable) {} }
        // نبقي آخر المفاتيح فقط (كل عنصر له أحدث بصمة)
        pr.edit().putStringSet("sc_seen2", seen.toList().toSet()).apply()
    }
}
