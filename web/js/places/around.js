// الأماكن القريبة من نقطة (محطات، أسواق، مولات...) بطلب واحد
import { CONFIG } from '../config.js';
import { CATEGORIES, category } from './categories.js';
import { dist } from '../core/geo.js';
const T = {
  fuel: t => t.amenity === 'fuel', bus: t => t.amenity === 'bus_station' || t.public_transport === 'station',
  market: t => t.amenity === 'marketplace' || t.shop === 'supermarket', mall: t => t.shop === 'mall' || t.shop === 'department_store',
  food: t => ['restaurant', 'fast_food', 'cafe'].includes(t.amenity), health: t => ['hospital', 'clinic'].includes(t.amenity),
  pharmacy: t => t.amenity === 'pharmacy', mosque: t => t.amenity === 'place_of_worship' && t.religion === 'muslim',
  bank: t => ['bank', 'atm'].includes(t.amenity), hotel: t => t.tourism === 'hotel'
};
const IDS = Object.keys(T);
let ctrl = null;
export async function fetchAround(lng, lat, radius = 900) {
  ctrl?.abort(); ctrl = new AbortController();
  const parts = IDS.flatMap(id => category(id).q.map(f => `nwr${f}(around:${radius},${lat},${lng});`)).join('');
  const r = await fetch(CONFIG.overpass, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(`[out:json][timeout:25];(${parts});out center 160;`) });
  if (!r.ok) throw new Error('الخادم مشغول');
  const els = (await r.json()).elements, by = {};
  els.forEach(e => {
    const t = e.tags || {}, id = IDS.find(i => T[i](t)), c = id && category(id), p = [e.lon ?? e.center?.lon, e.lat ?? e.center?.lat];
    if (!c || p[0] == null) return;
    (by[id] ||= []).push({ id: e.type + '/' + e.id, lng: p[0], lat: p[1], name: t['name:ar'] || t.name || c.one, icon: c.icon, color: c.color, cat: id, tags: t, d: dist([lng, lat], p) });
  });
  return Object.values(by).flatMap(l => l.sort((a, b) => a.d - b.d).slice(0, 4));
}
