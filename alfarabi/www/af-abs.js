/* af-abs.js — «غيابات الطلبة» للطالب وولي الأمر والمدرس (كان «قيد الإعداد»):
   - الطالب/ولي الأمر: عدد غيابات الابن وتواريخها.
   - المدرس: تسجيل غياب لطالب من صفوفه وعرض آخر الغيابات وحذف ما سجّله. السجلات k:'a' نفسها التي تسجّلها الإدارة. */
(function () {
  'use strict';
  var USER = function () {
    function nn(x) { return String(x || '').replace(/[\sً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه'); }
    function recs() { var a = J('alfarabi_rec_v1', []); return Array.isArray(a) ? a.filter(function (r) { return r && r.k === 'a'; }) : []; }
    function fmt(r) {
      var d = String(r.d || '').trim(), t = /^\d{4}-\d{2}-\d{2}/.test(d) ? new Date(d.slice(0, 10) + 'T12:00:00') : null;
      if (t && !isNaN(t)) { try { return t.toLocaleDateString('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { } }
      if (d) return d;
      try { return new Date(r.ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
    }
    function sortR(a) { return a.slice().sort(function (x, y) { return (y.ts || 0) - (x.ts || 0); }); }
    var CSS = '<style>.afab{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid #e1e8f4;border-radius:18px;padding:12px 14px;margin:0 0 9px}.afab i{flex:none;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#fb7185,#e11d48);color:#fff;display:grid;place-items:center;font-style:normal;font-weight:800}.afab b{display:block;font-size:15px;color:#14213d}.afab small{display:block;color:#51647e;font-size:12.5px;margin-top:2px}.afab button{flex:none;border:0;background:#fdecee;color:#d9283d;border-radius:11px;padding:7px 12px;font:inherit;font-weight:800;font-size:12.5px;cursor:pointer}.afabs{display:flex;gap:10px;margin:0 0 12px}.afabs div{flex:1;text-align:center;background:linear-gradient(135deg,#fff1f2,#fff7ed);border:1.5px solid #fde2e4;border-radius:18px;padding:12px 6px}.afabs b{display:block;font-size:26px;color:#e11d48}.afabs small{color:#51647e;font-size:12.5px}</style>';

    var _prev = V.absence;
    V.absence = function () {
      if (U.role === 'student' || U.role === 'parent') {
        mark('');
        var who = U.role === 'parent' ? (U.child || '') : (U.name || '');
        var mine = sortR(recs().filter(function (r) { return nn(r.n) === nn(who) || (nn(r.n).length > 5 && nn(who).length > 5 && (nn(r.n).indexOf(nn(who)) > -1 || nn(who).indexOf(nn(r.n)) > -1)); }));
        var month = mine.filter(function (r) { var t = r.ts || 0, n = new Date(); return new Date(t).getMonth() === n.getMonth() && new Date(t).getFullYear() === n.getFullYear(); }).length;
        shell('غيابات الطلبة', '', '<div class="sc">' + CSS + '<p class="hint" style="margin:2px 4px 10px">سجل غيابات <b>' + esc(who) + '</b></p>' +
          '<div class="afabs"><div><b>' + mine.length + '</b><small>كل الغيابات</small></div><div><b>' + month + '</b><small>هذا الشهر</small></div></div>' +
          (mine.length ? mine.map(function (r) { return '<div class="afab"><i>غ</i><div style="flex:1"><b>' + esc(fmt(r)) + '</b><small>غياب' + (r.by ? ' — سجّله ' + esc(r.by) : '') + '</small></div></div>'; }).join('') : '<div class="li" style="background:#e9f8ef"><div>لا توجد غيابات مسجلة ✓<small>استمر على الحضور المنتظم</small></div></div>') + '</div>', home);
        return;
      }
      if (U.role === 'teacher') {
        mark('');
        var gs = TG(U), g1 = gs.indexOf(String(U.grade)) > -1 ? String(U.grade) : gs[0];
        function draw() {
          var rows = sortR(recs().filter(function (r) { return String(r.gr) === g1; })).slice(0, 40);
          var stu = (SD.students || []).filter(function (s) { return String(s.grade) === g1 || String(s.grade).charAt(0) === g1; });
          shell('غيابات الطلبة', '', '<div class="sc">' + CSS + '<div class="chips">' + gs.map(function (g) { return '<button type="button" class="chip' + (g === g1 ? ' on' : '') + '" data-g="' + g + '">' + esc(GN[g] || g) + '</button>'; }).join('') + '</div>' +
            '<div class="fd"><input id="abn" list="abl" placeholder="اسم الطالب الثلاثي" autocomplete="off"><datalist id="abl">' + stu.map(function (s) { return '<option value="' + esc(s.name) + '">'; }).join('') + '</datalist></div>' +
            '<div class="fd"><input id="abd" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div><button class="bt" id="abgo">تسجيل غياب</button>' +
            '<p class="hint" style="margin:14px 4px 6px">آخر الغيابات — ' + esc(GN[g1] || '') + '</p>' +
            (rows.length ? rows.map(function (r) { return '<div class="afab"><i>غ</i><div style="flex:1;min-width:0"><b>' + esc(r.n) + '</b><small>' + esc(fmt(r)) + (r.by ? ' — ' + esc(r.by) : '') + '</small></div>' + (String(r.by) === String(U.name) ? '<button data-del="' + r.id + '">حذف</button>' : '') + '</div>'; }).join('') : '<p class="hint" style="margin:8px 6px">لا توجد غيابات مسجلة لهذا الصف.</p>') + '</div>', home);
          card.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { g1 = b.dataset.g; draw(); }; });
          $('abgo').onclick = function () {
            var n = $('abn').value.trim().replace(/\s+/g, ' '), d = $('abd').value;
            if (n.split(' ').length < 3) { toast('اكتب اسم الطالب الثلاثي'); return; }
            if (stu.length && !stu.some(function (s) { return nn(s.name) === nn(n); })) { toast('هذا الاسم غير موجود في ' + (GN[g1] || 'الصف')); return; }
            var id = Date.now(); P.addRec({ id: id, k: 'a', gr: g1, n: n, d: d, ts: id, by: U.name });
            try { var AP = P.AFPUSH || window.AFPUSH; AP && AP.absence && AP.absence(n, d); } catch (e) { }
            toast('تم تسجيل الغياب ✓'); draw();
          };
          card.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { if (!confirm('حذف هذا الغياب؟')) return; P.delRec(+b.dataset.del); draw(); toast('تم الحذف'); }; });
        }
        draw(); return;
      }
      if (_prev) return _prev();
    };
  };
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* ===== af-abs ===== */\n(' + USER.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-abs', e); } catch (x) { } }
})();
