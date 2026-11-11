/* تحديث الواجهة عن بعد: نشر (للإدارة) + استقبال (لتطبيق APK) + إحصائيات الصيانة.
 * كل تحديث موقَّع بمفتاح خاص عند الإدارة فقط، والتطبيق يرفض أي ملف بدون التوقيع الصحيح. */
(function () {
  'use strict';
  var A = window.Android, X = window.AFX;
  if (!A) return;
  var PUB = {"kty":"EC","x":"g3WXfsTm_bLnvkCt22cCS_TW9lkGjtiUJimkkL2fszg","y":"qpRrJ88sAYSdykVNBVuGkHXNnQXpQCPjdHweUbgzqZs","crv":"P-256"};
  var UIV = '2026.11.12-group-skin';
  var CHUNK = 700 * 1024, MAXB = 25 * 1024 * 1024;
  var isApp = !!(A.otaBegin) && !A.__web;
  function base() { return window.FBBASE || ''; }
  function b2h(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function u8b64(u) { var s = '', i, n = 0x8000; for (i = 0; i < u.length; i += n) s += String.fromCharCode.apply(null, u.subarray(i, i + n)); return btoa(s); }
  function b64u8(b) { var s = atob(b), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function msg(v, sha) { return new TextEncoder().encode('alfarabi-ota:' + v + ':' + sha); }
  function fj(p, o) { var b = base(); if (!b) return Promise.reject(new Error('لا يوجد اتصال بقاعدة البيانات')); return fetch(b + p, o).then(function (r) { if (!r.ok) throw new Error('رفض الخادم (' + r.status + ')'); return r.json(); }); }

  /* ===================== الاستقبال التلقائي + زر «آخر تحديثات» ===================== */
  var busy = false, REJ = 'af_ota_rej', SEEN = 'af_ota_seen';
  var S = { k: 'idle', t: '', pct: 0 }, subs = [];
  function lsg(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lss(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function setS(k, t, pct) { S = { k: k, t: t || '', pct: pct || 0 }; subs.forEach(function (f) { try { f(S); } catch (e) { } }); }
  function when(v) { try { return new Date(v * 1000).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } }
  function verifySig(m) {
    return crypto.subtle.importKey('jwk', PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']).then(function (k) {
      return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64u8(m.sig), msg(m.v, m.sha));
    }).then(function (ok) { if (!ok) throw new Error('التوقيع غير صحيح'); });
  }
  function verify(bytes, meta) {
    return crypto.subtle.digest('SHA-256', bytes).then(function (h) {
      if (b2h(h) !== meta.sha) throw new Error('بصمة الملف غير مطابقة');
      return verifySig(meta);
    });
  }
  function apply(m) {
    var parts = [], i = 0, total = 0;
    setS('down', 'جاري تنزيل التحديث...', 0);
    function next() {
      if (i >= m.n) return;
      return fj('/ota_files/v' + m.v + '/c' + i + '.json').then(function (s) {
        if (typeof s !== 'string') throw new Error('ملف ناقص');
        var u = b64u8(s); total += u.length; if (total > MAXB) throw new Error('حجم التحديث كبير');
        parts.push(u); i++; setS('down', 'جاري تنزيل التحديث... ' + Math.round(i / m.n * 100) + '%', i / m.n); return next();
      });
    }
    return next().then(function () {
      var all = new Uint8Array(total), o = 0; parts.forEach(function (p) { all.set(p, o); o += p.length; });
      return verify(all, m).then(function () {
        setS('down', 'جاري تثبيت التحديث...', 1);
        A.otaBegin();
        for (var p = 0; p < all.length; p += 1500000) { if (!A.otaChunk(u8b64(all.subarray(p, Math.min(all.length, p + 1500000))))) throw new Error('تعذّر الحفظ'); }
        if (!A.otaCommit(m.v)) throw new Error('الملفات غير صالحة');
        setS('done', 'تم التحديث ✓ جاري إعادة التشغيل...', 1);
        try { var t = document.createElement('div'); t.textContent = 'تم تحديث التطبيق، جاري إعادة التشغيل...'; t.style.cssText = 'position:fixed;left:16px;right:16px;bottom:30px;z-index:2147483647;background:#14213d;color:#fff;border-radius:14px;padding:12px;text-align:center;font:700 14px Cairo,sans-serif;direction:rtl'; document.body.appendChild(t); } catch (e) { }
        setTimeout(function () { try { A.otaReload(); } catch (e) { location.reload(); } }, 1600);
      });
    });
  }
  /* manual=true: ضغط المستخدم على الزر (يعرض الحالة). غير ذلك: فحص تلقائي صامت */
  function check(manual) {
    if (!isApp || busy) return Promise.resolve();
    if (!manual && document.hidden) return Promise.resolve();
    if (!base()) { if (manual) setS('err', 'لا يوجد اتصال بالخادم الآن، جرّب بعد قليل'); return Promise.resolve(); }
    busy = true; if (manual) setS('chk', 'جاري البحث عن تحديث...');
    return fj('/ota/current.json').then(function (m) {
      if (!m || !m.v || !m.n || !m.sha || !m.sig) { setS('ok', 'أنت على آخر نسخة ✓'); return; }
      var cur = +A.otaVersion() || 0, bad = +A.otaBad() || 0;
      if (m.v <= cur || m.v <= bad || m.v === (+lsg(REJ) || 0)) { setS('ok', 'أنت على آخر نسخة ✓'); return; }
      /* نتحقق من التوقيع قبل التنزيل: تحديث غير موقّع بالمفتاح الصحيح لا يُنزَّل أصلاً */
      return verifySig(m).catch(function () { lss(REJ, m.v); throw new Error('skip'); }).then(function () { return apply(m); });
    }).catch(function (e) {
      if (e && e.message === 'skip') setS('ok', 'أنت على آخر نسخة ✓');
      else if (manual || S.k === 'down') setS('err', 'تعذّر التحديث: ' + (e && e.message || e));
      else setS('idle', '');
    }).then(function () { busy = false; });
  }
  if (isApp) {
    setTimeout(function () { check(false); }, 3000); setInterval(function () { check(false); }, 2 * 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(function () { check(false); }, 2000); });
    /* نؤكد أن النسخة الجديدة اشتغلت بسلام بعد فتح الواجهة */
    setTimeout(function () { try { if (document.body && document.body.children.length > 2) A.otaOk(); } catch (e) { } }, 9000);
  }

  /* نسخة الموقع: نفس التنبيه، والزر يحدّث الصفحة بالنسخة المنشورة على الاستضافة */
  var webLatest = 0;
  function webPoll() {
    if (isApp || document.hidden || !base()) return;
    fj('/ota/current.json').then(function (m) {
      if (!m || !m.v || !m.sha || !m.sig) return;
      return verifySig(m).then(function () {
        webLatest = m.v; var seen = +lsg(SEEN) || 0;
        if (!seen) { lss(SEEN, m.v); return; }
        if (m.v > seen) setS('new', 'يوجد تحديث جديد — اضغط «تحديث الصفحة الآن»');
      });
    }).catch(function () { });
  }
  function webRefresh() {
    setS('down', 'جاري تحديث الموقع...', 0.5);
    if (webLatest) lss(SEEN, webLatest);
    Promise.resolve().then(function () {
      return navigator.serviceWorker && navigator.serviceWorker.getRegistrations ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : 0;
    }).then(function () {
      return window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }) : 0;
    }).catch(function () { }).then(function () { location.replace(location.pathname + '?u=' + Date.now() + location.hash); });
  }
  if (!isApp) { setTimeout(webPoll, 4000); setInterval(webPoll, 2 * 60 * 1000); document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(webPoll, 2000); }); }

  /* ---------- الواجهة: زر آخر تحديثات + النافذة ---------- */
  function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function initUI() {
    if (document.getElementById('afUpdBtn') || !document.body) return;
    var css = mk('style');
    css.textContent = '#afUpdBtn{position:fixed;z-index:2147483000;top:calc(14px + env(safe-area-inset-top,0px));left:max(16px,calc(50% - 199px));height:40px;padding:0 14px 0 12px;border:0;border-radius:20px;background:linear-gradient(135deg,#1768bd,#0aa6f5);color:#fff;font:700 13px Cairo,Tahoma,sans-serif;display:flex;align-items:center;gap:7px;box-shadow:0 6px 16px rgba(23,104,189,.35);cursor:pointer;direction:rtl;-webkit-tap-highlight-color:transparent}' +
      '#afUpdBtn svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}#afUpdBtn.spin svg{animation:afUpdSp 1s linear infinite}@keyframes afUpdSp{to{transform:rotate(360deg)}}' +
      '#afUpdBtn i{display:none;position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:50%;background:#ffd23f;border:2px solid #fff}#afUpdBtn.dot i{display:block}' +
      '#afUpdO{position:fixed;inset:0;z-index:2147483001;background:rgba(10,20,40,.5);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:Cairo,Tahoma,sans-serif}' +
      '#afUpdC{background:#fff;color:#14213d;width:100%;max-width:430px;max-height:86vh;overflow:auto;border-radius:24px 24px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25)}' +
      '#afUpdC h3{font-size:18px;margin:0 0 12px;display:flex;justify-content:space-between;align-items:center}#afUpdC h3 button{border:0;background:#edf3fa;width:32px;height:32px;border-radius:50%;font-size:16px;color:#18385e;cursor:pointer}' +
      '#afUpdC .r{display:flex;justify-content:space-between;gap:10px;background:#f2f6fb;border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:13px}#afUpdC .r b{text-align:left}' +
      '#afUpdC .st{border-radius:12px;padding:10px 12px;margin:10px 0;font-size:14px;font-weight:700;background:#eef7ff;color:#1768bd;min-height:20px}#afUpdC .st.ok{background:#e9f8ef;color:#0b7a3b}#afUpdC .st.err{background:#fdecee;color:#d9283d}#afUpdC .st.new{background:#fff6dd;color:#8a5a00}' +
      '#afUpdC .pb{height:6px;border-radius:3px;background:#e3ebf5;overflow:hidden;margin:-4px 0 10px;display:none}#afUpdC .pb div{height:100%;background:#1768bd;width:0;transition:width .3s}' +
      '#afUpdC .go{width:100%;border:0;border-radius:14px;padding:13px;background:linear-gradient(135deg,#1768bd,#0aa6f5);color:#fff;font:700 15px Cairo,Tahoma,sans-serif;cursor:pointer}#afUpdC .go:disabled{opacity:.55}' +
      '#afUpdC h4{font-size:14px;margin:16px 0 8px;color:#5b6b86}#afUpdC ul{list-style:none;margin:0;padding:0}#afUpdC li{border-bottom:1px solid #e8eef6;padding:9px 2px;font-size:13px;line-height:1.7}#afUpdC li small{display:block;color:#7a8aa3}#afUpdC .ft{font-size:12px;color:#7a8aa3;margin-top:12px;text-align:center}';
    document.head.appendChild(css);
    var btn = mk('button'); btn.id = 'afUpdBtn'; btn.type = 'button'; btn.setAttribute('aria-label', 'آخر تحديثات');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg><span>آخر تحديثات</span><i></i>';
    /* الزر نُقل إلى القائمة */
    function paintBtn(s) { btn.classList.toggle('spin', s.k === 'chk' || s.k === 'down'); btn.classList.toggle('dot', s.k === 'new' || s.k === 'down'); }
    subs.push(paintBtn);
    /* الزر يظهر فقط بالقائمة الرئيسية (مكان زر القائمة)، ويختفي داخل الصفحات والمحادثات */
    function onHome() {
      var cf = document.getElementById('chatFrame');
      if (cf && getComputedStyle(cf).display !== 'none') return false;
      var af = document.getElementById('adminFrame');
      if (af && getComputedStyle(af).display !== 'none') {
        try {
          var d = af.contentDocument, b = d && d.body; if (!b) return false;
          if (b.classList.contains('qn-home')) return true;
          var g = d.querySelector('.burger'); return !!(g && d.defaultView.getComputedStyle(g).display !== 'none');
        } catch (e) { return false; }
      }
      return true;
    }
    function place() { btn.style.display = onHome() ? 'flex' : 'none'; }
    setInterval(place, 400); place();
    btn.onclick = openSheet;
  }
  function openSheet() {
    if (document.getElementById('afUpdO')) return;
    var o = mk('div'); o.id = 'afUpdO'; var c = mk('div'); c.id = 'afUpdC'; o.appendChild(c);
    var h = mk('h3'); h.appendChild(mk('span', '', 'آخر تحديثات')); var x = mk('button', '', '✕'); x.type = 'button'; h.appendChild(x); c.appendChild(h);
    function row(a, b) { var r = mk('div', 'r'); r.appendChild(mk('span', '', a)); var v = mk('b', '', b); r.appendChild(v); c.appendChild(r); return v; }
    var cur = isApp ? (+A.otaVersion() || 0) : 0;
    row(isApp ? 'نسخة هذا الجهاز' : 'نسخة الموقع', isApp ? (cur ? when(cur) : 'الأصلية · ' + UIV) : UIV);
    var last = row('آخر تحديث مُرسل', '...');
    var st = mk('div', 'st'); c.appendChild(st);
    var pb = mk('div', 'pb'); var pbi = mk('div'); pb.appendChild(pbi); c.appendChild(pb);
    var go = mk('button', 'go', isApp ? 'تحقق من التحديث الآن' : 'تحديث الصفحة الآن'); go.type = 'button'; c.appendChild(go);
    c.appendChild(mk('h4', '', 'سجل التحديثات'));
    var ul = mk('ul'); c.appendChild(ul);
    c.appendChild(mk('div', 'ft', isApp ? 'التحديثات تُنزَّل وتُثبَّت تلقائياً بدون أي إجراء منك.' : 'الموقع يتنبّه تلقائياً عند وجود تحديث جديد.'));
    function paint(s) {
      st.className = 'st ' + (s.k === 'ok' || s.k === 'done' ? 'ok' : s.k === 'err' ? 'err' : s.k === 'new' ? 'new' : '');
      st.textContent = s.t || (isApp ? 'اضغط للتحقق من وجود تحديث جديد.' : 'اضغط لتحميل أحدث نسخة من الموقع.');
      pb.style.display = s.k === 'down' ? 'block' : 'none'; pbi.style.width = Math.round((s.pct || 0) * 100) + '%';
      go.disabled = s.k === 'chk' || s.k === 'down' || s.k === 'done';
    }
    subs.push(paint); paint(S);
    function close() { var i = subs.indexOf(paint); if (i > -1) subs.splice(i, 1); o.remove(); }
    x.onclick = close; o.addEventListener('click', function (e) { if (e.target === o) close(); });
    go.onclick = function () { if (isApp) check(true); else webRefresh(); };
    document.body.appendChild(o);
    Promise.all([fj('/ota/current.json').catch(function () { return null; }), fj('/updates.json').catch(function () { return null; })]).then(function (r) {
      var m = r[0], u = r[1];
      last.textContent = m && m.ts ? new Date(m.ts).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }) : 'لا يوجد';
      var l = u && typeof u === 'object' ? Object.keys(u).map(function (k) { return u[k]; }).filter(Boolean).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 8) : [];
      var BUILTIN = [{ v: 'الإصدار 3.5', ts: Date.UTC(2026, 10, 12, 20), note: 'إصلاح إشعارات التحضير: كانت لا تصل أبداً لأن مراقب الإشعارات يقرأ مكاناً قديماً بينما التحضير الجديد يُنشر كسجل مختلف — صار يصل إشعار «تحضير جديد» لطلاب الصف وأولياء الأمور خلال ثوانٍ · قنوات إشعارات جديدة بصوت وأولوية عالية (تظهر منبثقة وتهتز وتصدر صوتاً)' }, { v: 'الإصدار 3.4', ts: Date.UTC(2026, 10, 12), note: 'شريط الحالة والتنقل يتبع لون الشاشة (داكن بالمحادثات والقنوات) بدل الأبيض · إشعارات أسرع: بث حي للسجلات (منشورات القنوات والتعليقات والدرجات) وإعادة تشغيل الخدمة بعد إعادة تشغيل الجهاز وطلب إعفاء البطارية · اسم مستخدم القناة بصيغة n.m/اسم · كل الروابط بأي صيغة تصير زرقاء وقابلة للضغط داخل المحادثات والقنوات · المرفق يظهر ببطاقة فوق خانة الكتابة مع حلقة تقدّم وزر إلغاء' }, { v: 'الإصدار 3.3', ts: Date.UTC(2026, 10, 11), note: 'القنوات بنفس ألوان المحادثات (داكنة مع الخلفية المزخرفة) · رسائلي على جهتي ورسائل الآخرين على الجهة الأخرى دائماً · مزامنة المحادثات أسرع: بث حي لعدة غرف بنفس الوقت بدل الفحص الدوري · حذف القناة · قص صورة القناة مربعة تلقائياً · أزرار الرد والحذف في التعليقات بأيقونات صغيرة' }, { v: 'الإصدار 3.2', ts: Date.UTC(2026, 10, 10, 22), note: 'القناة بتصميم تيليجرام: رأس بأزرار دائرية وكبسولة اسم القناة، رسالة مثبتة، بحث داخل القناة، شريط سفلي (بحث / كتم / مشاركة) · التعليقات في نافذة مستقلة مثل الكروب · كل أيقونات القناة مخططة بدل الإيموجي الملوّنة · حد أقصى 5 قنوات لكل مدرس مع عرض قنواته قبل الإنشاء' }, { v: 'الإصدار 3.1', ts: Date.UTC(2026, 10, 10, 20), note: 'قناة المدرس بألوان التطبيق وتفاصيله (رأس أزرق متدرج وبطاقات بيضاء مدورة) · شريط أدوات للنشر (صورة، فيديو، ملف، استطلاع، رابط) · اسم القناة والمدرس والوقت داخل كل منشور · نافذة تظهر لمن يفتح رابط القناة · الرابط يفتح التطبيق مباشرة على أندرويد' }, { v: 'الإصدار 3.0', ts: Date.UTC(2026, 10, 10, 18), note: 'إصلاح التقطيع: الصور والفيديو والملفات صارت تُخزَّن بأجزاء خارج ذاكرة التطبيق مع صورة مصغّرة فقط، وتحليل البيانات أخف بكثير داخل القناة' }, { v: 'الإصدار 2.9', ts: Date.UTC(2026, 10, 10), note: 'قناة المدرس بتصميم تيليجرام: صور وفيديو وملفات بحسب صيغتها (تحميل/مشاركة/فتح داخل التطبيق) · فحص أمان الروابط · تفاعلات إيموجي بتأثيرات · تعليقات وردود المدرس · ملف تعريف القناة وتعديلها (اسم، وصف، صورة، لون، روابط، حسابات) · المشتركون والتفاعل مع بحث · إشعار للطلاب حسب الصف عند نشر المدرس' }, { v: 'الإصدار 2.8', ts: Date.UTC(2026, 10, 9, 12), note: 'قناة المدرس: صاحب القناة يدخل قناته دائماً · رابط القناة https:// ويوزر نيم (@username) بدل c.m/ · ألوان للقناة ورفع الصور · وضوح أفضل للصفحة الرئيسية وزر القائمة لا يغطي البطاقة' }, { v: 'الإصدار 2.7', ts: Date.UTC(2026, 10, 9), note: 'الصفحة الرئيسية بخمسة أقسام (الجدول، الغيابات، الدرجات، التحاضير، المحادثات) وباقي الأقسام بالقائمة الجانبية · صفحة المدرسة بتصميم جديد · إشعارات جديدة: الإعلانات (بعنوان «إشعار» وعند تعديلها)، التحضير مع اسم المدرس، الجدول المدرسي، العطل والدوام، تقييم المدرس · الإدارة تعدّل الإعلانات والإشعارات بعد نشرها' }];
      l = BUILTIN.concat(l);
      if (!l.length) { var li = mk('li', '', 'ما توجد تحديثات منشورة بعد.'); ul.appendChild(li); return; }
      l.forEach(function (it) { var li = mk('li', '', String(it.v || 'تحديث') + (it.note ? ' — ' + it.note : '')); li.appendChild(mk('small', '', it.ts ? new Date(it.ts).toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }) : '')); ul.appendChild(li); });
    });
  }
  window.afUpdates = { open: openSheet, check: function () { return check(true); } };
  if (document.body) initUI(); else document.addEventListener('DOMContentLoaded', initUI);

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
