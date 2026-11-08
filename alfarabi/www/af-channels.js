/* af-channels.js — قناة المدرس بشكل احترافي:
   - المدرس (صاحب القناة) يدخل قناته دائماً.
   - رابط القناة https://... + يوزر نيم للقناة (@username) بدل c.m/
   - ألوان للقناة، وفتح القناة من الرابط الخارجي
   - + تحسين وضوح الصفحة الرئيسية وموضع زر القائمة */
(function () {
  'use strict';
  var SITE = 'https://karrarkoqw4v-ux.github.io/Gtyom/';
  var CSS = '<style id="af-channels-css">'
    + 'html body.qn-home #card,html body.qn-home .card{background:rgba(255,255,255,.55)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'
    + 'body.qn-home .card{margin-top:38px!important}'
    + 'html body .af-hq-btn b{color:#0b1530!important}html body .af-hq-btn small{color:#2b3a55!important;opacity:1!important;font-weight:800!important}'
    + 'html body .hbn-t small,html body .hbn-t span{opacity:1!important}'
    + 'html body .rows .row,html body .rows .row *{color:#0b1530!important}'
    + '.afch-cols{display:flex;gap:10px;flex-wrap:wrap;margin:4px 2px 12px;direction:rtl}'
    + '.afch-cols button{width:38px;height:38px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 10px rgba(20,45,90,.25);cursor:pointer;padding:0}'
    + '.afch-cols button.on{outline:3px solid #0a86d6;outline-offset:2px}'
    + '.afch-lk{direction:ltr;text-align:left;font-size:12.5px;font-weight:800;color:#0a86d6;word-break:break-all;margin:0 2px 10px;min-height:18px}'
    + '.afch-list{background:rgba(255,255,255,.95);border-radius:22px;padding:10px 12px;margin-bottom:12px;box-shadow:0 6px 18px rgba(20,45,90,.08)}'
    + '.afch-lh{display:flex;justify-content:space-between;align-items:center;margin:2px 2px 6px;color:#14213d}.afch-lh b{font-size:15px;font-weight:900}.afch-lh span{background:#e3f3ff;color:#0a86d6;border-radius:999px;padding:2px 12px;font-weight:900;font-size:13px}'
    + '.afch-row{display:flex;align-items:center;gap:11px;width:100%;border:0;background:#f1f7ff;border-radius:16px;padding:8px 10px;margin-bottom:7px;font:inherit;cursor:pointer;text-align:right}.afch-row b{display:block;font-size:14.5px;color:#14213d;font-weight:800}.afch-row small{display:block;color:#5b6b86;font-size:12px;font-weight:700;direction:ltr;text-align:right}'
    + '</style>';

  function DEC(SITE) {
    try {
      var COLS = [['#0aa6f5', '#1d4ed8'], ['#8b5cf6', '#6d28d9'], ['#10b981', '#047857'], ['#f59e0b', '#d97706'], ['#ef4444', '#b91c1c'], ['#ec4899', '#be185d'], ['#14b8a6', '#0f766e'], ['#475569', '#0f172a']];
      window.__afChCols = COLS;
      isOwnCh = function (c) {
        if (!c) return false;
        var o = String(c.o);
        if (o === String(uid)) return true;
        try { if (U && (o === String(U.createdAt) || o === String(U.name) || (c.on && U.role === 'teacher' && c.on === U.name))) return true; } catch (e) {}
        return false;
      };
      chBySlug = function (s) { s = String(s || '').toLowerCase(); return chans().filter(function (x) { return x.s === s; })[0]; };
      chFind = function (v) {
        v = String(v || '').trim(); if (!v) return null;
        var u = v.match(/https?:\/\/\S+/); if (u) v = u[0];
        var m;
        if ((m = v.match(/[?&#]c=([^&\s#]+)/))) v = decodeURIComponent(m[1]);
        else if ((m = v.match(/[?&]ch=(\d+)/)) || (m = v.match(/c\.php\?id=(\d+)/))) return chOne(+m[1]) || null;
        v = v.replace(/^@/, '').replace(/^c\.m\//i, '').toLowerCase();
        return chBySlug(v) || (/^\d+$/.test(v) ? chOne(+v) : null) || null;
      };
      chLink = function (c) { return SITE + '?c=' + encodeURIComponent((c && c.s) || '') + ((c && c.s) ? '' : '&ch=' + (c && c.id)); };

      // رابط خارجي ?c=username يُحفظ لحد ما يسجل الدخول (?ch=ID موجود أصلاً)
      try {
        var qm = P.location.search.match(/[?&]c=([A-Za-z0-9_]+)/);
        if (qm) { LS.setItem('af_pend_ch', JSON.stringify({ s: qm[1].toLowerCase(), t: Date.now() })); P.history.replaceState(null, '', P.location.pathname + P.location.hash); }
      } catch (e) {}

      // لون القناة في رأسها
      var _oc = openCh;
      openCh = function (id) {
        _oc(id);
        try {
          var c = chOne(id), h = cxEl && cxEl.querySelector('.cx-h');
          if (h && c) {
            var g = COLS[c.col] || COLS[0];
            h.style.background = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')';
            h.querySelectorAll('b,small').forEach(function (x) { x.style.color = '#fff'; });
          }
        } catch (e) {}
      };

      // إنشاء قناة: اسم + وصف + يوزر نيم + لون + صورة
      V.mkch = function () {
        var img = '', MAXCH = 5;
        var mine = chans().filter(function (x) { return isOwnCh(x); }), full = mine.length >= MAXCH;
        var listH = '<div class="afch-list"><div class="afch-lh"><b>قنواتك</b><span dir="ltr">' + mine.length + ' / ' + MAXCH + '</span></div>'
          + (mine.length ? mine.map(function (x) { return '<button type="button" class="afch-row" data-ch="' + x.id + '">' + av(null, 40, x.img) + '<span><b>' + esc(x.cn) + '</b><small>@' + esc(x.s || '') + ' · ' + Object.keys(x.m || {}).length + ' مشترك</small></span></button>'; }).join('') : '<p class="hint" style="margin:6px 2px">لا توجد قنوات بعد</p>')
          + (full ? '<p class="hint" style="margin:8px 2px;color:#c62828">وصلت الحد الأقصى (5 قنوات). عدّل إحدى قنواتك بدل إنشاء قناة جديدة.</p>' : '') + '</div>';
        var formH = full ? '' : ('<div class="fd"><input id="cn" placeholder="اسم القناة" maxlength="40"></div>'
          + '<div class="fd"><input id="cd" placeholder="وصف القناة" maxlength="160"></div>'
          + '<div class="fd" style="direction:ltr"><b style="color:#5b6b86">@</b><input id="cs2" placeholder="username" maxlength="30" style="direction:ltr;text-align:left" autocapitalize="off" autocomplete="off"></div>'
          + '<div id="cst" class="hint" style="font-size:12.5px;margin:2px 0 6px;min-height:20px"></div>'
          + '<div class="afch-lk" id="chlk"></div><button class="bt" id="cgo">إنشاء القناة</button>');
        shell('إنشاء قناة مادة', '', '<div class="sc">' + listH + formH + '</div>',
          V.settings, { img: ini(U.subject || U.name), edit: function () { pick('image/*', function (x) { shrink(x, 400, function (d) { img = d; var im = $('lg').querySelector('img'); if (im) im.src = d; }); }); } });
        card.querySelectorAll('.afch-row').forEach(function (b) { b.onclick = function () { openCh(+b.dataset.ch); }; });
        if (full) return;
        function msg(v) { var r = chkSlug(v); r[0] = String(r[0]).replace('الرابط', 'اليوزر نيم'); return r; }
        $('cs2').oninput = function () { var r = msg(this.value); $('cst').textContent = r[0]; $('cst').style.color = r[1] ? '#1a9d55' : '#d33a3a'; $('chlk').textContent = r[1] ? chLink({ s: this.value.trim().toLowerCase() }) : ''; };
        $('cgo').onclick = function () {
          if (chans().filter(function (x) { return isOwnCh(x); }).length >= MAXCH) return toast('وصلت الحد الأقصى: 5 قنوات');
          var n = $('cn').value.trim(), r = msg($('cs2').value);
          if (n.length < 2) return toast('اكتب اسم القناة');
          if (!r[1]) return toast(r[0] || 'اكتب يوزر نيم القناة');
          var id = Date.now(), m = {}; m['u' + ok(uid)] = String(uid);
          P.addRec({ id: id, k: 'ch', ts: id, cn: n, cd: $('cd').value.trim(), s: $('cs2').value.trim().toLowerCase(), gr: String(U.grade || ''), img: img || ini(U.subject || U.name), o: String(uid), on: U.name, sj: U.subject || '', m: m });
          toast('تم إنشاء القناة'); V.parents(); setTimeout(function () { openCh(id); }, 250);
        };
      };
    } catch (e) { try { console.warn('af-channels', e); } catch (x) {} }
  }

  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var miss = [];
      var r = function (a, b) { if (src.indexOf(a) < 0) { miss.push(a.slice(0, 50)); return; } src = src.split(a).join(b); };
      src = src.replace(/String\((\w)\.o\)===String\(uid\)/g, 'isOwnCh($1)');
      r('dir="ltr">c.m/\'+esc(c.s)+\'</a>', 'dir="ltr">\'+esc(chLink(c))+\'</a>');
      r('placeholder="الصق رابط القناة هنا"', 'placeholder="الصق رابط القناة https://... أو اسمها @username"');
      r("var s=$('jl').value.trim().toLowerCase().replace(/^c\\.m\\//,'');var mm=s.match(/[?&](?:id|ch)=(\\d+)/),c=chans().filter(function(x){return x.s===s||(mm&&String(x.id)===mm[1])})[0];", "var c=chFind($('jl').value);");
      r('setTimeout(chLanding,1500)', 'setTimeout(function(){chLanding()},1500)');
      r('if(!p||!p.id||', 'if(!p||!(p.id||p.s)||');
      r('var c=chOne(p.id);if(!c){', 'var c=p.id?chOne(p.id):chBySlug(p.s);if(!c){');
      if (miss.length) { try { console.warn('af-channels miss', miss); } catch (e) {} }
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\nvar isOwnCh,chBySlug,chFind;\n/* af-channels */(' + DEC.toString() + ')(' + JSON.stringify(SITE) + ');\n}';
      window.userMain = (0, eval)('(' + src + ')');
      window.USER_CSS = (window.USER_CSS || '') + CSS;
    }
  } catch (e) { try { console.warn('af-channels user', e); } catch (x) {} }
})();
