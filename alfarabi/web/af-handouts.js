/* ملازم الثالث متوسط 2027: قائمة بمربعات، عارض PDF بأدوات، إضافة/تعديل/تحديث/حذف للإدارة والمدرسين، وتقييم الطلاب */
(function () {
  'use strict';
  var A = window.Android;
  if (!A || !window.AFX) return;
  var X = window.AFX, esc = X.esc, CHUNK = 700 * 1024, MAXMB = 300;
  var CATS = ['ملزمة منهجية', 'ملزمة اختبارات', 'ملزمة مراجعة', 'أسئلة وزارية', 'أخرى'];

  /* ---------- شبكة (قاعدة بيانات المدرسة) ---------- */
  function base() { return window.FBBASE || ''; }
  function okk(k) { return String(k).replace(/[.#$\[\]\/]/g, '_'); }
  function req(path, opt, ms) {
    var b = base(); if (!b) return Promise.reject(new Error('ما اكو اتصال بقاعدة البيانات، تأكد من الإنترنت ثم حاول'));
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms || 25000); opt = opt || {}; opt.signal = c.signal;
    return fetch(b + path, opt).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'رفض الخادم (' + r.status + '): قواعد قاعدة البيانات (Rules) تمنع الكتابة على مسار handouts و handout_files، لازم مدير قاعدة البيانات يسمح بهذين المسارين' : 'رفض الخادم (' + r.status + ')'); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  function getJ(p) { return req(p).then(function (r) { return r.json(); }); }
  function putJ(p, v) { return req(p, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }, 90000); }
  function patchJ(p, v) { return req(p, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }); }
  function delP(p) { return req(p, { method: 'DELETE' }, 60000); }

  /* ---------- مكتبة PDF (محلية) ---------- */
  var pdfP = null;
  function loadPdf() {
    if (window.__afPdf) return Promise.resolve(window.__afPdf);
    if (pdfP) return pdfP;
    pdfP = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = '/Gtyom/vendor/pdfjs/pdf.min.js';
      s.onload = function () { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/Gtyom/vendor/pdfjs/pdf.worker.min.js'; window.__afPdf = window.pdfjsLib; res(window.pdfjsLib); } catch (e) { pdfP = null; rej(e); } };
      s.onerror = function () { pdfP = null; rej(new Error('تعذّر تحميل عارض PDF')); };
      document.head.appendChild(s);
    });
    return pdfP;
  }

  /* ---------- أدوات ---------- */
  function fmtDate(ts) { var d = new Date(ts || Date.now()); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  function isoDate(ts) { var d = new Date(ts || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function stars(h) {
    var v = h.rat ? Object.keys(h.rat).map(function (k) { return +h.rat[k]; }).filter(Boolean) : [], n = v.length, avg = n ? v.reduce(function (a, b) { return a + b; }, 0) / n : 0, r = Math.round(avg), o = '';
    for (var i = 1; i <= 5; i++) o += '<i class="' + (i <= r ? 'on' : '') + '">★</i>';
    return '<span class="hdst">' + o + '</span> <small>(' + n + ')</small>';
  }
  var NOCOVER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="120" height="160" fill="#e6eefb"/><path d="M30 28h46l16 16v88H30z" fill="#fff" stroke="#9db6e0" stroke-width="3"/><path d="M76 28v16h16" fill="none" stroke="#9db6e0" stroke-width="3"/><text x="60" y="108" font-size="20" text-anchor="middle" fill="#2f7fb0" font-family="sans-serif" font-weight="700">PDF</text></svg>');
  function dlData(doc, url, name) { var a = doc.createElement('a'); a.href = url; a.download = name; doc.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500); }
  function confirmBox(doc, msg, okText, cb) {
    var o = doc.createElement('div'); o.className = 'afcf';
    o.innerHTML = '<div class="afcf-b"><p>' + esc(msg) + '</p><div><button class="afbtn gray" data-n>إلغاء</button><button class="afbtn" style="background:linear-gradient(135deg,#ff5d6e,#d9283d)" data-y>' + esc(okText || 'تأكيد') + '</button></div></div>';
    doc.body.appendChild(o); o.querySelector('[data-n]').onclick = function () { o.remove(); }; o.querySelector('[data-y]').onclick = function () { o.remove(); cb(); };
  }
  function css(doc) {
    if (doc.getElementById('af-hd')) return;
    var st = doc.createElement('style'); st.id = 'af-hd';
    st.textContent = [
      '.hdgrid{display:grid;gap:14px}',
      '.hdc{background:#fff;color:#3c3c3c;border:3px solid #e5e7ee;border-radius:22px;padding:14px}',
      '.hdc-top{display:flex;gap:12px;align-items:flex-start;direction:rtl}',
      '.hdc-i{width:98px;flex:none;aspect-ratio:3/4;border-radius:8px;overflow:hidden;background:#e6eefb;box-shadow:0 2px 8px rgba(0,0,0,.22)}',
      '.hdc-i img{width:100%;height:100%;object-fit:cover;display:block}',
      '.hdc-inf{flex:1;min-width:0}',
      '.hdc-inf b{display:block;font-size:15.5px;font-weight:800;line-height:1.6;margin-bottom:6px;color:#2b2b2b}',
      '.hdc .hr{display:flex;align-items:center;gap:7px;font-size:13px;line-height:1.7;color:#4b4b4b;margin:3px 0}',
      '.hdc .hr span{font-weight:700}',
      '.hdc .hr svg{width:19px;height:19px;flex:none;color:#1cb0f6}',
      '.hdc hr{border:0;border-top:2px solid #e8eaf0;margin:12px 0}',
      '.hdc-m{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13px;font-weight:700;color:#4b4b4b}',
      '.hdc-m span{display:flex;align-items:center;gap:6px}.hdc-m svg{width:19px;height:19px;color:#1cb0f6}',
      '.hdc-r{margin-top:8px;font-size:13.5px;font-weight:700;display:flex;align-items:center;gap:6px}',
      '.hdst i{font-style:normal;color:#d5dbe6;font-size:17px}.hdst i.on{color:#f5a524}',
      '.hdc .go{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-bottom:4px solid #1288c4;background:#1cb0f6;color:#fff;border-radius:16px;padding:12px 8px;font:inherit;font-size:15px;font-weight:800;cursor:pointer}',
      '.hdc .go:active{transform:translateY(3px);border-bottom-width:1px}',
      '.hdc .go svg{width:22px;height:22px}',
      '.hdc .mg{display:flex;gap:6px;margin-top:10px}.hdc .mg button{flex:1;border:1px solid #d9e3f2;background:#f4f8fd;border-radius:12px;padding:9px 2px;font:inherit;font-size:12px;font-weight:700;color:#14213d;cursor:pointer}',
      '.hdc .mg button.dn{color:#d9283d;border-color:#f3c9cf;background:#fff5f6}',
      '.hdv{position:fixed;inset:0;z-index:2147483200;background:#e9eef6;display:flex;flex-direction:column;direction:rtl;font-family:"Noto Naskh Arabic",sans-serif}',
      '.hdv.night{background:#0e1117}',
      '.hdv-t{display:flex;align-items:center;gap:6px;padding:calc(8px + env(safe-area-inset-top,0px)) 8px 8px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.12);flex-wrap:wrap}',
      '.hdv-t button{width:40px;height:40px;border:0;border-radius:12px;background:#eef3fb;color:#14213d;font-size:18px;cursor:pointer;display:grid;place-items:center}',
      '.hdv-t button.on{background:#0aa6f5;color:#fff}',
      '.hdv-t button svg{width:22px;height:22px}',
      '.hdv-b{position:absolute;left:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px;z-index:5;background:none;box-shadow:none;padding:0}',
      '.hdv-b button{width:50px;height:50px;border:1.5px solid #dbe5f3;background:rgba(255,255,255,.96);color:#1288c4;border-radius:14px;display:grid;place-items:center;padding:0;cursor:pointer;box-shadow:0 3px 12px rgba(20,33,61,.22)}',
      '.hdv-b button svg{width:24px;height:24px}',
      '.hdv-b button span{display:none}',
      '.hdv-b button:active{background:#e6f3ff;transform:scale(.94)}',
      '.hdv.night .hdv-b button{background:rgba(31,38,51,.96);border-color:#2c3648;color:#7cc8f5}',
      '.hdv-t .tt{flex:1;min-width:120px;font-weight:700;font-size:14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
      '.hdv-t input{width:58px;height:38px;border:1.5px solid #cfdaed;border-radius:10px;text-align:center;font:inherit;font-size:14px}',
      '.hdv-t .pg{font-size:13px;color:#4b5b78;white-space:nowrap}',
      '.hdv-s{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 0 40px;touch-action:pan-x pan-y}',
      '.hdp{margin:0 auto 10px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.18);position:relative}',
      '.hdp canvas{display:block;width:100%;height:100%}',
      '.hdv.night .hdp canvas{filter:invert(.9) hue-rotate(180deg)}',
      '.hdv-l{position:absolute;inset:60px 0 0;z-index:3;display:grid;place-items:center;text-align:center;color:#14213d;font-weight:700;font-size:15px;background:rgba(233,238,246,.92)}',
      '.hdv.night .hdv-l{color:#fff;background:rgba(14,17,23,.92)}',
      '.hdcr{position:absolute;inset:0;z-index:5;background:#0b0f16;display:flex;flex-direction:column}',
      '.hdcr-b{flex:1;overflow:auto;display:grid;place-items:start center;padding:10px}',
      '.hdcr-w{position:relative;touch-action:none}',
      '.hdcr-w canvas{display:block;max-width:none}',
      '.hdcr-r{position:absolute;border:2px dashed #0aa6f5;background:rgba(10,166,245,.18);pointer-events:none}',
      '.hdcr-t{display:flex;gap:8px;padding:10px;background:#fff;align-items:center}.hdcr-t p{flex:1;margin:0;font-size:13px;color:#4b5b78}',
      '.afcf{position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.5);display:grid;place-items:center;padding:20px}',
      '.afcf-b{background:#fff;color:#14213d;border-radius:20px;padding:20px;width:100%;max-width:340px;text-align:center}.afcf-b p{margin:0 0 16px;font-size:15px;line-height:1.8}.afcf-b div{display:flex;gap:10px}.afcf-b button{flex:1}',
      '.hdpr{height:10px;border-radius:6px;background:#dbe5f4;overflow:hidden;margin:8px 0}.hdpr i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0aa6f5,#12a15a);transition:width .2s}',
      '.hdlbl{display:block;font-size:13px;font-weight:700;margin:4px 0 4px;color:inherit}',
      '.hdform select,.hdform input[type=date]{width:100%;box-sizing:border-box;border:1.5px solid #dbe3ef;border-radius:14px;padding:11px 13px;font:inherit;font-size:15px;background:#fff;color:#14213d;margin:0 0 10px}'
    ].join('\n');
    (doc.head || doc.documentElement).appendChild(st);
  }

  /* ---------- تنزيل الملزمة (قطع) مع تخزين محلي ---------- */
  var mem = {};
  function getBlob(h, prog) {
    var key = '/_hd/' + h.id + '/' + (h.upd || 0);
    if (mem[key]) return Promise.resolve(mem[key]);
    var cache = (window.caches && caches.open) ? caches.open('af-handouts') : Promise.resolve(null);
    return cache.then(function (c) {
      return (c ? c.match(key).catch(function () { return null; }) : Promise.resolve(null)).then(function (hit) {
        if (hit) return hit.blob().then(function (b) { mem[key] = b; return b; });
        var parts = [], i = 0, n = h.chunks;
        function next() {
          if (i >= n) { var b = new Blob(parts, { type: 'application/pdf' }); mem[key] = b; if (c) try { c.put(key, new Response(b)); } catch (e) {} return b; }
          return getJ('/handout_files/' + h.id + '/c' + i + '.json').then(function (s) {
            if (typeof s !== 'string') throw new Error('ملف الملزمة ناقص، اطلب من الإدارة تحديثه');
            var bin = atob(s), u = new Uint8Array(bin.length); for (var k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
            parts.push(u); i++; if (prog) prog(i / n); return next();
          });
        }
        return next();
      });
    });
  }

  /* ---------- العارض ---------- */
  var SV = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var VI = {
    back: SV('<path d="M9 5l7 7-7 7"/>'),
    minus: SV('<path d="M5 12h14"/>'),
    plus: SV('<path d="M12 5v14M5 12h14"/>'),
    fit: SV('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    moon: SV('<path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/>'),
    crop: SV('<path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14"/>'),
    save: SV('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>'),
    star: SV('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')
  };
  function viewer(doc, h, R) {
    css(doc);
    if (!h.chunks) { X.panel(doc, h.name || 'ملزمة', '<div class="afp-c"><p style="font-size:16px;text-align:center;padding:34px 0;line-height:2">لم يتم رفع الملف PDF حتى الآن</p></div>'); return; }
    var ov = doc.createElement('div'); ov.className = 'hdv';
    ov.innerHTML = '<div class="hdv-t"><button data-a="x" aria-label="رجوع">' + VI.back + '</button><div class="tt">' + esc(h.name) + '</div>' +
      '<button data-a="zo" aria-label="تصغير">' + VI.minus + '</button><button data-a="zi" aria-label="تكبير">' + VI.plus + '</button><button data-a="fit" aria-label="ملء العرض">' + VI.fit + '</button><button data-a="nt" aria-label="وضع ليلي">' + VI.moon + '</button>' +
      '<div style="flex-basis:100%;display:flex;gap:8px;align-items:center"><span class="pg" id="hdpg" dir="ltr" style="unicode-bidi:isolate">…</span><input id="hdgo" type="number" min="1" inputmode="numeric" placeholder="صفحة"><button data-a="go" style="width:auto;padding:0 14px;font-size:13px;font-weight:700">اذهب</button></div></div>' +
      '<div class="hdv-s" id="hdS"></div>' +
      '<div class="hdv-b"><button data-a="cr" aria-label="اقتطاع صورة">' + VI.crop + '<span>اقتطاع صورة</span></button><button data-a="sv" aria-label="حفظ الصفحة">' + VI.save + '<span>حفظ الصفحة</span></button><button data-a="st" aria-label="تقييم">' + VI.star + '<span>تقييم</span></button></div>' +
      '<div class="hdv-l" id="hdL">جاري تحميل الملزمة 0%</div>';
    doc.body.appendChild(ov);
    var S = ov.querySelector('#hdS'), L = ov.querySelector('#hdL'), PG = ov.querySelector('#hdpg');
    var pdf = null, N = 0, zoom = 1, ratio = 1.41, cw = 0, pages = [], obs = null, rt = 0;
    function close() { try { if (obs) obs.disconnect(); if (pdf) pdf.destroy(); } catch (e) {} ov.remove(); }
    function width() { return Math.max(240, (S.clientWidth || 360) - 16) * zoom; }
    function layout() {
      cw = width();
      pages.forEach(function (p) { p.el.style.width = cw + 'px'; p.el.style.height = Math.round(cw * (p.ratio || ratio)) + 'px'; if (p.rendered) { p.rendered = false; p.cv.width = 0; } });
      renderVisible();
    }
    function renderVisible() {
      var top = S.scrollTop, bot = top + S.clientHeight;
      pages.forEach(function (p) {
        var t = p.el.offsetTop, b = t + p.el.offsetHeight, near = b > top - S.clientHeight && t < bot + S.clientHeight;
        if (near && !p.rendered && !p.busy) {
          p.busy = true;
          pdf.getPage(p.n).then(function (pg) {
            var v0 = pg.getViewport({ scale: 1 }); p.ratio = v0.height / v0.width;
            var sc = (cw / v0.width) * Math.min(2.5, window.devicePixelRatio || 2), vp = pg.getViewport({ scale: sc });
            p.cv.width = Math.round(vp.width); p.cv.height = Math.round(vp.height);
            p.el.style.height = Math.round(cw * p.ratio) + 'px';
            return pg.render({ canvasContext: p.cv.getContext('2d'), viewport: vp }).promise;
          }).then(function () { p.rendered = true; p.busy = false; }).catch(function () { p.busy = false; });
        } else if (!near && p.rendered) { p.cv.width = 0; p.rendered = false; }
      });
    }
    function curPage() {
      var mid = S.scrollTop + S.clientHeight / 3, c = 1;
      for (var i = 0; i < pages.length; i++) { if (pages[i].el.offsetTop <= mid) c = i + 1; else break; }
      return c;
    }
    function upd() { PG.textContent = curPage() + ' / ' + N; }
    S.addEventListener('scroll', function () { upd(); clearTimeout(rt); rt = setTimeout(renderVisible, 60); }, { passive: true });
    function setZoom(z) { var a = S.scrollTop / Math.max(1, S.scrollHeight); zoom = Math.max(0.6, Math.min(4, z)); layout(); S.scrollTop = a * S.scrollHeight; }
    // قرص بإصبعين للتكبير
    var d0 = 0, z0 = 1;
    S.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { d0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); z0 = zoom; } }, { passive: true });
    S.addEventListener('touchmove', function (e) { if (e.touches.length === 2 && d0) { var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); clearTimeout(S._pz); S._pz = setTimeout(function () { setZoom(z0 * d / d0); }, 60); } }, { passive: true });
    S.addEventListener('touchend', function () { d0 = 0; }, { passive: true });
    function savePage(n, region) {
      pdf.getPage(n).then(function (pg) {
        var v0 = pg.getViewport({ scale: 1 }), sc = Math.min(3, 2400 / v0.width), vp = pg.getViewport({ scale: sc }), cv = doc.createElement('canvas');
        cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
        return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () {
          if (region) { var o = doc.createElement('canvas'), x = Math.round(region.x * cv.width), y = Math.round(region.y * cv.height), w = Math.max(8, Math.round(region.w * cv.width)), hh = Math.max(8, Math.round(region.h * cv.height)); o.width = w; o.height = hh; o.getContext('2d').drawImage(cv, x, y, w, hh, 0, 0, w, hh); cv = o; }
          dlData(doc, cv.toDataURL('image/png'), (h.name || 'ملزمة') + '-ص' + n + (region ? '-جزء' : '') + '.png');
        });
      }).catch(function () { alert('تعذّر حفظ الصورة'); });
    }
    function cropMode() {
      var n = curPage(), cr = doc.createElement('div'); cr.className = 'hdcr';
      cr.innerHTML = '<div class="hdcr-t"><p>اسحب بإصبعك لتحديد الجزء المطلوب من الصفحة ' + n + '</p><button class="afbtn gray" data-n>إلغاء</button><button class="afbtn" data-s disabled>حفظ الجزء</button></div><div class="hdcr-b"><div class="hdcr-w"><canvas></canvas><div class="hdcr-r" style="display:none"></div></div></div>';
      ov.appendChild(cr);
      var cv = cr.querySelector('canvas'), w = cr.querySelector('.hdcr-w'), rc = cr.querySelector('.hdcr-r'), sv = cr.querySelector('[data-s]'), sel = null, st = null;
      pdf.getPage(n).then(function (pg) { var v0 = pg.getViewport({ scale: 1 }), sc = Math.min(2, (S.clientWidth - 24) / v0.width * (window.devicePixelRatio || 2)), vp = pg.getViewport({ scale: sc }); cv.width = vp.width; cv.height = vp.height; cv.style.width = Math.round(vp.width / (window.devicePixelRatio || 2)) + 'px'; return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; });
      function pt(e) { var b = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)), y: Math.max(0, Math.min(1, (e.clientY - b.top) / b.height)) }; }
      w.addEventListener('pointerdown', function (e) { st = pt(e); sel = null; rc.style.display = 'block'; try { w.setPointerCapture(e.pointerId); } catch (x) {} });
      w.addEventListener('pointermove', function (e) {
        if (!st) return; var p = pt(e), x = Math.min(st.x, p.x), y = Math.min(st.y, p.y), ww = Math.abs(p.x - st.x), hh = Math.abs(p.y - st.y); sel = { x: x, y: y, w: ww, h: hh };
        var b = cv.getBoundingClientRect(); rc.style.left = x * b.width + 'px'; rc.style.top = y * b.height + 'px'; rc.style.width = ww * b.width + 'px'; rc.style.height = hh * b.height + 'px'; sv.disabled = ww < 0.02 || hh < 0.02;
      });
      w.addEventListener('pointerup', function () { st = null; });
      cr.querySelector('[data-n]').onclick = function () { cr.remove(); };
      sv.onclick = function () { if (sel) { savePage(n, sel); cr.remove(); } };
    }
    function rateBox() {
      if (R.role === 'guest') return;
      var o = doc.createElement('div'); o.className = 'afcf';
      var mine = h.rat && h.rat['u' + okk(R.uid)] || 0;
      o.innerHTML = '<div class="afcf-b"><p>قيّم هذه الملزمة</p><div id="rs" style="justify-content:center;font-size:34px;margin-bottom:14px;direction:ltr">' + [1, 2, 3, 4, 5].map(function (i) { return '<span data-n="' + i + '" style="cursor:pointer;color:' + (i <= mine ? '#f5a524' : '#cdd6e4') + '">★</span>'; }).join('') + '</div><button class="afbtn gray" data-c style="width:100%">إغلاق</button></div>';
      doc.body.appendChild(o); o.querySelector('[data-c]').onclick = function () { o.remove(); };
      o.querySelector('#rs').onclick = function (e) {
        var s = e.target.closest('[data-n]'); if (!s) return; var n = +s.dataset.n;
        putJ('/handouts/' + h.id + '/rat/u' + okk(R.uid) + '.json', n).then(function () { h.rat = h.rat || {}; h.rat['u' + okk(R.uid)] = n; o.remove(); }).catch(function (x) { alert('تعذّر حفظ التقييم: ' + x.message); });
      };
    }
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]'); if (!b) return; var a = b.dataset.a;
      if (a === 'x') close(); else if (a === 'zi') setZoom(zoom * 1.25); else if (a === 'zo') setZoom(zoom / 1.25); else if (a === 'fit') setZoom(1);
      else if (a === 'nt') { ov.classList.toggle('night'); b.classList.toggle('on'); } else if (a === 'sv') savePage(curPage()); else if (a === 'cr') cropMode(); else if (a === 'st') rateBox();
      else if (a === 'go') { var v = +ov.querySelector('#hdgo').value; if (v >= 1 && v <= N) S.scrollTop = pages[v - 1].el.offsetTop - 6; }
    });
    getBlob(h, function (f) { L.textContent = 'جاري تحميل الملزمة ' + Math.round(f * 100) + '%'; })
      .then(function (blob) { return loadPdf().then(function (lib) { L.textContent = 'جاري فتح الملزمة...'; return lib.getDocument({ url: URL.createObjectURL(blob) }).promise; }); })
      .then(function (d) {
        pdf = d; N = d.numPages; L.remove();
        for (var i = 1; i <= N; i++) { var el = doc.createElement('div'); el.className = 'hdp'; var cv = doc.createElement('canvas'); el.appendChild(cv); S.appendChild(el); pages.push({ n: i, el: el, cv: cv, ratio: 0, rendered: false, busy: false }); }
        layout(); upd();
      }).catch(function (e) { L.textContent = 'تعذّر فتح الملزمة: ' + (e && e.message || e); });
  }

  /* ---------- رفع الملف ---------- */
  function readSlice(file, a, b) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1] || ''); }; fr.onerror = function () { rej(new Error('تعذّرت قراءة الملف')); }; fr.readAsDataURL(file.slice(a, b)); }); }
  function coverFrom(file) {
    return file.arrayBuffer().then(function (buf) {
      return loadPdf().then(function (lib) { return lib.getDocument({ data: buf }).promise; });
    }).then(function (pdf) {
      return pdf.getPage(1).then(function (pg) {
        var v0 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: 240 / v0.width }), cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
        return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function () { var out = { cover: cv.toDataURL('image/jpeg', 0.6), pages: pdf.numPages }; pdf.destroy(); return out; });
      });
    });
  }
  function uploadPdf(file, id, onProg) {
    var n = Math.ceil(file.size / CHUNK), i = 0;
    function next() {
      if (i >= n) return Promise.resolve(n);
      return readSlice(file, i * CHUNK, Math.min(file.size, (i + 1) * CHUNK)).then(function (b64) { return putJ('/handout_files/' + id + '/c' + i + '.json', b64); }).then(function () { i++; onProg(i / n); return next(); });
    }
    return next();
  }
  function coverFile(f) {
    return new Promise(function (res) {
      var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 240 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.6)); }; im.onerror = function () { res(''); }; im.src = fr.result; };
      fr.onerror = function () { res(''); }; fr.readAsDataURL(f);
    });
  }

  /* ---------- نموذج الإضافة / التعديل / التحديث ---------- */
  function formPage(doc, R, h, done) {
    css(doc);
    var isEdit = !!h, today = isoDate(h ? h.upd : Date.now());
    var html = '<div class="afp-c hdform"><span class="hdlbl">اسم الملزمة</span><input id="hdn" class="afin" maxlength="120" value="' + esc(h ? h.name : '') + '" placeholder="مثال: ملزمة رياضيات علي صادق الثالث المتوسط 2027">' +
      '<span class="hdlbl">اسم أستاذ الملزمة</span><input id="hdt" class="afin" maxlength="80" value="' + esc(h ? h.teacher : '') + '" placeholder="اسم الأستاذ">' +
      '<span class="hdlbl">التصنيف</span><select id="hdc">' + CATS.map(function (c) { return '<option' + ((h ? h.cat : CATS[0]) === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
      '<span class="hdlbl">تاريخ التحديث</span><input id="hdd" type="date" value="' + today + '">' +
      (isEdit ? '<span class="hdlbl">تغيير صورة الغلاف (اختياري)</span>' : '<span class="hdlbl">ملف الملزمة (PDF)</span><input id="hdf" type="file" accept="application/pdf,.pdf" class="afin"><span class="hdlbl">صورة الغلاف (اختياري، وإلا تؤخذ أول صفحة)</span>') +
      '<input id="hdv" type="file" accept="image/*" class="afin">' +
      '<div class="hdpr" id="hdpr" style="display:none"><i></i></div><div class="afmsg" id="hdm"></div>' +
      '<button class="afbtn" id="hdgo" style="width:100%">' + (isEdit ? 'حفظ التعديلات' : 'رفع الملزمة') + '</button></div>';
    X.panel(doc, isEdit ? 'تعديل المعلومات' : 'إضافة ملزمة', html, function (p) {
      var m = p.querySelector('#hdm'), pr = p.querySelector('#hdpr'), bar = pr.firstChild, go = p.querySelector('#hdgo');
      function msg(t, c) { m.className = 'afmsg ' + (c || ''); m.textContent = t; }
      go.onclick = function () {
        var name = p.querySelector('#hdn').value.trim(), teacher = p.querySelector('#hdt').value.trim(), cat = p.querySelector('#hdc').value, dv = p.querySelector('#hdd').value, upd = dv ? new Date(dv + 'T12:00:00').getTime() : Date.now();
        var cf = p.querySelector('#hdv').files[0], pf = !isEdit && p.querySelector('#hdf').files[0];
        if (!name) return msg('اكتب اسم الملزمة', 'bad'); if (!teacher) return msg('اكتب اسم أستاذ الملزمة', 'bad');
        if (!isEdit) { if (!pf) return msg('اختر ملف الملزمة PDF', 'bad'); if (!/pdf$/i.test(pf.name) && pf.type !== 'application/pdf') return msg('الملف لازم يكون PDF', 'bad'); if (pf.size > MAXMB * 1048576) return msg('حجم الملف أكبر من ' + MAXMB + ' ميغا', 'bad'); }
        go.disabled = true; pr.style.display = 'block';
        if (isEdit) {
          (cf ? coverFile(cf) : Promise.resolve('')).then(function (cv) { var o = { name: name, teacher: teacher, cat: cat, upd: upd }; if (cv) o.cover = cv; return patchJ('/handouts/' + h.id + '.json', o).then(function () { Object.assign(h, o); }); })
            .then(function () { msg('تم حفظ التعديلات ✓', 'ok'); setTimeout(function () { p.remove(); done(); }, 600); }).catch(function (e) { go.disabled = false; msg(e.message, 'bad'); });
          return;
        }
        var id = 'h' + Date.now(), rec;
        msg('جاري فحص الملف...'); bar.style.width = '4%';
        coverFrom(pf).then(function (c) { rec = c; return cf ? coverFile(cf).then(function (x) { if (x) rec.cover = x; }) : null; })
          .then(function () { msg('جاري رفع الملزمة... لا تغلق الصفحة'); return uploadPdf(pf, id, function (f) { bar.style.width = (8 + f * 90) + '%'; }); })
          .then(function (n) { var meta = { id: id, name: name, teacher: teacher, cat: cat, grade: '3', upd: upd, cover: rec.cover, pages: rec.pages, size: pf.size, chunks: n, by: R.uid, byName: R.name }; return putJ('/handouts/' + id + '.json', meta); })
          .then(function () { bar.style.width = '100%'; msg('تم رفع الملزمة بنجاح ✓', 'ok'); setTimeout(function () { p.remove(); done(); }, 700); })
          .catch(function (e) { go.disabled = false; pr.style.display = 'none'; delP('/handout_files/' + id + '.json').catch(function () {}); msg('تعذّر الرفع: ' + (e && e.message || e) + '. تأكد من الملف ومن قواعد قاعدة البيانات.', 'bad'); });
      };
    });
  }
  function replaceFile(doc, R, h, done) {
    var inp = doc.createElement('input'); inp.type = 'file'; inp.accept = 'application/pdf,.pdf'; inp.style.display = 'none'; doc.body.appendChild(inp);
    inp.onchange = function () {
      var f = inp.files[0]; inp.remove(); if (!f) return;
      if (f.size > MAXMB * 1048576) { alert('الحجم أكبر من ' + MAXMB + ' ميغا'); return; }
      var box = doc.createElement('div'); box.className = 'afcf'; box.innerHTML = '<div class="afcf-b"><p id="m">جاري فحص الملف...</p><div class="hdpr"><i></i></div></div>'; doc.body.appendChild(box);
      var m = box.querySelector('#m'), bar = box.querySelector('.hdpr i'), old = h.chunks || 0, nn = 0;
      coverFrom(f).then(function (c) { m.textContent = 'جاري رفع الملف الجديد...'; return uploadPdf(f, h.id, function (x) { bar.style.width = (5 + x * 93) + '%'; }).then(function (n) { nn = n; return c; }); })
        .then(function (c) { var o = { chunks: nn, pages: c.pages, size: f.size, upd: Date.now() }; if (!h.cover) o.cover = c.cover; return patchJ('/handouts/' + h.id + '.json', o).then(function () { Object.assign(h, o); }); })
        .then(function () { var all = []; for (var i = nn; i < old; i++) all.push(delP('/handout_files/' + h.id + '/c' + i + '.json').catch(function () {})); return Promise.all(all); })
        .then(function () { m.textContent = 'تم تحديث الملف وتاريخ التحديث ✓'; setTimeout(function () { box.remove(); done(); }, 800); })
        .catch(function (e) { m.textContent = 'تعذّر التحديث: ' + (e && e.message || e); setTimeout(function () { box.remove(); }, 2500); });
    };
    inp.click();
  }

  /* ---------- القائمة ---------- */
  function listPage(doc) {
    css(doc);
    var R = X.roleInfo(), mgr = R.role === 'admin', items = [];
    X.panel(doc, 'ملازم الثالث متوسط 2027', (mgr ? '<button class="afbtn" id="hdadd" style="width:100%;margin-bottom:12px">➕ إضافة ملزمة</button>' : '') + '<div id="hdl"><p style="text-align:center;padding:30px 0">جاري التحميل...</p></div>', function (p) {
      var L = p.querySelector('#hdl');
      function draw() {
        if (!items.length) { L.innerHTML = '<div class="afp-c"><p style="text-align:center;font-size:15px;padding:24px 0">' + (mgr ? 'ما اكو ملازم بعد. اضغط «إضافة ملزمة».' : 'ما اكو ملازم منشورة بعد.') + '</p></div>'; return; }
        var IC = {
          u: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" opacity=".15"/><circle cx="12" cy="9" r="3.4"/><path d="M5.5 19c.8-3.2 3.4-4.6 6.5-4.6s5.7 1.4 6.5 4.6"/></svg>',
          i: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M11 10h2v7h-2zM11 7h2v2h-2z" fill="#fff"/></svg>',
          c: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 9.5h17" stroke="#fff" stroke-width="1.6"/><path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><g fill="#fff"><circle cx="8" cy="13" r="1.1"/><circle cx="12" cy="13" r="1.1"/><circle cx="16" cy="13" r="1.1"/><circle cx="8" cy="17" r="1.1"/><circle cx="12" cy="17" r="1.1"/></g></svg>',
          f: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h8l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v5h5" fill="#fff" opacity=".5"/><path d="M8 15c2-4 3-6 3-8 0 3 2 6 5 7-3-1-6 0-8 1z" fill="#fff"/></svg>',
          e: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
        };
        function mb(n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + 'KB' : (n / 1048576 >= 10 ? (n / 1048576).toFixed(1) : (n / 1048576).toFixed(2)) + 'MB'; }
        L.innerHTML = '<div class="hdgrid">' + items.map(function (h) {
          return '<div class="hdc" data-id="' + h.id + '"><div class="hdc-top"><div class="hdc-i"><img src="' + (h.cover || NOCOVER) + '" alt=""></div><div class="hdc-inf"><b>' + esc(h.name) + '</b>' +
            '<div class="hr"><span>التصنيف:</span> ' + esc(h.cat || '') + '</div><div class="hr">' + IC.u + '<span>اعداد:</span> ' + esc(h.teacher || '') + '</div><div class="hr">' + IC.i + '<span>الصف:</span> الثالث المتوسط</div><div class="hr">' + IC.c + '<span>تاريخ التحديث:</span> ' + fmtDate(h.upd) + '</div></div></div>' +
            '<hr><div class="hdc-m">' + (h.pages ? '<span>' + IC.f + 'عدد الصفحات: ' + h.pages + '</span>' : '') + (h.size ? '<span>' + IC.f + 'حجم الملف: ' + mb(h.size) + '</span>' : '') + '</div>' +
            '<div class="hdc-r">التقييم ' + stars(h) + '</div><hr>' +
            '<button class="go" data-a="v">' + IC.e + 'مشاهدة الملزمة والمتابعة</button>' +
            (mgr ? '<div class="mg"><button data-a="e">تعديل المعلومات</button><button data-a="u">تحديث الملف</button><button class="dn" data-a="d">حذف الملف</button></div>' : '') + '</div>';
        }).join('') + '</div>';
      }
      function load() {
        getJ('/handouts.json').then(function (o) { items = Object.keys(o || {}).map(function (k) { return o[k]; }).filter(function (x) { return x && x.id; }).sort(function (a, b) { return (b.upd || 0) - (a.upd || 0); }); draw(); })
          .catch(function (e) { L.innerHTML = '<div class="afp-c"><p style="text-align:center">تعذّر تحميل الملازم: ' + esc(e.message) + '</p><button class="afbtn" id="hdr" style="width:100%">إعادة المحاولة</button></div>'; var r = L.querySelector('#hdr'); if (r) r.onclick = load; });
      }
      L.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-a]'); if (!b) return; var c = b.closest('.hdc'), h = items.filter(function (x) { return x.id === c.dataset.id; })[0]; if (!h) return;
        if (b.dataset.a === 'v') viewer(doc, h, R);
        else if (b.dataset.a === 'e') formPage(doc, R, h, function () { draw(); });
        else if (b.dataset.a === 'u') replaceFile(doc, R, h, function () { draw(); });
        else if (b.dataset.a === 'd') confirmBox(doc, 'حذف الملزمة «' + h.name + '» نهائياً من كل الأجهزة؟', 'حذف', function () {
          delP('/handouts/' + h.id + '.json').then(function () { return delP('/handout_files/' + h.id + '.json'); }).then(function () { items = items.filter(function (x) { return x.id !== h.id; }); draw(); }).catch(function (x) { alert('تعذّر الحذف: ' + x.message); });
        });
      });
      var add = p.querySelector('#hdadd'); if (add) add.onclick = function () { formPage(doc, R, null, load); };
      var back = p.querySelector('.afp-b'); if (back) back.addEventListener('click', function () { items = []; });
      load();
    });
  }
  window.afHandouts = listPage;
})();
