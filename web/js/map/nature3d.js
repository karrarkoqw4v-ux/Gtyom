// أشجار ثلاثية الأبعاد داخل الحدائق الحقيقية الظاهرة على الخريطة (من بيانات الخريطة نفسها)
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
import { extraModel } from './models-extra.js';
const EMPTY = { type: 'FeatureCollection', features: [] };
let sig = '';
function update() {
  if (!prefs().trees || map.getZoom() < 15.3) return;
  try {
    const raw = map.querySourceFeatures('osm', { sourceLayer: 'park' }), rings = [], seen = new Set();
    raw.forEach(f => { const g = f.geometry; (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []).forEach(poly => { const r = poly[0]; if (!r || r.length < 4) return; const k = r[0].join() + r.length; if (seen.has(k)) return; seen.add(k); rings.push({ k, r }); }); });
    const s = rings.length + ':' + rings.reduce((a, x) => a + x.r.length, 0);
    if (s === sig) return; sig = s;
    const feats = rings.slice(0, 120).flatMap(x => extraModel({ cat: 'park', id: x.k, ring: x.r })).slice(0, 6000);
    map.getSource('nature3d')?.setData({ type: 'FeatureCollection', features: feats });
  } catch {}
}
export function initNature() {
  map.addSource('nature3d', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'nature3d', type: 'fill-extrusion', source: 'nature3d', minzoom: 15.3, paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'top'], 'fill-extrusion-base': ['get', 'base'], 'fill-extrusion-vertical-gradient': true } }, 'road-names');
  const vis = v => map.getLayer('nature3d') && map.setLayoutProperty('nature3d', 'visibility', v ? 'visible' : 'none');
  vis(prefs().trees); on('pref:trees', v => { vis(v); sig = ''; update(); });
  map.on('idle', update);
}
