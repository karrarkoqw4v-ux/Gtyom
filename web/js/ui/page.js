// صفحة كاملة على الشاشة (الإعدادات، البحث، الأحوال الجوية...)، وزر الرجوع بالجهاز يسكّرها
import { el } from '../core/dom.js';
import { icon } from './icons.js';
const stack = [];
export function openPage(title, body, { onClose, cls = '', extra = null, bare = false } = {}) {
  const pg = el('div', { class: 'page ' + cls, role: 'dialog', 'aria-label': title },
    bare ? null : el('div', { class: 'page-head' }, el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'رجوع', onclick: () => closePage() }, icon('back', { size: 22, anim: '' })), el('h2', {}, title), extra),
    el('div', { class: 'page-body' + (bare ? ' bare' : '') }, body));
  document.body.append(pg); stack.push({ pg, onClose });
  history.pushState({ kpage: stack.length }, '');
  requestAnimationFrame(() => pg.classList.add('on'));
  return pg;
}
function pop() {
  const t = stack.pop(); if (!t) return;
  try { t.onClose?.(); } catch (e) { console.error(e); }
  t.pg.classList.remove('on'); setTimeout(() => t.pg.remove(), 220);
}
export function closePage() { if (stack.length) history.back(); }
export const pageOpen = () => stack.length > 0;
window.addEventListener('popstate', () => { while (stack.length > (history.state?.kpage || 0)) pop(); });
