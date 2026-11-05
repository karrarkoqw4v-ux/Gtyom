// شاشة طقس المحافظة بملء الشاشة: خلفية سماء حقيقية الحالة، غيوم تتحرك، مطر وبرق وثلج وغبار حسب البيانات الحقيقية
import { el } from '../core/dom.js';
import { icon } from '../ui/icons.js';
import { openPage, closePage } from '../ui/page.js';
import { describe, kindOf, windDir, rainLevel, dustLevel, durationText } from './codes.js';
import { iconFor, wxIcon, aqiInfo, uvInfo, tempColor } from './icons.js';
const PAL = { clear: [['#2f6fd1', '#7db8f2'], ['#0a1a36', '#1d3a66']], cloud: [['#62758f', '#a7b6c9'], ['#18222f', '#38455c']], rain: [['#3d4f6b', '#7488a6'], ['#16202f', '#32405a']], storm: [['#262d4a', '#4a5273'], ['#10141f', '#2a3048']], snow: [['#7b92ae', '#dbe5ef'], ['#1f2b3b', '#4b5d73']], fog: [['#8a95a2', '#c4cbd3'], ['#232a33', '#4a525d']], dust: [['#b98a58', '#e6c692'], ['#4a3a26', '#7a6140']] };
const TWI = { dawn: ['#34508f', '#f4b26e'], dusk: ['#2b3d7c', '#ea845b'] };
// موقع الشمس والقمر الحقيقي حسب وقت الشروق والغروب
function sunInfo(p) {
  const d = p.daily || {}, t = new Date(p.cur.time).getTime(), sr = new Date(d.sunrise?.[0]).getTime(), ss = new Date(d.sunset?.[0]).getTime();
  if (![t, sr, ss].every(isFinite)) return null;
  const day = t >= sr && t <= ss, night = 864e5 - (ss - sr);
  const f = day ? (t - sr) / (ss - sr) : t > ss ? (t - ss) / night : (t + 864e5 - ss) / night;
  const near = Math.min(Math.abs(t - sr), Math.abs(t - ss)) < 40 * 60e3;
  return { day, f: Math.max(0, Math.min(1, f)), twi: near ? (Math.abs(t - sr) < Math.abs(t - ss) ? 'dawn' : 'dusk') : null };
}
// طور القمر (0 محاق، 0.5 بدر)
const moonPhase = () => (((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588 + 29.530588) % 29.530588 / 29.530588;
const nf = n => Math.round(n);
const hh = t => new Date(t).toLocaleTimeString('ar-IQ', { hour: 'numeric' });
const hm = t => new Date(t).toLocaleTimeString('ar-IQ', { hour: 'numeric', minute: '2-digit' });
function mood(p) {
  const c = p.cur, k = kindOf(c.weather_code), dust = p.aq?.dust ?? p.dust ?? 0, day = c.is_day === 1;
  const key = dust >= 150 ? 'dust' : k === 'storm' ? 'storm' : k === 'snow' ? 'snow' : k === 'rain' ? 'rain' : k === 'fog' ? 'fog' : (c.cloud_cover > 60 || c.weather_code === 3) ? 'cloud' : 'clear';
  const mm = Math.max(c.precipitation || 0, key === 'rain' ? ([51, 61, 80].includes(c.weather_code) ? 0.6 : [53, 63, 81].includes(c.weather_code) ? 2.5 : 7) : 0, key === 'storm' ? 6 : 0);
  return { key, day, mm, cloud: c.cloud_cover || 0, wind: c.wind_speed_10m || 0, dust, sun: sunInfo(p), temp: c.temperature_2m };
}
// رسم الغيوم والمطر والبرق والثلج والغبار على canvas
function animate(cv, M) {
  const ctx = cv.getContext('2d'); let W = 0, H = 0, raf = 0, last = 0, drops = [], flakes = [], flash = 0, bolt = null, t0 = performance.now();
  const clouds = Array.from({ length: 4 + Math.round(M.cloud / 22) }, (_, i) => ({ x: Math.random(), y: Math.random() * 0.62, r: 0.22 + Math.random() * 0.3, v: (0.006 + Math.random() * 0.012) * (1 + M.wind / 40) * (i % 2 ? 1 : -1), a: 0.18 + Math.random() * 0.2 }));
  const stars = M.key === 'clear' && !M.day ? Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.6, r: Math.random() * 1.4 + 0.3, p: Math.random() * 6 })) : [];
  const sl = Math.max(-0.35, Math.min(0.35, M.wind / 90));
  function resize() { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; }
  function frame(t) {
    raf = requestAnimationFrame(frame); if (t - last < 30) return; const dt = (t - last) / 1000; last = t; if (!W) resize();
    ctx.clearRect(0, 0, W, H);
    if ((M.key === 'clear' || M.key === 'cloud') && M.sun) {
      const S = M.sun, x = W * (0.12 + 0.76 * S.f), y = H * (0.3 - 0.2 * Math.sin(Math.PI * S.f)), vis = M.key === 'clear' ? 1 : Math.max(0.25, 1 - M.cloud / 110);
      if (S.day) {
        const low = 1 - Math.sin(Math.PI * S.f), col = low > 0.55 ? '255,190,110' : '255,244,200', R = W * (0.22 + low * 0.14);
        const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(${col},${0.7 * vis})`); g.addColorStop(0.25, `rgba(${col},${0.28 * vis})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = `rgba(255,252,235,${0.95 * vis})`; ctx.beginPath(); ctx.arc(x, y, Math.max(12, W * 0.035), 0, 7); ctx.fill();
        if (M.temp >= 38 && M.key === 'clear') { for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,225,170,.10)'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 24; k++) { const xx = k / 24 * W, yy = H * (0.9 - i * 0.025) + Math.sin(t / 500 + k * 0.7 + i) * 3; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); } }
      } else {
        const r = Math.max(14, W * 0.04), ph = moonPhase(), k = (1 - Math.cos(2 * Math.PI * ph)) / 2, dx = (ph < 0.5 ? -1 : 1) * 2 * r * k;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5); g.addColorStop(0, `rgba(210,225,255,${0.35 * vis * (0.3 + k)})`); g.addColorStop(1, 'rgba(210,225,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(x + dx, y, r, 0, 7); ctx.clip('evenodd');
        ctx.fillStyle = `rgba(250,248,236,${0.95 * vis})`; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
      }
    } else if (M.key === 'clear' && M.day) { const g = ctx.createRadialGradient(W * 0.78, H * 0.12, 0, W * 0.78, H * 0.12, W * 0.7); g.addColorStop(0, 'rgba(255,240,190,.55)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    stars.forEach(s => { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * Math.sin(t / 700 + s.p)})`; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 7); ctx.fill(); });
    const dark = M.key === 'storm' ? '28,34,60' : M.day ? '255,255,255' : '120,138,176';
    clouds.forEach(c => {
      c.x += c.v * dt; if (c.x > 1.4) c.x = -0.4; if (c.x < -0.4) c.x = 1.4;
      const x = c.x * W, y = c.y * H, r = c.r * W, g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const a = c.a * (M.key === 'clear' ? Math.min(1, M.cloud / 40 + 0.15) : 1.35) * (M.key === 'storm' ? 1.5 : 1);
      g.addColorStop(0, `rgba(${dark},${Math.min(0.6, a)})`); g.addColorStop(1, `rgba(${dark},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, 0, 7); ctx.fill();
    });
    if (M.key === 'dust' || M.key === 'fog') { for (let i = 0; i < 3; i++) { const y = H * (0.25 + i * 0.22), off = ((t / 40 * (1 + i)) % (W * 1.5)) - W * 0.25; const g = ctx.createLinearGradient(off, 0, off + W * 0.9, 0); const c = M.key === 'dust' ? '214,170,100' : '225,230,236'; g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.5, `rgba(${c},.28)`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(off, y, W * 0.9, H * 0.16); } }
    if (M.key === 'rain' || M.key === 'storm') {
      const want = Math.min(200, Math.round(35 + M.mm * 22)); while (drops.length < want) drops.push({ x: Math.random() * (W + 80), y: Math.random() * H, l: 22 + Math.random() * 34, v: 520 + Math.random() * 380, w: 1 + Math.random() * 1.2, a: 0.25 + Math.random() * 0.35 });
      drops.length = Math.min(drops.length, want); ctx.lineCap = 'round';
      drops.forEach(d => { d.y += d.v * dt; d.x += d.v * dt * sl; if (d.y > H) { d.y = -d.l; d.x = Math.random() * (W + 80); } const g = ctx.createLinearGradient(d.x, d.y, d.x - d.l * sl, d.y + d.l); g.addColorStop(0, 'rgba(210,225,255,0)'); g.addColorStop(1, `rgba(210,225,255,${d.a})`); ctx.strokeStyle = g; ctx.lineWidth = d.w; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * sl, d.y + d.l); ctx.stroke(); });
    }
    if (M.key === 'snow') { while (flakes.length < 90) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2.6, v: 40 + Math.random() * 60, p: Math.random() * 6 }); flakes.forEach(f => { f.y += f.v * dt; f.x += Math.sin(t / 900 + f.p) * 0.6 + sl * 30 * dt; if (f.y > H) { f.y = -5; f.x = Math.random() * W; } ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }); }
    if (M.key === 'storm') {
      if (Math.random() < 0.012) { flash = 0.55; const x = W * (0.2 + Math.random() * 0.6); const pts = [[x, 0]]; for (let k = 0; k < 8; k++) { const p = pts[pts.length - 1]; pts.push([p[0] + (Math.random() - .5) * 70, p[1] + H * 0.07]); } bolt = { pts, a: 1 }; }
      if (flash > 0.02) { ctx.fillStyle = `rgba(235,240,255,${flash})`; ctx.fillRect(0, 0, W, H); flash *= 0.78; }
      if (bolt && bolt.a > 0.05) { ctx.strokeStyle = `rgba(255,255,255,${bolt.a})`; ctx.lineWidth = 2.6; ctx.shadowColor = '#bcd4ff'; ctx.shadowBlur = 16; ctx.beginPath(); bolt.pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.shadowBlur = 0; bolt.a *= 0.8; }
    }
  }
  resize(); window.addEventListener('resize', resize); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
}
const glass = (...k) => el('div', { class: 'wxs-card' }, ...k);
const tile = (ic, label, value, sub, color) => el('div', { class: 'wxs-tile' }, el('div', { class: 'wxs-tl' }, icon(ic, { size: 16, anim: '' }), label), el('b', { style: color ? `color:${color}` : '' }, value), sub ? el('small', {}, sub) : null);
export function openScene(p) {
  const M = mood(p), pal = (M.sun?.twi && (M.key === 'clear' || M.key === 'cloud')) ? TWI[M.sun.twi] : PAL[M.key][M.day ? 0 : 1], c = p.cur, d = p.daily, h = p.h, aq = p.aq || {}, aqi = aqiInfo(aq.us_aqi), uv = uvInfo(h.uv_index?.[p.i0]);
  const cv = el('canvas', { class: 'wxs-cv' });
  const days = d.time.map((t, k) => ({ t, code: d.weather_code[k], max: d.temperature_2m_max[k], min: d.temperature_2m_min[k], rain: d.precipitation_sum[k], prob: d.precipitation_probability_max?.[k] }));
  const lo = Math.min(...days.map(x => x.min)), hi = Math.max(...days.map(x => x.max));
  const dayName = (t, k) => k === 0 ? 'اليوم' : k === 1 ? 'غداً' : new Date(t).toLocaleDateString('ar-IQ', { weekday: 'long' });
  const hrs = Array.from({ length: 24 }, (_, k) => p.i0 + k).filter(k => k < h.time.length);
  const sr = d.sunrise?.[0], ss = d.sunset?.[0];
  const alertBox = p.alerts.length ? el('div', { class: 'wxs-alerts' }, ...p.alerts.map(a => el('div', { class: 'wxs-al lv' + a.lv }, icon('alert', { size: 18, anim: '' }), a.t))) : null;
  const page = el('div', { class: 'wxs', style: `--g1:${pal[0]};--g2:${pal[1]}` },
    el('div', { class: 'wxs-bg' }), cv,
    el('div', { class: 'wxs-scroll' },
      el('div', { class: 'wxs-hero' },
        el('div', { class: 'wxs-name' }, p.name),
        el('div', { class: 'wxs-temp' }, nf(c.temperature_2m), el('sup', {}, '°')),
        el('div', { class: 'wxs-desc' }, el('span', {}, describe(c.weather_code)[0]), el('span', { class: 'wxs-hl' }, `${nf(days[0].max)}°/${nf(days[0].min)}°`)),
        aqi ? el('div', { class: 'wxs-aqi' }, el('i', { style: `background:${aqi[1]}` }), `جودة الهواء: ${nf(aq.us_aqi)} · ${aqi[0]}`) : null,
        el('div', { class: 'wxs-dur' }, icon('rain', { size: 18, anim: '' }), durationText(p.dur))),
      alertBox,
      glass(el('div', { class: 'wxs-ch' }, icon('clock', { size: 18, anim: '' }), 'الساعات القادمة'),
        el('div', { class: 'wxs-hours' }, ...hrs.map(k => el('div', { class: 'wxs-hr' }, el('small', {}, hh(h.time[k])), el('span', { html: iconFor(h.weather_code[k], h.is_day ? h.is_day[k] === 1 : true, 30) }), el('b', {}, nf(h.temperature_2m[k]) + '°'), el('small', { class: 'pr' }, (h.precipitation_probability[k] ?? 0) > 0 ? (h.precipitation_probability[k]) + '%' : ''))))),
      glass(el('div', { class: 'wxs-ch' }, icon('clock', { size: 18, anim: '' }), 'توقعات 5 أيام'),
        ...days.map((x, k) => el('div', { class: 'wxs-day' }, el('span', { class: 'dn' }, dayName(x.t, k)), el('span', { html: iconFor(x.code, true, 30) }),
          el('b', { class: 'mn' }, nf(x.min) + '°'), el('span', { class: 'rg' }, el('i', { style: `right:${(x.min - lo) / (hi - lo || 1) * 100}%;left:${100 - (x.max - lo) / (hi - lo || 1) * 100}%;background:linear-gradient(90deg,${tempColor(x.min)},${tempColor(x.max)})` })), el('b', { class: 'mx' }, nf(x.max) + '°'),
          el('small', { class: 'rn' }, x.rain > 0 ? `${x.rain} ملم` : '')))),
      glass(el('div', { class: 'wxs-ch' }, icon('info', { size: 18, anim: '' }), 'تفاصيل'),
        el('div', { class: 'wxs-grid' },
          tile('wind', 'الرياح', `${nf(c.wind_speed_10m)} كم/س`, `من ${windDir(c.wind_direction_10m)} · هبّات ${nf(c.wind_gusts_10m)}`),
          tile('rain', 'الرطوبة', c.relative_humidity_2m + '%', `المحسوسة ${nf(c.apparent_temperature)}°`),
          tile('map', 'الضغط', nf(c.pressure_msl) + ' هكتوباسكال'),
          tile('cloud', 'الغيوم', c.cloud_cover + '%', h.visibility?.[p.i0] != null ? `الرؤية ${(h.visibility[p.i0] / 1000).toFixed(1)} كم` : ''),
          uv ? tile('sun', 'الأشعة فوق البنفسجية', `${h.uv_index[p.i0].toFixed(1)}`, uv[0], uv[1]) : null,
          aqi ? tile('info', 'جودة الهواء', nf(aq.us_aqi), aqi[0], aqi[1]) : null,
          aq.pm2_5 != null ? tile('info', 'الجسيمات PM2.5', nf(aq.pm2_5) + ' µg/m³') : null,
          aq.pm10 != null ? tile('info', 'الجسيمات PM10', nf(aq.pm10) + ' µg/m³') : null,
          aq.dust != null ? tile('wind', 'الغبار', nf(aq.dust) + ' µg/m³', dustLevel(aq.dust)) : null,
          sr ? tile('sun', 'الشروق', hm(sr)) : null, ss ? tile('moon', 'الغروب', hm(ss)) : null)),
      el('p', { class: 'wxs-src' }, 'المصدر: Open-Meteo (نماذج الطقس وجودة الهواء)، تتحدث كل 5 دقائق. الجسيمات والغبار من نموذج CAMS.')),
    el('button', { class: 'wxs-back', type: 'button', 'aria-label': 'رجوع', onclick: () => closePage() }, icon('back', { size: 22, anim: '' })));
  let stop = null;
  openPage(p.name, page, { bare: true, cls: 'wxs-pg', onClose: () => stop?.() });
  requestAnimationFrame(() => { stop = animate(cv, M); });
}
