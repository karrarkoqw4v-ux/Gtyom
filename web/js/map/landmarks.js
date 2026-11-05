// الحرمان في كربلاء بشكل ثلاثي الأبعاد (قباب ومنارات)، والموقع يتحدد من OpenStreetMap
import { map } from './map.js';
import { CONFIG } from '../config.js';
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';
import { load, save } from '../core/storage.js';
import { dist } from '../core/geo.js';
import { on } from '../core/events.js';

const M = 111320, D = Math.PI / 180;
export const SHRINES = [
  { id: 'hussein', name: 'مرقد الإمام الحسين (ع)', q: 'مرقد الإمام الحسين كربلاء', at: [44.0325, 32.6145], rot: 18, hall: 34 },
  { id: 'abbas', name: 'مرقد أبي الفضل العباس (ع)', q: 'مرقد العباس بن علي كربلاء', at: [44.0352, 32.6173], rot: 18, hall: 30 }
];
const off = (c, dx, dy) => [c[0] + dx / (M * Math.cos(c[1] * D)), c[1] + dy / M];
const rotp = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const circle = (c, r, n = 28) => { const ring = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ring.push(off(c, r * Math.cos(a), r * Math.sin(a))); } ring.push(ring[0]); return [ring]; };
const rect = (c, w, h, rot) => { const a = rot * D, pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => { const [rx, ry] = rotp(x, y, a); return off(c, rx, ry); }); pts.push(pts[0]); return [pts]; };
const F = (geometry, base, top, color) => ({ type: 'Feature', properties: { base, top, color }, geometry: { type: 'Polygon', coordinates: geometry } });
const GOLD = '#e6b445', GOLD2 = '#c99a2e', CREAM = '#f3e8d2', TEAL = '#38b2ac';

function shrine(s, c) {
  const f = [], H = 16, a = s.rot * D;
  f.push(F(rect(c, s.hall * 3.6, s.hall * 2.8, s.rot), 0, 1.5, '#efe8da'));              // الصحن
  f.push(F(rect(c, s.hall, s.hall, s.rot), 0, H, CREAM));                                // القاعة
  f.push(F(rect(c, s.hall + 6, s.hall + 6, s.rot), 0, 4, '#e8dcc0'));                    // الرواق
  const R = s.hall * 0.34;
  f.push(F(circle(c, R * 1.04), H, H + 5, TEAL));                                        // الرقبة
  const N = 10, hd = R * 1.5;
  for (let j = 0; j < N; j++) {                                                          // القبة طبقات
    const t0 = j / N * Math.PI / 2, t1 = (j + 1) / N * Math.PI / 2;
    f.push(F(circle(c, Math.max(0.6, R * Math.cos((t0 + t1) / 2))), H + 5 + hd * Math.sin(t0), H + 5 + hd * Math.sin(t1), j > 7 ? '#f3cf75' : GOLD));
  }
  f.push(F(circle(c, 0.5, 10), H + 5 + hd, H + 5 + hd + 5, GOLD2));                      // الهلال/السارية
  [-1, 1].forEach(sd => {                                                                // مئذنتان
    const [rx, ry] = rotp(sd * (s.hall / 2 + 9), -s.hall / 2 - 4, a), mc = off(c, rx, ry);
    f.push(F(circle(mc, 2.4, 16), 0, 36, GOLD));
    f.push(F(circle(mc, 3.4, 16), 27, 29, GOLD2));
    f.push(F(circle(mc, 1.9, 16), 36, 39, GOLD2));
    f.push(F(circle(mc, 1.2, 12), 39, 42, GOLD));
    f.push(F(circle(mc, 0.5, 8), 42, 46, GOLD2));
  });
  return f;
}
const EMPTY = { type: 'FeatureCollection', features: [] };
let pos = Object.fromEntries(SHRINES.map(s => [s.id, s.at]));
export const shrinePos = id => pos[id];
const build = () => ({ type: 'FeatureCollection', features: SHRINES.flatMap(s => shrine(s, pos[s.id])) });
const labels = () => ({ type: 'FeatureCollection', features: SHRINES.map(s => ({ type: 'Feature', properties: { name: s.name }, geometry: { type: 'Point', coordinates: pos[s.id] } })) });

async function resolve() {
  const cached = load('shrinePos', null);
  if (cached) { pos = { ...pos, ...cached }; return; }
  const found = {};
  for (const s of SHRINES) {
    try {
      const u = new URL(CONFIG.nominatim + '/search');
      Object.entries({ q: s.q, format: 'jsonv2', limit: 1, countrycodes: 'iq', 'accept-language': 'ar' }).forEach(([k, v]) => u.searchParams.set(k, v));
      const r = (await (await fetch(u)).json())[0];
      if (r) { const p = [+r.lon, +r.lat]; if (dist(p, s.at) < 1500) found[s.id] = p; }
    } catch {}
  }
  if (Object.keys(found).length) { save('shrinePos', found); pos = { ...pos, ...found }; }
}

export function initLandmarks() {
  map.addSource('landmarks', { type: 'geojson', data: build() });
  map.addSource('landmark-labels', { type: 'geojson', data: labels() });
  const k = state.heightScale;
  map.addLayer({ id: 'landmarks-3d', type: 'fill-extrusion', source: 'landmarks', paint: {
    'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k], 'fill-extrusion-opacity': 1 } }, 'road-names');
  map.addLayer({ id: 'landmark-labels', type: 'symbol', source: 'landmark-labels', minzoom: 12, layout: {
    'text-field': ['get', 'name'], 'text-font': CONFIG.font, 'text-size': 15, 'text-offset': [0, -3], 'text-allow-overlap': true }, paint: {
    'text-color': '#7a4a00', 'text-halo-color': '#fff', 'text-halo-width': 2.4 } });
  applyVisible(prefs().landmarks);
  on('pref:landmarks', applyVisible);
  resolve().then(() => { map.getSource('landmarks')?.setData(build()); map.getSource('landmark-labels')?.setData(labels()); });
}
function applyVisible(v) {
  ['landmarks-3d', 'landmark-labels'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? 'visible' : 'none'));
}
