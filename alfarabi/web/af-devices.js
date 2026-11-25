/* af-devices.js — «الأجهزة المسجلة» الحقيقية لكل الحسابات (طالب، ولي أمر، مدرس):
   - جهازك الحالي أعلى الشاشة بحالة «متصل» مع اسم الجهاز الأصلي.
   - تحته كل جهاز آخر سجّل الدخول بنفس الحساب، وزر «خروج» يُخرجه من الحساب فوراً (خلال ثوانٍ).
   التخزين: acc_dev/<الحساب>/<الجهاز> = {n: الاسم, k: النوع, ls: آخر ظهور, out: وقت الإخراج}. */
(function () {
  'use strict';
  var USER = function () {
    if (!U || !U.role || U.role === 'guest') return;
    function sk(x) { return String(x == null ? '' : x).replace(/[.#$\[\]\/]/g, '_'); }
    var AK = sk(uid), DID = '';
    try { DID = LS.getItem('af_did') || ''; if (!DID) { DID = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); LS.setItem('af_did', DID); } } catch (e) { DID = 'd' + Date.now().toString(36); }
    function B() { return P.FBBASE || ''; }
    function nodeUrl(d) { return B() + '/acc_dev/' + AK + '/' + d + '.json'; }
    var ua = navigator.userAgent || '', apple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    function devName() {
      try { var i = JSON.parse(P.Android.deviceInfo()); if (i && i.name) return i.name; } catch (e) { }
      return /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'هاتف Android' : /Windows/.test(ua) ? 'حاسوب Windows' : /Macintosh/.test(ua) ? 'حاسوب Mac' : 'متصفح ويب';
    }
    function beat() {
      if (!B()) return;
      var b = { n: devName(), k: apple ? 'i' : 'a', ls: Date.now() };
      var at = LS.getItem('af_did_at'); if (!at) { at = String(Date.now()); try { LS.setItem('af_did_at', at); } catch (e) { } } b.at = +at;
      try { fetch(nodeUrl(DID), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).catch(function () { }); } catch (e) { }
    }
    var outing = false;
    function gone() {
      if (outing) return; outing = true;
      try { fetch(nodeUrl(DID), { method: 'DELETE' }).catch(function () { }); } catch (e) { }
      try { toast('تم إخراجك من هذا الجهاز من جهاز آخر بحسابك'); } catch (e) { }
      setTimeout(function () { try { P.adminLogout(); } catch (e) { try { LS.removeItem('alfarabi_session'); LS.removeItem('alfarabi_sess_acc'); P.location.reload(); } catch (x) { } } }, 1200);
    }
    function watch() {
      if (!B() || document.hidden || outing) return;
      fetch(nodeUrl(DID) + '?_=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (d && d.out) gone(); }).catch(function () { });
    }
    setTimeout(beat, 1500); setInterval(beat, 60000); setInterval(watch, 4000);
    /* أندرويد: نطلب إذن الكاميرا والمايك مرة وحدة بعد الدخول حتى يشتغل التصوير والبصمة الصوتية بدون مشاكل */
    try { if (P.Android && P.Android.requestMediaPermissions && !LS.getItem('af_media_asked2')) { LS.setItem('af_media_asked2', '1'); setTimeout(function () { try { P.Android.requestMediaPermissions(); } catch (e) { } }, 6000); } } catch (e) { }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { watch(); beat(); } });
    /* تسجيل الخروج العادي يحذف سجل هذا الجهاز */
    try {
      if (!P.__afLoW && typeof P.adminLogout === 'function') {
        var _lo = P.adminLogout; P.__afLoW = 1;
        P.adminLogout = function () { try { fetch(nodeUrl(DID), { method: 'DELETE', keepalive: true }).catch(function () { }); } catch (e) { } return _lo.apply(this, arguments); };
      }
    } catch (e) { }

    function rel(ts) { var s = Math.max(0, Math.round((Date.now() - ts) / 1000)); if (s < 90) return 'الآن'; var m = Math.round(s / 60); if (m < 60) return 'قبل ' + m + ' دقيقة'; var h = Math.round(m / 60); if (h < 24) return 'قبل ' + h + ' ساعة'; return 'قبل ' + Math.round(h / 24) + ' يوم'; }
    var ICO = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/></svg>';
    V.devices = function () {
      mark('settings');
      var timer = 0, drawn = false;
      function draw(map, loading) {
        var others = Object.keys(map || {}).filter(function (k) { return k !== DID && map[k] && typeof map[k] === 'object' && !map[k].out; }).map(function (k) { var o = map[k]; o.id = k; return o; }).sort(function (a, b) { return (b.ls || 0) - (a.ls || 0); });
        var h = '<div class="sc" id="afdv"><style>.afd{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid #e1e8f4;border-radius:20px;padding:12px 14px;margin:0 0 10px}.afd i{flex:none;width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#0a86d6);color:#fff;display:grid;place-items:center}.afd b{display:block;font-size:15.5px;color:#14213d}.afd small{display:block;color:#51647e;font-size:12.5px;margin-top:2px}.afd .on{flex:none;background:#e3f7ec;color:#14965b;font-weight:800;font-size:12.5px;border-radius:12px;padding:4px 11px}.afd .off{flex:none;background:#edf1f7;color:#7a8aa3;font-weight:800;font-size:12px;border-radius:12px;padding:4px 10px}.afd button{flex:none;border:0;border-radius:12px;background:#fdecee;color:#d9283d;font:inherit;font-weight:800;font-size:13px;padding:8px 14px;cursor:pointer}.afd button:active{opacity:.6}.afdh{font-size:13px;font-weight:800;color:#51647e;margin:14px 4px 8px}</style>' +
          '<div class="afdh" style="margin-top:2px">جهازك الحالي</div><div class="afd"><i>' + ICO + '</i><div style="flex:1;min-width:0"><b>' + esc(devName()) + '</b><small>' + (apple ? 'آيفون / آبل' : 'أندرويد / متصفح') + '</small></div><span class="on">متصل</span></div>' +
          '<div class="afdh">الأجهزة الأخرى المسجلة بحسابك</div>' +
          (others.length ? others.map(function (o) { var live = Date.now() - (o.ls || 0) < 150000; return '<div class="afd"><i>' + ICO + '</i><div style="flex:1;min-width:0"><b>' + esc(o.n || 'جهاز') + '</b><small>' + (live ? 'متصل الآن' : 'آخر ظهور ' + rel(o.ls || 0)) + '</small></div><span class="' + (live ? 'on' : 'off') + '">' + (live ? 'متصل' : 'غير متصل') + '</span><button type="button" data-out="' + esc(o.id) + '">خروج</button></div>'; }).join('') : '<p class="hint" style="margin:4px 6px">' + (loading ? 'جاري تحميل الأجهزة...' : 'لا توجد أجهزة أخرى مسجلة بحسابك.') + '</p>') +
          (others.length > 1 ? '<button class="bt ghost" id="afdAll" style="margin-top:6px;color:#d9283d">خروج من كل الأجهزة الأخرى</button>' : '') + '</div>';
        shell('الأجهزة المسجلة', '', h, V.settings); drawn = true;
        var sc = card.querySelector('#afdv'); if (!sc) return;
        sc.onclick = function (e) {
          var b = e.target.closest('[data-out]'), a = e.target.closest('#afdAll');
          if (b) kick([b.dataset.out]); else if (a) kick(others.map(function (o) { return o.id; }));
        };
      }
      function load() { if (!B()) { draw({}); return; } fetch(B() + '/acc_dev/' + AK + '.json?_=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (m) { if (drawn && !card.querySelector('#afdv')) { clearInterval(timer); return; } try { LS.setItem(CK2, JSON.stringify(m || {})); } catch (e) { } draw(m || {}); }).catch(function () { }); }
      function kick(ids) {
        Promise.all(ids.map(function (d) { return fetch(nodeUrl(d), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ out: Date.now() }) }); })).then(function () { toast(ids.length > 1 ? 'تم إخراج كل الأجهزة الأخرى' : 'تم إخراج الجهاز من حسابك'); load(); }).catch(function () { toast('تعذّر الإخراج، تأكد من الاتصال'); });
      }
      var CK2 = 'af_dv_c_' + AK, cached = {}; try { cached = JSON.parse(LS.getItem(CK2) || '{}') || {}; } catch (e) { }
      draw(cached, !Object.keys(cached).length);   /* تظهر الشاشة فوراً بآخر قائمة محفوظة، ثم تتحدّث من الخادم */
      beat(); load(); timer = setInterval(function () { if (!card.querySelector('#afdv')) { clearInterval(timer); return; } load(); }, 5000);
    };

    /* إضافة زر «الأجهزة المسجلة» لإعدادات المدرس إن لم يكن موجوداً */
    var _vs = V.settings;
    V.settings = function () {
      _vs();
      try {
        var sc = card.querySelector('.sc'); if (!sc || sc.querySelector('[data-v="devices"]')) return;
        var base = sc.querySelector('[data-v="cset"]') || sc.querySelector('.option'); if (!base) return;
        var n = base.cloneNode(true); n.setAttribute('data-v', 'devices');
        var lab = n.querySelector('.opt-text') || n.querySelector('span') || n; lab.textContent = 'الأجهزة المسجلة';
        n.onclick = function (e) { e.stopPropagation(); V.devices(); };
        sc.insertBefore(n, base);
      } catch (e) { }
    };
  };
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* ===== af-devices ===== */\n(' + USER.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-devices', e); } catch (x) { } }
})();
