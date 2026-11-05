// تفاصيل المحافظة: أرقام، صور، معلومات، الأقضية والمدن، أماكن، تنزيل ومشاركة
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { openView } from './sheet.js';
import { provinceInfo } from '../provinces/wiki.js';
import { flyTo } from '../map/camera.js';
import { CATEGORIES } from '../places/categories.js';
import { icon } from './icons.js';
import { downloadPack, packs } from '../offline/packs.js';
import { PLACE_QUERY, catOf, reloadPlaces } from '../map/places3d.js';
import { toast } from './toast.js';

const stat = (ic, label, value) => el('div', { class: 'stat' }, icon(ic, { size: 20, anim: '' }), el('b', {}, value), el('small', {}, label));
const nf = n => n.toLocaleString('ar-IQ');

export async function showProvince(p) {
  flyTo(p.lng, p.lat, Math.max(8, 10.5 - p.size * 2), 0);
  const body = el('div', {}, el('div', { class: 'spinner' }));
  openView(`محافظة ${p.name}`, body);
  const cities = el('div', {},
    el('div', { class: 'section' }, `المدن والأقضية (${p.cities.length})`),
    el('div', { class: 'list' }, ...p.cities.map(([n, lng, lat], i) => el('button', { class: 'row', onclick: () => flyTo(lng, lat, 15.8, 62) },
      el('span', { class: 'ic', style: '--c:#1d6fe0' }, icon(i === 0 ? 'city' : 'building', { size: 22, anim: '' })),
      el('span', { class: 'tx' }, el('b', {}, n), el('small', {}, i === 0 ? 'مركز المحافظة' : 'قضاء / مدينة')),
      el('span', { class: 'end' }, icon('chevron', { size: 18, anim: '' }))))));
  const have = packs().find(x => x.name === p.name);
  const bar = el('div', { class: 'bar', hidden: true }, el('span')), stat = el('small', { class: 'muted' }, have ? `محمّل: ${have.count} مكان بـ ${have.cells} ملف` : 'أماكن المحافظة العامة (مستشفيات، جوامع، مولات، حدائق، مواقف، محطات، مدارس) تنحمل بالجهاز وتبين فوراً ثلاثية الأبعاد');
  let ctl = null;
  const packBtn = el('button', { class: 'btn', type: 'button', onclick: async () => {
    if (ctl) { ctl.abort(); return; }
    ctl = new AbortController(); packBtn.replaceChildren(icon('close', { size: 20, anim: '' }), 'إلغاء'); bar.hidden = false;
    try {
      const r = await downloadPack(p, PLACE_QUERY, catOf, { signal: ctl.signal, onProgress: ({ done, total, count }) => { bar.firstChild.style.width = Math.round(done / total * 100) + '%'; stat.textContent = `${done}/${total} ملف · ${count} مكان`; } });
      stat.textContent = `تم: ${r.count} مكان بـ ${r.cells} ملف` + (r.failed ? ` (${r.failed} ملف ما نزل)` : ''); toast('تم تحميل أماكن المحافظة'); reloadPlaces();
    } catch (e) { stat.textContent = e.name === 'AbortError' ? 'انلغى التحميل' : 'فشل التحميل، تأكد من الإنترنت'; }
    ctl = null; bar.hidden = true; packBtn.replaceChildren(icon('download', { size: 20 }), 'حمّل أماكن المحافظة 3D');
  } }, icon('download', { size: 20 }), 'حمّل أماكن المحافظة 3D');
  const actions = el('div', {},
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn primary', onclick: () => flyTo(p.lng, p.lat, 15.8, 62) }, icon('city', { size: 20 }), `ادخل ${p.city}`),
      el('button', { class: 'btn', onclick: () => emit('ui:share', { name: 'محافظة ' + p.name, lng: p.lng, lat: p.lat, address: `${p.city} - العراق` }) }, icon('share', { size: 20, anim: '' }), 'مشاركة')),
    el('div', { class: 'btn-row', style: 'margin-top:8px' }, el('button', { class: 'btn', onclick: () => emit('ui:offline', p) }, icon('download', { size: 20 }), 'حمّل خريطتها')),
    el('div', { class: 'btn-row', style: 'margin-top:8px' }, packBtn), bar, stat,
    cities,
    el('div', { class: 'section' }, `أماكن في ${p.city}`),
    el('div', { class: 'chips' }, ...CATEGORIES.map(c =>
      el('button', { class: 'chip', style: `--c:${c.color}`, onclick: () => emit('ui:nearby', { cat: c.id, at: { lng: p.lng, lat: p.lat } }) },
        el('span', { class: 'chip-ic' }, icon(c.icon, { size: 18, anim: '' })), c.name))));
  try {
    const info = await provinceInfo(p.wiki), f = info.facts || {};
    const text = el('p', { class: 'prose clamp' }, info.text || 'لا توجد معلومات متوفرة حالياً.');
    const more = el('button', { class: 'link', onclick: () => { text.classList.toggle('clamp'); more.textContent = text.classList.contains('clamp') ? 'اقرأ المزيد' : 'أقل'; } }, 'اقرأ المزيد');
    body.replaceChildren(
      info.photos.length ? el('div', { class: 'photos' }, ...info.photos.map(ph => el('img', { src: ph.src, alt: ph.caption || p.name, loading: 'lazy' })))
        : el('div', { class: 'no-photo' }, icon('photo', { size: 36 }), 'ما في صور حالياً'),
      el('div', { class: 'stats' },
        stat('building', 'مركز المحافظة', p.city),
        f.population ? stat('users', 'عدد السكان (تقريبي)', nf(f.population)) : null,
        f.area ? stat('ruler', 'المساحة (كم²)', nf(f.area)) : null,
        stat('city', 'مدن وأقضية', nf(p.cities.length))),
      text, info.text?.length > 220 ? more : null,
      info.url ? el('a', { class: 'link', href: info.url, target: '_blank', rel: 'noopener' }, 'المزيد في ويكيبيديا') : null,
      actions);
  } catch {
    body.replaceChildren(el('p', { class: 'muted' }, 'معلومات المحافظة تحتاج إنترنت.'), actions);
  }
}
