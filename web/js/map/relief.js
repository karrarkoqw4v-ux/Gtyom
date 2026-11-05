// تضاريس حقيقية (جبال كردستان) وظلال، تعطي إحساس ثلاثي الأبعاد من أول شاشة
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
const DEM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
let terrainOn = false;
function apply() {
  if (!map.getSource('dem')) return;
  const want = prefs().terrain, near = map.getZoom() < 10.8;
  try {
    if (want && near && !terrainOn) { map.setTerrain({ source: 'dem', exaggeration: 1.7 }); terrainOn = true; }
    else if ((!want || !near) && terrainOn) { map.setTerrain(null); terrainOn = false; }
    if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', prefs().relief ? 'visible' : 'none');
  } catch {}
}
export function initRelief() {
  try {
    map.addSource('dem', { type: 'raster-dem', tiles: [DEM], encoding: 'terrarium', tileSize: 256, maxzoom: 11 });
    map.addLayer({ id: 'hillshade', type: 'hillshade', source: 'dem', maxzoom: 9.5, paint: { 'hillshade-exaggeration': 0.38, 'hillshade-shadow-color': '#7b8aa0', 'hillshade-highlight-color': '#ffffff', 'hillshade-accent-color': '#aab6c8', 'hillshade-illumination-direction': 335 } }, 'park');
  } catch { return; }
  apply(); map.on('zoomend', apply); on('pref:relief', apply); on('pref:terrain', apply);
}
