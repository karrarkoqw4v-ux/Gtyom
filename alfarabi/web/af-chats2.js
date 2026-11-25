/* af-chats2.js — محادثة الأصدقاء (للطلاب فقط) + مراسلة كل المدرسين والإدارة (للمدرس).
   الأصدقاء = طلاب نفس صفك فقط. بينهم نفس خصائص المحادثة الخاصة: رسائل، صور وفيديو، بصمة صوتية، اتصال، وجاري الكتابة. */
(function () {
  'use strict';
  var USER = function () {
    function sk(a) { return String(a.createdAt || a.name); }
    function lastOf(k) { var m = msgs(k).filter(function (x) { return x && !x.c && x.ts; }); return m.length ? m[m.length - 1] : null; }
    function prev(m) { return m ? (m.t ? String(m.t).slice(0, 40) : m.aud ? '🎤 بصمة صوتية' : m.img ? '📷 صورة' : m.vid ? '🎬 فيديو' : 'رسالة') : ''; }
    function row(a, key, sub, i) {
      var l = lastOf(key);
      return '<button class="tc" data-i="' + i + '">' + av(a, 54) + '<span class="tn"><b>' + esc(a.name) + (a.role === 'teacher' && P.isVer(a.name) ? P.vbadge() : '') + '</b><small>' + esc(l ? prev(l) : sub) + '</small></span>' + CHEV + '</button>';
    }
    var SRCH = '<div class="fd"><input id="afsr" placeholder="ابحث بالاسم" autocomplete="off"></div>';
    function bindSearch(items, list) {
      var inp = $('afsr'); if (!inp) return;
      inp.oninput = function () {
        var q = inp.value.trim();
        card.querySelectorAll('.tc').forEach(function (b) { var it = list[+b.dataset.i]; b.style.display = !q || String(it.a.name).indexOf(q) > -1 ? '' : 'none'; });
      };
    }

    /* ----- الأصدقاء ----- */
    V.friends = function () {
      mark('');
      if (U.role !== 'student') { toast('هذه الميزة للطلاب فقط'); return; }
      var gr = String(U.grade || ''), me = String(uid);
      var list = DB().accounts.filter(function (a) { return a && a.role === 'student' && !a.kicked && String(a.grade) === gr && sk(a) !== me; })
        .map(function (a) { var k = dmKey(a); return { a: a, k: k, t: (lastOf(k) || {}).ts || 0 }; })
        .sort(function (x, y) { return y.t - x.t || String(x.a.name).localeCompare(String(y.a.name), 'ar'); });
      shell('محادثة الأصدقاء', '', '<div class="sc"><p class="hint" style="margin:2px 4px 8px">أصدقاؤك في <b>' + esc(GN[gr] || '') + '</b> فقط.</p>' + (list.length > 6 ? SRCH : '') +
        (list.length ? list.map(function (x, i) { return row(x.a, x.k, GN[gr] || 'طالب', i); }).join('') : '<p class="hint" style="margin:10px 6px">لا يوجد زملاء مسجلون بصفك بعد.</p>') + '</div>', home);
      card.querySelectorAll('.tc').forEach(function (b) { b.onclick = function () { openChat(list[+b.dataset.i].k); }; });
      bindSearch(null, list);
    };
    try { if (U.role === 'student' && typeof MENU !== 'undefined' && !MENU.some(function (m) { return m[0] === 'friends'; })) { var ix = -1; MENU.forEach(function (m, i) { if (m[0] === 'chat') ix = i; }); MENU.splice(ix + 1, 0, ['friends', 'محادثة الأصدقاء']); } } catch (e) { }

    /* ----- المدرس: مراسلاته + كل المدرسين + الإدارة ----- */
    var _chat = V.chat;
    V.chat = function () {
      if (U.role !== 'teacher') return _chat();
      mark('');
      var d = J(CK, {}), mine = Object.keys(d).filter(function (k) { return k[0] === 'd' && k.indexOf('dsup_') !== 0 && k.slice(1).split('~').indexOf(String(uid)) > -1 && (d[k] || []).some(function (x) { return !x.c; }); });
      var list = [], seen = {};
      mine.forEach(function (k) { var a = dmo(k); seen[k] = 1; list.push({ k: k, a: a, sub: a.role === 'admin' ? 'إدارة المدرسة' : a.role === 'teacher' ? (a.subject || 'مدرس') : (GN[a.grade] || 'طالب'), conv: 1, t: (lastOf(k) || {}).ts || 0 }); });
      list.sort(function (x, y) { return y.t - x.t; });
      var others = [];
      var adminKey = 'd' + ['admin', String(uid)].sort().join('~');
      if (!seen[adminKey]) others.push({ k: adminKey, a: { name: 'الإدارة', role: 'admin' }, sub: 'إدارة المدرسة' });
      DB().accounts.filter(function (a) { return a && a.role === 'teacher' && !a.kicked && sk(a) !== String(uid); }).forEach(function (a) { var k = dmKey(a); if (!seen[k]) others.push({ k: k, a: a, sub: (a.subject || 'مدرس') + (XGL(a) ? ' — ' + XGL(a) : '') }); });
      var all = list.concat(others);
      var h = '<div class="sc">' + (all.length > 6 ? SRCH : '');
      if (list.length) h += '<p class="hint" style="margin:6px 4px">المراسلات</p>' + list.map(function (x, i) { return row(x.a, x.k, x.sub, i); }).join('');
      if (others.length) h += '<p class="hint" style="margin:12px 4px 6px">مراسلة مدرس أو الإدارة</p>' + others.map(function (x, i) { return row(x.a, x.k, x.sub, list.length + i); }).join('');
      if (!all.length) h += '<p class="hint">لا توجد مراسلات بعد</p>';
      shell('المراسلات', '', h + '</div>', home);
      card.querySelectorAll('.tc').forEach(function (b) { b.onclick = function () { openChat(all[+b.dataset.i].k); }; });
      bindSearch(null, all);
    };
  };
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* ===== af-chats2 ===== */\n(' + USER.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-chats2', e); } catch (x) { } }
})();
