// ناقل أحداث بسيط بين الوحدات
const bus = new Map();
export function on(name, fn) {
  if (!bus.has(name)) bus.set(name, new Set());
  bus.get(name).add(fn);
  return () => bus.get(name).delete(fn);
}
export function emit(name, data) {
  (bus.get(name) || []).forEach(fn => { try { fn(data); } catch (e) { console.error(name, e); } });
}
