/* تحديث الواجهة عن بعد: نشر (للإدارة) + استقبال (لتطبيق APK) + إحصائيات الصيانة.
 * كل تحديث موقَّع بمفتاح خاص عند الإدارة فقط، والتطبيق يرفض أي ملف بدون التوقيع الصحيح. */
(function () {
  'use strict';
  var A = window.Android, X = window.AFX;
  if (!A) return;
  var PUB = {"kty":"EC","x":"9IvmMNuga6JvjOjjBUFq4MYBDfjhllaUD8rByaS5iD0","y":"JyAh6qs9loudQZR3OnaSysYMTcy7vpZ-FuhME4BnpF8","crv":"P-256"};
  var UIV = '2026.11.06-k';
  var CHUNK = 700 * 1024, MAXB = 25 * 1024 * 1024;
  var isApp = !!(A.otaBegin) && !A.__web;
  function base() { return window.FBBASE || ''; }
  function b2h(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function u8b64(u) { var s = '', i, n = 0x8000; for (i = 0; i < u.length; i += n) s += String.fromCharCode.apply(null, u.subarray(i, i + n)); return btoa(s); }
  function b64u8(b) { var s = atob(b), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function msg(v, sha) { return new TextEncoder().encode('alfarabi-ota:' + v + ':' + sha); }
  function fj(p, o) { var b = base(); if (!b) return Promise.reject(new Error('لا يوجد اتصال بقاعدة البيانات')); return fetch(b + p, o).then(function (r) { if (!r.ok) throw new Error('رفض الخادم (' + r.status + ')'); return r.json(); }); }

  /* ===================== الاستقبال (التطبيق فقط) ===================== */
  var busy = false;
  function verify(bytes, meta) {
    return crypto.subtle.digest('SHA-256', bytes).then(function (h) {
      var sha = b2h(h); if (sha !== meta.sha) throw new Error('بصمة الملف غير مطابقة');
      return crypto.subtle.importKey('jwk', PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']).then(function (k) {
        return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64u8(meta.sig), msg(meta.v, sha));
      }).then(function (ok) { if (!ok) throw new Error('التوقيع غير صحيح'); });
    });
  }
  function check() {
    if (!isApp || busy || !base() || document.hidden) return;
    busy = true;
    fj('/ota/current.json').then(function (m) {
      if (!m || !m.v || !m.n || !m.sha || !m.sig) return;
      var cur = +A.otaVersion() || 0, bad = +A.otaBad() || 0;
      if (m.v <= cur || m.v <= bad) return;
      var parts = [], i = 0, total = 0;
      function next() {
        if (i >= m.n) return;
        return fj('/ota_files/v' + m.v + '/c' + i + '.json').then(function (s) { if (typeof s !== 'string') throw new Error('ناقص'); var u = b64u8(s); total += u.length; if (total > MAXB) throw new Error('كبير'); parts.push(u); i++; return next(); });
      }
      return next().then(function () {
        var all = new Uint8Array(total), o = 0; parts.forEach(function (p) { all.set(p, o); o += p.length; });
        return verify(all, m).then(function () {
          A.otaBegin();
          for (var p = 0; p < all.length; p += 1500000) { if (!A.otaChunk(u8b64(all.subarray(p, Math.min(all.length, p + 1500000))))) throw new Error('تعذّر الحفظ'); }
          if (!A.otaCommit(m.v)) throw new Error('الملفات غير صالحة');
          try { var t = document.createElement('div'); t.textContent = 'تم تحديث التطبيق، جاري إعادة التشغيل...'; t.style.cssText = 'position:fixed;left:16px;right:16px;bottom:30px;z-index:2147483647;background:#14213d;color:#fff;border-radius:14px;padding:12px;text-align:center;font:700 14px Cairo,sans-serif;direction:rtl'; document.body.appendChild(t); } catch (e) { }
          setTimeout(function () { try { A.otaReload(); } catch (e) { location.reload(); } }, 1600);
        });
      });
    }).catch(function () { }).then(function () { busy = false; });
  }
  if (isApp) {
    setTimeout(check, 12000); setInterval(check, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(check, 3000); });
    /* نؤكد أن النسخة الجديدة اشتغلت بسلام بعد فتح الواجهة */
    setTimeout(function () { try { if (document.body && document.body.children.length > 2) A.otaOk(); } catch (e) { } }, 9000);
  }

  /* ===================== النشر (الإدارة) ===================== */
  var KEYS = 'af_ota_key';
  function getKey() { try { return JSON.parse(localStorage.getItem(KEYS) || 'null'); } catch (e) { return null; } }
  function importKey(file) {
    return file.text().then(function (t) {
      var j = JSON.parse(t); if (!j || j.kty !== 'EC' || !j.d) throw new Error('هذا ليس ملف مفتاح التحديث');
      if (j.x !== PUB.x || j.y !== PUB.y) throw new Error('هذا المفتاح لا يطابق مفتاح التطبيق');
      return crypto.subtle.importKey('jwk', j, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']).then(function () { localStorage.setItem(KEYS, JSON.stringify(j)); });
    });
  }
  function sign(sha, v) {
    var j = getKey(); if (!j) return Promise.reject(new Error('استورد مفتاح التحديث أولاً'));
    return crypto.subtle.importKey('jwk', j, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']).then(function (k) {
      return crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k, msg(v, sha));
    }).then(function (sig) { return u8b64(new Uint8Array(sig)); });
  }
  function publish(bytes, note, prog) {
    if (bytes.length > MAXB) return Promise.reject(new Error('حجم التحديث أكبر من 25 ميغا'));
    if (!(bytes[0] === 0x50 && bytes[1] === 0x4b)) return Promise.reject(new Error('الملف ليس ZIP صحيحاً'));
    var v = Math.floor(Date.now() / 1000), n = Math.ceil(bytes.length / CHUNK);
    return crypto.subtle.digest('SHA-256', bytes).then(function (h) {
      var sha = b2h(h);
      return sign(sha, v).then(function (sig) {
        var i = 0;
        function up() {
          if (i >= n) return;
          var s = u8b64(bytes.subarray(i * CHUNK, Math.min(bytes.length, (i + 1) * CHUNK)));
          return fj('/ota_files/v' + v + '/c' + i + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }).then(function () { i++; prog && prog(i / n); return up(); });
        }
        return up().then(function () {
          var meta = { v: v, n: n, sha: sha, sig: sig, size: bytes.length, ts: Date.now(), note: note || '' };
          return fj('/ota/current.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) }).then(function () {
            return fj('/updates/u' + v + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ v: 'تحديث ' + new Date(v * 1000).toLocaleDateString('ar-IQ'), note: note || '', ts: Date.now() }) });
          }).then(function () { return v; });
        });
      });
    });
  }
  function fromHost(url) {
    /* نجرّب الجلب المباشر، وإذا منعه المتصفح نستخدم وسيط التطبيق الأصلي */
    return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('الاستضافة رجعت ' + r.status); return r.arrayBuffer(); }).then(function (b) { return new Uint8Array(b); }).catch(function (e) {
      if (!A.httpFetch || A.__web) throw new Error('تعذّر جلب الملف من الاستضافة: ' + (e && e.message || e));
      return new Promise(function (res, rej) {
        var id = 900000 + Math.floor(Math.random() * 90000), old = window.__afHttp;
        var to = setTimeout(function () { window.__afHttp = old; rej(new Error('انتهت مهلة الاستضافة')); }, 90000);
        window.__afHttp = function (i, st, ct, b64) {
          if (i !== id) return old && old.apply(this, arguments);
          clearTimeout(to); window.__afHttp = old;
          if (st >= 200 && st < 300 && b64) res(b64u8(b64)); else rej(new Error('الاستضافة رجعت ' + st));
        };
        A.httpFetch(id, url, 'GET', '{}', '');
      });
    });
  }
  function ago(ts) { var d = Math.round((Date.now() - ts) / 60000); return d < 1 ? 'الآن' : d < 60 ? 'قبل ' + d + ' دقيقة' : d < 1440 ? 'قبل ' + Math.round(d / 60) + ' ساعة' : 'قبل ' + Math.round(d / 1440) + ' يوم'; }
  function cnt(o) { return o && typeof o === 'object' ? Object.keys(o).length : 0; }
  function fmt(sec) { sec = +sec || 0; var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return (h ? h + ' س ' : '') + m + ' د'; }

  window.afMaint = function (doc) {
    if (!X) return;
    var esc = X.esc;
    function html() {
      var hasKey = !!getKey();
      return '<div class="afp-c"><h3>نسخة ملفات الواجهة: ' + UIV + '</h3><p>هذا رقم النسخة المحمّلة على هذا الجهاز. بعد وصول التحديث يتغيّر الرقم.</p></div><div class="afp-c"><h3>مفتاح التحديث</h3><p>' + (hasKey ? 'المفتاح مُفعّل على هذا الجهاز ✓' : 'لإرسال تحديث لازم تستورد ملف المفتاح (alfarabi-update-key.json) مرة وحدة على هذا الجهاز.') + '</p><input type="file" id="mkf" accept=".json,application/json" style="width:100%;margin-top:8px"></div>' +
        '<div class="afp-c"><h3>إرسال تحديث للجميع</h3><p>ارفع ملف ZIP يحتوي ملفات الواجهة الجديدة، ويوصل لكل الأجهزة المثبّت عليها التطبيق خلال دقائق.</p>' +
        '<input type="file" id="mzf" accept=".zip,application/zip" style="width:100%;margin:8px 0"><input id="mnote" placeholder="وصف قصير للتحديث (اختياري)" style="width:100%;border:1.5px solid #cfdaed;border-radius:12px;padding:10px;font:inherit;margin:0 0 8px">' +
        '<button class="afbtn" id="mgo" style="width:100%">رفع وإرسال التحديث</button></div>' +
        '<div class="afp-c"><h3>إرسال التحديث من الاستضافة</h3><p>اكتب رابط ملف ZIP المرفوع على الاستضافة، وأجلبه وأرسله للتطبيقات المثبّتة.</p>' +
        '<input id="mhost" dir="ltr" placeholder="https://alfara.unaux.com/update.zip" style="width:100%;border:1.5px solid #cfdaed;border-radius:12px;padding:10px;font:inherit;margin:8px 0">' +
        '<button class="afbtn" id="mhg" style="width:100%">جلب من الاستضافة وإرسال</button></div>' +
        '<div class="afp-c" id="mst"><h3>الحالة والإحصائيات</h3><p>جاري التحميل...</p></div><div class="afp-c" id="mmsg" style="display:none"></div>';
    }
    X.panel(doc, 'الصيانة والتحديثات', html(), function (p) {
      var m = p.querySelector('#mmsg');
      function say(t, bad) { m.style.display = 'block'; m.innerHTML = '<p style="font-weight:700;color:' + (bad ? '#d9283d' : '#0b7a3b') + '">' + esc(t) + '</p>'; }
      p.querySelector('#mkf').onchange = function (e) { var f = e.target.files[0]; if (!f) return; importKey(f).then(function () { p.remove(); window.afMaint(doc); }).catch(function (x) { say(x.message, 1); }); };
      function run(getBytes, btn) {
        btn.disabled = true; say('جاري التجهيز...');
        Promise.resolve().then(getBytes).then(function (bytes) { return publish(bytes, p.querySelector('#mnote').value.trim(), function (f) { say('جاري الرفع ' + Math.round(f * 100) + '%'); }); })
          .then(function (v) { btn.disabled = false; say('تم إرسال التحديث ✓ يصل للأجهزة خلال دقائق (رقم ' + v + ').'); }).catch(function (x) { btn.disabled = false; say('تعذّر الإرسال: ' + (x && x.message || x), 1); });
      }
      p.querySelector('#mgo').onclick = function () { var f = p.querySelector('#mzf').files[0]; if (!f) return say('اختر ملف ZIP', 1); run(function () { return f.arrayBuffer().then(function (b) { return new Uint8Array(b); }); }, this); };
      p.querySelector('#mhg').onclick = function () { var u = p.querySelector('#mhost').value.trim(); if (!/^https:\/\//i.test(u)) return say('اكتب رابطاً يبدأ بـ https://', 1); run(function () { return fromHost(u); }, this); };
      /* الحالة */
      Promise.all([fj('/ota/current.json').catch(function () { return null; }), fj('/stats/visitors.json').catch(function () { return null; }), fj('/stats/installs.json').catch(function () { return null; }), fj('/usage.json').catch(function () { return null; }), fj('/usagesrc.json').catch(function () { return null; }), fj('/updates.json').catch(function () { return null; })]).then(function (r) {
        var cur = r[0], vis = r[1] || {}, ins = r[2] || {}, use = r[3] || {}, src = r[4] || {}, upd = r[5] || {};
        var tot = Object.keys(use).map(function (k) { var d = use[k] || {}, t = 0; Object.keys(d).forEach(function (x) { t += +d[x] || 0; }); return { k: k, t: t, s: src[k] || 'app' }; }).sort(function (a, b) { return b.t - a.t; }).slice(0, 8);
        var ul = Object.keys(upd).map(function (k) { return upd[k]; }).filter(Boolean).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 5);
        var h = '<h3>الحالة والإحصائيات</h3><p>آخر تحديث مُرسل: <b>' + (cur ? ago(cur.ts) : 'لا يوجد') + '</b>' + (isApp ? ' · نسخة هذا الجهاز: ' + (A.otaVersion() || 'الأصلية') : '') + '</p>' +
          '<p>ثبّتوا من المتصفح: <b>' + cnt(ins) + '</b> · زوّار الموقع: <b>' + cnt(vis) + '</b></p><h3 style="margin-top:10px">الأكثر استخداماً</h3>' +
          (tot.length ? '<ol style="padding-right:18px;margin:6px 0">' + tot.map(function (x) { return '<li id="mn_' + esc(x.k) + '">' + esc(x.k.replace(/^a/, '')) + ' — ' + (x.s === 'web' ? 'الموقع' : 'التطبيق') + ' — <b>' + fmt(x.t) + '</b></li>'; }).join('') + '</ol>' : '<p>ما توجد بيانات بعد.</p>') +
          (ul.length ? '<h3 style="margin-top:10px">آخر التحديثات</h3><ul style="padding-right:18px;margin:6px 0">' + ul.map(function (x) { return '<li>' + esc(x.v || '') + ' ' + esc(x.note || '') + ' <small>' + new Date(x.ts || 0).toLocaleDateString('ar-IQ') + '</small></li>'; }).join('') + '</ul>' : '');
        p.querySelector('#mst').innerHTML = h;
        tot.forEach(function (x) { fj('/accounts/' + x.k + '/name.json').then(function (n) { var e = p.querySelector('[id="mn_' + x.k + '"]'); if (e && n) e.innerHTML = e.innerHTML.replace(esc(x.k.replace(/^a/, '')), esc(String(n))); }).catch(function () { }); });
      });
    });
  };
})();
