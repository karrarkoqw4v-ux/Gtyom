// اتجاه الجهاز (البوصلة) عند الوقوف
import { emit } from '../core/events.js';
let on = false;
export function startCompass() {
  if (on) return; on = true;
  const h = e => {
    const v = e.webkitCompassHeading ?? (e.absolute && e.alpha != null ? 360 - e.alpha : null);
    if (v != null) emit('compass', v);
  };
  window.addEventListener('deviceorientationabsolute', h);
  window.addEventListener('deviceorientation', h);
}
