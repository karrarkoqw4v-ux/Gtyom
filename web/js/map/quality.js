// جودة الرسم والسرعة: أقصى سرعة (دقة أقل وإطارات أكثر)، متوازن، أوضح. ومؤشر الإطارات بالثانية
import { map } from './map.js';
import { prefs } from '../core/prefs.js';
import { on } from '../core/events.js';
const DPR = () => window.devicePixelRatio || 1;
const RATIO = { fast: () => 1, balanced: () => Math.min(DPR(), 1.5), sharp: () => Math.min(DPR(), 3) };
function applyRatio() { try { if (typeof map.setPixelRatio === 'function') map.setPixelRatio((RATIO[prefs().gfx] || RATIO.sharp)()); } catch {} }
let box = null, raf = 0, frames = 0, t0 = 0;
function fps(t) {
  frames++;
  if (t - t0 >= 500) { box.textContent = Math.round(frames * 1000 / (t - t0)) + ' إطار/ث'; frames = 0; t0 = t; }
  raf = requestAnimationFrame(fps);
}
function applyFps() {
  cancelAnimationFrame(raf);
  if (!prefs().showFps) { box?.remove(); box = null; return; }
  if (!box) { box = document.createElement('div'); box.className = 'fps'; document.body.append(box); }
  frames = 0; t0 = performance.now(); raf = requestAnimationFrame(fps);
}
export function initQuality() { applyRatio(); applyFps(); on('pref:gfx', applyRatio); on('pref:showFps', applyFps); }
