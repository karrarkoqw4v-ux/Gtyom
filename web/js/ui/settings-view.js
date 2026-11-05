// الإعدادات الكاملة للمستخدم
import { el } from '../core/dom.js';
import { state } from '../core/state.js';
import { save } from '../core/storage.js';
import { prefs, setPref, resetPrefs } from '../core/prefs.js';
import { emit, on } from '../core/events.js';
import { APP_VERSION } from '../config.js';
import { openPage } from './page.js';
import { toast } from './toast.js';
import { icon } from './icons.js';
import { map } from '../map/map.js';
import { setHeightScale } from '../map/buildings.js';
import { PALETTES, applyPalette } from '../map/theme.js';
import { speak, hasArabicVoice } from '../voice/voice.js';
import { getSaved, setSaved, clearSaved, SAVED_LABELS } from '../location/saved.js';
import { locationState, requestLocation, persistStorage, compassPermission } from '../permissions/permissions.js';
import { PERM_TEXT } from '../permissions/messages.js';
import { startCompass } from '../location/heading.js';
import { forceUpdate } from '../update.js';
import { user, signOut } from '../auth/auth.js';

const lbl = (ic, text, sub) => el('span', { class: 'lbl' }, el('span', { class: 'ic', style: '--c:#1d6fe0' }, icon(ic, { size: 20, anim: '' })), el('span', {}, text, sub ? el('br') : null, sub || null));
const sec = t => el('div', { class: 'section' }, t);
export function showSettings() { const body = el('div'); openPage('الإعدادات', body); draw(body); const off = on('auth', () => { if (body.isConnected) draw(body); else off(); }); }

function draw(body) {
  const P = prefs(), saved = getSaved(), redraw = () => draw(body);
  const sw = (ic, text, key, after) => el('div', { class: 'switch' }, lbl(ic, text),
    el('button', { class: 'chip' + (P[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(P[key]), onclick: () => { setPref(key, !P[key]); after?.(!P[key]); redraw(); } }, P[key] ? 'شغّال' : 'مطفي'));
  const opts = (items, cur, fn) => el('div', { class: 'chips' }, ...items.map(([v, t]) => el('button', { class: 'chip' + (cur === v ? ' on' : ''), onclick: () => { fn(v); redraw(); } }, t)));
  const locTxt = el('small', { class: 'muted' }, '…');
  locationState().then(s => locTxt.textContent = s === 'granted' ? 'مسموح' : s === 'denied' ? 'مرفوض' : 'غير محدد');
  body.replaceChildren(
    sec('الحساب'),
    el('div', { class: 'acct-box' },
      user ? el('div', {}, el('b', {}, user.name || 'حسابك'), el('br'), el('small', { class: 'muted' }, user.email), el('p', { class: 'muted', style: 'font-size:0.8125rem;margin:6px 0 10px' }, 'تنزيلاتك وأماكنك محفوظة بحسابك'),
          el('button', { class: 'btn sm', style: 'margin-inline-end:8px', onclick: () => emit('ui:account') }, 'إدارة الحساب'),
          el('button', { class: 'btn danger sm', onclick: async () => { await signOut(); toast('تم تسجيل الخروج'); redraw(); } }, 'تسجيل الخروج'))
      : el('div', {}, el('p', { class: 'muted', style: 'font-size:0.8438rem;margin:0 0 10px' }, 'سجّل دخولك حتى تنحفظ تنزيلاتك وأماكنك بحسابك وترجع لك من أي جهاز'),
          el('button', { class: 'btn primary block', onclick: () => emit('ui:auth') }, 'تسجيل الدخول / إنشاء حساب'))),
    sec('ألوان الخريطة'),
    opts(Object.entries(PALETTES).map(([k, v]) => [k, v.name]), P.palette, k => { setPref('palette', k); applyPalette(map, k, prefs().satellite); }),
    sec('حجم البنايات'),
    opts([[1, '×1'], [2, '×2'], [3, '×3']], state.heightScale, setHeightScale),
    sec('زاوية الكاميرا بالملاحة'),
    opts([[45, 'مرتفعة'], [60, 'متوسطة'], [72, 'قريبة من الشارع']], P.tilt, v => setPref('tilt', v)),
    sec('ما يظهر على الخريطة'),
    sw('road', 'أسماء الشوارع', 'roadNames', v => vis('road-names', v)),
    sw('tag', 'أسماء الأماكن', 'poiNames', v => vis('poi-names', v)),
    sw('city', 'أسماء المدن والمناطق', 'placeNames', v => vis('places', v)),
    sw('mosque', 'الحرمان والقصور والمجالس بالثلاثي الأبعاد', 'landmarks'),
    sw('compass', 'دوران العراق ثلاثي الأبعاد عند الفتح', 'spin'),
    sw('houses', 'عدّاد البيوت', 'showCounter'),
    sw('pin', 'إظهار الأماكن القريبة عند اختيار مكان', 'autoAround'),
    sw('cube', 'الحركات والأنيميشن', 'anim', v => document.body.classList.toggle('no-anim', !v)),
    sec('الصوت'),
    sw('sound', 'التوجيه الصوتي', 'voice'),
    opts([[0.8, 'بطيء'], [1, 'عادي'], [1.2, 'سريع']], P.voiceRate, v => setPref('voiceRate', v)),
    el('button', { class: 'btn block', style: 'margin-top:8px', onclick: () => {
      speak('بعد مئتين متر، انعطف يميناً', true);
      if (!hasArabicVoice()) toast('جهازك ما فيه صوت عربي، نزّله من إعدادات تحويل النص إلى كلام', 4500);
    } }, icon('sound', { size: 20 }), 'جرّب الصوت'),
    sec('أماكني'),
    ...Object.entries(SAVED_LABELS).map(([k, l]) => el('div', { class: 'switch' },
      lbl(l.icon, l.name, el('small', { class: 'muted' }, saved[k]?.name || 'غير محدد')),
      el('span', {},
        el('button', { class: 'chip', onclick: () => {
          if (!state.pos) { toast('حدد موقعك أولاً من زر موقعي'); return; }
          setSaved(k, { name: l.name, lng: state.pos.lng, lat: state.pos.lat }); toast(`تم حفظ ${l.name} على موقعك الحالي`); redraw();
        } }, 'موقعي الحالي'),
        saved[k] ? el('button', { class: 'chip', onclick: () => { clearSaved(k); redraw(); } }, 'مسح') : null))),
    sec('الصلاحيات'),
    el('div', { class: 'switch' }, lbl('pin', 'الموقع', locTxt),
      el('button', { class: 'chip', onclick: async () => { const r = await requestLocation(); if (!r.ok) toast(PERM_TEXT[r.reason], 4500); else emit('ui:locate'); redraw(); } }, 'اسمح')),
    el('div', { class: 'switch' }, lbl('compass', 'البوصلة'),
      el('button', { class: 'chip', onclick: async () => { if (await compassPermission()) { startCompass(); toast('البوصلة شغّالة'); } else toast('البوصلة مرفوضة'); } }, 'شغّل')),
    el('div', { class: 'switch' }, lbl('download', 'حفظ الخرائط المنزّلة دائماً'),
      el('button', { class: 'chip', onclick: async () => toast(await persistStorage() ? 'تم، الخرائط ما تنمسح تلقائياً' : 'المتصفح ما وافق حالياً') }, 'فعّل')),
    sec('التطبيق'),
    el('div', { class: 'switch' }, lbl('info', 'الإصدار', el('small', { class: 'muted' }, APP_VERSION)),
      el('button', { class: 'chip', onclick: () => { toast('جاري التحديث…'); forceUpdate(); } }, 'حدّث الآن')),
    el('button', { class: 'btn danger block', style: 'margin-top:10px', onclick: () => { resetPrefs(); toast('رجعت الإعدادات الافتراضية'); location.reload(); } }, icon('trash', { size: 18, anim: '' }), 'إعادة الإعدادات الافتراضية'),
    el('p', { class: 'muted', style: 'font-size:0.8125rem;margin-top:14px' }, 'بيانات الخريطة من OpenStreetMap، والطرق من OSRM، ومعلومات المحافظات من ويكيبيديا.'));
}
function vis(layer, on) { if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', on ? 'visible' : 'none'); }
