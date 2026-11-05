// إعدادات المستخدم الشخصية (محفوظة بالجهاز)
import { load, save } from './storage.js';
import { emit } from './events.js';
const DEF = { palette: 'light', roadNames: true, poiNames: true, placeNames: true, showCounter: false, landmarks: true, autoAround: true, tilt: 60, voiceRate: 1, anim: true, spin: false, signs: true, autoMove: true, relief: true, satellite: true, facades: true, terrain: false, places3d: true, bridges: true, gfx: 'sharp', bridges: true, trees: true, showFps: false, signals: true, trafficSim: false, extBuildings: false, extBuildingsUrl: '' };
let P = { ...DEF, ...load('prefs', {}) };
export const prefs = () => P;
export function setPref(k, v) { P = { ...P, [k]: v }; save('prefs', P); emit('pref:' + k, v); }
export function resetPrefs() { P = { ...DEF }; save('prefs', P); Object.keys(DEF).forEach(k => emit('pref:' + k, P[k])); }
