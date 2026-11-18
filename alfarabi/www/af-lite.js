/* af-lite.js — تخفيف المحادثات والجروبات (تقطيع):
   1) إضافة الرسائل الجديدة بدل إعادة بناء كل الرسائل (والصور) عند كل رسالة.
   2) فك ترميز الصور خارج الخيط الرئيسي وتحميلها كسولاً.
   3) إزالة التغبيش والظلال الثقيلة والحركات المتكررة داخل المحادثة (نفس الألوان والتصميم). */
(function () {
  'use strict';
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var n = 0;
      function rep(a, b) { if (src.indexOf(a) > -1) { src = src.split(a).join(b); n++; } }
      /* (1) إلحاق بدل إعادة بناء */
      rep("l.innerHTML=(all.length>vis.length?'<button class=\"ldm\" id=\"ldm\">تحميل الرسائل الأقدم</button>':'')+(withDays(vis,all.length===vis.length)||'<div class=\"em\">لا توجد رسائل بعد</div>');l.scrollTop=end?l.scrollHeight:y}",
        "var h=(all.length>vis.length?'<button class=\"ldm\" id=\"ldm\">تحميل الرسائل الأقدم</button>':'')+(withDays(vis,all.length===vis.length)||'<div class=\"em\">لا توجد رسائل بعد</div>'),ph=l.__ph;if(ph&&l.__pg===cg&&h.length>ph.length&&h.indexOf(ph)===0){l.insertAdjacentHTML('beforeend',h.slice(ph.length))}else{l.innerHTML=h}l.__ph=h;l.__pg=cg;l.scrollTop=end?l.scrollHeight:y;if(end){var __l=l,__f=function(){__l.scrollTop=__l.scrollHeight};requestAnimationFrame(function(){__f();requestAnimationFrame(__f)});[].forEach.call(l.querySelectorAll('img.mi'),function(im){if(!im.complete)im.addEventListener('load',__f,{once:true})})}}");
      /* (2) الصور */
      rep('<img class="mi" data-iv="1" src="', '<img class="mi" data-iv="1" decoding="async" src="');
      window.userMain = (0, eval)('(' + src + ')');
    }
    /* (3) تخفيف الرسوم */
    window.USER_CSS = (window.USER_CSS || '') + '<style id="af-lite">' +
      '#ch *,#gi *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' +
      '#ch .r .bb,#gi .r .bb{box-shadow:none!important}' +
      '#ch .r,#gi .r{animation:none!important}' +
      '#cl{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;will-change:scroll-position}' +
      '</style>';
  } catch (e) { try { console.warn('af-lite', e); } catch (x) { } }
})();
