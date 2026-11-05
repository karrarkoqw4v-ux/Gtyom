// إخفاء كل الدول المجاورة وإبقاء العراق والكويت فقط (حدودهم الحقيقية من OpenStreetMap)
import { map } from './map.js';
import { CONFIG } from '../config.js';
import { load, save } from '../core/storage.js';
import { PALETTES } from './theme.js';
import { prefs } from '../core/prefs.js';

const KEY = 'countryRings-v1';
async function getRings() {
  const cached = load(KEY, null);
  if (cached?.length) return cached;
  const u = new URL(CONFIG.nominatim + '/lookup');
  Object.entries({ osm_ids: 'R304934,R305099', format: 'jsonv2', polygon_geojson: 1, polygon_threshold: 0.002 }).forEach(([k, v]) => u.searchParams.set(k, v));
  const list = await (await fetch(u)).json();
  const rings = [];
  list.forEach(p => {
    const g = p.geojson;
    if (!g) return;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    polys.forEach(poly => { if (poly[0]?.length > 3) rings.push(poly[0]); });
  });
  if (rings.length) save(KEY, rings);
  return rings;
}
export async function initMask() {
  let rings;
  try { rings = await getRings(); } catch { return; }
  if (!rings?.length) return;
  const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
  const pal = PALETTES[prefs().palette] || PALETTES.light;
  map.addSource('mask', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [world, ...rings] } } });
  map.addSource('outline', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: rings } } });
  map.addLayer({ id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': pal.bg, 'fill-opacity': 1, 'fill-antialias': false } });
  map.addLayer({ id: 'outline-glow', type: 'line', source: 'outline', paint: { 'line-color': '#d94b6a', 'line-opacity': 0.2, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 8, 12, 22], 'line-blur': 6 } });
  map.addLayer({ id: 'outline', type: 'line', source: 'outline', paint: { 'line-color': '#d94b6a', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.6, 12, 4] } });
  ['border', 'border-glow'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', 'none'));
}
