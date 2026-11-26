/* af-native.js — زر «المحادثة الأصلية (تجريبي)» بالقائمة: يفتح محادثة الصف بتصميم تيليجرام مكتوبة بـKotlin (سريعة وبدون تقطيع).
   تظهر على أندرويد فقط. محادثة الويب الحالية تبقى كما هي. */
(function () {
  'use strict';
  var USER = function () {
    if (!(P.Android && P.Android.openNativeChat) || U.role === 'guest') return;
    V.nativechat = function () { try { P.Android.openNativeChat(); } catch (e) { toast('غير متاح الآن'); } };
    try { if (typeof MENU !== 'undefined' && !MENU.some(function (m) { return m[0] === 'nativechat'; })) { var ix = MENU.length - 1; MENU.forEach(function (m, i) { if (m[0] === 'logout') ix = i; }); MENU.splice(ix, 0, ['nativechat', 'المحادثة الأصلية (تجريبي)']); } } catch (e) { }
  };
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* ===== af-native ===== */\n(' + USER.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-native', e); } catch (x) { } }
})();
