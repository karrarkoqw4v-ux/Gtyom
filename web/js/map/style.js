// تصميم الخريطة: ألوان فاتحة، شوارع واضحة، بنايات ثلاثية الأبعاد
import { CONFIG } from '../config.js';
import { PALETTES, buildingColor } from './theme.js';
const F = CONFIG.font, FB = CONFIG.fontBold;
const nm = ['coalesce', ['get', 'name:ar'], ['get', 'name']];
const HRAW = ['max', ['coalesce', ['get', 'render_height'], 9], 10], MINH = ['coalesce', ['get', 'render_min_height'], 0];
export const heightExpr = k => ['*', HRAW, k];
// من قريب: الطابق الأرضي له لون أغمق (محلات)، فالجدار يبدأ فوقه
export const baseExpr = k => ['step', ['zoom'], ['*', MINH, k], 16.5, ['*', ['max', MINH, ['min', HRAW, 3.2]], k]];
export const groundTop = k => ['*', ['min', HRAW, 3.2], k];
export const roofTop = k => ['*', ['+', HRAW, 0.6], k];
const W = (a, b) => ['interpolate', ['exponential', 1.6], ['zoom'], 5, Math.min(0.8, a * 0.25), 8, a * 0.6, 12, a, 18, b];
const road = (id, classes, color, w1, w2, minzoom = 5) => ({
  id, type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom,
  filter: ['in', 'class', ...classes],
  layout: { 'line-cap': 'round', 'line-join': 'round' },
  paint: { 'line-color': color, 'line-width': W(w1, w2) }
});
export function buildStyle(k = 2, pal = 'light') {
  const PL = PALETTES[pal] || PALETTES.light;
  return {
    version: 8,
    glyphs: CONFIG.glyphs,
    light: { anchor: 'viewport', color: '#ffffff', intensity: 0.62, position: [1.5, 215, 42] },
    sources: { osm: { type: 'vector', url: CONFIG.tilejson } },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': PL.bg } },
      { id: 'landcover', type: 'fill', source: 'osm', 'source-layer': 'landcover', paint: {
        'fill-color': ['match', ['get', 'class'], ['grass', 'wood', 'forest'], '#d9ecd0', 'farmland', '#e9efd3', 'sand', '#f5ebd2', 'wetland', '#d8ece6', '#eef1ea'], 'fill-opacity': 0.9 } },
      { id: 'landuse', type: 'fill', source: 'osm', 'source-layer': 'landuse', paint: {
        'fill-color': ['match', ['get', 'class'], ['residential', 'suburb', 'neighbourhood'], '#e8e6df', ['commercial', 'retail'], '#f6e3d6', 'industrial', '#e6e4ec', 'cemetery', '#dfe9d9', ['school', 'university', 'college'], '#f3ecd9', 'hospital', '#f7e1e4', '#eceae5'], 'fill-opacity': 0.85 } },
      { id: 'park', type: 'fill', source: 'osm', 'source-layer': 'park', paint: { 'fill-color': PL.park } },
      { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': PL.water } },
      { id: 'waterway', type: 'line', source: 'osm', 'source-layer': 'waterway', paint: { 'line-color': PL.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 16, 7] } },
      { id: 'border-glow', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['==', 'admin_level', 2], paint: { 'line-color': '#d94b6a', 'line-opacity': 0.22, 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 8, 12, 22], 'line-blur': 6 } },
      { id: 'border', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['==', 'admin_level', 2], paint: { 'line-color': '#d94b6a', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 12, 4] } },
      { id: 'province-border', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['==', 'admin_level', 4], minzoom: 5, paint: { 'line-color': '#9aa7b8', 'line-width': 1.2, 'line-dasharray': [3, 2] } },
      road('path', ['path', 'track'], '#9fb3c8', 0.6, 2.4, 14),
      road('road-minor-case', ['minor', 'service'], '#cfd6df', 12, 13, 13),
      road('road-tert-case', ['tertiary'], '#9ec1f0', 6, 22, 10),
      road('road-sec-case', ['secondary'], '#d9b84a', 6, 24, 9),
      road('road-pri-case', ['primary', 'trunk'], '#e39a2b', 5, 32),
      road('road-mw-case', ['motorway'], '#d9563a', 5, 36),
      road('road-minor', ['minor', 'service'], '#ffffff', 10, 9, 13),
      road('road-tert', ['tertiary'], '#e3efff', 4, 18, 10),
      road('road-sec', ['secondary'], '#ffe98a', 4, 20, 9),
      road('road-pri', ['primary', 'trunk'], '#ffbe55', 3.5, 28),
      road('road-mw', ['motorway'], '#ff7f5c', 3.5, 32),
      { id: 'road-center', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 16, filter: ['all', ['in', ['get', 'class'], ['literal', ['trunk', 'primary', 'secondary', 'tertiary']]], ['!=', ['get', 'brunnel'], 'tunnel']], paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 16, 1, 19, 2.5], 'line-dasharray': [3, 3] } },
      { id: 'b3d', type: 'fill-extrusion', source: 'osm', 'source-layer': 'building', minzoom: 13, filter: ['!=', ['get', 'hide_3d'], true], paint: {
        'fill-extrusion-vertical-gradient': true,
        'fill-extrusion-color': ['to-color', ['get', 'colour'], buildingColor(PL)],
        'fill-extrusion-height': heightExpr(k), 'fill-extrusion-base': baseExpr(k), 'fill-extrusion-opacity': 1 } },
      { id: 'b3d-ground', type: 'fill-extrusion', source: 'osm', 'source-layer': 'building', minzoom: 16.5, filter: ['==', MINH, 0], paint: { 'fill-extrusion-color': '#9e968a', 'fill-extrusion-height': groundTop(k), 'fill-extrusion-base': 0, 'fill-extrusion-vertical-gradient': true } },
      { id: 'b3d-roof', type: 'fill-extrusion', source: 'osm', 'source-layer': 'building', minzoom: 15.5, paint: { 'fill-extrusion-color': '#f7f4ee', 'fill-extrusion-height': roofTop(k), 'fill-extrusion-base': heightExpr(k), 'fill-extrusion-vertical-gradient': false } },
      { id: 'building-lines', type: 'line', source: 'osm', 'source-layer': 'building', minzoom: 14.4, paint: { 'line-color': 'rgba(35,45,70,0.5)', 'line-width': ['interpolate', ['linear'], ['zoom'], 14.4, 0.4, 18, 1.3] } },
      { id: 'housenumber', type: 'symbol', source: 'osm', 'source-layer': 'housenumber', minzoom: 17, layout: { 'text-field': ['get', 'housenumber'], 'text-font': F, 'text-size': 11 }, paint: { 'text-color': '#5b6b80', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } },
      { id: 'road-names', type: 'symbol', source: 'osm', 'source-layer': 'transportation_name', minzoom: 12,
        layout: { 'symbol-placement': 'line', 'text-field': nm, 'text-font': F, 'text-size': ['interpolate', ['linear'], ['zoom'], 12.5, 12, 18, 17], 'text-letter-spacing': 0, 'text-max-angle': 35 },
        paint: { 'text-color': '#1f2e44', 'text-halo-color': '#ffffff', 'text-halo-width': 2.6 } },
      { id: 'poi-dots', type: 'circle', source: 'osm', 'source-layer': 'poi', minzoom: 14.5, filter: ['has', 'name'], paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 4, 18, 7], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2,
        'circle-color': ['match', ['get', 'class'], ['shop', 'grocery'], '#d6336c', ['food', 'cafe', 'restaurant', 'fast_food', 'bar'], '#f08c00', ['hospital', 'pharmacy', 'doctors', 'dentist'], '#e03131', 'fuel', '#e8590c', 'bank', '#1098ad', 'place_of_worship', '#2b8a3e', ['school', 'college', 'university'], '#7048e8', ['bus', 'railway', 'station'], '#1d6fe0', ['lodging', 'hotel'], '#ae3ec9', '#8795a8'] } },
      { id: 'poi-names', type: 'symbol', source: 'osm', 'source-layer': 'poi', minzoom: 14.8, filter: ['has', 'name'],
        layout: { 'text-field': nm, 'text-font': FB, 'text-size': ['interpolate', ['linear'], ['zoom'], 15.5, 12.5, 18, 15], 'text-anchor': 'top', 'text-offset': [0, 0.8], 'text-max-width': 7, 'text-letter-spacing': 0, 'text-padding': 4 },
        paint: { 'text-color': '#9a3a07', 'text-halo-color': '#ffffff', 'text-halo-width': 2.4 } },
      { id: 'places', type: 'symbol', source: 'osm', 'source-layer': 'place', filter: ['in', 'class', 'city', 'town', 'suburb', 'village', 'neighbourhood'],
        layout: { 'text-field': nm, 'text-font': FB, 'text-size': ['match', ['get', 'class'], 'city', 21, 'town', 17, 'suburb', 15, 14], 'text-max-width': 8, 'text-letter-spacing': 0 },
        paint: { 'text-color': '#0f1f38', 'text-halo-color': '#ffffff', 'text-halo-width': 2.6 } }
    ]
  };
}
