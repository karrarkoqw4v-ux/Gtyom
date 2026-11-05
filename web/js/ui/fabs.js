// الأزرار العائمة: موقعي، البوصلة، ثلاثي الأبعاد
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { map } from '../map/map.js';
import { northUp, toggle3D } from '../map/camera.js';
import { icon } from './icons.js';
export function renderFabs() {
  const needle = el('span', { class: 'needle' }, icon('compass', { size: 24, anim: '' }));
  const btn3d = el('button', { class: 'fab', 'aria-label': 'تبديل ثلاثي الأبعاد', onclick: () => toggle3D() }, icon('cube', { size: 24, anim: 'float' }));
  document.getElementById('fabs').replaceChildren(
    el('button', { class: 'fab primary', 'aria-label': 'موقعي', onclick: () => emit('ui:locate') }, icon('target', { size: 24 })),
    el('button', { class: 'fab', 'aria-label': 'اتجاه الشمال', onclick: northUp }, needle),
    btn3d,
    el('button', { class: 'fab', 'aria-label': 'الطبقات', onclick: () => emit('ui:layers') }, icon('layers', { size: 24, anim: '' })));
  map.on('rotate', () => { needle.style.transform = `rotate(${-map.getBearing()}deg)`; });
  map.on('pitchend', () => btn3d.classList.toggle('on', map.getPitch() > 10));
}
