// تحديث التطبيق: يتحقق دائماً من النسخة الجديدة ويعيد التحميل تلقائياً
export function initAutoUpdate() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  const had = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
    const check = () => reg.update().catch(() => {});
    if (window.Android) return; // داخل التطبيق: التحديث يجي مع نسخة التطبيق
    check();
    setInterval(check, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    window.addEventListener('online', check);
  }).catch(() => {});
}
// تحديث إجباري: يمسح ملفات التطبيق المخزنة (ويبقي الخرائط المنزّلة)
export async function forceUpdate() {
  try {
    (await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.startsWith('khartkum-shell')).map(k => caches.delete(k)));
  } catch {}
  location.replace(location.pathname + '?u=' + Date.now());
}
