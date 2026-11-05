// مجسمات ثلاثية الأبعاد مفصّلة: محطة وقود بمظلتها، مستشفى بالصليب، سوق، مول، جامع، فندق، مصرف، وقصور ومجالس حكومية
const M = 111320, D = Math.PI / 180;
const off = (c, dx, dy) => [c[0] + dx / (M * Math.cos(c[1] * D)), c[1] + dy / M];
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
// مستطيل بمركز مزاح (ox,oy) بالأمتار ثم يدور مع المبنى
const box = (c, rot, w, h, ox = 0, oy = 0) => {
  const a = rot * D, pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => { const [rx, ry] = rot2(x + ox, y + oy, a); return off(c, rx, ry); });
  pts.push(pts[0]); return [pts];
};
const disc = (c, r, ox = 0, oy = 0, rot = 0, n = 22) => {
  const [mx, my] = rot2(ox, oy, rot * D), cc = off(c, mx, my), ring = [];
  for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; ring.push(off(cc, r * Math.cos(t), r * Math.sin(t))); }
  ring.push(ring[0]); return [ring];
};
const F = (g, base, top, color) => ({ type: 'Feature', properties: { base, top, color }, geometry: { type: 'Polygon', coordinates: g } });
const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
export const centroid = ring => { const n = ring.length - 1; let x = 0, y = 0; for (let i = 0; i < n; i++) { x += ring[i][0]; y += ring[i][1]; } return [x / n, y / n]; };
export const ringSize = ring => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; ring.forEach(([x, y]) => { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); }); return Math.max((b - a) * M * Math.cos(c * D), (d - c) * M); };

function dome(c, r, base, rot, gold = '#e6b445', gold2 = '#f3cf75') {
  const f = [], N = 8, hd = r * 1.25;
  f.push(F(disc(c, r * 1.06, 0, 0, rot), base, base + 2.4, '#c99a2e'));
  for (let j = 0; j < N; j++) { const t0 = j / N * Math.PI / 2, t1 = (j + 1) / N * Math.PI / 2; f.push(F(disc(c, Math.max(0.5, r * Math.cos((t0 + t1) / 2)), 0, 0, rot), base + 2.4 + hd * Math.sin(t0), base + 2.4 + hd * Math.sin(t1), j > 5 ? gold2 : gold)); }
  f.push(F(disc(c, 0.45, 0, 0, rot, 8), base + 2.4 + hd, base + 2.4 + hd + 5, '#c99a2e'));
  return f;
}
const fuel = (c, r) => [
  F(box(c, r, 18, 11), 5.2, 6.0, '#f76707'), F(box(c, r, 18.4, 11.4), 6.0, 6.5, '#ffffff'), F(box(c, r, 18, 11), 6.5, 6.9, '#e03131'),
  ...[[-7.5, -3.5], [7.5, -3.5], [-7.5, 3.5], [7.5, 3.5]].map(([x, y]) => F(box(c, r, 0.9, 0.9, x, y), 0, 5.2, '#adb5bd')),
  F(box(c, r, 3.2, 1.1, -3, 0), 0, 1.5, '#e03131'), F(box(c, r, 3.2, 1.1, 3, 0), 0, 1.5, '#e03131'),
  F(box(c, r, 9, 7, 15, 0), 0, 3.6, '#f1f3f5'), F(box(c, r, 9.6, 7.6, 15, 0), 3.6, 4.2, '#f76707')];
const health = (c, r) => [
  F(box(c, r, 24, 16), 0, 16, '#f8f9fa'), F(box(c, r, 24.5, 16.5), 5.5, 6.7, '#74c0fc'), F(box(c, r, 24.5, 16.5), 10.5, 11.7, '#74c0fc'),
  F(box(c, r, 10, 12, -17, 0), 0, 10, '#f1f3f5'), F(box(c, r, 10.4, 12.4, -17, 0), 10, 10.8, '#e03131'),
  F(box(c, r, 24.6, 16.6), 16, 16.9, '#e03131'), F(box(c, r, 8.4, 2.6), 16.9, 17.8, '#ffffff'), F(box(c, r, 2.6, 8.4), 16.9, 17.8, '#ffffff')];
const market = (c, r) => [
  F(box(c, r, 22, 14), 0, 7, '#fcc2d7'), F(box(c, r, 22.6, 14.6), 7, 7.7, '#d6336c'), F(box(c, r, 22.4, 2.2, 0, -7.2), 3.4, 4.1, '#d6336c'),
  F(box(c, r, 12, 1.2, 0, -7.4), 4.6, 6.6, '#ffffff'), F(box(c, r, 5, 2, 7, 0), 7.7, 9.2, '#a61e4d')];
const mall = (c, r) => [
  F(box(c, r, 38, 22), 0, 13, '#d0bfff'), F(box(c, r, 38.5, 22.5), 5, 8, '#b197fc'), F(box(c, r, 38.6, 22.6), 13, 14.2, '#7048e8'),
  F(box(c, r, 9, 7, 0, -12), 0, 19, '#9775fa'), F(box(c, r, 9.6, 7.6, 0, -12), 19, 20, '#7048e8')];
const mosque = (c, r) => [F(box(c, r, 14, 14), 0, 8, '#e9f7ec'), F(box(c, r, 14.5, 14.5), 8, 8.8, '#2b8a3e'), ...dome(c, 4.6, 8.8, r, '#2b8a3e', '#51cf66'),
  F(disc(c, 1.3, 9, 9, r, 12), 0, 22, '#ffffff'), F(disc(c, 1.9, 9, 9, r, 12), 17, 18, '#2b8a3e'), F(disc(c, 1.0, 9, 9, r, 10), 22, 25, '#2b8a3e')];
const hotel = (c, r) => [F(box(c, r, 14, 12), 0, 34, '#e5dbff'), ...[8, 14, 20, 26].map(h => F(box(c, r, 14.4, 12.4), h, h + 1.1, '#be4bdb')), F(box(c, r, 14.6, 12.6), 34, 35, '#ae3ec9'), F(box(c, r, 8, 2), 35, 37, '#ae3ec9')];
const bank = (c, r) => [F(box(c, r, 16, 12), 0, 9, '#c5f6fa'), F(box(c, r, 17, 13), 9, 10, '#1098ad'), ...[-6, -2, 2, 6].map(x => F(box(c, r, 1.2, 1.2, x, -7), 0, 9, '#ffffff'))];
const gov = (c, r) => [
  F(box(c, r, 46, 20), 0, 18, '#e7d8b4'), F(box(c, r, 47, 21), 18, 19.4, '#c9a24a'),
  ...[-18, -12, -6, 0, 6, 12, 18].map(x => F(box(c, r, 1.6, 1.6, x, -11.5), 0, 14, '#ffffff')), F(box(c, r, 40, 4, 0, -12), 14, 15.2, '#ffffff'),
  F(box(c, r, 14, 14, 0, 0), 19.4, 30, '#e7d8b4'), F(box(c, r, 15, 15), 30, 31, '#c9a24a'),
  F(box(c, r, 14, 16, -30, 0), 0, 14, '#efe3c4'), F(box(c, r, 14.6, 16.6, -30, 0), 14, 15, '#c9a24a'),
  F(box(c, r, 14, 16, 30, 0), 0, 14, '#efe3c4'), F(box(c, r, 14.6, 16.6, 30, 0), 14, 15, '#c9a24a'),
  ...dome(c, 5.6, 31, r), F(disc(c, 0.5, 0, 0, r, 8), 40, 47, '#c99a2e')];
const generic = (c, r, col) => [F(box(c, r, 12, 9), 0, 6, '#f1f3f5'), F(box(c, r, 12.5, 9.5), 6, 6.8, col)];
const BY = { fuel, health, market, mall, mosque, hotel, bank, gov };
export const has3D = cat => !!BY[cat];

// ارتفاعات وألوان عند وجود مضلع حقيقي للبناية
const FOOT = { fuel: [4.8, '#f76707'], health: [16, '#f8f9fa'], market: [8, '#fcc2d7'], mall: [14, '#d0bfff'], mosque: [9, '#e9f7ec'], hotel: [30, '#e5dbff'], bank: [10, '#c5f6fa'], gov: [22, '#e7d8b4'] };
const ROOF = { fuel: '#e03131', health: '#e03131', market: '#d6336c', mall: '#7048e8', mosque: '#2b8a3e', hotel: '#ae3ec9', bank: '#1098ad', gov: '#c9a24a' };
export function modelFor(p) {
  const cat = p.cat, c = [p.lng, p.lat], r = (hash(p.id) % 30) - 15;
  if (p.ring && p.ring.length >= 4 && ringSize(p.ring) < 160) {
    const [h, col] = FOOT[cat] || [7, '#f1f3f5'], f = [F([p.ring], cat === 'fuel' ? 4.8 : 0, cat === 'fuel' ? 5.6 : h, col), F([p.ring], cat === 'fuel' ? 5.6 : h, (cat === 'fuel' ? 5.6 : h) + 0.9, ROOF[cat] || p.color || '#868e96')];
    const cc = centroid(p.ring);
    if (cat === 'health') f.push(F(box(cc, 0, 8.4, 2.6), h + 0.9, h + 1.8, '#fff'), F(box(cc, 0, 2.6, 8.4), h + 0.9, h + 1.8, '#fff'));
    if (cat === 'gov') f.push(...dome(cc, Math.min(7, ringSize(p.ring) / 5), h + 0.9, 0), F(disc(cc, 0.5, 0, 0, 0, 8), h + 11, h + 18, '#c99a2e'));
    if (cat === 'mosque') f.push(...dome(cc, Math.min(5, ringSize(p.ring) / 4), h + 0.9, 0, '#2b8a3e', '#51cf66'));
    if (cat === 'fuel') f.push(F(disc(cc, 0.5, 0, 0, 0, 6), 0, 4.8, '#adb5bd'));
    return f;
  }
  return (BY[cat] || ((cc, rr) => generic(cc, rr, p.color || '#868e96')))(c, r);
}
