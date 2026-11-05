// الحالة العامة، أي تغيير يطلق حدث state:<key>
import { emit } from './events.js';
import { load } from './storage.js';
const base = {
  vehicle: load('vehicle', 'car'),
  pos: null,
  dest: null,
  start: null,
  route: null,
  navigating: false,
  simulating: false,
  heightScale: load('heightScale', 2),
  voice: load('voice', true)
};
export const state = new Proxy(base, {
  set(t, k, v) { t[k] = v; emit('state:' + k, v); return true; }
});
