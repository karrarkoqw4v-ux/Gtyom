/* af-push.js — إشعارات فورية دقيقة المحتوى عبر وسيط FCM (تعمل من أي واجهة: طالب، مدرس، إدارة)
   كل حدث يرسل فوراً (بدون أي تأخير أو تجميع) بنفس لحظة النشر/الإرسال. */
(function () {
  'use strict';
  var RELAY = '', KEY = '', ts = 0;
  function LSget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function base() { return window.FBBASE || (window.AFSyncInfo && window.AFSyncInfo().base) || LSget('alfarabi_fbbase_shhb') || ''; }
  function cfg() {
    if (Date.now() - ts < (RELAY ? 600000 : 15000)) return; ts = Date.now();
    var b = base(); if (!b) return;
    fetch(b.replace(/\/$/, '') + '/config/push.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (c && typeof c.url === 'string' && c.url.indexOf('https://') === 0) { RELAY = c.url; KEY = String(c.key || ''); }
    }).catch(function () {});
  }
  setInterval(cfg, 5000); cfg();

  function nrm(s) { return String(s || '').replace(/[\sً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه'); }
  function same(a, b) { a = nrm(a); b = nrm(b); return a.length > 4 && b.length > 4 && (a === b || a.indexOf(b) > -1 || b.indexOf(a) > -1); }
  function accounts() { try { return (JSON.parse(localStorage.getItem('alfarabi_db_v1')) || {}).accounts || []; } catch (e) { return []; } }
  function uid(a) { return String(a.createdAt || a.name); }
  function cut(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }
  function clean(d) { var o = {}; Object.keys(d).forEach(function (k) { if (d[k] != null) o[k] = cut(d[k], k === 'b' ? 300 : 120); }); return o; }

  /* إرسال فوري: items = [{uids:[...], d:{...}}] */
  function send(items) {
    cfg(); if (!RELAY) return false;
    var out = [];
    items.forEach(function (it) {
      var u = (it.uids || []).map(String).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
      for (var i = 0; i < u.length; i += 100) out.push({ uids: u.slice(i, i + 100), d: clean(it.d) });
    });
    if (!out.length) return false;
    try { fetch(RELAY, { method: 'POST', headers: { 'content-type': 'application/json', 'x-af-key': KEY }, body: JSON.stringify({ items: out }), keepalive: true }).catch(function () {}); } catch (e) { return false; }
    return true;
  }

  function pct(v) {
    var t = String(v).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }), m = t.match(/(\d+(?:\.\d+)?)\s*(?:\/|من)\s*(\d+(?:\.\d+)?)/);
    if (m) { var b = +m[2]; return b > 0 ? Math.round(Math.min(100, +m[1] / b * 100)) : null; }
    m = t.match(/\d+(?:\.\d+)?/); if (!m) return null; var n = +m[0]; return n >= 0 && n <= 100 ? Math.round(n) : null;
  }

  window.AFPUSH = {
    send: send,
    /* رسالة محادثة: مجموعة أو خاصة. اسم المرسل وصورته ونص الرسالة */
    chat: function (uids, su, sn, cv, grp, body, tag, t, call) {
      return send([{ uids: uids, d: { k: 'chat', su: su, sn: sn, cv: cv, gp: grp ? '1' : '0', b: body, tag: tag, ts: t, call: call ? '1' : '0' } }]);
    },
    /* تحضير: عنوان + وصف + اسم المدرس وصورته + المادة */
    plan: function (uids, title, desc, teacher, teacherUid, subject, id) {
      return send([{ uids: uids, d: { k: 'plan', t: title, b: desc, sn: teacher, su: teacherUid, sb: subject, tag: String(id || '') } }]);
    },
    /* إعلان المدرسة: اسم المدرسة + عنوان الإعلان + وصفه */
    ann: function (school, title, desc, target, student, id) {
      var a = accounts().filter(function (x) { return !x.kicked && x.role !== 'guest' && x.role !== 'admin'; }), u;
      if (target === 'all') u = a.map(uid);
      else if (target === 'student') u = a.filter(function (x) { return (x.role === 'student' && same(x.name, student)) || (x.role === 'parent' && same(x.child, student)); }).map(uid);
      else u = a.filter(function (x) { return (x.role === 'student' || x.role === 'parent') && String(x.grade) === String(target); }).map(uid);
      return send([{ uids: u, d: { k: 'ann', sc: school, t: title, b: desc, tag: String(id || '') } }]);
    },
    /* درجة طالب: يصل لحسابه ولولي أمره باسم الطالب والمادة والدرجة والنسبة */
    grade: function (name, subject, value, exam) {
      var u = accounts().filter(function (x) { return !x.kicked && ((x.role === 'student' && same(x.name, name)) || (x.role === 'parent' && same(x.child, name))); }).map(uid);
      var p = pct(value);
      return send([{ uids: u, d: { k: 'grade', sn: name, sb: subject, v: value, p: p == null ? '' : String(p), ex: exam || '', tag: nrm(name).slice(0, 12) + ':' + nrm(subject).slice(0, 8) } }]);
    }
  };
})();
