/* af-admin2.js — «درجات الامتحانات» للإدارة:
   اختيار الصف (من مرحلة الإدارة فقط) ← المادة ← المدرس، وعرض الدرجات التي نشرها المدرسون فقط،
   مع زر «جلب ملف PDF» (اسم الطالب الثلاثي · الصف · المادة · المدرس · الدرجة). */
(function () {
  'use strict';
  var ADMIN = function () {
    var oldGrades = V.grades;
    V.gradesAdd = function () { oldGrades(); };   /* نموذج إضافة درجة من الإدارة (القديم) */

    function uniq(a) { var o = [], m = {}; a.forEach(function (x) { x = String(x == null ? '' : x).trim(); if (x && !m[x]) { m[x] = 1; o.push(x); } }); return o; }
    function bytesOfStr(s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }
    function b64(u) { var s = '', n = 0x8000; for (var i = 0; i < u.length; i += n) s += String.fromCharCode.apply(null, u.subarray(i, i + n)); return btoa(s); }
    function dataUrlBytes(d) { var s = atob(d.split(',')[1]), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }

    /* ---------- كاتب PDF بسيط: كل صفحة صورة JPEG (يدعم العربية بدون خطوط مضمّنة) ---------- */
    function buildPdf(pages) {
      var parts = [], off = 0, xr = [];
      function w(x) { var b = typeof x === 'string' ? bytesOfStr(x) : x; parts.push(b); off += b.length; }
      function obj(n, fn) { xr[n] = off; w(n + ' 0 obj\n'); fn(); w('\nendobj\n'); }
      w('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
      obj(1, function () { w('<< /Type /Catalog /Pages 2 0 R >>'); });
      var kids = pages.map(function (p, i) { return (3 + 3 * i) + ' 0 R'; }).join(' ');
      obj(2, function () { w('<< /Type /Pages /Kids [' + kids + '] /Count ' + pages.length + ' >>'); });
      pages.forEach(function (p, i) {
        var pn = 3 + 3 * i, cn = pn + 1, im = pn + 2, W = 595.28, H = 841.89;
        obj(pn, function () { w('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + cn + ' 0 R >>'); });
        var cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
        obj(cn, function () { w('<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream'); });
        obj(im, function () { w('<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpg.length + ' >>\nstream\n'); w(p.jpg); w('\nendstream'); });
      });
      var n = 3 + 3 * pages.length, xs = off;
      w('xref\n0 ' + n + '\n0000000000 65535 f \n');
      for (var i = 1; i < n; i++) w(('0000000000' + xr[i]).slice(-10) + ' 00000 n \n');
      w('trailer\n<< /Size ' + n + ' /Root 1 0 R >>\nstartxref\n' + xs + '\n%%EOF');
      var tot = 0; parts.forEach(function (b) { tot += b.length; });
      var out = new Uint8Array(tot), o = 0; parts.forEach(function (b) { out.set(b, o); o += b.length; });
      return out;
    }

    function drawPages(rows, meta) {
      var PW = 1240, PH = 1754, M = 70, RH = 56, HEAD = 330, per = Math.floor((PH - HEAD - 120) / RH), pages = [], total = Math.max(1, Math.ceil(rows.length / per));
      var cols = [['م', 70], ['اسم الطالب الثلاثي', 430], ['الصف', 160], ['المادة', 190], ['المدرس', 230], ['الدرجة', 90]];
      var cw = cols.reduce(function (s, c) { return s + c[1]; }, 0), scale = (PW - 2 * M) / cw;
      for (var pg = 0; pg < total; pg++) {
        var c = document.createElement('canvas'); c.width = PW; c.height = PH; var x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH); x.direction = 'rtl'; x.textBaseline = 'middle';
        var grd = x.createLinearGradient(0, 0, PW, 0); grd.addColorStop(0, '#0a86d6'); grd.addColorStop(1, '#38bdf8'); x.fillStyle = grd; x.fillRect(0, 0, PW, 14);
        x.fillStyle = '#14213d'; x.textAlign = 'center'; x.font = '800 46px Cairo, sans-serif'; x.fillText(meta.school, PW / 2, 90);
        x.font = '700 36px Cairo, sans-serif'; x.fillStyle = '#0a66c2'; x.fillText('كشف درجات الطلاب', PW / 2, 150);
        x.font = '600 26px Cairo, sans-serif'; x.fillStyle = '#51647e';
        x.fillText(meta.line1, PW / 2, 210); x.fillText(meta.line2, PW / 2, 252);
        var y = HEAD - 20, xr = PW - M;
        x.fillStyle = '#0a86d6'; x.fillRect(M, y, PW - 2 * M, RH);
        x.fillStyle = '#fff'; x.font = '800 26px Cairo, sans-serif'; x.textAlign = 'center';
        var cx = xr; cols.forEach(function (cc) { var wd = cc[1] * scale; x.fillText(cc[0], cx - wd / 2, y + RH / 2); cx -= wd; });
        rows.slice(pg * per, (pg + 1) * per).forEach(function (r, i) {
          var ry = y + RH * (i + 1); x.fillStyle = i % 2 ? '#f4f8fd' : '#fff'; x.fillRect(M, ry, PW - 2 * M, RH);
          x.strokeStyle = '#e1e8f4'; x.lineWidth = 1; x.strokeRect(M, ry, PW - 2 * M, RH);
          x.fillStyle = '#14213d'; x.font = '600 25px Cairo, sans-serif';
          var vals = [String(pg * per + i + 1), r.n, meta.gname, r.s, r.by, String(r.v)], cx2 = xr;
          cols.forEach(function (cc, k) { var wd = cc[1] * scale, t = String(vals[k] || ''); while (x.measureText(t).width > wd - 16 && t.length > 2) t = t.slice(0, -2); if (t !== String(vals[k] || '')) t += '…'; x.textAlign = 'center'; x.fillText(t, cx2 - wd / 2, ry + RH / 2); cx2 -= wd; });
        });
        x.fillStyle = '#7a8aa3'; x.font = '600 22px Cairo, sans-serif'; x.textAlign = 'center'; x.fillText('صفحة ' + (pg + 1) + ' من ' + total + ' — ' + meta.date, PW / 2, PH - 50);
        pages.push({ w: PW, h: PH, jpg: dataUrlBytes(c.toDataURL('image/jpeg', 0.9)) });
      }
      return pages;
    }

    function savePdf(bytes, name) {
      try {
        if (P.Android && P.Android.saveFile) { if (P.Android.saveFile(name, 'application/pdf', b64(bytes))) return true; }
      } catch (e) { }
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return true;
    }

    V.grades = function () {
      mark('');
      var K = 'alfarabi_rec_v1', S = { s: '', t: '' };
      var gset = Object.keys(GN); if (gset.indexOf(String(g0)) < 0) g0 = gset[0];
      function recs() { var a = []; try { a = JSON.parse(P.localStorage.getItem(K) || '[]'); } catch (e) { } return a.filter(function (r) { return r && r.k === 'g' && String(r.gr) === String(g0) && r.by && r.by !== 'الإدارة'; }); }
      function sel(id, label, opts, cur) { return '<div class="fd"><select id="' + id + '" style="width:100%;height:48px;border:1.5px solid #e1e8f4;border-radius:14px;padding:0 12px;font:inherit;font-size:15px;background:#fff;color:#14213d"><option value="">' + label + '</option>' + opts.map(function (o) { return '<option value="' + esc(o) + '"' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></div>'; }
      function filtered(all) { return all.filter(function (r) { return (!S.s || String(r.s) === S.s) && (!S.t || String(r.by) === S.t); }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }); }
      function render() {
        var all = recs(), subs = uniq(all.map(function (r) { return r.s; })).sort();
        if (S.s && subs.indexOf(S.s) < 0) S.s = '';
        var bySub = all.filter(function (r) { return !S.s || String(r.s) === S.s; }), teachers = uniq(bySub.map(function (r) { return r.by; })).sort();
        if (S.t && teachers.indexOf(S.t) < 0) S.t = '';
        var rows = filtered(all);
        shell(T.grades, '', '<div class="sc">' + chips() +
          '<p class="hint" style="font-size:12.5px;margin:2px 4px 8px">تظهر هنا الدرجات التي نشرها المدرسون فقط لصف <b>' + esc(GN[g0] || '') + '</b>.</p>' +
          sel('gsub', 'كل المواد', subs, S.s) + sel('gtch', 'كل المدرسين', teachers, S.t) +
          '<div class="li" style="background:#eaf6ff"><div>عدد الدرجات<small>' + rows.length + ' درجة' + (S.s ? ' — ' + esc(S.s) : '') + (S.t ? ' — ' + esc(S.t) : '') + '</small></div></div>' +
          '<button class="bt" id="gpdf" style="margin-top:4px">جلب ملف PDF</button>' +
          '<div id="gls" style="margin-top:8px">' + (rows.length ? rows.slice(0, 80).map(function (r) { return '<div class="li"><div>' + esc(r.n) + '<small>' + esc(r.s || '') + ' — ' + esc(r.by || '') + (r.ex ? ' — ' + esc(r.ex) : '') + '</small></div><b style="font-size:17px;color:#0a66c2">' + esc(r.v) + '</b></div>'; }).join('') + (rows.length > 80 ? '<p class="hint" style="text-align:center">يظهر أول 80 فقط، والملف PDF يحتوي كل الدرجات (' + rows.length + ').</p>' : '') : '<p class="hint" style="margin:10px 6px">لا توجد درجات منشورة من المدرسين بهذا التحديد.</p>') + '</div>' +
          '<button class="bt ghost" id="gadd" style="margin-top:12px">إضافة درجة من الإدارة</button></div>', home);
        card.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { g0 = b.dataset.g; S.s = ''; S.t = ''; render(); }; });
        $('gsub').onchange = function () { S.s = this.value; S.t = ''; render(); };
        $('gtch').onchange = function () { S.t = this.value; render(); };
        $('gadd').onclick = function () { V.gradesAdd(); };
        $('gpdf').onclick = function () {
          var rs = filtered(recs()).slice().sort(function (a, b) { return String(a.n).localeCompare(String(b.n), 'ar'); });
          if (!rs.length) { toast('لا توجد درجات منشورة من المدرسين بهذا التحديد'); return; }
          var btn = this; btn.disabled = true; btn.textContent = 'جاري تجهيز الملف...';
          var go = function () {
            try {
              var d = new Date(), meta = { school: SD.name || 'ثانوية الفارابي الأهلية للبنين', gname: GN[g0] || '', date: d.toLocaleDateString('ar-IQ'), line1: 'الصف: ' + (GN[g0] || '') + (S.s ? ' — المادة: ' + S.s : ' — كل المواد'), line2: (S.t ? 'المدرس: ' + S.t : 'كل المدرسين') + ' — عدد الدرجات: ' + rs.length };
              var pdf = buildPdf(drawPages(rs, meta)), name = 'درجات-' + (GN[g0] || g0) + (S.s ? '-' + S.s : '') + '-' + d.toISOString().slice(0, 10) + '.pdf';
              savePdf(pdf, name.replace(/[\\\/:*?"<>|]/g, '_')); toast('تم تجهيز الملف ✓ (' + rs.length + ' درجة)');
            } catch (e) { toast('تعذّر إنشاء الملف'); }
            btn.disabled = false; btn.textContent = 'جلب ملف PDF';
          };
          try { (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 30px Cairo'), document.fonts.load('600 25px Cairo')]) : Promise.resolve()).then(go, go); } catch (e) { go(); }
        };
      }
      render();
    };
  };

  var ASRC = '\n/* ===== af-admin2 ===== */\n(' + ADMIN.toString() + ')();\n';
  try {
    var s = window.ADMIN_SRC;
    if (s) {
      var a = '\nhome();\n})();', i = s.lastIndexOf(a);
      if (i > -1) { window.ADMIN_SRC = s.slice(0, i) + ASRC + s.slice(i); }
    }
  } catch (e) { try { console.warn('af-admin2', e); } catch (x) { } }
})();
