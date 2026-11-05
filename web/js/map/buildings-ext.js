// مصدر بنايات إضافي (PMTiles) لتكميل المناطق الناقصة. تجريبي: يبحث عن مصدر شغّال تلقائياً أو تحط رابطك من «الطبقات»
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { load, save } from '../core/storage.js';
import { state } from '../core/state.js';
import { emit } from '../core/events.js';
import { PALETTES } from './theme.js';
const REL = ['2025-02-19.0', '2025-01-22.0', '2024-12-18.0', '2024-11-13.0', '2024-10-23.0', '2024-09-18.0', '2024-08-20.0', '2024-07-22.0'];
const CAND = REL.map(r => `https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/${r}/buildings.pmtiles`);
export const extStatus = () => load('extBuildings', { url: null, t: 0 });
async function probe(url) {
  try {
    const r = await fetch(url, { headers: { Range: 'bytes=0-6' } });
    if (r.status !== 206 && r.status !== 200) return false;
    return String.fromCharCode(...new Uint8Array(await r.arrayBuffer()).slice(0, 7)) === 'PMTiles';
  } catch { return false; }
}
const col = p => ['case', ['<', ['coalesce', ['get', 'height'], 6], 13],
  ['match', ['floor', ['%', ['+', ['to-number', ['id'], 0], ['*', ['coalesce', ['get', 'height'], 7], 13]], 6]], 0, p.small[0], 1, p.small[1], 2, p.small[2], 3, p.small[3], 4, p.small[4], p.small[5]],
  ['interpolate', ['linear'], ['get', 'height'], 13, p.tall[0], 50, p.tall[1], 150, p.tall[2]]];
export async function initExtBuildings() {
  if (!window.pmtiles || !prefs().extBuildings) return;
  let url = prefs().extBuildingsUrl || null;
  if (!url) {
    const c = extStatus();
    if (c.url !== undefined && Date.now() - c.t < 7 * 864e5) url = c.url;
    else { const ok = await Promise.all(CAND.map(probe)); url = CAND[ok.indexOf(true)] || null; save('extBuildings', { url, t: Date.now() }); }
  }
  emit('ext:status', url);
  if (!url) return;
  try {
    if (!window.__pmproto) { window.__pmproto = new window.pmtiles.Protocol(); maplibregl.addProtocol('pmtiles', window.__pmproto.tile); }
    const k = state.heightScale, pal = PALETTES[prefs().palette] || PALETTES.light;
    map.addSource('ext', { type: 'vector', url: 'pmtiles://' + url });
    map.addLayer({ id: 'b3d-ext', type: 'fill-extrusion', source: 'ext', 'source-layer': 'building', minzoom: 13, paint: {
      'fill-extrusion-vertical-gradient': true, 'fill-extrusion-color': col(pal),
      'fill-extrusion-height': ['*', ['max', ['coalesce', ['get', 'height'], ['*', ['coalesce', ['get', 'num_floors'], 2], 3.2]], 9], k],
      'fill-extrusion-base': ['*', ['coalesce', ['get', 'min_height'], 0], k], 'fill-extrusion-opacity': 1 } }, 'building-lines');
    map.setLayoutProperty('b3d', 'visibility', 'none');
  } catch { /* نرجع لبنايات OSM */ }
}
