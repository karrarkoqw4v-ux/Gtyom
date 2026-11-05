// الصفحة الرئيسية في اللوحة السفلية
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { openView } from './sheet.js';
import { vehiclePicker } from './vehicle-picker.js';
import { CATEGORIES } from '../places/categories.js';
import { getSaved, SAVED_LABELS } from '../location/saved.js';
import { toast } from './toast.js';
import { icon } from './icons.js';
import { user, configured } from '../auth/auth.js';
import { state } from '../core/state.js';
import { requestLocation } from '../permissions/permissions.js';
import { setSaved } from '../location/saved.js';
import { on } from '../core/events.js';
const chip = (ic, text, onclick) => el('button', { class: 'chip', onclick }, icon(ic, { size: 18, anim: '' }), text);
// بطاقة الحساب بأعلى الرئيسية: تفتح الإعدادات
const acctCard = () => el('button', { class: 'acct', onclick: () => emit(user ? 'ui:account' : 'ui:auth') },
  el('span', { class: 'av' }, user?.photo ? el('img', { src: user.photo, alt: '', referrerpolicy: 'no-referrer' }) : (user?.name?.[0] || icon('users', { size: 24, anim: '' }))),
  el('span', { class: 'tx' }, el('b', {}, user?.name || user?.email || 'ضيف'), el('small', {}, user ? 'حسابي' : 'اضغط لتسجيل الدخول أو إنشاء حساب')),
  el('span', { class: 'go', role: 'button', 'aria-label': 'الإعدادات', onclick: e => { e.stopPropagation(); emit('ui:settings'); } }, icon('gear', { size: 24 })));
// مشاركة موقعي الحالي بكل التفاصيل
async function shareMine() {
  if (!state.pos) { const r = await requestLocation(); if (!r.ok) return toast('حدد موقعك أولاً من زر موقعي'); emit('ui:locate'); await new Promise(r2 => setTimeout(r2, 1500)); }
  const p = state.pos; if (!p) return toast('ما قدرنا نحدد موقعك');
  emit('ui:share', { name: 'موقعي الحالي', lng: p.lng, lat: p.lat, acc: p.acc });
}
// البيت/العمل: إذا مو محدد، تختار مكانه على الخريطة وتروح له
function goSaved(k, l) {
  const s = getSaved()[k];
  if (s) return emit('ui:route', s);
  toast(`اضغط على الخريطة لتحديد ${l.name}`, 3500);
  let done = false;
  emit('ui:pick', p => { const pl = { name: l.name, lng: p.lng, lat: p.lat }; setSaved(k, pl); if (!done) { done = true; emit('ui:route', pl); } });
}
on('auth', () => { if (document.querySelector('.acct')) showHome(false); });
export function showHome(mini = true) {
  const saved = getSaved();
  const body = el('div', {},
    acctCard(),
    el('button', { class: 'btn primary block', onclick: () => emit('ui:trip') }, icon('route', { size: 22 }), 'إنشاء رحلة'),
    el('div', { style: 'height:10px' }), vehiclePicker(),
    el('div', { class: 'chips', style: 'margin-top:12px' },
      chip('mosque', 'كربلاء المقدسة', () => emit('ui:karbala')),
      ...Object.entries(SAVED_LABELS).map(([k, l]) => chip(l.icon, l.name, () => goSaved(k, l))),
      chip('share', 'شارك موقعي', shareMine),
      chip('map', 'المحافظات', () => emit('ui:provinces')),
      chip('layers', 'الطبقات', () => emit('ui:layers')),
      chip('gear', 'الإعدادات', () => emit('ui:settings'))),
    el('div', { class: 'section' }, 'اكتشف ما حولك'),
    el('div', { class: 'grid' }, ...CATEGORIES.map((c, i) =>
      el('button', { class: 'tile', style: `--c:${c.color};--d:${i * 0.18}s`, onclick: () => emit('ui:nearby', { cat: c.id }) },
        el('span', { class: 'bub' }, icon(c.icon, { size: 24, anim: 'float' })), c.name))),
    el('button', { class: 'dl-link', type: 'button', onclick: () => emit('ui:offline') }, icon('download', { size: 18, anim: '' }), 'التحميلات (خرائط بدون إنترنت)'));
  openView('وين تريد تروح؟', body, { root: true, mini });
}
