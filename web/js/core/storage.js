// حفظ الإعدادات محلياً
const P = 'khartkum:';
export function load(key, def) {
  try { const v = localStorage.getItem(P + key); return v === null ? def : JSON.parse(v); } catch { return def; }
}
export function save(key, val) {
  try { localStorage.setItem(P + key, JSON.stringify(val)); } catch {}
}
export function remove(key) { try { localStorage.removeItem(P + key); } catch {} }
