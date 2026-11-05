// إعدادات عامة للتطبيق
export const APP_VERSION = '2026.11.06-13';
export const CONFIG = {
  version: '3',
  iraqBounds: [[38.7, 29.0], [48.6, 37.4]],
  maxBounds: [[38.0, 28.4], [49.3, 37.9]],
  center: [44.36, 33.31],
  tilejson: 'https://tiles.openfreemap.org/planet',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  font: ['Noto Sans Regular'],
  fontBold: ['Noto Sans Bold'],
  rtlPlugin: new URL('./vendor/mapbox-gl-rtl-text.min.js', document.baseURI).href,
  osrm: {
    car: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    bike: 'https://routing.openstreetmap.de/routed-bike/route/v1/driving',
    foot: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving'
  },
  overpass: 'https://overpass-api.de/api/interpreter',
  nominatim: 'https://nominatim.openstreetmap.org',
  wikiSummary: 'https://ar.wikipedia.org/api/rest_v1/page/summary/',
  wikiMedia: 'https://ar.wikipedia.org/api/rest_v1/page/media-list/',
  tileCache: 'khartkum-tiles-v1',
  offRouteMeters: 45,
  arriveMeters: 10
};
