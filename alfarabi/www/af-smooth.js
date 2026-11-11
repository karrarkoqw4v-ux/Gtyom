/* ============================================================
 * af-smooth.js — سلاسة تسجيل الدخول والاستخدام
 * ثانوية الفارابي الأهلية للبنين
 *
 *  1) انتقال ناعم عند فتح التطبيق بعد الدخول: لا وميض أبيض، الواجهة تظهر
 *     بتلاشي هادئ فوق شاشة الدخول بعد ما تجهز.
 *  2) شاشة الدخول أخف: توهّج الشعار صار حركة transform بدل filter (يعيد الرسم كل إطار).
 *  3) لوحة المفاتيح: زر Enter ينقلك للحقل التالي بدل ما يرسل النموذج ناقصاً،
 *     وآخر حقل يظهر زر "تم/دخول" (enterkeyhint).
 *  4) حماية من الضغط المزدوج على الإرسال.
 *  5) واجهات المستخدم (طالب/مدرس/ولي أمر) فقط: ردة فعل لمس فورية، تمرير أنعم،
 *     وبدون تأخير النقر. واجهة الإدارة لا تُمَسّ.
 *  يعتمد على af-perf.js (يقرأ هرتز الشاشة ويحدد مستوى الجودة).
 * ============================================================ */
(function (w) {
  'use strict';
  var Perf = w.AFPerf;
  if (w.AFSmooth || !Perf) return;
  var doc = w.document;

  /* ---------- 2) تنسيقات صفحة الدخول ---------- */
  var PAGE_CSS = [
    /* توهج الشعار: حركة طفو خفيفة (compositor) بدل تغيير filter كل إطار */
    '@keyframes afFloat{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-3px)}}',
    '.card:not(.welcome):not([hidden])>.logo{animation:afFade .4s both!important}',
    'html[data-af-tier="1"] .card:not(.welcome):not([hidden])>.logo,html[data-af-tier="0"] .card:not(.welcome):not([hidden])>.logo{animation:afFade .55s both!important}',
    /* ردة فعل لمس فورية */
    '.option,.btn-primary,.btn,.chip,button{transition:transform .12s ease,opacity .16s ease,background-color .2s ease,border-color .2s ease}',
    '.option:active,.btn-primary:active{transform:scale(.97)}',
    /* إطار الواجهة: تلاشي عند الظهور */
    '#adminFrame.af-hold{opacity:0}',
    '#adminFrame.af-show{opacity:1;transition:opacity .32s ease}',
    /* عند استرجاع الجلسة تلقائياً لا نُظهر شاشة الدخول إطلاقاً */
    'html.af-restoring .card{visibility:hidden}'
  ].join('\n');

  var USER_CSS = [
    'html,body{-webkit-text-size-adjust:100%}',
    'button,a,.nb,.option,.chip,.rw,.li,[data-v]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.nb{transition:transform .12s ease,background-color .2s ease,color .2s ease}',
    '.nb:active{transform:scale(.94)}',
    '.option:active,.rw:active,.li:active{transform:scale(.985)}',
    '.sc,.list,.msgs,#cl,.ch-l{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}',
    /* تنعيم ظهور محتوى البطاقة عند التنقل بين الصفحات */
    '.card{will-change:auto}'
  ].join('\n');

  function addStyle(d, id, css) {
    if (d.getElementById(id)) return;
    var s = d.createElement('style'); s.id = id; s.textContent = css;
    (d.head || d.documentElement).appendChild(s);
  }

  /* ---------- 1) تسليم الإطار بدون وميض ---------- */
  var frame = null, holdT = 0;
  function reveal() {
    clearTimeout(holdT);
    doc.documentElement.classList.remove('af-restoring');
    if (!frame) return;
    frame.classList.remove('af-hold');
    frame.classList.add('af-show');
  }
  function hold() {
    clearTimeout(holdT);
    /* أول ثواني بعد فتح الصفحة = استرجاع جلسة، وليس دخولاً يدوياً */
    if (w.performance.now() < 4000) doc.documentElement.classList.add('af-restoring');
    frame.classList.remove('af-show');
    frame.classList.add('af-hold');
    /* شبكة أمان: لا نترك الواجهة مخفية أبداً */
    holdT = w.setTimeout(reveal, 1800);
  }
  function wireFrame() {
    frame = doc.getElementById('adminFrame');
    if (!frame) return;
    var lastSrc = frame.srcdoc || '';
    new w.MutationObserver(function () {
      var s = frame.srcdoc || '';
      var shown = frame.style.display !== 'none';
      var isUser = s.indexOf('U=P.CUR') > -1;
      if (!shown || !s) { clearTimeout(holdT); frame.classList.remove('af-hold', 'af-show'); lastSrc = s; return; }
      /* نطبّق التلاشي لواجهات المستخدم فقط؛ الإدارة تبقى كما هي حرفياً */
      if (isUser && s !== lastSrc) hold();
      lastSrc = s;
    }).observe(frame, { attributes: true, attributeFilter: ['srcdoc', 'style'] });
    /* تظهر الواجهة بعد جاهزية المستند (وبعد إدراج المجسم) */
    Perf.onUserDoc(function (d, win) {
      Perf.tuneDoc(d);
      addStyle(d, 'af-smooth-user', USER_CSS);
      /* إطاران متتاليان: يضمن أن أول رسم اكتمل بتخطيطه النهائي */
      win.requestAnimationFrame(function () { win.requestAnimationFrame(reveal); });
    });
    frame.addEventListener('load', function () { if (frame.classList.contains('af-hold')) w.setTimeout(reveal, 60); });
  }

  /* ---------- 3) و 4) نماذج الدخول ---------- */
  var TEXT_T = /^(text|password|tel|search|email|number|url)$/;
  function fields(form) {
    return Array.prototype.filter.call(form.querySelectorAll('input,select,textarea'), function (el) {
      if (el.disabled || el.type === 'hidden' || el.type === 'checkbox' || el.type === 'radio' || el.type === 'file') return false;
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }
  function hints(form) {
    var fs = fields(form);
    fs.forEach(function (el, i) {
      if (el.tagName === 'INPUT' && TEXT_T.test(el.type || 'text')) el.setAttribute('enterkeyhint', i === fs.length - 1 ? 'go' : 'next');
    });
  }
  doc.addEventListener('focusin', function (e) {
    var t = e.target, f = t && t.form;
    if (f && t.tagName === 'INPUT') hints(f);
  }, true);
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    var t = e.target;
    if (!t || t.tagName !== 'INPUT' || !TEXT_T.test(t.type || 'text') || !t.form) return;
    var fs = fields(t.form), i = fs.indexOf(t);
    if (i > -1 && i < fs.length - 1) {          /* ليس آخر حقل: انتقل للتالي */
      e.preventDefault();
      fs[i + 1].focus();
    }
  }, true);

  var lastSubmit = new WeakMap();
  doc.addEventListener('submit', function (e) {
    var f = e.target, now = Date.now(), p = lastSubmit.get(f) || 0;
    if (now - p < 450) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    lastSubmit.set(f, now);
  }, true);

  /* ---------- تشغيل ---------- */
  function init() {
    addStyle(doc, 'af-smooth-css', PAGE_CSS);
    wireFrame();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();

  w.AFSmooth = { version: 1 };
})(window);
