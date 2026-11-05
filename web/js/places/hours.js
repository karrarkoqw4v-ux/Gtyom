// حالة الدوام (مفتوح الآن / مغلق) من وسم opening_hours الحقيقي بالخريطة
const ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], JS = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0 };
const days = spec => { const out = new Set(); spec.split(',').forEach(p => { const m = p.trim().match(/^(Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(Mo|Tu|We|Th|Fr|Sa|Su))?$/); if (!m) return; const i = ORDER.indexOf(m[1]), j = m[2] ? ORDER.indexOf(m[2]) : i; for (let k = i; ; k = (k + 1) % 7) { out.add(JS[ORDER[k]]); if (k === j) break; } }); return out; };
const fmt = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${(h % 12) || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'ص' : 'م'}`; };
const RULE = /^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?\s*,?\s*)+)?\s*(off|closed|\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/i;
export function openStatus(str, now = new Date()) {
  if (!str) return null; const s = String(str).trim();
  if (s === '24/7') return { open: true, text: 'مفتوح 24 ساعة' };
  const day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes(); let hit = null, known = false;
  for (const r of s.split(';').map(x => x.trim()).filter(Boolean)) {
    const m = r.match(RULE); if (!m) continue; known = true;
    if (!(m[1] ? days(m[1]) : new Set([0, 1, 2, 3, 4, 5, 6])).has(day)) continue;
    if (/^(off|closed)$/i.test(m[2])) { hit = { open: false, text: 'مغلق اليوم' }; continue; }
    const rg = m[2].split(',').map(t => { const [a, b] = t.trim().split('-').map(z => z.trim().split(':').map(Number)); return [a[0] * 60 + a[1], b[0] * 60 + b[1]]; });
    const cur = rg.find(([a, b]) => b > a ? mins >= a && mins < b : mins >= a || mins < b);
    if (cur) hit = { open: true, text: `مفتوح الآن · يغلق ${fmt(cur[1])}` };
    else { const nx = rg.find(([a]) => a > mins); hit = { open: false, text: nx ? `مغلق الآن · يفتح ${fmt(nx[0])}` : 'مغلق الآن' }; }
  }
  return known ? hit || { open: false, text: 'مغلق اليوم' } : null;
}
