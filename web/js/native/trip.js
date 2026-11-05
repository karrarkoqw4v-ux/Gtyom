// إشعار الرحلة بتطبيق الأندرويد: المسافة والمدة ووقت الوصول وأقرب منعطف، وينتهي برنين عند الوصول
import { fmtDist, fmtTime, clock } from '../core/geo.js';
import { instruction } from '../routing/instructions.js';
const A = () => window.Android;
let dest = '', total = 1, lastKey = '', lastT = 0;
function build(p) {
  const text = `${fmtDist(p.remaining)} · ${fmtTime(p.eta)} · الوصول ${clock(p.eta)}`;
  const turn = p.next ? `${instruction(p.next).text}${p.toNext ? ' بعد ' + fmtDist(p.toNext) : ''}` : 'ابدأ بالتحرك';
  const big = [turn, '', `المسافة المتبقية: ${fmtDist(p.remaining)}`, `الوقت المتبقي: ${fmtTime(p.eta)}`, `وقت الوصول: ${clock(p.eta)}`].join('\n');
  const progress = Math.max(0, Math.min(1000, Math.round((1 - p.remaining / (total || 1)) * 1000)));
  return { title: `الرحلة إلى ${dest}`, text: p.next ? `${text}\n${turn}`.split('\n')[0] : text, big, progress };
}
export function tripStart(destName, route) {
  if (!A()?.tripStart) return;
  dest = destName || 'الوجهة'; total = route.distance || 1; lastKey = ''; lastT = Date.now();
  const n = build({ remaining: route.distance, eta: route.duration, toNext: 0, next: null });
  A().tripStart(n.title, n.text, n.big, n.progress);
}
export function tripUpdate(p) {
  if (!A()?.tripUpdate) return;
  const n = build(p), key = n.text + '|' + n.big.split('\n')[0];
  if (key === lastKey || Date.now() - lastT < 3000) return;
  lastKey = key; lastT = Date.now();
  A().tripUpdate(n.title, n.text, n.big, n.progress);
}
export const tripArrive = () => A()?.tripArrive?.(dest);
export const tripEnd = () => A()?.tripEnd?.();
