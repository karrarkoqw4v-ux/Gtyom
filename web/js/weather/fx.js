// مطر وعواصف واقعية فوق الأماكن اللي بيها مطر فعلاً (حسب البيانات)، المطر ثابت على مكانه الجغرافي ويتحرك مع الخريطة
let m = null, box = null, cv = null, ctx = null, raf = 0, last = 0, cells = [], drops = [], bolts = [], flashes = [];
export function setFxCells(list) { cells = list.filter(c => c.mm >= 0.1 || c.storm); drops = []; }
const cellR = c => { const a = m.project([c.lng, c.lat]), b2 = m.project([c.lng + (c.rd || c.rDeg || 0.24), c.lat]); return { x: a.x, y: a.y, r: Math.abs(b2.x - a.x) }; };
function spawn(ci, c, scr) {
  const ang = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * scr.r;
  return { ci, dx: Math.cos(ang) * d, dy: Math.sin(ang) * d - scr.r * 0.3, l: 8 + Math.random() * 14 + Math.min(10, c.mm * 2), v: 9 + Math.random() * 9 + Math.min(10, c.mm * 1.5), life: 0, max: scr.r * 0.6 + Math.random() * scr.r * 0.4, a: 0.35 + Math.min(0.4, c.mm / 10) };
}
function frame(t) {
  raf = requestAnimationFrame(frame);
  if (t - last < 33 || !m) return; last = t;
  const W = box.clientWidth, H = box.clientHeight;
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  ctx.clearRect(0, 0, W, H);
  if (!cells.length) return;
  const scr = cells.map(cellR);
  // سحب داكنة فوق العواصف
  cells.forEach((c, i) => { if (!c.storm) return; const s = scr[i]; const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 1.2); g.addColorStop(0, 'rgba(40,40,75,.28)'); g.addColorStop(1, 'rgba(40,40,75,0)'); ctx.fillStyle = g; ctx.fillRect(s.x - s.r * 1.2, s.y - s.r * 1.2, s.r * 2.4, s.r * 2.4); });
  // عدد القطرات حسب شدة المطر وحجم المنطقة على الشاشة
  const want = cells.map((c, i) => scr[i].r < 4 || scr[i].x < -scr[i].r || scr[i].x > W + scr[i].r || scr[i].y < -scr[i].r || scr[i].y > H + scr[i].r ? 0 : Math.min(220, Math.round((22 + c.mm * 26) * Math.min(2.2, scr[i].r / 40))));
  const have = new Array(cells.length).fill(0); drops.forEach(d => have[d.ci]++);
  cells.forEach((c, i) => { for (let k = have[i]; k < want[i] && drops.length < 900; k++) drops.push(spawn(i, c, scr[i])); });
  ctx.lineCap = 'round';
  drops = drops.filter(d => {
    const s = scr[d.ci], c = cells[d.ci]; if (!s || want[d.ci] === 0) return false;
    d.life += d.v; d.dy += d.v;
    if (d.life > d.max) { Object.assign(d, spawn(d.ci, c, s)); }
    const x = s.x + d.dx, y = s.y + d.dy, sl = 0.18;
    ctx.strokeStyle = `rgba(${c.storm ? '90,110,170' : '60,120,200'},${d.a})`; ctx.lineWidth = c.mm > 5 ? 1.7 : 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - d.l * sl, y + d.l); ctx.stroke();
    return true;
  });
  // برق: شرارة متعرّجة وومضة فوق خلايا العاصفة
  cells.forEach((c, i) => {
    if (!c.storm || Math.random() > 0.012) return; const s = scr[i];
    const pts = [[s.x + (Math.random() - .5) * s.r, s.y - s.r * 0.8]]; for (let k = 0; k < 6; k++) { const p = pts[pts.length - 1]; pts.push([p[0] + (Math.random() - .5) * s.r * 0.35, p[1] + s.r * 0.25]); }
    bolts.push({ pts, a: 1 }); flashes.push({ x: s.x, y: s.y, r: s.r * 1.4, a: 0.5 });
  });
  flashes = flashes.filter(f => { const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); g.addColorStop(0, `rgba(255,255,240,${f.a})`); g.addColorStop(1, 'rgba(255,255,240,0)'); ctx.fillStyle = g; ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); f.a *= 0.75; return f.a > 0.02; });
  bolts = bolts.filter(b => { ctx.strokeStyle = `rgba(255,255,255,${b.a})`; ctx.lineWidth = 2.4; ctx.shadowColor = '#cfe3ff'; ctx.shadowBlur = 12; ctx.beginPath(); b.pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.shadowBlur = 0; b.a *= 0.7; return b.a > 0.05; });
}
export function startFx(map, container) { stopFx(); m = map; box = container; cv = document.createElement('canvas'); cv.className = 'wx-fx'; box.append(cv); ctx = cv.getContext('2d'); raf = requestAnimationFrame(frame); }
export function stopFx() { cancelAnimationFrame(raf); cv?.remove(); cv = ctx = m = box = null; drops = []; bolts = []; flashes = []; }
