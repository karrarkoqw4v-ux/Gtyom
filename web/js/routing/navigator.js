// الملاحة خطوة بخطوة: التقدّم، التعليمات، الخروج عن الطريق، الوصول
import { CONFIG } from '../config.js';
import { cumulative, project } from '../core/geo.js';
import { emit } from '../core/events.js';
import { spoken } from './instructions.js';
import { speak } from '../voice/voice.js';
import { chime } from '../voice/chime.js';

export class Navigator {
  constructor(route, vehicleKey) {
    this.route = route;
    this.cum = cumulative(route.coords);
    this.total = this.cum[this.cum.length - 1];
    this.off = 0; this.done = false; this.said = new Set();
    this.far = vehicleKey === 'walk' || vehicleKey === 'bike' ? [200, 60, 20] : [800, 300, 70];
    // موقع كل منعطف على طول المسار
    let from = 0;
    this.stepAlong = route.steps.map(s => {
      let best = { d: Infinity, along: from };
      for (let i = 0; i < route.coords.length; i++) {
        if (this.cum[i] < from - 1) continue;
        const c = route.coords[i], d = Math.abs(c[0] - s.loc[0]) + Math.abs(c[1] - s.loc[1]);
        if (d < best.d) best = { d, along: this.cum[i] };
        if (d < 1e-7) break;
      }
      from = best.along; return best.along;
    });
  }
  update(pos) {
    if (this.done) return;
    const p = [pos.lng, pos.lat];
    const pr = project(this.route.coords, this.cum, p);
    if (pr.d > CONFIG.offRouteMeters) {
      if (++this.off >= 3) { this.off = 0; emit('nav:offroute', pos); }
    } else this.off = 0;
    const along = pr.along, remaining = Math.max(0, this.total - along);
    let k = this.stepAlong.findIndex((a, i) => i > 0 && a > along + 3);
    if (k < 0) k = this.route.steps.length - 1;
    const next = this.route.steps[k], toNext = Math.max(0, this.stepAlong[k] - along);
    const after = this.route.steps[k + 1];
    const eta = this.route.duration * (remaining / (this.total || 1));
    this.announce(k, next, toNext);
    if (remaining < CONFIG.arriveMeters) { this.done = true; speak('وصلت إلى وجهتك', true); emit('nav:arrive'); }
    emit('nav:progress', { next, after, toNext, remaining, eta, along, cum: this.cum, point: pr.point, index: pr.i, snapped: pr.d < CONFIG.offRouteMeters });
  }
  announce(k, step, m) {
    this.far.forEach((lim, n) => {
      const key = k + ':' + n;
      if (m <= lim && !this.said.has(key)) {
        for (let j = n; j < 3; j++) if (m <= this.far[j]) this.said.add(k + ':' + j);
        this.said.add(key);
        if (n === 2) chime();
        speak(spoken(step, n === 2 ? null : m), n === 2);
      }
    });
  }
}
