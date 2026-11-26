/* af-bar.js — وضع محادثة خفيف جداً: بلا تمويه ولا ظلال ولا حركات ولا خلفية مزخرفة (تقليل التقطيع).
   تصميم المحادثات الأصلي (Kotlin) هو الحل النهائي؛ هذا تخفيف مؤقت للنسخة الحالية. */
(function () {
  'use strict';
  var H = 'html:root body #ch';
  var CSS = [
    H + ',' + H + ' *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important;text-shadow:none!important;transition:none!important;animation:none!important}',
    H + ' .ch-m,' + H + ' #cl{background-image:none!important;background-color:#0d1721!important}',
    H + ' .ch-h{background:#14222f!important;border:0!important}',
    H + ' .ch-i{background:#14222f!important;border:0!important;border-radius:0!important;margin:0!important;padding:6px 8px calc(6px + env(safe-area-inset-bottom))!important}',
    H + ' .ch-pill{background:#1f2e3d!important;border:0!important;border-radius:22px!important}',
    H + ' .r{content-visibility:auto;contain-intrinsic-size:auto 60px;contain:layout paint}',
    H + ' .r .bb{contain:layout paint}'
  ].join('\n');
  try { window.USER_CSS = (window.USER_CSS || '') + '<style id="af-bar">' + CSS + '</style>'; } catch (e) { }
})();
