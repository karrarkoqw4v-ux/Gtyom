/* af-menu.js — إعادة تصميم أيقونات القائمة الرئيسية وترتيبها لجميع الأدوار (طالب / مدرس / ولي أمر / إدارة)
   - أيقونات SVG موحّدة بألوان متدرجة بدل الأرقام.
   - ترتيب الأقسام في مجموعات واضحة (الدراسة / الأدوات والتواصل / الحساب).
   - مربعات الصفحة الرئيسية تُبنى تلقائياً من قائمة كل دور بنفس الأيقونات.
   يعمل بحقن الكود داخل واجهة المستخدم (userMain) وواجهة الإدارة (ADMIN_SRC) قبل تشغيلهما. */
(function () {
  'use strict';

  var S = function (d) { return d; };
  var IC = {
    schedule: '<rect x="3" y="4" width="18" height="18" rx="3.5"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    announcements: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12"/>',
    plans: '<path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/>',
    handouts: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/>',
    evals: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    grades: '<path d="M4 21V9M10 21V3M16 21v-8M22 21H2"/>',
    absence: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 8l5 5M22 8l-5 5"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    support: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24"/>',
    tools: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    afupd: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    kid: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mylevel: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
    ministry: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    reports: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    school: '<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6M9 11h.01M15 11h.01"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    dflt: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>'
  };
  // [ألوان التدرج، وصف قصير]
  var META = {
    schedule: [['#38bdf8', '#0a86d6'], '', 'الجدول الأسبوعي'],
    announcements: [['#fb923c', '#ef4444'], '', 'الإعلانات'],
    plans: [['#a78bfa', '#7c3aed'], '', 'التحاضير'],
    handouts: [['#2dd4bf', '#0d9488'], 'ملازم ومذكرات'],
    evals: [['#fbbf24', '#f59e0b'], ''],
    grades: [['#4ade80', '#16a34a'], '', 'الدرجات'],
    absence: [['#fb7185', '#e11d48'], '', 'الغيابات'],
    chat: [['#60a5fa', '#2563eb'], 'المحادثات والكروبات', 'المحادثات'],
    support: [['#22d3ee', '#0891b2'], 'تواصل مع الدعم'],
    tools: [['#818cf8', '#4f46e5'], 'مترجم ورياضيات', 'الأدوات'],
    afupd: [['#34d399', '#059669'], 'ما الجديد في التطبيق'],
    logout: [['#f87171', '#dc2626'], ''],
    kid: [['#38bdf8', '#2563eb'], 'تفاصيل الطالب'],
    mylevel: [['#fcd34d', '#f59e0b'], ''],
    ministryView: [['#d6b88a', '#a16207'], 'أسئلة وزارية'],
    ministry: [['#d6b88a', '#a16207'], 'أسئلة وزارية'],
    reports: [['#fdba74', '#ea580c'], 'بلاغات الطلبة'],
    school: [['#60a5fa', '#1d4ed8'], 'منشورات المدرسة'],
    settings: [['#94a3b8', '#475569'], 'إدارة المدرسة'],
    dflt: [['#94a3b8', '#64748b'], '']
  };
  var ICMAP = { ministryView: 'ministry' };
  // مجموعات القائمة بالترتيب
  var GROUPS = [
    ['الدراسة', ['schedule', 'announcements', 'plans', 'handouts', 'kid', 'mylevel', 'evals', 'grades', 'absence', 'reports', 'ministryView', 'ministry']],
    ['التواصل والأدوات', ['chat', 'tools', 'school', 'support']],
    ['الحساب والنظام', ['settings', 'afupd', 'logout']]
  ];
  var GRID = ['schedule', 'announcements', 'plans', 'handouts', 'evals', 'grades', 'absence', 'reports', 'ministryView', 'ministry', 'kid', 'chat', 'tools', 'school'];

  var CSS = '<style id="af-menu-css">'
    + '#drawer .afm-sec{font-size:12px;font-weight:800;color:#64748b;margin:14px 6px 6px;letter-spacing:.2px;display:flex;align-items:center;gap:8px}'
    + '#drawer .afm-sec:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(100,116,139,.28),transparent)}'
    + 'html #drawer .option.afm-opt{background:#fff!important;border:1.5px solid #000!important;color:#000!important;box-shadow:none}'
    + 'html #drawer .option.afm-opt .opt-text{color:#000!important;font-family:system-ui,-apple-system,Roboto,\"Noto Sans Arabic\",\"Segoe UI\",sans-serif!important}'
    + 'html #drawer .option.afm-opt .chev,html #drawer .option.afm-opt .chev *{color:#000!important;stroke:#000!important}'
    + '#drawer .option.afm-opt{display:flex;align-items:center;gap:12px;padding:9px 10px;margin-bottom:6px;border-radius:18px}'
    + 'html #drawer .option.afm-opt .afm-ic{background:#fff!important;border:1.5px solid #000!important;box-shadow:none!important}'
    + 'html #drawer .option.afm-opt .afm-ic svg,html #drawer .option.afm-opt .afm-ic svg *{stroke:#000!important;fill:none!important;opacity:1!important;color:#000!important}'
    + '.af-hq-btn:last-child:nth-child(odd){grid-column:1 / -1;flex-direction:row!important;align-items:center!important;min-height:78px!important}'
    + '#drawer .afm-ic{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;flex:none;box-shadow:none;color:#000;animation:none!important}'
    + '#drawer .afm-ic svg{width:21px;height:21px;fill:none;stroke:#000!important;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;animation:none!important}'
    + '#drawer .option.afm-opt .opt-text{font-weight:800;font-size:15px}'
    + '#drawer .option.afm-out{margin-top:6px}'
    + 'html #drawer .option.afm-out .opt-text{color:#000!important}'
    + '.af-hq-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px;margin:14px 0 8px;direction:rtl}'
    + '.af-hq-btn{position:relative;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;gap:9px!important;min-height:108px!important;padding:13px 13px 12px!important;border-radius:22px!important;border:1.5px solid #000!important;background:#fff!important;color:#000!important;box-shadow:none!important;text-align:right!important;overflow:hidden;font-family:system-ui,-apple-system,Roboto,\"Noto Sans Arabic\",\"Segoe UI\",sans-serif!important}'
    + '.af-hq-btn:active{transform:scale(.96)}'
    + '.af-hq-btn .af-hq-ic{width:46px!important;height:46px!important;border-radius:16px!important;display:grid;place-items:center;flex:none;color:#000!important;box-shadow:none;background:#fff!important}'
    + '.af-hq-btn .af-hq-ic svg{width:25px!important;height:25px!important;fill:none!important;stroke:#000!important;stroke-width:1.9!important;stroke-linecap:round;stroke-linejoin:round}'
    + '.af-hq-btn>div{width:100%}'
    + '.af-hq-btn b{display:block;font-size:15px!important;font-weight:800!important;line-height:1.3;color:#000}'
    + '.af-hq-btn small{display:block;font-size:11px!important;font-weight:700;opacity:.7!important;margin-top:2px;line-height:1.3;color:#475569}'
    + '.af-hq-btn:nth-last-child(2):nth-child(odd){grid-column:1 / -1;flex-direction:row!important;align-items:center!important;min-height:78px!important}'
    + '.af-hq-btn.wide{grid-column:1 / -1;flex-direction:row!important;align-items:center!important;gap:12px!important;background:linear-gradient(135deg,#0aa6f5,#1d4ed8)!important;border-color:transparent!important;min-height:72px!important;box-shadow:0 10px 24px rgba(10,166,245,.3)!important}'
    + '.af-hq-btn.wide b,.af-hq-btn.wide small{color:#fff!important}'
    + '.af-hq-btn.wide .af-hq-ic{background:rgba(255,255,255,.22)!important;box-shadow:none}'
    + 'html body .sp-sc{background:#f0f2f5!important;font-family:system-ui,-apple-system,Roboto,"Noto Sans Arabic","Segoe UI",sans-serif!important}'
    + 'html body .sp-cv{height:150px!important;background:linear-gradient(135deg,#111,#555)!important}'
    + 'html body .sp-lg{width:96px!important;height:96px!important;margin:-48px 16px 0 auto!important;border:4px solid #fff!important;background-color:#fff!important;box-shadow:0 2px 8px rgba(0,0,0,.25)}'
    + 'html body .sp-h,html body .sp-mt,html body .sp-bio{text-align:right!important;padding:0 16px;background:#fff;color:#050505!important}'
    + 'html body .sp-h{font-size:21px!important;font-weight:800!important;margin-top:-48px!important;padding-top:56px!important;padding-right:16px!important}'
    + 'html body .sp-mt{color:#65676b!important;font-size:13.5px!important;padding-bottom:8px}'
    + 'html body .sp-dm{background:#fff;color:#050505!important;padding:0 16px 8px}'
    + 'html body .sp-bt{background:#fff;padding:6px 16px 12px!important;gap:8px}'
    + 'html body .sp-b{background:#e4e6eb!important;color:#050505!important;border-radius:10px!important;box-shadow:none!important;font-weight:800!important}'
    + 'html body .sp-b.g{background:#000!important;color:#fff!important;order:-1}'
    + 'html body .sp-tabs{background:#fff!important;border-top:1px solid #dadde1!important;border-bottom:1px solid #dadde1;display:flex}'
    + 'html body .sp-tabs button{flex:1;background:transparent!important;color:#65676b!important;font-size:14px!important;font-weight:800!important;border-radius:0!important;padding:12px 6px!important;border-bottom:3px solid transparent!important}'
    + 'html body .sp-tabs button.on{color:#000!important;border-bottom-color:#000!important;background:transparent!important;box-shadow:none!important}'
    + 'html body .sp-h,html body .sp-mt,html body .sp-bio,html body .sp-dm,html body .sp-bt,html body .sp-tabs,html body .sp-tabs button{margin-left:0!important;margin-right:0!important;border-radius:0!important;box-shadow:none!important}'
    + 'html body .sp-mt{margin-top:0!important;margin-bottom:0!important}'
    + 'html body .sp-p{background:#fff!important;color:#050505!important;border-radius:0!important;margin:8px 0!important;box-shadow:none!important}'
    + 'html body .sp-d,html body .sp-d *{color:#050505!important}html body .sp-d{background:#fff;margin-top:8px;padding:12px 16px}'
    + 'html body .sp-top{background:#fff!important;color:#050505!important}'
    + '</style>';

  /* ---- الكود الذي يُحقن داخل الواجهة (يُنفّذ داخل نطاق userMain / تطبيق الإدارة فيرى MENU وV) ---- */
  function DEC(IC, META, ICMAP, GROUPS, GRID) {
    try {
      var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IC[ICMAP[k] || k] || IC.dflt) + '</svg>'; };
      var mt = function (k) { return META[k] || META.dflt; };
      var grad = function (k) { var c = mt(k)[0]; return 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ')'; };
      var isAdmin = false;
      try { isAdmin = !(typeof U !== 'undefined' && U && U.role); } catch (e) { isAdmin = true; }
      var role = '';
      try { role = (typeof U !== 'undefined' && U && U.role) || ''; } catch (e) {}
      var hasV = function (k) { try { return (isAdmin && k === 'school') || (typeof V !== 'undefined' && typeof V[k] === 'function'); } catch (e) { return false; } };

      // 1) ترتيب MENU وإضافة العناصر الناقصة
      var by = {};
      MENU.forEach(function (m) { by[m[0]] = m; });
      if (!by.mylevel && hasV('mylevel')) by.mylevel = ['mylevel', (role === 'teacher' || isAdmin) ? 'مستوى الطلاب' : 'مستواك الدراسي'];
      if (isAdmin) {
        if (!by.announcements && hasV('announcements')) by.announcements = ['announcements', 'الإعلانات المدرسية'];
        if (!by.school && hasV('school')) by.school = ['school', 'صفحة المدرسة'];
        if (!by.settings && hasV('settings')) by.settings = ['settings', 'الإعدادات'];
      }
      var out = [], used = {};
      GROUPS.forEach(function (g) { g[1].forEach(function (id) { if (by[id] && !used[id]) { out.push(by[id]); used[id] = 1; } }); });
      MENU.forEach(function (m) { if (!used[m[0]] && m[0] !== 'logout') { out.splice(out.length, 0, m); used[m[0]] = 1; } });
      // أي عنصر غير معروف يُوضع قبل مجموعة الحساب
      var lo = by.logout; if (lo) { out = out.filter(function (m) { return m[0] !== 'logout'; }); out.push(lo); }
      // المطلوب فقط: الجدول الأسبوعي، الغيابات، الدرجات، التحاضير، تقييم الطالب (+ تسجيل الخروج)
      var KEEP = ['schedule', 'absence', 'grades', 'plans'];
      var evId = by.evals ? 'evals' : 'mylevel';
      out = out.filter(function (m) { return KEEP.indexOf(m[0]) > -1 || m[0] === evId || m[0] === 'logout'; });
      out.forEach(function (m) { if (m[0] === evId) m[1] = 'تقييم الطالب'; });
      var ORD = ['schedule', 'absence', 'grades', 'plans', evId, 'logout'];
      out.sort(function (a, b) { return ORD.indexOf(a[0]) - ORD.indexOf(b[0]); });
      MENU.length = 0; out.forEach(function (m) { MENU.push(m); });

      var groupOf = function (id) {
        return '';
      };

      // 2) تجميل الدرج بعد كل رسم
      var deco = function () {
        var d = document.getElementById('drawer'); if (!d || d.querySelector('.afm-sec')) return;
        var last = '';
        [].slice.call(d.querySelectorAll('.option[data-id]')).forEach(function (b) {
          var id = b.getAttribute('data-id'), ic = b.querySelector('.opt-ico');
          if (ic) { ic.innerHTML = svg(id); ic.className = 'opt-ico afm-ic'; ic.style.setProperty('--afg', grad(id)); }
          b.classList.add('afm-opt'); if (id === 'logout') b.classList.add('afm-out');
          var g = groupOf(id);
          if (g !== last) { last = g; b.insertAdjacentHTML('beforebegin', '<div class="afm-sec" style="margin:0;height:0"></div>'); }
        });
      };
      var dr = document.getElementById('drawer');
      if (dr && window.MutationObserver) { new MutationObserver(function () { deco(); }).observe(dr, { childList: true }); }

      // 3) مربعات الصفحة الرئيسية (تُبنى من القائمة حسب الدور)
      var tile = function (id, label) {
        return '<button type="button" class="af-hq-btn" data-hq="' + id + '"><span class="af-hq-ic" style="background:' + grad(id) + '">' + svg(id) + '</span><div><b>' + label + '</b><small>' + mt(id)[1] + '</small></div></button>';
      };
      var html = '<div class="af-hq-grid">', seen = {};
      MENU.forEach(function (m) {
        var id = m[0]; if (id === 'logout' || seen[id] || !hasV(id)) return; seen[id] = 1;
        html += tile(id, m[1]);
      });
      if (false) html += '<button type="button" class="af-hq-btn wide" data-hq="mylevel"><span class="af-hq-ic" style="background:rgba(255,255,255,.22)">' + svg('mylevel') + '</span><div><b>' + by.mylevel[1] + '</b><small>' + (isAdmin || role === 'teacher' ? 'تقييمات المدرسين ودرجات الطلاب' : 'الاسم الثلاثي وتقييمات المدرسين والدرجات') + '</small></div></button>';
      html += '</div>';
      if (isAdmin) { try { _admGridHtml = html; } catch (e) {} }
      else {
        try { _hqGridHtml = html; } catch (e) {}
        try { if (document.body.classList.contains('qn-home') && typeof home === 'function') home(); } catch (e) {}
      }
    } catch (e) { try { console.warn('af-menu', e); } catch (x) {} }
  }

  var EXSRC = '\n/* ===== af-menu: تصميم القائمة ===== */\n(' + DEC.toString() + ')('
    + JSON.stringify(IC) + ',' + JSON.stringify(META) + ',' + JSON.stringify(ICMAP) + ',' + JSON.stringify(GROUPS) + ',' + JSON.stringify(GRID) + ');\n';

  // واجهة الإدارة
  try {
    var s = window.ADMIN_SRC;
    if (s) {
      s = s.split('</head>').join(CSS + '</head>');
      var a = 'V.school=function(){';
      if (s.indexOf(a) > -1) s = s.split(a).join('(function(){' + EXSRC + '})();\n' + a);
      window.ADMIN_SRC = s;
    }
  } catch (e) { try { console.warn('af-menu admin', e); } catch (x) {} }

  // واجهة الطالب / المدرس / ولي الأمر
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + EXSRC + '\n}';
      window.userMain = (0, eval)('(' + src + ')');
      window.USER_CSS = (window.USER_CSS || '') + CSS;
    }
  } catch (e) { try { console.warn('af-menu user', e); } catch (x) {} }
})();
