// مجسمات ثلاثية الأبعاد للمحطات والمستشفيات والأسواق... تظهر عند البحث عنها
import { map } from './map.js';
import { state } from '../core/state.js';
import { modelFor, has3D } from './models3d.js';
const EMPTY = { type: 'FeatureCollection', features: [] };
function ensure() {
  if (map.getSource('poi3d') || !map.getLayer('road-names')) return;
  const k = state.heightScale;
  map.addSource('poi3d', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'poi3d', type: 'fill-extrusion', source: 'poi3d', minzoom: 12, paint: {
    'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['*', ['get', 'top'], k], 'fill-extrusion-base': ['*', ['get', 'base'], k],
    'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true } }, 'road-names');
}
export function showPoi3D(list) {
  ensure(); const src = map.getSource('poi3d'); if (!src) return;
  src.setData({ type: 'FeatureCollection', features: list.filter(p => has3D(p.cat)).slice(0, 25).flatMap(modelFor) });
}
export function clearPoi3D() { map.getSource('poi3d')?.setData(EMPTY); }
