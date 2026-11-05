// رموز الطقس بالعربي، مدة المطر، والتنبيهات (من بيانات Open-Meteo)
const D = { 0: ['صافٍ', 'clear'], 1: ['غالباً صافٍ', 'clear'], 2: ['غائم جزئياً', 'cloud'], 3: ['غائم', 'cloud'], 45: ['ضباب', 'fog'], 48: ['ضباب صقيعي', 'fog'],
  51: ['رذاذ خفيف', 'rain'], 53: ['رذاذ متوسط', 'rain'], 55: ['رذاذ كثيف', 'rain'], 56: ['رذاذ متجمد', 'rain'], 57: ['رذاذ متجمد كثيف', 'rain'],
  61: ['مطر خفيف', 'rain'], 63: ['مطر متوسط', 'rain'], 65: ['مطر غزير', 'rain'], 66: ['مطر متجمد', 'rain'], 67: ['مطر متجمد غزير', 'rain'],
  71: ['ثلج خفيف', 'snow'], 73: ['ثلج متوسط', 'snow'], 75: ['ثلج كثيف', 'snow'], 77: ['حبيبات ثلج', 'snow'],
  80: ['زخات مطر خفيفة', 'rain'], 81: ['زخات مطر متوسطة', 'rain'], 82: ['زخات مطر عنيفة', 'rain'], 85: ['زخات ثلج خفيفة', 'snow'], 86: ['زخات ثلج كثيفة', 'snow'],
  95: ['عاصفة رعدية', 'storm'], 96: ['عاصفة رعدية مع برد', 'storm'], 99: ['عاصفة رعدية مع برد كثيف', 'storm'] };
export const describe = c => D[c] || ['—', 'cloud'];
export const kindOf = c => describe(c)[1];
export const KIND_COLOR = { clear: '#f59e0b', cloud: '#8a94a6', fog: '#adb5bd', rain: '#2f80ed', storm: '#7048e8', snow: '#74c0fc' };
export const rainLevel = mm => mm < 0.1 ? 'لا مطر' : mm < 2.5 ? 'مطر خفيف' : mm < 7.6 ? 'مطر متوسط' : mm < 20 ? 'مطر غزير' : 'مطر غزير جداً';
export const dustLevel = v => v == null ? '—' : v < 50 ? 'قليل' : v < 150 ? 'متوسط' : v < 500 ? 'كثيف' : 'عاصفة ترابية';
export const windDir = d => ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'][Math.round((d || 0) / 45) % 8];
export const hourIndex = (h, curTime) => { const i = h.time.findIndex(t => t.slice(0, 13) >= curTime.slice(0, 13)); return i < 0 ? 0 : i; };
export function rainDuration(h, i0, span = 48) {
  const pr = h.precipitation.slice(i0, i0 + span), n = pr.length, wet = k => (pr[k] || 0) >= 0.1;
  if (wet(0)) { let k = 0; while (k < n && wet(k)) k++; return { now: true, hours: k, open: k >= n }; }
  let k = 0; while (k < n && !wet(k)) k++;
  if (k >= n) return { none: true, span: n };
  let m = k; while (m < n && wet(m)) m++;
  return { now: false, startIn: k, hours: m - k };
}
export const durationText = d => d.none ? `لا مطر متوقع خلال ${d.span} ساعة` : d.now ? `تمطر الآن وتستمر ${d.open ? 'أكثر من ' : 'حوالي '}${d.hours} ساعة` : `تبدأ بعد ${d.startIn} ساعة وتستمر حوالي ${d.hours} ساعة`;
export function alertsFor(cur, h, i0, dust) {
  const out = [], idx = []; for (let k = i0; k < Math.min(i0 + 6, h.time.length); k++) idx.push(k);
  const codes = [cur.weather_code, ...idx.map(k => h.weather_code[k])], mm = Math.max(cur.precipitation || 0, ...idx.map(k => h.precipitation[k] || 0));
  const gust = Math.max(cur.wind_gusts_10m || 0, ...idx.map(k => h.wind_gusts_10m[k] || 0)), vis = h.visibility?.[i0];
  const storm = codes.find(c => c >= 95);
  if (storm) out.push({ lv: 3, t: storm >= 96 ? 'عاصفة رعدية مع برد' : 'عاصفة رعدية' });
  if (codes.some(c => [65, 67, 82].includes(c)) || mm >= 7.6) out.push({ lv: 2, t: 'أمطار غزيرة' });
  if (codes.some(c => c >= 71 && c <= 86)) out.push({ lv: 2, t: 'ثلوج' });
  if (gust >= 80) out.push({ lv: 3, t: `رياح عاصفة (هبّات ${Math.round(gust)} كم/س)` }); else if (gust >= 60) out.push({ lv: 2, t: `رياح قوية (هبّات ${Math.round(gust)} كم/س)` });
  if (dust >= 500) out.push({ lv: 3, t: 'عاصفة ترابية' }); else if (dust >= 150) out.push({ lv: 2, t: 'غبار كثيف' });
  if (vis != null && vis < 2000) out.push({ lv: 2, t: `رؤية ضعيفة (${Math.round(vis)} م)` });
  return out;
}
