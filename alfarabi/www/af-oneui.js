/* af-oneui.js — سلاسة بنمط سامسونج One UI: حركة دخول متتابعة للنصوص والبطاقات، ضغط ناعم بنطّة للأزرار،
   انزلاق للمحادثة. الألوان والتصميم والأسماء كما هي. حركات transform/opacity فقط (خفيفة على المعالج). */
(function () {
  'use strict';
  var E = 'cubic-bezier(.22,1,.36,1)', S = 'cubic-bezier(.34,1.56,.64,1)';
  var CSS = [
    '@media (prefers-reduced-motion:no-preference){',
    '@keyframes oUp{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:none}}',
    '@keyframes oPop{from{opacity:0;transform:scale(.86) translateY(10px)}55%{transform:scale(1.025)}to{opacity:1;transform:none}}',
    '@keyframes oSl{from{opacity:0;transform:translateX(-34px)}to{opacity:1;transform:none}}',
    '#card>*{animation:oUp .55s ' + E + ' both}',
    '#card>*:nth-child(2){animation-delay:.04s}#card>*:nth-child(3){animation-delay:.08s}#card>*:nth-child(4){animation-delay:.12s}#card>*:nth-child(5){animation-delay:.16s}#card>*:nth-child(n+6){animation-delay:.2s}',
    '.sc>*{animation:oUp .55s ' + E + ' both}',
    '.sc>*:nth-child(2){animation-delay:.04s}.sc>*:nth-child(3){animation-delay:.08s}.sc>*:nth-child(4){animation-delay:.12s}.sc>*:nth-child(5){animation-delay:.16s}.sc>*:nth-child(6){animation-delay:.2s}.sc>*:nth-child(7){animation-delay:.24s}.sc>*:nth-child(8){animation-delay:.28s}.sc>*:nth-child(n+9){animation-delay:.32s}',
    '.af-hq-btn{animation:oPop .6s ' + E + ' both}',
    '.af-hq-grid>*:nth-child(2){animation-delay:.07s}.af-hq-grid>*:nth-child(3){animation-delay:.14s}.af-hq-grid>*:nth-child(4){animation-delay:.21s}.af-hq-grid>*:nth-child(5){animation-delay:.28s}',
    '#ch.on,#gi.on{animation:oSl .45s ' + E + ' both}',
    '#cl .r:last-child{animation:oUp .4s ' + E + ' both}',
    '}',
    'button,.option,.chip,.nb,.li,.af-hq-btn,.tc{transition:transform .38s ' + S + ',opacity .2s,background-color .25s!important}',
    'button:active,.option:active,.chip:active,.nb:active,.af-hq-btn:active,.tc:active{transform:scale(.93)!important;transition-duration:.09s!important}'
  ].join('\n');
  try {
    window.USER_CSS = (window.USER_CSS || '') + '<style id="af-oneui">' + CSS + '</style>';
    var t = 0, iv = setInterval(function () {
      t++;
      if (typeof window.ADMIN_SRC === 'string') {
        if (window.ADMIN_SRC.indexOf('id="af-oneui"') < 0) window.ADMIN_SRC = window.ADMIN_SRC.replace('</head>', function () { return '<style id="af-oneui">' + CSS + '</style></head>'; });
        clearInterval(iv);
      } else if (t > 100) clearInterval(iv);
    }, 100);
    /* واجهات الدخول بالصفحة الرئيسية: ضغط ناعم فقط */
    var st = document.createElement('style'); st.id = 'af-oneui-main';
    st.textContent = '.option,.btn,.btn-primary,.chip{transition:transform .38s ' + S + ',opacity .2s,background-color .25s!important}.option:active,.btn:active,.btn-primary:active,.chip:active{transform:scale(.95)!important;transition-duration:.09s!important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { try { console.warn('af-oneui', e); } catch (x) { } }
})();
