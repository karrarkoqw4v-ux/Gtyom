// حركة سيارات على الشوارع الظاهرة. محاكاة شكلية، كثافتها تتغير حسب الوقت (ذروة الصباح والعصر). مو بيانات مرور حية
import { map } from '../map/map.js';
import { prefs } from '../core/prefs.js';
import { cumulative, pointAlong } from '../core/geo.js';
const TR = [[0, .12], [5, .2], [7, .8], [8, 1], [9.5, .8], [12, .65], [14, .7], [16, .85], [17.5, 1], [19, .7], [21, .4], [24, .12]];
function trafficFactor() { const d = new Date(), h = d.getHours() + d.getMinutes() / 60; for (let i = 1; i < TR.length; i++) if (h <= TR[i][0]) { const [h0, a] = TR[i - 1], [h1, c] = TR[i]; return a + (c - a) * (h - h0) / (h1 - h0); } return .3; }
const EMPTY = { type: 'FeatureCollection', features: [] }, COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#ffffff', '#8b5cf6', '#14b8a6'];
const LAYERS = ['road-minor', 'road-tert', 'road-sec', 'road-pri', 'road-mw'];
let paths = [], cars = [], raf = 0, last = 0, lastKey = '';
const active = () => prefs().trafficSim && map.getZoom() >= 15.4 && !document.body.classList.contains('navigating');
function refresh() {
  if (!active()) { if (cars.length) { cars = []; map.getSource('simcars')?.setData(EMPTY); } return; }
  const c = map.getCenter(), key = map.getZoom().toFixed(2) + ',' + c.lng.toFixed(4) + ',' + c.lat.toFixed(4);
  if (key === lastKey) return; lastKey = key;
  const found = [];
  map.queryRenderedFeatures({ layers: LAYERS.filter(l => map.getLayer(l)) }).forEach(f => {
    const g = f.geometry; (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []).forEach(c => { if (c.length > 1) found.push(c); });
  });
  paths = found.map(c => { const cum = cumulative(c); return { c, cum, total: cum[cum.length - 1] }; }).filter(p => p.total > 35).sort(() => Math.random() - .5).slice(0, 70);
  const n = paths.length ? Math.round(22 * trafficFactor()) : 0;
  cars = Array.from({ length: n }, (_, i) => { const p = paths[i % paths.length]; return { p, s: Math.random() * p.total, v: 6 + Math.random() * 8, d: Math.random() < .5 ? 1 : -1, col: COLORS[i % COLORS.length] }; });
}
function loop(t) {
  raf = requestAnimationFrame(loop);
  if (t - last < 130 || document.body.classList.contains('moving') || !cars.length) return;
  const dt = (t - last) / 1000; last = t;
  const f = cars.map(c => {
    c.s += c.d * c.v * dt; if (c.s > c.p.total || c.s < 0) { c.d = -c.d; c.s = Math.min(Math.max(c.s, 0), c.p.total); }
    const a = pointAlong(c.p.c, c.p.cum, c.s);
    return { type: 'Feature', properties: { c: c.col }, geometry: { type: 'Point', coordinates: a.point } };
  });
  map.getSource('simcars')?.setData({ type: 'FeatureCollection', features: f });
}
export function initTraffic() {
  map.addSource('simcars', { type: 'geojson', data: EMPTY });
  map.addLayer({ id: 'simcars', type: 'circle', source: 'simcars', minzoom: 15.4, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.4, 2.2, 19, 6.5], 'circle-color': ['get', 'c'], 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 1 } }, 'b3d');
  map.on('moveend', refresh); map.on('idle', () => { if (active() && !cars.length) refresh(); });
  raf = requestAnimationFrame(loop);
}
export function refreshTraffic() { refresh(); }
