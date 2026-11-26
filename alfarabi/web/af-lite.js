/* af-lite.js — تخفيف المحادثات والجروبات (تقطيع):
   1) إضافة الرسائل الجديدة بدل إعادة بناء كل الرسائل (والصور) عند كل رسالة.
   2) فك ترميز الصور خارج الخيط الرئيسي وتحميلها كسولاً.
   3) إزالة التغبيش والظلال الثقيلة والحركات المتكررة داخل المحادثة (نفس الألوان والتصميم). */
(function () {
  'use strict';

  var HELPERS = `
function afChunks(vis,top){vis=vis.filter(function(x){return !x.dl});var o=[],last='';if(top&&cg&&cg[0]==='d')o.push({k:'n',h:'<div class="chn">هذه محادثة خاصة بين الطرفين</div>'});
 vis.forEach(function(x){var k=new Date(x.ts).toDateString();if(k!==last){last=k;o.push({k:'d'+k,h:'<div class="chd"><span>'+dayLabel(x.ts)+'</span></div>'})}o.push({k:'m'+x.id,h:x.c?cbub(x):bub(x)})});return o}
function afReconcile(l,list,room){
 if(l.__rk!==room||!l.__ck){l.innerHTML='';l.__ck={};l.__rk=room}
 var M=l.__ck,seen={},prev=null,i,c,k,o,el,tp,want;
 for(i=0;i<list.length;i++){c=list[i];if(!c.h)continue;k=c.k;if(seen[k])k=k+'~'+i;seen[k]=1;o=M[k];
  if(o&&o.h===c.h&&o.el.parentNode===l){el=o.el}
  else{tp=l.ownerDocument.createElement('template');tp.innerHTML=c.h;el=tp.content.firstElementChild;if(!el)continue;
   if(o&&o.el.parentNode===l)l.replaceChild(el,o.el);M[k]={h:c.h,el:el}}
  want=prev?prev.nextSibling:l.firstChild;if(el!==want)l.insertBefore(el,want);prev=el}
 for(k in M){if(!seen[k]){if(M[k].el.parentNode===l)l.removeChild(M[k].el);delete M[k]}}}
`;

  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var n = 0;
      function rep(a, b) { if (src.indexOf(a) > -1) { src = src.split(a).join(b); n++; } }
      /* (1) تحديث الرسائل بالمطابقة بدل إعادة بناء الشاشة كلها (يلغي الوميض/الرمشة عند تبادل الرسائل) */
      rep("l.innerHTML=(all.length>vis.length?'<button class=\"ldm\" id=\"ldm\">تحميل الرسائل الأقدم</button>':'')+(withDays(vis,all.length===vis.length)||'<div class=\"em\">لا توجد رسائل بعد</div>');l.scrollTop=end?l.scrollHeight:y}",
        "var __ch=[];if(all.length>vis.length)__ch.push({k:'ldm',h:'<button class=\"ldm\" id=\"ldm\">تحميل الرسائل الأقدم</button>'});var __wc=afChunks(vis,all.length===vis.length);__wc.forEach(function(c){__ch.push(c)});if(!__wc.length)__ch.push({k:'em',h:'<div class=\"em\">لا توجد رسائل بعد</div>'});afReconcile(l,__ch,cg);l.scrollTop=end?l.scrollHeight:y;if(end){var __l=l,__f=function(){__l.scrollTop=__l.scrollHeight};requestAnimationFrame(function(){__f();requestAnimationFrame(__f)});[].forEach.call(l.querySelectorAll('img.mi'),function(im){if(!im.complete)im.addEventListener('load',__f,{once:true})})}}");
      /* (2) الصور */
      rep('<img class="mi" data-iv="1" src="', '<img class="mi" data-iv="1" decoding="async" src="');
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + HELPERS + '\n}';
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
