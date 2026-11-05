// عامل الخدمة: الملفات الجديدة أولاً، والكاش فقط عند انقطاع الإنترنت
const VERSION = '2026.11.06-13';
const SHELL = 'khartkum-shell-' + VERSION;
const TILES = 'khartkum-tiles-v1';
const FILES = [
  './',
  './css/auth.css',
  './css/base.css',
  './css/components.css',
  './css/features.css',
  './css/glass.css',
  './css/icons.css',
  './css/layout.css',
  './css/markers.css',
  './css/nav.css',
  './css/sheet.css',
  './css/weather.css',
  './icons/apple-touch-icon.png',
  './icons/favicon-48.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
  './index.html',
  './js/auth/auth.js',
  './js/auth/firebase-config.js',
  './js/config.js',
  './js/core/dom.js',
  './js/core/events.js',
  './js/core/geo.js',
  './js/core/prefs.js',
  './js/core/state.js',
  './js/core/storage.js',
  './js/location/gps.js',
  './js/location/heading.js',
  './js/location/saved.js',
  './js/main.js',
  './js/map/bridges.js',
  './js/map/buildings-counter.js',
  './js/map/buildings-ext.js',
  './js/map/buildings.js',
  './js/map/camera.js',
  './js/map/facades.js',
  './js/map/gov.js',
  './js/map/highlight.js',
  './js/map/landmarks.js',
  './js/map/map.js',
  './js/map/mask.js',
  './js/map/models-extra.js',
  './js/map/models3d.js',
  './js/map/nature3d.js',
  './js/map/places3d.js',
  './js/map/poi-markers.js',
  './js/map/poi3d.js',
  './js/map/prefs.js',
  './js/map/quality.js',
  './js/map/relief.js',
  './js/map/reports.js',
  './js/map/route-layer.js',
  './js/map/satellite.js',
  './js/map/shrines.js',
  './js/map/style.js',
  './js/map/theme.js',
  './js/offline/downloader.js',
  './js/offline/manager.js',
  './js/offline/packs.js',
  './js/offline/tiles.js',
  './js/permissions/messages.js',
  './js/permissions/permissions.js',
  './js/places/around.js',
  './js/places/categories.js',
  './js/places/details.js',
  './js/places/hours.js',
  './js/places/info.js',
  './js/places/nearby.js',
  './js/places/overpass.js',
  './js/places/photos.js',
  './js/places/reviews.js',
  './js/places/search.js',
  './js/provinces/detect.js',
  './js/provinces/provinces.js',
  './js/provinces/wiki.js',
  './js/routing/instructions.js',
  './js/routing/navigator.js',
  './js/routing/router.js',
  './js/routing/simulator.js',
  './js/share/share.js',
  './js/traffic/signals.js',
  './js/traffic/sim.js',
  './js/ui/auth-view.js',
  './js/ui/fabs.js',
  './js/ui/gate.js',
  './js/ui/home-view.js',
  './js/ui/icons.js',
  './js/ui/install.js',
  './js/ui/karbala-view.js',
  './js/ui/layers-view.js',
  './js/ui/nav-modals.js',
  './js/ui/nav-view.js',
  './js/ui/nearby-view.js',
  './js/ui/offline-view.js',
  './js/ui/page.js',
  './js/ui/place-view.js',
  './js/ui/profile-view.js',
  './js/ui/province-view.js',
  './js/ui/provinces-list.js',
  './js/ui/reviews-ui.js',
  './js/ui/route-view.js',
  './js/ui/search-view.js',
  './js/ui/settings-view.js',
  './js/ui/share-view.js',
  './js/ui/sheet.js',
  './js/ui/toast.js',
  './js/ui/topbar.js',
  './js/ui/trip-view.js',
  './js/ui/vehicle-picker.js',
  './js/ui/viewer.js',
  './js/ui/weather-view.js',
  './js/update.js',
  './js/vehicle/marker.js',
  './js/vehicle/preview.js',
  './js/vehicle/sprites.js',
  './js/vehicle/vehicles.js',
  './js/voice/chime.js',
  './js/voice/voice.js',
  './js/weather/api.js',
  './js/weather/codes.js',
  './js/weather/fx.js',
  './js/weather/icons.js',
  './js/weather/layers.js',
  './js/weather/scene.js',
  './manifest.webmanifest',
  './vendor/fonts.css',
  './vendor/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-latin-400-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-latin-500-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-latin-600-normal.woff2',
  './vendor/fonts/ibm-plex-sans-arabic-latin-700-normal.woff2',
  './vendor/mapbox-gl-rtl-text.min.js',
  './vendor/maplibre-gl.css',
  './vendor/maplibre-gl.js',
  './vendor/pmtiles.js'
];
const EXTERNAL = [];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.allSettled([
    ...FILES.map(f => fetch(f, { cache: 'reload' }).then(r => r.ok && c.put(f, r))),
    ...EXTERNAL.map(u => c.add(u))
  ])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('khartkum-shell') && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // بيانات الخريطة: المنزّل أولاً ثم الإنترنت
  if (url.hostname === 'tiles.openfreemap.org') {
    if (url.pathname.endsWith('.pbf')) {
      if (!self.navigator.onLine) e.respondWith(caches.open(TILES).then(c => c.match(req.url)).then(hit => hit || Response.error()));
    } else {
      e.respondWith(fetch(req).then(r => { if (r.ok) { const cl = r.clone(); caches.open(TILES).then(c => c.put(req.url, cl)); } return r; })
        .catch(() => caches.open(TILES).then(c => c.match(req.url))));
    }
    return;
  }
  // ملفات التطبيق: الإنترنت أولاً دائماً (حتى يوصل التحديث)، والمخزن عند انقطاع الإنترنت
  const same = url.origin === location.origin;
  if (same || url.hostname === 'unpkg.com' || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    const net = same ? fetch(req, { cache: 'no-cache' }) : fetch(req);
    e.respondWith(net.then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const cl = r.clone(); caches.open(SHELL).then(c => c.put(req.url.split('?')[0], cl)); }
      return r;
    }).catch(() => caches.match(req.url.split('?')[0]).then(h => h || caches.match('./index.html'))));
  }
});
