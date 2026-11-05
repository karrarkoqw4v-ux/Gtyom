// بلاغات الطريق (زحمة، حادث، سيطرة...): تنحفظ بالجهاز وتظهر على الخريطة 6 ساعات
import { map } from './map.js';
import { load, save } from '../core/storage.js';
export const REPORT_TYPES = [
  { id: 'jam', name: 'زحمة سير', color: '#f59e0b', icon: 'traffic' }, { id: 'crash', name: 'حادث', color: '#ef4444', icon: 'alert' },
  { id: 'check', name: 'سيطرة / نقطة تفتيش', color: '#6366f1', icon: 'flag' }, { id: 'closed', name: 'طريق مغلق', color: '#111827', icon: 'close' },
  { id: 'pothole', name: 'حفرة أو مطب', color: '#8b5cf6', icon: 'road' }, { id: 'hazard', name: 'خطر على الطريق', color: '#e11d48', icon: 'alert' }
];
const EMPTY = { type: 'FeatureCollection', features: [] }, TTL = 6 * 3600e3;
const fresh = () => load('reports', []).filter(r => Date.now() - r.ts < TTL);
const geo = () => ({ type: 'FeatureCollection', features: fresh().map(r => { const t = REPORT_TYPES.find(x => x.id === r.type) || REPORT_TYPES[0]; return { type: 'Feature', properties: { name: t.name, color: t.color }, geometry: { type: 'Point', coordinates: [r.lng, r.lat] } }; }) });
export function initReports() {
  map.addSource('reports', { type: 'geojson', data: geo() });
  map.addLayer({ id: 'reports', type: 'circle', source: 'reports', minzoom: 9, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 5, 18, 11], 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
  map.addLayer({ id: 'reports-names', type: 'symbol', source: 'reports', minzoom: 13, layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-offset': [0, 1.4], 'text-anchor': 'top' }, paint: { 'text-color': '#7a1d12', 'text-halo-color': '#fff', 'text-halo-width': 2.2 } });
}
export function addReport(type, pos) {
  const l = fresh(); l.push({ type, lng: pos.lng, lat: pos.lat, ts: Date.now() }); save('reports', l.slice(-100));
  map.getSource('reports')?.setData(geo());
}
