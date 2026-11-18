/* af-xgr.js — «الصفوف الإضافية» للمدرس: مدرس يدرّس صفين أو أكثر يضيف صفه الثاني من الإعدادات،
   فيظهر في قائمة «محادثة المدرسين» عند الطالب وولي الأمر لكل صف يدرّسه، وفي أعضاء مجموعة كل صف.
   المخزّن: حقل xg في حساب المدرس نصاً مفصولاً بفواصل (مثل "2,3") ويتزامن مع بقية الأجهزة. */
(function () {
  'use strict';
  var USER = function () {
    function XG(a) {
      var o = [], m = a && a.grade != null ? String(a.grade) : '';
      if (m) o.push(m);
      if (a && a.xg) String(a.xg).split(',').forEach(function (x) { x = x.trim(); if (x && o.indexOf(x) < 0) o.push(x); });
      return o;
    }
    function XGL(a) { var l = XG(a).map(function (g) { return GN[g] || ''; }).filter(Boolean); return l.join(' + '); }

    var _vs = V.settings;
    V.settings = function () {
      _vs();
      if (U.role !== 'teacher') return;
      try {
        var sc = card.querySelector('.sc'); if (!sc || sc.querySelector('[data-v="xgr"]')) return;
        var base = sc.querySelector('[data-v="cset"]') || sc.querySelector('.option'); if (!base) return;
        var n = base.cloneNode(true); n.setAttribute('data-v', 'xgr');
        var lab = n.querySelector('.opt-text') || n.querySelector('span') || n;
        lab.textContent = 'الصفوف الإضافية';
        n.onclick = function (e) { e.stopPropagation(); V.xgr(); };
        sc.insertBefore(n, base);
      } catch (e) { }
    };

    V.xgr = function () {
      mark('settings');
      var sel = XG(U).slice(1);
      var all = ['1', '2', '3', '4', '5'];
      function draw() {
        var main = String(U.grade || '');
        shell('الصفوف الإضافية', '', '<div class="sc"><p class="hint" style="margin:2px 4px 10px">صفك الأساسي: <b>' + esc(GN[main] || '—') + '</b>. إذا تدرّس صفاً ثانياً أو أكثر اضغط عليه، فتظهر عند الطلاب وأولياء أمورهم في «محادثة المدرسين»، وتصير عضواً في مجموعة كل صف تضيفه.</p>' +
          '<div class="chips" style="flex-wrap:wrap">' + all.filter(function (g) { return g !== main; }).map(function (g) { return '<button type="button" class="chip' + (sel.indexOf(g) > -1 ? ' on' : '') + '" data-g="' + g + '" style="margin-bottom:8px">' + esc(GN[g] || g) + '</button>'; }).join('') + '</div>' +
          '<button class="bt" id="xgs" style="margin-top:12px">حفظ</button></div>', V.settings);
        card.querySelectorAll('.chip').forEach(function (b) {
          b.onclick = function () { var g = b.dataset.g, i = sel.indexOf(g); if (i > -1) sel.splice(i, 1); else sel.push(g); b.classList.toggle('on', i < 0); };
        });
        $('xgs').onclick = function () {
          var v = sel.slice().sort().join(',');
          if (saveMe(function (a) { if (v) a.xg = v; else delete a.xg; })) { toast(v ? 'تم حفظ صفوفك الإضافية ✓' : 'تمت إزالة الصفوف الإضافية'); V.settings(); }
          else toast('تعذّر الحفظ');
        };
      }
      draw();
    };
  };

  var SRC = '\n/* ===== af-xgr ===== */\n(' + USER.toString() + ')();\n';
  var HELPERS = '\nfunction XG(a){var o=[],m=a&&a.grade!=null?String(a.grade):"";if(m)o.push(m);if(a&&a.xg)String(a.xg).split(",").forEach(function(x){x=x.trim();if(x&&o.indexOf(x)<0)o.push(x)});return o}\nfunction XGL(a){return XG(a).map(function(g){return GN[g]||""}).filter(Boolean).join(" + ")}\n';
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      function rep(a, b) { src = src.split(a).join(b); }
      rep("x.role==='teacher'&&String(x.grade)===String(g)", "x.role==='teacher'&&XG(x).indexOf(String(g))>-1");
      rep("String(a.grade).indexOf(gr)>-1", "XG(a).some(function(q){return String(q).indexOf(gr)>-1})");
      rep("rpBase(a.grade)===gr", "XG(a).some(function(q){return rpBase(q)===gr})");
      rep("(a.subject||'')+(a.subject&&GN[a.grade]?' - ':'')+(GN[a.grade]||'')", "(a.subject||'')+(a.subject&&GN[a.grade]?' - ':'')+XGL(a)");
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + HELPERS + SRC + '\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-xgr', e); } catch (x) { } }
})();
