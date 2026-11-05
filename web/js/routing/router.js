// حساب الطريق: لكل نوع مركبة (سيارة، دراجة، مشي) بطلب واحد
import { CONFIG } from '../config.js';
import { vehicle } from '../vehicle/vehicles.js';
import { dist } from '../core/geo.js';
const SPEED = { car: null, bike: 4.5, foot: 1.4 };
async function fetchProfile(from, to, profile, via = []) {
  const u = `${CONFIG.osrm[profile]}/${[from, ...via, to].map(q => q.lng + ',' + q.lat).join(';')}?overview=full&geometries=geojson&steps=true&alternatives=false`;
  const r = await fetch(u);
  if (!r.ok) throw new Error('ما قدرنا نحسب الطريق، جرّب بعد شوي');
  const j = await r.json();
  if (j.code !== 'Ok' || !j.routes?.length) throw new Error('ما لقينا طريق لهذا المكان');
  const rt = j.routes[0];
  const steps = rt.legs.flatMap(l => l.steps).map(s => ({
    loc: s.maneuver.location, type: s.maneuver.type, modifier: s.maneuver.modifier,
    exit: s.maneuver.exit, name: s.name || s.ref || '', distance: s.distance, duration: s.duration
  }));
  const sp = SPEED[profile];
  // نكمّل المسار لحد المكان بالضبط (مو بس لأقرب شارع)
  const coords = rt.geometry.coordinates, endPt = [to.lng, to.lat], gap = dist(coords[coords.length - 1], endPt);
  let extra = 0;
  if (gap > 6) { coords.push(endPt); extra = gap; const last = steps[steps.length - 1]; if (last && last.type === 'arrive') last.loc = endPt; }
  rt.distance += extra;
  return { coords, distance: rt.distance, duration: sp ? Math.max(rt.duration, rt.distance / sp) : rt.duration, steps };
}
export const getRoute = (from, to, vehicleKey) => fetchProfile(from, to, vehicle(vehicleKey).profile);
export const getRouteVia = (from, via, to, vehicleKey) => fetchProfile(from, to, vehicle(vehicleKey).profile, via);
export async function getRoutes(from, to) {
  const keys = ['car', 'bike', 'foot'];
  const res = await Promise.allSettled(keys.map(k => fetchProfile(from, to, k)));
  const out = {};
  keys.forEach((k, i) => { if (res[i].status === 'fulfilled') out[k] = res[i].value; });
  if (!Object.keys(out).length) throw (res.find(r => r.status === 'rejected')?.reason || new Error('ما لقينا طريق'));
  return out;
}
// وقت المركبة: الدراجة النارية أسرع شوي من السيارة بالزحمة
export const vehicleDuration = (key, route) => key === 'moto' ? route.duration * 0.85 : route.duration;
