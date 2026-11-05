// مجسمات ثلاثية الأبعاد للحدائق والمواقف والمحطات والمدارس بحسب شكلها الحقيقي من OpenStreetMap
const M = 111320, D = Math.PI / 180;
const off = (c, dx, dy) => [c[0] + dx / (M * Math.cos(c[1] * D)), c[1] + dy / M];
const F = (g, base, top, color) => ({ type: 'Feature', properties: { base, top, color }, geometry: { type: 'Polygon', coordinates: g } });
const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
const rng = seed => { let a = seed | 1; return () => { a = Math.imul(a ^ a >>> 15, 1 | a); a ^= a + Math.imul(a ^ a >>> 7, 61 | a); return ((a ^ a >>> 14) >>> 0) / 4294967296; }; };
const disc = (c, r, n = 10) => { const ring = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; ring.push(off(c, r * Math.cos(t), r * Math.sin(t))); } ring.push(ring[0]); return [ring]; };
const rect = (c, w, h) => { const p = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => off(c, x, y)); p.push(p[0]); return [p]; };
const inside = (pt, ring) => { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
const bbox = ring => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; ring.forEach(([x, y]) => { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); }); return [a, c, b, d]; };
const sizeM = bb => [(bb[2] - bb[0]) * M * Math.cos(bb[1] * D), (bb[3] - bb[1]) * M];
const ok = p => p.ring && p.ring.length >= 4 && Math.max(...sizeM(bbox(p.ring))) < 600;
const CARS = ['#e03131', '#1971c2', '#f1f3f5', '#343a40', '#f59f00', '#2f9e44', '#9c36b5'];

function park(p) {
  if (!(p.ring && p.ring.length >= 4 && Math.max(...sizeM(bbox(p.ring))) < 1500)) return [];
  const bb = bbox(p.ring), [w, h] = sizeM(bb), r = rng(hash(p.id)), f = [F([p.ring], 0, 0.3, '#bfe3a6')];
  const want = Math.min(60, Math.floor(w * h / 350));
  for (let k = 0, n = 0; k < 200 && n < want; k++) {
    const pt = [bb[0] + r() * (bb[2] - bb[0]), bb[1] + r() * (bb[3] - bb[1])];
    if (!inside(pt, p.ring)) continue; n++;
    f.push(F(disc(pt, 0.3, 6), 0.3, 2.4, '#8d6e4f'), F(disc(pt, 1.9, 9), 2.4, 5.2, '#58b368'), F(disc(pt, 1.2, 8), 5.2, 6.8, '#7bd88f'));
  }
  return f;
}
function parking(p) {
  if (!ok(p)) return [];
  const bb = bbox(p.ring), [w, h] = sizeM(bb), r = rng(hash(p.id)), f = [F([p.ring], 0, 0.2, '#cfd4da')];
  const c0 = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
  let n = 0;
  for (let x = -w / 2 + 2; x < w / 2 - 1 && n < 30; x += 3.2) for (let y = -h / 2 + 3; y < h / 2 - 2 && n < 30; y += 5.8) {
    const c = off(c0, x, y); if (!inside(c, p.ring) || r() < 0.4) continue; n++;
    f.push(F(rect(c, 1.8, 4.2), 0.25, 1.5, CARS[Math.floor(r() * CARS.length)]), F(rect(c, 1.5, 1.8), 1.5, 2.1, '#adb5bd'));
  }
  return f;
}
function bus(p) {
  const c = [p.lng, p.lat];
  if (ok(p)) return [F([p.ring], 0, 6, '#dbe4ff'), F([p.ring], 6, 6.9, '#1d6fe0')];
  const f = [F(rect(c, 32, 9), 0, 0.4, '#ced4da'), F(rect(c, 32, 9), 4.2, 4.7, '#1d6fe0')];
  [-15, 15].forEach(x => [-3.5, 3.5].forEach(y => f.push(F(rect(off(c, x, y), 0.6, 0.6), 0, 4.2, '#868e96'))));
  [-10, 0, 10].forEach((x, i) => f.push(F(rect(off(c, x, 0), 10.5, 2.6), 0.5, 3.4, ['#e8590c', '#1d6fe0', '#2f9e44'][i]), F(rect(off(c, x, 0), 9.5, 2.7), 2.2, 2.9, '#bfe3ff')));
  return f;
}
function school(p) {
  if (ok(p)) return [F([p.ring], 0, 9, '#fff3bf'), F([p.ring], 9, 9.9, '#f59f00')];
  const c = [p.lng, p.lat]; return [F(rect(c, 30, 12), 0, 9, '#fff3bf'), F(rect(c, 30.5, 12.5), 9, 9.9, '#f59f00')];
}
const BY = { park, parking, bus, school };
export const hasExtra = cat => !!BY[cat];
export const extraModel = p => (BY[p.cat] ? BY[p.cat](p) : []);
