// الحساب: بريد + كلمة سر، Google، Apple، وحفظ التنزيلات والأماكن بالحساب (Firebase)
import { FIREBASE_CONFIG } from './firebase-config.js';
import { emit } from '../core/events.js';
import { load, save, remove } from '../core/storage.js';
const V = '10.12.2';
let fb = null, boot = null;
export const configured = () => !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
const loadScript = src => new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(Object.assign(new Error('net'), { code: 'net' })); document.head.append(s);
});
async function init() {
  if (!configured()) throw Object.assign(new Error('cfg'), { code: 'not-configured' });
  boot ||= (async () => {
    for (const l of ['app', 'auth', 'firestore']) await loadScript(`https://www.gstatic.com/firebasejs/${V}/firebase-${l}-compat.js`);
    window.firebase.initializeApp(FIREBASE_CONFIG);
    fb = window.firebase; fb.auth().languageCode = 'ar';
    try { await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL); } catch {}
    fb.auth().onAuthStateChanged(u => setUser(u));
    return fb;
  })();
  try { return await boot; } catch (e) { boot = null; throw e; }
}
const ERR = {
  'not-configured': 'تسجيل الدخول ما انفعّل بعد، مفاتيح الحساب ناقصة',
  net: 'تأكد من الإنترنت وجرّب مرة ثانية',
  'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
  'auth/user-not-found': 'ما لقينا حساب بهذا البريد',
  'auth/wrong-password': 'كلمة السر غلط',
  'auth/invalid-credential': 'البريد أو كلمة السر غلط',
  'auth/email-already-in-use': 'هذا البريد مسجّل من قبل',
  'auth/weak-password': 'كلمة السر ضعيفة، اكتب 6 أحرف على الأقل',
  'auth/too-many-requests': 'محاولات كثيرة، انتظر شوية وجرّب',
  'auth/popup-closed-by-user': 'انلغى تسجيل الدخول',
  'auth/cancelled-popup-request': 'انلغى تسجيل الدخول',
  'auth/popup-blocked': 'المتصفح منع نافذة الدخول، اسمح بها وجرّب',
  'auth/network-request-failed': 'تأكد من الإنترنت وجرّب مرة ثانية',
  'auth/operation-not-allowed': 'هذه الطريقة ما انفعّلت بعد من لوحة Firebase',
  'auth/requires-recent-login': 'سجّل دخولك من جديد وجرّب',
  'app-social': 'الدخول بجوجل وآبل غير متاح داخل التطبيق، سجّل بالبريد وكلمة السر',
  'auth/unauthorized-domain': 'هذا الدومين غير مضاف بإعدادات Firebase'
};
export const errText = e => ERR[e?.code] || 'صار خطأ، جرّب مرة ثانية';

// المستخدم الحالي (نخزّنه محلياً حتى يظهر اسمه بدون إنترنت)
export let user = load('user', null);
const isOk = u => u && (u.emailVerified || u.providerData.some(p => p.providerId !== 'password'));
function setUser(u) {
  user = isOk(u) ? { uid: u.uid, name: u.displayName || '', email: u.email || '', photo: load('photo-' + u.uid, '') || u.photoURL || '', social: !u.providerData.some(p => p.providerId === 'password') } : null;
  user ? save('user', user) : remove('user');
  emit('auth', user);
  if (user) syncDown();
}
export const pending = () => fb?.auth().currentUser && !isOk(fb.auth().currentUser) ? fb.auth().currentUser : null;

const wrap = fn => async (...a) => { const f = await init(); return fn(f, ...a); };
export const firestore = wrap(async f => f.firestore());
export const signInEmail = wrap(async (f, email, pass) => {
  const { user: u } = await f.auth().signInWithEmailAndPassword(email, pass);
  if (!u.emailVerified) { try { await u.sendEmailVerification(); } catch {} return 'verify'; }
  setUser(u); return 'ok';
});
export const signUpEmail = wrap(async (f, name, email, pass) => {
  const { user: u } = await f.auth().createUserWithEmailAndPassword(email, pass);
  await u.updateProfile({ displayName: name });
  await u.sendEmailVerification();
  return 'verify';
});
export const resendVerify = wrap(async f => { await f.auth().currentUser.sendEmailVerification(); });
export const checkVerified = wrap(async f => { const u = f.auth().currentUser; if (!u) return false; await u.reload(); if (u.emailVerified) { await u.getIdToken(true); setUser(u); return true; } return false; });
export const resetPassword = wrap(async (f, email) => { await f.auth().sendPasswordResetEmail(email); });
// بعد الدخول الخارجي: إذا أول مرة يرجع 'profile' حتى تظهر شاشة إكمال الملف الشخصي
const social = p => wrap(async f => {
  if (window.Android) throw Object.assign(new Error('app'), { code: 'app-social' });
  const { user: u } = await f.auth().signInWithPopup(p(f)); setUser(u);
  try { const d = (await doc().get()).data(); return d?.profile?.done ? 'ok' : 'profile'; } catch { return 'ok'; }
});
export const signInGoogle = social(f => { const g = new f.auth.GoogleAuthProvider(); g.setCustomParameters({ prompt: 'select_account' }); return g; });
export const signInApple = social(f => { const a = new f.auth.OAuthProvider('apple.com'); a.addScope('email'); a.addScope('name'); return a; });
export async function signOut() { try { if (fb) await fb.auth().signOut(); } catch {} user = null; remove('user'); emit('auth', null); }
// نرجع الجلسة تلقائياً عند فتح التطبيق إذا كان مسجّل قبل
export function restoreSession() { if (user && configured()) init().catch(() => {}); }

// حفظ التنزيلات والأماكن بالحساب
const doc = () => fb.firestore().collection('users').doc(fb.auth().currentUser.uid);
export const cloudRegions = () => load('cloudRegions', []);
export async function pushDownloads(list) {
  if (!user || !fb) return;
  const slim = list.map(r => ({ id: r.id, name: r.name, zmax: r.zmax, bytes: r.bytes, date: r.date }));
  save('cloudRegions', slim); emit('cloud');
  try { await doc().set({ downloads: slim }, { merge: true }); } catch {}
}
export async function pushSaved(saved) {
  if (!user || !fb) return;
  try { await doc().set({ saved }, { merge: true }); } catch {}
}
async function syncDown() {
  try {
    const d = (await doc().get()).data() || {};
    if (d.profile && user) {
      if (d.profile.photo) save('photo-' + user.uid, d.profile.photo);
      user = { ...user, name: d.profile.name || user.name, photo: d.profile.photo || user.photo }; save('user', user); emit('auth', user);
    }
    if (d.downloads) { save('cloudRegions', d.downloads); emit('cloud'); }
    if (d.saved) { const mine = load('saved', {}), merged = { ...d.saved, ...mine }; save('saved', merged); emit('saved', merged); if (Object.keys(merged).length !== Object.keys(d.saved).length) pushSaved(merged); }
  } catch {}
}

// الملف الشخصي: الاسم والصورة (الصورة مصغّرة تنحفظ ببيانات الحساب)
export const saveProfile = wrap(async (f, name, photo) => {
  const u = f.auth().currentUser;
  await u.updateProfile({ displayName: name });
  if (photo) save('photo-' + u.uid, photo);
  user = { ...user, name, photo: photo || user.photo }; save('user', user); emit('auth', user);
  try { await doc().set({ profile: { name, done: true, ...(photo ? { photo } : {}) } }, { merge: true }); } catch {}
});
// تغيير البريد وكلمة السر يحتاجون تأكيد بكلمة السر الحالية، والبريد الجديد يحتاج تأكيد برابط يوصله
const reauth = async (f, pass) => { const u = f.auth().currentUser; await u.reauthenticateWithCredential(f.auth.EmailAuthProvider.credential(u.email, pass)); return u; };
export const changeEmail = wrap(async (f, newEmail, pass) => { const u = await reauth(f, pass); await u.verifyBeforeUpdateEmail(newEmail); });
export const changePassword = wrap(async (f, cur, next) => { const u = await reauth(f, cur); await u.updatePassword(next); });
