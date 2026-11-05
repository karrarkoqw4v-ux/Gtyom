// معرفة المحافظة من نقطة على الخريطة
import { PROVINCES } from './provinces.js';
import { reverse } from '../places/search.js';
import { dist } from '../core/geo.js';
const norm = s => (s || '').replace(/محافظة|محافظه/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
export async function detectProvince(lng, lat) {
  try {
    const r = await reverse(lng, lat, 5);
    const s = norm(r?.address?.state || r?.address?.province || r?.name);
    const hit = PROVINCES.find(p => s && (norm(p.name) === s || s.includes(norm(p.name)) || norm(p.name).includes(s)));
    if (hit) return hit;
  } catch {}
  return PROVINCES.reduce((a, b) => dist([lng, lat], [a.lng, a.lat]) < dist([lng, lat], [b.lng, b.lat]) ? a : b);
}
