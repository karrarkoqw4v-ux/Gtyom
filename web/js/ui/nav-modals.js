// نوافذ أثناء الملاحة: إضافة محطة بالطريق، وإبلاغ عن شي بالطريق
import { el } from '../core/dom.js';
import { icon } from './icons.js';
import { search } from '../places/search.js';
import { REPORT_TYPES } from '../map/reports.js';
function modal(...kids) {
  const m = el('div', { class: 'iq-modal' }, el('div', { class: 'iq-dlg nm' }, ...kids));
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.append(m); return m;
}
export function showReport(onPick) {
  const m = modal(el('h2', {}, 'إبلاغ عن شي بالطريق'),
    el('div', { class: 'rp-grid' }, ...REPORT_TYPES.map(t => el('button', { class: 'rp', style: `--c:${t.color}`, type: 'button', onclick: () => { onPick(t); m.remove(); } },
      el('span', { class: 'ic' }, icon(t.icon, { size: 24, anim: '' })), t.name))),
    el('button', { class: 'btn block', type: 'button', onclick: () => m.remove() }, 'إلغاء'));
}
export function showAddStop(onPick) {
  const res = el('div', { class: 'list nm-res' }), input = el('input', { class: 'iq-in', type: 'search', placeholder: 'ابحث عن محطة (محل، محطة وقود، مكان)…' });
  const m = modal(el('h2', {}, 'إضافة محطة بالطريق'), input, res, el('button', { class: 'btn block', type: 'button', onclick: () => m.remove() }, 'إلغاء'));
  let t = null;
  input.addEventListener('input', () => {
    clearTimeout(t); if (input.value.trim().length < 2) { res.replaceChildren(); return; }
    t = setTimeout(async () => {
      try {
        const list = await search(input.value.trim());
        res.replaceChildren(...(list.length ? list.map(p => el('button', { class: 'row', onclick: () => { onPick(p); m.remove(); } },
          el('span', { class: 'ic', style: '--c:#2f8f6a' }, icon('pin', { size: 20, anim: '' })), el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, p.address)))) : [el('p', { class: 'muted' }, 'ما لقينا نتائج')]));
      } catch (e) { if (e.name !== 'AbortError') res.replaceChildren(el('p', { class: 'muted' }, 'البحث يحتاج إنترنت')); }
    }, 400);
  });
  setTimeout(() => input.focus(), 50);
}
