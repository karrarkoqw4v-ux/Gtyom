// اختيار المركبة: سيارة، دراجة نارية، دراجة، مشي
import { el } from '../core/dom.js';
import { state } from '../core/state.js';
import { save } from '../core/storage.js';
import { VEHICLES } from '../vehicle/vehicles.js';
import { icon } from './icons.js';
export function vehiclePicker(onChange) {
  const box = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'نوع المركبة' });
  const draw = () => box.replaceChildren(...Object.entries(VEHICLES).map(([k, v]) => {
    const on = state.vehicle === k;
    return el('button', { class: on ? 'on' : '', role: 'radio', 'aria-checked': String(on), onclick: () => {
      state.vehicle = k; save('vehicle', k); draw(); onChange?.(k);
    } }, icon(v.icon, { size: 26, anim: on ? 'drive' : '' }), v.name);
  }));
  draw();
  return box;
}
