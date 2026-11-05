// قائمة المحافظات
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { openView } from './sheet.js';
import { PROVINCES } from '../provinces/provinces.js';
import { icon } from './icons.js';
export function showProvinces() {
  openView('محافظات العراق', el('div', { class: 'list' }, ...PROVINCES.map(p =>
    el('button', { class: 'row', onclick: () => emit('ui:province', p) },
      el('span', { class: 'ic', style: '--c:#1d6fe0' }, icon('map', { size: 22, anim: '' })),
      el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, 'المركز: ' + p.city)),
      el('span', { class: 'end' }, icon('chevron', { size: 18, anim: '' }))))));
}
