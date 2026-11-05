// الأماكن المحفوظة: البيت والعمل
import { load, save } from '../core/storage.js';
import { emit } from '../core/events.js';
import { pushSaved } from '../auth/auth.js';
export const getSaved = () => load('saved', {});
export function setSaved(key, place) {
  const s = getSaved(); s[key] = place; save('saved', s); emit('saved', s); pushSaved(s);
}
export function clearSaved(key) {
  const s = getSaved(); delete s[key]; save('saved', s); emit('saved', s); pushSaved(s);
}
export const SAVED_LABELS = { home: { name: 'البيت', icon: 'home' }, work: { name: 'العمل', icon: 'work' } };
