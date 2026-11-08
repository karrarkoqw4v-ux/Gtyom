/* إضافات تطبيق الفارابي للأندرويد: الثيمات والمظهر، إعدادات المحادثة، البصمة، تخفيف الرسوم، وتصميم المكالمة */
(function () {
  'use strict';
  var A = window.Android;
  if (!A) return;
  var LS = window.localStorage;
  function g(k, d) { try { var v = LS.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function s(k, v) { try { LS.setItem(k, v); } catch (e) {} }
  function J(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }

  var THEME = 'light'; try { LS.removeItem('af_theme'); } catch (e) {}             // light | dark
  if (g('af_gfx_mig20', '') !== '1') { s('af_gfx', 'auto'); s('af_gfx_mig20', '1'); }
  var GFX = g('af_gfx', 'auto');                  // auto (افتراضي) | static | lite | mid | full
  var TIER = { static: 0, lite: 1, mid: 2, full: 3 };
  var ORDER = ['static', 'lite', 'mid', 'full'];
  var AUTO = g('af_auto_lvl', 'lite'); if (ORDER.indexOf(AUTO) < 0) AUTO = 'lite';

  /* فحص مواصفات الجهاز لاختيار أفضل مستوى رسوميات من أول تشغيل (يبقى بعدها مراقب السلاسة يعدّل) */
  function specLevel() {
    try {
      var n = navigator, sc = 0, why = [];
      var cores = n.hardwareConcurrency || 4, mem = n.deviceMemory || 4;
      sc += cores >= 8 ? 3 : cores >= 6 ? 2 : cores >= 4 ? 1 : 0;
      sc += mem >= 8 ? 3 : mem >= 6 ? 2 : mem >= 4 ? 1 : 0;
      try {
        var cv = document.createElement('canvas'), gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
        if (gl) {
          var ext = gl.getExtension('WEBGL_debug_renderer_info'), r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
          if (/Adreno\s*(7|8)\d\d|Mali-G(7[0-9]|[89]\d)|Apple|Xclipse|Immortalis/i.test(r)) sc += 3;
          else if (/Adreno\s*6[3-9]\d|Mali-G(5[2-9]|6\d)|PowerVR.*(GE8|GM9)/i.test(r)) sc += 2;
          else if (/Adreno\s*[45]\d\d|Adreno\s*6[0-2]\d|Mali-(T|G[0-4]\d|G5[01])|PowerVR|SwiftShader|llvmpipe/i.test(r)) sc += 0;
          else sc += 1;
        }
      } catch (e) { }
      try { var di = JSON.parse(A.deviceInfo()); if (di && di.os && parseFloat(di.os) && parseFloat(di.os) < 9) sc -= 2; } catch (e) { }
      try { var c = n.connection; if (c && c.saveData) sc -= 3; if (matchMedia('(prefers-reduced-motion: reduce)').matches) sc -= 4; } catch (e) { }
      return sc >= 8 ? 'full' : sc >= 6 ? 'mid' : sc >= 3 ? 'lite' : 'static';
    } catch (e) { return 'lite'; }
  }
  if (g('af_auto_spec21', '') !== '1') { s('af_auto_spec21', '1'); AUTO = 'lite'; s('af_auto_lvl', 'lite'); }
  function lvl() { return GFX === 'auto' ? AUTO : GFX; }

  // نثبّت مستوى الرسوميات قبل ما يقرأه محرك الأداء
  function pinTier() { var L = lvl(); s('af_tier_v1', JSON.stringify({ t: TIER[L] == null ? 1 : TIER[L], ts: Date.now() })); }
  pinTier();

  var FONTS = [
    ['Noto Naskh Arabic', 'الافتراضي (نسخ)'], ['IBM Plex Sans Arabic', 'بلكس'], ['Tajawal', 'تجوال'], ['Almarai', 'المرعي'], ['Amiri', 'أميري'],
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
    /* --- بدون ضبابية زجاجية (أثقل شي على الكرت)، وبدون زخارف بالمستوى الخفيف --- */
    'html.af-nofx *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    'html.af-nofx .card,html.af-nofx .nav,html.af-nofx .drawer,html.af-nofx .sheet{background:rgba(255,255,255,.94)!important}',
    'html.af-lite .a3-orb,html.af-lite .a3-sp,html.af-lite .a3-bv,html.af-lite .a3-sw,html.af-lite .a3-dl,html.af-lite .a3-fl,html.af-lite .a3-cd{display:none!important}',
    'html.af-lite .a3 *,html.af-lite .a3 *:before,html.af-lite .a3 *:after{animation:none!important}',
    'html.af-lite .card{animation:none!important}',

    /* صفحات الإضافات تبقى بألوان ثابتة فاتحة */
    'html{--afp-bg:#f4f8ff;--afp-card:#fff;--afp-line:#e3eaf5;--afp-tx:#14213d;--afp-mut:#5b6b86}',

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
    '#ch[data-afcp] .r .bb,#ch[data-afcp] .r .bb *{font-family:var(--ff,sans-serif),sans-serif;font-weight:var(--fw,400)}',

    /* --- صفحة المدرسة: منشورات أخف بدون إطارات ثقيلة، والوصف يظهر كامل --- */
    'html .sp-p{box-shadow:0 2px 10px rgba(40,90,150,.08)!important;border:0!important}',
    'html .sp-pc{width:100%!important;max-width:none!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:18px 16px!important;color:#14213d!important}',
    'html .sp-tx{background:#f4f8fd!important;color:#14213d!important}',
    'html .sp-d,html .sp-cap{max-height:none!important;overflow:visible!important;-webkit-line-clamp:unset!important;white-space:pre-wrap;line-height:1.95}',

    '.afck{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:8px 0;font-size:14px;line-height:2}',
    '.afck input[type=checkbox]{width:20px;height:20px}',
    /* --- مساعد الدعم والإشعارات المهمة --- */
    '.afsup{display:grid;gap:10px;padding:10px 12px 18px;direction:rtl}',
    '.afsup-b{background:#fff;color:#16213a;border-radius:18px;border-top-right-radius:4px;padding:12px 14px;font-size:15px;line-height:1.8;box-shadow:0 1px 6px rgba(0,0,0,.18);max-width:88%}',
    '.afsup-o{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.afsup-o button{border:0;border-radius:16px;min-height:62px;padding:8px 10px;background:linear-gradient(135deg,#0aa6f5,#2f7fb0);color:#fff;font:inherit;font-size:13.5px;font-weight:600;line-height:1.6;box-shadow:0 3px 10px rgba(10,166,245,.3);cursor:pointer}',
    '.afsup-o button:active{transform:scale(.96)}',
    '.afin{width:100%;box-sizing:border-box;border:1.5px solid var(--afp-line,#dbe3ef);border-radius:14px;padding:11px 13px;font:inherit;font-size:15px;background:#fff;color:#14213d;margin:0 0 10px;outline:0;direction:rtl}',
    '.afin:focus{border-color:#0aa6f5}',
    'textarea.afin{resize:vertical;min-height:110px;line-height:1.8}',
    '.afimp{display:grid;gap:3px;width:100%;text-align:right;border:1px solid var(--afp-line,#dfe8f5);background:rgba(127,140,160,.08);border-radius:16px;padding:12px 14px;margin:0 0 9px;color:inherit;font:inherit;cursor:pointer}',
    '.afimp b{font-size:15.5px}.afimp span{font-size:13px;opacity:.8;line-height:1.7}.afimp small{font-size:11.5px;opacity:.6}',
    '.afimp-body{white-space:pre-wrap;line-height:1.95;font-size:15.5px;margin:10px 0}',
    '.afimp-m{display:block;width:100%;max-height:360px;object-fit:contain;border-radius:14px;margin:8px 0;background:#000}',

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
  var MENUCSS = '#drawer .option:nth-child(2),#drawer .option:nth-child(3),#drawer .option:nth-child(4),#drawer .option[data-id=afupd]{background:linear-gradient(135deg,#1768bd,#0aa6f5)!important;border-color:transparent!important;color:#fff!important;box-shadow:0 6px 16px rgba(23,104,189,.3)!important}#drawer .option:nth-child(2) *,#drawer .option:nth-child(3) *,#drawer .option:nth-child(4) *,#drawer .option[data-id=afupd] *{color:#fff!important;stroke:#fff}#drawer .option:nth-child(2) .opt-ico,#drawer .option:nth-child(3) .opt-ico,#drawer .option:nth-child(4) .opt-ico,#drawer .option[data-id=afupd] .opt-ico{background:rgba(255,255,255,.22)!important}';
  CSS += MENUCSS;

  window.AFX_HEAD = function () { return '<style id="af-x">' + CSS + '</style>'; };

  /* ===================== تطبيق الثيم على كل المستندات ===================== */
  var docs = [];
  function applyDoc(d) {
    try {
      var r = d.documentElement; if (!r) return;
      r.setAttribute('data-aft', THEME);
      r.classList.toggle('af-lite', lvl() === 'lite' || lvl() === 'static');
      r.classList.toggle('af-nofx', lvl() !== 'full');
      try { r.setAttribute('data-af-tier', String(TIER[lvl()])); } catch (e) {}
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
    try { A.setBars(false); } catch (e) {}
    try { var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', '#ffffff'); } catch (e) {}
  }
  function setTheme(t) { THEME = t; s('af_theme', t); applyAll(); }
  function setGfx(x) { GFX = x; s('af_gfx', x); pinTier(); applyAll(); }

  /* ===================== بناء الصفحات ===================== */
  function me() {
    var a = J('alfarabi_sess_acc', null);
    return a ? { uid: String(a.createdAt || a.name), role: a.role } : { uid: 'guest', role: 'guest' };
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function panel(doc, title, html, bind, stack) {
    var old = doc.querySelector('.afp'); if (old && !stack) old.remove();
    var p = doc.createElement('div'); p.className = 'afp';
    p.innerHTML = '<div class="afp-h"><button class="afp-b" aria-label="رجوع">›</button><h2>' + esc(title) + '</h2></div><div class="afp-s">' + html + '</div>';
    doc.body.appendChild(p);
    p.querySelector('.afp-b').onclick = function () { p.remove(); };
    if (bind) bind(p);
    return p;
  }
  function on(root, sel, fn) { root.querySelectorAll(sel).forEach(function (n) { n.addEventListener('click', function (e) { fn(n, e); }); }); }

  /* --- المظهر والأداء --- */
  function themePage(doc) {
    function html() {
      return '<div class="afp-c"><h3>الرسوميات والأداء</h3><div class="afs" id="afg">' +
        [['auto', 'تلقائي (موصى به)'], ['static', 'ثابت (الأخف)'], ['lite', 'خفيف'], ['mid', 'متوازن'], ['full', 'كامل']].map(function (x) { return '<button data-g="' + x[0] + '"' + (GFX === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') +
        '</div><p>«تلقائي» يقيس سلاسة جوالك ويرفع الرسوميات إذا الجهاز قوي ويخفّضها فوراً إذا حسّ بتقطيع. إذا تحب تثبّت مستوى معيّن اختره بنفسك.</p></div>' +
        '<div class="afp-c"><h3>ألوان المحادثات</h3><p>المحادثات داكنة افتراضياً، وتقدر تغيّر ألوانها وخطوطها من «إعدادات المحادثة».</p></div>';
    }
    panel(doc, 'المظهر والأداء', html(), function (p) {
      function wire() { on(p, '#afg button', function (b) { setGfx(b.dataset.g); p.querySelector('.afp-s').innerHTML = html(); wire(); }); }
      wire();
    });
  }

  /* --- إعدادات المحادثة (عامة لكل المحادثات) --- */
  function chatPage(doc) {
    var key = 'af_cp_g_' + me().uid;
    var def = { bub: '#cfe8ff', tx: '#0b3a5b', bg: 'linear-gradient(180deg,#f4faff,#e3f1ff)', fs: 15, ff: 'Noto Naskh Arabic', fw: '400' };
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


  /* ===================== مساعد الدعم بخيارات ===================== */
  var SUP = [
    ['مشكلة في تسجيل الدخول', 'جرّب هالخطوات بالترتيب:\n1) تأكد من الإنترنت.\n2) من أول شاشة اختر القسم الصحيح (المرحلة المتوسطة أو الإعدادية) ثم نوع حسابك (طالب / ولي أمر / مدرس).\n3) اكتب اسمك الثلاثي مثل ما هو مسجل بالمدرسة وبدون مسافات زايدة.\n4) اكتب المعرّف وكلمة السر اللي زودتك بيها المدرسة.\n5) إذا ما تعرف معرّفك اضغط «معرفة حسابي» من أول الشاشة.'],
    ['كيف أسجّل حساب جديد؟', 'خطوات إنشاء الحساب:\n1) افتح التطبيق واضغط «ابدأ».\n2) اختر القسم (المتوسطة أو الإعدادية) ثم اختر «الطالب» أو «ولي الأمر» أو «المدرس».\n3) اكتب بياناتك المطلوبة واضغط «التالي».\n4) اختر طريقة إنشاء الحساب: بريد إلكتروني وكلمة سر، أو Google.\n5) اكتب بريدك وكلمة سر أكثر من 6 خانات ثم اضغط «إنشاء الحساب».'],
    ['خطوات الدخول كطالب', 'تسجيل دخول الطالب:\n1) اضغط «ابدأ» ثم اختر القسم الخاص بمرحلتك.\n2) اختر «الطالب».\n3) اكتب اسمك الثلاثي ومعرّف الطالب وكلمة السر، واختر صفك.\n4) اضغط «التالي» وسيفتح حسابك مباشرة.'],
    ['خطوات الدخول كولي أمر', 'تسجيل دخول ولي الأمر:\n1) اضغط «ابدأ» ثم اختر القسم.\n2) اختر «ولي الأمر».\n3) اكتب اسمك واسم ابنك الثلاثي ورقم هاتفك، واختر صف الابن.\n4) اضغط «التالي» لتفتح حسابك وتتابع درجات وغيابات ابنك.'],
    ['خطوات الدخول كمدرس', 'تسجيل دخول المدرس:\n1) اضغط «ابدأ» ثم اختر القسم.\n2) اختر «المدرس».\n3) اكتب اسمك الثلاثي ومعرّف حساب المدرس، واختر الصف والمادة.\n4) اضغط «التالي». إذا ما عندك معرّف تواصل مع الإدارة.'],
    ['نسيت المعرّف أو كلمة السر', 'من أول شاشة اضغط «معرفة حسابي»، ثم اكتب اسمك الثلاثي ورقم حسابك (مثل S266) أو امسح الباركود، واضغط «عرض معلومات حسابي». تظهر لك بياناتك. وإذا ما نفع، اختر «التواصل مع الإدارة».'],
    ['الدرجات والغيابات', 'من الصفحة الرئيسية افتح «درجات الامتحانات» أو «غيابات الطلبة». وتوصلك إشعارات مباشرة لما تنزل درجة أو يُسجَّل غياب.'],
    ['التحاضير والإعلانات', 'من الصفحة الرئيسية افتح «تحاضير الدروس» أو «الإعلانات المدرسية». وكل تحضير أو إعلان جديد يوصلك إشعار فيه العنوان والتفاصيل.'],
    ['معلومات عن طالب', 'اكتب اسم الطالب الثلاثي هنا وأعرض لك: الاسم والصف ودروس اليوم. وبعدها اكتب معرّف حسابه (مثل S266) لأعرض مستواه ودرجاته وغياباته وتقييم المدرسين ومدة استخدامه للتطبيق.'],
    ['التواصل مع الإدارة', 'اكتب رسالتك هنا بالتفصيل (بدون كلمة السر) وتوصل للإدارة وتردّ عليك بنفس المحادثة. وتقدر تتواصل أيضاً عن طريق زر «الدعم» من أول الشاشة.']
  ];
  window.AF_SUP = SUP;
  var GN5 = { 1: 'الأول متوسط', 2: 'الثاني متوسط', 3: 'الثالث متوسط', 4: 'الرابع العلمي', 5: 'الخامس العلمي' };
  var EVL = { 5: 'ممتاز', 4: 'جيد جداً', 3: 'جيد', 2: 'متوسط', 1: 'ضعيف' };
  var usageCache = {};
  function nrm(t) { return String(t || '').replace(/[\sً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase(); }
  function sameN(a, b) { var x = nrm(a), y = nrm(b); return x.length > 5 && y.length > 5 && (x === y || x.indexOf(y) > -1 || y.indexOf(x) > -1); }
  function students() {
    var roster = (J('alfarabi_school_v1', {}).students || []).filter(function (x) { return x && x.name; });
    return roster;
  }
  function pct(v) { var m = String(v || '').match(/(\d+(?:\.\d+)?)\s*[\/من]\s*(\d+(?:\.\d+)?)/); if (m && +m[2] > 0) return +m[1] / +m[2] * 100; var n = parseFloat(v); return isNaN(n) ? null : (n <= 100 ? n : null); }
  function accOfName(name) { return ((J('alfarabi_db_v1', { accounts: [] }).accounts) || []).filter(function (a) { return a.role === 'student' && sameN(a.name, name); })[0]; }
  function fetchUsage(name) {
    var a = accOfName(name); if (!a || !window.FBBASE) return;
    var uid = String(a.createdAt || a.name);
    fetch(window.FBBASE + '/usage/a' + uid.replace(/[.#$\[\]\/]/g, '_') + '.json').then(function (r) { return r.json(); }).then(function (d) { usageCache[nrm(name)] = d || {}; }).catch(function () {});
  }
  function usageText(name) {
    var d = usageCache[nrm(name)]; if (!d) return 'جاري حسابها، اكتب المعرّف مرة ثانية بعد لحظات';
    var days = Object.keys(d), tot = 0, today = 0, week = 0, now = new Date(), t0 = ymd(now), cut = Date.now() - 7 * 864e5;
    days.forEach(function (k) { var sec = +d[k] || 0; tot += sec; if (k === t0) today = sec; var y = +k.slice(0, 4), m = +k.slice(4, 6) - 1, dd = +k.slice(6, 8); if (new Date(y, m, dd).getTime() >= cut) week += sec; });
    if (!tot) return 'لا توجد بيانات استخدام بعد';
    function f(sec) { var m = Math.round(sec / 60); return m < 60 ? m + ' دقيقة' : Math.floor(m / 60) + ' ساعة و' + (m % 60) + ' دقيقة'; }
    return 'اليوم ' + f(today) + ' • آخر 7 أيام ' + f(week) + ' • المجموع ' + f(tot);
  }
  function ymd(d) { return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function todayLessons(grade) {
    var D = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], w = new Date().getDay(); if (w > 4) return 'لا توجد دروس اليوم (عطلة)';
    var sc = (J('alfarabi_school_v1', {}).schedule || {})[grade], arr = sc && sc.days && sc.days[D[w]];
    return Array.isArray(arr) && arr.length ? arr.join('، ') : 'غير محدد';
  }
  var lastStu = null;
  function basicStudent(st) {
    lastStu = st; fetchUsage(st.name);
    return '👤 الطالب: ' + st.name + '\n🎓 الصف: ' + (GN5[st.grade] || st.grade || '—') + '\n📚 دروس اليوم: ' + todayLessons(st.grade) +
      '\n\nلعرض مستوى الطالب والدرجات والغيابات وتقييم المدرسين ومدة استخدامه للتطبيق، اكتب معرّف حسابه (مثل S266).';
  }
  function fullStudent(st) {
    var R = J('alfarabi_rec_v1', []) || [], g = R.filter(function (r) { return r && r.k === 'g' && sameN(r.n, st.name); }), a = R.filter(function (r) { return r && r.k === 'a' && sameN(r.n, st.name); }), ev = R.filter(function (r) { return r && r.k === 'ev' && sameN(r.n, st.name); });
    var ps = g.map(function (r) { return pct(r.v); }).filter(function (x) { return x != null; }), avg = ps.length ? ps.reduce(function (x, y) { return x + y; }, 0) / ps.length : null;
    var lvl = avg == null ? 'لا توجد درجات بعد' : (avg >= 90 ? 'ممتاز' : avg >= 80 ? 'جيد جداً' : avg >= 70 ? 'جيد' : avg >= 60 ? 'متوسط' : 'ضعيف') + ' (' + Math.round(avg) + '%)';
    fetchUsage(st.name);
    return '✅ تم التحقق من المعرّف\n👤 الطالب: ' + st.name + '\n🎓 الصف: ' + (GN5[st.grade] || '—') + '\n📊 مستوى الطالب: ' + lvl +
      '\n📝 الدرجات: ' + (g.length ? g.slice(0, 6).map(function (r) { return (r.s || 'مادة') + ' ' + r.v; }).join(' • ') : 'لا توجد') +
      '\n🚫 الغيابات: ' + (a.length ? a.length + ' (آخرها ' + (a[0].d || '') + ')' : 'لا توجد') +
      '\n⭐ تقييم المدرسين: ' + (ev.length ? ev.slice(0, 6).map(function (r) { return (r.s || 'مادة') + ': ' + (EVL[r.lv] || r.lv) + (r.by ? ' (' + r.by + ')' : ''); }).join(' • ') : 'لا يوجد') +
      '\n📚 دروس اليوم: ' + todayLessons(st.grade) + '\n⏱ استخدام التطبيق: ' + usageText(st.name);
  }
  window.afSupReply = function (msg) {
    var t = String(msg || '').trim();
    for (var i = 0; i < SUP.length; i++) if (SUP[i][0] === t) return SUP[i][1];
    // معرّف حساب (مثل S266): يكشف التفاصيل الكاملة
    var idm = t.match(/^[A-Za-z]{0,2}\s?(\d{2,6})$/);
    if (idm) {
      var digits = String(idm[1]).replace(/^0+/, ''), st = students().filter(function (x) { return String(x.accountId || '').replace(/\D/g, '').replace(/^0+/, '') === digits; })[0];
      if (st) return fullStudent(st);
      return 'ما لقيت طالب بهذا المعرّف. تأكد منه واكتبه مثل S266.';
    }
    // اسم طالب
    if (t.split(/\s+/).length >= 2) { var found = students().filter(function (x) { return sameN(x.name, t); })[0]; if (found) return basicStudent(found); }
    var l = t.toLowerCase();
    if (/نسيت|كلمة السر|كلمه السر|المعرف|المعرّف/.test(l)) return SUP[5][1];
    if (/تسجيل|دخول|login|حساب/.test(l)) return SUP[0][1];
    if (/درج|غياب/.test(l)) return SUP[6][1];
    if (/تحضير|اعلان|إعلان|درس/.test(l)) return SUP[7][1];
    return 'تفضّل، اختر من الخيارات اللي تحت، أو اكتب اسم الطالب الثلاثي لأعرض معلوماته:';
  };
  function supTick(d) {
    try {
      var ch = d.getElementById('ch'), cl = d.getElementById('cl');
      var old = cl && cl.querySelector('.afsup');
      var gk = ch ? (ch.getAttribute('data-g') || '') : '';
      var on = ch && ch.classList.contains('on') && gk.indexOf('dsup_') === 0 && !(window.CUR && window.CUR.role === 'admin') && g('alfarabi_session', '') !== 'admin';
      if (!on || !cl) { if (old) old.remove(); return; }
      var arr = J('alfarabi_chat_v2', {})[gk] || [], last = arr.filter(function (x) { return x && !x.c; }).pop();
      if (last && last.r !== 'assistant' && String(last.r) !== 'guest' && String(last.u) !== me().uid && last.r) { if (old) old.remove(); return; } // رد بشري: نخفي الخيارات
      if (old) return;
      var box = d.createElement('div'); box.className = 'afsup'; box.setAttribute('dir', 'rtl');
      var hello = !arr.length ? '<div class="afsup-b">مرحباً بك في مساعد الدعم لثانوية الفارابي 👋<br>اختر من الخيارات وأنا أساعدك فوراً.</div>' : '';
      box.innerHTML = hello + '<div class="afsup-o">' + SUP.map(function (x, i) { return '<button type="button" data-i="' + i + '">' + esc(x[0]) + '</button>'; }).join('') + '</div>';
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-i]'); if (!b) return;
        var ci = d.getElementById('ci'), cs = d.getElementById('cs'); if (!ci || !cs) return;
        ci.textContent = SUP[+b.dataset.i][0];
        try { ci.dispatchEvent(new (d.defaultView.Event)('input', { bubbles: true })); } catch (x) {}
        cs.click();
      });
      cl.appendChild(box); cl.scrollTop = cl.scrollHeight;
    } catch (e) {}
  }

  /* ===================== الإشعارات المهمة ===================== */
  function roleInfo() {
    if (g('alfarabi_session', '') === 'admin') return { role: 'admin', name: 'الإدارة', uid: 'admin' };
    var a = J('alfarabi_sess_acc', null);
    return a ? { role: a.role, name: a.name, uid: String(a.createdAt || a.name) } : { role: 'guest', name: '', uid: '' };
  }
  function impList() { return (J('alfarabi_rec_v1', []) || []).filter(function (r) { return r && r.k === 'imp' && !r.ed; }).sort(function (a, b) { return b.ts - a.ts; }); }
  function when(ts) { try { return new Date(ts).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }
  function canEditImp(r) { var R = roleInfo(); return R.role === 'admin' || (R.uid && String(r.uid) === R.uid); }
  /* تعديل إشعار مهم: يتحدث الأصل لكل الأجهزة + يُرسل إشعار «تعديل» للطلاب (سجل مخفي ed) */
  function editImp(doc, r) {
    var w = doc.defaultView || window, t = w.prompt('عنوان الإشعار', r.title || ''); if (t === null) return;
    var b = w.prompt('نص الإشعار', r.body || ''); if (b === null) return;
    t = t.trim(); b = b.trim(); if (!t) return;
    try {
      window.recSet(r.id, 'title', t); window.recSet(r.id, 'body', b); window.recSet(r.id, 'edited', Date.now());
      var R = roleInfo();
      window.addRec({ id: Date.now(), k: 'imp', ed: 1, upd: r.id, ts: Date.now(), title: 'تعديل: ' + t, body: b, from: R.name, role: R.role, uid: R.uid });
    } catch (e) { try { w.alert('تعذّر حفظ التعديل'); } catch (x) {} return; }
    try { var m = doc.querySelector('.afp-s'); if (m) { var nr = impList().filter(function (x) { return x.id === r.id; })[0]; if (nr) impDetail(doc, nr); } } catch (e) {}
  }
  function impCard(r) {
    return '<button class="afimp" data-id="' + r.id + '"><b>' + esc(r.title || 'إشعار مهم') + '</b><span>' + esc(String(r.body || '').slice(0, 90)) + '</span><small>' + esc(r.from || '') + ' · ' + when(r.ts) + (r.img ? ' · 📷' : '') + (r.vid ? ' · 🎬' : '') + '</small></button>';
  }
  function impDetail(doc, r) {
    panel(doc, 'إشعار مهم',
      '<div class="afp-c"><h3 style="font-size:18px">' + esc(r.title || 'إشعار مهم') + '</h3><p style="margin-top:2px">من: ' + esc(r.from || 'الإدارة') + ' · ' + when(r.ts) + '</p>' +
      (r.body ? '<div class="afimp-body">' + esc(r.body) + '</div>' : '') +
      (r.img ? '<img class="afimp-m" src="' + r.img + '" alt="">' : '') +
      (r.vid ? '<video class="afimp-m" src="' + r.vid + '" controls playsinline></video>' : '') +
      (r.hd ? '<button class="afbtn" data-hd="' + esc(r.hd) + '" style="width:100%;margin-top:12px">📖 افتح الملزمة</button>' : '') +
      (canEditImp(r) ? '<button class="afbtn gray" data-ed="1" style="width:100%;margin-top:12px">تعديل الإشعار</button>' : '') + '</div>',
      function (pp) { var b = pp.querySelector('[data-hd]'); if (b) b.onclick = function () { if (window.afOpenHandout) window.afOpenHandout(b.getAttribute('data-hd'), doc); };
        var eb = pp.querySelector('[data-ed]'); if (eb) eb.onclick = function () { editImp(doc, r); }; });
  }
  function shrinkImg(file, max, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.78));
      };
      im.onerror = function () { cb(''); }; im.src = fr.result;
    };
    fr.onerror = function () { cb(''); }; fr.readAsDataURL(file);
  }
  function importantPage(doc) {
    var R = roleInfo(), can = R.role === 'admin' || R.role === 'teacher', att = { img: '', vid: '' };
    function html() {
      var list = impList();
      return (can ? '<div class="afp-c"><h3>إرسال إشعار مهم للجميع</h3>' +
        '<input id="afit" class="afin" maxlength="90" placeholder="عنوان الإشعار">' +
        '<textarea id="afib" class="afin" rows="5" placeholder="اكتب هنا الموضوع أو التفاصيل..."></textarea>' +
        '<div class="aft-row" style="margin:8px 0"><label class="afbtn gray" style="flex:1;text-align:center">📎 صورة أو فيديو<input id="afif" type="file" accept="image/*,video/*" style="display:none"></label></div>' +
        '<div id="afia"></div>' +
        '<button class="afbtn" id="afis" style="width:100%">إرسال للجميع (طلاب، مدرسين، أولياء أمور)</button><div class="afmsg" id="afim"></div></div>' : '') +
        '<div class="afp-c"><h3>الإشعارات المهمة' + (list.length ? ' (' + list.length + ')' : '') + '</h3>' +
        (list.length ? list.map(impCard).join('') : '<p>ما وصلت إشعارات مهمة لحد الآن.</p>') + '</div>';
    }
    panel(doc, 'الإشعارات المهمة', html(), function (p) {
      function wire() {
        on(p, '.afimp', function (b) { var r = impList().filter(function (x) { return String(x.id) === b.dataset.id; })[0]; if (r) impDetail(doc, r); });
        var f = p.querySelector('#afif');
        if (f) f.onchange = function () {
          var file = f.files && f.files[0], m = p.querySelector('#afim'), a = p.querySelector('#afia'); if (!file) return;
          att = { img: '', vid: '' }; m.className = 'afmsg'; m.textContent = 'جاري تجهيز الملف...';
          if (file.type.indexOf('image/') === 0) shrinkImg(file, 1280, function (d) { if (!d) { m.className = 'afmsg bad'; m.textContent = 'تعذّر قراءة الصورة'; return; } att.img = d; a.innerHTML = '<img class="afimp-m" src="' + d + '">'; m.textContent = ''; });
          else if (file.type.indexOf('video/') === 0) {
            if (file.size > 8 * 1024 * 1024) { m.className = 'afmsg bad'; m.textContent = 'الفيديو أكبر من 8 ميغا. قصّره أو ارفعه من صفحة المدرسة.'; return; }
            var fr = new FileReader(); fr.onload = function () { att.vid = fr.result; a.innerHTML = '<video class="afimp-m" src="' + fr.result + '" controls playsinline></video>'; m.textContent = ''; }; fr.readAsDataURL(file);
          }
        };
        var sd = p.querySelector('#afis');
        if (sd) sd.onclick = function () {
          var t = p.querySelector('#afit').value.trim(), b = p.querySelector('#afib').value.trim(), m = p.querySelector('#afim');
          if (!t) { m.className = 'afmsg bad'; m.textContent = 'اكتب عنوان الإشعار'; return; }
          if (!b && !att.img && !att.vid) { m.className = 'afmsg bad'; m.textContent = 'اكتب الموضوع أو أرفق صورة/فيديو'; return; }
          var r = { id: Date.now(), k: 'imp', ts: Date.now(), title: t, body: b, from: R.name, role: R.role, uid: R.uid };
          if (att.img) r.img = att.img; if (att.vid) r.vid = att.vid;
          try { window.addRec(r); } catch (e) { m.className = 'afmsg bad'; m.textContent = 'تعذّر الإرسال: الملف كبير على مساحة التخزين'; return; }
          att = { img: '', vid: '' }; m.className = 'afmsg ok'; m.textContent = 'تم الإرسال لكل الأجهزة ✓';
          setTimeout(function () { p.querySelector('.afp-s').innerHTML = html(); wire(); }, 700);
        };
      }
      wire();
    });
  }
  window.afOpenImportant = function (id) {
    var key = String(id || '').replace(/^imp:/, '').replace(/^r/, '');
    var all = (J('alfarabi_rec_v1', []) || []).filter(function (x) { return x && x.k === 'imp'; }), r = all.filter(function (x) { return String(x.id) === key; })[0]; if (r && r.ed && r.upd) r = all.filter(function (x) { return x.id === r.upd; })[0] || r; if (!r) return false;
    var f = document.getElementById('adminFrame'), d = (f && f.style.display === 'block' && f.contentDocument && f.contentDocument.body) ? f.contentDocument : document;
    impDetail(d, r); return true;
  };
  setInterval(function () { try { var p = A.pendingOpen && A.pendingOpen(); if (p) window.afOpenImportant(p); } catch (e) {} }, 1200);


  /* ===================== تنظيف البيانات (للإدارة فقط) ===================== */
  /* تنظيف قائمة الحسابات المسجلة فقط: قوائم الطلاب بالمدرسة، المدرسين المضافين، الملازم، الدرجات، المحادثات ومعلومات المدرسة ما تنلمس.
     قبل التنظيف يتنزل ملف بكل البيانات تلقائياً، وتنحفظ نسخة بالخادم (إذا الخادم يسمح) ويمكن استرجاعها. الطالب يدخل باسمه وينفتح له حساب جديد تلقائياً. */
  function cleanupPage(doc) {
    function accs() { return (J('alfarabi_db_v1', { accounts: [] }).accounts) || []; }
    function counts() {
      var a = accs(), sc = J('alfarabi_school_v1', {});
      function by(r) { return a.filter(function (x) { return x.role === r; }).length; }
      return { st: by('student'), te: by('teacher'), pa: by('parent'), fol: a.filter(function (x) { return !x.kicked; }).length, lists: ((sc && sc.students) || []).length, tl: ((sc && sc.teachers) || []).length };
    }
    function html() {
      var c = counts();
      return '<div class="afp-c"><h3>الموجود حالياً</h3>' +
        '<p>الطلاب المسجلون بالتطبيق: <b>' + c.st + '</b> • أولياء الأمور: <b>' + c.pa + '</b> • المدرسون المسجلون: <b>' + c.te + '</b></p>' +
        '<p>متابعو صفحة المدرسة: <b>' + c.fol + '</b></p>' +
        '<p>الطلاب داخل قوائم المدرسة: <b>' + c.lists + '</b> • المدرسون المضافون: <b>' + c.tl + '</b> <small>(هذي ما تنمسح أبداً)</small></p></div>' +
        '<div class="afp-c"><h3>1) تصدير كل البيانات</h3><p>ينزل ملف JSON بكل البيانات وملف CSV بالحسابات المسجلة (يفتح بالإكسل).</p>' +
        '<button class="afbtn" id="cue" style="width:100%">📥 تصدير كل البيانات</button></div>' +
        '<div class="afp-c"><h3>2) تنظيف القائمة وبدء قائمة جديدة</h3>' +
        '<label class="afck"><input type="checkbox" id="cus" checked> حسابات الطلاب المسجلين</label>' +
        '<label class="afck"><input type="checkbox" id="cup" checked> حسابات أولياء الأمور</label>' +
        '<label class="afck"><input type="checkbox" id="cut"> حسابات المدرسين المسجلين</label>' +
        '<p style="margin-top:8px"><b>ما ينحذف:</b> قوائم الطلاب بالمدرسة، المدرسين المضافين، الملازم وملفاتها، الدرجات والغيابات، المحادثات، معلومات المدرسة، حساب الإدارة.</p>' +
        '<p>يبدأ العدّاد (المتابعين) من جديد، وكل طالب يدخل باسمه من القائمة وينفتح له حسابه الجديد وينحفظ تلقائياً.</p>' +
        '<button class="afbtn" id="cux" style="width:100%;background:linear-gradient(135deg,#ff8a3d,#e5541b)">🧹 تصدير وتنظيف وبدء قائمة جديدة</button>' +
        '<div class="afmsg" id="cum"></div><div class="hdpr" id="cupr" style="display:none;height:10px;border-radius:6px;background:#dbe5f4;overflow:hidden;margin:8px 0"><i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#0aa6f5,#12a15a);transition:width .2s"></i></div></div>' +
        '<div class="afp-c"><h3>استرجاع</h3><p>إذا ندمت ترجع آخر قائمة انحفظت بالخادم قبل التنظيف.</p><button class="afbtn gray" id="cur" style="width:100%">↩ استرجاع آخر قائمة</button><div class="afmsg" id="cum2"></div></div>';
    }
    function saveFile(name, text, mime) {
      return new Promise(function (res) {
        try {
          var fr = new FileReader();
          fr.onload = function () { try { var a = doc.createElement('a'); a.href = fr.result; a.download = name; doc.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 600); res(true); } catch (e) { res(false); } };
          fr.onerror = function () { res(false); };
          fr.readAsDataURL(new Blob([text], { type: mime }));
        } catch (e) { res(false); }
      });
    }
    function gj(path) {
      if (!window.FBBASE) return Promise.resolve(null);
      return fetch(window.FBBASE + path + '.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    function csvOf(list) {
      var cols = [['name', 'الاسم'], ['role', 'النوع'], ['grade', 'الصف'], ['subject', 'المادة'], ['child', 'اسم الابن'], ['phone', 'الهاتف'], ['email', 'المعرف'], ['createdAt', 'تاريخ التسجيل']];
      function q(v) { v = v == null ? '' : String(v); return '"' + v.replace(/"/g, '""') + '"'; }
      var rows = [cols.map(function (c) { return q(c[1]); }).join(',')];
      list.forEach(function (a) { rows.push(cols.map(function (c) { var v = a[c[0]]; if (c[0] === 'createdAt' && v) { try { v = new Date(+v).toISOString().slice(0, 10); } catch (e) { } } return q(v); }).join(',')); });
      return '\ufeff' + rows.join('\r\n');
    }
    function exportAll(srvAccounts) {
      var list = accs();
      if (srvAccounts && typeof srvAccounts === 'object') { Object.keys(srvAccounts).forEach(function (k) { var a = srvAccounts[k]; if (a && a.email && !list.some(function (x) { return x.email === a.email && String(x.createdAt) === String(a.createdAt); })) list.push(a); }); }
      var day = ymd(new Date());
      var o = { when: new Date().toISOString(), note: 'نسخة كاملة قبل تنظيف قائمة الحسابات', accounts: list, school: J('alfarabi_school_v1', {}), records: J('alfarabi_rec_v1', []), chat: J('alfarabi_chat_v2', {}) };
      return saveFile('alfarabi-backup-' + day + '.json', JSON.stringify(o), 'application/json').then(function (ok1) {
        return saveFile('alfarabi-accounts-' + day + '.csv', csvOf(list), 'text/csv;charset=utf-8').then(function (ok2) { return ok1 && ok2; });
      });
    }
    panel(doc, 'تنظيف البيانات', html(), function (p) {
      var m = p.querySelector('#cum'), m2 = p.querySelector('#cum2'), x = p.querySelector('#cux'), pr = p.querySelector('#cupr'), bar = pr.firstChild, busy = false;
      function msg(t, c) { m.className = 'afmsg ' + (c || ''); m.textContent = t; }
      function redraw() { var st = p.querySelector('.afp-s'); if (st) { st.innerHTML = html(); wire(); } }
      function wire() {
        p.querySelector('#cue').onclick = function () {
          var mm = p.querySelector('#cue'); mm.disabled = true;
          gj('/accounts').then(function (srv) { return exportAll(srv); }).then(function (ok) { mm.disabled = false; alert(ok ? 'تم تصدير الملفات ✓ تلقاها في التنزيلات' : 'تعذّر تنزيل الملف على هذا الجهاز'); });
        };
        p.querySelector('#cur').onclick = restore;
        p.querySelector('#cux').onclick = start;
        m = p.querySelector('#cum'); m2 = p.querySelector('#cum2'); x = p.querySelector('#cux'); pr = p.querySelector('#cupr'); bar = pr.firstChild;
      }
      function start() {
        if (busy) return;
        var roles = []; if (p.querySelector('#cus').checked) roles.push('student'); if (p.querySelector('#cup').checked) roles.push('parent'); if (p.querySelector('#cut').checked) roles.push('teacher');
        if (!roles.length) return msg('اختر نوع حسابات واحد على الأقل', 'bad');
        if (!window.FBBASE) return msg('ما اكو اتصال بقاعدة البيانات، تأكد من الإنترنت وحاول', 'bad');
        confirmDlg(doc, 'راح ينتظّف سجل الحسابات المسجلة وتبدأ قائمة جديدة. قوائم الطلاب بالمدرسة والملازم وكل البيانات الثانية ما تنمسح، وراح ينزل لك ملف بكل البيانات أولاً. تكمل؟', 'نعم، نظّف', function () {
          busy = true; x.disabled = true; pr.style.display = 'block'; bar.style.width = '8%'; msg('جاري تجهيز الملف...');
          var B = window.FBBASE, ts = Date.now(), srvAll = null, victims = {};
          gj('/accounts').then(function (srv) {
            srvAll = srv && typeof srv === 'object' ? srv : {};
            bar.style.width = '20%'; msg('جاري تنزيل ملف كل البيانات...');
            return exportAll(srvAll);
          }).then(function (ok) {
            if (!ok) throw new Error('ما نزل ملف النسخة على هذا الجهاز، فما نظّفنا شي. جرّب من متصفح ثاني أو اضغط «تصدير كل البيانات».');
            bar.style.width = '40%'; msg('جاري حفظ نسخة بالخادم...');
            Object.keys(srvAll).forEach(function (k) { var a = srvAll[k]; if (a && roles.indexOf(a.role) > -1) victims[k] = a; });
            var arc = { when: new Date(ts).toISOString(), roles: roles, accounts: victims };
            return fetch(B + '/config/accarchive/t' + ts + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(arc) }).then(function (r) { return !!r.ok; }, function () { return false; });
          }).then(function (arcOk) {
            bar.style.width = '60%'; msg('جاري تنظيف القائمة...');
            var del = {}; Object.keys(victims).forEach(function (k) { del[k] = null; });
            var n = Object.keys(del).length;
            var delP = n ? fetch(B + '/accounts.json', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(del) }).then(function (r) { if (!r.ok) throw new Error('رفض الخادم حذف الحسابات (' + r.status + ')، راجع قواعد قاعدة البيانات'); }) : Promise.resolve();
            return delP.then(function () {
              bar.style.width = '85%';
              var mk = { ts: ts, rev: ts, acc: 1, roles: roles, chat: false, records: false, by: 'admin' };
              return fetch(B + '/config/reset.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk) }).then(function (r) { if (!r.ok) throw new Error('انحذفت الحسابات لكن ما انكتبت علامة التنظيف (' + r.status + '): بقية الأجهزة ممكن ترجع حساباتها القديمة'); return mk; });
            }).then(function (mk) {
              try { if (window.AFSetAccMk) window.AFSetAccMk(mk); } catch (e) { }
              try { LS.setItem('af_reset_seen', String(mk.ts)); } catch (e) { }
              bar.style.width = '100%';
              var done = 'تم ✓ نُظّفت ' + n + ' حساب وبدأت قائمة جديدة. تم تنزيل الملفات' + (arcOk ? ' وحُفظت نسخة بالخادم.' : ' (النسخة على الخادم ما انحفظت لأن القواعد ما تسمح، الاعتماد على الملف المنزّل).');
              busy = false; redraw(); var mm = p.querySelector('#cum'); if (mm) { mm.className = 'afmsg ok'; mm.textContent = done; }
            });
          }).catch(function (e) { busy = false; x.disabled = false; pr.style.display = 'none'; msg('تعذّر التنظيف: ' + (e && e.message || e), 'bad'); });
        });
      }
      function restore() {
        function say(t, c) { m2.className = 'afmsg ' + (c || ''); m2.textContent = t; }
        if (!window.FBBASE) return say('ما اكو اتصال بقاعدة البيانات', 'bad');
        say('جاري البحث عن آخر نسخة...');
        gj('/config/accarchive?shallow=true').then(function (keys) {
          var ks = keys && typeof keys === 'object' ? Object.keys(keys).sort() : [];
          if (!ks.length) { say('ما اكو نسخة محفوظة بالخادم. استخدم ملف النسخة المنزّل.', 'bad'); return; }
          var last = ks[ks.length - 1];
          return gj('/config/accarchive/' + last).then(function (arc) {
            var a = arc && arc.accounts || {}, n = Object.keys(a).length;
            if (!n) { say('النسخة فارغة', 'bad'); return; }
            confirmDlg(doc, 'ترجيع ' + n + ' حساب من آخر قائمة؟', 'نعم، رجّع', function () {
              fetch(window.FBBASE + '/accounts.json', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }).then(function (r) { if (!r.ok) throw new Error(r.status); var rv = Date.now(), mk = { ts: 0, rev: rv, acc: 1, roles: [], by: 'admin' }; return fetch(window.FBBASE + '/config/reset.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk) }).then(function () { try { LS.removeItem('af_accreset_mk'); } catch (e) { } try { window.AFSetAccMk && window.AFSetAccMk(mk); } catch (e) { } try { LS.setItem('af_reset_seen', String(rv)); } catch (e) { } try { window.AFAccountsNow && window.AFAccountsNow(6000); } catch (e) { } say('تم ترجيع ' + n + ' حساب ✓', 'ok'); setTimeout(redraw, 1200); }); }).catch(function (e) { say('تعذّر الترجيع: ' + (e && e.message || e), 'bad'); });
            });
          });
        }).catch(function () { say('تعذّر الوصول للنسخ', 'bad'); });
      }
      wire();
    });
  }

  /* ===================== مسح شامل وبدء قاعدة بيانات جديدة (الملازم محمية) ===================== */
  function resetPage(doc) {
    var backed = false;
    var html = '<div class="afp-c"><h3>ماذا تريد تمسح؟</h3>' +
      '<label class="afck"><input type="checkbox" id="rs1" checked> كل رسائل المحادثات</label>' +
      '<label class="afck"><input type="checkbox" id="rs2" checked> حسابات الطلاب المسجلين</label>' +
      '<label class="afck"><input type="checkbox" id="rs3" checked> حسابات أولياء الأمور</label>' +
      '<label class="afck"><input type="checkbox" id="rs4"> حسابات المدرسين (يرجعون يسجّلون من جديد)</label>' +
      '<label class="afck"><input type="checkbox" id="rs5" checked> سجلات الدرجات والغيابات والتقييمات</label>' +
      '<label class="afck"><input type="checkbox" id="rs6"> التحاضير المنشورة</label>' +
      '<label class="afck"><input type="checkbox" id="rs7" checked> إحصائيات الاستخدام</label>' +
      '<p style="margin-top:8px">محمي دائماً ولا ينمسح: <b>الملازم وملفاتها، وحساب الإدارة، ومعلومات المدرسة</b>.</p></div>' +
      '<div class="afp-c"><h3>خطوات الأمان</h3><p>1) نزّل نسخة احتياطية من الخادم. 2) اكتب كلمة «مسح» للتأكيد. 3) اضغط تنفيذ.</p>' +
      '<button class="afbtn gray" id="rsb" style="width:100%">تنزيل نسخة احتياطية</button>' +
      '<input id="rsc" class="afin" placeholder="اكتب: مسح" style="margin-top:10px"><div class="afmsg" id="rsm"></div><div class="hdpr" id="rspr" style="display:none"><i></i></div>' +
      '<button class="afbtn" id="rsx" style="width:100%;margin-top:10px;background:linear-gradient(135deg,#ff5d6e,#d9283d)" disabled>تنفيذ المسح</button></div>';
    panel(doc, 'مسح شامل', html, function (p) {
      var m = p.querySelector('#rsm'), x = p.querySelector('#rsx'), pr = p.querySelector('#rspr'), bar = pr.firstChild, cf = p.querySelector('#rsc');
      function msg(t, c) { m.className = 'afmsg ' + (c || ''); m.textContent = t; }
      function arm() { x.disabled = !(backed && cf.value.trim() === 'مسح'); }
      cf.addEventListener('input', arm);
      function gj(path) { return fetch(window.FBBASE + path + '.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
      p.querySelector('#rsb').onclick = function () {
        if (!window.FBBASE) return msg('لا يوجد اتصال بقاعدة البيانات', 'bad');
        msg('جاري تجهيز النسخة الاحتياطية...');
        Promise.all(['accounts', 'chat', 'records', 'plans', 'school', 'usage'].map(function (k) { return gj('/' + k).catch(function () { return null; }); })).then(function (r) {
          var o = { when: new Date().toISOString(), accounts: r[0], chat: r[1], records: r[2], plans: r[3], school: r[4], usage: r[5] };
          var a = doc.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: 'application/json' })); a.download = 'alfarabi-full-backup-' + ymd(new Date()) + '.json';
          doc.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 800); backed = true; msg('تم تنزيل النسخة الاحتياطية ✓', 'ok'); arm();
        }).catch(function () { msg('تعذّر تجهيز النسخة', 'bad'); });
      };
      x.onclick = function () {
        confirmDlg(doc, 'سيتم المسح نهائياً من كل الأجهزة. الملازم ما تنمسح. هل أنت متأكد؟', 'نعم، امسح', function () {
          x.disabled = true; pr.style.display = 'block'; msg('جاري المسح...');
          var roles = []; if (p.querySelector('#rs2').checked) roles.push('student'); if (p.querySelector('#rs3').checked) roles.push('parent'); if (p.querySelector('#rs4').checked) roles.push('teacher');
          var nodes = []; if (p.querySelector('#rs1').checked) nodes.push('chat'); if (p.querySelector('#rs5').checked) { nodes.push('records'); nodes.push('plansSeen'); }
          if (p.querySelector('#rs6').checked) nodes.push('plans'); if (p.querySelector('#rs7').checked) { nodes.push('usage'); nodes.push('usagesrc'); nodes.push('stats'); }
          var B = window.FBBASE, jobs = [];
          nodes.forEach(function (k) { jobs.push(function () { return fetch(B + '/' + k + '.json', { method: 'DELETE' }); }); });
          var accP = roles.length ? gj('/accounts').catch(function () { return null; }) : Promise.resolve(null);
          accP.then(function (accs) {
            Object.keys(accs || {}).forEach(function (k) { var a = accs[k]; if (a && roles.indexOf(a.role) > -1) jobs.push(function () { return fetch(B + '/accounts/' + k + '.json', { method: 'DELETE' }); }); });
            var total = jobs.length, done = 0, i = 0, fail = 0;
            function w() { if (i >= jobs.length) return Promise.resolve(); var j = jobs[i++]; return j().then(function (r) { if (r && !r.ok) fail++; }, function () { fail++; }).then(function () { done++; bar.style.width = (total ? done / total * 100 : 100) + '%'; return w(); }); }
            var ws = []; for (var q = 0; q < 6; q++) ws.push(w());
            return Promise.all(ws).then(function () { return fail; });
          }).then(function (fail) {
            var mk = { ts: Date.now(), roles: roles, chat: nodes.indexOf('chat') > -1, records: nodes.indexOf('records') > -1 };
            return fetch(B + '/config/reset.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mk) }).then(function () { applyReset(mk); return fail; });
          }).then(function (fail) { bar.style.width = '100%'; msg(fail ? 'تم المسح مع ' + fail + ' عنصر ما انحذف (راجع القواعد).' : 'تم المسح وبدأت قاعدة بيانات جديدة ✓', fail ? 'bad' : 'ok'); })
            .catch(function (e) { msg('تعذّر المسح: ' + (e && e.message || e), 'bad'); });
        });
      };
    });
  }
  /* تنظيف النسخ المحلية على الأجهزة بعد المسح الشامل */
  function applyReset(mk) {
    try {
      if (mk.chat) LS.removeItem('alfarabi_chat_v2');
      if (mk.records) LS.removeItem('alfarabi_rec_v1');
      var db = J('alfarabi_db_v1', null);
      if (db && db.accounts && mk.roles && mk.roles.length) { db.accounts = db.accounts.filter(function (a) { return mk.roles.indexOf(a.role) < 0; }); LS.setItem('alfarabi_db_v1', JSON.stringify(db)); }
      var se = J('alfarabi_sess_acc', null);
      if (se && mk.roles && mk.roles.indexOf(se.role) > -1) LS.removeItem('alfarabi_sess_acc');
    } catch (e) { }
  }
  (function () {
    if (!g('af_reset_first', '')) s('af_reset_first', String(Date.now()));
    function chk() {
      if (!window.FBBASE || document.hidden) return;
      fetch(window.FBBASE + '/config/reset.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (mk) {
        if (!mk || !mk.ts) return;
        var seen = +g('af_reset_seen', '0') || 0;
        if (mk.acc) return;   // تنظيف قائمة الحسابات تعالجه طبقة المزامنة
        if (mk.ts <= seen) return;
        s('af_reset_seen', String(mk.ts));
        if (mk.ts <= (+g('af_reset_first', '0') || 0)) return;   // جهاز جديد بعد المسح
        applyReset(mk); try { location.reload(); } catch (e) { }
      }).catch(function () { });
    }
    setTimeout(chk, 9000); setInterval(chk, 5 * 60 * 1000);
  })();
  function confirmDlg(doc, msg, okText, cb) {
    var o = doc.createElement('div'); o.className = 'afcf';
    o.innerHTML = '<div class="afcf-b"><p>' + esc(msg) + '</p><div><button class="afbtn gray" data-n>إلغاء</button><button class="afbtn" style="background:linear-gradient(135deg,#ff5d6e,#d9283d)" data-y>' + esc(okText) + '</button></div></div>';
    doc.body.appendChild(o); o.querySelector('[data-n]').onclick = function () { o.remove(); }; o.querySelector('[data-y]').onclick = function () { o.remove(); cb(); };
  }

  /* ===================== مدة استخدام التطبيق (لكل حساب) ===================== */
  (function () {
    var key = null, acc = 0, last = 0;
    setInterval(function () {
      try {
        var R = roleInfo(); if (R.role === 'guest' || R.role === 'admin' || !R.uid) return;
        if (!A.isForeground || !A.isForeground()) return;
        var day = ymd(new Date()), k = 'af_use_' + R.uid + '_' + day;
        var cur = +g(k, '0') + 30; s(k, String(cur)); acc += 30;
        if (acc >= 180 && window.FBBASE) {
          acc = 0;
          fetch(window.FBBASE + '/usage/a' + String(R.uid).replace(/[.#$\[\]\/]/g, '_') + '/' + day + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: String(cur) }).catch(function () {});
          fetch(window.FBBASE + '/usagesrc/a' + String(R.uid).replace(/[.#$\[\]\/]/g, '_') + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(A.__web ? 'web' : 'app') }).catch(function () {});
        }
      } catch (e) {}
    }, 30000);
  })();


  /* ===================== مراقب السلاسة (وضع تلقائي) ===================== */
  (function () {
    var bad = 0, good = 0, busy = false;
    function setAuto(L) { AUTO = L; s('af_auto_lvl', L); pinTier(); applyAll(); }
    function sample(cb) {
      var n = 0, t0 = 0, last = 0, worst = 0;
      function f(t) {
        if (!t0) t0 = t; else { var d = t - last; if (d > worst) worst = d; }
        last = t; n++;
        if (n < 50) requestAnimationFrame(f); else cb((t - t0) / (n - 1), worst);
      }
      requestAnimationFrame(f);
    }
    function tick() {
      if (GFX !== 'auto' || busy || document.hidden) return;
      try { if (A.isForeground && !A.isForeground()) return; } catch (e) {}
      busy = true;
      sample(function (avg, worst) {
        busy = false;
        var i = ORDER.indexOf(AUTO), cap = ORDER.indexOf(g('af_auto_cap', 'full')); if (cap < 0) cap = 3;
        var capTs = +g('af_auto_cap_ts', '0'); if (Date.now() - capTs > 2 * 864e5) { cap = 3; }
        if (avg > 23 || worst > 120) {            // أقل من نحو 43 إطار/ثانية أو توقف ملحوظ
          good = 0; if (++bad >= 2 && i > 0) { bad = 0; s('af_auto_cap', ORDER[i - 1]); s('af_auto_cap_ts', String(Date.now())); setAuto(ORDER[i - 1]); }
        } else if (avg <= 18.5) {
          bad = 0;
        } else { bad = 0; good = 0; }
      });
    }
    setTimeout(function () { tick(); setInterval(tick, 5000); }, 4000);
  })();

  window.AFX = { cleanup: cleanupPage, reset: resetPage, panel: function (d, t, h, b) { return panel(d, t, h, b, true); }, esc: esc, on: on, roleInfo: function () { return roleInfo(); }, J: J };

  /* ===================== إدراج الأزرار بقائمة الإعدادات ===================== */
  function injectEntries(doc) {
    var nbOn = doc.querySelector('.nb.on'), onSettings = nbOn && nbOn.getAttribute('data-v') === 'settings';
    doc.querySelectorAll('.sc').forEach(function (sc) {
      if (sc.getAttribute('data-afx')) return;
      var opts = [].slice.call(sc.querySelectorAll('.option'));
      if (!opts.length) return;
      var isSettings = onSettings || opts.some(function (b) { return /الملف الشخصي|صلاحية حسابي/.test(b.textContent); });
      if (!isSettings) return;
      sc.setAttribute('data-afx', '1');
      var proto = opts[0];
      function add(label, fn, top) {
        var b = proto.cloneNode(true); b.removeAttribute('data-o'); b.removeAttribute('id');
        var t = b.querySelector('.opt-text'); if (t) t.textContent = label; else b.firstChild.textContent = label;
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(doc); });
        if (top && sc.firstChild) sc.insertBefore(b, sc.firstChild); else sc.appendChild(b);
      }
      var RI = roleInfo();
      if (RI.role === 'admin') { add('الصيانة والتحديثات', function (d) { if (window.afMaint) window.afMaint(d); }, true); add('📚 ملازم الثالث متوسط 2027', function (d) { if (window.afHandouts) window.afHandouts(d); }); add('🧹 تنظيف البيانات', cleanupPage); }
      add('📢 الإشعارات المهمة', importantPage);
      add('⚡ إصلاح وتسريع الاتصال', function (d) { if (window.afConnFix) window.afConnFix(d); });
      add('🎨 المظهر والأداء', themePage);
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
    new MutationObserver(function () { if (q) return; q = 1; (d.defaultView || window).requestAnimationFrame(function () { q = 0; injectEntries(d); supTick(d); }); }).observe(d.body, { childList: true, subtree: true });
    injectEntries(d); supTick(d);
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
  (function early() { var r = document.documentElement; r.setAttribute('data-aft', THEME); r.classList.toggle('af-lite', lvl() === 'lite' || lvl() === 'static'); r.classList.toggle('af-nofx', lvl() !== 'full'); var st = document.createElement('style'); st.id = 'af-x'; st.textContent = CSS; (document.head || r).appendChild(st); try { A.setBars(false); } catch (e) {} })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
