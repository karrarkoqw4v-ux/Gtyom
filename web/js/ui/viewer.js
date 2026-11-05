// عارض الصور بملء الشاشة: تقليب، عدّاد، تحميل الصورة
import { el } from '../core/dom.js';
import { icon } from './icons.js';
import { toast } from './toast.js';
async function download(ph) {
  try {
    const b = await (await fetch(ph.full || ph.src)).blob(), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = (ph.title || 'photo').replace(/[^\w\u0600-\u06FF]+/g, '_').slice(0, 60) + '.jpg'; document.body.append(a); a.click(); a.remove();
    toast('تم تحميل الصورة');
  } catch { window.open(ph.page || ph.full || ph.src, '_blank', 'noopener'); }
}
export function openViewer(list, start = 0) {
  let i = start; const wrap = el('div', { class: 'pv-wrap' }), img = el('img', { class: 'pv-img', alt: '' }), cap = el('div', { class: 'pv-cap' }), cnt = el('div', { class: 'pv-cnt' });
  const show = n => { i = (n + list.length) % list.length; img.src = list[i].src; cap.textContent = list[i].title + (list[i].credit ? ' · ' + list[i].credit : ''); cnt.textContent = `${i + 1} / ${list.length}`; };
  const close = () => { wrap.remove(); document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(i + 1); else if (e.key === 'ArrowRight') show(i - 1); };
  let x0 = null;
  img.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1); });
  wrap.append(el('div', { class: 'pv-top' }, el('button', { class: 'pv-btn', type: 'button', 'aria-label': 'إغلاق', onclick: close }, icon('close', { size: 22, anim: '' })), cnt,
    el('button', { class: 'pv-btn', type: 'button', 'aria-label': 'تحميل', onclick: () => download(list[i]) }, icon('download', { size: 22, anim: '' }))),
    el('button', { class: 'pv-nav r', type: 'button', 'aria-label': 'السابقة', onclick: () => show(i - 1) }, icon('chevron', { size: 28, anim: '', cls: 'flip' })),
    img, el('button', { class: 'pv-nav l', type: 'button', 'aria-label': 'التالية', onclick: () => show(i + 1) }, icon('chevron', { size: 28, anim: '' })), cap);
  document.body.append(wrap); document.addEventListener('keydown', key); show(i);
}
