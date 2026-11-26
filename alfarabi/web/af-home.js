/* af-home.js — الصفحة الرئيسية نظيفة: خلفية موحّدة بدون ألوان زائدة ولا تحريك ولا تمويه (تقطيع أقل)،
   ولون الصفحة نفسه عند الحافتين فيطابق شريطي الجهاز بدون أي حدود. */
(function () {
  'use strict';
  var CSS = [
    'html,body{background:#eef4fd!important}',
    'html body .bg{inset:0!important;background:linear-gradient(180deg,#f3f8ff,#e9f2fd)!important;animation:none!important;will-change:auto!important;filter:none!important;transform:none!important}',
    'html body .bg-tint{display:none!important}',
    'html body *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'
  ].join('\n');
  try {
    window.USER_CSS = (window.USER_CSS || '') + '<style id="af-home-u">' + CSS + '</style>';
    var t = 0, iv = setInterval(function () {
      t++;
      if (typeof window.ADMIN_SRC === 'string') {
        if (window.ADMIN_SRC.indexOf('id="af-home-u"') < 0) window.ADMIN_SRC = window.ADMIN_SRC.replace('</head>', function () { return '<style id="af-home-u">' + CSS + '</style></head>'; });
        clearInterval(iv);
      } else if (t > 100) clearInterval(iv);
    }, 100);
  } catch (e) { }
  try {
    var st = document.createElement('style'); st.id = 'af-home'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { }
})();
