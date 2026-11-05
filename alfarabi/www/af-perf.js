/* ============================================================
 * af-perf.js — محرك الأداء وقراءة هرتز الشاشة
 * ثانوية الفارابي الأهلية للبنين
 *
 *  - يقيس معدل تحديث الشاشة الحقيقي (60 / 90 / 120 / 144 ...) ويحفظه.
 *  - يحدد مستوى الجودة (tier) من قدرة الجهاز: ذاكرة، معالج، توفير بيانات،
 *    تقليل الحركة، وهرتز الشاشة.
 *  - مراقب أداء حيّ: إذا شاف تقطيع ينزّل الجودة تلقائياً ويتذكر القرار.
 *  - أدوات مشتركة: مؤقت إطارات بحسب الهرتز، تنعيم مستقل عن الهرتز،
 *    مراقبة الظهور، idle.
 *
 *  tier 3 = كامل | 2 = عالي | 1 = خفيف | 0 = ثابت (بدون حركة تلقائية)
 *  لإظهار لوحة التشخيص: أضف ?afperf=1 لرابط الصفحة.
 * ============================================================ */
(function (w) {
  'use strict';
  if (w.AFPerf) return;

  var doc = w.document, root = doc.documentElement;
  var STEPS = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 240];
  var LSK_HZ = 'af_hz_v1', LSK_TIER = 'af_tier_v1';
  var listeners = [];

  function ls(k, v) {
    try {
      if (v === undefined) return w.localStorage.getItem(k);
      if (v === null) w.localStorage.removeItem(k); else w.localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  }

  function snap(hz) {
    var best = STEPS[0], d = 1e9;
    for (var i = 0; i < STEPS.length; i++) {
      var x = Math.abs(STEPS[i] - hz);
      if (x < d) { d = x; best = STEPS[i]; }
    }
    return best;
  }

  /* ---------- قدرة الجهاز → مستوى أولي ---------- */
  function deviceTier() {
    var n = w.navigator || {}, t = 3;
    try { if (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0; } catch (e) {}
    var c = n.connection || n.mozConnection || n.webkitConnection;
    if (c && c.saveData) t = Math.min(t, 1);
    if (n.deviceMemory) { if (n.deviceMemory <= 2) t = Math.min(t, 1); else if (n.deviceMemory <= 4) t = Math.min(t, 2); }
    if (n.hardwareConcurrency && n.hardwareConcurrency <= 4) t = Math.min(t, 2);
    return t;
  }

  function savedTier() {
    try {
      var s = JSON.parse(ls(LSK_TIER) || 'null');
      if (s && typeof s.t === 'number' && Date.now() - s.ts < 3 * 864e5) return s.t;
    } catch (e) {}
    return null;
  }

  var st = {
    hz: 60,
    frameMs: 1000 / 60,
    measured: false,
    tier: 3,
    base: 3,
    fps: 0
  };
  var cachedHz = parseInt(ls(LSK_HZ), 10);
  if (cachedHz > 0) { st.hz = snap(cachedHz); st.frameMs = 1000 / st.hz; }
  st.base = deviceTier();
  var sv = savedTier();
  st.tier = sv === null ? st.base : Math.min(st.base, sv);

  function publish() {
    try {
      root.style.setProperty('--af-hz', st.hz);
      root.style.setProperty('--af-frame', st.frameMs.toFixed(2) + 'ms');
      root.setAttribute('data-af-hz', st.hz);
      root.setAttribute('data-af-tier', st.tier);
    } catch (e) {}
    var ls_ = listeners.slice();
    for (var i = 0; i < ls_.length; i++) { try { ls_[i](st); } catch (e) {} }
  }

  /* ---------- قياس الهرتز ---------- */
  var measuring = false;
  function measure(done) {
    if (measuring || doc.hidden) { if (doc.hidden) afterVisible(function () { measure(done); }); return; }
    measuring = true;
    var dts = [], last = 0, n = 0, raf = w.requestAnimationFrame.bind(w);
    function step(t) {
      if (doc.hidden) { measuring = false; afterVisible(function () { measure(done); }); return; }
      if (last) {
        var d = t - last;
        if (n++ > 6 && d < 100) dts.push(d);   /* نتجاوز أول إطارات الإحماء */
      }
      last = t;
      if (dts.length < 48 && n < 240) return raf(step);
      measuring = false;
      if (dts.length >= 12) {
        dts.sort(function (a, b) { return a - b; });
        /* الشريحة الربعية الأولى: تتحمل الإطارات البطيئة العرضية */
        var q = dts[Math.floor(dts.length * 0.25)];
        var hz = snap(1000 / q);
        st.hz = hz; st.frameMs = 1000 / hz; st.measured = true;
        ls(LSK_HZ, String(hz));
        /* شاشة 30 هرتز غالباً وضع توفير طاقة: نخفف الجودة */
        if (hz <= 30) st.tier = Math.min(st.tier, 2);
        publish();
      }
      if (done) done(st);
    }
    raf(step);
  }
  function afterVisible(fn) {
    var h = function () { if (!doc.hidden) { doc.removeEventListener('visibilitychange', h); fn(); } };
    doc.addEventListener('visibilitychange', h);
  }

  /* ---------- مراقب الأداء (governor) ---------- */
  /* يُغذّى من حلقة المشهد: tick(rafTimestamp) في كل إطار rAF خام. */
  function Governor(onTier) {
    var win = [], WIN = 90, last = 0, cool = 0, drops = 0, warm = 0, strikes = 0;
    this.reset = function () { win.length = 0; last = 0; warm = 0; strikes = 0; };
    this.tick = function (now) {
      /* فترة إحماء 2.5 ثانية: التحميل الأول (تحليل الصفحة والخطوط) ليس مقياساً حقيقياً */
      if (!warm) warm = now + 2500;
      if (now < warm) { last = now; return; }
      if (!last) { last = now; return; }
      var d = now - last; last = now;
      if (d > 300) { win.length = 0; return; }      /* توقف/تبديل تبويب */
      win.push(d);
      if (win.length < WIN) return;
      var budget = st.frameMs, bad = 0, sum = 0;
      for (var i = 0; i < win.length; i++) { sum += win[i]; if (win[i] > budget * 1.75) bad++; }
      st.fps = Math.round(1000 / (sum / win.length));
      var ratio = bad / win.length;
      win.length = 0;
      if (ratio <= 0.18) { strikes = 0; return; }
      /* نافذتان سيئتان متتاليتان قبل التخفيض (لا نعاقب تعثّراً عابراً) */
      if (++strikes < 2 || now < cool || st.tier <= 0) return;
      strikes = 0; drops++;
      st.tier = drops >= 3 ? 0 : st.tier - 1;
      cool = now + 5000;
      ls(LSK_TIER, JSON.stringify({ t: st.tier, ts: Date.now() }));
      publish();
      if (onTier) onTier(st.tier);
    };
  }

  /* ---------- أدوات ---------- */
  /* عدد الإطارات المسموح بها حسب المستوى والهرتز */
  function targetFps(tier) {
    tier = tier === undefined ? st.tier : tier;
    if (tier <= 0) return 0;
    if (tier === 1) return Math.min(30, st.hz);
    if (tier === 2) return Math.min(60, st.hz);
    return st.hz;
  }
  /* تنعيم مستقل عن الهرتز: alpha = 1 - e^(-dt/tau) */
  function ease(dt, tauMs) { return 1 - Math.exp(-dt / tauMs); }

  function idle(fn, timeout) {
    if (w.requestIdleCallback) return w.requestIdleCallback(fn, { timeout: timeout || 1500 });
    return w.setTimeout(function () { fn({ timeRemaining: function () { return 8; } }); }, 60);
  }

  /* مراقبة ظهور عنصر على الشاشة */
  function visible(el, cb) {
    var win = el.ownerDocument.defaultView || w;
    if (!win.IntersectionObserver) { cb(true); return function () {}; }
    var io = new win.IntersectionObserver(function (es) { cb(es[es.length - 1].isIntersecting); }, { threshold: 0.01 });
    io.observe(el);
    return function () { io.disconnect(); };
  }

  /* ---------- لوحة تشخيص اختيارية ---------- */
  function badge() {
    var q = ''; try { q = w.location.search; } catch (e) {}
    if (!/[?&]afperf=1/.test(q) && ls('af_debug') !== '1') return;
    var el = doc.createElement('div');
    el.style.cssText = 'position:fixed;z-index:2147483647;left:6px;top:6px;padding:4px 8px;border-radius:8px;background:rgba(10,20,40,.78);color:#8fe3ff;font:11px/1.4 monospace;pointer-events:none;direction:ltr';
    function up() { el.textContent = st.hz + 'Hz · fps ' + (st.fps || '–') + ' · tier ' + st.tier + (st.measured ? '' : ' (est)'); }
    (doc.body || root).appendChild(el); up();
    w.setInterval(up, 700);
  }

  /* ---------- تحسينات عامة للصفحة ---------- */
  function pageTuning() {
    var s = doc.createElement('style');
    s.id = 'af-perf-css';
    s.textContent =
      /* لمس أسرع: بدون تأخير النقر المزدوج */
      'a,button,input,select,textarea,label,.option,.nb,.chip{touch-action:manipulation}' +
      /* مستوى خفيف: تخفيف الضبابية الزجاجية (أثقل عنصر على GPU الجوال) */
      'html[data-af-tier="1"] .card,html[data-af-tier="1"] .nav,html[data-af-tier="0"] .card,html[data-af-tier="0"] .nav{' +
      '-webkit-backdrop-filter:blur(8px)!important;backdrop-filter:blur(8px)!important}' +
      'html[data-af-tier="0"] .card,html[data-af-tier="0"] .nav{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}';
    (doc.head || root).appendChild(s);
  }

  /* ---------- مراقب واجهة الطالب/المدرس/ولي الأمر ----------
   * واجهات المستخدم تُبنى داخل iframe#adminFrame. هذا المراقب يكتشف لحظة جاهزية
   * مستند المستخدم (وليس الإدارة) ويستدعي الملحقات المسجلة بدون التدخل بكود الواجهة. */
  var udCbs = [], udSeen = w.WeakSet ? new WeakSet() : null, udTimer = 0, udIsUser = false, udWired = false;
  function udFrame() { return doc.getElementById('adminFrame'); }
  function udScan() {
    var f = udFrame();
    if (!f || !udIsUser || f.style.display === 'none') return false;
    var d; try { d = f.contentDocument; } catch (e) { return false; }
    if (!d || !d.getElementById) return false;
    var card = d.getElementById('card');
    if (!card || !card.firstElementChild || !d.getElementById('nav')) return false;
    if (udSeen) { if (udSeen.has(d)) return true; udSeen.add(d); }
    var cw = f.contentWindow;
    for (var i = 0; i < udCbs.length; i++) { try { udCbs[i](d, cw, f); } catch (e) { if (w.console) console.warn('AF userDoc', e); } }
    return true;
  }
  function udPoll() {
    clearTimeout(udTimer);
    var t0 = Date.now();
    (function loop() {
      if (udScan() || Date.now() - t0 > 9000) return;
      udTimer = w.setTimeout(loop, 40);
    })();
  }
  function udCheck() {
    var f = udFrame(); if (!f) return;
    var s = f.srcdoc || '';
    udIsUser = !!s && s.indexOf('U=P.CUR') > -1;   /* علامة userMain، غير موجودة في واجهة الإدارة */
    if (udIsUser && f.style.display !== 'none') udPoll();
  }
  function udWire() {
    if (udWired) return; var f = udFrame(); if (!f) return; udWired = true;
    new w.MutationObserver(udCheck).observe(f, { attributes: true, attributeFilter: ['srcdoc', 'style'] });
    f.addEventListener('load', function () { udCheck(); });
    udCheck();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', udWire); else udWire();

  w.AFPerf = {
    onUserDoc: function (cb) {
      udCbs.push(cb);
      /* إذا كانت الواجهة مفتوحة أصلاً قبل تحميل الملف */
      try { var f = udFrame(); if (f && udIsUser && f.contentDocument && udSeen && udSeen.has(f.contentDocument)) cb(f.contentDocument, f.contentWindow, f); else udCheck(); } catch (e) {}
    },
    get hz() { return st.hz; },
    get frameMs() { return st.frameMs; },
    get tier() { return st.tier; },
    get fps() { return st.fps; },
    get measured() { return st.measured; },
    measure: measure,
    Governor: Governor,
    targetFps: targetFps,
    ease: ease,
    idle: idle,
    visible: visible,
    onChange: function (fn) { listeners.push(fn); return function () { var i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; },
    /* يطبّق نفس الإعدادات على مستند آخر (مثل iframe الطالب) */
    tuneDoc: function (d) {
      try {
        var r = d.documentElement;
        if (r.getAttribute('data-af-tuned')) return;
        r.setAttribute('data-af-tuned', '1');
        r.style.setProperty('--af-hz', st.hz);
        r.setAttribute('data-af-hz', st.hz);
        r.setAttribute('data-af-tier', st.tier);
        var fn = function () {
          if (!d.defaultView) { var i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); return; }
          try { r.setAttribute('data-af-tier', st.tier); r.setAttribute('data-af-hz', st.hz); } catch (e) {}
        };
        listeners.push(fn);
        if (!d.getElementById('af-perf-css')) {
          var s = d.createElement('style'); s.id = 'af-perf-css';
          var src = doc.getElementById('af-perf-css');
          s.textContent = src ? src.textContent : '';
          (d.head || r).appendChild(s);
        }
      } catch (e) {}
    }
  };

  publish();
  pageTuning();
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', badge); else badge();
  /* نقيس بعد أول رسم لعدم التأثير على التحميل */
  (w.requestAnimationFrame || w.setTimeout)(function () { idle(function () { measure(); }, 2500); });
  /* إعادة القياس إذا رجع المستخدم بعد مدة طويلة (قد يتغير وضع الطاقة) */
  var hiddenAt = 0;
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 120000) idle(function () { measure(); }, 2500);
  });
})(window);
