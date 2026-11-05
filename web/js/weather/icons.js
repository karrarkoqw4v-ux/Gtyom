// أيقونات الطقس بالألوان (SVG): شمس، قمر، غيوم، مطر، عاصفة، ثلج، ضباب، غبار
const G = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
let uid = 0;
const cloud = (g, fill = 'cloud') => `<path d="M17 44a9 9 0 0 1-.8-17.9A13 13 0 0 1 41 22a10 10 0 0 1 .5 20H17z" fill="url(#${g})"/>`;
export function wxIcon(kind, { day = true, size = 40, partly = false } = {}) {
  const i = ++uid, c = `c${i}`, s = `s${i}`, d = `d${i}`;
  const defs = G(c, '#f4f7fb', '#b9c6d8') + G(s, '#ffd966', '#ff9d2e') + G(d, '#7b8799', '#4b5568');
  let body = '';
  const sun = (x, y, r) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${s})"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${x}" y1="${y - r - 4}" x2="${x}" y2="${y - r - 8}" stroke="#ffb64d" stroke-width="3" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>`;
  const moon = (x, y) => `<path d="M${x + 8} ${y + 10}A14 14 0 1 1 ${x - 2} ${y - 12}a11 11 0 0 0 10 22z" fill="#f3f1c9"/>`;
  if (kind === 'clear') body = day ? sun(32, 32, 11) : moon(30, 30);
  else if (kind === 'cloud') body = partly ? (day ? sun(22, 22, 8) : moon(20, 20)) + `<g transform="translate(4 8)">${cloud(c)}</g>` : `<g transform="translate(0 4)">${cloud(c)}</g>`;
  else if (kind === 'rain') body = `<g transform="translate(0 -4)">${cloud(c)}</g>` + [[24, 46], [34, 46], [44, 46]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + 9}" stroke="#4aa3ff" stroke-width="3.4" stroke-linecap="round"/>`).join('');
  else if (kind === 'storm') body = `<g transform="translate(0 -6)">${cloud(d)}</g><path d="M34 36 25 50h7l-3 11 11-16h-7l3-9z" fill="#ffd43b" stroke="#ff9d2e" stroke-width="1.2" stroke-linejoin="round"/>`;
  else if (kind === 'snow') body = `<g transform="translate(0 -4)">${cloud(c)}</g>` + [[24, 50], [34, 54], [44, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#e8f3ff"/>`).join('');
  else if (kind === 'fog') body = `<g transform="translate(0 -6)">${cloud(c)}</g>` + [48, 54, 60].map((y, k) => `<line x1="${14 + k * 3}" y1="${y}" x2="${50 - k * 3}" y2="${y}" stroke="#cdd5df" stroke-width="3.4" stroke-linecap="round"/>`).join('');
  else if (kind === 'dust') body = `<g transform="translate(0 -6)">${cloud('' + c)}</g>` + [46, 52, 58].map((y, k) => `<line x1="${12 + k * 3}" y1="${y}" x2="${52 - k * 3}" y2="${y}" stroke="#d9a441" stroke-width="3.6" stroke-linecap="round"/>`).join('');
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}
// رمز الطقس -> نوع الأيقونة
export function kindForCode(code) {
  if (code === 0 || code === 1) return { kind: 'clear' };
  if (code === 2) return { kind: 'cloud', partly: true };
  if (code === 3) return { kind: 'cloud' };
  if (code === 45 || code === 48) return { kind: 'fog' };
  if (code >= 95) return { kind: 'storm' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow' };
  if (code >= 51) return { kind: 'rain' };
  return { kind: 'cloud' };
}
export const iconFor = (code, day = true, size = 40) => { const k = kindForCode(code); return wxIcon(k.kind, { day, size, partly: k.partly }); };
// جودة الهواء (مقياس US AQI) ومستوى الأشعة فوق البنفسجية
export const aqiInfo = v => v == null ? null : v <= 50 ? ['جيدة', '#2fb26b'] : v <= 100 ? ['متوسطة', '#e6c200'] : v <= 150 ? ['غير صحية للحساسين', '#f08a24'] : v <= 200 ? ['غير صحية', '#e5483e'] : v <= 300 ? ['سيئة جداً', '#9b4ad1'] : ['خطرة', '#8c1d3b'];
export const uvInfo = v => v == null ? null : v < 3 ? ['منخفضة', '#2fb26b'] : v < 6 ? ['متوسطة', '#e6c200'] : v < 8 ? ['عالية', '#f08a24'] : v < 11 ? ['عالية جداً', '#e5483e'] : ['شديدة', '#9b4ad1'];
export const tempColor = t => t < 5 ? '#6ab7ff' : t < 15 ? '#7fd1c7' : t < 25 ? '#8fd36a' : t < 32 ? '#ffc247' : t < 40 ? '#ff8a3d' : '#e5483e';
