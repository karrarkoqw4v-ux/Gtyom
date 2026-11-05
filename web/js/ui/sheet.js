// اللوحة السفلية: تنزل وتصعد بالسحب حتى تشوف الخريطة
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { icon } from './icons.js';
const root = document.getElementById('sheet');
const stack = [];
export function openView(title, body, { root: isRoot = false, onClose, mini = false } = {}) {
  if (isRoot) stack.length = 0;
  stack.push({ title, body, onClose });
  render(); setMini(mini);
}
export function back() {
  if (stack.length <= 1) return;
  stack.pop().onClose?.();
  render(); emit('sheet:back');
}
export function goHome() { while (stack.length > 1) stack.pop().onClose?.(); render(); }
export function setMini(on) { root.classList.toggle('mini', on); }
export const isMini = () => root.classList.contains('mini');

// السحب للأسفل يصغّر، للأعلى يكبّر
let y0 = null;
root.addEventListener('touchstart', e => { if (e.target.closest('.sheet-head')) y0 = e.touches[0].clientY; }, { passive: true });
root.addEventListener('touchend', e => {
  if (y0 == null) return;
  const dy = e.changedTouches[0].clientY - y0; y0 = null;
  if (dy > 30) setMini(true); else if (dy < -30) setMini(false);
});

function render() {
  const v = stack[stack.length - 1];
  if (!v) return;
  root.replaceChildren(
    el('div', { class: 'sheet-head', onclick: e => { if (!e.target.closest('button')) setMini(!isMini()); } },
      el('button', { class: 'sheet-grip', 'aria-label': 'إنزال أو رفع اللوحة', onclick: () => setMini(!isMini()) }),
      stack.length > 1 ? el('button', { class: 'icon-btn', 'aria-label': 'رجوع', onclick: back }, icon('back', { size: 20, anim: '' })) : null,
      el('h2', {}, v.title),
      el('button', { class: 'icon-btn', 'aria-label': 'إنزال اللوحة', onclick: () => setMini(!isMini()) }, icon('chevron', { size: 20, anim: '', cls: 'rot' }))),
    el('div', { class: 'sheet-body' }, v.body));
}
