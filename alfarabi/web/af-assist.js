/* af-assist.js — المساعد الدائم لشاشات التسجيل والدخول.
   يفتح من «الدعم ← مراسلة الدعم»، ويقدّم أزراراً سريعة تشرح التسجيل وتنقلك مباشرة للشاشة الصحيحة. */
(function () {
  'use strict';
  var D = document;
  var GN = { mid: 'المتوسطة', prep: 'الإعدادية' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = D.createElement('style');
  css.textContent = [
    '#afa{position:fixed;inset:0;z-index:2147483000;background:#0a0f18;display:flex;flex-direction:column;direction:rtl;font-family:"Noto Naskh Arabic","Cairo",system-ui,sans-serif;animation:afaIn .3s cubic-bezier(.2,.9,.3,1)}',
    '@keyframes afaIn{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}',
    '@keyframes afaPop{0%{transform:scale(.85) translateY(8px);opacity:0}100%{transform:none;opacity:1}}',
    '@keyframes afaDot{0%,100%{opacity:.25}50%{opacity:1}}',
    '@keyframes afaOrb{0%,100%{box-shadow:0 0 0 0 rgba(80,140,255,.5)}50%{box-shadow:0 0 0 12px rgba(80,140,255,0)}}',
    '#afa .h{display:flex;align-items:center;gap:12px;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 12px;background:#141c2a}',
    '#afa .h button{width:42px;height:42px;border:0;border-radius:50%;background:#202b3d;color:#fff;font-size:22px;cursor:pointer}',
    '#afa .orb{width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,#3b82f6,#6d4cf0);display:grid;place-items:center;animation:afaOrb 2.4s infinite;flex:none}',
    '#afa .orb svg{width:26px;height:26px;fill:#fff}',
    '#afa .h b{display:block;color:#fff;font-size:17px;font-weight:800}#afa .h small{color:#8da2c0;font-size:12px}',
    '#afa .m{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}',
    '#afa .b{max-width:86%;padding:10px 14px;border-radius:18px;font-size:16px;line-height:1.8;animation:afaPop .28s both}',
    '#afa .b.bot{align-self:flex-start;background:#182533;color:#fff;border-radius:18px 18px 18px 4px}',
    '#afa .b.me{align-self:flex-end;background:linear-gradient(180deg,#31608f,#27527f);color:#fff;border-radius:18px 18px 4px 18px}',
    '#afa .b ol{margin:6px 0 0;padding:0 18px 0 0}#afa .b li{margin:3px 0}#afa .b b{color:#9ad0ff}',
    '#afa .t{align-self:flex-start;display:flex;gap:5px;background:#182533;border-radius:18px;padding:12px 16px}#afa .t i{width:7px;height:7px;border-radius:50%;background:#8da2c0;animation:afaDot 1.1s infinite}#afa .t i:nth-child(2){animation-delay:.2s}#afa .t i:nth-child(3){animation-delay:.4s}',
    '#afa .q{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px calc(14px + env(safe-area-inset-bottom,0px));background:#101826;border-top:1px solid #1d2a3d}',
    '#afa .q button{flex:1 1 calc(50% - 8px);min-width:140px;border:0;border-radius:16px;padding:12px 10px;background:#1c2a40;color:#e8f1ff;font:700 15px inherit;cursor:pointer;transition:transform .12s,background .15s;animation:afaPop .3s both}',
    '#afa .q button:active{transform:scale(.95);background:#27407a}',
    '#afa .q button.go{background:linear-gradient(135deg,#0aa6f5,#2f6fe0);color:#fff;flex-basis:100%;box-shadow:0 8px 20px rgba(10,120,230,.4)}',
    '#afa .q button.wa{background:#12663a;color:#fff}',
    '@media (prefers-reduced-motion:reduce){#afa *{animation:none!important}}'
  ].join('\n');
  D.head.appendChild(css);

  var SPARK = '<svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z"/><path d="M19 15l1 2.7 2.7 1-2.7 1-1 2.7-1-2.7-2.7-1 2.7-1z"/></svg>';
  var root = null, msgs, q;

  function scroll() { setTimeout(function () { msgs.scrollTop = msgs.scrollHeight; }, 30); }
  function say(html, who) { var d = D.createElement('div'); d.className = 'b ' + (who || 'bot'); d.innerHTML = html; msgs.appendChild(d); scroll(); return d; }
  function typing(cb, ms) {
    var t = D.createElement('div'); t.className = 't'; t.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(t); scroll();
    setTimeout(function () { t.remove(); cb(); }, ms || 650);
  }
  function opts(list) {
    q.innerHTML = '';
    list.forEach(function (o) {
      var b = D.createElement('button'); b.textContent = o[0]; if (o[2]) b.className = o[2];
      b.onclick = function () { if (o[3] !== false) say(esc(o[0]), 'me'); q.innerHTML = ''; o[1](); };
      q.appendChild(b);
    });
  }
  function bot(html, list, ms) { typing(function () { say(html); opts(list || []); }, ms); }

  /* تنقّل حقيقي داخل التطبيق: نضغط الأزرار الموجودة أصلاً */
  function click(sel) { var e = D.querySelector(sel); if (e) e.click(); return !!e; }
  function waitClick(sel, tries) {
    var n = tries || 25; (function t() { var e = D.querySelector(sel); if (e && e.offsetParent !== null) { e.click(); return; } if (--n > 0) setTimeout(t, 120); })();
  }
  function go(role, stage) {
    close();
    var lv = stage === 'prep' ? '#lvlPrep' : '#lvlMid';
    setTimeout(function () { click(lv); waitClick('.sheet.open .option[data-role="' + role + '"], .option[data-role="' + role + '"]'); }, 250);
  }

  function steps(role, stage) {
    var s = GN[stage];
    if (role === 'student') return ['اختر <b>المرحلة ' + s + '</b> ثم <b>طالب</b>.', 'اكتب <b>اسمك الثلاثي</b>.', 'اكتب <b>معرّف حسابك</b> من بطاقة المدرسة.', 'اكتب <b>كلمة السر</b> (من البطاقة أيضاً).', 'حدّد <b>صفك</b>.', 'اضغط «موافقة والتالي».'];
    if (role === 'parent') return ['اختر <b>المرحلة ' + s + '</b> ثم <b>ولي أمر</b>.', 'اكتب <b>اسمك</b> و<b>اسم ابنك الثلاثي</b>.', 'حدّد <b>صف الابن</b>.', 'أكمل <b>رقم الهاتف</b> إذا طُلب.', 'اضغط «موافق ومتابعة».'];
    return ['اختر <b>المرحلة ' + s + '</b> ثم <b>كادر التدريس</b>.', 'اكتب <b>اسمك الثلاثي</b> و<b>معرّف حساب المدرس</b>.', 'اختر <b>الصف</b> ثم <b>المادة</b>.', 'اضغط «تحقق» لتدخل حسابك.'];
  }
  function ol(a) { return '<ol>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; }

  function human() {
    close();
    var g = {}; try { g = JSON.parse(localStorage.getItem('alfarabi_guest')) || {}; } catch (x) { }
    if (!g.id) { var n = (prompt('اكتب اسمك للمراسلة') || '').trim(); if (!n) return; g = { id: Date.now().toString(36), name: n }; try { localStorage.setItem('alfarabi_guest', JSON.stringify(g)); } catch (x) { } }
    if (window.openAdminChat) window.openAdminChat('dsup_guest_' + g.id, { role: 'guest', name: g.name, createdAt: 'guest_' + g.id, email: '' });
  }
  function wa() { try { window.open('https://wa.me/9647800188441', '_blank'); } catch (e) { } }

  function menu(first) {
    var list = [
      ['كيف أسجّل حساباً جديداً؟', register],
      ['نسيت المعرّف أو كلمة السر', forgot],
      ['لا أستطيع الدخول', trouble],
      ['دخول الإدارة', function () { bot('تمام، سأفتح لك شاشة دخول الإدارة.', [['افتح الآن', function () { close(); setTimeout(function () { click('#schoolAdminBtn'); }, 250); }, 'go', false], ['رجوع للقائمة', function () { menu(); }]]); }],
      ['التحدث مع موظف الدعم', function () { bot('سأفتح لك محادثة مباشرة مع الدعم.', [['افتح المحادثة', human, 'go', false], ['واتساب الدعم', wa, 'wa', false], ['رجوع للقائمة', function () { menu(); }]]); }]
    ];
    if (first) bot('أهلاً بك 👋 أنا <b>مساعد ثانوية الفارابي</b>. أساعدك بالتسجيل والدخول خطوة بخطوة. اختر ما تحتاجه:', list, 800);
    else bot('بماذا أقدر أساعدك؟', list, 450);
  }
  function register() {
    bot('من أنت؟', [['طالب', function () { stage('student'); }], ['ولي أمر', function () { stage('parent'); }], ['كادر التدريس', function () { stage('teacher'); }], ['رجوع للقائمة', function () { menu(); }]], 450);
  }
  function stage(role) {
    bot('في أي مرحلة؟', [['المرحلة المتوسطة', function () { show(role, 'mid'); }], ['المرحلة الإعدادية', function () { show(role, 'prep'); }], ['رجوع', register]], 450);
  }
  function show(role, st) {
    bot('هذه خطواتك:' + ol(steps(role, st)), [['خذني للتسجيل الآن', function () { go(role, st); }, 'go', false], ['عندي سؤال آخر', function () { menu(); }]], 900);
  }
  function forgot() {
    bot('معرّفك وكلمة السر <b>مكتوبان في بطاقة المدرسة</b> التي استلمتها. إن ضاعت البطاقة:' + ol(['استخدم <b>«معرفة حسابي»</b> وامسح باركود البطاقة بالكاميرا.', 'أو راسل الدعم وسيرسلون لك بياناتك بعد التحقق من اسمك.']), [['افتح «معرفة حسابي»', function () { close(); setTimeout(function () { click('#myAccBtn'); }, 250); }, 'go', false], ['كلّم الدعم', human, '', false], ['رجوع للقائمة', function () { menu(); }]], 950);
  }
  function trouble() {
    bot('تأكد من التالي:' + ol(['<b>الاسم الثلاثي</b> مكتوب كما في سجل المدرسة بدون أخطاء.', 'اختيار <b>الصف</b> الصحيح.', '<b>الإنترنت</b> شغّال (ثبّت التطبيق وحدّثه لآخر نسخة).', 'المعرّف وكلمة السر <b>بالإنجليزية</b> بدون مسافات.']), [['ما زالت المشكلة', function () { bot('راسل الدعم وأرسل لهم اسمك وصفك.', [['افتح محادثة الدعم', human, 'go', false], ['واتساب الدعم', wa, 'wa', false]]); }], ['رجوع للقائمة', function () { menu(); }]], 900);
  }

  function open() {
    if (D.getElementById('afa')) return;
    root = D.createElement('div'); root.id = 'afa';
    root.innerHTML = '<div class="h"><button aria-label="رجوع">›</button><div class="orb">' + SPARK + '</div><div><b>مساعد الفارابي</b><small>متاح دائماً لمساعدتك</small></div></div><div class="m"></div><div class="q"></div>';
    D.body.appendChild(root);
    msgs = root.querySelector('.m'); q = root.querySelector('.q');
    root.querySelector('.h button').onclick = close;
    menu(true);
  }
  function close() { var e = D.getElementById('afa'); if (e) e.remove(); }

  /* نعترض زر «مراسلة الدعم» قبل أن يفتح الشات القديم */
  D.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.support-link.msg,#supSheet .option:not([data-u*="http"])');
    if (!b) return;
    var sh = D.getElementById('supSheet'); if (sh) sh.classList.remove('open');
    var ov = D.getElementById('overlay'); if (ov) ov.classList.remove('open');
    e.stopImmediatePropagation(); e.preventDefault(); open();
  }, true);

  window.AFAssist = { open: open };
})();
