// تفاصيل مكان من الإحداثيات: عنوان كامل، نوع المكان، ومعلومات ويكيبيديا إن وجدت
import { CONFIG } from '../config.js';
import { runLite } from './overpass.js';
const TYPE = { hospital: 'مستشفى', clinic: 'عيادة', fuel: 'محطة وقود', place_of_worship: 'دار عبادة', mosque: 'جامع', mall: 'مول', supermarket: 'سوبرماركت', marketplace: 'سوق', school: 'مدرسة', university: 'جامعة', college: 'كلية', bank: 'مصرف', restaurant: 'مطعم', fast_food: 'مطعم وجبات سريعة', cafe: 'مقهى', hotel: 'فندق', pharmacy: 'صيدلية', bus_station: 'محطة نقل', parking: 'موقف', residential: 'منطقة سكنية', house: 'بيت', apartments: 'عمارة سكنية', commercial: 'منطقة تجارية', industrial: 'منطقة صناعية', park: 'حديقة', yes: 'بناية', retail: 'محلات تجارية', city: 'مدينة', town: 'بلدة', suburb: 'حي', neighbourhood: 'حي', village: 'قرية', administrative: 'منطقة إدارية' };
export async function reverseDetails(lng, lat) {
  const u = new URL(CONFIG.nominatim + '/reverse');
  Object.entries({ format: 'jsonv2', 'accept-language': 'ar', lat, lon: lng, zoom: 18, addressdetails: 1, extratags: 1 }).forEach(([k, v]) => u.searchParams.set(k, v));
  return (await fetch(u)).json();
}
export const typeLabel = r => TYPE[r?.type] || TYPE[r?.category] || '';
export function addressRows(r) {
  const a = r?.address || {}, rows = [], add = (l, v) => v && rows.push([l, v]);
  add('المحافظة', a.state || a.province); add('المدينة', a.city || a.town || a.village || a.county);
  add('المنطقة', a.city_district || a.suburb || a.neighbourhood || a.quarter); add('الشارع', a.road); add('رقم الدار', a.house_number);
  return rows;
}
export async function wikiFor(r) {
  const w = r?.extratags?.wikipedia; if (!w) return null;
  const i = w.indexOf(':'), lang = w.slice(0, i), title = w.slice(i + 1);
  try {
    const j = await (await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)).json();
    return j.extract ? { text: j.extract, img: j.thumbnail?.source, url: j.content_urls?.mobile?.page } : null;
  } catch { return null; }
}

const MAT = { brick: 'طابوق', concrete: 'كونكريت', glass: 'زجاج', stone: 'حجر', metal: 'معدن', wood: 'خشب', steel: 'حديد', plaster: 'جص' };
const ROOF = { flat: 'سطح مسطّح', gabled: 'جملوني', hipped: 'هرمي الجوانب', dome: 'قبة', pyramidal: 'هرم', skillion: 'مائل', half_hipped: 'نصف هرمي' };
const KIND = { yes: 'بناية', house: 'بيت', apartments: 'عمارة سكنية', residential: 'سكني', commercial: 'تجاري', retail: 'محلات', office: 'مكاتب', industrial: 'صناعي', mosque: 'جامع', hospital: 'مستشفى', school: 'مدرسة', university: 'جامعة', hotel: 'فندق', church: 'كنيسة', warehouse: 'مخزن', garage: 'كراج', public: 'مبنى عام', service: 'خدمي' };
// بيانات البناية الحقيقية من OpenStreetMap (الطوابق، المادة، السقف، السنة...) إذا موجودة
export async function buildingFacts(lng, lat) {
  try {
    const list = await runLite(`way["building"](around:14,${lat},${lng});`, null, 3, 12), t = list[0]?.tags; if (!t) return [];
    const rows = [], add = (l, v) => v && rows.push([l, v]);
    add('نوع البناية', KIND[t.building] || (t.building !== 'yes' ? t.building : '')); add('الاسم', t['name:ar'] || t.name);
    add('عدد الطوابق', t['building:levels']); add('الارتفاع', t.height && (parseFloat(t.height) + ' م')); add('مادة البناء', MAT[t['building:material']] || t['building:material']);
    add('شكل السقف', ROOF[t['roof:shape']] || t['roof:shape']); add('لون السقف', t['roof:colour']); add('لون البناية', t['building:colour'] || t.colour); add('سنة الإنشاء', t.start_date);
    add('العنوان', [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' - '));
    return rows;
  } catch { return []; }
}
