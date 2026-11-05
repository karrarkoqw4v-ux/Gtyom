// تنزيل خريطة منطقة للاستخدام بدون إنترنت
import { CONFIG } from '../config.js';
import { tileList } from './tiles.js';
const GLYPHS = ['0-255', '256-511', '1536-1791', '1792-2047', '8192-8447', '64256-64511', '64512-64767', '64768-65023', '65024-65279', '65280-65535'];
export async function tileTemplate() {
  const j = await (await fetch(CONFIG.tilejson)).json();
  return j.tiles[0];
}
export const tileUrl = (tpl, [z, x, y]) => tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y);
export const glyphUrls = () => [CONFIG.font[0], CONFIG.fontBold[0]].flatMap(f => GLYPHS.map(r => CONFIG.glyphs.replace('{fontstack}', encodeURIComponent(f)).replace('{range}', r)));

export async function downloadRegion({ bbox, zmin = 5, zmax = 13, onProgress, signal }) {
  const tpl = await tileTemplate();
  const cache = await caches.open(CONFIG.tileCache);
  const tiles = tileList(bbox, zmin, zmax).map(t => tileUrl(tpl, t));
  const all = [CONFIG.tilejson, ...glyphUrls(), ...tiles];
  let i = 0, done = 0, bytes = 0, failed = 0;
  async function worker() {
    while (i < all.length) {
      if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
      const u = all[i++];
      try {
        if (!(await cache.match(u))) {
          const r = await fetch(u, { signal });
          if (r.ok) { bytes += (await r.clone().blob()).size; await cache.put(u, r); } else failed++;
        }
      } catch (e) { if (e.name === 'AbortError') throw e; failed++; }
      done++;
      onProgress?.({ done, total: all.length, bytes });
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  return { count: tiles.length, bytes, failed, template: tpl };
}
