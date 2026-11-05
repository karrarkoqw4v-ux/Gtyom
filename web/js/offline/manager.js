// إدارة الخرائط المنزّلة: القائمة، الحذف، المساحة
import { CONFIG } from '../config.js';
import { load, save } from '../core/storage.js';
import { tileList } from './tiles.js';
import { tileUrl } from './downloader.js';
import { pushDownloads } from '../auth/auth.js';
export const regions = () => load('regions', []);
export function addRegion(r) { const l = regions().filter(x => x.id !== r.id); l.push(r); save('regions', l); pushDownloads(l); }
export async function deleteRegion(id) {
  const r = regions().find(x => x.id === id);
  if (!r) return;
  const cache = await caches.open(CONFIG.tileCache);
  const keep = new Set(regions().filter(x => x.id !== id)
    .flatMap(o => tileList(o.bbox, o.zmin, o.zmax).map(t => tileUrl(o.template, t))));
  for (const t of tileList(r.bbox, r.zmin, r.zmax)) {
    const u = tileUrl(r.template, t);
    if (!keep.has(u)) await cache.delete(u);
  }
  const rest = regions().filter(x => x.id !== id); save('regions', rest); pushDownloads(rest);
}
export async function storageUsage() {
  try { const e = await navigator.storage.estimate(); return { used: e.usage || 0, quota: e.quota || 0 }; } catch { return { used: 0, quota: 0 }; }
}
export const fmtBytes = b => b > 1e9 ? (b / 1e9).toFixed(1) + ' غيغا' : b > 1e6 ? Math.round(b / 1e6) + ' ميغا' : Math.round(b / 1e3) + ' كيلو';
