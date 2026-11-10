/* حساب المطوّر لموقع التثبيت: إحصائيات + تحديث ملف APK + تحديث ملفات الموقع (ZIP) تلقائياً.
 * كل ملف يُرفع موقَّعاً بمفتاح المطوّر، والموقع يرفض أي ملف بدون التوقيع الصحيح. */
(function () {
  'use strict';
  var W = window, D = document, PUB = {"kty":"EC","x":"9IvmMNuga6JvjOjjBUFq4MYBDfjhllaUD8rByaS5iD0","y":"JyAh6qs9loudQZR3OnaSysYMTcy7vpZ-FuhME4BnpF8","crv":"P-256"}, EMAIL_H = 'a00925dce925b9dd79013eb6524f845bf2d4e8d14ab8ae1e6e7325622e5ca05e';
  var CHUNK = 700 * 1024, MAXB = 25 * 1024 * 1024, KEYS = 'af_ota_key', CACHE = 'alfarabi-ota-web';
  var BASE = (function () { var s = D.currentScript; var u = s && s.src ? s.src : location.href; return u.replace(/[^\/]*([?#].*)?$/, ''); })();
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function b2h(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function u8b64(u) { var s = '', i, n = 0x8000; for (i = 0; i < u.length; i += n) s += String.fromCharCode.apply(null, u.subarray(i, i + n)); return btoa(s); }
  function b64u8(b) { var s = atob(b), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function enc(t) { return new TextEncoder().encode(t); }
  function fj(p, o) { var b = W.FBBASE; if (!b) return Promise.reject(new Error('لا يوجد اتصال بقاعدة البيانات')); return fetch(b + p, o).then(function (r) { if (!r.ok) throw new Error('رفض الخادم (' + r.status + ')'); return r.json(); }); }
  function waitBase(ms) { return new Promise(function (res) { var t0 = Date.now(); (function l() { if (W.FBBASE || Date.now() - t0 > ms) return res(W.FBBASE); setTimeout(l, 200); })(); }); }
  function msgOf(kind, v, sha) { return enc('alfarabi-site:' + kind + ':' + v + ':' + sha); }

  /* ---------- تحقق وتوقيع ---------- */
  function verifySig(kind, meta, bytes) {
    return crypto.subtle.digest('SHA-256', bytes).then(function (h) {
      var sha = b2h(h); if (sha !== meta.sha) throw new Error('بصمة الملف غير مطابقة');
      return crypto.subtle.importKey('jwk', PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']).then(function (k) {
        return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64u8(meta.sig), msgOf(kind, meta.v, sha));
      }).then(function (ok) { if (!ok) throw new Error('التوقيع غير صحيح'); });
    });
  }
  function getKey() { try { return JSON.parse(localStorage.getItem(KEYS) || 'null'); } catch (e) { return null; } }
  function importKey(file) {
    return file.text().then(function (t) {
      var j = JSON.parse(t); if (!j || j.kty !== 'EC' || !j.d) throw new Error('هذا ليس ملف مفتاح المطوّر');
      if (j.x !== PUB.x || j.y !== PUB.y) throw new Error('هذا المفتاح لا يطابق مفتاح الموقع');
      return crypto.subtle.importKey('jwk', j, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']).then(function () { localStorage.setItem(KEYS, JSON.stringify(j)); });
    });
  }
  function sign(kind, v, sha) {
    var j = getKey(); if (!j) return Promise.reject(new Error('استورد مفتاح المطوّر أولاً'));
    return crypto.subtle.importKey('jwk', j, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']).then(function (k) { return crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k, msgOf(kind, v, sha)); }).then(function (s) { return u8b64(new Uint8Array(s)); });
  }
  function publish(kind, filesNode, curPath, bytes, extra, prog) {
    if (bytes.length > MAXB) return Promise.reject(new Error('الحجم أكبر من 25 ميغا'));
    var v = Math.floor(Date.now() / 1000), n = Math.ceil(bytes.length / CHUNK);
    return crypto.subtle.digest('SHA-256', bytes).then(function (h) {
      var sha = b2h(h);
      return sign(kind, v, sha).then(function (sig) {
        var i = 0;
        function up() { if (i >= n) return; var s = u8b64(bytes.subarray(i * CHUNK, Math.min(bytes.length, (i + 1) * CHUNK))); return fj(filesNode + '/v' + v + '/c' + i + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }).then(function () { i++; prog && prog(i / n); return up(); }); }
        return up().then(function () {
          var meta = Object.assign({ v: v, n: n, sha: sha, sig: sig, size: bytes.length, ts: Date.now() }, extra || {});
          return fj(curPath + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) }).then(function () { return meta; });
        });
      });
    });
  }
  function download(filesNode, meta, kind) {
    var parts = [], total = 0, i = 0;
    function next() { if (i >= meta.n) return; return fj(filesNode + '/v' + meta.v + '/c' + i + '.json').then(function (s) { if (typeof s !== 'string') throw new Error('ناقص'); var u = b64u8(s); total += u.length; if (total > MAXB) throw new Error('كبير'); parts.push(u); i++; return next(); }); }
    return next().then(function () { var all = new Uint8Array(total), o = 0; parts.forEach(function (p) { all.set(p, o); o += p.length; }); return verifySig(kind, meta, all).then(function () { return all; }); });
  }

  /* ---------- ملف APK للتحميل من الموقع ---------- */
  W.afSite = {
    apkMeta: function () { return waitBase(8000).then(function () { return fj('/site/apk.json'); }).catch(function () { return null; }); },
    apkDownload: function (meta) {
      return download('/site_apk', meta, 'apk').then(function (bytes) {
        var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.android.package-archive' })); a.download = 'alfarabi-v' + (meta.ver || '') + '.apk'; D.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1500);
      });
    }
  };

  /* ---------- تحديث ملفات الموقع تلقائياً (ZIP موقَّع) ---------- */
  function inflateRaw(u8) { var ds = new DecompressionStream('deflate-raw'); var w = ds.writable.getWriter(); w.write(u8); w.close(); return new Response(ds.readable).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  function unzip(u8) {
    var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), e = -1, i;
    for (i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; } }
    if (e < 0) throw new Error('ZIP غير صالح');
    var cnt = dv.getUint16(e + 10, true), off = dv.getUint32(e + 16, true), out = [], p = off, k, td = new TextDecoder();
    for (k = 0; k < cnt; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('ZIP تالف');
      var meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
      var name = td.decode(u8.subarray(p + 46, p + 46 + nl)).replace(/\\/g, '/');
      p += 46 + nl + el + cl;
      if (name.slice(-1) === '/') continue;
      var lnl = dv.getUint16(lho + 26, true), lel = dv.getUint16(lho + 28, true), ds = lho + 30 + lnl + lel;
      out.push({ name: name, meth: meth, data: u8.subarray(ds, ds + csz) });
    }
    return out;
  }
  var OK = { html: 1, js: 1, css: 1, json: 1, svg: 1, png: 1, jpg: 1, jpeg: 1, webp: 1, woff2: 1, ttf: 1, ico: 1, txt: 1 };
  var CT = { html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', ttf: 'font/ttf', ico: 'image/x-icon', txt: 'text/plain' };
  function applyZip(bytes) {
    var items = unzip(bytes), hasIdx = false;
    return caches.delete(CACHE).then(function () { return caches.open(CACHE); }).then(function (c) {
      var jobs = items.map(function (it) {
        var name = it.name.replace(/^\/+/, ''), ext = name.split('.').pop().toLowerCase();
        if (name.indexOf('..') > -1 || !OK[ext] || name === 'sw.js' || ext === 'apk') return Promise.resolve();
        if (name === 'index.html') hasIdx = true;
        var p = it.meth === 0 ? Promise.resolve(it.data) : it.meth === 8 ? inflateRaw(it.data) : Promise.reject(new Error('ضغط غير مدعوم'));
        return p.then(function (d) {
          var h = { 'Content-Type': CT[ext] || 'application/octet-stream' };
          var r = [c.put(new URL(name, BASE).href, new Response(d, { headers: h }))];
          if (name === 'index.html') r.push(c.put(new URL('./', BASE).href, new Response(d, { headers: h })));
          return Promise.all(r);
        });
      });
      return Promise.all(jobs);
    }).then(function () { if (!hasIdx) throw new Error('الملف لا يحتوي index.html'); });
  }
  function webOta() {
    try {
      if (!W.caches || !W.DecompressionStream || !navigator.serviceWorker) return;
      var ls = W.localStorage;
      if (ls.getItem('af_web_ota_pending') === '1') {          // النسخة السابقة ما أكدت سلامتها: نرجع للأصل
        caches.delete(CACHE); ls.setItem('af_web_ota_bad', ls.getItem('af_web_ota_v') || '0'); ls.removeItem('af_web_ota_v'); ls.setItem('af_web_ota_pending', '0');
      } else if (ls.getItem('af_web_ota_v')) {
        setTimeout(function () { ls.setItem('af_web_ota_pending', '0'); }, 9000);
        ls.setItem('af_web_ota_pending', '1');
      }
      waitBase(20000).then(function () { return fj('/ota_web/current.json'); }).then(function (m) {
        if (!m || !m.v || !m.n) return;
        var cur = +ls.getItem('af_web_ota_v') || 0, bad = +ls.getItem('af_web_ota_bad') || 0;
        if (m.v <= cur || m.v <= bad) return;
        return download('/ota_web_files', m, 'web').then(function (bytes) { return applyZip(bytes); }).then(function () {
          ls.setItem('af_web_ota_v', String(m.v)); ls.setItem('af_web_ota_pending', '0'); location.reload();
        });
      }).catch(function () { });
    } catch (e) { }
  }
  webOta();

  /* ---------- لوحة المطوّر ---------- */
  function sheetEl() { var o = D.getElementById('afs'); if (o) o.remove(); o = D.createElement('div'); o.id = 'afs'; D.body.appendChild(o); return o; }
  function mk(html) { var o = sheetEl(); o.innerHTML = '<div class="sh"><div class="gr"></div>' + html + '<button class="cl" data-x="1">رجوع</button></div>'; o.addEventListener('click', function (e) { if (e.target === o || (e.target.closest && e.target.closest('[data-x]'))) o.remove(); }); return o; }
  function emailOk(e) { return crypto.subtle.digest('SHA-256', enc(e.trim().toLowerCase())).then(function (h) { return b2h(h) === EMAIL_H; }); }
  var INP = 'width:100%;border:2px solid #e1e8f4;border-radius:14px;padding:12px;font:inherit;margin:0 0 10px;background:#f6f9fd';
  function cnt(o) { return o && typeof o === 'object' ? Object.keys(o).length : 0; }
  function fmt(sec) { sec = +sec || 0; var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return (h ? h + ' س ' : '') + m + ' د'; }

  function login() {
    var o = mk('<h2>حساب المطوّر</h2><p class="sb">أدخل بريد المطوّر</p><input id="dve" type="email" dir="ltr" autocomplete="off" placeholder="البريد الإلكتروني" style="' + INP + '"><div id="dvm" style="color:#d9283d;font-weight:700;font-size:13px;min-height:20px;text-align:center"></div><button class="bt p" id="dvg"><span class="t">دخول</span></button>');
    var m = o.querySelector('#dvm');
    o.querySelector('#dvg').onclick = function () {
      m.textContent = 'جاري التحقق...';
      emailOk(o.querySelector('#dve').value).then(function (ok) {
        if (!ok) { m.textContent = 'هذا البريد غير مسموح'; return; }
        if (getKey()) return panel();
        keyStep();
      }).catch(function () { m.textContent = 'افتح الموقع عبر رابط HTTPS'; });
    };
  }
  function keyStep() {
    var o = mk('<h2>تأكيد المطوّر</h2><p class="sb">لحماية الموقع من أي تعديل غير مصرّح به، استورد ملف مفتاح المطوّر (alfarabi-update-key.json) مرة وحدة على هذا الجهاز.</p><input id="dvk" type="file" accept=".json,application/json" style="width:100%;margin:6px 0 12px"><div id="dvm" style="color:#d9283d;font-weight:700;font-size:13px;min-height:20px;text-align:center"></div>');
    o.querySelector('#dvk').onchange = function (e) { var f = e.target.files[0]; if (!f) return; importKey(f).then(panel).catch(function (x) { o.querySelector('#dvm').textContent = x.message; }); };
  }
  function ago(ts) { var d = Math.round((Date.now() - ts) / 60000); return d < 1 ? 'الآن' : d < 60 ? 'قبل ' + d + ' دقيقة' : d < 1440 ? 'قبل ' + Math.round(d / 60) + ' ساعة' : 'قبل ' + Math.round(d / 1440) + ' يوم'; }
  function panel() {
    var o = mk('<h2>لوحة المطوّر</h2><p class="sb">إحصائيات الموقع وتحديث الملفات</p><div id="dvs"><div class="wn">جاري تحميل الإحصائيات...</div></div>' +
      '<div class="wn" style="background:#eef6ff;border-color:#c9e2ff"><b>تحديث ملف التطبيق (APK)</b><br><input id="dva" type="file" accept=".apk,application/vnd.android.package-archive" style="width:100%;margin:8px 0"><input id="dvv" placeholder="رقم النسخة مثل 2.6" dir="ltr" style="' + INP + '"><button class="bt p" id="dvab"><span class="t">رفع ملف APK<small>ينزّله الطلاب من الموقع مباشرة</small></span></button></div>' +
      '<div class="wn" style="background:#eef6ff;border-color:#c9e2ff"><b>تحديث ملفات الموقع / آيفون (ZIP)</b><br><input id="dvz" type="file" accept=".zip,application/zip" style="width:100%;margin:8px 0"><button class="bt p" id="dvzb"><span class="t">رفع ZIP وتحديث الموقع تلقائياً<small>يتحدث عند كل الزوار بدون إعادة رفع على الاستضافة</small></span></button></div>' +
      '<div id="dvm" style="font-weight:700;font-size:13px;min-height:20px;text-align:center"></div>');
    var m = o.querySelector('#dvm');
    function say(t, bad) { m.style.color = bad ? '#d9283d' : '#0b7a3b'; m.textContent = t; }
    function run(btn, fn) { btn.disabled = true; say('جاري التجهيز...'); Promise.resolve().then(fn).then(function (t) { btn.disabled = false; say(t); }).catch(function (e) { btn.disabled = false; say('تعذّر: ' + (e && e.message || e), 1); }); }
    o.querySelector('#dvab').onclick = function () {
      var f = o.querySelector('#dva').files[0], ver = o.querySelector('#dvv').value.trim();
      if (!f) return say('اختر ملف APK', 1); if (!/^[0-9][0-9.]{0,9}$/.test(ver)) return say('اكتب رقم النسخة مثل 2.6', 1);
      run(this, function () { return f.arrayBuffer().then(function (b) { var u = new Uint8Array(b); if (!(u[0] === 0x50 && u[1] === 0x4b)) throw new Error('الملف ليس APK صحيحاً'); return publish('apk', '/site_apk', '/site/apk', u, { ver: ver }, function (p) { say('جاري الرفع ' + Math.round(p * 100) + '%'); }); }).then(function (mt) { return 'تم تحديث ملف التطبيق ✓ نسخة ' + mt.ver; }); });
    };
    o.querySelector('#dvzb').onclick = function () {
      var f = o.querySelector('#dvz').files[0]; if (!f) return say('اختر ملف ZIP', 1);
      run(this, function () { return f.arrayBuffer().then(function (b) { var u = new Uint8Array(b); if (!(u[0] === 0x50 && u[1] === 0x4b)) throw new Error('الملف ليس ZIP صحيحاً'); unzip(u); return publish('web', '/ota_web_files', '/ota_web/current', u, {}, function (p) { say('جاري الرفع ' + Math.round(p * 100) + '%'); }); }).then(function () { return 'تم إرسال تحديث الموقع ✓ يظهر للزوار عند فتح الموقع'; }); });
    };
    Promise.all([fj('/stats/visitors.json'), fj('/stats/installs.json'), fj('/stats/apkdl.json'), fj('/usage.json'), fj('/usagesrc.json'), fj('/site/apk.json'), fj('/ota_web/current.json')].map(function (p) { return p.catch(function () { return null; }); })).then(function (r) {
      var vis = r[0] || {}, ins = r[1] || {}, dl = r[2] || {}, use = r[3] || {}, src = r[4] || {}, am = r[5], wm = r[6];
      var tot = Object.keys(use).map(function (k) { var d = use[k] || {}, t = 0; Object.keys(d).forEach(function (x) { t += +d[x] || 0; }); return { k: k, t: t, s: src[k] || 'app' }; }).sort(function (a, b) { return b.t - a.t; }).slice(0, 8);
      function card(n, l) { return '<div style="flex:1;background:linear-gradient(135deg,#eaf6ff,#fff6dc);border:1.5px solid #e1e8f4;border-radius:16px;padding:10px 4px;text-align:center"><b style="font-size:22px;display:block">' + n + '</b><small style="color:#5a6b8c;font-weight:700">' + l + '</small></div>'; }
      var h = '<div style="display:flex;gap:8px;margin:0 0 10px">' + card(cnt(vis), 'زوّار الموقع') + card(cnt(dl), 'حمّلوا APK') + card(cnt(ins), 'ثبّتوا من المتصفح') + '</div>' +
        '<p style="font-size:13px;color:#5a6b8c;margin:0 0 8px">ملف APK الحالي: <b>' + (am ? esc(am.ver) + ' · ' + ago(am.ts) : 'المرفوق مع الموقع') + '</b> · آخر تحديث للموقع: <b>' + (wm ? ago(wm.ts) : 'لا يوجد') + '</b></p>' +
        '<h3 style="margin:8px 0;font-size:15px">الأكثر استخداماً</h3>' + (tot.length ? '<ol class="st">' + tot.map(function (x) { return '<li><span id="dn_' + esc(x.k) + '">' + esc(x.k.replace(/^a/, '')) + ' — ' + (x.s === 'web' ? 'الموقع' : 'التطبيق') + ' — <b>' + fmt(x.t) + '</b></span></li>'; }).join('') + '</ol>' : '<div class="wn">ما توجد بيانات بعد.</div>');
      o.querySelector('#dvs').innerHTML = h;
      tot.forEach(function (x) { fj('/accounts/' + x.k + '/name.json').then(function (n) { var e = o.querySelector('[id="dn_' + x.k + '"]'); if (e && n) e.innerHTML = e.innerHTML.replace(esc(x.k.replace(/^a/, '')), esc(String(n))); }).catch(function () { }); });
    });
  }
  W.afDev = login;
})();
