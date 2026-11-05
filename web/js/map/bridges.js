// جسور ثلاثية الأبعاد بمسارها وطولها الحقيقي من OpenStreetMap بكل المحافظات: سطح، سياج، أعمدة، وإنارة
import { map } from './map.js';
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
const W = { motorway: 22, trunk: 18, primary: 16, secondary: 13, tertiary: 11, minor: 8, service: 6, track: 5, path: 4, rail: 9, transit: 9 };
const M = 111320, D = Math.PI / 180, EMPTY = { type: 'FeatureCollection', features: [] };
const bridges = new Map(); let timer = 0;
const F = (ring, base, top, color) => ({ type: 'Feature', properties: { base, top, color }, geometry: { type: 'Polygon', coordinates: [ring] } });
const len = (a, b) => { const k = Math.cos(a[1] * D); return Math.hypot((b[0] - a[0]) * M * k, (b[1] - a[1]) * M); };
// مربع بين نقطتين بعرض معيّن (مع إزاحة جانبية)
function quad(a, b, half, shift = 0) {
  const k = Math.cos(a[1] * D), dx = (b[0] - a[0]) * M * k, dy = (b[1] - a[1]) * M, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const o = (p, s) => [p[0] + (nx * (shift + s * half)) / (M * k), p[1] + (ny * (shift + s * half)) / M];
  return [o(a, 1), o(b, 1), o(b, -1), o(a, -1), o(a, 1)];
}
const square = (p, s) => { const k = Math.cos(p[1] * D), dx = s / 2 / (M * k), dy = s / 2 / M; return [[p[0] - dx, p[1] - dy], [p[0] + dx, p[1] - dy], [p[0] + dx, p[1] + dy], [p[0] - dx, p[1] + dy], [p[0] - dx, p[1] - dy]]; };
const sideP = (a, b, t, off) => { const k = Math.cos(a[1] * D), dx = (b[0] - a[0]) * M * k, dy = (b[1] - a[1]) * M, L = Math.hypot(dx, dy) || 1, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; return [p[0] + (-dy / L * off) / (M * k), p[1] + (dx / L * off) / M]; };
function model(br) {
  const c = br.c, w = W[br.cls] || 9, total = c.slice(1).reduce((s, p, i) => s + len(c[i], p), 0), h = total > 150 ? 11 : 7.5, f = [];
  let run = 0, nextPier = 14, nextLamp = 20;
  for (let i = 0; i < c.length - 1; i++) {
    const a = c[i], b = c[i + 1], L = len(a, b); if (L < 0.5) continue;
    f.push(F(quad(a, b, w / 2), h - 1.4, h, '#8b95a1'));                    // سطح الجسر
    f.push(F(quad(a, b, 0.25, w / 2 - 0.3), h, h + 1.2, '#5f6b78'));        // السياج
    f.push(F(quad(a, b, 0.25, -(w / 2 - 0.3)), h, h + 1.2, '#5f6b78'));
    if (w >= 11) f.push(F(quad(a, b, 0.3), h, h + 0.5, '#d8dde3'));         // حاجز الوسط
    while (nextPier < run + L && nextPier < total - 8) { const t = (nextPier - run) / L, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; f.push(F(square(p, Math.min(3, w * 0.22)), 0, h - 1.4, '#aab3bd')); nextPier += 28; }
    if (br.cls !== 'path' && br.cls !== 'rail') while (nextLamp < run + L && nextLamp < total - 6) { const t = (nextLamp - run) / L; [1, -1].forEach(s => { const p = sideP(a, b, t, s * (w / 2 - 0.3)); f.push(F(square(p, 0.3), h + 1.2, h + 7, '#4b5563'), F(square(p, 0.8), h + 7, h + 7.4, '#ffe08a')); }); nextLamp += 38; }
    run += L;
  }
  return f;
}
const draw = () => map.getSource('bridges3d')?.setData({ type: 'FeatureCollection', features: [...bridges.values()].flatMap(model) });
function scan() {
  if (!prefs().bridges || map.getZoom() < 14) return;
  let added = 0;
  map.querySourceFeatures('osm', { sourceLayer: 'transportation', filter: ['==', ['get', 'brunnel'], 'bridge'] }).forEach(f => {
    const g = f.geometry, lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    lines.forEach(c => { if (c.length < 2) return; const k = c[0].map(v => v.toFixed(5)).join() + c[c.length - 1].map(v => v.toFixed(5)).join(); if (!bridges.has(k)) { bridges.set(k, { c, cls: f.properties.class }); added++; } });
  });
  while (bridges.size > 450) bridges.delete(bridges.keys().next().value);
  if (added) draw();
}
export function initBridges() {
  const k = state.heightScale * 0.6;
  map.addSource('bridges3d', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'bridges3d', type: 'fill-extrusion', source: 'bridges3d', minzoom: 14, paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k], 'fill-extrusion-vertical-gradient': true } }, 'road-names');
  const vis = v => map.getLayer('bridges3d') && map.setLayoutProperty('bridges3d', 'visibility', v ? 'visible' : 'none');
  vis(prefs().bridges); on('pref:bridges', v => { vis(v); if (v) scan(); });
  const later = () => { clearTimeout(timer); timer = setTimeout(scan, 350); };
  map.on('moveend', later); map.on('idle', later);
}
