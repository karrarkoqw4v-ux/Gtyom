/* خدمة بسيطة: تسمح بتثبيت الموقع كتطبيق وتحفظ الملفات الثابتة للفتح السريع */
var C = 'alfarabi-web-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C && x.indexOf('alfarabi-web') === 0; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return; var u = new URL(r.url); if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(function (x) { var c = x.clone(); caches.open(C).then(function (h) { h.put('/Gtyom/index.html', c); }); return x; }).catch(function () { return caches.match('/Gtyom/index.html'); })); return; }
  e.respondWith(caches.match(r).then(function (h) { var n = fetch(r).then(function (x) { if (x.ok) { var c = x.clone(); caches.open(C).then(function (k) { k.put(r, c); }); } return x; }).catch(function () { return h; }); return h || n; }));
});
self.addEventListener('notificationclick', function (e) { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (l) { if (l.length) return l[0].focus(); return self.clients.openWindow('/Gtyom/'); })); });
