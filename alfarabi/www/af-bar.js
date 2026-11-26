/* af-bar.js — شريط الكتابة السفلي بنمط واتساب محسّن: كبسولة عائمة بظل خفيف، أيقونات بلا دوائر،
   زر إرسال/بصمة أكبر بظل بلون الثيم. الألوان تبقى من الثيم الحالي ولا تتغير. */
(function () {
  'use strict';
  var H = 'html:root body #ch';
  var CSS = [
    H + ' .ch-h{background:linear-gradient(180deg,rgba(32,42,49,.97),rgba(26,34,40,.92))!important;border-bottom:1px solid rgba(255,255,255,.07)!important;box-shadow:0 4px 16px rgba(0,0,0,.35)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);gap:4px!important;padding-bottom:8px!important}',
    H + ' .ch-h .ch-p{background:transparent!important;box-shadow:none!important;border:0!important;border-radius:14px!important;padding:0 6px!important}',
    H + ' .ch-h .ch-c{background:transparent!important;box-shadow:none!important;border:0!important;width:40px!important;height:40px!important;transition:transform .15s,background .15s!important}',
    H + ' .ch-h .ch-c:active{background:rgba(255,255,255,.12)!important;transform:scale(.86)!important}',
    H + ' .ch-h .tx b{font-size:16.5px!important;font-weight:800!important}',
    H + ' .ch-i{background:transparent!important;border:0!important;box-shadow:none!important;padding:6px 10px calc(8px + env(safe-area-inset-bottom))!important;gap:8px!important;align-items:flex-end!important;margin:0!important}',
    H + ' .ch-pill{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03)),#202a31!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:26px!important;min-height:50px!important;box-shadow:0 6px 18px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.06)!important;padding:0 6px!important}',
    H + ' .ch-i .ch-c{background:transparent!important;border:0!important;box-shadow:none!important;width:40px!important;height:40px!important;border-radius:50%!important;transition:transform .15s,background .15s!important}',
    H + ' .ch-i .ch-c:active{background:rgba(255,255,255,.12)!important;transform:scale(.86)!important}',
    H + ' #ci{font-size:16px!important}',
    H + ' #cs.ch-s,' + H + ' #cmic{width:52px!important;height:52px!important;border-radius:50%!important;box-shadow:0 6px 16px rgba(0,0,0,.4)!important;transition:transform .15s!important}',
    H + ' #cs.ch-s:active,' + H + ' #cmic:active{transform:scale(.9)!important}'
  ].join('\n');
  try { window.USER_CSS = (window.USER_CSS || '') + '<style id="af-bar">' + CSS + '</style>'; } catch (e) { }
})();
