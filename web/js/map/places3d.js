// مجسمات ثلاثية الأبعاد للأماكن الرئيسية والعامة والحدائق والمواقف والمحطات بكل المحافظات. حقيقية من OpenStreetMap وتثبت على الخريطة
import { map } from './map.js';
import { CONFIG } from '../config.js';
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
import { run } from '../places/overpass.js';
import { modelFor } from './models3d.js';
import { extraModel, hasExtra } from './models-extra.js';
import { readCell, PACK_CELL } from '../offline/packs.js';
const EMPTY = { type: 'FeatureCollection', features: [] }, CELL = 0.02, MAX = 420;
export const PLACE_QUERY = ['nwr["amenity"="fuel"]', 'nwr["amenity"="hospital"]', 'nwr["amenity"="marketplace"]', 'nwr["shop"~"^(supermarket|mall|department_store)$"]', 'nwr["amenity"="place_of_worship"]["religion"="muslim"]',
  'nwr["tourism"="hotel"]', 'nwr["amenity"="bank"]', 'nwr["amenity"~"^(townhall|courthouse|police)$"]', 'nwr["office"="government"]',
  'nwr["leisure"="park"]', 'nwr["amenity"="parking"]["parking"!="street_side"]', 'nwr["amenity"="bus_station"]', 'nwr["amenity"~"^(school|university|college)$"]'];
export const catOf = t => t.amenity === 'fuel' ? 'fuel' : t.amenity === 'hospital' ? 'health' : (t.amenity === 'marketplace' || t.shop === 'supermarket') ? 'market' : (t.shop === 'mall' || t.shop === 'department_store') ? 'mall'
  : t.amenity === 'place_of_worship' ? 'mosque' : t.tourism === 'hotel' ? 'hotel' : t.amenity === 'bank' ? 'bank' : (['townhall', 'courthouse', 'police'].includes(t.amenity) || t.office === 'government') ? 'gov'
  : t.leisure === 'park' ? 'park' : t.amenity === 'parking' ? 'parking' : t.amenity === 'bus_station' ? 'bus' : ['school', 'university', 'college'].includes(t.amenity) ? 'school' : null;
const items = new Map(), seen = new Set(), packSeen = new Set(), packHas = new Set();
const build = p => hasExtra(p.cat) ? extraModel(p) : modelFor(p);
const feats = () => ({ type: 'FeatureCollection', features: [...items.values()].flatMap(build) });
const labels = () => ({ type: 'FeatureCollection', features: [...items.values()].filter(p => p.name && !['fuel', 'bank', 'parking', 'park'].includes(p.cat)).map(p => ({ type: 'Feature', properties: { name: p.name }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) });
const draw = () => { map.getSource('places3d')?.setData(feats()); map.getSource('places3d-labels')?.setData(labels()); };
const add = list => { list.forEach(p => { const cat = p.cat || catOf(p.tags || {}); if (cat && p.lng != null) items.set(p.id, { ...p, cat }); }); while (items.size > MAX) items.delete(items.keys().next().value); };
async function fromPacks(b) {
  let any = false;
  for (let I = Math.floor(b.getWest() / PACK_CELL); I <= Math.floor(b.getEast() / PACK_CELL); I++) for (let J = Math.floor(b.getSouth() / PACK_CELL); J <= Math.floor(b.getNorth() / PACK_CELL); J++) {
    const k = I + ':' + J; if (packSeen.has(k)) continue; packSeen.add(k);
    const d = await readCell(I, J); if (d) { add(d); packHas.add(k); any = true; }
  }
  if (any) draw();
}
async function load() {
  if (!prefs().places3d || map.getZoom() < 14.6) return;
  const b = map.getBounds(); await fromPacks(b);
  const i0 = Math.floor(b.getWest() / CELL), i1 = Math.floor(b.getEast() / CELL), j0 = Math.floor(b.getSouth() / CELL), j1 = Math.floor(b.getNorth() / CELL);
  let n = 0;
  for (let i = i0; i <= i1 && n < 4; i++) for (let j = j0; j <= j1 && n < 4; j++) {
    const key = i + ':' + j; if (seen.has(key)) continue; seen.add(key);
    const s = j * CELL, w = i * CELL;
    if (packHas.has(Math.floor(w / PACK_CELL) + ':' + Math.floor(s / PACK_CELL))) continue;
    n++;
    const bb = `(${s},${w},${s + CELL},${w + CELL});`;
    run(PLACE_QUERY.map(q => q + bb).join(''), null, 140).then(list => { add(list); draw(); }).catch(() => seen.delete(key));
  }
}
export function reloadPlaces() { packSeen.clear(); packHas.clear(); load(); }
export function initPlaces3D() {
  const k = state.heightScale;
  map.addSource('places3d', { type: 'geojson', data: EMPTY });
  map.addSource('places3d-labels', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'places3d', type: 'fill-extrusion', source: 'places3d', minzoom: 13, paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k], 'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true } }, 'road-names');
  map.addLayer({ id: 'places3d-labels', type: 'symbol', source: 'places3d-labels', minzoom: 15.5, layout: { 'text-field': ['get', 'name'], 'text-font': CONFIG.fontBold, 'text-size': 13, 'text-offset': [0, -2.2], 'text-max-width': 8 }, paint: { 'text-color': '#4a2c7a', 'text-halo-color': '#fff', 'text-halo-width': 2.4 } });
  const vis = v => ['places3d', 'places3d-labels'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? 'visible' : 'none'));
  vis(prefs().places3d); on('pref:places3d', v => { vis(v); if (v) load(); });
  map.on('moveend', load); map.on('idle', load);
}
