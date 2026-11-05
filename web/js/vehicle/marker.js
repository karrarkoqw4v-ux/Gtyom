// علامة مركبة المستخدم: سيارة أو دراجة براكبها أو شخص يمشي، تتحرك بسلاسة على الطريق
import { map } from '../map/map.js';
import { on } from '../core/events.js';
import { state } from '../core/state.js';
import { sprite, vehScale } from './sprites.js';
let marker = null, root = null, veh = null, cur = null, from = null, to = null, t0 = 0, dur = 300, raf = 0;
const lerpA = (a, b, k) => { let d = ((b - a + 540) % 360) - 180; return (a + d * k + 360) % 360; };

function build() {
  root = document.createElement('div');
  root.className = 'me';
  root.innerHTML = '<div class="me-halo"></div><div class="me-veh"></div><div class="me-tri"><svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7be0b3"/><stop offset="1" stop-color="#2f8f6a"/></linearGradient></defs><path d="M24 4L42 42 24 33 6 42z" fill="url(#tg)" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/></svg></div>';
  veh = root.querySelector('.me-veh');
  veh.innerHTML = sprite(state.vehicle);
  marker = new maplibregl.Marker({ element: root, anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' });
}
const scale = () => root && root.style.setProperty('--s', vehScale(map.getZoom()));
function frame(now) {
  const k = Math.min(1, (now - t0) / dur);
  cur = { lng: from.lng + (to.lng - from.lng) * k, lat: from.lat + (to.lat - from.lat) * k, heading: lerpA(from.heading, to.heading, k) };
  marker.setLngLat([cur.lng, cur.lat]); marker.setRotation(cur.heading);
  raf = k < 1 ? requestAnimationFrame(frame) : 0;
}
export function initMarker() {
  on('position', p => {
    const h = p.heading || 0;
    if (!marker) { build(); marker.setLngLat([p.lng, p.lat]).setRotation(h).addTo(map); cur = { lng: p.lng, lat: p.lat, heading: h }; scale(); }
    root.classList.toggle('vmove', state.simulating || (p.speed || 0) > 0.6);
    from = cur; to = { lng: p.lng, lat: p.lat, heading: h }; t0 = performance.now();
    dur = state.simulating ? 260 : 950;
    if (!raf) raf = requestAnimationFrame(frame);
  });
  on('state:vehicle', v => { if (veh) veh.innerHTML = sprite(v); });
  on('compass', h => { if (!state.navigating && marker && cur) { cur.heading = h; marker.setRotation(h); } });
  map.on('zoom', scale);
}
