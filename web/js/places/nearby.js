// أقرب الأماكن بأقصى سرعة: من بلاطات الخريطة فوراً، ثم من الكاش، ثم من الإنترنت (بحث متوازي) وتتحدث القائمة تدريجياً
import { queryAround } from './overpass.js';
import { dist } from '../core/geo.js';
import { map } from '../map/map.js';
import { load, save } from '../core/storage.js';
let ctrl = null;
const TTL = 12 * 3600e3;
const ckey = (cat, lng, lat) => `nb:${cat.id}:${lng.toFixed(2)}:${lat.toFixed(2)}`;

// أماكن موجودة أصلاً ببلاطات الخريطة المحمّلة، بدون أي انتظار
function fromTiles(cat, lng, lat) {
  if (!cat.tile || !map.getSource('osm')) return [];
  try {
    const f = ['any', ['in', ['get', 'class'], ['literal', cat.tile.class]], ['in', ['get', 'subclass'], ['literal', cat.tile.sub]]];
    return map.querySourceFeatures('osm', { sourceLayer: 'poi', filter: f }).map(x => {
      const pr = x.properties || {}, c = x.geometry?.coordinates;
      return c && { id: 'tile/' + c.join(','), lng: c[0], lat: c[1], name: pr['name:ar'] || pr.name || cat.one, icon: cat.icon, color: cat.color, cat: cat.id, tags: {} };
    }).filter(Boolean);
  } catch { return []; }
}
const rank = (list, lng, lat) => {
  const seen = new Set();
  return list.map(p => ({ ...p, d: dist([lng, lat], [p.lng, p.lat]) })).sort((a, b) => a.d - b.d)
    .filter(p => { const k = p.name + Math.round(p.d / 40); if (seen.has(k)) return false; seen.add(k); return p.d < 60000; }).slice(0, 30);
};
// الأماكن اللي من OSM (فيها بيانات أكثر) تغلب نظيرتها من البلاطات
const merge = (a, b) => [...b, ...a];

export async function findNearby(cat, lng, lat, onUpdate) {
  ctrl?.abort(); ctrl = new AbortController(); const sig = ctrl.signal, mine = ctrl;
  let net = [], tiles = fromTiles(cat, lng, lat);
  const push = final => { if (mine === ctrl) onUpdate?.(rank(merge(tiles, net), lng, lat), final); };
  const hit = load(ckey(cat, lng, lat), null);
  if (hit && Date.now() - hit.t < TTL) net = hit.list;
  if (tiles.length || net.length) push(false);
  const go = async r => {
    try { const l = await queryAround(cat, lng, lat, r, sig); if (l.length > net.length || !hit) { net = l; push(false); } return l; }
    catch (e) { if (e.name === 'AbortError') throw e; return null; }
  };
  const first = await Promise.all([go(3000), go(12000)]);
  let got = first.some(l => l && l.length >= 3);
  if (!got && !first.some(l => l && l.length)) { const l = await go(35000); got = !!l?.length; }
  if (!first.some(Boolean) && !net.length && !tiles.length) throw new Error('الخادم مشغول، جرّب بعد شوي');
  const slim = net.slice(0, 40);
  if (slim.length) save(ckey(cat, lng, lat), { t: Date.now(), list: slim });
  push(true);
  return rank(merge(tiles, net), lng, lat);
}
