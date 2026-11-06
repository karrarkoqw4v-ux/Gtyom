/* إضافات تطبيق الفارابي للأندرويد: الثيمات والمظهر، إعدادات المحادثة، البصمة، تخفيف الرسوم، وتصميم المكالمة */
(function () {
  'use strict';
  var A = window.Android;
  if (!A) return;
  var LS = window.localStorage;
  function g(k, d) { try { var v = LS.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function s(k, v) { try { LS.setItem(k, v); } catch (e) {} }
  function J(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }

  var THEME = g('af_theme', 'light');             // light | dark
  var GFX = g('af_gfx', 'lite');                  // static | lite | mid | full
  var TIER = { static: 0, lite: 1, mid: 2, full: 3 };

  // نثبّت مستوى الرسوميات قبل ما يقرأه محرك الأداء
  function pinTier() { s('af_tier_v1', JSON.stringify({ t: TIER[GFX] == null ? 1 : TIER[GFX], ts: Date.now() })); }
  pinTier();

  var FONTS = [
    ['IBM Plex Sans Arabic', 'الافتراضي'], ['Tajawal', 'تجوال'], ['Almarai', 'المرعي'], ['Amiri', 'أميري'],
    ['Noto Kufi Arabic', 'كوفي'], ['Changa', 'جانغا'],
    ['El Messiri', 'المسيري'], ['Mada', 'مدى'], ['Lateef', 'لطيف'], ['Vazirmatn', 'وزير'], ['Reem Kufi', 'ريم كوفي']
  ];
  var PRESETS = [
    ['سماوي', '#cfe8ff', '#0b3a5b', 'linear-gradient(180deg,#f4faff,#e3f1ff)'],
    ['نعناع', '#d3f5e3', '#0e4a2f', 'linear-gradient(180deg,#f4fff9,#e0f7ec)'],
    ['وردي', '#ffdbe6', '#6a1030', 'linear-gradient(180deg,#fff6f9,#ffe7ef)'],
    ['بنفسجي', '#e6dcff', '#33176b', 'linear-gradient(180deg,#faf7ff,#ede5ff)'],
    ['خوخي', '#ffe3cf', '#6b3210', 'linear-gradient(180deg,#fffaf5,#ffecdc)'],
    ['ليموني', '#f6f0b8', '#524a05', 'linear-gradient(180deg,#fffff4,#faf6d0)'],
    ['أزرق', '#2f6fe0', '#ffffff', 'linear-gradient(180deg,#eef4ff,#dbe8ff)'],
    ['أخضر', '#1fa56b', '#ffffff', 'linear-gradient(180deg,#f0fff7,#dbf5e7)'],
    ['ثلجي', '#e9eef6', '#16213a', '#ffffff'],
    ['ليلي أزرق', '#3b82f6', '#ffffff', '#0f172a'],
    ['ليلي بنفسجي', '#8b5cf6', '#ffffff', '#1a1030'],
    ['ليلي أخضر', '#22c55e', '#04210f', '#0b1a12']
  ];

  /* ===================== التنسيقات ===================== */
  var CSS = [
    /* --- تخفيف الرسوم: نوقف الضبابية الزجاجية والزخارف المتحركة --- */
    'html.af-lite *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    'html.af-lite .card,html.af-lite .nav,html.af-lite .drawer,html.af-lite .sheet{background:rgba(255,255,255,.92)!important}',
    'html.af-lite .a3-orb,html.af-lite .a3-sp,html.af-lite .a3-bv,html.af-lite .a3-sw,html.af-lite .a3-dl,html.af-lite .a3-fl,html.af-lite .a3-cd{display:none!important}',
    'html.af-lite .a3 *,html.af-lite .a3 *:before,html.af-lite .a3 *:after{animation:none!important}',
    'html.af-lite .card{animation:none!important}',

    /* --- الوضع الداكن --- */
    'html[data-aft=dark]{color-scheme:dark;--text:#e8eef9;--muted:#9fb0cb;--glass:rgba(20,30,48,.82);--glass-border:rgba(255,255,255,.10);--afp-bg:#0b1322;--afp-card:#16233a;--afp-line:rgba(255,255,255,.10);--afp-tx:#e8eef9;--afp-mut:#9fb0cb}',
    'html[data-aft=dark],html[data-aft=dark] body{background:#08101d!important;color:#e8eef9!important}',
    'html[data-aft=dark] .bg{filter:blur(18px) brightness(.25) saturate(.7)!important}',
    'html[data-aft=dark] .card,html[data-aft=dark] .nav,html[data-aft=dark] .drawer,html[data-aft=dark] .sheet{background:rgba(16,26,43,.90)!important;color:#e8eef9!important;border-color:rgba(255,255,255,.09)!important;box-shadow:0 10px 30px rgba(0,0,0,.45)!important}',
    'html[data-aft=dark].af-lite .card,html[data-aft=dark].af-lite .nav,html[data-aft=dark].af-lite .drawer,html[data-aft=dark].af-lite .sheet{background:rgba(16,26,43,.96)!important}',
    'html[data-aft=dark] h1,html[data-aft=dark] h2,html[data-aft=dark] h3,html[data-aft=dark] h4,html[data-aft=dark] b,html[data-aft=dark] strong,html[data-aft=dark] label,html[data-aft=dark] .opt-text,html[data-aft=dark] .nb:not(.on){color:#e8eef9!important}',
    'html[data-aft=dark] p,html[data-aft=dark] small,html[data-aft=dark] .hint,html[data-aft=dark] .muted{color:#9fb0cb!important}',
    'html[data-aft=dark] .option,html[data-aft=dark] .rw,html[data-aft=dark] .li,html[data-aft=dark] .tc,html[data-aft=dark] .row,html[data-aft=dark] .fd input,html[data-aft=dark] .fd textarea,html[data-aft=dark] .fd select,html[data-aft=dark] input,html[data-aft=dark] textarea,html[data-aft=dark] select{background:rgba(255,255,255,.07)!important;color:#e8eef9!important;border-color:rgba(255,255,255,.12)!important}',
    'html[data-aft=dark] input::placeholder,html[data-aft=dark] textarea::placeholder{color:#7d8ea8!important}',
    'html[data-aft=dark] .option svg,html[data-aft=dark] .chev{color:#9fb0cb!important;stroke:#9fb0cb!important}',
    'html[data-aft=dark] .nb:not(.on) svg{stroke:#9fb0cb!important}',
    'html[data-aft=dark] .back,html[data-aft=dark] .burger{background:rgba(255,255,255,.1)!important;color:#e8eef9!important}',
    'html[data-aft=dark] .back svg,html[data-aft=dark] .burger svg{stroke:#e8eef9!important}',
    'html[data-aft=dark] .nb:not(.on){background:rgba(255,255,255,.08)!important;color:#b9c6dc!important}',
    'html[data-aft=dark] .burger span{background:#e8eef9!important}',
    'html[data-aft=dark] #afNet{background:#7f1d1d!important}',

    /* --- ألوان المحادثة تتبع اختيارك والثيم --- */
    '#ch[data-afcp]{background:var(--chbg)!important;color:var(--chfg)!important}',
    '#ch[data-afcp] .r .bb{background:var(--obb)!important;color:var(--chfg)!important;box-shadow:0 1px 4px rgba(0,0,0,.13)!important}',
    '#ch[data-afcp] .r.me .bb{background:var(--bub)!important;color:var(--tx,#fff)!important}',
    '#ch[data-afcp=light] .ch-h .ch-c,#ch[data-afcp=light] .ch-p{background:#fff!important;color:#16213a!important;box-shadow:0 2px 10px rgba(20,33,61,.1)!important}',
    '#ch[data-afcp=light] .ch-p .tx b{color:#16213a!important}',
    '#ch[data-afcp=light] .ch-p .tx small,#ch[data-afcp=light] .tm,#ch[data-afcp=light] .em{color:#64748b!important}',
    '#ch[data-afcp=light] .ch-i{background:#fff!important;box-shadow:0 6px 20px rgba(20,33,61,.13)!important}',
    '#ch[data-afcp=light] .ch-i textarea,#ch[data-afcp=light] .ch-i .aci{color:#16213a!important}',
    '#ch[data-afcp=light] .ch-i .ch-c{color:#475569!important}',
    '#ch[data-afcp=light] .ch-i,#ch[data-afcp=light] .ch-i .ch-pill{background:#fff!important}',
    '#ch[data-afcp=light] .ch-i .ch-pill{box-shadow:inset 0 0 0 1.5px #dbe6f5!important;border-radius:26px}',
    '#ch[data-afcp] .ch-m,#ch[data-afcp] #cl,#ch[data-afcp] .ch-h{background-color:transparent!important}',
    '#ch[data-afcp=light] .ch-m,#ch[data-afcp=light] #cl{background-image:none!important}',
    '#ch[data-afcp=light] .chd span,#ch[data-afcp=light] .chn{background:rgba(255,255,255,.85)!important;color:#475569!important}',
    '#ch[data-afcp] .r .bb,#ch[data-afcp] .r .bb *{font-family:var(--ff,"Cairo"),sans-serif;font-weight:var(--fw,400)}',

    /* --- صفحات الإضافات (ثيمات، محادثة، أمان) --- */
    '.afp{position:fixed;inset:0;z-index:2147482500;background:var(--afp-bg,#f4f8ff);color:var(--afp-tx,#14213d);display:flex;flex-direction:column;direction:rtl;font-family:"Cairo","Tajawal",sans-serif;animation:afpIn .22s ease-out}',
    '@keyframes afpIn{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}',
    '.afp-h{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 10px}',
    '.afp-h h2{flex:1;margin:0;font-size:19px;font-weight:800;color:inherit!important}',
    '.afp-b{width:42px;height:42px;border-radius:14px;border:0;background:var(--afp-card,#fff);color:inherit;display:grid;place-items:center;box-shadow:0 2px 10px rgba(0,0,0,.08);font-size:22px;cursor:pointer}',
    '.afp-s{flex:1;overflow:auto;padding:6px 14px calc(26px + env(safe-area-inset-bottom,0px));-webkit-overflow-scrolling:touch}',
    '.afp-c{background:var(--afp-card,#fff);border-radius:20px;padding:14px;margin:0 0 12px;box-shadow:0 2px 12px rgba(20,33,61,.06);border:1px solid var(--afp-line,#e6edf7)}',
    '.afp-c h3{margin:0 0 10px;font-size:15px;font-weight:800;color:inherit!important}',
    '.afp-c p{margin:4px 0 0;font-size:12.5px;color:var(--afp-mut,#5b6b86)!important;line-height:1.7}',
    '.aft-row{display:flex;gap:10px}',
    '.aft-card{flex:1;border:2px solid var(--afp-line,#dfe8f5);background:transparent;border-radius:18px;padding:10px;color:inherit;font:inherit;font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative}',
    '.aft-card.on{border-color:#0aa6f5;box-shadow:0 0 0 3px rgba(10,166,245,.18)}',
    '.aft-card.on:after{content:"✓";position:absolute;top:8px;left:8px;width:22px;height:22px;border-radius:50%;background:#0aa6f5;color:#fff;font-size:13px;display:grid;place-items:center}',
    '.aft-pv{width:100%;height:76px;border-radius:12px;position:relative;overflow:hidden}',
    '.aft-pv.light{background:linear-gradient(160deg,#e9f4ff,#fff 60%,#fff3e4)}',
    '.aft-pv.dark{background:linear-gradient(160deg,#0b1322,#16233a)}',
    '.aft-pv:before{content:"";position:absolute;inset:12px 14px auto;height:14px;border-radius:7px;background:rgba(10,166,245,.85)}',
    '.aft-pv:after{content:"";position:absolute;inset:36px 14px auto;height:26px;border-radius:10px;background:rgba(127,140,160,.35)}',
    '.afs{display:flex;flex-wrap:wrap;gap:8px}',
    '.afs button{border:2px solid var(--afp-line,#dfe8f5);background:transparent;color:inherit;border-radius:14px;padding:8px 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}',
    '.afs button.on{border-color:#0aa6f5;background:rgba(10,166,245,.12)}',
    '.afs.fonts button{font-size:17px;padding:8px 12px}',
    '.afdots{display:flex;flex-wrap:wrap;gap:10px}',
    '.afdots button{width:38px;height:38px;border-radius:50%;border:3px solid transparent;box-shadow:0 0 0 1px rgba(0,0,0,.18);cursor:pointer}',
    '.afdots button.on{border-color:#0aa6f5}',
    '.afpre{display:grid;gap:8px;border-radius:18px;padding:14px;margin:0 0 12px;background:#fff}',
    '.afpre .m{max-width:80%;padding:8px 12px;border-radius:16px;font-size:var(--fs,15px);line-height:1.6}',
    '.afpre .m.o{justify-self:start;border-bottom-right-radius:4px;background:#fff;color:#16213a;box-shadow:0 1px 4px rgba(0,0,0,.12)}',
    '.afpre .m.me{justify-self:end;border-bottom-left-radius:4px}',
    '.afrange{width:100%}',
    '.afsw{display:flex;align-items:center;justify-content:space-between;gap:12px}',
    '.afsw b{font-size:15px}',
    '.aftog{position:relative;width:54px;height:30px;border-radius:15px;border:0;background:#c3cddb;cursor:pointer;flex:none;transition:background .2s}',
    '.aftog:after{content:"";position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:transform .2s}',
    '.aftog.on{background:#12a15a}.aftog.on:after{transform:translateX(-24px)}',
    '.afbtn{border:0;border-radius:14px;padding:11px 16px;font:inherit;font-weight:800;font-size:14px;color:#fff;background:linear-gradient(135deg,#0aa6f5,#2f7fb0);cursor:pointer}',
    '.afbtn.gray{background:rgba(127,140,160,.25);color:inherit}',
    '.afmsg{margin-top:8px;font-size:13px;font-weight:700}',
    '.afmsg.ok{color:#12a15a}.afmsg.bad{color:#d6243a}',

    /* --- شاشة المكالمة --- */
    '#cl2.on{position:fixed!important;inset:0!important;z-index:2147483000!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:space-between!important;padding:calc(48px + env(safe-area-inset-top,0px)) 20px calc(34px + env(safe-area-inset-bottom,0px))!important;background:linear-gradient(172deg,#13aaf8 0%,#1f6fe0 46%,#2c3fb6 100%)!important;color:#fff!important;direction:rtl;overflow:hidden}',
    '#cl2 .cbg{position:absolute!important;inset:0!important;background:radial-gradient(70% 45% at 50% 24%,rgba(255,255,255,.28),transparent 70%),radial-gradient(60% 40% at 50% 100%,rgba(0,0,0,.28),transparent 70%)!important;pointer-events:none}',
    '#cl2 .cmid{position:relative!important;display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center;gap:4px;margin-top:5vh;width:100%}',
    '#cl2 .cav{position:relative!important;width:150px!important;height:150px!important;margin-bottom:22px}',
    '#cl2 .cav .av{width:100%!important;height:100%!important;border-radius:50%!important;border:4px solid #fff!important;box-shadow:0 16px 38px rgba(0,0,0,.28);font-size:58px!important}',
    '#cl2.ringing .cav:before,#cl2.ringing .cav:after{content:"";position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(255,255,255,.7);animation:afRing 2.2s ease-out infinite}',
    '#cl2.ringing .cav:after{animation-delay:1.1s}',
    '@keyframes afRing{0%{transform:scale(.86);opacity:.85}100%{transform:scale(1.6);opacity:0}}',
    '#cl2 h2{margin:0!important;font-size:25px!important;font-weight:700!important;color:#fff!important;text-shadow:0 2px 10px rgba(0,0,0,.25)}',
    '#cl2 .cdt{margin:0!important;font-size:14px!important;font-weight:500;color:rgba(255,255,255,.85)!important}',
    '#cl2 .cst{margin:14px 0 0!important;display:inline-block;padding:7px 18px;border-radius:999px;background:rgba(255,255,255,.18);font-size:15px!important;font-weight:600!important;color:#fff!important;font-variant-numeric:tabular-nums}',
    '#cl2 .cbt{position:relative!important;display:flex!important;justify-content:center!important;align-items:flex-end!important;gap:26px!important;width:100%!important;max-width:380px;padding:22px 16px 20px;border-radius:34px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22)}',
    '#cl2 .cbt>div{display:flex;flex-direction:column;align-items:center;gap:9px;font-size:13px;font-weight:600;color:#fff;min-width:74px}',
    '#cl2 .cbt span{color:#fff!important}',
    '#cl2 .cb{width:66px!important;height:66px!important;border-radius:50%!important;border:0!important;display:grid!important;place-items:center!important;color:#fff!important;background:rgba(255,255,255,.22)!important;box-shadow:0 6px 16px rgba(0,0,0,.2);transition:transform .15s ease;cursor:pointer}',
    '#cl2 .cb:active{transform:scale(.92)}',
    '#cl2 .cb svg{width:30px!important;height:30px!important}',
    '#cl2 .cb.acc{background:linear-gradient(145deg,#34d37f,#10a257)!important;width:76px!important;height:76px!important;animation:afPulse 1.5s ease-in-out infinite}',
    '#cl2 .cb.end{background:linear-gradient(145deg,#ff5d6e,#d9283d)!important;width:76px!important;height:76px!important}',
    '#cl2 .cb.end svg{transform:rotate(135deg)}',
    '#cl2 .cb.w{background:#fff!important;color:#1f4fb8!important}',
    '@keyframes afPulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,127,.6),0 6px 16px rgba(0,0,0,.2)}50%{box-shadow:0 0 0 15px rgba(52,211,127,0),0 6px 16px rgba(0,0,0,.2)}}'
  ].join('\n');

  window.AFX_HEAD = function () { return '<style id="af-x">' + CSS + '</style>'; };

  /* ===================== تطبيق الثيم على كل المستندات ===================== */
  var docs = [];
  function applyDoc(d) {
    try {
      var r = d.documentElement; if (!r) return;
      r.setAttribute('data-aft', THEME);
      r.classList.toggle('af-lite', GFX === 'lite' || GFX === 'static');
      if (!d.getElementById('af-x')) {
        var st = d.createElement('style'); st.id = 'af-x'; st.textContent = CSS; (d.head || r).appendChild(st);
      }
    } catch (e) {}
  }
  function allDocs() {
    var out = [document];
    document.querySelectorAll('iframe').forEach(function (f) { try { if (f.contentDocument && f.contentDocument.documentElement) out.push(f.contentDocument); } catch (e) {} });
    return out;
  }
  function applyAll() {
    allDocs().forEach(applyDoc);
    try { A.setBars(THEME === 'dark'); } catch (e) {}
    try { var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', THEME === 'dark' ? '#08101d' : '#ffffff'); } catch (e) {}
  }
  function setTheme(t) { THEME = t; s('af_theme', t); applyAll(); }
  function setGfx(x) { GFX = x; s('af_gfx', x); pinTier(); applyAll(); }

  /* ===================== بناء الصفحات ===================== */
  function me() {
    var a = J('alfarabi_sess_acc', null);
    return a ? { uid: String(a.createdAt || a.name), role: a.role } : { uid: 'guest', role: 'guest' };
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function panel(doc, title, html, bind) {
    var old = doc.querySelector('.afp'); if (old) old.remove();
    var p = doc.createElement('div'); p.className = 'afp';
    p.innerHTML = '<div class="afp-h"><button class="afp-b" aria-label="رجوع">›</button><h2>' + esc(title) + '</h2></div><div class="afp-s">' + html + '</div>';
    doc.body.appendChild(p);
    p.querySelector('.afp-b').onclick = function () { p.remove(); };
    if (bind) bind(p);
    return p;
  }
  function on(root, sel, fn) { root.querySelectorAll(sel).forEach(function (n) { n.addEventListener('click', function (e) { fn(n, e); }); }); }

  /* --- الثيمات والمظهر --- */
  function themePage(doc) {
    function html() {
      return '<div class="afp-c"><h3>المظهر</h3><div class="aft-row">' +
        '<button class="aft-card' + (THEME === 'light' ? ' on' : '') + '" data-t="light"><span class="aft-pv light"></span>نهاري</button>' +
        '<button class="aft-card' + (THEME === 'dark' ? ' on' : '') + '" data-t="dark"><span class="aft-pv dark"></span>داكن</button></div>' +
        '<p>يتغير شكل التطبيق فوراً، وشريط الحالة بأعلى وأسفل الجهاز يتبع نفس اللون.</p></div>' +
        '<div class="afp-c"><h3>الرسوميات والأداء</h3><div class="afs" id="afg">' +
        [['static', 'ثابت (الأخف)'], ['lite', 'خفيف'], ['mid', 'متوسط'], ['full', 'كامل']].map(function (x) { return '<button data-g="' + x[0] + '"' + (GFX === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') +
        '</div><p>إذا حسّيت بتقطيع اختر "خفيف" أو "ثابت". المستوى الجديد يكتمل بعد إعادة فتح التطبيق.</p></div>';
    }
    panel(doc, 'الثيمات والمظهر', html(), function (p) {
      function redraw() { p.querySelector('.afp-s').innerHTML = html(); wire(); }
      function wire() {
        on(p, '.aft-card', function (b) { setTheme(b.dataset.t); redraw(); });
        on(p, '#afg button', function (b) { setGfx(b.dataset.g); redraw(); });
      }
      wire();
    });
  }

  /* --- إعدادات المحادثة (عامة لكل المحادثات) --- */
  function chatPage(doc) {
    var key = 'af_cp_g_' + me().uid;
    var def = { bub: '#cfe8ff', tx: '#0b3a5b', bg: 'linear-gradient(180deg,#f4faff,#e3f1ff)', fs: 15, ff: 'IBM Plex Sans Arabic', fw: '400' };
    var P = Object.assign({}, def, J(key, {}));
    function save() { s(key, JSON.stringify(P)); }
    function swatches(k, arr) { return '<div class="afdots">' + arr.map(function (c) { return '<button data-k="' + k + '" data-c="' + esc(c) + '" class="' + (P[k] === c ? 'on' : '') + '" style="background:' + esc(c) + '"></button>'; }).join('') + '</div>'; }
    function html() {
      return '<div class="afpre" id="afpre" style="background:' + esc(P.bg) + ';font-family:\'' + esc(P.ff) + '\',sans-serif;font-weight:' + P.fw + ';--fs:' + P.fs + 'px">' +
        '<div class="m o">السلام عليكم، كيف الحال؟</div><div class="m me" style="background:' + esc(P.bub) + ';color:' + esc(P.tx) + '">الحمد لله، تمام أستاذ</div></div>' +
        '<div class="afp-c"><h3>أنماط جاهزة</h3><div class="afs" id="afps">' + PRESETS.map(function (x, i) { return '<button data-i="' + i + '" style="background:' + x[1] + ';color:' + x[2] + '">' + x[0] + '</button>'; }).join('') + '</div></div>' +
        '<div class="afp-c"><h3>نوع الخط</h3><div class="afs fonts" id="afff">' + FONTS.map(function (f) { return '<button data-f="' + esc(f[0]) + '" class="' + (P.ff === f[0] ? 'on' : '') + '" style="font-family:\'' + esc(f[0]) + '\',sans-serif">' + f[1] + '</button>'; }).join('') + '</div></div>' +
        '<div class="afp-c"><h3>لون الفقاعة</h3>' + swatches('bub', ['#cfe8ff', '#d3f5e3', '#ffdbe6', '#e6dcff', '#ffe3cf', '#f6f0b8', '#2f6fe0', '#1fa56b', '#e9eef6', '#3b82f6', '#8b5cf6', '#22c55e']) +
        '<div class="aft-row" style="margin-top:10px;align-items:center"><span>لون مخصص</span><input type="color" id="afcb" value="' + (/^#[0-9a-f]{6}$/i.test(P.bub) ? P.bub : '#cfe8ff') + '"></div></div>' +
        '<div class="afp-c"><h3>لون الخط</h3>' + swatches('tx', ['#0b3a5b', '#16213a', '#0e4a2f', '#6a1030', '#33176b', '#6b3210', '#ffffff', '#ffe27a', '#9de0ff']) +
        '<div class="aft-row" style="margin-top:10px;align-items:center"><span>لون مخصص</span><input type="color" id="afct" value="' + (/^#[0-9a-f]{6}$/i.test(P.tx) ? P.tx : '#0b3a5b') + '"></div></div>' +
        '<div class="afp-c"><h3>خلفية المحادثة</h3>' + swatches('bg', ['#ffffff', 'linear-gradient(180deg,#f4faff,#e3f1ff)', 'linear-gradient(180deg,#f4fff9,#e0f7ec)', 'linear-gradient(180deg,#fff6f9,#ffe7ef)', 'linear-gradient(180deg,#faf7ff,#ede5ff)', 'linear-gradient(180deg,#fffaf5,#ffecdc)', '#0f172a', '#0f0f10', '#1a1030', '#0b1a12']) + '</div>' +
        '<div class="afp-c"><h3>حجم وسمك الخط</h3><input class="afrange" type="range" id="afsz" min="13" max="26" value="' + P.fs + '"><div class="afs" id="afw" style="margin-top:10px"><button data-w="400"' + (P.fw === '400' ? ' class="on"' : '') + '>عادي</button><button data-w="700"' + (P.fw === '700' ? ' class="on"' : '') + ' style="font-weight:700">عريض</button></div></div>' +
        '<div class="afp-c"><button class="afbtn gray" id="afrs">إعادة الضبط للأصل</button><p>هذه الإعدادات تنطبق على كل محادثاتك. إذا خصّصت محادثة معينة من داخلها، تبقى هي الأقوى لتلك المحادثة.</p></div>';
    }
    panel(doc, 'إعدادات المحادثة', html(), function (p) {
      function redraw() { var sc = p.querySelector('.afp-s').scrollTop; p.querySelector('.afp-s').innerHTML = html(); p.querySelector('.afp-s').scrollTop = sc; wire(); }
      function wire() {
        on(p, '#afps button', function (b) { var x = PRESETS[+b.dataset.i]; P.bub = x[1]; P.tx = x[2]; P.bg = x[3]; save(); redraw(); });
        on(p, '#afff button', function (b) { P.ff = b.dataset.f; save(); redraw(); });
        on(p, '.afdots button', function (b) { P[b.dataset.k] = b.dataset.c; save(); redraw(); });
        on(p, '#afw button', function (b) { P.fw = b.dataset.w; save(); redraw(); });
        var sz = p.querySelector('#afsz'); if (sz) sz.oninput = function () { P.fs = +this.value; save(); var pv = p.querySelector('#afpre'); if (pv) pv.style.setProperty('--fs', P.fs + 'px'); };
        var cb = p.querySelector('#afcb'); if (cb) cb.onchange = function () { P.bub = this.value; save(); redraw(); };
        var ct = p.querySelector('#afct'); if (ct) ct.onchange = function () { P.tx = this.value; save(); redraw(); };
        var rs = p.querySelector('#afrs'); if (rs) rs.onclick = function () { P = Object.assign({}, def); try { LS.removeItem(key); } catch (e) {} redraw(); };
      }
      wire();
    });
  }

  /* --- الأمان والبصمة --- */
  function securityPage(doc) {
    function st() { try { return JSON.parse(A.bioState()); } catch (e) { return { available: false, enabled: false }; } }
    function html() {
      var b = st();
      return '<div class="afp-c"><div class="afsw"><div><b>قفل التطبيق بالبصمة</b><p>يطلب البصمة (أو رمز القفل) كل مرة تفتح التطبيق.</p></div>' +
        '<button class="aftog' + (b.enabled ? ' on' : '') + '" id="afbio" aria-label="تفعيل"' + (b.available ? '' : ' disabled style="opacity:.4"') + '></button></div>' +
        (b.available ? '' : '<div class="afmsg bad">البصمة غير متوفرة: تأكد أن جهازك فيه بصمة أو رمز قفل مفعّل من إعدادات النظام.</div>') +
        '<div class="afmsg" id="afbm"></div></div>' +
        '<div class="afp-c"><h3>ملاحظة</h3><p>أندرويد لا يعطي أي تطبيق بيانات البصمة نفسها، تبقى داخل شريحة الأمان بالجهاز. التطبيق يسأل النظام فقط: هل البصمة صحيحة؟</p></div>';
    }
    panel(doc, 'الأمان والبصمة', html(), function (p) {
      function redraw() { p.querySelector('.afp-s').innerHTML = html(); wire(); }
      window.__afBio = function (ok, msg) {
        var m = p.querySelector('#afbm'); if (!m) return;
        if (ok) { redraw(); var m2 = p.querySelector('#afbm'); if (m2) { m2.className = 'afmsg ok'; m2.textContent = msg || 'تم'; } }
        else { m.className = 'afmsg bad'; m.textContent = msg || 'ما تم التحقق'; }
      };
      function wire() {
        var t = p.querySelector('#afbio');
        if (t && !t.disabled) t.onclick = function () {
          var b = st();
          try { if (b.enabled) { A.setBio(false); redraw(); } else { var m = p.querySelector('#afbm'); if (m) { m.className = 'afmsg'; m.textContent = 'ضع إصبعك على الحساس...'; } A.setBio(true); } } catch (e) {}
        };
      }
      wire();
    });
  }

  /* ===================== إدراج الأزرار بقائمة الإعدادات ===================== */
  function injectEntries(doc) {
    doc.querySelectorAll('.sc').forEach(function (sc) {
      if (sc.getAttribute('data-afx')) return;
      var opts = [].slice.call(sc.querySelectorAll('.option'));
      if (!opts.some(function (b) { return /الملف الشخصي|صلاحية حسابي/.test(b.textContent); })) return;
      sc.setAttribute('data-afx', '1');
      var proto = opts[0];
      function add(label, fn) {
        var b = proto.cloneNode(true); b.removeAttribute('data-o'); b.removeAttribute('id');
        var t = b.querySelector('.opt-text'); if (t) t.textContent = label; else b.firstChild.textContent = label;
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(doc); });
        sc.appendChild(b);
      }
      add('🎨 الثيمات والمظهر', themePage);
      add('🔒 الأمان والبصمة', securityPage);
      // زر "إعدادات المحادثة" القديم يفتح الصفحة الجديدة
      opts.forEach(function (b) {
        if (/إعدادات المحادثة/.test(b.textContent)) {
          b.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); chatPage(doc); }, true);
        }
      });
    });
  }
  function watchDoc(d) {
    if (!d || !d.body || d.__afxw) return; d.__afxw = 1;
    var q = 0;
    new MutationObserver(function () { if (q) return; q = 1; (d.defaultView || window).requestAnimationFrame(function () { q = 0; injectEntries(d); }); }).observe(d.body, { childList: true, subtree: true });
    injectEntries(d);
  }
  function hookFrame(f) {
    function go() { try { var d = f.contentDocument; if (d && d.documentElement) { applyDoc(d); watchDoc(d); } } catch (e) {} }
    go(); f.addEventListener('load', go);
  }
  function boot() {
    applyAll(); watchDoc(document);
    document.querySelectorAll('iframe').forEach(hookFrame);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.tagName === 'IFRAME') hookFrame(n); else if (n.querySelectorAll) n.querySelectorAll('iframe').forEach(hookFrame); }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
    setInterval(function () { allDocs().forEach(function (d) { if (d.documentElement && d.documentElement.getAttribute('data-aft') !== THEME) applyDoc(d); watchDoc(d); }); }, 2500);
  }
  // نظهر الثيم من أول لحظة
  (function early() { var r = document.documentElement; r.setAttribute('data-aft', THEME); r.classList.toggle('af-lite', GFX === 'lite' || GFX === 'static'); var st = document.createElement('style'); st.id = 'af-x'; st.textContent = CSS; (document.head || r).appendChild(st); try { A.setBars(THEME === 'dark'); } catch (e) {} })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
