// بنايات بألوان حقيقية من القمر الاصطناعي: نقرأ لون سطح كل بناية من الصورة، ونضيف واجهات مجسمة (قاعدة حجرية، بروزات الطوابق، كورنيش) بأسلوب البنايات الواقعية
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { state } from '../core/state.js';
import { on } from '../core/events.js';
const TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', ZT = 17, FLOOR = 3.2, M = 111320, D = Math.PI / 180;
const EMPTY = { type: 'FeatureCollection', features: [] };
const tiles = new Map(), done = new Map(); let failed = false, busy = false, timer = 0;
const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function tileXY(lng, lat) { const n = 2 ** ZT, r = lat * D; return [(lng + 180) / 360 * n, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n]; }
function getTile(x, y) {
  const k = x + '/' + y;
  if (!tiles.has(k)) {
    tiles.set(k, (async () => {
      const r = await fetch(TILE.replace('{z}', ZT).replace('{y}', y).replace('{x}', x), { mode: 'cors' }); if (!r.ok) throw new Error('tile');
      const bmp = await createImageBitmap(await r.blob()), c = document.createElement('canvas'); c.width = c.height = 256;
      const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bmp, 0, 0); ctx.getImageData(0, 0, 1, 1); // يرمي خطأ إذا الصورة ممنوعة القراءة
      return ctx;
    })());
    if (tiles.size > 90) tiles.delete(tiles.keys().next().value);
  }
  return tiles.get(k);
}
const inside = (p, ring) => { let o = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) o = !o; } return o; };
const centroid = r => { let x = 0, y = 0; r.forEach(p => { x += p[0]; y += p[1]; }); return [x / r.length, y / r.length]; };
async function roofColor(ring) {
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9; ring.forEach(([x, y]) => { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); });
  let pts = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const p = [a + (b - a) * (i + 0.5) / 4, c + (d - c) * (j + 0.5) / 4]; if (inside(p, ring)) pts.push(p); }
  if (!pts.length) pts = [centroid(ring)];
  let r = 0, g = 0, bl = 0, n = 0;
  for (const p of pts) { const [tx, ty] = tileXY(p[0], p[1]), X = Math.floor(tx), Y = Math.floor(ty), ctx = await getTile(X, Y), px = ctx.getImageData(Math.min(255, Math.floor((tx - X) * 256)), Math.min(255, Math.floor((ty - Y) * 256)), 1, 1).data; r += px[0]; g += px[1]; bl += px[2]; n++; }
  return [r / n, g / n, bl / n];
}
// نزيح محيط البناية للخارج بمتر معيّن (لبروزات الطوابق والكورنيش)
function grow(ring, m) { const c = centroid(ring), k = Math.cos(c[1] * D); return ring.map(([x, y]) => { const dx = (x - c[0]) * M * k, dy = (y - c[1]) * M, L = Math.hypot(dx, dy) || 1; return [x + dx / L * m / (M * k), y + dy / L * m / M]; }); }
export function buildingFeatures(ring, H, avg) {
  const wall = mix(avg, [224, 212, 190], 0.62), roof = mix(avg, [212, 208, 200], 0.18), ledge = mix(wall, [250, 245, 232], 0.55), base = mix(wall, [120, 112, 98], 0.45);
  const F = (t, g, b, top, col) => ({ type: 'Feature', properties: { t, base: b, top, color: hex(col) }, geometry: { type: 'Polygon', coordinates: [g] } });
  const out = [F('w', grow(ring, 0.1), 0, H + 0.05, wall), F('r', grow(ring, 0.1), H + 0.05, H + 0.7, roof)];
  const bb = ring.reduce((s, [x, y]) => [Math.min(s[0], x), Math.max(s[1], x), Math.min(s[2], y), Math.max(s[3], y)], [1e9, -1e9, 1e9, -1e9]);
  if (Math.max((bb[1] - bb[0]) * M * Math.cos(ring[0][1] * D), (bb[3] - bb[2]) * M) > 90 || ring.length > 30 || H < 9) return out;
  out.push(F('l', grow(ring, 0.28), 0, FLOOR, base));                                  // قاعدة حجرية
  const floors = Math.min(16, Math.floor(H / FLOOR));
  for (let f = 1; f < floors; f++) out.push(F('l', grow(ring, 0.4), f * FLOOR - 0.22, f * FLOOR + 0.08, ledge)); // بروزات الطوابق
  out.push(F('l', grow(ring, 0.65), H - 0.55, H + 0.15, ledge));                      // كورنيش
  return out;
}
const draw = () => map.getSource('facades')?.setData({ type: 'FeatureCollection', features: [...done.values()].flat() });
async function collect() {
  if (!prefs().facades || !prefs().satellite || failed || busy || map.getZoom() < 16.2) return;
  busy = true;
  try {
    const todo = [];
    map.queryRenderedFeatures({ layers: ['b3d'].filter(l => map.getLayer(l)) }).forEach(f => {
      const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      polys.forEach(poly => {
        const ring = poly[0]; if (!ring || ring.length < 4 || ring.length > 45 || +f.properties.render_min_height > 0) return;
        const key = ring[0][0].toFixed(6) + ',' + ring[0][1].toFixed(6) + ':' + ring.length;
        if (done.has(key) || todo.some(t => t.key === key) || todo.length >= 400) return;
        todo.push({ key, ring, H: Math.max(+f.properties.render_height || 9, 10) });
      });
    });
    for (let i = 0; i < todo.length; i += 20) {
      await Promise.all(todo.slice(i, i + 20).map(async t => { try { done.set(t.key, buildingFeatures(t.ring, t.H, await roofColor(t.ring))); } catch (e) { if (!failed && /tile|taint|security/i.test(String(e))) failed = true; } }));
      while (done.size > 2600) done.delete(done.keys().next().value);
      draw();
    }
  } finally { busy = false; }
}
export function initFacades() {
  const k = state.heightScale, ex = { 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k], 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true };
  map.addSource('facades', { type: 'geojson', data: EMPTY });
  [['facade-walls', 'w', 16.2], ['facade-roofs', 'r', 16.2], ['facade-ledges', 'l', 17]].forEach(([id, t, z]) => map.addLayer({ id, type: 'fill-extrusion', source: 'facades', minzoom: z, filter: ['==', ['get', 't'], t], paint: ex }, 'road-names'));
  const vis = () => ['facade-walls', 'facade-roofs', 'facade-ledges'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', prefs().facades && prefs().satellite ? 'visible' : 'none'));
  vis(); on('pref:facades', () => { vis(); later(); }); on('pref:satellite', () => { vis(); later(); });
  const later = () => { clearTimeout(timer); timer = setTimeout(collect, 450); };
  map.on('moveend', later); map.on('idle', later);
}
