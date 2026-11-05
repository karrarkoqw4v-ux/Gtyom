// علامات الأماكن القريبة: تظهر بحركة وتطفو، وممكن تظهر باسمها
import { map } from './map.js';
import { iconHTML } from '../ui/icons.js';
import { showPoi3D, clearPoi3D } from './poi3d.js';
let markers = [];
export function showPois(list, onPick, { labels = false, three = false } = {}) {
  clearPois();
  if (three) showPoi3D(list);
  list.forEach((p, i) => {
    const root = document.createElement('div');
    root.className = 'poi-wrap';
    root.innerHTML = `<div class="poi-anim" style="animation-delay:${Math.min(i, 25) * 45}ms"><button class="poi-pin" type="button" title="${p.name.replace(/"/g, '')}" style="--c:${p.color || '#1d6fe0'}">${iconHTML(p.icon, { size: 20, anim: '' })}</button>${labels ? '<span class="poi-lbl"></span>' : ''}</div>`;
    if (labels) root.querySelector('.poi-lbl').textContent = p.name;
    root.querySelector('button').addEventListener('click', ev => { ev.stopPropagation(); onPick(p); });
    markers.push(new maplibregl.Marker({ element: root, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(map));
  });
}
export function clearPois() { markers.forEach(m => m.remove()); markers = []; clearPoi3D(); }
