// عدّاد البيوت (اختياري من الإعدادات، مطفي افتراضياً)
import { map } from './map.js';
import { iconHTML } from '../ui/icons.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
let chip = null, t = null;
export function initBuildingCounter() {
  chip = document.createElement('div');
  chip.className = 'counter'; chip.hidden = true;
  document.body.append(chip);
  const update = () => {
    clearTimeout(t);
    if (!prefs().showCounter || map.getZoom() < 14 || document.body.classList.contains('navigating')) { chip.hidden = true; return; }
    t = setTimeout(() => {
      const seen = new Set();
      map.queryRenderedFeatures({ layers: ['b3d'] }).forEach((f, i) => seen.add(f.id ?? ('i' + i)));
      chip.innerHTML = `${iconHTML('houses', { size: 18, anim: '' })}<b>${seen.size.toLocaleString('ar-IQ')}</b> بيت وبناية بالمنطقة`;
      chip.hidden = seen.size === 0;
    }, 600);
  };
  map.on('moveend', update); on('pref:showCounter', update);
}
