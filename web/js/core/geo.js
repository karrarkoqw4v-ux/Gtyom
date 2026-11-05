// حسابات المسافة والاتجاه
const R = 6371000, D = Math.PI / 180;
export function dist(a, b) {
  const dLat = (b[1] - a[1]) * D, dLng = (b[0] - a[0]) * D;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * D) * Math.cos(b[1] * D) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function bearing(a, b) {
  const y = Math.sin((b[0] - a[0]) * D) * Math.cos(b[1] * D);
  const x = Math.cos(a[1] * D) * Math.sin(b[1] * D) - Math.sin(a[1] * D) * Math.cos(b[1] * D) * Math.cos((b[0] - a[0]) * D);
  return (Math.atan2(y, x) / D + 360) % 360;
}
export function cumulative(line) {
  const c = [0];
  for (let i = 1; i < line.length; i++) c.push(c[i - 1] + dist(line[i - 1], line[i]));
  return c;
}
// أقرب نقطة على المسار
export function project(line, cum, p) {
  const k = Math.cos(p[1] * D), m = R * D;
  let best = { d: Infinity, i: 0, along: 0, point: line[0] };
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    const ax = (a[0] - p[0]) * k * m, ay = (a[1] - p[1]) * m, bx = (b[0] - p[0]) * k * m, by = (b[1] - p[1]) * m;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    let t = L2 ? -(ax * dx + ay * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(ax + t * dx, ay + t * dy);
    if (d < best.d) best = { d, i, along: cum[i] + t * (cum[i + 1] - cum[i]), point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
  }
  return best;
}
export function pointAlong(line, cum, s) {
  const n = line.length;
  if (s <= 0) return { point: line[0], heading: bearing(line[0], line[1] || line[0]) };
  for (let i = 1; i < n; i++) {
    if (cum[i] >= s) {
      const seg = cum[i] - cum[i - 1] || 1, t = (s - cum[i - 1]) / seg, a = line[i - 1], b = line[i];
      return { point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], heading: bearing(a, b) };
    }
  }
  return { point: line[n - 1], heading: bearing(line[n - 2] || line[n - 1], line[n - 1]) };
}
export function fmtDist(m) {
  if (m == null || isNaN(m)) return '';
  if (m < 1000) return Math.max(10, Math.round(m / 10) * 10) + ' م';
  return (m / 1000).toFixed(m < 10000 ? 1 : 0) + ' كم';
}
export function fmtTime(s) {
  const m = Math.round(s / 60);
  if (m < 60) return Math.max(1, m) + ' دقيقة';
  return Math.floor(m / 60) + ' س ' + (m % 60) + ' د';
}
export function clock(sec) {
  return new Date(Date.now() + sec * 1000).toLocaleTimeString('ar-IQ', { hour: 'numeric', minute: '2-digit' });
}
