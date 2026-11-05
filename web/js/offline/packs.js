// حزم الأماكن العامة ثلاثية الأبعاد لكل محافظة: نجمع الأماكن حول مدن المحافظة ونقسمها لملفات صغيرة (خلية لكل ملف) تنحفظ بالجهاز
import { run } from '../places/overpass.js';
import { load, save } from '../core/storage.js';
const CACHE = 'khartkum-data-v1';
export const PACK_CELL = 0.1;
const url = (i, j) => `${location.origin}/__pack/${i}_${j}.json`;
export async function readCell(i, j) {
  try { const c = await caches.open(CACHE), r = await c.match(url(i, j)); return r ? await r.json() : null; } catch { return null; }
}
async function putCell(i, j, data) {
  const c = await caches.open(CACHE);
  await c.put(url(i, j), new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } }));
}
export const packs = () => load('packs', []);
export function cellsFor(p) {
  const set = new Set();
  p.cities.forEach(([, lng, lat]) => { const i0 = Math.floor((lng - 0.12) / PACK_CELL), i1 = Math.floor((lng + 0.12) / PACK_CELL), j0 = Math.floor((lat - 0.1) / PACK_CELL), j1 = Math.floor((lat + 0.1) / PACK_CELL); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) set.add(i + ':' + j); });
  return [...set].map(k => k.split(':').map(Number));
}
const thin = r => r && r.length > 90 ? r.filter((_, k) => k % Math.ceil(r.length / 90) === 0 || k === r.length - 1) : r;
export async function downloadPack(p, query, catOf, { onProgress, signal } = {}) {
  const cells = cellsFor(p); let done = 0, count = 0, failed = 0, next = 0;
  const worker = async () => {
    while (next < cells.length) {
      if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
      const [i, j] = cells[next++], s = j * PACK_CELL, w = i * PACK_CELL, bb = `(${s},${w},${s + PACK_CELL},${w + PACK_CELL});`;
      try {
        const list = await run(query.map(q => q + bb).join(''), signal, 500, 40);
        const out = list.map(x => ({ id: x.id, lng: x.lng, lat: x.lat, name: x.name, tags: { amenity: x.tags.amenity, shop: x.tags.shop, leisure: x.tags.leisure, tourism: x.tags.tourism, religion: x.tags.religion, office: x.tags.office }, ring: thin(x.ring), cat: catOf(x.tags) })).filter(x => x.cat);
        await putCell(i, j, out); count += out.length;
      } catch (e) { if (e.name === 'AbortError') throw e; failed++; }
      onProgress?.({ done: ++done, total: cells.length, count, failed });
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  const l = packs().filter(x => x.name !== p.name); l.push({ name: p.name, cells: cells.length, count, failed, date: Date.now() }); save('packs', l);
  return { cells: cells.length, count, failed };
}
