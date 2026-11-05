// شاشة الملاحة بتصميم داكن نظيف: لافتة المنعطف، ثم، أزرار المسار/محطة/إبلاغ/الصوت، عدّاد السرعة، بطاقة الوصول
import { el } from '../core/dom.js';
import { emit, on } from '../core/events.js';
import { state } from '../core/state.js';
import { save } from '../core/storage.js';
import { fmtDist, clock } from '../core/geo.js';
const fmtShort = s => { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? m + ' د' : Math.floor(m / 60) + ' س ' + (m % 60) + ' د'; };
import { instruction } from '../routing/instructions.js';
import { stopVoice } from '../voice/voice.js';
import { icon } from './icons.js';
let bottom = null, tools = null, dial = null, free = null, lastArrow = '', off = null;
const banner = document.getElementById('nav-banner');
const tool = (ic, label, fn, cls = '') => el('button', { class: 'nt ' + cls, type: 'button', onclick: fn }, icon(ic, { size: 22, anim: '' }), el('span', {}, label));

export function showNav() {
  document.body.classList.add('navigating'); document.body.classList.remove('nav-free');
  banner.hidden = false; lastArrow = '';
  banner.replaceChildren(el('div', { class: 'nb-main' },
    el('div', { class: 'nb-arrow' }, icon('straight', { size: 40, stroke: 2.6, anim: 'nudge' })),
    el('div', { class: 'nb-info' }, el('div', { class: 'nb-dist' }, '…'), el('div', { class: 'nb-text' }, 'جاري تحديد موقعك'))));
  const voice = tool(state.voice ? 'sound' : 'mute', 'الصوت', () => {
    state.voice = !state.voice; save('voice', state.voice); if (!state.voice) stopVoice();
    voice.replaceChildren(icon(state.voice ? 'sound' : 'mute', { size: 22, anim: '' }), el('span', {}, 'الصوت'));
  });
  tools = el('div', { id: 'nav-tools' }, tool('expand', 'المسار', () => emit('ui:nav-overview')), tool('addpin', 'محطة', () => emit('ui:add-stop')),
    tool('megaphone', 'إبلاغ', () => emit('ui:report'), 'dark'), voice);
  dial = el('div', { id: 'nav-dial' }, el('b', {}, '0'), el('small', {}, 'كم/س'));
  bottom = el('div', { id: 'nav-bottom' },
    el('div', { class: 'eta' }, el('b', {}, '—'), el('small', {}, '')),
    el('button', { class: 'nav-end', type: 'button', onclick: () => emit('ui:endnav') }, 'إنهاء'));
  free = el('div', { id: 'nav-free' },
    el('button', { class: 'nf-go', type: 'button', onclick: () => emit('ui:recenter') }, icon('navigate', { size: 20, anim: '' }), 'متابعة القيادة'),
    tool('expand', 'المسار', () => emit('ui:nav-overview')));
  document.body.append(tools, dial, bottom, free);
  off?.(); off = on('position', p => { const k = Math.round((p.speed || 0) * 3.6); if (dial) dial.querySelector('b').textContent = k; });
}
export function updateNav(p) {
  if (!bottom) return;
  const i = instruction(p.next);
  const after = p.after && p.toNext < 400 ? instruction(p.after) : null;
  const arrowBox = banner.querySelector('.nb-arrow');
  if (arrowBox && lastArrow !== i.arrow) { lastArrow = i.arrow; arrowBox.replaceChildren(icon(i.arrow, { size: 40, stroke: 2.6, anim: 'nudge' })); }
  const d = banner.querySelector('.nb-dist'), t = banner.querySelector('.nb-text');
  if (d) d.textContent = fmtDist(p.toNext);
  if (t) t.textContent = i.text;
  banner.querySelector('.nb-then')?.remove();
  if (after) banner.append(el('div', { class: 'nb-then' }, el('span', {}, 'ثم'), icon(after.arrow, { size: 18, stroke: 2.6, anim: '' })));
  bottom.querySelector('.eta b').textContent = fmtShort(p.eta);
  bottom.querySelector('.eta small').textContent = `${fmtDist(p.remaining)} · الوصول ${clock(p.eta)}`;
}
export function showRecenter(on) { document.body.classList.toggle('nav-free', !!on); }
export function hideNav() {
  document.body.classList.remove('navigating', 'nav-free');
  banner.hidden = true; banner.replaceChildren();
  [bottom, tools, dial, free].forEach(n => n?.remove()); bottom = tools = dial = free = null; off?.(); off = null;
}
