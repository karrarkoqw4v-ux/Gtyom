// اختيار المركبة بعد تحديد الوجهة: وقت ومسافة لكل مركبة، ثم ابدأ الرحلة
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { save } from '../core/storage.js';
import { fmtDist, fmtTime, clock } from '../core/geo.js';
import { openView } from './sheet.js';
import { VEHICLES, vehicle } from '../vehicle/vehicles.js';
import { vehicleDuration } from '../routing/router.js';
import { instruction } from '../routing/instructions.js';
import { clearRoute } from '../map/route-layer.js';
import { icon } from './icons.js';

export function showRouteLoading(dest) {
  openView('جاري حساب الطريق…', el('div', {}, el('div', { class: 'spinner' }), el('p', { class: 'muted', style: 'text-align:center' }, dest.name)), { onClose: clearRoute });
}
export function showRoute(routes, from, dest) {
  const avail = k => routes[vehicle(k).profile];
  let cur = avail(state.vehicle) ? state.vehicle : Object.keys(VEHICLES).find(avail);
  const cards = el('div', { class: 'vcards' }), sum = el('div'), steps = el('div', { class: 'list', hidden: true });
  const draw = () => {
    const r = avail(cur), dur = vehicleDuration(cur, r);
    cards.replaceChildren(...Object.entries(VEHICLES).map(([k, v]) => {
      const rr = avail(k);
      return el('button', { class: 'vcard' + (k === cur ? ' on' : ''), disabled: !rr, onclick: () => {
        cur = k; state.vehicle = k; save('vehicle', k); emit('ui:route-chosen', { key: k, route: avail(k) }); draw();
      } }, icon(v.icon, { size: 32, anim: k === cur ? 'drive' : '' }), el('b', {}, v.name),
        el('small', {}, rr ? fmtTime(vehicleDuration(k, rr)) : 'غير متاح'), rr ? el('small', {}, fmtDist(rr.distance)) : null);
    }));
    sum.replaceChildren(
      el('div', { class: 'route-sum' }, el('span', { class: 'big-time' }, fmtTime(dur)), el('span', { class: 'muted' }, `${fmtDist(r.distance)} · الوصول ${clock(dur)}`)),
      el('div', { class: 'route-ends' },
        el('div', {}, el('span', { class: 'dot' }), from.name || 'موقعي'),
        el('div', {}, el('span', { class: 'dot end' }), dest.name)));
    steps.replaceChildren(...r.steps.map(s => {
      const i = instruction(s);
      return el('div', { class: 'row' }, el('span', { class: 'ic', style: '--c:#0f3d8a' }, icon(i.arrow, { size: 22, anim: '' })), el('span', { class: 'tx' }, el('b', {}, i.text)), el('span', { class: 'end' }, s.distance ? fmtDist(s.distance) : ''));
    }));
  };
  draw();
  const body = el('div', {},
    el('div', { class: 'section', style: 'margin-top:2px' }, 'اختر المركبة'), cards, sum,
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn go', onclick: () => emit('ui:start', { sim: false }) }, icon('play', { size: 20 }), 'ابدأ الرحلة'),
      el('button', { class: 'btn', onclick: () => emit('ui:start', { sim: true }) }, icon('film', { size: 20, anim: '' }), 'جرّب الطريق')),
    el('button', { class: 'link', onclick: e => { steps.hidden = !steps.hidden; e.currentTarget.textContent = steps.hidden ? 'عرض كل الخطوات' : 'إخفاء الخطوات'; } }, 'عرض كل الخطوات'),
    steps);
  openView(`إلى ${dest.name}`, body, { onClose: clearRoute });
}
