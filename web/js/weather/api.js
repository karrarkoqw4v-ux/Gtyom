// جلب الطقس الحقيقي: Open-Meteo (النماذج والغبار)، RainViewer (الرادار)، OpenStreetMap (مكاتب الأرصاد). بدون أي بيانات تجريبية
import { PROVINCES } from '../provinces/provinces.js';
import { load, save } from '../core/storage.js';
import { runLite } from '../places/overpass.js';
const OM = 'https://api.open-meteo.com/v1/forecast', AQ = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const qs = o => Object.entries(o).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
const arr = j => Array.isArray(j) ? j : [j];
async function cached(key, ttl, fn) {
  const c = load(key, null);
  if (c && Date.now() - c.t < ttl) return c.v;
  try { const v = await fn(); save(key, { t: Date.now(), v }); return v; } catch (e) { if (c) return c.v; throw e; }
}
// كل طلب له مهلة 10 ثواني حتى ما يعلّق الجلب
async function get(url, ms = 10000) { const c = new AbortController(), t = setTimeout(() => c.abort(), ms); try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error('weather ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
// آخر بيانات محفوظة حتى تظهر فوراً قبل ما يوصل الجديد
export const peek = key => load(key, null)?.v || null;
export const fetchProvinces = () => cached('wx:prov2', 8 * 60e3, async () => arr(await get(`${OM}?` + qs({
  latitude: PROVINCES.map(p => p.lat).join(','), longitude: PROVINCES.map(p => p.lng).join(','), timezone: 'Asia/Baghdad', wind_speed_unit: 'kmh', forecast_days: 5,
  current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day',
  hourly: 'temperature_2m,precipitation,precipitation_probability,weather_code,wind_gusts_10m,visibility,uv_index,is_day', daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_gusts_10m_max,sunrise,sunset' }))));
export const fetchDust = () => cached('wx:dust2', 20 * 60e3, async () => arr(await get(`${AQ}?` + qs({
  latitude: PROVINCES.map(p => p.lat).join(','), longitude: PROVINCES.map(p => p.lng).join(','), timezone: 'Asia/Baghdad', current: 'dust,pm10,pm2_5,us_aqi' }))));
// شبكة دقيقة كل 0.4 درجة (حوالي 40 كم) تغطي العراق والكويت
const GRID = []; for (let la = 29.0; la <= 37.45; la += 0.4) for (let lo = 38.8; lo <= 48.65; lo += 0.4) GRID.push([+lo.toFixed(2), +la.toFixed(2)]);
export const fetchGrid = () => cached('wx:grid2', 8 * 60e3, async () => {
  const parts = []; for (let i = 0; i < GRID.length; i += 100) parts.push(GRID.slice(i, i + 100));
  // كل الأجزاء بنفس الوقت (أسرع بكثير)
  const res = await Promise.all(parts.map(part => get(`${OM}?` + qs({ latitude: part.map(g => g[1]).join(','), longitude: part.map(g => g[0]).join(','), current: 'precipitation,weather_code,wind_gusts_10m,cloud_cover', timezone: 'Asia/Baghdad' })).then(arr)));
  return res.flatMap((j, pi) => j.map((x, k) => ({ lng: parts[pi][k][0], lat: parts[pi][k][1], p: x.current?.precipitation || 0, code: x.current?.weather_code, gust: x.current?.wind_gusts_10m || 0, cloud: x.current?.cloud_cover || 0 })));
});
export async function fetchRadar() {
  const j = await get('https://api.rainviewer.com/public/weather-maps.json');
  const frames = [...(j.radar?.past || []).slice(-6), ...(j.radar?.nowcast || []).slice(0, 3)].map((f, i, a) => ({ ...f, future: i >= a.length - (j.radar?.nowcast || []).slice(0, 3).length && (j.radar?.nowcast || []).length > 0 }));
  if (!frames.length) throw new Error('no radar');
  return { host: j.host, frames };
}
export const fetchOffices = () => cached('wx:offices', 14 * 864e5, async () => {
  const bb = '(28.4,38.0,37.9,49.3);';
  const list = await runLite(`nwr["name"~"الأنواء الجوية|الانواء الجوية|الأرصاد|Meteorolog",i]${bb}nwr["man_made"="monitoring_station"]["monitoring:weather"="yes"]${bb}`, null, 120, 40);
  return list.map(p => ({ id: p.id, lng: p.lng, lat: p.lat, name: p.name || 'محطة أرصاد' }));
});
