// تقييمات الناس للأماكن (مشتركة بين كل المستخدمين عبر Firestore)
import { user, configured, firestore } from '../auth/auth.js';
export const placeKey = p => p.id ? 'o_' + String(p.id).replace(/\//g, '_') : 'g_' + (+p.lat).toFixed(4).replace('.', '_').replace('-', 'm') + '_' + (+p.lng).toFixed(4).replace('.', '_').replace('-', 'm');
export async function loadReviews(p) {
  if (!configured()) return { list: [], ok: false };
  try {
    const db = await firestore();
    const snap = await db.collection('reviews').where('place', '==', placeKey(p)).limit(50).get();
    return { ok: true, list: snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts?.seconds || 0) - (a.ts?.seconds || 0)) };
  } catch (e) { return { list: [], ok: false, error: e?.code || 'err' }; }
}
export async function addReview(p, rating, text) {
  const db = await firestore();
  await db.collection('reviews').add({
    place: placeKey(p), placeName: p.name || '', uid: user.uid, name: user.name || 'مستخدم', rating, text: text.trim().slice(0, 500),
    sentiment: rating >= 4 ? 'pos' : rating <= 2 ? 'neg' : 'mid', ts: window.firebase.firestore.FieldValue.serverTimestamp()
  });
}
export function summary(list) {
  const n = list.length, avg = n ? list.reduce((a, r) => a + (+r.rating || 0), 0) / n : 0;
  return { n, avg, pos: list.filter(r => r.sentiment === 'pos').length, neg: list.filter(r => r.sentiment === 'neg').length };
}
