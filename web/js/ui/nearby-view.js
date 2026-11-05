// قائمة أقرب المحطات والأسواق والمولات... تظهر النتائج فوراً وتتحدث تدريجياً مع مجسمات ثلاثية الأبعاد
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { fmtDist } from '../core/geo.js';
import { openView, setMini } from './sheet.js';
import { findNearby } from '../places/nearby.js';
import { showPois, clearPois } from '../map/poi-markers.js';
import { overview } from '../map/camera.js';
import { icon } from './icons.js';

export async function showNearby(cat, at) {
  const body = el('div', {}, el('div', { class: 'spinner', 'aria-label': 'جاري البحث' }));
  openView(`أقرب ${cat.name}`, body, { onClose: clearPois });
  let framed = false, shown = false;
  const draw = (list, final) => {
    if (!list.length) return;
    shown = true;
    showPois(list, p => emit('ui:place', p), { three: true });
    if (!framed) { framed = true; overview([[at.lng, at.lat], ...list.slice(0, 10).map(p => [p.lng, p.lat])], Math.round(innerHeight * 0.5)); }
    body.replaceChildren(
      !final ? el('div', { class: 'muted', style: 'font-size:0.8125rem;margin-bottom:6px' }, 'جاري تحديث النتائج…') : null,
      el('div', { class: 'list' }, ...list.map(p =>
        el('button', { class: 'row', onclick: () => { setMini(false); emit('ui:place', p); } },
          el('span', { class: 'ic', style: `--c:${cat.color}` }, icon(cat.icon, { size: 22, anim: '' })),
          el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, p.tags?.['addr:street'] || p.tags?.opening_hours || cat.one)),
          el('span', { class: 'end' }, fmtDist(p.d))))));
  };
  try {
    const list = await findNearby(cat, at.lng, at.lat, draw);
    if (!list.length) body.replaceChildren(el('p', { class: 'muted' }, `ما لقينا ${cat.name} قريبة. قرّب الخريطة على منطقة ثانية وجرّب.`));
  } catch (e) {
    if (e.name === 'AbortError' || shown) return;
    body.replaceChildren(el('p', { class: 'muted' }, e.message || 'تعذّر البحث، تأكد من الإنترنت'),
      el('button', { class: 'btn block', onclick: () => showNearby(cat, at) }, 'أعد المحاولة'));
  }
}
