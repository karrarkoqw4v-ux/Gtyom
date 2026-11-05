// كربلاء المقدسة: الحرمان والفنادق ثلاثية الأبعاد بأسمائها وتفاصيلها
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { dist, fmtDist } from '../core/geo.js';
import { openView } from './sheet.js';
import { SHRINES, shrinePos } from '../map/landmarks.js';
import { flyTo } from '../map/camera.js';
import { queryAround } from '../places/overpass.js';
import { category } from '../places/categories.js';
import { showPois, clearPois } from '../map/poi-markers.js';
import { icon } from './icons.js';

export async function showKarbala() {
  const hc = shrinePos('hussein');
  flyTo(hc[0], hc[1], 17.2, 65, 28);
  const hotels = el('div', {}, el('div', { class: 'spinner' }));
  const body = el('div', {},
    el('div', { class: 'section', style: 'margin-top:4px' }, 'الحرمان الشريفان'),
    el('div', { class: 'list' }, ...SHRINES.map(s => el('button', { class: 'row', onclick: () => { const c = shrinePos(s.id); flyTo(c[0], c[1], 18.2, 68, 28); } },
      el('span', { class: 'ic', style: '--c:#c99a2e' }, icon('mosque', { size: 24 })),
      el('span', { class: 'tx' }, el('b', {}, s.name), el('small', {}, 'اضغط لعرضه ثلاثي الأبعاد')),
      el('span', { class: 'end' }, icon('chevron', { size: 18, anim: '' }))))),
    el('div', { class: 'section' }, 'الفنادق القريبة من الحرمين'), hotels);
  openView('كربلاء المقدسة', body, { onClose: clearPois });
  try {
    const cat = category('hotel');
    const list = (await queryAround(cat, hc[0], hc[1], 2500)).map(p => ({ ...p, d: dist(hc, [p.lng, p.lat]) })).sort((a, b) => a.d - b.d).slice(0, 40);
    if (!list.length) { hotels.replaceChildren(el('p', { class: 'muted' }, 'ما لقينا فنادق مسجّلة بالخريطة قرب الحرم.')); return; }
    showPois(list, p => emit('ui:place', p), { labels: true });
    hotels.replaceChildren(el('div', { class: 'list' }, ...list.map(p => el('button', { class: 'row', onclick: () => emit('ui:place', p) },
      el('span', { class: 'ic', style: `--c:${cat.color}` }, icon('hotel', { size: 22, anim: '' })),
      el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, [p.tags.stars ? p.tags.stars + ' نجوم' : '', p.tags.phone || ''].filter(Boolean).join(' · ') || 'فندق')),
      el('span', { class: 'end' }, fmtDist(p.d))))));
  } catch { hotels.replaceChildren(el('p', { class: 'muted' }, 'الفنادق تحتاج إنترنت.')); }
}
