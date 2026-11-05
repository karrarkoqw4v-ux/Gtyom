// إعدادات المستخدم للخريطة
import { map } from './map.js';
import { load, save } from '../core/storage.js';
export const DEFAULTS = { b3d: true, roads: true, poi: true, places: true, shrines: true, tilt: true };
export const prefs = { ...DEFAULTS, ...load('prefs', {}) };
const LAYERS = { b3d: ['b3d'], roads: ['road-names'], poi: ['poi-names'], places: ['places'], shrines: ['shrine-3d', 'shrine-label'] };
export function applyPrefs() {
  for (const [k, ids] of Object.entries(LAYERS)) ids.forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', prefs[k] ? 'visible' : 'none'));
}
export function setPref(k, v) { prefs[k] = v; save('prefs', prefs); applyPrefs(); }
