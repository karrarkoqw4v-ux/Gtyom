// قسم تقييمات الناس: المعدل، الإيجابي والسلبي، قائمة التقييمات، وكتابة تقييم
import { el } from '../core/dom.js';
import { emit } from '../core/events.js';
import { user } from '../auth/auth.js';
import { loadReviews, addReview, summary } from '../places/reviews.js';
import { toast } from './toast.js';
import { icon } from './icons.js';
const stars = n => el('span', { class: 'stars', 'aria-label': n + ' من 5' }, ...[1, 2, 3, 4, 5].map(i => icon('star', { size: 16, anim: '', cls: i <= Math.round(n) ? 'on' : '' })));
const dateOf = r => r.ts?.seconds ? new Date(r.ts.seconds * 1000).toLocaleDateString('ar-IQ') : '';
export function reviewsSection(p) {
  const root = el('div', { class: 'rv' }), body = el('div');
  root.append(el('div', { class: 'section' }, 'تقييمات الناس'), body);
  const draw = ({ list, ok, error }) => {
    const s = summary(list);
    const form = el('div', { class: 'rv-form', hidden: true });
    let rating = 0;
    const picks = [1, 2, 3, 4, 5].map(i => el('button', { type: 'button', class: 'rv-star', 'aria-label': i + ' نجوم', onclick: () => { rating = i; picks.forEach((b, k) => b.classList.toggle('on', k < i)); } }, icon('star', { size: 30, anim: '' })));
    const ta = el('textarea', { class: 'iq-in rv-ta', rows: 3, maxlength: 500, placeholder: 'اكتب رأيك بالمكان (الإيجابي والسلبي)…' });
    const send = el('button', { class: 'btn primary block', type: 'button', onclick: async () => {
      if (!rating) return toast('اختر عدد النجوم');
      send.disabled = true;
      try { await addReview(p, rating, ta.value); toast('شكراً، انضاف تقييمك'); loadReviews(p).then(draw); }
      catch (e) { send.disabled = false; toast(e?.code === 'permission-denied' ? 'ما عندك صلاحية الكتابة، راجع قواعد Firestore' : 'ما قدرنا نرسل التقييم'); }
    } }, 'إرسال التقييم');
    form.append(el('div', { class: 'rv-stars' }, ...picks), ta, send);
    body.replaceChildren(
      !ok ? el('p', { class: 'muted' }, error === 'permission-denied' ? 'القراءة غير مسموحة، راجع قواعد Firestore.' : 'التقييمات تحتاج إنترنت وإعداد الحساب.') : null,
      ok && !s.n ? el('p', { class: 'muted' }, 'ما في تقييمات لهذا المكان لسا، كن أول واحد.') : null,
      s.n ? el('div', { class: 'rv-sum' },
        el('div', { class: 'rv-avg' }, el('b', {}, s.avg.toFixed(1)), stars(s.avg), el('small', {}, `${s.n} تقييم`)),
        el('div', { class: 'rv-split' },
          el('span', { class: 'pos' }, icon('smile', { size: 18, anim: '' }), `إيجابية ${s.pos}`),
          el('span', { class: 'neg' }, icon('frown', { size: 18, anim: '' }), `سلبية ${s.neg}`))) : null,
      ...list.slice(0, 12).map(r => el('div', { class: 'rv-item ' + (r.sentiment || '') },
        el('div', { class: 'rv-h' }, el('b', {}, r.name || 'مستخدم'), stars(r.rating), el('small', {}, dateOf(r))),
        r.text ? el('p', {}, r.text) : null)),
      ok ? el('button', { class: 'btn block', type: 'button', onclick: () => { if (!user) { toast('سجّل دخولك حتى تكتب تقييم'); emit('ui:auth'); return; } form.hidden = !form.hidden; } }, icon('star', { size: 20, anim: '' }), 'اكتب تقييمك') : null,
      form);
  };
  body.replaceChildren(el('div', { class: 'spinner' }));
  loadReviews(p).then(draw);
  return root;
}
