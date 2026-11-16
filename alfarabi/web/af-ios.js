/* af-ios.js — شفافية زجاجية بنمط iPhone لأزرار القائمة (الوسط والشريط السفلي) عند تثبيت التطبيق على آيفون/آيباد فقط.
   لا يعمل على Android ولا على الكمبيوتر، ولا يدخل في نسخة التطبيق (APK). */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIOS) return;
  var W = window, D = document;
  D.documentElement.classList.add('afi');

  /* شفافية زجاجية (iOS "Liquid Glass") للأزرار فقط: الأسماء والألوان والترتيب كما هي */
  var CSS = [
    /* أزرار القائمة الرئيسية (الوسط) */
    'html:root body .af-hq-btn{-webkit-backdrop-filter:saturate(200%) blur(22px);backdrop-filter:saturate(200%) blur(22px);border:.5px solid rgba(255,255,255,.75)!important;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.25),0 8px 24px rgba(40,90,150,.12)!important}',
    'html:root body .af-hq-btn:active{opacity:.7}',
    /* الشريط السفلي وأزراره */
    'html:root body *:has(>.nb){background:rgba(255,255,255,.34)!important;-webkit-backdrop-filter:saturate(220%) blur(30px);backdrop-filter:saturate(220%) blur(30px);border:.5px solid rgba(255,255,255,.8)!important;box-shadow:inset 0 1.5px 0 rgba(255,255,255,.9),inset 0 -1px 0 rgba(255,255,255,.3),0 10px 30px rgba(30,60,110,.18)!important}',
    'html:root body .nb{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}',
    'html:root body .nb.on{box-shadow:inset 0 1.5px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.08),0 6px 18px rgba(0,122,255,.3)!important}'
  ].join('\n');

  function addTo(d, id) { try { if (!d || !d.head || d.getElementById(id)) return; var s = d.createElement('style'); s.id = id; s.textContent = CSS; d.head.appendChild(s); } catch (e) { } }
  addTo(D, 'af-ios');

  /* واجهات المستخدم (طالب/مدرس/ولي أمر) + الإدارة: تُحقن عند توفّر المصادر */
  var tries = 0, doneU = false, doneA = false;
  var iv = setInterval(function () {
    tries++;
    try {
      if (!doneU && typeof W.USER_CSS === 'string') { W.USER_CSS += '<style id="af-ios">' + CSS + '</style>'; doneU = true; }
      if (!doneA && typeof W.ADMIN_SRC === 'string') { W.ADMIN_SRC = W.ADMIN_SRC.replace('</head>', function () { return '<style id="af-ios">' + CSS + '</style></head>'; }); doneA = true; }
      if (W.AFPerf && W.AFPerf.onUserDoc && !W.__afiPerf) { W.__afiPerf = 1; W.AFPerf.onUserDoc(function (d) { addTo(d, 'af-ios'); }); }
    } catch (e) { }
    if ((doneU && doneA && W.__afiPerf) || tries > 100) clearInterval(iv);
  }, 100);
})();
