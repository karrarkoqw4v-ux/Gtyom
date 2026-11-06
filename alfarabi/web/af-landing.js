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
    and: '<svg viewBox="0 0 24 24"><path fill="#3DDC84" d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396"/></svg>',
    app: '<svg viewBox="0 0 24 24"><path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
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
    '#afl .wrap{position:relative;min-height:100%;display:flex;flex-direction:column;align-items:center;gap:16px;padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(18px + env(safe-area-inset-bottom,0px))}',
    '#afl .card{margin-top:auto;width:100%;max-width:420px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.9);border-radius:30px;padding:26px 20px 20px;box-shadow:0 18px 50px rgba(30,100,170,.18);text-align:center}',
    '#afl .lgo{position:static;width:112px;height:112px;margin:0 auto 12px;border-radius:50%;background:#fff;box-shadow:0 8px 26px rgba(10,166,245,.35);overflow:hidden;display:grid;place-items:center}',
    '#afl .lgo img{width:100%;height:100%;object-fit:cover}',
    '#afl .hi{font-size:15px;color:#5a6b8c;font-weight:700}',
    '#afl h1{margin:2px 0 4px;font-size:32px;line-height:1.3;color:#1e90ff;font-weight:800}',
    '#afl .sn{font-size:18px;font-weight:800;color:#14213d}',
    '#afl .ds{font-size:13.5px;color:#4b5b78;margin:8px 4px 18px;line-height:1.8}',
    '#afl .bt{width:100%;display:flex;align-items:center;gap:12px;border:0;border-radius:18px;padding:14px 16px;margin:0 0 11px;font:inherit;font-size:16px;font-weight:800;cursor:pointer;text-align:right;position:relative}',
    '#afl .bt svg{width:30px;height:30px;flex:none}',
    '#afl .bt .lg2{width:46px;height:46px;border-radius:14px;background:#fff;display:grid;place-items:center;flex:none;box-shadow:0 2px 8px rgba(0,0,0,.15)}',
    '#afl .bt .lg2 svg{width:28px;height:28px}',
    '#afl .bt .t{flex:1;min-width:0}',
    '#afl .bt small{display:block;font-size:12px;font-weight:600;opacity:.85;margin-top:1px}',
    '#afl .bt:active{transform:scale(.98)}',
    '#afl .a{background:linear-gradient(135deg,#0aa6f5,#2a7de1);color:#fff;box-shadow:0 8px 20px rgba(10,166,245,.38)}',
    '#afl .i{background:#fff;color:#000;border:2px solid #14213d;box-shadow:0 8px 20px rgba(20,33,61,.18)}',
    '#afl .y{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d;box-shadow:0 8px 20px rgba(255,193,7,.4)}',
    '#afl .g{background:rgba(255,255,255,.45);color:#7b88a3;border:1.5px dashed #b8c6df;cursor:default;box-shadow:none}',
    '#afl .g .lg2{background:rgba(255,255,255,.7);opacity:.6;box-shadow:none}',
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

    '#afl .doc{width:100%;max-width:420px;margin-bottom:auto}',
    '#afl .dc{background:rgba(255,255,255,.8);border:1.5px solid rgba(255,255,255,.95);border-radius:26px;padding:18px 16px;box-shadow:0 12px 36px rgba(30,100,170,.12);margin-bottom:14px}',
    '#afl .dc h3{margin:0 0 4px;font-size:19px;text-align:center;color:#14213d;font-weight:800}',
    '#afl .dc .sb2{margin:0 0 12px;text-align:center;font-size:13px;color:#5a6b8c}',
    '#afl .lb{font-size:12.5px;font-weight:800;color:#5a6b8c;margin:8px 4px 6px;text-align:right}',
    '#afl .gd{display:grid;gap:8px}#afl .g3{grid-template-columns:repeat(3,1fr)}#afl .g2{grid-template-columns:repeat(2,1fr)}',
    '#afl .gd button{border:2px solid #e1e8f4;background:#f6f9fd;color:#14213d;border-radius:14px;padding:10px 4px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;line-height:1.4}',
    '#afl .gd button.on{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afl .gd.r button.on{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d}',
    '#afl .ch{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:0 0 10px}',
    '#afl .ch button{border:2px solid #e1e8f4;background:#f6f9fd;color:#14213d;border-radius:999px;padding:7px 14px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}',
    '#afl .ch button.on{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afl .ch.r button.on{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d}',
    '#afl .st{margin:0;padding:0;list-style:none;counter-reset:q}',
    '#afl .st li{counter-increment:q;display:flex;gap:10px;align-items:flex-start;padding:9px 2px;font-size:14.5px;line-height:1.8;border-bottom:1px solid #eef2f9;text-align:right}',
    '#afl .st li:last-child{border-bottom:0}',
    '#afl .st li::before{content:counter(q);flex:none;width:26px;height:26px;margin-top:2px;border-radius:50%;background:#0aa6f5;color:#fff;font-weight:800;display:grid;place-items:center;font-size:13px}',
    '#afl .nt{background:#fff6dc;border:1.5px solid #ffe08a;border-radius:14px;padding:10px 12px;font-size:13.5px;line-height:1.8;margin-top:10px;text-align:right}',
    '#afl .cr{text-align:center;padding:6px 8px 4px;color:#33425f;font-size:14px;line-height:2}',
    '#afl .cr b{color:#14213d}',
    '#afl .cr .ln{width:60px;height:4px;border-radius:9px;background:linear-gradient(90deg,#0aa6f5,#ffc107);margin:0 auto 10px}',
    '#afl .dn{text-align:center;font-size:12px;color:#6b7a98;margin:-2px 0 6px}',
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
    '<button class="bt a" data-a="and">' + (isAnd ? badge('جهازك') : '') + '<span class="lg2">' + I.and + '</span>' + '<span class="t">تثبيت كتطبيق Android<small>ملف APK أو من المتصفح</small></span></button>' +
    '<button class="bt i" data-a="ios">' + (isIOS ? badge('جهازك') : '') + '<span class="lg2">' + I.app + '</span>' + '<span class="t">تثبيت كتطبيق Apple<small>iPhone و iPad من سفاري</small></span></button>' +
    '<div class="bt g"><span class="lg2">' + I.app + '</span><span class="t">تطبيق App Store</span><span class="bd">قيد التطبيق</span></div>' +
    '<button class="sk" data-a="go">المتابعة من المتصفح بدون تثبيت</button>' +
    '<div class="ft">' + I.lock + '<span>بياناتك نفسها في الموقع والتطبيق</span></div>' +
    '</div><div class="doc" id="afdoc"></div></div>';


  var STM = [['m1', 'أول متوسط'], ['m2', 'ثاني متوسط'], ['m3', 'ثالث متوسط']], STP = [['p4', 'الرابع العلمي'], ['p5', 'الخامس العلمي']];
  var ROLES = [['st', 'طالب'], ['pa', 'ولي الأمر'], ['te', 'كادر التدريس']];
  var GN = { m1: 'أول متوسط', m2: 'ثاني متوسط', m3: 'ثالث متوسط', p4: 'الرابع العلمي', p5: 'الخامس العلمي' };
  function isPrep(st) { return st === 'p4' || st === 'p5'; }
  function steps(role, stage) {
    var g = GN[stage];
    if (role === 'st') return ['اذا كنت طالباً، اختر «طالب» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'قم بإدخال اسمك الثلاثي.', 'قم بإدخال معرّف حسابك من خلال بطاقة المدرسة.', 'قم بإدخال كلمة السر.', 'حدّد الصف: <b>' + g + '</b>.', 'اضغط «موافقة والتالي».', 'أو استخدم «عبر معرّف حسابي»: امسح باركود البطاقة بالكاميرا وسجّل مباشرة.'];
    if (role === 'pa') return ['اختر «ولي الأمر» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'اكتب اسمك واسم ابنك الثلاثي.', 'حدّد صف الابن: <b>' + g + '</b>.', 'أكمل رقم الهاتف إذا طُلب منك.', 'اضغط «موافق ومتابعة»، وتظهر لك تفاصيل ابنك.'];
    return ['اختر «كادر التدريس» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'اكتب اسمك الثلاثي ومعرّف حساب المدرس.', 'اختر الصف الذي تدرّسه: <b>' + g + '</b>، ثم اختر المادة.', 'اضغط «تحقق»، وبعد نجاح التحقق تدخل لحسابك وتبدأ بالتحاضير والرسائل.'];
  }
  var dst = 'm3', drl = 'st';
  function docHtml() {
    function chips(a) { return a.map(function (x) { return '<button data-s="' + x[0] + '"' + (x[0] === dst ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join(''); }
    var rc = ROLES.map(function (x) { return '<button data-r="' + x[0] + '"' + (x[0] === drl ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('');
    return '<div class="dc"><h3>شروط الاستخدام وطريقة التسجيل</h3><p class="sb2">اختر صفك ثم نوع حسابك</p>' +
      '<div class="lb">المرحلة المتوسطة</div><div class="gd g3">' + chips(STM) + '</div><div class="lb">المرحلة الإعدادية</div><div class="gd g2">' + chips(STP) + '</div><div class="lb">نوع الحساب</div><div class="gd g3 r">' + rc + '</div>' +
      '<ol class="st">' + steps(drl, dst).map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('') + '</ol>' +
      '<div class="nt">المعرّف وكلمة السر تستلمهما من بطاقة المدرسة. إذا واجهتك مشكلة بالدخول راجع دعم المدرسة من صفحة الدخول.</div></div>' +
      '<div class="dc cr"><div class="ln"></div>تم تطوير التطبيق من الإدارة المحترمة، ومن الأساتذة كادر التدريس المحترم.<br><b>المشرف:</b> الأستاذ زين العابدين<br><b>المصمم:</b> كرار حيدر</div>';
  }
  function mount() { if (!D.body) return setTimeout(mount, 30); D.body.appendChild(root); D.documentElement.style.overflow = 'hidden'; }
  mount();
  function renderDoc() { var d = root.querySelector('#afdoc'); if (d) d.innerHTML = docHtml(); }
  renderDoc();
  root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-s],[data-r]'); if (!b) return; if (b.hasAttribute('data-s')) dst = b.getAttribute('data-s'); else drl = b.getAttribute('data-r'); renderDoc(); });
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
