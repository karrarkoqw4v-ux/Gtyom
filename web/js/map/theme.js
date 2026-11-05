// ألوان الخريطة والبنايات (ثيمات فاتحة)
export const PALETTES = {
  light: { name: 'فاتح', bg: '#f2f4f1', small: ['#eed0a0', '#e9b9ac', '#c8deab', '#e8d495', '#c0cbec', '#e4c0d4'], tall: ['#c8dcf5', '#9ebfeb', '#6f98dc'], water: '#b3dbf4', park: '#cde8c2' },
  warm:  { name: 'دافئ', bg: '#f7f1e6', small: ['#efd3a6', '#ebc3ac', '#dcd8a8', '#f1dca4', '#e4cdb3', '#ecc7b0'], tall: ['#eedcbc', '#e0bf8e', '#cd9a5c'], water: '#b9d9e8', park: '#d4e5b6' },
  sky:   { name: 'سماوي', bg: '#eaf2fb', small: ['#e7eefb', '#dfeaf7', '#e8f1f5', '#e3e9fa', '#eaf0f7', '#dde7f5'], tall: ['#cfe0f7', '#a9c6ee', '#7fa7e3'], water: '#a9d4f2', park: '#cfe6dc' },
  mint:  { name: 'نعناعي', bg: '#eef6f1', small: ['#e3f3e8', '#dcefe2', '#e9f3dc', '#e0f0ee', '#e8f4ec', '#d9eee4'], tall: ['#d3ecdf', '#aedbc4', '#84c8a8'], water: '#a9dbe6', park: '#c4e6b8' },
  rose:  { name: 'وردي', bg: '#f8f0f2', small: ['#f8e3e8', '#f3dbe6', '#f6e8dc', '#efe0ee', '#f9e6e1', '#f1dde3'], tall: ['#f2d6e0', '#e8b9cd', '#d994b3'], water: '#b8d8ee', park: '#d2e6c4' }
};
export const buildingColor = p => ['case', ['has', 'colour'], ['to-color', ['get', 'colour'], p.small[0]], ['<', ['coalesce', ['get', 'render_height'], 6], 13],
  ['match', ['floor', ['%', ['+', ['to-number', ['id'], 0], ['*', ['coalesce', ['get', 'render_height'], 7], 13]], 6]], 0, p.small[0], 1, p.small[1], 2, p.small[2], 3, p.small[3], 4, p.small[4], p.small[5]],
  ['interpolate', ['linear'], ['get', 'render_height'], 13, p.tall[0], 50, p.tall[1], 150, p.tall[2]]];
export function applyPalette(map, key, keepBuildings = false) {
  const p = PALETTES[key] || PALETTES.light;
  const set = (l, prop, v) => map.getLayer(l) && map.setPaintProperty(l, prop, v);
  set('bg', 'background-color', p.bg); set('water', 'fill-color', p.water); set('waterway', 'line-color', p.water);
  set('park', 'fill-color', p.park); set('mask', 'fill-color', p.bg); if (!keepBuildings) set('b3d', 'fill-extrusion-color', ['to-color', ['get', 'colour'], buildingColor(p)]);
}
