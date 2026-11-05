// الطبقات: ألوان الخريطة، التضاريس، المرور والإشارات، مصدر البنايات، ودليل الألوان
import { el } from '../core/dom.js';
import { state } from '../core/state.js';
import { prefs, setPref } from '../core/prefs.js';
import { openView } from './sheet.js';
import { icon } from './icons.js';
import { toast } from './toast.js';
import { map } from '../map/map.js';
import { PALETTES, applyPalette } from '../map/theme.js';
import { setHeightScale } from '../map/buildings.js';
import { setSignalsVisible, setSignsVisible } from '../traffic/signals.js';
import { refreshTraffic } from '../traffic/sim.js';
import { extStatus } from '../map/buildings-ext.js';
import { emit } from '../core/events.js';

const sw = (ic, text, key, after) => { const P = prefs(); return el('div', { class: 'switch' }, el('span', { class: 'lbl' }, el('span', { class: 'ic', style: '--c:#2f8f6a' }, icon(ic, { size: 20, anim: '' })), text),
  el('button', { class: 'chip' + (P[key] ? ' on' : ''), type: 'button', role: 'switch', 'aria-checked': String(P[key]), onclick: e => { const v = !prefs()[key]; setPref(key, v); after?.(v); e.currentTarget.classList.toggle('on', v); e.currentTarget.textContent = v ? 'شغّال' : 'مطفي'; } }, P[key] ? 'شغّال' : 'مطفي')); };
const sw2 = (label, color, text) => el('div', { class: 'lg' }, el('i', { style: `background:${color}` }), el('span', {}, text || label));

export function showLayers() {
  const P = prefs(), ext = extStatus();
  const body = el('div', {},
    el('div', { class: 'section', style: 'margin-top:2px' }, 'ألوان الخريطة'),
    el('div', { class: 'chips' }, ...Object.entries(PALETTES).map(([k, v]) => el('button', { class: 'chip' + (P.palette === k ? ' on' : ''), type: 'button', onclick: e => { setPref('palette', k); applyPalette(map, k, prefs().satellite); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, v.name))),
    el('div', { class: 'section' }, 'حجم البنايات'),
    el('div', { class: 'chips' }, ...[1, 2, 3].map(k => el('button', { class: 'chip' + (state.heightScale === k ? ' on' : ''), type: 'button', onclick: e => { setHeightScale(k); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, '×' + k))),
    el('div', { class: 'section' }, 'نوع الخريطة'),
    el('div', { class: 'chips' }, ...[[true, 'واقعية (قمر اصطناعي)'], [false, 'فاتحة مبسّطة']].map(([v, t]) => el('button', { class: 'chip' + (!!P.satellite === v ? ' on' : ''), type: 'button', onclick: e => { setPref('satellite', v); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, t))),
    el('p', { class: 'muted', style: 'font-size:0.8125rem;margin:4px 0' }, 'صور القمر الاصطناعي تبدأ تظهر من مستوى المدينة، وتحتاج إنترنت (ما تنحفظ بالخرائط المنزّلة). الصور من Esri/Maxar.'),
    sw('building', 'ألوان البنايات من القمر الاصطناعي وواجهات مجسمة (من القرب)', 'facades'),
    el('div', { class: 'section' }, 'السرعة والجودة'),
    el('div', { class: 'chips' }, ...[['fast', 'أقصى سرعة'], ['balanced', 'متوازن'], ['sharp', 'أعلى وضوح']].map(([k, t]) => el('button', { class: 'chip' + ((P.gfx || 'sharp') === k ? ' on' : ''), type: 'button', onclick: e => { setPref('gfx', k); e.currentTarget.parentNode.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, t))),
    el('p', { class: 'muted', style: 'font-size:0.8125rem;margin:4px 0' }, 'عدد الإطارات يتحدد بتردد شاشة جهازك (60 أو 90 أو 120). التطبيق ما يقدر يتجاوزه، لكن «أقصى سرعة» تخفف الدقة حتى توصل لأعلى رقم تدعمه شاشتك.'),
    sw('info', 'إظهار عدّاد الإطارات', 'showFps'),
    el('div', { class: 'section' }, 'الطبقات'),
    sw('map', 'ظلال الجبال عند التصغير', 'relief'),
    sw('cube', 'تضاريس ثلاثية الأبعاد (أثقل على الجهاز)', 'terrain'),
    sw('mall', 'مجسمات الأماكن الرئيسية بكل المحافظات', 'places3d'),
    sw('road', 'الجسور ثلاثية الأبعاد', 'bridges'),
    sw('map', 'أشجار الحدائق ثلاثية الأبعاد', 'trees'),
    sw('traffic', 'إشارات المرور الضوئية (مواقعها الحقيقية)', 'signals', setSignalsVisible),
    sw('flag', 'العلامات المرورية (قف، أفضلية، مشاة، مطبات، كاميرات، حدود السرعة)', 'signs', setSignsVisible),
    sw('car', 'سيارات متحركة (محاكاة شكلية، مطفية)', 'trafficSim', () => refreshTraffic()),
    sw('mosque', 'الحرمان والمجسمات الخاصة', 'landmarks'),
    sw('houses', 'عدّاد البيوت', 'showCounter'),
    el('div', { class: 'section' }, 'بنايات إضافية (تجريبي)'),
    sw('building', 'استخدام مصدر بنايات إضافي إن وُجد', 'extBuildings'),
    el('p', { class: 'muted', style: 'font-size:0.8438rem;margin:4px 0' }, ext.url ? 'تم إيجاد مصدر بنايات إضافي وهو شغّال.' : 'ما لقينا مصدر بنايات إضافي شغّال. تظهر بنايات OpenStreetMap فقط. تقدر تحط رابط PMTiles خاص بك:'),
    (() => { const i = el('input', { class: 'iq-in', dir: 'ltr', placeholder: 'https://…/buildings.pmtiles', value: P.extBuildingsUrl || '' });
      return el('div', {}, i, el('button', { class: 'btn block', style: 'margin-top:8px', type: 'button', onclick: () => { setPref('extBuildingsUrl', i.value.trim()); setPref('extBuildings', !!i.value.trim()); toast('تم الحفظ، حدّث الصفحة حتى تظهر البنايات الجديدة'); } }, 'حفظ الرابط')); })(),
    el('div', { class: 'section' }, 'دليل الألوان والعلامات'),
    el('div', { class: 'legend' },
      sw2('', '#ff7f5c', 'طريق سريع'), sw2('', '#ffbe55', 'طريق رئيسي'), sw2('', '#ffe98a', 'طريق ثانوي'), sw2('', '#e3efff', 'طريق فرعي'), sw2('', '#ffffff', 'شارع داخلي'),
      sw2('', '#f4dcb8', 'بيت (ألوان متنوعة)'), sw2('', '#a9c6ee', 'بناية متوسطة'), sw2('', '#7da3e0', 'برج عالي'),
      sw2('', '#d62828', 'قف / أفضلية'), sw2('', '#1d6fe0', 'عبور مشاة / كاميرا'), sw2('', '#ffd43b', 'مطب'), sw2('', '#374151', 'إشارة مرور ضوئية'), sw2('', '#e24134', 'وجهتك'), sw2('', '#f08c00', 'مطعم أو مقهى'), sw2('', '#d6336c', 'محل أو سوق'), sw2('', '#e03131', 'مستشفى أو صيدلية'), sw2('', '#2b8a3e', 'جامع')),
    el('p', { class: 'muted', style: 'font-size:0.8125rem;margin-top:12px' }, 'تلميح: اضغط على أي بناية أو محل لتشوف ارتفاعها وتفاصيلها وصورها وتقييمات الناس.'));
  openView('الطبقات والدليل', body);
}
