// طبقات خريطة الأحوال الجوية: مطر (حرارة من النموذج + رادار)، غبار، رياح، المحافظات، مكاتب الأرصاد
let map = null;
export const useMap = m => { map = m; };
import { KIND_COLOR } from './codes.js';
const EMPTY = { type: 'FeatureCollection', features: [] };
const WX = ['wx-heat', 'wx-dust', 'wx-wind', 'wx-pts-c', 'wx-pts-l', 'wx-off', 'wx-off-l'];
let radar = { ids: [], i: 0, timer: 0, frames: [], playing: false, onFrame: null };
const before = () => map.getLayer('mask') ? 'mask' : undefined;
function arrowImg() { const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'); x.translate(24, 24); x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#1d3557'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 16); x.lineTo(0, -14); x.moveTo(-8, -6); x.lineTo(0, -15); x.lineTo(8, -6); x.stroke(); return x.getImageData(0, 0, 48, 48); }
export function addWeatherLayers() {
  if (map.getSource('wx-grid')) return;
  if (!map.hasImage('wx-arrow')) map.addImage('wx-arrow', arrowImg());
  ['wx-grid', 'wx-pts', 'wx-off'].forEach(s => map.addSource(s, { type: 'geojson', data: EMPTY }));
  const b = before();
  map.addLayer({ id: 'wx-heat', type: 'heatmap', source: 'wx-grid', filter: ['>', ['get', 'p'], 0.05], paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'p'], 0, 0, 0.2, 0.3, 1, 0.6, 5, 1], 'heatmap-intensity': 1.1,
    'heatmap-radius': ['interpolate', ['exponential', 2], ['zoom'], 4, 14, 6, 40, 8, 150, 10, 600], 'heatmap-opacity': 0.78,
    'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.15, 'rgba(120,190,255,.6)', 0.4, 'rgba(47,128,237,.72)', 0.7, 'rgba(112,72,232,.82)', 1, 'rgba(214,40,200,.92)'] } }, b);
  map.addLayer({ id: 'wx-dust', type: 'circle', source: 'wx-pts', filter: ['>=', ['get', 'dust'], 50], paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'dust'], 50, 22, 150, 38, 500, 60], 'circle-color': '#d9a441', 'circle-opacity': 0.38, 'circle-blur': 0.6 } }, b);
  map.addLayer({ id: 'wx-wind', type: 'symbol', source: 'wx-pts', layout: { 'icon-image': 'wx-arrow', 'icon-rotate': ['get', 'wd'], 'icon-rotation-alignment': 'map', 'icon-size': ['interpolate', ['linear'], ['get', 'ws'], 0, 0.45, 60, 0.95], 'icon-offset': [0, -26], 'icon-allow-overlap': true } }, b);
  map.addLayer({ id: 'wx-pts-c', type: 'circle', source: 'wx-pts', paint: { 'circle-radius': 8, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } }, b);
  map.addLayer({ id: 'wx-pts-l', type: 'symbol', source: 'wx-pts', layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 9, 14], 'text-offset': [0, 1.3], 'text-anchor': 'top', 'text-max-width': 8 }, paint: { 'text-color': '#102a43', 'text-halo-color': '#fff', 'text-halo-width': 2.2 } }, b);
  map.addLayer({ id: 'wx-off', type: 'circle', source: 'wx-off', paint: { 'circle-radius': 6, 'circle-color': '#0b7285', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } }, b);
  map.addLayer({ id: 'wx-off-l', type: 'symbol', source: 'wx-off', minzoom: 7, layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 12, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-max-width': 9 }, paint: { 'text-color': '#0b5563', 'text-halo-color': '#fff', 'text-halo-width': 2 } }, b);
}
export function setWeatherData({ provinces = [], grid = [], offices = [] }) {
  map.getSource('wx-grid')?.setData({ type: 'FeatureCollection', features: grid.map(g => ({ type: 'Feature', properties: { p: g.p }, geometry: { type: 'Point', coordinates: [g.lng, g.lat] } })) });
  map.getSource('wx-pts')?.setData({ type: 'FeatureCollection', features: provinces.map(p => ({ type: 'Feature', properties: { name: p.name, label: `${p.name}\n${Math.round(p.temp)}°`, color: KIND_COLOR[p.kind], wd: ((p.wd || 0) + 180) % 360, ws: p.ws || 0, dust: p.dust ?? 0 }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) });
  map.getSource('wx-off')?.setData({ type: 'FeatureCollection', features: offices.map(o => ({ type: 'Feature', properties: { name: o.name }, geometry: { type: 'Point', coordinates: [o.lng, o.lat] } })) });
}
export function showWeatherLayers(v) { [...WX, ...radar.ids].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? (radar.ids.includes(l) && l !== radar.ids[radar.i] ? 'none' : 'visible') : 'none')); }
// الرادار: كل لقطة طبقة، نبدّل بينها
export function setRadar(host, frames, onFrame) {
  clearRadar(); radar.frames = frames; radar.onFrame = onFrame;
  frames.forEach((f, i) => {
    const id = 'rv-' + i; map.addSource(id, { type: 'raster', tiles: [`${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`], tileSize: 256, maxzoom: 7 });
    map.addLayer({ id, type: 'raster', source: id, layout: { visibility: i === frames.length - 1 - frames.filter(x => x.future).length ? 'visible' : 'none' }, paint: { 'raster-opacity': 0.7, 'raster-fade-duration': 0 } }, map.getLayer('wx-heat') ? 'wx-heat' : before());
    radar.ids.push(id);
  });
  radar.i = Math.max(0, frames.length - 1 - frames.filter(x => x.future).length); onFrame?.(radar.i, frames[radar.i]);
}
function show(i) { radar.ids.forEach((id, k) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', k === i ? 'visible' : 'none')); radar.i = i; radar.onFrame?.(i, radar.frames[i]); }
export function playRadar(on) {
  clearInterval(radar.timer); radar.playing = on;
  if (on && radar.ids.length) radar.timer = setInterval(() => show((radar.i + 1) % radar.ids.length), 700);
  return radar.playing;
}
export const radarPlaying = () => radar.playing;
export const hasRadar = () => radar.ids.length > 0;
export function clearRadar() { clearInterval(radar.timer); if (map) radar.ids.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); if (map.getSource(id)) map.removeSource(id); } catch {} }); radar = { ids: [], i: 0, timer: 0, frames: [], playing: false, onFrame: null }; }
