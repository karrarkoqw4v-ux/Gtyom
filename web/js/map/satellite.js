// الخريطة الواقعية: صورة القمر الاصطناعي الحقيقية تحت الشوارع والبنايات ثلاثية الأبعاد، تظهر تدريجياً عند التقريب (من مستوى المدينة)
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
import { buildingColor } from './theme.js';
const URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const REAL = { small: ['#d8ccb6', '#e6dccb', '#cdc1ab', '#eae2d4', '#c8bca6', '#dcd1be'], tall: ['#d5d9df', '#bbc3ce', '#98a5b6'] };
const Z = (a, b) => ['interpolate', ['linear'], ['zoom'], 10.5, a, 12.5, b];
const ROADS = ['road-minor-case', 'road-tert-case', 'road-sec-case', 'road-pri-case', 'road-mw-case', 'road-minor', 'road-tert', 'road-sec', 'road-pri', 'road-mw', 'path'];
const LABELS = ['road-names', 'poi-names', 'places', 'housenumber'];
const saved = {};
const get = (l, p) => { const k = l + '|' + p; if (!(k in saved)) saved[k] = map.getPaintProperty(l, p); return saved[k]; };
const set = (l, p, v) => { if (map.getLayer(l)) { get(l, p); map.setPaintProperty(l, p, v); } };
const reset = (l, p) => { const k = l + '|' + p; if (map.getLayer(l) && k in saved) map.setPaintProperty(l, p, saved[k]); };
function apply() {
  const on = prefs().satellite;
  if (map.getLayer('sat')) map.setLayoutProperty('sat', 'visibility', on ? 'visible' : 'none');
  if (on) {
    ROADS.forEach(l => set(l, 'line-opacity', l.endsWith('-case') ? Z(1, 0.18) : Z(1, 0.62)));
    set('waterway', 'line-opacity', Z(1, 0));
    LABELS.forEach(l => { set(l, 'text-color', Z('#14243b', '#ffffff')); set(l, 'text-halo-color', Z('#ffffff', 'rgba(8,18,32,0.9)')); });
    set('b3d', 'fill-extrusion-color', ['to-color', ['get', 'colour'], buildingColor(REAL)]);
    set('b3d-roof', 'fill-extrusion-color', '#efe9dc'); set('b3d-ground', 'fill-extrusion-color', '#b8ad9a');
    set('building-lines', 'line-color', Z('rgba(35,45,70,0.5)', 'rgba(255,255,255,0.4)'));
  } else {
    [...ROADS].forEach(l => reset(l, 'line-opacity')); reset('waterway', 'line-opacity');
    LABELS.forEach(l => { reset(l, 'text-color'); reset(l, 'text-halo-color'); });
    ['b3d|fill-extrusion-color', 'b3d-roof|fill-extrusion-color', 'b3d-ground|fill-extrusion-color', 'building-lines|line-color'].forEach(k => { const [l, p] = k.split('|'); reset(l, p); });
  }
}
export const reapplySatellite = () => { Object.keys(saved).forEach(k => delete saved[k]); apply(); };
export function initSatellite() {
  map.addSource('sat', { type: 'raster', tiles: [URL], tileSize: 256, maxzoom: 19, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' });
  map.addLayer({ id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0, 12, 1], 'raster-fade-duration': 250, 'raster-saturation': 0.05, 'raster-contrast': 0.06 } }, 'waterway');
  apply(); on('pref:satellite', apply);
}
