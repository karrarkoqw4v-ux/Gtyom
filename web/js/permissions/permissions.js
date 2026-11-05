// الصلاحيات: الموقع، إبقاء الشاشة، التخزين، البوصلة
export const isSecure = () => window.isSecureContext;

export async function locationState() {
  try { return (await navigator.permissions.query({ name: 'geolocation' })).state; } catch { return 'prompt'; }
}
export function requestLocation() {
  return new Promise(res => {
    if (!('geolocation' in navigator)) return res({ ok: false, reason: 'unsupported' });
    navigator.geolocation.getCurrentPosition(
      p => res({ ok: true, coords: p.coords }),
      e => res({ ok: false, reason: e.code === 1 ? 'denied' : 'unavailable' }),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}
let lock = null;
export async function keepScreenOn(on) {
  if (window.Android?.keepScreenOn) { try { window.Android.keepScreenOn(!!on); } catch {} return; }
  try {
    if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen');
    else if (lock) { await lock.release(); lock = null; }
  } catch {}
}
export async function persistStorage() {
  try { return await navigator.storage.persist(); } catch { return false; }
}
export async function compassPermission() {
  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try { return (await D.requestPermission()) === 'granted'; } catch { return false; }
  }
  return true;
}
