/* واجهة الدخول لنسخة الموقع: خيارات تثبيت (Android / Apple / المتصفح) بنفس ألوان التطبيق */
(function () {
  'use strict';
  var W = window, D = document, LS = null; try { LS = W.sessionStorage; } catch (e) { }
  var ua = navigator.userAgent || '';
  var standalone = (W.matchMedia && W.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  try { if (LS && LS.getItem('af_land_skip') === '1') return; } catch (e) { }
  var BASE = (function () { var s = D.currentScript; var u = s && s.src ? s.src : location.href; return u.replace(/[^\/]*([?#].*)?$/, ''); })();
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAnd = /Android/i.test(ua);
  var isSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA|FBAN|FBAV|Instagram|Line\/|Telegram|Snapchat|MicroMessenger/.test(ua);
  var REPO = 'karrarkoqw4v-ux/Gtyom', BR = 'claude/hala-yweuvu', DIR = 'alfarabi/dist';
  var apk = { url: 'https://github.com/' + REPO + '/raw/' + BR + '/' + DIR + '/alfarabi-latest.apk', ver: '' };
  var dip = null;
  W.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dip = e; refreshPwa(); });
  W.addEventListener('appinstalled', function () { close(); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var I = {
    and: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 0 1 12 0v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 17z"/><path d="M8.5 4.5 7 2.5M15.5 4.5 17 2.5"/><circle cx="9.5" cy="9" r=".6" fill="currentColor"/><circle cx="14.5" cy="9" r=".6" fill="currentColor"/><path d="M3.5 11v5M20.5 11v5"/></svg>',
    app: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3c0 1.6-1.2 3-2.8 3.2C13.5 4.6 14.800 3.200 16.500 3z"/><path d="M12 7.500c1-.7 2-1 3-1 1.600 0 2.800.8 3.500 1.800-2.800 1.600-2.400 5.400.4 6.600-.7 2-2.200 4.100-3.700 4.100-1 0-1.300-.6-2.500-.6s-1.600.6-2.500.6c-1.600 0-4.200-3.200-4.200-6.700 0-2.700 1.800-4.500 3.800-4.500.9 0 1.700.4 2.200.7z"/></svg>',
    apk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9S14.500 18.500 12 21c-2.500-2.500-3.500-5.500-3.500-9S9.500 5.500 12 3z"/></svg>',
    shr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
    cp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    chv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  var css = D.createElement('style');
  css.textContent = [
    '#afl{position:fixed;inset:0;z-index:2147483647;overflow:auto;direction:rtl;font-family:"Cairo","Noto Naskh Arabic",sans-serif;color:#14213d;background:linear-gradient(180deg,#eaf6ff 0%,#f4f8ff 45%,#fff6dc 100%);-webkit-overflow-scrolling:touch}',
    '#afl *{box-sizing:border-box}',
    '#afl .bl{position:absolute;border-radius:50%;filter:blur(46px);opacity:.55;pointer-events:none}',
    '#afl .b1{width:260px;height:260px;background:#7fd3ff;top:-70px;right:-60px}',
    '#afl .b2{width:240px;height:240px;background:#ffd76a;bottom:-60px;left:-60px}',
    '#afl .b3{width:200px;height:200px;background:#ffb3a7;bottom:30%;right:-90px;opacity:.35}',
    '#afl .wrap{position:relative;min-height:100%;display:grid;place-items:center;padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(18px + env(safe-area-inset-bottom,0px))}',
    '#afl .card{width:100%;max-width:420px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.9);border-radius:30px;padding:26px 20px 20px;box-shadow:0 18px 50px rgba(30,100,170,.18);text-align:center}',
    '#afl .lgo{position:static;width:112px;height:112px;margin:0 auto 12px;border-radius:50%;background:#fff;box-shadow:0 8px 26px rgba(10,166,245,.35);overflow:hidden;display:grid;place-items:center}',
    '#afl .lgo img{width:100%;height:100%;object-fit:cover}',
    '#afl .hi{font-size:15px;color:#5a6b8c;font-weight:700}',
    '#afl h1{margin:2px 0 4px;font-size:32px;line-height:1.3;color:#1e90ff;font-weight:800}',
    '#afl .sn{font-size:18px;font-weight:800;color:#14213d}',
    '#afl .ds{font-size:13.5px;color:#4b5b78;margin:8px 4px 18px;line-height:1.8}',
    '#afl .bt{width:100%;display:flex;align-items:center;gap:12px;border:0;border-radius:18px;padding:14px 16px;margin:0 0 11px;font:inherit;font-size:16px;font-weight:800;cursor:pointer;text-align:right;position:relative}',
    '#afl .bt svg{width:28px;height:28px;flex:none}',
    '#afl .bt .t{flex:1;min-width:0}',
    '#afl .bt small{display:block;font-size:12px;font-weight:600;opacity:.85;margin-top:1px}',
    '#afl .bt:active{transform:scale(.98)}',
    '#afl .a{background:linear-gradient(135deg,#0aa6f5,#2a7de1);color:#fff;box-shadow:0 8px 20px rgba(10,166,245,.38)}',
    '#afl .i{background:linear-gradient(135deg,#1f2a44,#14213d);color:#fff;box-shadow:0 8px 20px rgba(20,33,61,.3)}',
    '#afl .y{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d;box-shadow:0 8px 20px rgba(255,193,7,.4)}',
    '#afl .g{background:rgba(255,255,255,.45);color:#7b88a3;border:1.5px dashed #b8c6df;cursor:default;box-shadow:none}',
    '#afl .g .bd{background:rgba(20,33,61,.08);color:#5a6b8c;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:700;white-space:nowrap}',
    '#afl .you{position:absolute;top:-9px;left:14px;background:#ffc107;color:#14213d;font-size:11px;font-weight:800;border-radius:999px;padding:2px 10px}',
    '#afl .sk{background:none;border:0;color:#2a7de1;font:inherit;font-size:14px;font-weight:700;padding:10px;cursor:pointer;text-decoration:underline;text-underline-offset:4px}',
    '#afl .ft{display:flex;gap:6px;align-items:center;justify-content:center;font-size:12px;color:#6b7a98;margin-top:6px}',
    '#afl .ft svg{width:14px;height:14px}',
    '#afs{position:fixed;inset:0;z-index:2147483647;background:rgba(20,33,61,.45);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:"Cairo","Noto Naskh Arabic",sans-serif;animation:aff .2s}',
    '#afs .sh{width:100%;max-width:460px;background:#fff;border-radius:26px 26px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));max-height:92vh;overflow:auto;color:#14213d;animation:afu .28s cubic-bezier(.2,.9,.3,1)}',
    '#afs .gr{width:44px;height:5px;border-radius:9px;background:#d7e0ef;margin:0 auto 12px}',
    '#afs h2{margin:0 0 4px;font-size:19px;text-align:center}',
    '#afs .sb{margin:0 0 14px;text-align:center;font-size:13px;color:#5a6b8c}',
    '#afs .bt{width:100%;display:flex;align-items:center;gap:12px;border:2px solid #e1e8f4;background:#f6f9fd;border-radius:18px;padding:13px 14px;margin:0 0 10px;font:inherit;font-size:15.5px;font-weight:800;color:#14213d;cursor:pointer;text-align:right}',
    '#afs .bt svg{width:26px;height:26px;color:#1288c4;flex:none}',
    '#afs .bt .t{flex:1}',
    '#afs .bt small{display:block;font-size:12px;font-weight:600;color:#5a6b8c;margin-top:1px}',
    '#afs .bt.p{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afs .bt.p svg,#afs .bt.p small{color:#fff}',
    '#afs .bt.y{background:linear-gradient(135deg,#ffe066,#ffc107);border-color:transparent}',
    '#afs .bt.y svg{color:#14213d}',
    '#afs .cl{width:100%;border:0;background:none;color:#5a6b8c;font:inherit;font-weight:700;padding:8px;cursor:pointer}',
    '#afs .ic{display:flex;gap:14px;align-items:center;background:#f6f9fd;border:2px solid #e1e8f4;border-radius:20px;padding:12px 14px;margin:0 0 12px}',
    '#afs .ic img{width:64px;height:64px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,.18)}',
    '#afs .ic b{font-size:17px;display:block}#afs .ic span{font-size:12.5px;color:#5a6b8c}',
    '#afs ol{margin:0 0 12px;padding:0;list-style:none;counter-reset:s}',
    '#afs ol li{counter-increment:s;display:flex;gap:10px;align-items:center;padding:9px 4px;font-size:14.5px;line-height:1.7;border-bottom:1px solid #eef2f9}',
    '#afs ol li::before{content:counter(s);flex:none;width:26px;height:26px;border-radius:50%;background:#0aa6f5;color:#fff;font-weight:800;display:grid;place-items:center;font-size:13px}',
    '#afs ol li svg{width:20px;height:20px;vertical-align:middle;color:#1288c4}',
    '#afs .wn{background:#fff6dc;border:1.5px solid #ffe08a;border-radius:16px;padding:12px;font-size:14px;line-height:1.8;margin:0 0 12px}',
    '#afs .ar{position:fixed;bottom:12px;left:50%;margin-left:-14px;font-size:30px;color:#ffc107;animation:afb 1s infinite;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.4)}',
    '@keyframes afu{from{transform:translateY(100%)}to{transform:none}}@keyframes aff{from{opacity:0}to{opacity:1}}@keyframes afb{50%{transform:translateY(8px)}}'
  ].join('\n');
  D.head.appendChild(css);

  var root = D.createElement('div'); root.id = 'afl';
  var logo = BASE + 'logo.jpg', ico = BASE + 'icon-192.png';
  function badge(t) { return '<span class="you">' + t + '</span>'; }
  root.innerHTML = '<i class="bl b1"></i><i class="bl b2"></i><i class="bl b3"></i><div class="wrap"><div class="card">' +
    '<div class="lgo"><img src="' + logo + '" alt="شعار المدرسة"></div>' +
    '<div class="hi">أهلاً وسهلاً</div><h1>ترحب بكم</h1><div class="sn">ثانوية الفارابي الأهلية للبنين</div>' +
    '<p class="ds">ثبّت التطبيق على جهازك حتى توصلك الإشعارات والرسائل والتفاصيل مباشرة، حتى لو كان التطبيق مغلقاً.</p>' +
    '<button class="bt a" data-a="and">' + (isAnd ? badge('جهازك') : '') + I.and + '<span class="t">تثبيت كتطبيق Android<small>ملف APK أو من المتصفح</small></span></button>' +
    '<button class="bt i" data-a="ios">' + (isIOS ? badge('جهازك') : '') + I.app + '<span class="t">تثبيت كتطبيق Apple<small>iPhone و iPad من سفاري</small></span></button>' +
    '<div class="bt g">' + I.app + '<span class="t">تطبيق App Store</span><span class="bd">قيد التطبيق</span></div>' +
    '<button class="sk" data-a="go">المتابعة من المتصفح بدون تثبيت</button>' +
    '<div class="ft">' + I.lock + '<span>بياناتك نفسها في الموقع والتطبيق</span></div>' +
    '</div></div>';

  function mount() { if (!D.body) return setTimeout(mount, 30); D.body.appendChild(root); D.documentElement.style.overflow = 'hidden'; }
  mount();
  function close() { var s = D.getElementById('afs'); if (s) s.remove(); root.remove(); D.documentElement.style.overflow = ''; }
  function skip() { try { LS && LS.setItem('af_land_skip', '1'); } catch (e) { } close(); }

  /* أحدث ملف APK من المستودع */
  try {
    fetch('https://api.github.com/repos/' + REPO + '/contents/' + DIR + '?ref=' + encodeURIComponent(BR)).then(function (r) { return r.json(); }).then(function (l) {
      var f = (l || []).filter(function (x) { return /\.apk$/i.test(x.name); }).sort(function (a, b) { return b.name.localeCompare(a.name, undefined, { numeric: true }); })[0];
      if (f) { apk.url = f.download_url || apk.url; var m = /v([\d.]+)\.apk/.exec(f.name); apk.ver = m ? m[1] : ''; var v = D.getElementById('afv'); if (v) v.textContent = apk.ver ? 'أحدث نسخة ' + apk.ver + ' — تنزيل مباشر' : 'تنزيل مباشر'; }
    }).catch(function () { });
  } catch (e) { }

  function sheet(html) {
    var o = D.getElementById('afs'); if (o) o.remove();
    o = D.createElement('div'); o.id = 'afs'; o.innerHTML = '<div class="sh"><div class="gr"></div>' + html + '<button class="cl" data-a="sc">رجوع</button></div>';
    o.addEventListener('click', function (e) { var t = e.target; if (t === o) { o.remove(); return; } var b = t.closest && t.closest('[data-a]'); if (!b) return; act(b.getAttribute('data-a')); });
    D.body.appendChild(o);
  }
  function refreshPwa() { var s = D.getElementById('afpw'); if (s) s.querySelector('small').textContent = dip ? 'تثبيت مباشر بضغطة وحدة' : 'من قائمة المتصفح ⋮ ← تثبيت التطبيق'; }

  function andSheet() {
    sheet('<h2>تثبيت كتطبيق Android</h2><p class="sb">اختر الطريقة المناسبة</p>' +
      '<button class="bt p" data-a="apk">' + I.apk + '<span class="t">تثبيت كتطبيق APK<small id="afv">' + (apk.ver ? 'أحدث نسخة ' + esc(apk.ver) + ' — تنزيل مباشر' : 'تنزيل أحدث نسخة مباشرة') + '</small></span></button>' +
      '<button class="bt y" id="afpw" data-a="pwa">' + I.web + '<span class="t">تثبيت كتطبيق من المتصفح<small>' + (dip ? 'تثبيت مباشر بضغطة وحدة' : 'من قائمة المتصفح ⋮ ← تثبيت التطبيق') + '</small></span></button>');
  }
  function iosSheet() {
    var head = '<h2>تثبيت كتطبيق Apple</h2>';
    if (!isIOS) { sheet(head + '<p class="sb">هذا الخيار لأجهزة iPhone و iPad</p><div class="wn">افتح هذا الرابط من جهاز آبل داخل <b>سفاري</b> حتى يظهر لك التثبيت.</div><button class="bt" data-a="copy">' + I.cp + '<span class="t">نسخ رابط الموقع</span></button>'); return; }
    if (!isSafari) { sheet(head + '<div class="wn">أنت داخل متصفح غير سفاري، وآبل تسمح بالتثبيت من <b>سفاري</b> فقط. افتح سفاري ثم حمّل التطبيق.</div><ol><li>اضغط «نسخ الرابط» بالأسفل</li><li>افتح تطبيق <b>Safari</b></li><li>الصق الرابط وافتحه ثم اضغط «تثبيت»</li></ol><button class="bt p" data-a="copy">' + I.cp + '<span class="t">نسخ الرابط</span></button>'); return; }
    sheet(head + '<p class="sb">ضغطة وحدة ويصير التطبيق على شاشتك</p><div class="ic"><img src="' + ico + '" alt=""><div><b>الفارابي</b><span>ثانوية الفارابي الأهلية للبنين</span></div></div>' +
      '<button class="bt p" data-a="share">' + I.shr + '<span class="t">تثبيت<small>سيظهر لك خيار «إضافة إلى الشاشة الرئيسية»</small></span></button>' +
      '<ol><li>اضغط زر المشاركة ' + I.shr + ' بأسفل سفاري</li><li>اختر «إضافة إلى الشاشة الرئيسية»</li><li>اضغط «إضافة» وافتح التطبيق من الشاشة</li></ol>');
    var ar = D.createElement('div'); ar.className = 'ar'; ar.textContent = '⬇'; ar.id = 'afar'; D.body.appendChild(ar);
  }
  function copy() {
    var u = location.href.split('#')[0];
    function ok() { var b = D.querySelector('#afs [data-a="copy"] .t'); if (b) b.textContent = 'تم نسخ الرابط ✓'; }
    try { navigator.clipboard.writeText(u).then(ok, function () { prompt('انسخ الرابط', u); }); } catch (e) { prompt('انسخ الرابط', u); }
  }
  function act(a) {
    var ar = D.getElementById('afar'); if (ar && a !== 'share') ar.remove();
    if (a === 'and') return andSheet();
    if (a === 'ios') return iosSheet();
    if (a === 'sc') { var s = D.getElementById('afs'); if (s) s.remove(); if (ar) ar.remove(); return; }
    if (a === 'go') return skip();
    if (a === 'apk') { var l = D.createElement('a'); l.href = apk.url; l.download = ''; l.rel = 'noopener'; D.body.appendChild(l); l.click(); l.remove(); var t = D.querySelector('#afs .sh'); if (t) { var n = D.createElement('div'); n.className = 'wn'; n.innerHTML = 'بدأ التنزيل. بعد ما ينتهي افتح الملف واسمح بالتثبيت من هذا المصدر عند ظهور الطلب، وبعدها افتح «الفارابي».'; t.insertBefore(n, t.querySelector('.cl')); } return; }
    if (a === 'pwa') {
      if (dip) { dip.prompt(); dip.userChoice.then(function (c) { dip = null; if (c && c.outcome === 'accepted') close(); }); return; }
      var t2 = D.querySelector('#afs .sh'); if (t2 && !D.getElementById('afpn')) { var n2 = D.createElement('div'); n2.id = 'afpn'; n2.className = 'wn'; n2.innerHTML = 'اضغط زر القائمة <b>⋮</b> بأعلى المتصفح ثم اختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.'; t2.insertBefore(n2, t2.querySelector('.cl')); } return;
    }
    if (a === 'share') { var u = location.href.split('#')[0]; if (navigator.share) navigator.share({ title: 'الفارابي', url: u }).catch(function () { }); return; }
    if (a === 'copy') return copy();
  }
  root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-a]'); if (b) act(b.getAttribute('data-a')); });
})();
