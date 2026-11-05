// تظليل بصمة البناية الحقيقية (من بيانات الخريطة) للمكان المختار
import { map } from './map.js';
import { state } from '../core/state.js';
const EMPTY = { type: 'FeatureCollection', features: [] };
export function initHighlight() {
  map.addSource('hl', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'hl-roof', type: 'fill-extrusion', source: 'hl', paint: { 'fill-extrusion-color': '#e24134', 'fill-extrusion-height': ['+', ['get', 'h'], 1.2], 'fill-extrusion-base': ['get', 'h'], 'fill-extrusion-opacity': 0.95 } }, 'road-names');
  map.addLayer({ id: 'hl-line', type: 'line', source: 'hl', paint: { 'line-color': '#e24134', 'line-width': 3 } }, 'road-names');
}
export function clearHighlight() { map.getSource('hl')?.setData(EMPTY); }
export function highlightAt(lng, lat) {
  const run = () => {
    const pt = map.project([lng, lat]), f = map.queryRenderedFeatures([[pt.x - 6, pt.y - 6], [pt.x + 6, pt.y + 6]], { layers: ['b3d', 'b3d-ext'].filter(l => map.getLayer(l)) })[0];
    if (!f || !['Polygon', 'MultiPolygon'].includes(f.geometry.type)) return clearHighlight();
    const h = Math.max(+f.properties.render_height || +f.properties.height || 9, 10) * state.heightScale;
    map.getSource('hl')?.setData({ type: 'Feature', properties: { h }, geometry: f.geometry });
  };
  clearHighlight(); map.once('idle', run); setTimeout(run, 2600);
}
