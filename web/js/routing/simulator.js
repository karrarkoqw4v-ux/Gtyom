// محاكاة السير على الطريق لتجربة الملاحة بدون حركة حقيقية
import { cumulative, pointAlong } from '../core/geo.js';
import { pushPosition } from '../location/gps.js';
import { state } from '../core/state.js';
import { vehicle } from '../vehicle/vehicles.js';
let timer = null;
export function simulate(route, speedUp = 3) {
  stopSimulation();
  const cum = cumulative(route.coords), total = cum[cum.length - 1];
  const v = vehicle(state.vehicle).speed * speedUp;
  let s = 0, last = performance.now();
  state.simulating = true;
  timer = setInterval(() => {
    const now = performance.now(); s += v * (now - last) / 1000; last = now;
    const a = pointAlong(route.coords, cum, Math.min(s, total));
    pushPosition({ lng: a.point[0], lat: a.point[1], heading: a.heading, speed: v, acc: 5 });
    if (s >= total) stopSimulation();
  }, 250);
}
export function stopSimulation() {
  if (timer) clearInterval(timer);
  timer = null;
  state.simulating = false;
}
