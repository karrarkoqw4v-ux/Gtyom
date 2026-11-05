// شاشة الترحيب وطلب الصلاحيات أول مرة
import { el } from '../core/dom.js';
import { load, save } from '../core/storage.js';
import { emit } from '../core/events.js';
import { isSecure } from '../permissions/permissions.js';
import { PERM_TEXT } from '../permissions/messages.js';
import { icon } from './icons.js';
import { startIntro, stopIntro } from '../map/camera.js';
const perk = (ic, c, t) => el('div', {}, el('span', { class: 'ic', style: `--c:${c}` }, icon(ic, { size: 22, anim: 'float' })), t);
export function maybeShowGate() {
  const g = document.getElementById('gate');
  if (new URLSearchParams(location.search).has('loc')) return;
  const first = !load('onboarded', false);
  const done = loc => { save('onboarded', true); g.hidden = true; document.body.classList.remove('intro'); emit('ui:intro-end'); if (loc) emit('ui:locate'); };
  document.body.classList.add('intro'); emit('ui:intro');
  g.replaceChildren(...[
    el('div', { class: 'gate-logo' }, icon('pin', { size: 44, stroke: 2.2 })),
    el('h1', { class: 'gate-title' }, 'خرطتكم'),
    el('p', {}, 'خرائط العراق ثلاثية الأبعاد مع اتجاهات صوتية حتى توصل.'),
    isSecure() ? null : el('div', { class: 'warn' }, PERM_TEXT.insecure),
    el('div', { class: 'perks' },
      perk('city', '#1d6fe0', 'بنايات وشوارع ثلاثية الأبعاد'),
      perk('car', '#12a47b', 'اختار سيارة، دراجة، أو مشي'),
      perk('fuel', '#e8590c', 'أقرب المحطات والأسواق والمولات'),
      perk('traffic', '#7048e8', 'إشارات وعلامات مرورية وأحوال جوية')),
    el('button', { class: 'btn primary block', onclick: () => done(first) }, first ? 'ابدأ واسمح بتحديد موقعي' : 'ادخل الخريطة'),
    first ? el('button', { class: 'btn block', style: 'margin-top:10px', onclick: () => done(false) }, 'لاحقاً') : null].filter(Boolean));
  g.hidden = false;
  startIntro();
}
