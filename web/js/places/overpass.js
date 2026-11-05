// جلب الأماكن من OpenStreetMap عبر Overpass: نرسل لعدة خوادم بنفس الوقت وناخذ أسرع جواب
import { CONFIG } from '../config.js';
const MIRRORS = [CONFIG.overpass, 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const busy = () => new Error('الخادم مشغول، جرّب بعد شوي');
async function post(q, signal, ms = 14000) {
  const ctrls = MIRRORS.map(() => new AbortController());
  const stop = () => ctrls.forEach(c => c.abort());
  let user = false; signal?.addEventListener('abort', () => { user = true; stop(); });
  const timer = setTimeout(stop, ms);
  try {
    return await Promise.any(MIRRORS.map((u, i) => fetch(u, {
      method: 'POST', signal: ctrls[i].signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q)
    }).then(async r => { if (!r.ok) throw busy(); const j = await r.json(); ctrls.forEach((c, k) => k !== i && c.abort()); return j; })));
  } catch (e) {
    if (user) throw Object.assign(new Error('abort'), { name: 'AbortError' });
    throw busy();
  } finally { clearTimeout(timer); }
}
const r6 = n => Math.round(n * 1e6) / 1e6;
// نقاط: بيانات كاملة، مساحات: مضلع البناية + المركز، علاقات: المركز فقط
const wrap = (parts, n = 80, t = 12) => `[out:json][timeout:${t}];(${parts})->.r;node.r;out ${n};way.r;out tags center geom ${n};rel.r;out tags center ${Math.ceil(n / 2)};`;
export function parse(json) {
  return (json.elements || []).map(e => {
    const t = e.tags || {}, lng = e.lon ?? e.center?.lon, lat = e.lat ?? e.center?.lat;
    let ring = null;
    const g = e.geometry;
    if (g && g.length >= 4 && g[0].lat === g[g.length - 1].lat && g[0].lon === g[g.length - 1].lon) ring = g.map(p => [r6(p.lon), r6(p.lat)]);
    return { id: e.type + '/' + e.id, lng, lat, name: t['name:ar'] || t.name || '', tags: t, ring };
  }).filter(p => p.lng != null);
}
export async function run(parts, signal, n, t) { return parse(await post(wrap(parts, n, t), signal, ((t || 12) + 4) * 1000)); }
export async function queryAround(cat, lng, lat, radius, signal) {
  const parts = cat.q.map(f => `nwr${f}(around:${radius},${lat},${lng});`).join('');
  return (await run(parts, signal)).map(p => ({ ...p, name: p.name || cat.one, icon: cat.icon, color: cat.color, cat: cat.id }));
}

// نسخة خفيفة بدون هندسة الخطوط (للإشارات والعلامات): نقاط ومراكز فقط
export async function runLite(parts, signal, n = 300, t = 15) {
  return parse(await post(`[out:json][timeout:${t}];(${parts});out tags center ${n};`, signal, (t + 4) * 1000));
}
