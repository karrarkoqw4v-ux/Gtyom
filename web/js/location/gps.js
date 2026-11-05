// تتبع الموقع الحي من الـ GPS
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { bearing, dist } from '../core/geo.js';
let watchId = null, last = null;

export function startGps() {
  if (watchId != null || !('geolocation' in navigator)) return;
  watchId = navigator.geolocation.watchPosition(onPos, e => emit('gps:error', e), {
    enableHighAccuracy: true, maximumAge: 1000, timeout: 20000
  });
}
export function stopGps() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}
function onPos(p) {
  if (state.simulating) return;
  const c = p.coords, pt = [c.longitude, c.latitude];
  let heading = c.heading;
  if ((heading == null || isNaN(heading)) && last && dist(last, pt) > 3) heading = bearing(last, pt);
  if (heading == null || isNaN(heading)) heading = state.pos?.heading || 0;
  last = pt;
  pushPosition({ lng: pt[0], lat: pt[1], heading, speed: c.speed || 0, acc: c.accuracy });
}
export function pushPosition(pos) {
  state.pos = pos;
  emit('position', pos);
}
