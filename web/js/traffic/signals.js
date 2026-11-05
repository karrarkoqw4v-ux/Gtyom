// الإشارات والعلامات المرورية من OpenStreetMap: إشارات ضوئية بألوانها (دورتها محاكاة)، قف، أفضلية، مشاة، مطبات، كاميرات، وحدود السرعة
import { map } from '../map/map.js';
import { prefs } from '../core/prefs.js';
import { runLite } from '../places/overpass.js';
const EMPTY = { type: 'FeatureCollection', features: [] }, CELL = 0.01, T = 64;
const seen = new Set(), lights = new Map(), signs = new Map();
const hash = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
// ما عندنا حالة الإشارة الحية، فنعرضها بلون ثابت مو متغيّر
const color = () => '#374151';
const geoLights = () => { const t = Date.now(); return { type: 'FeatureCollection', features: [...lights.values()].map(p => ({ type: 'Feature', properties: { c: color(p.id, t) }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) }; };
const geoSigns = () => ({ type: 'FeatureCollection', features: [...signs.values()].map(p => ({ type: 'Feature', properties: { icon: p.icon }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })) });

// رسم العلامات بالـ canvas
function img(draw) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.translate(32, 32); x.lineJoin = 'round'; x.textAlign = 'center'; x.textBaseline = 'middle'; draw(x); return x.getImageData(0, 0, 64, 64); }
const TXT = (x, t, size, col = '#111') => { x.fillStyle = col; x.font = `800 ${size}px system-ui,Tahoma,Arial,sans-serif`; x.fillText(t, 0, 2); };
const DRAW = {
  stop: x => { x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(28 * Math.cos(a), 28 * Math.sin(a)); } x.closePath(); x.fillStyle = '#d62828'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 4; x.stroke(); TXT(x, 'قف', 22, '#fff'); },
  yield: x => { x.beginPath(); x.moveTo(-28, -22); x.lineTo(28, -22); x.lineTo(0, 28); x.closePath(); x.fillStyle = '#fff'; x.fill(); x.strokeStyle = '#d62828'; x.lineWidth = 7; x.stroke(); },
  cross: x => { x.fillStyle = '#1d6fe0'; x.beginPath(); x.roundRect(-27, -27, 54, 54, 9); x.fill(); x.fillStyle = '#fff'; [-16, -5, 6, 17].forEach(y => x.fillRect(-19, y - 2.5, 38, 5)); },
  cam: x => { x.fillStyle = '#1d6fe0'; x.beginPath(); x.roundRect(-27, -27, 54, 54, 9); x.fill(); x.fillStyle = '#fff'; x.fillRect(-17, -10, 34, 22); x.beginPath(); x.arc(0, 1, 8, 0, 7); x.fillStyle = '#1d6fe0'; x.fill(); x.beginPath(); x.arc(0, 1, 4, 0, 7); x.fillStyle = '#fff'; x.fill(); },
  bump: x => { x.beginPath(); x.moveTo(0, -28); x.lineTo(28, 24); x.lineTo(-28, 24); x.closePath(); x.fillStyle = '#ffd43b'; x.fill(); x.strokeStyle = '#d62828'; x.lineWidth = 6; x.stroke(); x.strokeStyle = '#111'; x.lineWidth = 4; x.beginPath(); x.arc(-8, 16, 7, Math.PI, 0); x.arc(8, 16, 7, Math.PI, 0); x.stroke(); }
};
function ensureImage(name) {
  if (map.hasImage(name)) return;
  if (name.startsWith('sg-spd-')) { const v = name.slice(7); map.addImage(name, img(x => { x.beginPath(); x.arc(0, 0, 28, 0, 7); x.fillStyle = '#fff'; x.fill(); x.strokeStyle = '#d62828'; x.lineWidth = 7; x.stroke(); TXT(x, v, v.length > 2 ? 21 : 25); })); }
  else if (DRAW[name.slice(3)]) map.addImage(name, img(DRAW[name.slice(3)]));
}
const speed = t => { const m = /^(\d{2,3})(\s*km\/h)?$/.exec(String(t.maxspeed || '').trim()); return m ? +m[1] : null; };
function classify(p) {
  const t = p.tags, h = t.highway;
  if (h === 'traffic_signals') return { light: true };
  if (h === 'stop') return { icon: 'sg-stop' }; if (h === 'give_way') return { icon: 'sg-yield' };
  if (h === 'crossing') return { icon: 'sg-cross' }; if (h === 'speed_camera' || t.enforcement === 'maxspeed') return { icon: 'sg-cam' };
  if (h === 'traffic_calming') return { icon: 'sg-bump' };
  const v = h && speed(t); if (v) return { icon: 'sg-spd-' + v };
  return null;
}
async function fetchCell() {
  if (map.getZoom() < 15.8 || (!prefs().signals && !prefs().signs)) return;
  const c = map.getCenter(), i = Math.floor(c.lng / CELL), j = Math.floor(c.lat / CELL), key = i + ':' + j;
  if (seen.has(key)) return; seen.add(key);
  const s = j * CELL, w = i * CELL, bb = `(${s},${w},${s + CELL},${w + CELL});`;
  const parts = `node["highway"~"^(traffic_signals|stop|give_way|crossing|speed_camera|traffic_calming)$"]${bb}node["enforcement"="maxspeed"]${bb}way["highway"]["maxspeed"]${bb}`;
  try {
    (await runLite(parts, null, 400)).forEach(p => {
      const k = classify(p); if (!k) return;
      if (k.light) lights.set(p.id, p); else { ensureImage(k.icon); signs.set(p.id, { ...p, icon: k.icon }); }
    });
    map.getSource('signals')?.setData(geoLights()); map.getSource('signs')?.setData(geoSigns());
  } catch { seen.delete(key); }
}
export function initSignals() {
  map.addSource('signals', { type: 'geojson', data: EMPTY });
  map.addSource('signs', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'signals-halo', type: 'circle', source: 'signals', minzoom: 15.8, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.8, 7, 19, 15], 'circle-color': ['get', 'c'], 'circle-opacity': 0.25 } }, 'b3d');
  map.addLayer({ id: 'signals', type: 'circle', source: 'signals', minzoom: 15.8, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.8, 3.5, 19, 8], 'circle-color': ['get', 'c'], 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2 } }, 'b3d');
  map.addLayer({ id: 'signs', type: 'symbol', source: 'signs', minzoom: 16, layout: { 'icon-image': ['get', 'icon'], 'icon-size': ['interpolate', ['linear'], ['zoom'], 16, 0.3, 19, 0.62], 'icon-padding': 3, 'icon-allow-overlap': false } });
  map.on('styleimagemissing', e => ensureImage(e.id));
  map.on('moveend', fetchCell); map.on('idle', fetchCell);
  setSignalsVisible(prefs().signals); setSignsVisible(prefs().signs);
}
export function setSignalsVisible(v) { ['signals-halo', 'signals'].forEach(l => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? 'visible' : 'none')); }
export function setSignsVisible(v) { if (map.getLayer('signs')) map.setLayoutProperty('signs', 'visibility', v ? 'visible' : 'none'); }
