// تنزيل خرائط المحافظات أو كل العراق للاستخدام بدون إنترنت
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { load, save } from '../core/storage.js';
import { CONFIG } from '../config.js';
import { openView } from './sheet.js';
import { toast } from './toast.js';
import { PROVINCES, bboxOf } from '../provinces/provinces.js';
import { countTiles, AVG_TILE_BYTES } from '../offline/tiles.js';
import { downloadRegion } from '../offline/downloader.js';
import { regions, addRegion, deleteRegion, storageUsage, fmtBytes } from '../offline/manager.js';
import { persistStorage, isSecure } from '../permissions/permissions.js';
import { icon } from './icons.js';
import { cloudRegions, user } from '../auth/auth.js';

const LEVELS = [{ z: 12, name: 'عادي' }, { z: 13, name: 'تفصيلي' }, { z: 14, name: 'كل الشوارع والبنايات' }];
let busy = null, busyId = null, progress = { pct: 0, text: '' };

export function showOffline(focus) {
  const body = el('div');
  openView('خرائط بدون إنترنت', body);
  draw(body, focus);
}
function items(focus) {
  const b = CONFIG.iraqBounds;
  const iraq = { id: 'iraq', name: 'كل العراق (نظرة عامة)', bbox: [b[0][0], b[0][1], b[1][0], b[1][1]], zmax: 10 };
  const cities = [{ id: 'karbala-city', name: 'كربلاء المقدسة (تفصيل كامل)', bbox: [43.96, 32.56, 44.12, 32.68], zmax: 14 }, { id: 'baghdad-city', name: 'بغداد (تفصيل كامل)', bbox: [44.15, 33.18, 44.6, 33.48], zmax: 14 }];
  const list = PROVINCES.map(p => ({ id: p.name, name: 'محافظة ' + p.name, bbox: bboxOf(p) }));
  if (focus) list.sort((a, c) => (c.id === focus.name) - (a.id === focus.name));
  return [iraq, ...cities, ...list];
}
function draw(body, focus) {
  if (!('caches' in window) || !isSecure()) {
    body.replaceChildren(el('p', { class: 'muted' }, 'التنزيل يحتاج فتح التطبيق من رابط https.'));
    return;
  }
  const Z = load('offZ', 13);
  const usage = el('div', { class: 'muted' }, '…');
  storageUsage().then(u => usage.textContent = `المساحة المستخدمة: ${fmtBytes(u.used)}${u.quota ? ' من ' + fmtBytes(u.quota) : ''}`);
  const have = new Map(regions().map(r => [r.id, r])), cloud = new Map(cloudRegions().map(r => [r.id, r]));
  const rows = items(focus).map(it => {
    const z = it.zmax ?? Z, r = have.get(it.id);
    const size = fmtBytes(countTiles(it.bbox, 5, z) * AVG_TILE_BYTES);
    const isBusy = busyId === it.id;
    const right = isBusy
      ? el('button', { class: 'btn danger sm', onclick: () => busy?.abort() }, 'إلغاء')
      : r ? el('button', { class: 'btn danger sm', 'aria-label': 'حذف', onclick: async () => { await deleteRegion(it.id); toast('تم حذف الخريطة'); draw(body, focus); } }, icon('trash', { size: 18, anim: '' }))
        : el('button', { class: 'btn primary sm', onclick: () => start(it, z, body, focus) }, icon('download', { size: 18, anim: '' }), 'تنزيل');
    return el('div', { class: 'row' },
      el('span', { class: 'ic', style: `--c:${r ? '#12a47b' : '#1d6fe0'}` }, icon(r ? 'check' : isBusy ? 'download' : 'map', { size: 22, anim: isBusy ? 'drop' : '' })),
      el('span', { class: 'tx' }, el('b', {}, it.name),
        el('small', {}, r ? `منزّلة · ${fmtBytes(r.bytes)}` : cloud.has(it.id) ? `محفوظة بحسابك · نزّلها لهذا الجهاز (${fmtBytes(cloud.get(it.id).bytes)})` : `≈ ${size}`),
        isBusy ? el('div', {}, el('div', { class: 'bar' }, el('span', { style: `width:${progress.pct}%` })), el('small', {}, progress.text)) : null),
      right);
  });
  body.replaceChildren(
    usage,
    user ? el('div', { class: 'muted', style: 'font-size:0.8125rem' }, 'تنزيلاتك تنحفظ بحسابك وترجع لك من أي جهاز') : el('button', { class: 'chip', onclick: () => emit('ui:auth') }, 'سجّل دخولك حتى تنحفظ تنزيلاتك بحسابك'),
    el('div', { class: 'section' }, 'مستوى التفاصيل'),
    el('div', { class: 'chips' }, ...LEVELS.map(l => el('button', { class: 'chip' + (l.z === Z ? ' on' : ''), onclick: () => { save('offZ', l.z); draw(body, focus); } }, l.name))),
    el('div', { class: 'list' }, ...rows));
}
async function start(it, z, body, focus) {
  if (busy) return toast('انتظر حتى ينتهي التنزيل الحالي');
  await persistStorage();
  busy = new AbortController(); busyId = it.id; progress = { pct: 0, text: 'جاري البدء…' };
  draw(body, focus);
  try {
    const r = await downloadRegion({
      bbox: it.bbox, zmin: 5, zmax: z, signal: busy.signal,
      onProgress: ({ done, total, bytes }) => {
        progress = { pct: Math.round(done / total * 100), text: `${Math.round(done / total * 100)}% · ${fmtBytes(bytes)}` };
        const bar = body.querySelector('.bar span'), t = body.querySelector('.bar + small');
        if (bar) bar.style.width = progress.pct + '%';
        if (t) t.textContent = progress.text;
      }
    });
    addRegion({ id: it.id, name: it.name, bbox: it.bbox, zmin: 5, zmax: z, count: r.count, bytes: r.bytes, date: Date.now(), template: r.template });
    toast(r.failed ? `تم التنزيل، ${r.failed} جزء ما نزل` : 'تم تنزيل الخريطة');
  } catch (e) {
    toast(e.name === 'AbortError' ? 'تم إلغاء التنزيل' : 'فشل التنزيل، تأكد من الإنترنت');
  } finally { busy = null; busyId = null; draw(body, focus); }
}
