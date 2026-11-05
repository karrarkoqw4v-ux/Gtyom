// صفحة الأحوال الجوية بخريطة خاصة بيها: مطر وعواصف وغبار ورياح لكل محافظة ببيانات حقيقية، ومدة المطر وتنبيهات تلقائية
import { el } from '../core/dom.js';
import { CONFIG } from '../config.js';
import { PROVINCES } from '../provinces/provinces.js';
import { load } from '../core/storage.js';
import { openPage } from './page.js';
import { icon } from './icons.js';
import { toast } from './toast.js';
import { openScene } from '../weather/scene.js';
import { fetchProvinces, fetchDust, fetchGrid, fetchRadar, fetchOffices, peek } from '../weather/api.js';
import { describe, kindOf, KIND_COLOR, rainLevel, dustLevel, windDir, hourIndex, rainDuration, durationText, alertsFor } from '../weather/codes.js';
import { useMap, addWeatherLayers, setWeatherData, showWeatherLayers, setRadar, playRadar, radarPlaying, hasRadar, clearRadar } from '../weather/layers.js';
import { setFxCells, startFx, stopFx } from '../weather/fx.js';
let wmap = null, timer = 0, D = null, panel = null, radarLbl = null, playBtn = null, view = 'main';
const hm = d => new Date(d).toLocaleTimeString('ar-IQ', { hour: 'numeric', minute: '2-digit' });
const hourLbl = t => new Date(t).toLocaleTimeString('ar-IQ', { hour: 'numeric' });
const nm = ['coalesce', ['get', 'name:ar'], ['get', 'name']];
// خريطة طقس نظيفة: ماء، حدود المحافظات، طرق رئيسية خفيفة، أسماء المدن
const style = () => ({ version: 8, glyphs: CONFIG.glyphs, sources: { osm: { type: 'vector', url: CONFIG.tilejson } }, layers: [
  { id: 'bg', type: 'background', paint: { 'background-color': '#eef2f5' } },
  { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': '#b8d8f0' } },
  { id: 'waterway', type: 'line', source: 'osm', 'source-layer': 'waterway', paint: { 'line-color': '#b8d8f0', 'line-width': 1.2 } },
  { id: 'prov', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['==', 'admin_level', 4], paint: { 'line-color': '#9aa7b8', 'line-width': 1, 'line-dasharray': [3, 2] } },
  { id: 'roads', type: 'line', source: 'osm', 'source-layer': 'transportation', filter: ['in', 'class', 'motorway', 'trunk', 'primary'], paint: { 'line-color': '#d4dbe3', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 10, 2.5] } },
  { id: 'places', type: 'symbol', source: 'osm', 'source-layer': 'place', filter: ['in', 'class', 'city', 'town'], minzoom: 6.5, layout: { 'text-field': nm, 'text-font': CONFIG.font, 'text-size': 12 }, paint: { 'text-color': '#5b6b80', 'text-halo-color': '#fff', 'text-halo-width': 1.6 } }] });
function addMask(m) {
  const rings = load('countryRings-v1', null); if (!rings?.length) return;
  const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
  m.addSource('mask', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [world, ...rings] } } });
  m.addSource('outline', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: rings } } });
  m.addLayer({ id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': '#eef2f5' } });
  m.addLayer({ id: 'outline', type: 'line', source: 'outline', paint: { 'line-color': '#d94b6a', 'line-width': 1.6 } });
}
function build(prov, dust) {
  return PROVINCES.map((p, i) => {
    const j = prov[i], cur = j.current, h = j.hourly, i0 = hourIndex(h, cur.time), dv = dust?.[i]?.current?.dust ?? null;
    const [desc, kind] = describe(cur.weather_code);
    return { ...p, i, cur, h, i0, daily: j.daily, temp: cur.temperature_2m, code: cur.weather_code, desc, kind, wd: cur.wind_direction_10m, ws: cur.wind_speed_10m, dust: dv, aq: dust?.[i]?.current || null, dur: rainDuration(h, i0), alerts: alertsFor(cur, h, i0, dv ?? 0), mm: cur.precipitation || 0 };
  });
}
const alertRow = (name, a) => el('div', { class: 'wx-alert lv' + a.lv }, icon(a.lv === 3 ? 'alert' : 'info', { size: 20, anim: '' }), el('span', {}, el('b', {}, name), ' · ' + a.t));
function renderMain() {
  view = 'main';
  const P = D.provinces, alerts = P.flatMap(p => p.alerts.map(a => ({ name: p.name, ...a }))).sort((a, b) => b.lv - a.lv), wet = P.filter(p => p.mm >= 0.1 || ['rain', 'storm', 'snow'].includes(p.kind));
  radarLbl = el('small', { class: 'muted' }, hasRadar() ? '' : 'الرادار غير متاح حالياً');
  playBtn = el('button', { class: 'btn sm', type: 'button', onclick: () => { playBtn.replaceChildren(icon(playRadar(!radarPlaying()) ? 'pause' : 'play', { size: 18, anim: '' }), radarPlaying() ? 'إيقاف' : 'تشغيل الرادار'); } }, icon('play', { size: 18, anim: '' }), 'تشغيل الرادار');
  panel.replaceChildren(
    el('div', { class: 'wx-live' }, el('i', { class: 'wx-dot' }), el('b', {}, 'بث مباشر'), el('span', { class: 'muted' }, 'آخر تحديث ' + hm(D.at)), el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تحديث', onclick: () => refresh(true) }, icon('refresh', { size: 18, anim: '' }))),
    el('p', { class: 'muted', style: 'margin:4px 0;font-size:0.8438rem' }, wet.length ? `تمطر الآن في ${wet.length} محافظة، والمطر والعواصف تظهر فوق اسم المحافظة فقط.` : 'ما في مطر حالياً بمحافظات العراق حسب البيانات، فما يظهر مطر على الخريطة.'),
    el('div', { class: 'section' }, 'التنبيهات' + (alerts.length ? ` (${alerts.length})` : '')),
    ...(alerts.length ? alerts.slice(0, 12).map(a => alertRow(a.name, a)) : [el('p', { class: 'muted' }, 'لا توجد تنبيهات عواصف أو أمطار غزيرة أو غبار حالياً.')]),
    el('div', { class: 'section' }, 'أين تمطر الآن'),
    wet.length ? el('div', { class: 'list' }, ...wet.map(p => el('button', { class: 'row', type: 'button', onclick: () => detail(p) }, el('span', { class: 'ic', style: `--c:${KIND_COLOR[p.kind]}` }, icon('rain', { size: 22, anim: '' })),
      el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, `${p.desc} · ${rainLevel(p.mm)}`)), el('span', { class: 'end' }, durationText(p.dur).replace('تمطر الآن وتستمر ', 'تستمر ')))))
      : el('p', { class: 'muted' }, 'ما في مطر مسجّل حالياً بمراكز المحافظات.'),
    el('div', { class: 'section' }, 'الرادار'), el('div', { class: 'wx-radar' }, hasRadar() ? playBtn : null, radarLbl),
    el('div', { class: 'section' }, 'المحافظات'),
    el('div', { class: 'list' }, ...[...P].sort((a, b) => b.alerts.length - a.alerts.length || a.i - b.i).map(p => el('button', { class: 'row', type: 'button', onclick: () => detail(p) },
      el('span', { class: 'ic', style: `--c:${KIND_COLOR[p.kind]}` }, el('b', { class: 'wx-t' }, Math.round(p.temp) + '°')),
      el('span', { class: 'tx' }, el('b', {}, p.name), el('small', {}, `${p.desc} · رياح ${Math.round(p.ws)} كم/س ${windDir(p.wd)}`)),
      el('span', { class: 'end' }, p.alerts.length ? el('span', { class: 'wx-badge' }, p.alerts.length + ' تنبيه') : null)))),
    el('div', { class: 'section' }, 'مكاتب ومحطات الأرصاد'),
    D.offices.length ? el('div', { class: 'list' }, ...D.offices.slice(0, 30).map(o => el('button', { class: 'row', type: 'button', onclick: () => wmap.flyTo({ center: [o.lng, o.lat], zoom: 10, duration: 1200 }) }, el('span', { class: 'ic', style: '--c:#0b7285' }, icon('pin', { size: 22, anim: '' })), el('span', { class: 'tx' }, el('b', {}, o.name)))))
      : el('p', { class: 'muted' }, 'ما لقينا مكاتب أرصاد مسجّلة بخريطة OpenStreetMap. القراءات من نماذج الطقس عند مراكز المحافظات.'),
    el('p', { class: 'muted', style: 'font-size:0.7812rem;margin-top:14px' }, 'المصادر: Open-Meteo (نماذج الطقس والغبار)، RainViewer (الرادار، تغطيته فوق العراق قد تكون محدودة)، OpenStreetMap. يتحدث كل 5 دقائق.'));
}
function detail(p) { openScene(p); }
// تأثيرات المطر والعواصف فوق المحافظات اللي تمطر فقط
const fxFrom = (P, G = D?.grid || []) => setFxCells(P.map(p => {
  const near = G.filter(g => Math.abs(g.lng - p.lng) <= p.size && Math.abs(g.lat - p.lat) <= p.size * 0.85);
  const mm = Math.max(p.mm || 0, ...near.map(g => g.p || 0)), storm = p.code >= 95 || near.some(g => g.code >= 95);
  return mm >= 0.1 || storm || ['rain', 'storm', 'snow'].includes(p.kind) ? { lng: p.lng, lat: p.lat, mm: Math.max(mm, 0.4), storm, rd: Math.min(0.75, Math.max(0.25, p.size * 0.75)) } : null;
}).filter(Boolean));
function apply(prov, dust) {
  D.provinces = build(prov, dust); setWeatherData(D); fxFrom(D.provinces);
  if (view === 'main') renderMain();
}
async function refresh(manual) {
  if (!wmap) return;
  // نعرض آخر بيانات محفوظة فوراً، وبعدها يوصل الجديد ويتحدث تلقائياً
  if (!D) { const old = peek('wx:prov2'); D = { provinces: [], grid: peek('wx:grid2') || [], offices: peek('wx:offices') || [], at: Date.now() }; if (old) apply(old, peek('wx:dust2')); else panel.replaceChildren(el('div', { class: 'spinner' }), el('p', { class: 'muted', style: 'text-align:center' }, 'نجيب الطقس الحقيقي…')); }
  const pD = fetchDust().catch(() => null), pG = fetchGrid().catch(() => null);
  fetchRadar().then(r => { if (wmap) setRadar(r.host, r.frames, (i, f) => { if (radarLbl && f) radarLbl.textContent = `${hm(f.time * 1000)} · ${f.future ? 'توقع' : 'ماضي'}`; }); showWeatherLayers(true); }).catch(() => {});
  fetchOffices().then(o => { if (!wmap || !D) return; D.offices = o; setWeatherData(D); if (view === 'main' && D.provinces.length) renderMain(); }).catch(() => {});
  let prov;
  try { prov = await fetchProvinces(); } catch { if (!D.provinces.length) panel.replaceChildren(el('p', { class: 'muted' }, 'تعذّر جلب الطقس. تأكد من الإنترنت.'), el('button', { class: 'btn primary block', type: 'button', onclick: () => refresh(true) }, 'أعد المحاولة')); else if (manual) toast('تعذّر التحديث'); return; }
  if (!wmap) return;
  D.at = Date.now(); apply(prov, peek('wx:dust2')); showWeatherLayers(true);
  pD.then(dust => { if (wmap && dust) apply(prov, dust); });
  pG.then(grid => { if (wmap && grid) { D.grid = grid; setWeatherData(D); fxFrom(D.provinces, grid); if (view === 'main') renderMain(); } });
  if (manual) toast('تم التحديث');
}
function cleanup() { view = 'main'; clearInterval(timer); stopFx(); playRadar(false); clearRadar(); try { wmap?.remove(); } catch {} wmap = null; D = null; useMap(null); }
export function showWeather() {
  const mapBox = el('div', { class: 'wx-map' }); panel = el('div', { class: 'wx-panel' });
  openPage('الأحوال الجوية', el('div', { class: 'wx-page' }, mapBox, panel), { cls: 'wx-pg', onClose: cleanup, extra: el('span', { class: 'wx-live-tag' }, el('i', { class: 'wx-dot' }), 'مباشر') });
  wmap = new maplibregl.Map({ container: mapBox, style: style(), bounds: CONFIG.iraqBounds, fitBoundsOptions: { padding: 16 }, maxBounds: CONFIG.maxBounds, minZoom: 4.5, maxZoom: 11, attributionControl: { compact: true }, pixelRatio: Math.min(window.devicePixelRatio || 1, 2), dragRotate: false, pitchWithRotate: false });
  try { maplibregl.setRTLTextPlugin(CONFIG.rtlPlugin, true).catch(() => {}); } catch {}
  wmap.touchZoomRotate.disableRotation();
  useMap(wmap);
  wmap.on('load', () => { addMask(wmap); addWeatherLayers(); startFx(wmap, mapBox); refresh(false); timer = setInterval(() => refresh(false), 5 * 60e3); });
  wmap.on('click', e => { const f = wmap.queryRenderedFeatures([[e.point.x - 18, e.point.y - 18], [e.point.x + 18, e.point.y + 18]], { layers: ['wx-pts-c', 'wx-pts-l'].filter(l => wmap.getLayer(l)) })[0]; const p = f && D?.provinces.find(x => x.name === f.properties.name); if (p) detail(p); });
}
