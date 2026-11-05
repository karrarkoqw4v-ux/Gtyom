// البحث عن الأماكن والعناوين داخل العراق فقط
import { CONFIG } from '../config.js';
let ctrl = null;
const url = (path, params) => {
  const u = new URL(CONFIG.nominatim + path);
  Object.entries({ format: 'jsonv2', 'accept-language': 'ar', ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  return u;
};
const cache = new Map();
const nominatim = async (q, signal) => {
  const r = await fetch(url('/search', { q, countrycodes: 'iq,kw', limit: 8, addressdetails: 1 }), { signal });
  return (await r.json()).map(x => ({ name: x.name || x.display_name.split(/[،,]/)[0], address: x.display_name, lng: +x.lon, lat: +x.lat, type: x.type }));
};
const photon = async (q, signal) => {
  const u = new URL('https://photon.komoot.io/api/'); u.searchParams.set('q', q); u.searchParams.set('limit', '8'); u.searchParams.set('bbox', '38,28.4,49.3,37.9');
  const j = await (await fetch(u, { signal })).json();
  return (j.features || []).filter(f => ['IQ', 'KW'].includes(f.properties?.countrycode)).map(f => { const p = f.properties; return { name: p.name || p.street || p.city || '', address: [p.name, p.street, p.district, p.city, p.state].filter(Boolean).join('، '), lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], type: p.osm_value }; }).filter(p => p.name);
};
// نسأل Nominatim وPhoton بنفس الوقت ونأخذ أول جواب فيه نتائج (أسرع وأقل أخطاء)
export async function search(q) {
  if (cache.has(q)) return cache.get(q);
  ctrl?.abort(); ctrl = new AbortController(); const sig = ctrl.signal;
  const res = await Promise.any([nominatim(q, sig), photon(q, sig)].map(p => p.then(r => { if (!r.length) throw new Error('empty'); return r; }))).catch(() => []);
  if (sig.aborted) throw Object.assign(new Error('abort'), { name: 'AbortError' });
  if (res.length) cache.set(q, res);
  return res;
}
export async function reverse(lng, lat, zoom = 18) {
  const r = await fetch(url('/reverse', { lat, lon: lng, zoom, addressdetails: 1 }));
  return r.json();
}
