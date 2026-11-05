// القصور والمجالس الحكومية في بغداد (القصر الجمهوري، مجلس الوزراء، مجلس النواب...): دائماً ظاهرة ثلاثية الأبعاد بتفاصيلها
import { map } from './map.js';
import { CONFIG } from '../config.js';
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';
import { load, save } from '../core/storage.js';
import { on } from '../core/events.js';
import { run } from '../places/overpass.js';
import { modelFor, centroid, ringSize } from './models3d.js';
const EMPTY = { type: 'FeatureCollection', features: [] };
const RX = 'القصر الجمهوري|قصر السلام|مجلس الوزراء|مجلس النواب|رئاسة الجمهورية|مجلس القضاء|القصر الحكومي|رئاسة الوزراء|Republican Palace|Presidential|Council of Ministers|Council of Representatives|Parliament|Salam Palace|Prime Minister';
const BBOX = '33.18,44.20,33.46,44.58';
const SHOW = { id: 'gov', color: '#b8892b' };
let items = [];
const feats = () => ({ type: 'FeatureCollection', features: items.flatMap(p => modelFor({ ...p, cat: 'gov', ring: p.ring && ringSize(p.ring) < 140 ? p.ring : null })) });
const labels = () => ({ type: 'FeatureCollection', features: items.map(p => ({ type: 'Feature', properties: { name: p.name }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) });
const apply = () => { map.getSource('gov')?.setData(feats()); map.getSource('gov-labels')?.setData(labels()); };

async function fetchGov() {
  const hit = load('govItems', null);
  if (hit && Date.now() - hit.t < 7 * 864e5) return hit.list;
  const parts = ['name', 'name:ar', 'name:en'].map(k => `nwr["${k}"~"${RX}"](${BBOX});`).join('');
  const list = await run(parts, null, 60);
  const seen = new Set(), out = [];
  list.filter(p => p.name).sort((a, b) => (b.ring ? ringSize(b.ring) : 0) - (a.ring ? ringSize(a.ring) : 0)).forEach(p => {
    const k = p.name + Math.round(p.lng * 600) + Math.round(p.lat * 600); if (seen.has(k) || out.length >= 14) return; seen.add(k); out.push({ id: p.id, lng: p.lng, lat: p.lat, name: p.name, ring: p.ring });
  });
  if (out.length) save('govItems', { t: Date.now(), list: out });
  return out;
}
export function initGov() {
  const k = state.heightScale;
  map.addSource('gov', { type: 'geojson', data: EMPTY });
  map.addSource('gov-labels', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'gov-3d', type: 'fill-extrusion', source: 'gov', minzoom: 10, paint: {
    'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k], 'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true } }, 'road-names');
  map.addLayer({ id: 'gov-labels', type: 'symbol', source: 'gov-labels', minzoom: 11, layout: {
    'text-field': ['get', 'name'], 'text-font': CONFIG.fontBold, 'text-size': ['interpolate', ['linear'], ['zoom'], 11, 13, 17, 18], 'text-offset': [0, -2.6], 'text-max-width': 9, 'text-allow-overlap': true }, paint: {
    'text-color': '#6b4400', 'text-halo-color': '#fff4d6', 'text-halo-width': 2.6 } });
  const vis = v => ['gov-3d', 'gov-labels'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? 'visible' : 'none'));
  vis(prefs().landmarks); on('pref:landmarks', vis);
  items = load('govItems', null)?.list || []; apply();
  setTimeout(() => fetchGov().then(l => { if (l.length) { items = l; apply(); } }).catch(() => {}), 2500);
}
