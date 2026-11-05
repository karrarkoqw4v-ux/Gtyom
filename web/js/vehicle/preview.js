// عند إنشاء الرحلة: المركبة المختارة (سيارة/دراجة براكبها/مشي) تمشي على الطريق بالخريطة
import { map } from '../map/map.js';
import { cumulative, pointAlong } from '../core/geo.js';
import { vehicle } from './vehicles.js';
import { sprite, vehScale } from './sprites.js';
let m = null, raf = 0, root = null;
const lerpA = (a, b, k) => { let d = ((b - a + 540) % 360) - 180; return (a + d * k + 360) % 360; };
export function stopPreview() { if (raf) cancelAnimationFrame(raf); raf = 0; m?.remove(); m = null; root = null; }
export function startPreview(route, key) {
  stopPreview();
  const coords = route?.coords; if (!coords || coords.length < 2) return;
  const cum = cumulative(coords), total = cum[cum.length - 1] || 1;
  root = document.createElement('div'); root.className = 'pv vmove';
  root.innerHTML = `<div class="me-veh">${sprite(key)}</div>`;
  m = new maplibregl.Marker({ element: root, anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat(coords[0]).addTo(map);
  // مدة الجولة: أسرع من الحقيقة بـ 6 مرات، بين 9 و 28 ثانية
  const run = Math.min(28000, Math.max(9000, total / (vehicle(key).speed * 6) * 1000)), pause = 1800;
  let t0 = performance.now(), hd = null;
  const tick = now => {
    const e = (now - t0) % (run + pause), f = Math.min(1, e / run);
    const a = pointAlong(coords, cum, f * total);
    hd = hd == null ? a.heading : lerpA(hd, a.heading, 0.18);
    m.setLngLat(a.point); m.setRotation(hd);
    root.classList.toggle('vmove', f < 1);
    root.style.setProperty('--s', vehScale(map.getZoom()));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
