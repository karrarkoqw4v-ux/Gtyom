/* نسخة الموقع: يحلّ محل جسر الأندرويد حتى تشتغل نفس الإضافات (ملازم، دعم، إشعارات مهمة...) داخل المتصفح */
(function () {
  'use strict';
  if (window.Android) return;
  var RN = window.Notification, fgv = true;
  document.addEventListener('visibilitychange', function () { fgv = !document.hidden; });
  function show(title, body, tag, icon) {
    try {
      if (!RN || RN.permission !== 'granted' || !document.hidden) return;
      var o = { body: body || '', tag: tag || undefined, icon: icon || '/icon-192.png', badge: '/icon-192.png', dir: 'rtl', lang: 'ar' };
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.showNotification(title, o); else new RN(title, o); });
      else new RN(title, o);
    } catch (e) { }
  }
  var tk = ''; try { tk = localStorage.getItem('af_web_tok') || ''; if (!tk) { tk = ''; for (var i = 0; i < 32; i++) tk += '0123456789abcdef'[Math.floor(Math.random() * 16)]; localStorage.setItem('af_web_tok', tk); } } catch (e) { }
  var ua = navigator.userAgent || '', nm = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'هاتف أندرويد' : /Windows/.test(ua) ? 'حاسوب ويندوز' : /Mac/.test(ua) ? 'ماك' : 'متصفح';
  window.Android = {
    __web: true,
    notifyCall: function (n) { show('مكالمة من ' + n, 'اضغط لفتح التطبيق', 'call'); },
    notifyMessage: function (tag, conv, g, sender, photo, text) { show(conv || sender, (g ? sender + ': ' : '') + text, tag); },
    notifySchool: function (t, b, s, tag) { show(t, b, tag); },
    notify: function (k, t, b, tag) { show(t, b, tag); },
    cancelNotif: function () { }, isForeground: function () { return fgv; }, pendingOpen: function () { return ''; },
    requestNotifPermission: function () { try { if (RN && RN.permission === 'default') RN.requestPermission(); } catch (e) { } },
    getOrigin: function () { return ''; }, showText: function (t, x) { alert(t + '\n\n' + x); }, openSettings: function () { },
    session: function () { }, setBase: function () { }, nativeSync: function () { return false; },
    deviceInfo: function () { return JSON.stringify({ name: nm, os: 'web', model: nm }); },
    deviceToken: function () { return tk; }, setBars: function () { },
    bioState: function () { return JSON.stringify({ available: false, enabled: false }); }, setBio: function () { },
    httpFetch: function () { }
  };

  /* إحصائيات الموقع: زائر فريد + تثبيت */
  (function () {
    var sa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    function put(path, v) { try { fetch(window.FBBASE + path + '.json', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).catch(function () { }); } catch (e) { } }
    var t0 = Date.now();
    (function w() {
      if (!window.FBBASE) { if (Date.now() - t0 < 30000) return setTimeout(w, 800); return; }
      var now = Date.now(), p = /iPhone|iPad/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop';
      put('/stats/visitors/' + tk, { last: now, p: p, inst: sa ? 1 : 0 });
      if (sa) put('/stats/installs/' + tk, { last: now, p: p });
    })();
    window.addEventListener('appinstalled', function () { var t = Date.now(); (function w() { if (window.FBBASE) put('/stats/installs/' + tk, { last: Date.now(), p: /iPhone|iPad/.test(ua) ? 'ios' : 'android' }); else if (Date.now() - t < 20000) setTimeout(w, 800); })(); });
  })();
})();
