// إنشاء رحلة: أولاً تحدد وين تروح، بعدها تختار المركبة وتبدأ
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { openView } from './sheet.js';
import { search } from '../places/search.js';
import { PROVINCES } from '../provinces/provinces.js';
import { getSaved, SAVED_LABELS } from '../location/saved.js';
import { toast } from './toast.js';
import { icon } from './icons.js';

export function showTrip() {
  const T = { from: null, to: null };
  const field = (key, ph, ic) => {
    const res = el('div', { class: 'results', hidden: true, style: 'margin-top:6px;max-height:30vh;max-height:30dvh' });
    const input = el('input', { type: 'search', placeholder: ph, 'aria-label': ph });
    const set = p => { T[key] = p; input.value = p ? p.name : ''; res.hidden = true; };
    let t = null;
    input.addEventListener('input', () => {
      T[key] = null; clearTimeout(t);
      if (input.value.trim().length < 2) { res.hidden = true; return; }
      t = setTimeout(async () => {
        try {
          const list = await search(input.value.trim());
          res.replaceChildren(...(list.length ? list.map(p => el('button', { onclick: () => set(p) }, el('span', { class: 'res-ic' }, icon('pin', { size: 18, anim: '' })), el('span', {}, el('b', {}, p.name), el('small', {}, p.address)))) : [el('div', { class: 'row muted' }, 'ما لقينا نتائج')]));
          res.hidden = false;
        } catch (e) { if (e.name !== 'AbortError') toast('البحث يحتاج إنترنت'); }
      }, 450);
    });
    return { set, input, box: el('div', {}, el('div', { class: 'search flat' }, el('span', { class: 'search-ic' }, icon(ic, { size: 22, anim: '' })), input), res) };
  };
  const to = field('to', 'ابحث: محافظة، منطقة، شارع، فندق…', 'flag');
  const from = field('from', 'نقطة البداية', 'target');
  const fromWrap = el('div', { hidden: true }, from.box,
    el('div', { class: 'chips', style: 'margin-top:6px' },
      el('button', { class: 'chip', onclick: () => { from.set(null); from.input.value = ''; fromWrap.hidden = true; fromRow.hidden = false; } }, icon('target', { size: 18, anim: '' }), 'موقعي'),
      el('button', { class: 'chip', onclick: () => emit('ui:pick', p => from.set(p)) }, icon('pin', { size: 18, anim: '' }), 'من الخريطة')));
  const fromRow = el('div', { class: 'switch' }, el('span', { class: 'lbl' }, icon('target', { size: 20, anim: '' }), 'الانطلاق من: موقعي الحالي'),
    el('button', { class: 'chip', onclick: () => { fromWrap.hidden = false; fromRow.hidden = true; from.input.focus(); } }, 'غيّر'));
  const saved = getSaved();
  const chips = el('div', { class: 'chips' },
    ...Object.entries(SAVED_LABELS).filter(([k]) => saved[k]).map(([k, l]) => el('button', { class: 'chip', onclick: () => to.set(saved[k]) }, icon(l.icon, { size: 18, anim: '' }), l.name)),
    el('button', { class: 'chip', onclick: () => emit('ui:pick', p => to.set(p)) }, icon('pin', { size: 18, anim: '' }), 'اختر من الخريطة'),
    ...PROVINCES.map(p => el('button', { class: 'chip', onclick: () => to.set({ name: p.city + ' - ' + p.name, lng: p.lng, lat: p.lat }) }, p.name)));
  const body = el('div', {},
    el('div', { class: 'field-label' }, 'وين تريد تروح؟'), to.box, chips,
    el('div', { style: 'height:6px' }), fromRow, fromWrap,
    el('button', { class: 'btn primary block', style: 'margin-top:16px', onclick: () => {
      if (!T.to) { toast('حدد وجهتك أولاً'); return; }
      emit('ui:trip-go', { from: fromWrap.hidden ? null : T.from, to: T.to });
    } }, 'التالي: اختر المركبة', icon('back', { size: 20, anim: '' })));
  openView('إنشاء رحلة', body);
}
