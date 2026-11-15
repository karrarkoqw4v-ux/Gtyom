/* af-wipe.js — تنظيف شامل مرة واحدة (WID): يمسح الرسائل وحسابات المسجلين من القاعدة،
   ويُخرج كل الأجهزة من حساباتها ليسجّلوا من جديد، ثم يعيد تشغيل التطبيق.
   الملازم وحساب الإدارة ومعلومات المدرسة وقوائمها لا تُمَس. */
(function () {
  'use strict';
  var WID = 'w20261115', ROLES = ['student', 'parent', 'teacher'];
  /* يُنفَّذ قبل أن يقرأ التطبيق أي بيانات محلية: يمسح الرسائل ويُخرج الحساب فعلاً (بعد إعادة التحميل) */
  (function early() {
    try {
      /* أول تشغيل على قاعدة البيانات الجديدة: لا نرفع رسائل أو حسابات قديمة للقاعدة الجديدة */
      if (localStorage.getItem('af_db_proj') !== 'ssjjs-591e7') { localStorage.setItem('af_db_proj', 'ssjjs-591e7'); localStorage.setItem('af_wipe_pending', WID); localStorage.setItem('af_wipe_seen', WID); }
      if (localStorage.getItem('af_wipe_pending') !== WID) return;
      localStorage.removeItem('af_wipe_pending');
      localStorage.removeItem('alfarabi_chat_v2');
      if (localStorage.getItem('alfarabi_session') !== 'admin') {
        localStorage.removeItem('alfarabi_session'); localStorage.removeItem('alfarabi_sess_acc');
        var d = JSON.parse(localStorage.getItem('alfarabi_db_v1') || '{"accounts":[]}');
        d.accounts = (d.accounts || []).filter(function (a) { return ROLES.indexOf(a.role) < 0; });
        localStorage.setItem('alfarabi_db_v1', JSON.stringify(d));
      }
    } catch (e) {}
  })();
  var A = window.Android;
  function LS(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function base() { return String(window.FBBASE || (window.AFSyncInfo && window.AFSyncInfo().base) || LS('alfarabi_fbbase_ssjjs') || '').replace(/\/$/, ''); }
  function gj(p) { return fetch(base() + p + '.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }); }
  function put(p, v, m) { return fetch(base() + p + '.json', { method: m || 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) }); }
  function del(p) { return fetch(base() + p + '.json', { method: 'DELETE' }); }
  function restart() {
    try { if (A && A.otaReload) A.otaReload(); } catch (e) {}
    setTimeout(function () { try { location.reload(); } catch (e) {} }, 500);
  }

  /* ===== 1) كل جهاز: ينظّف نسخته المحلية ويخرج من الحساب ثم يعيد التشغيل ===== */
  function device() {
    if (!base() || LS('af_wipe_seen') === WID) return;
    gj('/config/reset').then(function (mk) {
      if (!mk || mk.wid !== WID) return;
      LS('af_wipe_seen', WID); LS('af_wipe_pending', WID);
      try { if (window.AFSetAccMk) window.AFSetAccMk(mk); } catch (e) {}
      restart();
    }).catch(function () {});
  }

  /* ===== 2) جهاز الإدارة: ينفّذ التنظيف على القاعدة (مرة واحدة بعد التأكيد) ===== */
  function modal(html) {
    var o = document.getElementById('afWipeM');
    if (!o) {
      o = document.createElement('div'); o.id = 'afWipeM';
      o.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(10,15,25,.72);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;font-family:"Noto Naskh Arabic",system-ui,sans-serif';
      document.body.appendChild(o);
    }
    o.innerHTML = '<div style="background:#fff;border-radius:26px;padding:20px;max-width:380px;width:100%;color:#14213d;box-shadow:0 20px 50px rgba(0,0,0,.4)">' + html + '</div>';
    return o;
  }
  var BT = 'border:0;border-radius:16px;padding:13px;font:700 16px inherit;width:100%;margin-top:10px;cursor:pointer;';
  function ask() {
    var o = modal('<h3 style="margin:0 0 8px;font-size:19px">تنظيف شامل للتطبيق</h3>' +
      '<p style="margin:0 0 8px;line-height:1.7;font-size:15px">سيتم الآن:<br>• مسح <b>كل رسائل المحادثات</b> (الجروبات والخاصة والدعم)<br>• مسح <b>كل الحسابات المسجلة</b> (طلاب وأولياء أمور ومدرسين) ليسجّلوا من جديد<br>• إخراج الجميع من حساباتهم وإعادة تشغيل التطبيق</p>' +
      '<p style="margin:0 0 6px;font-size:13px;color:#51647e">لا يُمسّ: الملازم، حساب الإدارة، معلومات المدرسة وقوائم الطلاب والمدرسين. سينزل ملف نسخة احتياطية أولاً.</p>' +
      '<button id="afWy" style="' + BT + 'background:linear-gradient(135deg,#ff5d6e,#d9283d);color:#fff">نعم، نفّذ التنظيف الآن</button>' +
      '<button id="afWn" style="' + BT + 'background:#eef3fb;color:#14213d">لاحقاً</button>');
    o.querySelector('#afWn').onclick = function () { o.remove(); };
    o.querySelector('#afWy').onclick = run;
  }
  function say(t, bad) { var o = modal('<h3 style="margin:0 0 8px;font-size:18px">' + (bad ? 'تعذّر التنظيف' : 'جاري التنظيف...') + '</h3><p style="margin:0;line-height:1.7;font-size:15px;color:' + (bad ? '#d9283d' : '#14213d') + '">' + t + '</p>' + (bad ? '<button id="afWc" style="' + BT + 'background:#eef3fb;color:#14213d">إغلاق</button>' : '')); if (bad) o.querySelector('#afWc').onclick = function () { o.remove(); }; }
  function backup() {
    return Promise.all(['accounts', 'chat', 'records', 'plans', 'school'].map(function (k) { return gj('/' + k).catch(function () { return null; }); })).then(function (r) {
      var blob = new Blob([JSON.stringify({ when: new Date().toISOString(), accounts: r[0], chat: r[1], records: r[2], plans: r[3], school: r[4] })], { type: 'application/json' });
      return new Promise(function (res) {
        var fr = new FileReader();
        fr.onload = function () { try { var a = document.createElement('a'); a.href = fr.result; a.download = 'alfarabi-backup-before-wipe-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 800); } catch (e) {} res(r[0]); };
        fr.onerror = function () { res(r[0]); };
        fr.readAsDataURL(blob);
      });
    });
  }
  function run() {
    var B = base(), ts = Date.now();
    if (!B) return say('لا يوجد اتصال بقاعدة البيانات', true);
    var NODES = ['chat', 'typing', 'devices', 'lastdev', 'plansSeen', 'fcm'];
    /* حذف الرسائل والحسابات: يتكرر ويتحقق لأن أجهزة قديمة قد تعيد رفع نسختها المحلية */
    function sweep() {
      var fail = 0;
      return Promise.all(NODES.map(function (k) { return del('/' + k).then(function (r) { if (!r.ok) fail++; }, function () { fail++; }); })).then(function () {
        return gj('/accounts').catch(function () { return null; });
      }).then(function (accs) {
        var nul = {}; Object.keys(accs || {}).forEach(function (k) { var a = accs[k]; if (a && ROLES.indexOf(a.role) > -1) nul[k] = null; });
        return Object.keys(nul).length ? put('/accounts', nul, 'PATCH').then(function (r) { if (!r.ok) fail++; }, function () { fail++; }) : null;
      }).then(function () { return fail; });
    }
    function left() {
      return Promise.all([gj('/chat?shallow=true').catch(function () { return null; }), gj('/accounts').catch(function () { return null; })]).then(function (r) {
        var accs = r[1] || {}, n = Object.keys(accs).filter(function (k) { return accs[k] && ROLES.indexOf(accs[k].role) > -1; }).length;
        return (r[0] && Object.keys(r[0]).length ? 1 : 0) + n;
      });
    }
    function until(i) {
      return sweep().then(function (fail) {
        if (fail) throw new Error('رفضت القاعدة ' + fail + ' عملية (راجع قواعد قاعدة البيانات) — لم يكتمل التنظيف.');
        return new Promise(function (res) { setTimeout(res, 2500); }).then(left).then(function (n) { if (n && i < 4) return until(i + 1); if (n) throw new Error('بقي ' + n + ' عنصر يعيد رفعه جهاز قديم. أعد المحاولة بعد أن تفتح بقية الأجهزة التطبيق.'); });
      });
    }
    say('تنزيل نسخة احتياطية...');
    backup().then(function () {
      say('إعلان التنظيف لكل الأجهزة...');
      var mk = { ts: ts, rev: ts, acc: 1, roles: ROLES, chat: true, records: false, by: 'admin', wid: WID };
      return put('/config/reset', mk).then(function (r) { if (!r.ok) throw new Error('تعذّر نشر علامة التنظيف'); return mk; });
    }).then(function (mk) {
      /* نمسح نسخة جهاز الإدارة قبل الحذف حتى لا يعيد رفعها */
      try { localStorage.removeItem('alfarabi_chat_v2'); } catch (e) {}
      try { if (window.AFSetAccMk) window.AFSetAccMk(mk); } catch (e) {}
      say('مسح الرسائل والحسابات من القاعدة...');
      return until(0);
    }).then(function () {
      return put('/config/wipe_done', WID);
    }).then(function () {
      LS('af_wipe_seen', WID); LS('af_wipe_pending', WID);
      say('تم التنظيف ✓ جاري إعادة تشغيل التطبيق...');
      setTimeout(restart, 1800);
    }).catch(function (e) { say(String(e && e.message || e), true); });
  }
  function adminJob() {
    if (LS('alfarabi_session') !== 'admin' || !base() || LS('af_wipe_seen') === WID) return;
    gj('/config/wipe_done').then(function (v) { if (v === WID) { LS('af_wipe_seen', WID); return; } if (!document.getElementById('afWipeM')) ask(); }).catch(function () {});
  }

  setTimeout(device, 4000); setInterval(device, 120000);
  /* التنظيف اليدوي من الإدارة معطّل في هذه النسخة (القاعدة جديدة وفارغة) */
  window.AFWIPE = { adminJob: adminJob };
})();
