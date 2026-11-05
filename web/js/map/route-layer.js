// رسم المسار على الخريطة والجزء المقطوع منه
import { map } from './map.js';
import { iconHTML } from '../ui/icons.js';
import { stopPreview } from '../vehicle/preview.js';
import { pointAlong } from '../core/geo.js';
let dest = null;
const empty = { type: 'FeatureCollection', features: [] };
const line = c => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: c } });

export function initRouteLayer() {
  map.addSource('route', { type: 'geojson', data: empty });
  map.addSource('route-done', { type: 'geojson', data: empty });
  const opt = { layout: { 'line-cap': 'round', 'line-join': 'round' } };
  map.addLayer({ id: 'route-case', type: 'line', source: 'route', ...opt, paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 7, 18, 22] } }, 'b3d');
  map.addLayer({ id: 'route-line', type: 'line', source: 'route', ...opt, paint: { 'line-color': '#3fae7a', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 4, 18, 15] } }, 'b3d');
  map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', ...opt, paint: { 'line-color': '#b9c4bf', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 4, 18, 15] } }, 'b3d');
  initManeuver();
}
// سهم المنعطف الأبيض على الطريق قدام المركبة
function arrowImage() {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  x.translate(48, 48); x.lineJoin = 'round';
  x.beginPath(); x.moveTo(0, -38); x.lineTo(34, 24); x.lineTo(0, 10); x.lineTo(-34, 24); x.closePath();
  x.fillStyle = '#fff'; x.strokeStyle = '#111c19'; x.lineWidth = 9; x.stroke(); x.fill();
  return x.getImageData(0, 0, 96, 96);
}
function chevImage() {
  const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d');
  x.translate(24, 24); x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#fff'; x.lineWidth = 8;
  x.beginPath(); x.moveTo(-7, -12); x.lineTo(8, 0); x.lineTo(-7, 12); x.stroke();
  return x.getImageData(0, 0, 48, 48);
}
function initManeuver() {
  if (!map.hasImage('chev')) map.addImage('chev', chevImage());
  map.addLayer({ id: 'route-chevrons', type: 'symbol', source: 'route', layout: { 'symbol-placement': 'line', 'symbol-spacing': 62, 'icon-image': 'chev', 'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.22, 19, 0.6], 'icon-rotation-alignment': 'map', 'icon-pitch-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true } }, 'b3d');
  if (!map.hasImage('arrowhead')) map.addImage('arrowhead', arrowImage());
  map.addSource('maneuver', { type: 'geojson', data: empty });
  map.addSource('maneuver-head', { type: 'geojson', data: empty });
  const opt = { layout: { 'line-cap': 'butt', 'line-join': 'round' } };
  map.addLayer({ id: 'maneuver-case', type: 'line', source: 'maneuver', ...opt, paint: { 'line-color': '#111c19', 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 9, 19, 30] } }, 'b3d');
  map.addLayer({ id: 'maneuver-line', type: 'line', source: 'maneuver', ...opt, paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 5, 19, 18] } }, 'b3d');
  map.addLayer({ id: 'maneuver-head', type: 'symbol', source: 'maneuver-head', layout: { 'icon-image': 'arrowhead', 'icon-rotate': ['get', 'rot'], 'icon-rotation-alignment': 'map', 'icon-pitch-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true, 'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.28, 19, 0.85] } });
}
export function drawManeuver(coords, cum, S) {
  const total = cum[cum.length - 1];
  const s0 = Math.max(0, S - 42), s1 = Math.min(total, S + 26), pts = [];
  for (let s = s0; s < s1; s += 5) pts.push(pointAlong(coords, cum, s).point);
  const head = pointAlong(coords, cum, s1), tail = pointAlong(coords, cum, Math.max(s0, s1 - 7));
  pts.push(tail.point);
  map.getSource('maneuver')?.setData(line(pts));
  map.getSource('maneuver-head')?.setData({ type: 'Feature', properties: { rot: head.heading }, geometry: { type: 'Point', coordinates: head.point } });
}
export function clearManeuver() { map.getSource('maneuver')?.setData(empty); map.getSource('maneuver-head')?.setData(empty); }
export function drawRoute(coords) {
  map.getSource('route')?.setData(line(coords));
  map.getSource('route-done')?.setData(empty);
}
export function drawProgress(coords, i, point) {
  if (!coords) return;
  map.getSource('route-done')?.setData(line([...coords.slice(0, i + 1), point]));
  map.getSource('route')?.setData(line([point, ...coords.slice(i + 1)]));
}
export function clearRoute() {
  stopPreview();
  map.getSource('route')?.setData(empty);
  map.getSource('route-done')?.setData(empty);
  clearManeuver();
  setDestination(null);
}
export function setDestination(p) {
  if (dest) { dest.remove(); dest = null; }
  if (!p) return;
  const e = document.createElement('div'); e.className = 'dest-pin'; e.innerHTML = '<div class="pin-in"><svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true"><path d="M20 2C10 2 2 10 2 20c0 13 18 30 18 30s18-17 18-30C38 10 30 2 20 2z" fill="#e53935" stroke="#b71c1c" stroke-width="1.5"/><circle cx="20" cy="20" r="7.5" fill="#fff"/></svg><i class="pin-pulse"></i></div>';
  dest = new maplibregl.Marker({ element: e, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(map);
}
