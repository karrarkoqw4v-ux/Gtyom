// تحويل بيانات المكان إلى معلومات مقروءة
const ROWS = [
  ['opening_hours', 'الدوام', 'clock'], ['phone', 'الهاتف', 'phone'], ['contact:phone', 'الهاتف', 'phone'],
  ['website', 'الموقع', 'globe'], ['addr:street', 'الشارع', 'pin'], ['brand', 'العلامة', 'tag'],
  ['operator', 'الجهة', 'building'], ['stars', 'عدد النجوم', 'tag'], ['building:levels', 'عدد الطوابق', 'building'], ['height', 'الارتفاع (م)', 'ruler'], ['addr:housenumber', 'رقم الدار', 'tag'], ['start_date', 'سنة الإنشاء', 'clock'], ['description', 'وصف', 'info'], ['rooms', 'عدد الغرف', 'building'], ['email', 'البريد', 'globe'], ['cuisine', 'المطبخ', 'food'], ['wheelchair', 'مناسب للكراسي المتحركة', 'info']
];
export function detailRows(tags = {}) {
  const out = [], seen = new Set();
  for (const [k, label, icon] of ROWS) {
    if (tags[k] && !seen.has(label)) { seen.add(label); out.push({ label, icon, value: tags[k], link: k.includes('website') ? tags[k] : k.includes('phone') ? 'tel:' + tags[k] : null }); }
  }
  return out;
}
