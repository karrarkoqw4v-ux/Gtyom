// تثبيت التطبيق من المتصفح: زر مباشر بأندرويد، وشرح الخطوات بالايفون
import { el } from '../core/dom.js';
import { load, save } from '../core/storage.js';
import { toast } from './toast.js';
import { emit } from '../core/events.js';
import { icon } from './icons.js';
let deferred = null, banner = null;
export const isStandalone = () => !!window.Android || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: minimal-ui)').matches || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canInstall = () => !isStandalone() && (!!deferred || isIOS());
function steps() {
  const m = el('div', { class: 'iq-modal' }, el('div', { class: 'iq-dlg nm' },
    el('h2', {}, 'تثبيت خرطتكم'),
    isIOS()
      ? el('ol', { class: 'inst-steps' }, el('li', {}, 'افتح الموقع من متصفح Safari'), el('li', {}, 'اضغط زر المشاركة بالأسفل'), el('li', {}, 'اختر «إضافة إلى الشاشة الرئيسية»'), el('li', {}, 'اضغط «إضافة»'))
      : el('ol', { class: 'inst-steps' }, el('li', {}, 'افتح الموقع من Chrome (مو من داخل تلغرام أو واتساب)'), el('li', {}, 'اضغط القائمة (ثلاث نقاط) بالأعلى'), el('li', {}, 'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»')),
    el('button', { class: 'btn primary block', type: 'button', onclick: () => m.remove() }, 'تمام')));
  m.addEventListener('click', e => { if (e.target === m) m.remove(); }); document.body.append(m);
}
export async function installApp() {
  if (isStandalone()) return toast('التطبيق مثبّت أصلاً');
  if (deferred) {
    deferred.prompt(); const r = await deferred.userChoice; deferred = null; banner?.remove();
    toast(r.outcome === 'accepted' ? 'تم تثبيت التطبيق' : 'انلغى التثبيت'); return;
  }
  steps();
}
function showBanner() {
  if (banner || isStandalone() || Date.now() - load('installDismissed', 0) < 7 * 864e5) return;
  banner = el('div', { class: 'install-bar' },
    el('span', { class: 'ib-ic' }, icon('download', { size: 22, anim: '' })), el('span', { class: 'ib-tx' }, el('b', {}, 'ثبّت خرطتكم كتطبيق'), el('small', {}, 'أسرع وبملء الشاشة وبدون شريط المتصفح')),
    el('button', { class: 'btn primary sm', type: 'button', onclick: installApp }, 'تثبيت'),
    el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'إغلاق', onclick: () => { save('installDismissed', Date.now()); banner.remove(); banner = null; } }, icon('close', { size: 18, anim: '' })));
  document.body.append(banner);
}
export function initInstall() {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; emit('install:state'); });
  window.addEventListener('appinstalled', () => { deferred = null; banner?.remove(); emit('install:state'); toast('تم تثبيت خرطتكم'); });
}
