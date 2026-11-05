// بطاقة المكان: تفاصيل كاملة، اتجاهات، مشاركة، أماكن قريبة، حفظ
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { dist, fmtDist } from '../core/geo.js';
import { openView } from './sheet.js';
import { detailRows } from '../places/details.js';
import { CATEGORIES } from '../places/categories.js';
import { reverseDetails, addressRows, typeLabel, wikiFor } from '../places/info.js';
import { setSaved } from '../location/saved.js';
import { toast } from './toast.js';
import { placePhotos } from '../places/photos.js';
import { reviewsSection } from './reviews-ui.js';
import { openViewer } from './viewer.js';
import { openStatus } from '../places/hours.js';
import { buildingFacts } from '../places/info.js';
import { icon } from './icons.js';

const infoRow = (ic, label, value) => el('div', { class: 'info' }, el('span', { class: 'info-ic' }, icon(ic, { size: 18, anim: '' })), el('div', {}, el('small', { class: 'muted' }, label), el('div', {}, value)));
const strip = p => ({ name: p.name, lng: p.lng, lat: p.lat, address: p.address || '' });

export function showPlace(p) {
  const title = el('div', { class: 'place-title' }, p.name);
  const kind = el('div', { class: 'place-kind' });
  const addr = el('div', { class: 'muted' }, p.address || '');
  const extra = el('div'), wiki = el('div');
  const d = state.pos ? fmtDist(dist([state.pos.lng, state.pos.lat], [p.lng, p.lat])) + ' منك' : '';
  const generic = p.name === 'مكان على الخريطة';
  reverseDetails(p.lng, p.lat).then(async r => {
    if (!r || r.error) return;
    if (!p.address) addr.textContent = r.display_name || '';
    if (generic && r.name) title.textContent = r.name;
    const t = typeLabel(r); if (t) kind.textContent = t;
    extra.replaceChildren(...addressRows(r).map(([l, v]) => infoRow(l === 'الشارع' ? 'road' : l === 'المحافظة' ? 'map' : 'pin', l, v)));
    const w = await wikiFor(r);
    if (w) wiki.replaceChildren(
      w.img ? el('img', { class: 'wiki-img', src: w.img, alt: p.name, loading: 'lazy' }) : null,
      el('p', { class: 'prose clamp', style: 'margin:8px 0' }, w.text),
      w.url ? el('a', { class: 'link', href: w.url, target: '_blank', rel: 'noopener' }, 'المزيد في ويكيبيديا') : null);
  }).catch(() => {});
  const b = p.building;
  const buildInfo = b?.height ? el('div', { class: 'build-card' }, icon('building', { size: 22, anim: '' }),
    el('div', {}, el('b', {}, `ارتفاع البناية ≈ ${Math.round(b.height)} م`), el('small', { class: 'muted' }, `حوالي ${Math.max(1, Math.round(b.height / 3))} طوابق (تقدير من بيانات الخريطة)`))) : null;
  const hs = openStatus(p.tags?.opening_hours);
  const hoursChip = hs ? el('div', { class: 'open-chip ' + (hs.open ? 'ok' : 'no') }, icon('clock', { size: 16, anim: '' }), hs.text) : null;
  const factsBox = el('div');
  if (!p.mine) buildingFacts(p.lng, p.lat).then(rows => { if (rows.length) factsBox.replaceChildren(el('div', { class: 'section' }, 'بيانات البناية (OpenStreetMap)'), ...rows.map(([l, v]) => infoRow('building', l, v))); });
  const photosBox = el('div');
  placePhotos(p).then(list => { if (list.length) photosBox.replaceChildren(
    el('div', { class: 'sv-rh' }, el('div', { class: 'section', style: 'margin:0' }, `صور المكان (${list.length})`), el('button', { class: 'link', type: 'button', onclick: () => openViewer(list, 0) }, 'عرض الكل')),
    el('div', { class: 'photos' }, ...list.map((ph, k) => el('button', { class: 'ph', type: 'button', title: ph.title, onclick: () => openViewer(list, k) }, el('img', { src: ph.src, alt: ph.title, loading: 'lazy' })))),
    el('small', { class: 'muted' }, 'اضغط على الصورة لتكبيرها وتحميلها · من ويكيميديا كومنز')); }).catch(() => {});
  const rows = detailRows(p.tags).map(r => infoRow(r.icon, r.label, r.link ? el('a', { href: r.link, target: '_blank', rel: 'noopener' }, r.value) : r.value));
  const body = el('div', {},
    title, kind, hoursChip, addr, d ? el('div', { class: 'muted dist' }, icon('pin', { size: 16, anim: '' }), d) : null,
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn primary', onclick: () => emit('ui:route', p) }, icon('route', { size: 20 }), 'الاتجاهات'),
      el('button', { class: 'btn', onclick: () => emit('ui:share', p) }, icon('share', { size: 20, anim: '' }), 'مشاركة')),
    el('div', { class: 'btn-row', style: 'margin-top:8px' },
      el('button', { class: 'btn ghost', onclick: () => emit('ui:start-from', p) }, icon('flag', { size: 20, anim: '' }), 'ابدأ من هنا')),
    buildInfo, factsBox, photosBox, wiki, ...rows, extra,
    p.acc ? infoRow('target', 'دقة الموقع', `± ${Math.round(p.acc)} م`) : null,
    infoRow('target', 'الإحداثيات', `${(+p.lat).toFixed(5)} ، ${(+p.lng).toFixed(5)}`),
    reviewsSection(p),
    el('div', { class: 'section' }, 'قريب من هذا المكان'),
    el('div', { class: 'chips' }, ...CATEGORIES.slice(0, 8).map(c =>
      el('button', { class: 'chip', style: `--c:${c.color}`, onclick: () => emit('ui:nearby', { cat: c.id, at: p }) }, el('span', { class: 'chip-ic' }, icon(c.icon, { size: 18, anim: '' })), c.name))),
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn ghost', onclick: () => { setSaved('home', strip(p)); toast('تم حفظه كبيت'); } }, icon('home', { size: 20, anim: '' }), 'احفظه كبيت'),
      el('button', { class: 'btn ghost', onclick: () => { setSaved('work', strip(p)); toast('تم حفظه كعمل'); } }, icon('work', { size: 20, anim: '' }), 'كعمل')));
  openView('تفاصيل المكان', body, { onClose: () => emit('ui:around-clear') });
}
