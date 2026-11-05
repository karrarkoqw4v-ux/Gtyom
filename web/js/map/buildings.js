// التحكم بحجم البنايات
import { map } from './map.js';
import { heightExpr, baseExpr, groundTop, roofTop } from './style.js';
import { state } from '../core/state.js';
import { save } from '../core/storage.js';
export function setHeightScale(k) {
  state.heightScale = k; save('heightScale', k);
  if (!map.getLayer('b3d')) return;
  map.setPaintProperty('b3d', 'fill-extrusion-height', heightExpr(k));
  map.setPaintProperty('b3d', 'fill-extrusion-base', baseExpr(k));
  if (map.getLayer('b3d-ground')) map.setPaintProperty('b3d-ground', 'fill-extrusion-height', groundTop(k));
  if (map.getLayer('b3d-roof')) { map.setPaintProperty('b3d-roof', 'fill-extrusion-height', roofTop(k)); map.setPaintProperty('b3d-roof', 'fill-extrusion-base', heightExpr(k)); }
  if (map.getLayer('bridges3d')) { map.setPaintProperty('bridges3d', 'fill-extrusion-height', ['*', ['get', 'top'], k * 0.6]); map.setPaintProperty('bridges3d', 'fill-extrusion-base', ['*', ['get', 'base'], k * 0.6]); }
  ['facade-walls', 'facade-roofs', 'facade-ledges'].forEach(id => {
    if (!map.getLayer(id)) return;
    map.setPaintProperty(id, 'fill-extrusion-height', ['*', ['get', 'top'], k]);
    map.setPaintProperty(id, 'fill-extrusion-base', ['*', ['get', 'base'], k]);
  });
  ['landmarks-3d', 'poi3d', 'gov-3d', 'places3d'].forEach(id => {
    if (!map.getLayer(id)) return;
    map.setPaintProperty(id, 'fill-extrusion-height', ['*', ['get', 'top'], k]);
    map.setPaintProperty(id, 'fill-extrusion-base', ['*', ['get', 'base'], k]);
  });
}
