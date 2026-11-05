// حركة الكاميرا: متابعة المركبة، نظرة عامة، طيران لمكان
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
const NAV_PAD = () => ({ top: Math.round(innerHeight * 0.4), bottom: 90, left: 0, right: 0 });
const NO_PAD = { top: 0, bottom: 0, left: 0, right: 0 };
export function follow(p, zoom = 17.3, duration = 900, pitch = 62) {
  stopIntro();
  map.easeTo({ center: [p.lng, p.lat], bearing: p.heading || 0, pitch, zoom, duration, easing: t => t, padding: NAV_PAD() });
}
export function overview(coords, bottom = 320) {
  stopIntro();
  const b = coords.reduce((bb, c) => bb.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
  map.fitBounds(b, { padding: { top: 120, bottom, left: 40, right: 40 }, pitch: 0, bearing: 0, duration: 900, maxZoom: 16 });
}
export function flyTo(lng, lat, zoom = 16.5, pitch = 55, bearing) {
  stopIntro();
  map.flyTo({ center: [lng, lat], zoom, pitch, ...(bearing != null ? { bearing } : {}), padding: NO_PAD, duration: 2200, essential: true });
}
export function northUp() { map.easeTo({ bearing: 0, duration: 600 }); }
export function toggle3D() { map.easeTo({ pitch: map.getPitch() > 10 ? 0 : 60, duration: 700 }); }
export function clearPadding() { map.easeTo({ padding: NO_PAD, duration: 0 }); }

// دوران بطيء للعراق ثلاثي الأبعاد خلف شاشة الدخول
let spinId = null, lastT = 0;
export function startIntro() {
  if (spinId || !prefs().spin) return;
  lastT = performance.now();
  const tick = t => { if (map.getZoom() > 7) { stopIntro(); return; }
    map.setBearing(map.getBearing() + (t - lastT) * 0.006); lastT = t; spinId = requestAnimationFrame(tick); };
  spinId = requestAnimationFrame(tick);
}
export function stopIntro() { if (spinId) cancelAnimationFrame(spinId); spinId = null; }
