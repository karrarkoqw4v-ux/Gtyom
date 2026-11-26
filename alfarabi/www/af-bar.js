/* af-bar.js — وضع محادثة خفيف جداً: بلا تمويه ولا ظلال ولا حركات ولا خلفية مزخرفة (تقليل التقطيع).
   تصميم المحادثات الأصلي (Kotlin) هو الحل النهائي؛ هذا تخفيف مؤقت للنسخة الحالية. */
(function () {
  'use strict';
  var H = 'html:root body #ch', H2 = 'html:root body #ch#ch';
  var CSS = [
    H + ',' + H + ' *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important;text-shadow:none!important;transition:none!important;animation:none!important}',
    H + ' .ch-m,' + H + ' #cl{background-image:none!important;background-color:#0d1721!important}',
    H + ' .ch-h{background:#14222f!important;border:0!important}',
    /* شريط الكتابة بنمط تيليجرام الزجاجي: كبسولة وحدة فيها إيموجي | نص | مرفقات | كاميرا | دائرة زرقاء (إرسال أو مايك) */
    H + ' .ch-i{direction:ltr!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:0!important;height:47px!important;min-height:47px!important;margin:0 8px calc(10px + env(safe-area-inset-bottom))!important;padding:0 3px 0 8px!important;border-radius:25px!important;background:rgba(24,27,25,.93)!important;border:1px solid rgba(255,255,255,.2)!important;box-shadow:0 6px 18px rgba(0,0,0,.5)!important}',
    H + ' .ch-i .ch-pill{display:contents!important}',
    H + ' .ch-i #cemo{order:1!important}',
    H + ' .ch-i #ci{order:2!important;flex:1 1 auto!important;min-width:0!important;direction:rtl!important;text-align:right!important;font-size:17px!important;font-weight:700!important;color:#eceef1!important;background:transparent!important;border:0!important;padding:10px 8px!important;line-height:26px!important;align-self:center!important;box-sizing:border-box!important}',
    H + ' .ch-i #ci.aci:empty{direction:ltr!important;text-align:left!important}',
    H + ' .ch-i #cplus{order:3!important}',
    H + ' .ch-i #ccam{order:4!important}',
    H2 + ' .ch-i .ch-act{order:5!important;position:relative!important;width:39px!important;height:47px!important;flex:none!important;margin:0 0 0 2px!important;align-self:center!important;top:0!important;transform:none!important}',
    H + ' .ch-i #ce,' + H + ' .ch-i #ca{display:none!important}',
    H + ' .ch-i .ch-c{width:36px!important;height:36px!important;background:transparent!important;border:0!important;color:#b6b9bf!important;flex:none!important;border-radius:50%!important}',
    H + ' .ch-i .ch-c svg{width:23px!important;height:23px!important;stroke-width:1.8!important}',
    H + ' .ch-i #cemo svg{display:none!important}',
    H + ' .ch-i #cemo::after{content:"";display:block;width:28px;height:28px;margin:auto;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%271.9%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Ccircle cx=%2712%27 cy=%2712%27 r=%279%27/%3E%3Cpath d=%27M8 14.5s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%271.9%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Ccircle cx=%2712%27 cy=%2712%27 r=%279%27/%3E%3Cpath d=%27M8 14.5s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01%27/%3E%3C/svg%3E") center/contain no-repeat}',
    H2 + ' .ch-i .ch-act #cs.ch-s,' + H2 + ' .ch-i .ch-act #cmic.ch-mic{position:absolute!important;top:4px!important;right:0!important;left:auto!important;bottom:auto!important;width:39px!important;height:39px!important;border-radius:50%!important;background:#4f77f0!important;background-image:none!important;color:#fff!important;border:0!important;margin:0!important;box-shadow:none!important}',
    H + ' .ch-i .ch-act #cs.ch-s svg,' + H + ' .ch-i .ch-act #cmic.ch-mic svg{width:22px!important;height:22px!important;stroke:#fff!important;fill:none!important}',
    H + ' .ch-i .ch-act #cmic.ch-mic svg{fill:#fff!important}',
    H + ' .ch-i .ch-pill #ci.aci:empty::before{content:"الرسالة"!important;color:#7b7e84!important;font-size:21px!important;font-weight:800!important;opacity:1!important}',
    H + ' .r{content-visibility:auto;contain-intrinsic-size:auto 60px;contain:layout paint}',
    H + ' .r .bb{contain:layout paint}'
  ].join('\n');
  try { window.USER_CSS = (window.USER_CSS || '') + '<style id="af-bar">' + CSS + '</style>'; } catch (e) { }
})();
