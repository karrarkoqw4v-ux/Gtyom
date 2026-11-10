/* خدمة بسيطة: تسمح بتثبيت الموقع كتطبيق وتحفظ الملفات الثابتة للفتح السريع */
var C = 'alfarabi-web-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C && x.indexOf('alfarabi-web') === 0; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return; var u = new URL(r.url); if (u.origin !== location.origin) return;
  e.respondWith(caches.open('alfarabi-ota-web').then(function (oc) { return oc.match(r, { ignoreSearch: true }); }).then(function (hit) { return hit || base(r); }));
});
function base(r) {
  if (r.mode === 'navigate') { return fetch(r).then(function (x) { var c = x.clone(); caches.open(C).then(function (h) { h.put('/index.html', c); }); return x; }).catch(function () { return caches.match('/index.html'); }); }
  return fetch(r).then(function (x) { if (x.ok) { var c = x.clone(); caches.open(C).then(function (k) { k.put(r, c); }); } return x; }).catch(function () { return caches.match(r); });
}
self.addEventListener('notificationclick', function (e) { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (l) { if (l.length) return l[0].focus(); return self.clients.openWindow('/'); })); });
