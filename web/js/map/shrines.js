// نموذج ثلاثي الأبعاد للحرمين في كربلاء (تقريبي: قباب ومنائر وصحن)
import { map } from './map.js';
import { load, save } from '../core/storage.js';
const SH = [
  { id: 'hussein', name: 'حرم الإمام الحسين (ع)', q: 'حرم الإمام الحسين كربلاء', fb: [44.0324, 32.6163], rot: 18, hall: [44, 36], dome: 11, minarets: 4 },
  { id: 'abbas', name: 'حرم الإمام العباس (ع)', q: 'حرم العباس بن علي كربلاء', fb: [44.0297, 32.6199], rot: 18, hall: [38, 32], dome: 9.5, minarets: 4 }
];
const KARBALA = [44.0248, 32.616];
const M = 111320;
function rot(x, y, a) { const r = a * Math.PI / 180; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; }
function ll(c, dx, dy, a) { const [x, y] = rot(dx, dy, a); return [c[0] + x / (M * Math.cos(c[1] * Math.PI / 180)), c[1] + y / M]; }
const rect = (c, w, h, a) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]].map(p => ll(c, p[0], p[1], a));
const circle = (c, r, ox = 0, oy = 0, a = 0, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n * 2 * Math.PI; return ll(c, ox + r * Math.cos(t), oy + r * Math.sin(t), a); });
const F = (ring, b, h, col, ...holes) => ({ type: 'Feature', properties: { b, h, c: col }, geometry: { type: 'Polygon', coordinates: [ring, ...holes] } });
const GOLD = '#e4b64a', GOLD2 = '#f2cd6b', TEAL = '#2f8f9d', STONE = '#efe6d2', CREAM = '#f7f1e3';

function build(s, c) {
  const a = s.rot, f = [];
  f.push(F(rect(c, 150, 120, a), 0, 2.5, '#e8dcc3'));                                    // الصحن
  f.push(F(rect(c, 150, 120, a), 2.5, 9, STONE, rect(c, 140, 110, a).reverse()));       // الرواق المحيط
  f.push(F(rect(c, s.hall[0], s.hall[1], a), 2.5, 17, CREAM));                           // الحرم
  f.push(F(rect(c, s.hall[0] + 6, s.hall[1] + 6, a), 2.5, 7, '#d9cfb6', rect(c, s.hall[0], s.hall[1], a).reverse()));
  f.push(F(circle(c, s.dome * 0.95, 0, 0, a), 17, 25, TEAL));                           // الرقبة
  const R = s.dome, H = R * 1.25, K = 9;                                                 // القبة الذهبية
  for (let i = 0; i < K; i++) {
    const t0 = (i / K) * 1.28, t1 = ((i + 1) / K) * 1.28;
    f.push(F(circle(c, Math.max(R * Math.cos(t0), 0.6), 0, 0, a), 25 + H * Math.sin(t0), 25 + H * Math.sin(t1), i % 2 ? GOLD2 : GOLD));
  }
  f.push(F(circle(c, 0.5, 0, 0, a, 8), 25 + H, 25 + H + 6, GOLD));
  const hx = s.hall[0] / 2 + 6, hy = s.hall[1] / 2 + 6;                                  // المنائر
  [[-hx, -hy], [hx, -hy], [-hx, hy], [hx, hy]].slice(0, s.minarets).forEach(([x, y]) => {
    f.push(F(circle(c, 2.4, x, y, a, 14), 0, 30, GOLD));
    f.push(F(circle(c, 3.3, x, y, a, 14), 30, 33, GOLD2));
    f.push(F(circle(c, 1.9, x, y, a, 14), 33, 38, GOLD));
    f.push(F(circle(c, 0.6, x, y, a, 8), 38, 42, GOLD2));
  });
  return f;
}
async function locate(s) {
  const k = 'shrine:' + s.id, hit = load(k, null);
  if (hit) return hit;
  try {
    const r = await (await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar&countrycodes=iq&q=' + encodeURIComponent(s.q))).json();
    if (r[0]) {
      const p = [+r[0].lon, +r[0].lat];
      if (Math.abs(p[0] - KARBALA[0]) < 0.03 && Math.abs(p[1] - KARBALA[1]) < 0.03) { save(k, p); return p; }
    }
  } catch {}
  return s.fb;
}
export const shrineCenter = () => load('shrine:hussein', SH[0].fb);

export async function initShrines() {
  const feats = [], labels = [];
  for (const s of SH) {
    const c = await locate(s);
    feats.push(...build(s, c));
    labels.push({ type: 'Feature', properties: { name: s.name }, geometry: { type: 'Point', coordinates: c } });
  }
  map.addSource('shrines', { type: 'geojson', data: { type: 'FeatureCollection', features: feats } });
  map.addSource('shrine-pts', { type: 'geojson', data: { type: 'FeatureCollection', features: labels } });
  map.addLayer({ id: 'shrine-3d', type: 'fill-extrusion', source: 'shrines', minzoom: 13.5, paint: {
    'fill-extrusion-color': ['get', 'c'], 'fill-extrusion-base': ['get', 'b'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-opacity': 1 } });
  map.addLayer({ id: 'shrine-label', type: 'symbol', source: 'shrine-pts', minzoom: 12,
    layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 15, 'text-offset': [0, -2.6], 'text-allow-overlap': true },
    paint: { 'text-color': '#8a5a00', 'text-halo-color': '#fff', 'text-halo-width': 2.4 } });
}
