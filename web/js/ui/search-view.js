// صفحة البحث: نتائج بالتفاصيل، «المزيد» (مربعات المحطات وغيرها)، وآخر عمليات البحث بالأسفل
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { load, save } from '../core/storage.js';
import { openPage, closePage } from './page.js';
import { search } from '../places/search.js';
import { CATEGORIES } from '../places/categories.js';
import { icon } from './icons.js';
const KEY = 'recentSearches';
export const recents = () => load(KEY, []);
export function addRecent(p) {
  const l = recents().filter(x => !(x.name === p.name && Math.abs(x.lng - p.lng) < 1e-4 && Math.abs(x.lat - p.lat) < 1e-4));
  l.unshift({ name: p.name, address: p.address || '', lng: p.lng, lat: p.lat, t: Date.now() }); save(KEY, l.slice(0, 15));
}
export function showSearch() {
  const input = el('input', { class: 'sv-input', type: 'search', placeholder: 'ابحث عن مكان، شارع، محطة، سوق…', enterkeyhint: 'search', 'aria-label': 'بحث' });
  const clear = el('button', { class: 'icon-btn', type: 'button', hidden: true, 'aria-label': 'مسح', onclick: () => { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); } }, icon('close', { size: 18, anim: '' }));
  const results = el('div', { class: 'list sv-results' });
  const more = el('div', {}), rec = el('div', {});
  const go = (ev, a) => { closePage(); setTimeout(() => emit(ev, a), 60); };
  const pick = p => { addRecent(p); go('ui:place', p); };
  const row = (p, ic = 'pin') => el('button', { class: 'row', type: 'button', onclick: () => pick(p) },
    el('span', { class: 'ic', style: '--c:#2f8f6a' }, icon(ic, { size: 22, anim: '' })),
    el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, p.address || '')), el('span', { class: 'end' }, icon('chevron', { size: 18, anim: '' })));
  const drawMore = () => more.replaceChildren(el('div', { class: 'section' }, 'المزيد'),
    el('div', { class: 'grid sv-grid' }, ...CATEGORIES.map(c => el('button', { class: 'tile', type: 'button', style: `--c:${c.color}`, onclick: () => go('ui:nearby', { cat: c.id }) },
      el('span', { class: 'bub' }, icon(c.icon, { size: 24, anim: '' })), c.name)),
      el('button', { class: 'tile', type: 'button', style: '--c:#1d6fe0', onclick: () => go('ui:provinces') }, el('span', { class: 'bub' }, icon('map', { size: 24, anim: '' })), 'المحافظات'),
      el('button', { class: 'tile', type: 'button', style: '--c:#c99a2e', onclick: () => go('ui:karbala') }, el('span', { class: 'bub' }, icon('mosque', { size: 24, anim: '' })), 'كربلاء'),
      el('button', { class: 'tile', type: 'button', style: '--c:#2f8f6a', onclick: () => go('ui:trip') }, el('span', { class: 'bub' }, icon('route', { size: 24, anim: '' })), 'إنشاء رحلة')));
  const drawRec = () => { const l = recents(); rec.replaceChildren(l.length ? el('div', {},
    el('div', { class: 'sv-rh' }, el('div', { class: 'section', style: 'margin:0' }, 'آخر عمليات البحث'), el('button', { class: 'link', type: 'button', onclick: () => { save(KEY, []); drawRec(); } }, 'مسح الكل')),
    el('div', { class: 'list' }, ...l.map(p => row(p, 'clock')))) : el('p', { class: 'muted', style: 'text-align:center' }, 'ما في عمليات بحث سابقة'));
  };
  let t = null;
  input.addEventListener('input', () => {
    clear.hidden = !input.value; clearTimeout(t);
    const q = input.value.trim();
    if (q.length < 2) { results.replaceChildren(); return; }
    results.replaceChildren(el('div', { class: 'spinner' }));
    t = setTimeout(async () => {
      try { const list = await search(q); results.replaceChildren(...(list.length ? list.map(p => row(p)) : [el('p', { class: 'muted' }, 'ما لقينا نتائج داخل العراق، جرّب اسم ثاني')])); }
      catch (e) { if (e.name !== 'AbortError') results.replaceChildren(el('p', { class: 'muted' }, 'البحث يحتاج إنترنت')); }
    }, 350);
  });
  drawMore(); drawRec();
  openPage('بحث', el('div', {}, el('div', { class: 'search flat sv-box' }, el('span', { class: 'search-ic' }, icon('search', { size: 22, anim: '' })), input, clear), results, more, rec));
  setTimeout(() => input.focus(), 250);
}
