/* ============================================================
 * af-3d.js — مدرسة ثلاثية الأبعاد شفافة للصفحة الرئيسية
 * ثانوية الفارابي الأهلية للبنين
 *
 *  - تظهر فوق بطاقة "أهلاً بك" في واجهات الطالب والمدرس وولي الأمر فقط.
 *    (واجهة الإدارة لا تُمَسّ إطلاقاً: المراقب يتجاهل أي مستند ليس مستخدماً.)
 *  - بدون خلفية وبدون إطار: المجسم يطفو على الصفحة بشفافية كاملة.
 *  - خلفية متحركة خفيفة جداً (غيوم، شمس، فقاعات، لمعات، طيور) شفافة وغير مزعجة.
 *  - كل الحركة بـ transform/opacity فقط (على المعالج الرسومي) لأجل سلاسة بدون تقطيع.
 *  - الدوران بحلقة واحدة تعرف هرتز الشاشة، وتسحب الإصبع مع قصور ذاتي.
 *  - تتوقف الحلقة كلياً عند: إخفاء الصفحة، خروج المجسم من الشاشة، أو مغادرة الرئيسية.
 *  - تعتمد على af-perf.js لتحديد مستوى الجودة تلقائياً.
 * ============================================================ */
(function (w) {
  'use strict';
  var Perf = w.AFPerf;
  if (w.AF3D || !Perf) return;

  /* ---------------- التنسيقات ---------------- */
  var CSS = [
    /* تخطيط: المجسم فوق البطاقة داخل .app */
    '.app.a3-on{flex-direction:column!important;justify-content:center!important;gap:2px}',
    '.a3{position:relative;flex:1 1 auto;width:100%;min-height:150px;max-height:260px;direction:ltr;',
    'perspective:850px;perspective-origin:50% 38%;touch-action:pan-y;cursor:grab;',
    '-webkit-user-select:none;user-select:none;contain:layout style;animation:a3in .6s ease both}',
    '@keyframes a3in{from{opacity:0}to{opacity:1}}',

    /* المسرح */
    '.a3-lawn{position:absolute;left:-15%;right:-15%;top:78%;height:70px;margin-top:-38px;pointer-events:none;',
    'background:radial-gradient(ellipse at 50% 50%,rgba(112,200,96,.55) 0,rgba(112,200,96,.26) 45%,rgba(112,200,96,0) 70%)}',
    '.a3-st{position:absolute;left:50%;top:78%;width:0;height:0;transform-style:preserve-3d;will-change:transform;',
    'transform:rotateX(9deg) rotateY(-24deg) scale(.9)}',
    '.a3-bx,.a3-tr,.a3-sw{transform-style:preserve-3d}',

    /* الأرض: عشب يتلاشى للشفافية (بدون حواف) */
    '.a3-gr{position:absolute;left:-260px;top:-210px;width:520px;height:420px;transform:rotateX(90deg) translateZ(-2px);',
    'background:radial-gradient(ellipse at 50% 50%,rgba(122,204,104,.70) 0,rgba(93,184,90,.46) 46%,rgba(74,160,74,0) 71%)}',
    '.a3-shd{position:absolute;left:70px;top:150px;width:380px;height:140px;',
    'background:radial-gradient(ellipse,rgba(0,40,20,.34) 0,rgba(0,40,20,.18) 55%,transparent 72%)}',
    '.a3-pth{position:absolute;left:236px;top:268px;width:48px;height:152px;',
    'background:repeating-linear-gradient(0deg,#efe3c4 0 18px,#e2d3ac 18px 20px);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);',
    '-webkit-mask:linear-gradient(0deg,transparent,#000 35%);mask:linear-gradient(0deg,transparent,#000 35%)}',

    /* المكعبات (جدران/أسقف) */
    '.a3-bx{position:absolute;left:0;top:0}',
    '.a3-bx>i{position:absolute;left:0;top:0;width:100%;height:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden}',
    '.a3-bx>i.f{background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(0,0,0,.07)),var(--a)}',
    '.a3-bx>i.sd{background:linear-gradient(90deg,rgba(0,0,0,.08),rgba(0,0,0,.16)),var(--b)}',
    '.a3-bx>i.tp{background:var(--c)}',
    '.a3-wl{--a:#f7eed7;--b:#dccfae;--c:#2f77c9}',
    '.a3-rf{--a:#1f4f93;--b:#16396f;--c:#2f86dc}',
    '.a3-cl{--a:#fffaf0;--b:#e4dac2;--c:#fff}',
    '.a3-or{--a:#eba73f;--b:#c58224;--c:#f6c260}',

    /* النوافذ: الإضاءة بالـ opacity فقط (بدون إعادة رسم) */
    '.a3-wn{position:absolute;width:16px;height:20px;border-radius:3px;border:2px solid #fffaf0;box-sizing:border-box;',
    'background:linear-gradient(135deg,#8fd6ff,#2e86c9);box-shadow:inset 0 0 0 1px rgba(30,60,120,.3)}',
    '.a3-wn:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,#fff3b0,#f5b83c);',
    'box-shadow:0 0 8px 2px rgba(255,210,90,.7);opacity:0}',
    '.a3-wn.g:before{animation:a3w 5s ease-in-out infinite}',
    '.a3-wn:after{content:"";position:absolute;left:50%;top:0;bottom:0;width:1.5px;background:#fffaf0}',
    '@keyframes a3w{0%,60%,100%{opacity:0}70%,90%{opacity:1}}',

    /* الباب */
    '.a3-dr{position:absolute;left:55px;top:48px;width:40px;height:44px;',
    'background:radial-gradient(ellipse at 50% 85%,#fff4bd,#f3b550 55%,#7a431a);',
    'border-radius:20px 20px 0 0/14px 14px 0 0;perspective:220px;box-shadow:0 0 0 2px #fffaf0}',
    '.a3-dl{position:absolute;top:0;left:0;width:50%;height:100%;box-sizing:border-box;',
    'background:linear-gradient(180deg,#a36a30,#6b4120);border:1px solid #4a2c12;transform-origin:left center;',
    'animation:a3d 8s ease-in-out infinite;border-radius:20px 0 0 0/14px 0 0 0}',
    '.a3-dl:after{content:"";position:absolute;top:52%;right:3px;width:3px;height:3px;border-radius:50%;background:#ffd36b}',
    '.a3-dl.r{left:50%;transform-origin:right center;animation-name:a3e;border-radius:0 20px 0 0/0 14px 0 0}',
    '.a3-dl.r:after{right:auto;left:3px}',
    '@keyframes a3d{0%,20%{transform:rotateY(0)}38%,62%{transform:rotateY(-80deg)}80%,100%{transform:rotateY(0)}}',
    '@keyframes a3e{0%,20%{transform:rotateY(0)}38%,62%{transform:rotateY(80deg)}80%,100%{transform:rotateY(0)}}',

    /* الساعة (تُضبط بالوقت الحقيقي من JS) */
    '.a3-ck{position:absolute;left:11px;top:9px;width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid #1c2f5c;box-sizing:border-box}',
    '.a3-ck b{position:absolute;left:50%;bottom:50%;width:1.5px;background:#1c2f5c;transform-origin:50% 100%;border-radius:2px}',
    '.a3-hm{height:8px}.a3-hh{height:5px}',

    /* العلم */
    '.a3-fl{position:absolute;left:0;top:0;width:28px;height:17px;background:linear-gradient(180deg,#1d8ed8 0 50%,#e9a23b 50% 100%);',
    'transform-origin:left center;border-radius:0 3px 3px 0;animation:a3g .7s ease-in-out infinite alternate}',
    '@keyframes a3g{from{transform:translate3d(1px,-176px,0) scale(1,1)}to{transform:translate3d(1px,-176px,0) scale(.9,1.07)}}',

    /* واجهة الباب العلوية (الشعار) */
    '.a3-pd{position:absolute;left:0;top:0;width:92px;height:28px;background:linear-gradient(180deg,#fff6e0,#f3c46a);clip-path:polygon(50% 0,0 100%,100% 100%)}',
    '.a3-pd img{position:absolute;left:50%;bottom:2px;width:17px;height:17px;margin-left:-8.5px;border-radius:50%;background:#fff;object-fit:contain}',

    /* الأشجار */
    '.a3-tr{position:absolute;left:0;top:0;width:0;height:0}',
    '.a3-sw{position:absolute;left:-18px;top:-58px;width:36px;height:58px;transform-origin:50% 100%;animation:a3t 3.2s ease-in-out infinite alternate}',
    '.a3-tr:nth-of-type(odd) .a3-sw{animation-delay:-1.4s}',
    '.a3-tp1{position:absolute;left:0;top:0;width:36px;height:58px;',
    'background:radial-gradient(circle at 50% 34%,#2f9f4f 0 15px,#43b862 15px 18px,transparent 18.5px),linear-gradient(#7a4a22,#5c3516) 50% 100%/6px 26px no-repeat}',
    '@keyframes a3t{from{transform:rotateZ(-3deg)}to{transform:rotateZ(3deg)}}',

    /* الطلاب الماشون */
    '.a3-wk{position:absolute;left:0;top:0;width:10px;height:22px;margin-top:-22px;animation:a3k 9s linear infinite;opacity:0}',
    '.a3-wh{position:absolute;left:2px;top:0;width:6px;height:6px;border-radius:50%;background:#f1c9a0}',
    '.a3-wb{position:absolute;left:1px;top:6px;width:8px;height:14px;border-radius:3px 3px 1px 1px;animation:a3h .35s ease-in-out infinite alternate}',
    '@keyframes a3h{to{transform:translateY(-1.5px)}}',
    '@keyframes a3k{0%{transform:translateZ(205px);opacity:0}6%{opacity:1}72%{opacity:1}80%,100%{transform:translateZ(66px) scale(.8);opacity:0}}',

    /* ===== الخلفية المتحركة الشفافة (خفيفة جداً) ===== */
    '.a3-amb{position:absolute;inset:0;pointer-events:none}',
    '.a3-sun{position:absolute;top:2%;right:5%;width:64px;height:64px;border-radius:50%;opacity:.4;',
    'background:radial-gradient(circle,rgba(255,246,196,.95) 0,rgba(255,213,74,.45) 40%,rgba(255,213,74,0) 70%);animation:a3p 5s ease-in-out infinite alternate}',
    '.a3-sun:before{content:"";position:absolute;inset:-34px;border-radius:50%;',
    'background:repeating-conic-gradient(rgba(255,235,150,.32) 0 8deg,transparent 8deg 24deg);',
    '-webkit-mask:radial-gradient(circle,transparent 30px,#000 33px,transparent 66px);mask:radial-gradient(circle,transparent 30px,#000 33px,transparent 66px);',
    'animation:a3s 40s linear infinite}',
    '@keyframes a3s{to{transform:rotate(360deg)}}',
    '@keyframes a3p{to{transform:scale(1.12);opacity:.55}}',
    '.a3-cd{position:absolute;height:12px;border-radius:12px;background:#fff;opacity:0}',
    '.a3-cd:before,.a3-cd:after{content:"";position:absolute;background:#fff;border-radius:50%}',
    '.a3-cd:before{width:18px;height:18px;left:9px;top:-9px}.a3-cd:after{width:24px;height:24px;left:24px;top:-12px}',
    '.a3-c1{width:58px;top:14%;left:-70px;animation:a3c 40s linear infinite}',
    '.a3-c2{width:44px;top:38%;left:-70px;animation:a3c 54s linear -22s infinite;scale:.8}',
    '.a3-c3{width:50px;top:5%;left:-70px;animation:a3c 68s linear -46s infinite;scale:.7}',
    '@keyframes a3c{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translate3d(520px,0,0);opacity:0}}',
    '.a3-orb{position:absolute;border-radius:50%;opacity:0;animation:a3o var(--d,10s) ease-in-out var(--l,0s) infinite;',
    'background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.95),rgba(140,205,255,.5) 55%,rgba(140,205,255,0) 72%)}',
    '@keyframes a3o{0%{opacity:0;transform:translate3d(0,26px,0) scale(.7)}20%{opacity:.45}80%{opacity:.3}100%{opacity:0;transform:translate3d(var(--dx,12px),-80px,0) scale(1.05)}}',
    '.a3-sp{position:absolute;width:9px;height:9px;background:#fff;opacity:0;',
    'clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);animation:a3q 3.6s ease-in-out var(--l,0s) infinite}',
    '@keyframes a3q{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:.8;transform:scale(1) rotate(45deg)}}',
    '.a3-bv{position:absolute;left:-24px;width:15px;height:9px;opacity:.5;animation:a3f var(--d,16s) linear var(--l,0s) infinite}',
    '.a3-bv svg{display:block;width:100%;height:100%;fill:none;stroke:#27406b;stroke-width:1.4;stroke-linecap:round;animation:a3z .5s ease-in-out infinite alternate}',
    '@keyframes a3f{0%{transform:translate3d(0,0,0);opacity:0}8%{opacity:.5}92%{opacity:.5}100%{transform:translate3d(470px,-30px,0);opacity:0}}',
    '@keyframes a3z{to{transform:scaleY(.45)}}',

    /* ===== مستويات الجودة ===== */
    '.a3[data-tier="2"] .a3-sp,.a3[data-tier="2"] .a3-bv,.a3[data-tier="2"] .a3-wk,.a3[data-tier="2"] .a3-orb:nth-child(n+6){display:none}',
    '.a3[data-tier="1"] .a3-sp,.a3[data-tier="1"] .a3-bv,.a3[data-tier="1"] .a3-wk,.a3[data-tier="1"] .a3-orb,.a3[data-tier="1"] .a3-c3{display:none}',
    '.a3[data-tier="1"] .a3-wn.g:before,.a3[data-tier="1"] .a3-dl,.a3[data-tier="1"] .a3-sw,.a3[data-tier="1"] .a3-fl{animation:none}',
    '.a3[data-tier="0"] .a3-amb{display:none}',
    '.a3[data-tier="0"] *,.a3[data-tier="0"] *:before,.a3[data-tier="0"] *:after{animation:none!important}',
    '.a3[data-paused] *,.a3[data-paused] *:before,.a3[data-paused] *:after{animation-play-state:paused!important}',
    '@media (prefers-reduced-motion:reduce){.a3 *,.a3 *:before,.a3 *:after{animation:none!important}}'
  ].join('\n');

  /* ---------------- بناء المشهد ---------------- */
  function bx(w_, h, d, x, y, z, k, fr, sdi) {
    var W = w_ / 2, D = d / 2, H = h / 2, sd = sdi || '';
    return '<div class="a3-bx a3-' + k + '" style="width:' + w_ + 'px;height:' + h + 'px;transform:translate3d(' + (x - W) + 'px,' + (-h - y) + 'px,' + z + 'px)">' +
      '<i class="f" style="transform:translateZ(' + D + 'px)">' + (fr || '') + '</i>' +
      '<i class="f" style="transform:rotateY(180deg) translateZ(' + D + 'px)"></i>' +
      '<i class="sd" style="width:' + d + 'px;left:' + (W - D) + 'px;transform:rotateY(-90deg) translateZ(' + W + 'px)">' + sd + '</i>' +
      '<i class="sd" style="width:' + d + 'px;left:' + (W - D) + 'px;transform:rotateY(90deg) translateZ(' + W + 'px)">' + sd + '</i>' +
      '<i class="tp" style="height:' + d + 'px;top:' + (H - D) + 'px;transform:rotateX(90deg) translateZ(' + H + 'px)"></i></div>';
  }
  var wi = 0;
  function wns(xs, ys) {
    var s = '';
    ys.forEach(function (y) {
      xs.forEach(function (x) {
        var i = wi++;
        s += '<b class="a3-wn' + (i % 3 === 0 ? ' g' : '') + '" style="left:' + x + 'px;top:' + y + 'px;animation-delay:-' + ((i * 1.7) % 5).toFixed(1) + 's"></b>';
      });
    });
    return s;
  }
  function tree(x, z, k) {
    var p = '<i class="a3-tp1"></i>';
    return '<div class="a3-tr" style="transform:translate3d(' + x + 'px,0,' + z + 'px) scale(' + k + ')"><div class="a3-sw">' + p + '<i class="a3-tp1" style="transform:rotateY(90deg)"></i></div></div>';
  }
  function walker(c, d, x) {
    return '<div class="a3-wk" style="left:' + x + 'px;animation-delay:-' + d + 's"><u class="a3-wh"></u><u class="a3-wb" style="background:' + c + '"></u></div>';
  }
  function esc(s) { return String(s).replace(/["&<>]/g, function (c) { return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function scene(logo) {
    wi = 0;
    var main = bx(150, 92, 70, 0, 0, 0, 'wl', wns([12, 36, 102, 126], [12, 46]) + '<div class="a3-dr"><u class="a3-dl"></u><u class="a3-dl r"></u></div>', wns([14, 44], [12, 46]));
    var wL = bx(100, 66, 64, -125, 0, -3, 'wl', wns([12, 42, 72], [10, 38]), wns([12, 38], [10, 38]));
    var wR = bx(100, 66, 64, 125, 0, -3, 'wl', wns([12, 42, 72], [10, 38]), wns([12, 38], [10, 38]));
    var roofs = bx(158, 6, 78, 0, 92, 0, 'rf') + bx(108, 6, 72, -125, 66, -3, 'rf') + bx(108, 6, 72, 125, 66, -3, 'rf');
    var tower = bx(44, 40, 44, 0, 98, 0, 'wl', '<div class="a3-ck"><b class="a3-hm"></b><b class="a3-hh"></b></div>') + bx(52, 6, 52, 0, 138, 0, 'rf');
    var pole = bx(2, 34, 2, 0, 144, 0, 'cl');
    var flag = '<div class="a3-fl" style="transform:translate3d(1px,-176px,0)"></div>';
    var por = bx(100, 6, 26, 0, 0, 50, 'cl') + bx(6, 50, 6, -36, 6, 58, 'cl') + bx(6, 50, 6, -12, 6, 58, 'cl') + bx(6, 50, 6, 12, 6, 58, 'cl') + bx(6, 50, 6, 36, 6, 58, 'cl') + bx(92, 5, 32, 0, 56, 48, 'or');
    var pd = '<div class="a3-pd" style="transform:translate3d(-46px,-89px,63px)">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : '') + '</div>';
    var gr = '<div class="a3-gr"><i class="a3-shd"></i><i class="a3-pth"></i></div>';
    var trees = tree(-195, 40, 1) + tree(195, 40, 1) + tree(-160, 115, .85) + tree(160, 115, .85) + tree(-60, 150, .6) + tree(62, 150, .6);
    var wk = walker('#e9a23b', 0, -4) + walker('#1d8ed8', 3.2, 6) + walker('#c2304a', 6.1, -1);
    return '<div class="a3-st">' + gr + trees + main + wL + wR + roofs + tower + pole + flag + por + pd + wk + '</div>';
  }

  function ambient() {
    var orbs = [
      [6, 62, 9, 11, -1, 14], [18, 74, 7, 9, -4, -10], [31, 58, 11, 13, -7, 12], [44, 80, 6, 8, -2, -8], [57, 66, 10, 12, -9, 16],
      [69, 76, 7, 10, -5, -12], [82, 60, 9, 11, -3, 10], [92, 72, 6, 9, -6, -9]
    ].map(function (o) { return '<i class="a3-orb" style="left:' + o[0] + '%;top:' + o[1] + '%;width:' + o[2] + 'px;height:' + o[2] + 'px;--d:' + o[3] + 's;--l:' + o[4] + 's;--dx:' + o[5] + 'px"></i>'; }).join('');
    var sparks = [[12, 22, 0], [27, 9, -1.2], [74, 30, -2.2], [88, 12, -.6], [48, 6, -2.8]].map(function (s) {
      return '<i class="a3-sp" style="left:' + s[0] + '%;top:' + s[1] + '%;--l:' + s[2] + 's"></i>';
    }).join('');
    var bird = function (top, d, l) { return '<span class="a3-bv" style="top:' + top + '%;--d:' + d + 's;--l:' + l + 's"><svg viewBox="0 0 14 8"><path d="M0 5Q3.5 0 7 5Q10.5 0 14 5"/></svg></span>'; };
    return '<div class="a3-amb" aria-hidden="true"><i class="a3-sun"></i><i class="a3-cd a3-c1"></i><i class="a3-cd a3-c2"></i><i class="a3-cd a3-c3"></i>' +
      bird(24, 17, -2) + bird(34, 23, -11) + orbs + sparks + '</div>';
  }

  /* ---------------- ربط المشهد بمستند المستخدم ---------------- */
  function attach(d, win) {
    var card = d.getElementById('card'), app = card && card.parentNode;
    if (!card || !app || !app.classList || !app.classList.contains('app')) return;
    if (d.getElementById('a3-css')) return;     /* مرتبط مسبقاً */

    var style = d.createElement('style'); style.id = 'a3-css'; style.textContent = CSS;
    (d.head || d.documentElement).appendChild(style);
    Perf.tuneDoc(d);

    var host = d.createElement('div');
    host.className = 'a3'; host.setAttribute('aria-hidden', 'true');
    var built = false, st = null, hm = null, hh = null;

    var raf = win.requestAnimationFrame.bind(win), caf = win.cancelAnimationFrame.bind(win);
    var T0 = win.performance.now();
    var isHome = false, inView = true, covered = false, running = false, rid = 0, clockT = 0, coverT = 0;
    var off = 0, vel = 0, dragging = false, idleAt = 0, lastX = 0, lastT = 0, tPrev = 0, pid = null, sc = 0.9;
    var gov = new Perf.Governor(function () { apply(); });

    function build() {
      var img = card.querySelector('.hbn-i img');
      host.innerHTML = ambient() + '<i class="a3-lawn"></i>' + scene(img ? img.getAttribute('src') : '');
      st = host.querySelector('.a3-st'); hm = host.querySelector('.a3-hm'); hh = host.querySelector('.a3-hh');
      built = true; fit(); clock();
    }

    function fit() {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      /* التصميم الأصلي 430×262 */
      sc = Math.max(.5, Math.min(1.02, Math.min(r.width / 430, r.height / 250) * 0.94));
    }

    function clock() {
      if (!hm || !hh) return;
      var n = new Date(), m = n.getMinutes() + n.getSeconds() / 60, h = (n.getHours() % 12) + m / 60;
      hm.style.transform = 'rotate(' + (m * 6).toFixed(1) + 'deg)';
      hh.style.transform = 'rotate(' + (h * 30).toFixed(1) + 'deg)';
    }

    function angle(now) {
      var t = Perf.tier;
      var auto = t >= 1 ? -24 * Math.cos(2 * Math.PI * (now - T0) / 32000) : -18;
      return auto + off;
    }
    function paint(now) {
      st.style.transform = 'rotateX(9deg) rotateY(' + angle(now).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
    }

    function frame(now) {
      rid = raf(frame);
      gov.tick(now);
      var dt = now - tPrev;
      var interval = dragging || Math.abs(vel) > 0.004 ? Perf.frameMs : (1000 / (Perf.targetFps() || Perf.hz));
      if (dt < interval - Perf.frameMs * 0.5) return;
      tPrev = now;
      if (dt > 250) dt = Perf.frameMs;       /* بعد توقف */
      if (!dragging) {
        if (Math.abs(vel) > 0.004) { off += vel * dt; vel *= Math.exp(-dt / 420); } else vel = 0;
        if (now > idleAt) off += (0 - off) * Perf.ease(dt, 900);
      }
      paint(now);
      /* ثبات كامل بالمستوى 0 بعد انتهاء السحب */
      if (Perf.tier === 0 && !dragging && vel === 0 && Math.abs(off) < 0.05) stop();
    }

    /* هل غطّت واجهة أخرى (صفحة المدرسة، محادثة...) المجسم؟ نوقف الحلقة تحتها. */
    function checkCover() {
      var r = host.getBoundingClientRect();
      if (!r.width) return;
      var el = d.elementFromPoint(r.left + r.width / 2, r.top + r.height * 0.6);
      var c = !(el && (el === host || host.contains(el)));
      if (c !== covered) { covered = c; apply(); }
    }

    function start() {
      if (running || !built) return;
      running = true; tPrev = 0; gov.reset();
      rid = raf(frame);
      clearInterval(clockT); clockT = win.setInterval(clock, 20000);
    }
    function stop() {
      if (!running) return;
      running = false; caf(rid); clearInterval(clockT);
    }

    function apply() {
      host.setAttribute('data-tier', Perf.tier);
      var active = isHome && inView && !covered && !d.hidden;
      if (active) host.removeAttribute('data-paused'); else host.setAttribute('data-paused', '');
      if (!active || !built) { stop(); return; }
      if (Perf.tier > 0 || dragging || Math.abs(off) > 0.05 || Math.abs(vel) > 0.004) start();
      else { paint(win.performance.now()); stop(); }
    }

    /* السحب لتدوير المجسم */
    host.addEventListener('pointerdown', function (e) {
      if (!built || e.button > 0) return;
      dragging = true; pid = e.pointerId; lastX = e.clientX; lastT = e.timeStamp; vel = 0;
      try { host.setPointerCapture(pid); } catch (x) {}
      host.style.cursor = 'grabbing';
      start();
    });
    host.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - lastX, dtm = Math.max(1, e.timeStamp - lastT);
      lastX = e.clientX; lastT = e.timeStamp;
      off += dx * 0.5;
      vel = vel * 0.6 + (dx * 0.5 / dtm) * 0.4;      /* درجة/ملّي ثانية */
    });
    function up(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false; host.style.cursor = '';
      off = ((off + 180) % 360 + 360) % 360 - 180;
      idleAt = win.performance.now() + 2200;
      if (Math.abs(vel) > 0.08) vel = vel > 0 ? 0.08 : -0.08;   /* سقف للقصور */
      apply();
    }
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);

    /* حالة الرئيسية: تتبع محتوى البطاقة */
    function sync() {
      var home = !!card.querySelector('.hbn');
      if (home === isHome && (home ? host.parentNode === app : !host.parentNode)) return;
      isHome = home;
      if (home) {
        if (!built) build();
        if (host.parentNode !== app) app.insertBefore(host, card);
        app.classList.add('a3-on');
        clearInterval(coverT); coverT = win.setInterval(checkCover, 700);
        fit();
        var img = card.querySelector('.hbn-i img'), pe = host.querySelector('.a3-pd img');
        if (img && pe && pe.getAttribute('src') !== img.getAttribute('src')) pe.setAttribute('src', img.getAttribute('src'));
      } else {
        if (host.parentNode) host.parentNode.removeChild(host);
        app.classList.remove('a3-on');
        clearInterval(coverT); covered = false;
      }
      apply();
    }
    new win.MutationObserver(sync).observe(card, { childList: true });
    Perf.visible(host, function (v) { inView = v; apply(); });
    d.addEventListener('visibilitychange', apply);
    win.addEventListener('resize', function () { fit(); if (!running && st) paint(win.performance.now()); });
    if (win.ResizeObserver) new win.ResizeObserver(function () { fit(); if (!running && st) paint(win.performance.now()); }).observe(host);
    var unsub = Perf.onChange(function () { if (!d.defaultView) { unsub(); return; } apply(); });
    sync();
  }

  w.AF3D = { version: 1, attach: attach };
  Perf.onUserDoc(attach);
})(window);
