// مشاركة الموقع: رسالة + رابط يفتح التطبيق + صورة ثلاثية الأبعاد للبنايات
import { map } from '../map/map.js';
export const appBase = () => location.origin + location.pathname.replace(/index\.html$/, '');
export function placeLink(p) {
  const u = new URL(appBase());
  u.searchParams.set('loc', `${(+p.lng).toFixed(6)},${(+p.lat).toFixed(6)}`);
  u.searchParams.set('n', p.name || '');
  return u.toString();
}
export const mapsLink = p => `https://www.google.com/maps?q=${(+p.lat).toFixed(6)},${(+p.lng).toFixed(6)}`;
export const messageText = (p, address) => [`📍 ${p.name}`, address ? `العنوان: ${address}` : null, `الإحداثيات: ${(+p.lat).toFixed(6)}, ${(+p.lng).toFixed(6)}`,
  p.building?.height ? `ارتفاع البناية: ${Math.round(p.building.height)} متر` : null, p.acc ? `دقة التحديد: ${Math.round(p.acc)} متر` : null, p.phone ? `الهاتف: ${p.phone}` : null, p.hours ? `الدوام: ${p.hours}` : null,
  'من تطبيق خرطتكم', '', '🔗 رابط الموقع:', placeLink(p)].filter(v => v !== null).join('\n');
export const waitIdle = (ms = 5000) => new Promise(res => { let d = false; const f = () => { if (!d) { d = true; res(); } }; map.once('idle', f); setTimeout(f, ms); });
const snap = () => new Promise(res => { map.once('render', () => map.getCanvas().toBlob(b => res(b), 'image/png')); map.triggerRepaint(); });
// لقطة عالية الدقة: نرفع دقة الخريطة مؤقتاً ثم نرجعها كما كانت
const capture = async () => {
  const old = map.getPixelRatio ? map.getPixelRatio() : 1.5;
  const hi = Math.min(Math.max(window.devicePixelRatio || 1, 2.5), 3);
  try {
    if (!map.setPixelRatio) return await snap();
    map.setPixelRatio(hi); await waitIdle(4000);
    const b = await snap();
    if (!b) throw new Error('empty');
    return b;
  } catch { map.setPixelRatio?.(old); await waitIdle(2000); return await snap(); }
  finally { map.setPixelRatio?.(old); }
};
// صورة من الخريطة الحالية مع دبوس واسم المكان
export async function composeCard(p, address) {
  const img = await createImageBitmap(await capture());
  const W = img.width, H = img.height, s = W / 390, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d'), F = '-apple-system, "IBM Plex Sans Arabic", "Noto Sans Arabic", system-ui, sans-serif';
  x.drawImage(img, 0, 0);
  const cx = W / 2, cy = H / 2;
  x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, cy + 2 * s, 11 * s, 4 * s, 0, 0, 7); x.fill();
  x.fillStyle = '#12a47b'; x.beginPath(); x.arc(cx, cy - 30 * s, 19 * s, 0, 7); x.moveTo(cx - 12 * s, cy - 17 * s); x.lineTo(cx, cy); x.lineTo(cx + 12 * s, cy - 17 * s); x.fill();
  x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy - 30 * s, 7 * s, 0, 7); x.fill();
  const ph = 104 * s, y0 = H - ph - 12 * s;
  x.fillStyle = 'rgba(255,255,255,.96)'; x.beginPath(); x.roundRect(12 * s, y0, W - 24 * s, ph, 22 * s); x.fill();
  x.direction = 'rtl'; x.textAlign = 'right'; x.textBaseline = 'middle';
  x.fillStyle = '#0f1f38'; x.font = `700 ${21 * s}px ${F}`; x.fillText(p.name, W - 30 * s, y0 + 30 * s, W - 60 * s);
  x.fillStyle = '#46576e'; x.font = `500 ${14 * s}px ${F}`; x.fillText(address || 'العراق', W - 30 * s, y0 + 58 * s, W - 60 * s);
  x.fillStyle = '#1d6fe0'; x.font = `700 ${14 * s}px ${F}`; x.fillText('خرطتكم · خرائط العراق ثلاثية الأبعاد', W - 30 * s, y0 + 83 * s, W - 60 * s);
  return new Promise(r => c.toBlob(r, 'image/jpeg', 0.95));
}
