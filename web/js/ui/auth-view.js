// تسجيل الدخول وإنشاء الحساب بتصميم نظيف: خلفية فاتحة، حقول بأيقونات، زر أسود رئيسي
import { el } from '../core/dom.js';
import { toast } from './toast.js';
import { icon } from './icons.js';
import { showProfileSetup } from './profile-view.js';
import { configured, errText, signInEmail, signUpEmail, signInGoogle, resendVerify, checkVerified, resetPassword, signOut, pending } from '../auth/auth.js';

const GOOGLE = '<svg viewBox="0 0 48 48" width="22" height="22"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
const LOGO = '<svg viewBox="0 0 64 64" width="66" height="66" aria-hidden="true"><defs><linearGradient id="drg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7be0b3"/><stop offset="1" stop-color="#2f8f6a"/></linearGradient></defs><path d="M32 4C19 4 9 14 9 27c0 17 23 33 23 33s23-16 23-33C55 14 45 4 32 4z" fill="url(#drg)"/><circle cx="32" cy="27" r="9" fill="#fff"/><path d="M27 27l4 4 7-8" fill="none" stroke="#2f8f6a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// حقل بعنوان فوقه وأيقونة داخله (ومعاينة كلمة السر بالعين)
function field({ label, ic, type = 'text', ph, auto, ltr, optional, pass }) {
  const input = el('input', { type, placeholder: ph || '', autocomplete: auto, class: 'dr-input', dir: ltr ? 'ltr' : 'auto' });
  let eye = null;
  if (pass) {
    eye = el('button', { type: 'button', class: 'dr-eye', 'aria-label': 'إظهار كلمة السر' }, icon('eye', { size: 20, anim: '' }));
    eye.onclick = () => { const show = input.type === 'password'; input.type = show ? 'text' : 'password'; eye.replaceChildren(icon(show ? 'eyeoff' : 'eye', { size: 20, anim: '' })); };
  }
  const box = el('div', { class: 'dr-field' },
    el('div', { class: 'dr-lbl' }, el('span', {}, label), optional ? el('em', {}, 'اختياري') : null),
    el('div', { class: 'dr-box' }, el('span', { class: 'dr-ic' }, icon(ic, { size: 20, anim: '' })), input, eye));
  return { box, input };
}

export function showAuth(mode = 'login') {
  const g = document.getElementById('auth');
  const close = () => { g.hidden = true; g.replaceChildren(); };
  const msg = el('div', { class: 'iq-msg', hidden: true });
  const say = (t, ok) => { msg.textContent = t; msg.hidden = !t; msg.className = 'iq-msg' + (ok ? ' ok' : ''); };
  let busy = false;
  const run = async (btn, fn) => {
    if (busy) return; busy = true; btn?.classList.add('load'); say('');
    try { await fn(); } catch (e) { say(errText(e)); } finally { busy = false; btn?.classList.remove('load'); }
  };
  const external = () => [
    el('div', { class: 'dr-or' }, el('span', {}, 'أو')),
    el('button', { class: 'dr-google', type: 'button', onclick: e => run(e.currentTarget, async () => { const r = await signInGoogle(); toast('تم تسجيل الدخول'); r === 'profile' ? showProfileSetup() : close(); }) },
      el('span', { html: GOOGLE }), 'المتابعة باستخدام Google')];
  const shell = (title, sub, ...kids) => {
    g.replaceChildren(el('div', { class: 'dr-card' },
      el('button', { class: 'dr-back', 'aria-label': 'رجوع', onclick: close }, icon('back', { size: 24, anim: '' })),
      el('div', { class: 'dr-logo', html: LOGO }),
      el('h1', {}, title), sub ? el('p', { class: 'dr-sub' }, sub) : null, ...kids));
    g.hidden = false; g.scrollTop = 0;
  };
  const notice = configured() ? null : el('div', { class: 'iq-warn' }, 'مفاتيح الحساب لسا ما انضافت بملف js/auth/firebase-config.js');
  const alt = (txt, btn, fn) => el('p', { class: 'dr-alt' }, txt + ' ', el('button', { type: 'button', onclick: fn }, btn));

  const login = () => {
    const email = field({ label: 'البريد الإلكتروني', ic: 'at', type: 'email', ph: 'name@example.com', auto: 'email', ltr: true });
    const pass = field({ label: 'كلمة المرور', ic: 'lock', type: 'password', auto: 'current-password', ltr: true, pass: true });
    const go = el('button', { class: 'dr-main', type: 'button', onclick: e => run(e.currentTarget, async () => {
      if (!email.input.value.trim() || !pass.input.value) return say('اكتب البريد وكلمة المرور');
      const r = await signInEmail(email.input.value.trim(), pass.input.value);
      if (r === 'verify') return verify(email.input.value.trim());
      toast('تم تسجيل الدخول'); close();
    }) }, el('span', {}, 'تسجيل الدخول'));
    shell('أهلاً بعودتك', 'سجّل الدخول لمزامنة أماكنك على كل أجهزتك.', notice, email.box, pass.box, msg, go,
      el('button', { class: 'dr-forgot', type: 'button', onclick: e => run(e.currentTarget, async () => {
        if (!email.input.value.trim()) return say('اكتب بريدك أولاً');
        await resetPassword(email.input.value.trim()); say('أرسلنا رابط تغيير كلمة المرور لبريدك', true);
      }) }, 'نسيت كلمة المرور؟'),
      ...external(), alt('ليس لديك حساب؟', 'إنشاء حساب', signup));
  };
  const signup = () => {
    const name = field({ label: 'الاسم', ic: 'user', auto: 'name', optional: true });
    const email = field({ label: 'البريد الإلكتروني', ic: 'at', type: 'email', ph: 'name@example.com', auto: 'email', ltr: true });
    const p1 = field({ label: 'كلمة المرور', ic: 'lock', type: 'password', ph: '8 أحرف على الأقل', auto: 'new-password', pass: true });
    const p2 = field({ label: 'تأكيد كلمة المرور', ic: 'lock', type: 'password', auto: 'new-password', pass: true });
    const go = el('button', { class: 'dr-main', type: 'button', onclick: e => run(e.currentTarget, async () => {
      if (!email.input.value.trim()) return say('اكتب البريد الإلكتروني');
      if (p1.input.value.length < 8) return say('كلمة المرور 8 أحرف على الأقل');
      if (p1.input.value !== p2.input.value) return say('كلمتا المرور غير متطابقتين');
      await signUpEmail(name.input.value.trim(), email.input.value.trim(), p1.input.value); verify(email.input.value.trim());
    }) }, el('span', {}, 'إنشاء حساب'));
    shell('أهلاً بك في خرطتكم', 'حساب واحد، وخرطتكم على كل أجهزتك.', notice, name.box, email.box, p1.box, p2.box, msg, go,
      ...external(), alt('عندك حساب؟', 'تسجيل الدخول', login));
  };
  const verify = mail => {
    const timer = setInterval(async () => { try { if (await checkVerified()) { clearInterval(timer); toast('تم تأكيد البريد'); close(); } } catch {} }, 4000);
    const stop = fn => e => { clearInterval(timer); fn(e); };
    shell('أكّد بريدك الإلكتروني', null,
      el('p', { class: 'dr-sub' }, 'أرسلنا رسالة تأكيد إلى ', el('b', { dir: 'ltr' }, mail), '. افتح الرسالة واضغط على الرابط، وإذا ما لقيتها شوف الرسائل غير المرغوبة.'), msg,
      el('button', { class: 'dr-main', type: 'button', onclick: e => run(e.currentTarget, async () => { if (await checkVerified()) { clearInterval(timer); toast('تم تأكيد البريد'); close(); } else say('البريد لسا غير مؤكَّد، اضغط الرابط بالرسالة أولاً'); }) }, el('span', {}, 'تأكدت من البريد')),
      el('button', { class: 'dr-forgot', type: 'button', onclick: e => run(e.currentTarget, async () => { await resendVerify(); say('أعدنا إرسال الرسالة', true); }) }, 'إعادة إرسال الرسالة'),
      el('button', { class: 'dr-forgot', type: 'button', onclick: stop(async () => { await signOut(); login(); }) }, 'استخدام بريد ثاني'));
  };
  if (mode === 'signup') signup(); else if (mode === 'login' && pending()) verify(pending().email); else login();
}
