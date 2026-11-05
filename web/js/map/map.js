// إنشاء الخريطة
import { CONFIG } from '../config.js';
import { buildStyle } from './style.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';

// ربط حروف العربي حتى تطلع الكلمة كاملة وليس حروف منفصلة
try { maplibregl.setRTLTextPlugin(CONFIG.rtlPlugin, true).catch(() => {}); } catch {}

export const map = new maplibregl.Map({
  container: 'map',
  style: buildStyle(state.heightScale, prefs().palette),
  center: CONFIG.center,
  zoom: 5.4, minZoom: 5, maxZoom: 20.5, maxPitch: 80,
  maxBounds: CONFIG.maxBounds,
  attributionControl: { compact: true },
  fadeDuration: 0, antialias: true, pixelRatio: Math.min(window.devicePixelRatio || 1, (navigator.hardwareConcurrency || 4) >= 6 ? 2 : 1.5), crossSourceCollisions: false, refreshExpiredTiles: false, maxTileCacheSize: 320
});
// نوقف الحركات الجانبية أثناء تحريك الخريطة حتى تبقى سلسة
map.on('movestart', () => document.body.classList.add('moving'));
map.on('moveend', () => document.body.classList.remove('moving'));
map.dragRotate.enable();
map.touchZoomRotate.enableRotation();
map.fitBounds(CONFIG.iraqBounds, { padding: 20, duration: 0, pitch: 0, bearing: 0 });
map.on('load', () => emit('map:ready'));
map.on('error', e => emit('map:error', e?.error?.message || 'تعذّر تحميل جزء من الخريطة'));
map.on('click', e => emit('map:click', { lng: e.lngLat.lng, lat: e.lngLat.lat, zoom: map.getZoom(), point: e.point }));
