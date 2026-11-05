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
  function J(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }

  /* ===== 2) Notification: نربط إشعارات الصفحة بإشعارات الأندرويد ===== */
  function N(title, opts) {
    opts = opts || {};
    var tag = String(opts.tag || '');
    var kind = tag === 'call' ? 'call' : 'school';
    try { A.notify(kind, String(title), String(opts.body || ''), tag); } catch (e) {}
    this.title = title; this.body = opts.body || ''; this.tag = tag;
    this.close = function () { try { A.cancelNotif(tag); } catch (e) {} };
    this.onclick = null;
  }
  N.permission = 'granted';
  N.requestPermission = function (cb) {
    try { A.requestNotifPermission(); } catch (e) {}
    if (typeof cb === 'function') cb('granted');
    return Promise.resolve('granted');
  };
  window.Notification = N;
  // الصفحات الداخلية (iframe) تاخذ نفس الدالة
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
  // لما ترجع للتطبيق نلغي إشعار المكالمة
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { A.cancelNotif('call'); } catch (e) {} } });

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

  /* ===== 4) الحساب الحالي: نعلم الخلفية لتبقى تستقبل الإشعارات ===== */
  var CK = 'alfarabi_chat_v2', SS = 'alfarabi_sess_acc', SK = 'alfarabi_school_v1';
  function me() {
    var s = LS.getItem('alfarabi_session'); if (!s) return null;
    var a = J(SS, null); if (!a || a.email !== s) { var db = J('alfarabi_db_v1', { accounts: [] }); a = (db.accounts || []).find(function (x) { return x.email === s; }); }
    if (!a || a.kicked) return null;
    return { uid: String(a.createdAt || a.name), role: a.role, grade: String(a.grade || ''), name: a.name || '' };
  }
  var lastUid = null;
  setInterval(function () {
    var u = me(), id = u && u.role !== 'admin' ? u.uid : '';
    if (id !== lastUid) { lastUid = id; try { A.session(id); } catch (e) {} }
  }, 3000);

  /* ===== 5) رسائل المحادثات الجديدة (تشمل المجموعات وقنوات المدرسين) ===== */
  var GN = { 1: 'الأول متوسط', 2: 'الثاني متوسط', 3: 'الثالث متوسط', 4: 'الرابع العلمي', 5: 'الخامس العلمي' };
  function mineKey(k, u) {
    if (k.indexOf('dsup_') === 0) return k === 'dsup_' + u.uid;
    if (k[0] === 'd') return k.slice(1).split('~').indexOf(u.uid) > -1;
    if (u.role === 'parent') return k === 'p';
    return k === (u.grade || '2');
  }
  function preview(m) { return m.t || (m.aud ? '🎤 رسالة صوتية' : m.img ? '📷 صورة' : m.vid ? '🎬 فيديو' : m.q ? '📊 استطلاع' : m.f ? '📎 ملف' : 'رسالة جديدة'); }
  var lastLen = -1, seenTs = {}, chatInit = false;
  function chatTick() {
    var u = me(); if (!u || u.role === 'admin') return;
    var s = LS.getItem(CK) || ''; if (s.length === lastLen) return; lastLen = s.length;
    var d; try { d = JSON.parse(s) || {}; } catch (e) { return; }
    var groups = (J(SK, {}).groups) || {};
    Object.keys(d).forEach(function (g) {
      if (!mineKey(g, u)) return;
      var arr = d[g] || [], last = seenTs[g] || 0, mx = last;
      arr.forEach(function (m) {
        if (!m || !m.ts) return;
        if (m.ts > mx) mx = m.ts;
        if (!chatInit || m.ts <= last || m.c || String(m.u) === u.uid || Date.now() - m.ts > 10 * 60e3) return;
        var gn = g[0] === 'd' ? '' : ((groups[g] && groups[g].name) || (g === 'p' ? 'أولياء الأمور' : GN[g] || ''));
        try { A.notify('msg', (m.n || 'رسالة') + (gn ? ' • ' + gn : ''), preview(m), 'chat:' + g); } catch (e) {}
      });
      seenTs[g] = mx;
    });
    chatInit = true;
  }
  setInterval(chatTick, 1500);

  /* ===== 6) إعلانات المدرسة وتحاضير الدروس الجديدة ===== */
  var seenAnn = null;
  function schoolTick() {
    var u = me(); if (!u || u.role === 'admin') return;
    var info = J(SK, {}).info || {};
    var ann = (Array.isArray(info.announcements) ? info.announcements : []).filter(function (a) { return a.target === 'all' || String(a.target) === u.grade || (a.target === 'student' && a.student === u.name); });
    var plans = (Array.isArray(info.lessonPlans) ? info.lessonPlans : []).filter(function (p) { return u.role === 'teacher' ? false : String(p.grade) === u.grade || u.role === 'parent'; });
    var ids = ann.map(function (a) { return 'a' + (a.id || a.createdAt || a.title); }).concat(plans.map(function (p) { return 'p' + (p.id || p.title); }));
    var key = 'af_ann_seen_' + u.uid, old = J(key, null);
    if (old === null || seenAnn === null) { seenAnn = old || ids; try { LS.setItem(key, JSON.stringify(ids)); } catch (e) {} if (old === null) return; }
    ann.forEach(function (a) { var i = 'a' + (a.id || a.createdAt || a.title); if (seenAnn.indexOf(i) < 0) { try { A.notify('school', 'إعلان جديد: ' + (a.title || ''), String(a.desc || '').slice(0, 140), 'ann:' + i); } catch (e) {} } });
    plans.forEach(function (p) { var i = 'p' + (p.id || p.title); if (seenAnn.indexOf(i) < 0) { try { A.notify('school', 'تحضير جديد: ' + (p.title || ''), (p.subj ? p.subj + ' - ' : '') + String(p.description || '').slice(0, 120), 'plan:' + i); } catch (e) {} } });
    if (ids.length !== seenAnn.length || ids.some(function (x) { return seenAnn.indexOf(x) < 0; })) { seenAnn = ids; try { LS.setItem(key, JSON.stringify(ids)); } catch (e) {} }
  }
  setInterval(schoolTick, 4000);

  /* ===== 6.5) أدوات فحص ومزامنة البيانات (تظهر من إعدادات التطبيق) ===== */
  function localCounts() {
    var db = J('alfarabi_db_v1', { accounts: [] }), sd = J(SK, {}), ch = J(CK, {}), n = 0;
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

  /* ===== 7) فتح إعدادات التطبيق: 5 ضغطات سريعة بأعلى الشاشة ===== */
  var taps = [];
  document.addEventListener('click', function (e) {
    if (e.clientY > 90) return;
    var t = Date.now(); taps = taps.filter(function (x) { return t - x < 2500; }); taps.push(t);
    if (taps.length >= 5) { taps = []; try { A.openSettings(); } catch (x) {} }
  }, true);
})();
