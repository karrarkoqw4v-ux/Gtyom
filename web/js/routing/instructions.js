// تحويل خطوات الطريق إلى تعليمات عربية، والسهم اسم أيقونة
const MOD = {
  'left': ['انعطف يساراً', 'left'], 'right': ['انعطف يميناً', 'right'],
  'slight left': ['انحرف قليلاً لليسار', 'slight-left'], 'slight right': ['انحرف قليلاً لليمين', 'slight-right'],
  'sharp left': ['انعطف بحدة لليسار', 'sharp-left'], 'sharp right': ['انعطف بحدة لليمين', 'sharp-right'],
  'straight': ['استمر للأمام', 'straight'], 'uturn': ['استدر للخلف', 'uturn']
};
const ORD = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
export function instruction(step) {
  if (!step) return { text: '', arrow: 'straight', short: '' };
  const m = MOD[step.modifier] || MOD.straight;
  const to = step.name ? ` إلى ${step.name}` : '';
  switch (step.type) {
    case 'depart': return { text: `انطلق${step.name ? ' على ' + step.name : ''}`, arrow: 'straight', short: 'انطلق' };
    case 'arrive': return { text: 'وصلت إلى وجهتك', arrow: 'flag', short: 'الوجهة' };
    case 'roundabout': case 'rotary': case 'roundabout turn': {
      const ex = step.exit ? ` واخرج من المخرج ${ORD[step.exit] || step.exit}` : '';
      return { text: `ادخل الفلكة${ex}${to}`, arrow: 'roundabout', short: 'فلكة' };
    }
    case 'merge': return { text: `اندمج${to}`, arrow: m[1], short: 'اندمج' };
    case 'on ramp': return { text: `خذ المدخل${to}`, arrow: m[1], short: 'مدخل' };
    case 'off ramp': return { text: `خذ المخرج${to}`, arrow: m[1], short: 'مخرج' };
    case 'fork': return { text: `عند التفرّع ${m[0].replace('انعطف', 'خذ')}${to}`, arrow: m[1], short: 'تفرّع' };
    case 'end of road': return { text: `بنهاية الشارع ${m[0]}${to}`, arrow: m[1], short: m[0] };
    case 'continue': case 'new name': return { text: `${m[0]}${to}`, arrow: m[1], short: m[0] };
    default: return { text: `${m[0]}${to}`, arrow: m[1], short: m[0] };
  }
}
export function spoken(step, meters) {
  const t = instruction(step).text;
  if (meters == null) return t;
  if (meters < 60) return t;
  const d = meters >= 1000 ? `${(meters / 1000).toFixed(1)} كيلومتر` : `${Math.round(meters / 50) * 50} متر`;
  return `بعد ${d}، ${t}`;
}
