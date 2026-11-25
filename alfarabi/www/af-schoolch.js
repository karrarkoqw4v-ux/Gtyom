/* af-schoolch.js — «قناة إعلانات المدرسة»: قناة رسمية تظهر عند كل المستخدمين (طلاب، أولياء أمور، مدرسين).
   بنفس نظام قنوات المدرسين (منشورات، صور، فيديو، تفاعل، تعليقات). تنشر فيها الإدارة فقط، والجميع مشتركون تلقائياً. */
(function () {
  'use strict';
  var SID = 20261101;
  /* ------------------------ المستخدمون ------------------------ */
  var USER = function () {
    var SID = 20261101;
    V.schoolch = function () {
      var c = chOne(SID);
      if (!c) { toast('القناة غير متاحة الآن، جرّب بعد قليل'); return; }
      openCh(SID);
    };
    try { if (typeof MENU !== 'undefined' && U.role !== 'guest' && !MENU.some(function (m) { return m[0] === 'schoolch'; })) { var ix = MENU.length - 1; MENU.forEach(function (m, i) { if (m[0] === 'logout') ix = i; }); MENU.splice(ix, 0, ['schoolch', 'قناة إعلانات المدرسة']); } } catch (e) { }
  };
  /* ------------------------ الإدارة ------------------------ */
  var ADMIN = function () {
    var SID = 20261101;
    function ensure() {
      var rs = []; try { rs = JSON.parse(P.localStorage.getItem('alfarabi_rec_v1') || '[]'); } catch (e) { }
      if (rs.some(function (r) { return r && r.k === 'ch' && r.id === SID; })) return;
      try { P.addRec({ id: SID, k: 'ch', ts: 1, cn: 'قناة إعلانات المدرسة', cd: 'القناة الرسمية لإعلانات ثانوية الفارابي الأهلية للبنين', s: 'school', img: SD.logo || P.DEFLOGO || '', o: 'admin', on: 'الإدارة', sj: '', m: {}, sys: true }); } catch (e) { }
    }
    V.schoolch = function () { ensure(); mark(''); setTimeout(function () { P.openAdminChat('ch:' + SID); }, 250); };
    try { if (!MENU.some(function (m) { return m[0] === 'schoolch'; })) { var ix = MENU.length - 1; MENU.forEach(function (m, i) { if (m[0] === 'logout') ix = i; }); MENU.splice(ix, 0, ['schoolch', 'قناة إعلانات المدرسة']); } } catch (e) { }
    setTimeout(ensure, 3500);
  };
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      function rep(a, b) { src = src.split(a).join(b); }
      /* الجميع مشتركون بالقناة النظامية */
      rep("function isMem(c){return !!(c.m&&c.m['u'+ok(uid)])}", "function isMem(c){return !!(c.sys||(c.m&&c.m['u'+ok(uid)]))}");
      /* إشعارات المنشورات لكل الحسابات عند القناة النظامية */
      rep("var u=Object.keys(c.m||{}).filter(function(k){return !(c.mu&&c.mu[k])}).map(function(k){return c.m[k]}).filter(function(x){return String(x)!==String(uid)});",
          "var u=(c.sys?DB().accounts.filter(function(a){return !a.kicked}).map(function(a){return String(a.createdAt||a.name)}):Object.keys(c.m||{}).filter(function(k){return !(c.mu&&c.mu[k])}).map(function(k){return c.m[k]})).filter(function(x){return String(x)!==String(uid)});");
      /* الإدارة تفتح القناة داخل إطار المحادثة، وزر الرجوع يغلق الإطار */
      rep("if(P.ADMINCHAT)openChat(P.ADMINCHAT);else if(P.INVITE)", "if(P.ADMINCHAT&&String(P.ADMINCHAT).indexOf('ch:')===0){home();setTimeout(function(){openCh(+String(P.ADMINCHAT).slice(3))},60)}else if(P.ADMINCHAT)openChat(P.ADMINCHAT);else if(P.INVITE)");
      rep("$('xb').onclick=closeCh;", "$('xb').onclick=function(){closeCh();if(P.ADMINCHAT)P.closeAdminChat()};");
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* ===== af-schoolch ===== */\n(' + USER.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-schoolch user', e); } catch (x) { } }
  try {
    var s = window.ADMIN_SRC;
    if (s) {
      var a = '\nhome();\n})();', i = s.lastIndexOf(a);
      if (i > -1) window.ADMIN_SRC = s.slice(0, i) + '\n/* ===== af-schoolch ===== */\n(' + ADMIN.toString() + ')();\n' + s.slice(i);
    }
  } catch (e) { try { console.warn('af-schoolch admin', e); } catch (x) { } }
})();
