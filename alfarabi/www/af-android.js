/* طبقة الربط بين واجهة المدرسة وتطبيق الأندرويد (تشتغل فقط داخل التطبيق) */
(function () {
  'use strict';
  var A = window.Android;
  if (!A) return;

  /* ===== 1) مقاس موحّد: نفس التصميم بنفس النسب على كل الأجهزة ===== */
  try {
    var vp = document.querySelector('meta[name=viewport]');
    var w = Math.min(screen.width, screen.height);
    if (vp) vp.setAttribute('content', w < 600 ? 'width=392,user-scalable=no,viewport-fit=cover' : 'width=device-width,initial-scale=1,viewport-fit=cover');
  } catch (e) {}

  var LS = window.localStorage;
  var CK = 'alfarabi_chat_v2', SS = 'alfarabi_sess_acc', SK = 'alfarabi_school_v1', RK = 'alfarabi_rec_v1', DBK = 'alfarabi_db_v1';
  function J(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }
  function okk(k) { return String(k).replace(/[.#$\[\]\/]/g, '_'); }
  function nrm(s) { return String(s || '').replace(/[\sً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه'); }
  function same(a, b) { a = nrm(a); b = nrm(b); return a.length > 4 && b.length > 4 && (a === b || a.indexOf(b) > -1 || b.indexOf(a) > -1); }
  function fg() { try { return !!A.isForeground(); } catch (e) { return false; } }
  function nativeOn() { try { return !!A.nativeSync(); } catch (e) { return false; } }
  var NA = {};
  ['notifyCall', 'notifyMessage', 'notifySchool'].forEach(function (n) { NA[n] = function () { if (nativeOn()) return; return A[n].apply(A, arguments); }; });

  /* ===== 2) إشعارات الصفحة القديمة (Notification): نلغيها لأن التطبيق يرسل إشعاراته بنفسه ===== */
  function N() { this.close = function () {}; }
  N.permission = 'granted';
  N.requestPermission = function (cb) {
    try { A.requestNotifPermission(); } catch (e) {}
    if (typeof cb === 'function') cb('granted');
    return Promise.resolve('granted');
  };
  window.Notification = N;
  function patchFrame(f) {
    try { f.contentWindow.Notification = N; } catch (e) {}
    try { f.addEventListener('load', function () { try { f.contentWindow.Notification = N; } catch (e) {} }); } catch (e) {}
  }
  function watchFrames() {
    document.querySelectorAll('iframe').forEach(patchFrame);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.tagName === 'IFRAME') patchFrame(n); else if (n.querySelectorAll) n.querySelectorAll('iframe').forEach(patchFrame); }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.documentElement) watchFrames(); else document.addEventListener('DOMContentLoaded', watchFrames);

  /* ===== 3) الاتصال بخادم المدرسة (الصور والإشعارات) عبر التطبيق ===== */
  var ORIGIN = '';
  try { ORIGIN = A.getOrigin() || ''; } catch (e) {}
  var rf = window.fetch ? window.fetch.bind(window) : null;
  var pend = {}, seq = 0;
  window.__afHttp = function (id, status, ct, b64) {
    var p = pend[id]; if (!p) return; delete pend[id];
    if (status <= 0) { p.rej(new TypeError('network error')); return; }
    var u = null;
    if (b64) { var bin = atob(b64); u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); }
    p.res(new Response(status === 204 || status === 304 ? null : u, { status: status, headers: { 'content-type': ct || 'application/octet-stream' } }));
  };
  function proxied(u) { return typeof u === 'string' && (u.indexOf('/push/') === 0 || u.indexOf('/media/') === 0 || u.indexOf('/version.json') === 0); }
  if (rf) {
    window.fetch = function (input, init) {
      var u = typeof input === 'string' ? input : (input && input.url) || '';
      try { if (u.indexOf(location.origin) === 0) u = u.slice(location.origin.length); } catch (e) {}
      if (!proxied(u)) return rf(input, init);
      if (!ORIGIN) return Promise.reject(new TypeError('school server not set'));
      var method = (init && init.method) || 'GET', body = init && init.body;
      var hdr = {}; try { var h = init && init.headers; if (h) { if (h.forEach && !Array.isArray(h) && typeof h.get === 'function') h.forEach(function (v, k) { hdr[k] = v; }); else Object.assign(hdr, h); } } catch (e) {}
      return new Promise(function (res, rej) {
        var id = ++seq; pend[id] = { res: res, rej: rej };
        var url = ORIGIN.replace(/\/$/, '') + u;
        function go(b64) { try { A.httpFetch(id, url, method, JSON.stringify(hdr), b64 || ''); } catch (e) { delete pend[id]; rej(e); } }
        if (body && typeof Blob !== 'undefined' && body instanceof Blob) {
          var fr = new FileReader(); fr.onload = function () { go(String(fr.result).split(',')[1]); }; fr.onerror = function () { rej(new TypeError('read')); }; fr.readAsDataURL(body);
        } else if (typeof body === 'string') go(btoa(unescape(encodeURIComponent(body))));
        else go('');
      });
    };
  }

  /* ===== 4) الحساب الحالي ===== */
  function me() {
    var s = LS.getItem('alfarabi_session'); if (!s) return null;
    var a = J(SS, null); if (!a || a.email !== s) { var db = J(DBK, { accounts: [] }); a = (db.accounts || []).find(function (x) { return x.email === s; }); }
    if (!a || a.kicked) return null;
    var raw = a.createdAt || a.name;
    return { uid: String(raw), raw: raw, role: a.role, grade: String(a.grade || ''), name: a.name || '', child: a.child || '' };
  }
  function accOf(uid) {
    var s = String(uid), list = (J(DBK, { accounts: [] }).accounts) || [];
    return list.find(function (a) { return String(a.createdAt || a.name) === s; });
  }
  function photoOf(uid) { var a = accOf(uid), p = a && a.photo; return p && String(p).length < 350000 ? String(p) : ''; }
  var lastUid = null, lastBase = '';
  setInterval(function () {
    var u = me(), id = u && u.role !== 'admin' ? u.uid : '';
    if (!id && !u) { var adm = ''; try { adm = LS.getItem('alfarabi_session'); } catch (e) {} if (adm === 'admin') { u = { uid: 'admin', role: 'admin', grade: '', name: 'الإدارة', child: '' }; id = 'admin'; } } /* الإدارة تستقبل إشعارات الدعم والإشعارات المهمة */
    var sig = id ? [id, u.role, u.grade, u.name, u.child].join('|') : '';
    if (sig !== lastUid) { lastUid = sig; try { A.session(id, id ? u.role : '', id ? u.grade : '', id ? u.name : '', id ? (u.child || '') : ''); } catch (e) {} }
    var b = window.FBBASE || (window.AFSyncInfo && window.AFSyncInfo().base) || '';
    if (b && b !== lastBase) { lastBase = b; try { A.setBase(b); } catch (e) {} }
  }, 3000);

  /* ===== 5) المحادثات والمكالمات (لحظياً عند وصول البيانات) ===== */
  var GN = { 1: 'الأول متوسط', 2: 'الثاني متوسط', 3: 'الثالث متوسط', 4: 'الرابع العلمي', 5: 'الخامس العلمي' };
  function mineKey(k, u) {
    if (k.indexOf('dsup_') === 0) return k === 'dsup_' + u.uid;
    if (k[0] === 'd') return k.slice(1).split('~').indexOf(u.uid) > -1;
    if (u.role === 'parent') return k === 'p';
    return k === (u.grade || '2');
  }
  function preview(m) { return m.t || (m.aud ? '🎤 رسالة صوتية' : m.img ? '📷 صورة' : m.vid ? '🎬 فيديو' : m.q ? '📊 استطلاع' : m.f ? '📎 ملف' : 'رسالة جديدة'); }
  var lastLen = -1, seenTs = {}, chatInit = false, callSeen = {};
  function chatTick() {
    if (nativeOn()) return; // المزامنة الأصلية شغالة: ما نحتاج نقرأ ونحلل البيانات هنا (يخفف التقطيع)
    var u = me(); if (!u || u.role === 'admin') return;
    var s = LS.getItem(CK) || ''; if (s.length === lastLen) return; lastLen = s.length;
    var d; try { d = JSON.parse(s) || {}; } catch (e) { return; }
    var groups = (J(SK, {}).groups) || {}, visible = fg();
    Object.keys(d).forEach(function (g) {
      if (!mineKey(g, u)) return;
      var arr = d[g] || [], last = seenTs[g] || 0, mx = last;
      // مكالمة واردة
      if (g[0] === 'd' && g.indexOf('dsup_') !== 0) {
        var cr = null; arr.forEach(function (x) { if (x && x.c === 'cr' && String(x.u) !== u.uid) cr = x; });
        if (cr) {
          var live = Date.now() - cr.ts <= 45000 && !arr.some(function (y) { return y && y.cid === cr.cid && (y.c === 'ca' || y.c === 'cd' || y.c === 'ce'); });
          if (live && !callSeen[cr.cid] && !visible) {
            callSeen[cr.cid] = 1;
            try { NA.notifyCall(cr.n || 'مكالمة', photoOf(cr.u), String(cr.cid), g); } catch (e) {}
            setTimeout(function () { try { A.cancelNotif('call'); } catch (e) {} }, 45000);
          } else if (!live && callSeen[cr.cid] === 1) { callSeen[cr.cid] = 2; try { A.cancelNotif('call'); } catch (e) {} }
        }
      }
      // رسائل جديدة
      arr.forEach(function (m) {
        if (!m || !m.ts) return;
        if (m.ts > mx) mx = m.ts;
        if (!chatInit || m.ts <= last || m.c || String(m.u) === u.uid || Date.now() - m.ts > 10 * 60e3 || visible) return;
        var isGroup = g[0] !== 'd';
        var conv = isGroup ? ((groups[g] && groups[g].name) || (g === 'p' ? 'أولياء الأمور' : GN[g] || 'المجموعة')) : (m.n || '');
        try { NA.notifyMessage('chat:' + g, conv, isGroup, m.n || 'رسالة', photoOf(m.u), preview(m), m.ts); } catch (e) {}
      });
      seenTs[g] = mx;
    });
    chatInit = true;
  }

  /* ===== 6) درجات وغيابات وقنوات المدرسين ===== */
  var recInit = false, recSeen = null;
  function recTick() {
    if (nativeOn()) return; // المزامنة الأصلية شغالة: ما نحتاج نقرأ ونحلل البيانات هنا (يخفف التقطيع)
    var u = me(); if (!u || u.role === 'admin') return;
    var recs = J(RK, []); if (!Array.isArray(recs)) return;
    var chans = recs.filter(function (r) { return r.k === 'ch'; });
    var list = [];
    recs.forEach(function (r) {
      if ((r.k === 'a' || r.k === 'g' || r.k === 'ev') && (u.role === 'parent' ? same(u.child, r.n) : u.role === 'student' ? same(u.name, r.n) : false)) list.push({ id: 'r' + r.id, r: r, t: r.k === 'a' ? 'a' : r.k === 'ev' ? 'ev' : 'g' });
      else if (r.k === 'imp' && String(r.uid) !== u.uid) list.push({ id: 'i' + r.id, r: r, t: 'imp' });
      else if (r.k === 'cp') {
        var c = chans.filter(function (x) { return x.id === r.ch; })[0];
        if (c && c.m && c.m['u' + okk(u.uid)] && String(c.o) !== u.uid && !(c.mu && c.mu['u' + okk(u.uid)])) list.push({ id: 'p' + r.id, r: r, c: c, t: 'cp' });
      }
    });
    var key = 'af_rec_seen_' + u.uid, old = J(key, null), ids = list.map(function (x) { return x.id; });
    if (old === null) { try { LS.setItem(key, JSON.stringify(ids)); } catch (e) {} recSeen = ids; return; }
    if (recSeen === null) recSeen = old;
    var changed = false;
    list.forEach(function (x) {
      if (recSeen.indexOf(x.id) > -1) return;
      changed = true;
      if (fg() || Date.now() - (x.r.ts || 0) > 24 * 3600e3) return;
      try {
        if (x.t === 'g') NA.notifySchool(x.r.n || 'طالب', (x.r.s || 'المادة') + ': ' + x.r.v + (x.r.nt ? ' · ' + x.r.nt : ''), 'نتيجة امتحان', 'rec:' + x.id, photoOf2(x.r.n));
        else if (x.t === 'imp') NA.notifySchool(x.r.title || 'إشعار مهم', String(x.r.body || ''), 'إشعار مهم من ' + (x.r.from || 'الإدارة'), 'imp:r' + x.r.id, '');
        else if (x.t === 'ev') NA.notifySchool(x.r.n || 'طالب', 'تقييم جديد' + (x.r.s ? ' في ' + x.r.s : '') + ({ 5: ': ممتاز', 4: ': جيد جداً', 3: ': جيد', 2: ': متوسط', 1: ': ضعيف' }[x.r.lv] || '') + (x.r.by ? ' — الأستاذ ' + x.r.by : '') + (x.r.nt ? ' · ' + x.r.nt : ''), 'تقييم المدرس', 'rec:' + x.id, photoOf2(x.r.n));
        else if (x.t === 'a') NA.notifySchool(x.r.n || 'طالب', 'غياب ' + (x.r.d || ''), 'غياب', 'rec:' + x.id, photoOf2(x.r.n));
        else NA.notifyMessage('chan:' + x.c.id, x.c.cn || 'قناة', true, x.c.on || 'المدرس', photoOf(x.c.o), x.r.t || (x.r.img ? '📷 صورة' : x.r.q ? '📊 استطلاع' : 'منشور جديد'), x.r.ts || Date.now());
      } catch (e) {}
    });
    if (changed || ids.length !== recSeen.length) { recSeen = ids; try { LS.setItem(key, JSON.stringify(ids)); } catch (e) {} }
  }
  function photoOf2(name) {
    var list = (J(DBK, { accounts: [] }).accounts) || [], a = list.find(function (x) { return same(x.name, name); }), p = a && a.photo;
    return p && String(p).length < 350000 ? String(p) : '';
  }

  /* ===== 7) إعلانات المدرسة وتحاضير الدروس والجدول والعطل (جديد + معدّل) ===== */
  var seenAnn = null;
  function hsh(o) { var t = ''; try { t = JSON.stringify(o); } catch (e) {} var h = 0; for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) | 0; } return h; }
  function schoolTick() {
    if (nativeOn()) return; // المزامنة الأصلية شغالة: ما نحتاج نقرأ ونحلل البيانات هنا (يخفف التقطيع)
    var u = me(); if (!u || u.role === 'admin') return;
    var SDv = J(SK, {}), info = SDv.info || {}, items = [];
    function arr(v) { return Array.isArray(v) ? v.filter(Boolean) : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []); }
    arr(info.announcements).forEach(function (a) {
      var mine = a.target === 'all' || String(a.target) === u.grade || (a.target === 'student' && (same(a.student, u.name) || (u.role === 'parent' && same(a.student, u.child))));
      var id = 'ann:' + (a.id || a.createdAt || a.title);
      items.push({ id: id, sig: id + ':' + hsh(a), mine: mine, fire: function (ed) { NA.notifySchool('إشعار', (ed ? '✏️ تم تعديل الإشعار\n' : '') + (a.title && a.desc ? a.title + ' — ' + a.desc : (a.title || '') + (a.desc || '')), 'الإدارة • ثانوية الفارابي', id, ''); } });
    });
    if (u.role !== 'teacher') arr(info.lessonPlans).forEach(function (p) {
      var id = 'plan:' + (p.id || p.title), g = String(p.grade || '');
      items.push({ id: id, sig: id + ':' + hsh(p), mine: u.role === 'parent' || g === u.grade, fire: function (ed) {
        NA.notifySchool(ed ? 'تحضير معدّل' : 'تحضير جديد', (p.title || 'تحضير جديد') + (p.description ? '\n' + p.description : ''),
          'تحضير' + (p.teacher ? ' • ' + (/^(ال)?أستاذ|^(ال)?استاذ|^أ\.|^م\./.test(String(p.teacher)) ? '' : 'الأستاذ ') + p.teacher : '') + (p.subject || p.subj ? ' • ' + (p.subject || p.subj) : '') + (GN[g] ? ' • ' + GN[g] : ''), id, ''); } });
    });
    var sch = SDv.schedule || {};
    Object.keys(sch).forEach(function (gk) {
      var id = 'sch:' + gk, cls = (sch[gk] && sch[gk].cls) || GN[gk] || 'الصف';
      items.push({ id: id, sig: id + ':' + hsh(sch[gk]), mine: u.role === 'teacher' || gk === u.grade || (u.role === 'parent' && !u.grade), fire: function () { NA.notifySchool('الجدول المدرسي', 'تم نشر/تحديث جدول ' + cls + ' الأسبوعي', 'جدول الحصص', id, ''); } });
    });
    var sd = info.schoolDays || {};
    Object.keys(sd).forEach(function (day) {
      var d = sd[day] || {}, id = 'day:' + day, hol = d.status === 'holiday';
      items.push({ id: id, sig: id + ':' + hsh(d), mine: true, fire: function () { NA.notifySchool(hol ? 'عطلة' : 'دوام', 'يوم ' + day + ': ' + (hol ? 'عطلة' : 'دوام رسمي') + (d.note ? ' — ' + d.note : ''), 'الدوام المدرسي', id, ''); } });
    });
    var key = 'af_sc_seen2_' + u.uid, old = J(key, null), sigs = items.map(function (x) { return x.sig; });
    if (old === null) { try { LS.setItem(key, JSON.stringify(sigs)); } catch (e) {} seenAnn = sigs; return; }
    if (seenAnn === null) seenAnn = old;
    items.forEach(function (x) {
      if (seenAnn.indexOf(x.sig) > -1 || !x.mine || fg()) return;
      var ed = seenAnn.some(function (z) { return z.indexOf(x.id + ':') === 0; });
      try { x.fire(ed); } catch (e) {}
    });
    if (sigs.length !== seenAnn.length || sigs.some(function (x) { return seenAnn.indexOf(x) < 0; })) { seenAnn = sigs; try { LS.setItem(key, JSON.stringify(sigs)); } catch (e) {} }
  }

  /* ===== 8) تشغيل الفحص لحظياً عند كتابة البيانات + احتياط كل 4 ثواني ===== */
  var timers = {};
  function sched(t) {
    if (timers[t]) return;
    timers[t] = setTimeout(function () { timers[t] = 0; try { ({ c: chatTick, r: recTick, s: schoolTick })[t](); } catch (e) {} }, 250);
  }
  var origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k) {
    var r = origSet.apply(this, arguments);
    if (this === window.localStorage) { if (k === CK) sched('c'); else if (k === RK) sched('r'); else if (k === SK) sched('s'); }
    return r;
  };
  window.addEventListener('storage', function (e) { if (!e || !e.key) return; if (e.key === CK) sched('c'); else if (e.key === RK) sched('r'); else if (e.key === SK) sched('s'); });
  setInterval(function () { if (!nativeOn()) { sched('c'); sched('r'); sched('s'); } }, 6000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { A.cancelNotif('call'); } catch (e) {} } });

  /* ===== 9) أوامر من الإشعارات: رد سريع ورفض مكالمة ===== */
  window.afSendReply = function (g, text) {
    var u = me(); if (!u || !text) return false;
    var d = J(CK, {}), t = Date.now();
    (d[g] = d[g] || []).push({ id: t, u: u.raw, n: u.name, r: u.role, ts: t, t: String(text) });
    try { LS.setItem(CK, JSON.stringify(d)); return true; } catch (e) { return false; }
  };
  window.afDeclineCall = function (g, cid) {
    var u = me(); if (!u) return false;
    var d = J(CK, {}), t = Date.now();
    (d[g] = d[g] || []).push({ id: t * 1000 + Math.floor(Math.random() * 1000), u: u.raw, n: u.name, c: 'cd', cid: isNaN(+cid) ? cid : +cid, ts: t });
    try { LS.setItem(CK, JSON.stringify(d)); return true; } catch (e) { return false; }
  };

  /* ===== 10) أدوات فحص ومزامنة البيانات (تظهر من إعدادات التطبيق) ===== */
  function localCounts() {
    var db = J(DBK, { accounts: [] }), sd = J(SK, {}), ch = J(CK, {}), n = 0;
    Object.keys(ch).forEach(function (g) { n += (ch[g] || []).length; });
    return { accounts: (db.accounts || []).length, students: (sd.students || []).length, teachers: (sd.teachers || []).length, groups: Object.keys(sd.groups || {}).length, messages: n };
  }
  window.afReport = async function () {
    var info = (window.AFSyncInfo && window.AFSyncInfo()) || {}, base = info.base, L = localCounts();
    var out = ['حالة الاتصال: ' + (info.state || window.FBSTATE || 'غير معروفة'), 'عناصر بانتظار الرفع: ' + (info.queue || 0), '',
      'على هذا الجهاز:', '• حسابات: ' + L.accounts, '• طلاب: ' + L.students + '  • مدرسون: ' + L.teachers, '• مجموعات: ' + L.groups + '  • رسائل: ' + L.messages];
    if (!base) out.push('', 'ما تم الاتصال بقاعدة بيانات المدرسة بعد.');
    else {
      out.push('', 'على الخادم:');
      var items = [['accounts', 'حسابات'], ['school/students', 'طلاب'], ['school/teachers', 'مدرسون'], ['school/groups', 'مجموعات'], ['chat', 'محادثات']];
      for (var i = 0; i < items.length; i++) {
        try {
          var r = await rf(base + '/' + items[i][0] + '.json?shallow=true', { cache: 'no-store' });
          if (!r.ok) { out.push('• ' + items[i][1] + ': خطأ ' + r.status + (r.status === 401 || r.status === 403 ? ' (قواعد الحماية ترفض)' : '')); continue; }
          var j = await r.json();
          out.push('• ' + items[i][1] + ': ' + (j && typeof j === 'object' ? Object.keys(j).length : 0));
        } catch (e) { out.push('• ' + items[i][1] + ': تعذّر الاتصال'); }
      }
    }
    A.showText('فحص المزامنة', out.join('\n'));
  };
  window.afPull = async function () {
    try {
      await Promise.all([window.AFAccountsNow && window.AFAccountsNow(15000), window.AFSchoolNow && window.AFSchoolNow(15000)]);
      A.showText('سحب البيانات', 'تم سحب الحسابات وبيانات المدرسة من الخادم. جاري إعادة تحميل التطبيق...');
      setTimeout(function () { location.reload(); }, 1500);
    } catch (e) { A.showText('سحب البيانات', 'تعذّر السحب: ' + e); }
  };
  window.afPush = function () {
    var ok = window.AFPushAll && window.AFPushAll();
    A.showText('رفع البيانات', ok ? 'تم رفع حسابات وبيانات ومحادثات هذا الجهاز للخادم. افتح "فحص المزامنة" بعد دقيقة للتأكد.' : 'تعذّر الرفع.');
  };

  /* ===== 11) فتح إعدادات التطبيق: 5 ضغطات سريعة بأعلى الشاشة ===== */
  var taps = [];
  document.addEventListener('click', function (e) {
    if (e.clientY > 90) return;
    var t = Date.now(); taps = taps.filter(function (x) { return t - x < 2500; }); taps.push(t);
    if (taps.length >= 5) { taps = []; try { A.openSettings(); } catch (x) {} }
  }, true);
})();
