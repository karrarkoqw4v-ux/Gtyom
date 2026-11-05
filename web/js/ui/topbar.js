// شريط البحث في الأعلى
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { search } from '../places/search.js';
import { icon } from './icons.js';
import { canInstall, isStandalone } from './install.js';
import { on } from '../core/events.js';
export function renderTopbar() {
  const top = document.getElementById('top');
  const results = el('div', { class: 'results', hidden: true });
  let timer = null;
  const input = el('input', { type: 'search', placeholder: 'ابحث عن مكان، شارع، سوق، مول…', enterkeyhint: 'search', 'aria-label': 'بحث' });
  const clear = el('button', { class: 'icon-btn', 'aria-label': 'مسح', hidden: true, onclick: () => { input.value = ''; results.hidden = true; clear.hidden = true; } }, icon('close', { size: 18, anim: '' }));
  input.addEventListener('focus', () => { input.blur(); emit('ui:search'); });
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(timer);
    if (input.value.trim().length < 2) { results.hidden = true; return; }
    timer = setTimeout(async () => {
      try {
        const list = await search(input.value.trim());
        results.replaceChildren(...(list.length ? list.map(p => el('button', { onclick: () => { results.hidden = true; input.blur(); emit('ui:place', p); } },
          el('span', { class: 'res-ic' }, icon('pin', { size: 18, anim: '' })), el('span', {}, el('b', {}, p.name), el('small', {}, p.address))))
          : [el('div', { class: 'row muted' }, 'ما لقينا نتائج داخل العراق، جرّب اسم ثاني')]));
        results.hidden = false;
      } catch (e) { if (e.name !== 'AbortError') { results.replaceChildren(el('div', { class: 'row muted' }, 'البحث يحتاج إنترنت')); results.hidden = false; } }
    }, 450);
  });
  top.replaceChildren(
    el('div', { class: 'search' },
      el('div', { class: 'logo' }, icon('pin', { size: 22 })),
      input, clear,
      el('span', { class: 'search-ic' }, icon('search', { size: 20, anim: '' }))),
    results);
  // القائمة العلوية
  const menu = el('div', { class: 'top-menu', hidden: true });
  const item = (ic, t, ev) => el('button', { type: 'button', class: 'tm-item', onclick: () => { menu.hidden = true; emit(ev); } }, el('span', { class: 'ic', style: '--c:#2f8f6a' }, icon(ic, { size: 20, anim: '' })), t);
  menu.append(item('rain', 'الأحوال الجوية', 'ui:weather'), item('layers', 'الطبقات والدليل', 'ui:layers'), item('download', 'التحميلات', 'ui:offline'), item('gear', 'الإعدادات', 'ui:settings'));
  const mb = el('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'القائمة', onclick: () => { menu.hidden = !menu.hidden; } }, icon('menu', { size: 22, anim: '' }));
  top.querySelector('.search').append(mb);
  const ib = el('button', { class: 'top-install', type: 'button', onclick: () => emit('ui:install') }, icon('download', { size: 18, anim: '' }), 'تثبيت التطبيق');
  ib.hidden = isStandalone(); on('install:state', () => { ib.hidden = isStandalone(); });
  top.querySelector('.search').after(ib); top.append(menu);
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.top-menu') && !e.target.closest('.menu-btn')) menu.hidden = true; });
}
