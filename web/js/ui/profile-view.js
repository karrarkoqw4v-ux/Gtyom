// الملف الشخصي (الاسم + الصورة مع القص) وقائمة الحساب
import { el } from '../core/dom.js';
import { emit, on } from '../core/events.js';
import { openView } from './sheet.js';
import { openPage } from './page.js';
import { toast } from './toast.js';
import { user, saveProfile, changeEmail, changePassword, signOut, resetPassword, errText } from '../auth/auth.js';

const field = (type, ph, auto, v = '') => el('input', { type, placeholder: ph, autocomplete: auto, value: v, class: 'iq-in', dir: type === 'email' || type === 'password' ? 'ltr' : 'rtl' });
const avatar = (u, cls) => el('span', { class: cls }, u?.photo ? el('img', { src: u.photo, alt: '', referrerpolicy: 'no-referrer' }) : (u?.name?.[0] || '👤'));

// ===== قص الصورة داخل التطبيق: اسحب لتحريك، وكبّر بالسلايدر أو بإصبعين =====
function cropImage(file) {
  return new Promise(res => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); toast('هذي الصورة ما انفتحت'); res(null); };
    img.onload = () => {
      const S = 300, dpr = Math.min(window.devicePixelRatio || 1, 3), base = S / Math.min(img.width, img.height);
      let z = 1, ox = 0, oy = 0;
      const sc = () => base * z;
      const clamp = () => { const mx = (img.width * sc() - S) / 2, my = (img.height * sc() - S) / 2; ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)); };
      const paint = (c, size) => { const k = size / S; c.drawImage(img, (S / 2 + ox - img.width * sc() / 2) * k, (S / 2 + oy - img.height * sc() / 2) * k, img.width * sc() * k, img.height * sc() * k); };
      const cv = el('canvas', { class: 'iq-crop', width: S * dpr, height: S * dpr }), ctx = cv.getContext('2d');
      const draw = () => {
        clamp(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, S, S); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, S, S); paint(ctx, S);
        ctx.fillStyle = 'rgba(0,0,0,.58)'; ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2, true); ctx.fill('evenodd');
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2); ctx.stroke();
      };
      const slider = el('input', { type: 'range', class: 'iq-crop-z', min: 1, max: 4, step: 0.01, value: 1, 'aria-label': 'تكبير' });
      slider.oninput = () => { z = +slider.value; draw(); };
      const ptrs = new Map(); let d0 = 0, z0 = 1;
      cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, e); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = z; } };
      cv.onpointermove = e => {
        if (!ptrs.has(e.pointerId)) return;
        const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, e);
        if (ptrs.size === 1) { ox += e.clientX - prev.clientX; oy += e.clientY - prev.clientY; }
        else if (ptrs.size === 2 && d0) { const [a, b] = [...ptrs.values()]; z = Math.max(1, Math.min(4, z0 * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / d0)); slider.value = z; }
        draw();
      };
      cv.onpointerup = cv.onpointercancel = e => ptrs.delete(e.pointerId);
      cv.onwheel = e => { e.preventDefault(); z = Math.max(1, Math.min(4, z - e.deltaY * 0.002)); slider.value = z; draw(); };
      const ov = el('div', { class: 'iq-modal' });
      const done = v => { URL.revokeObjectURL(url); ov.remove(); res(v); };
      ov.append(el('div', { class: 'iq-dlg' }, el('h2', {}, 'حدّد الصورة'), el('p', { class: 'iq-sub' }, 'اسحب الصورة وكبّرها حتى تصير الدائرة على الجزء اللي تريده'), cv, slider,
        el('div', { class: 'btn-row' }, el('button', { class: 'btn', onclick: () => done(null) }, 'إلغاء'),
          el('button', { class: 'iq-main', onclick: () => { const o = document.createElement('canvas'); o.width = o.height = 320; paint(o.getContext('2d'), 320); done(o.toDataURL('image/jpeg', 0.86)); } }, el('span', {}, 'تأكيد')))));
      document.body.append(ov); draw();
    };
    img.src = url;
  });
}

// ===== شاشة الملف الشخصي: صورة من المعرض + الاسم + متابعة =====
export function showProfileSetup({ edit = false } = {}) {
  const g = document.getElementById('auth');
  let photo = '', name = user?.name || '';
  const nameIn = field('text', 'اسمك', 'name', name), msg = el('div', { class: 'iq-msg', hidden: true });
  const file = el('input', { type: 'file', accept: 'image/*', hidden: true });
  const av = el('button', { class: 'iq-av', type: 'button', 'aria-label': 'اختيار صورة', onclick: () => file.click() });
  const paintAv = () => av.replaceChildren(...(photo || user?.photo ? [el('img', { src: photo || user.photo, alt: '', referrerpolicy: 'no-referrer' })] : [(nameIn.value || user?.name || '👤')[0]]), el('i', {}, '📷'));
  file.onchange = async () => { const f = file.files[0]; file.value = ''; if (!f) return; const d = await cropImage(f); if (d) { photo = d; paintAv(); } };
  const close = () => { g.hidden = true; g.replaceChildren(); };
  const go = el('button', { class: 'iq-main', type: 'button', onclick: async () => {
    const n = nameIn.value.trim(); if (n.length < 2) { msg.textContent = 'اكتب اسمك'; msg.hidden = false; return; }
    go.classList.add('load'); msg.hidden = true;
    try { await saveProfile(n, photo); toast(edit ? 'تم حفظ التعديلات' : 'تم حفظ ملفك الشخصي'); close(); } catch (e) { msg.textContent = errText(e); msg.hidden = false; }
    go.classList.remove('load');
  } }, el('span', {}, edit ? 'حفظ' : 'متابعة'));
  paintAv();
  g.replaceChildren(el('div', { class: 'iq-card' },
    edit ? el('button', { class: 'iq-x', 'aria-label': 'إغلاق', onclick: close }, '✕') : null,
    el('h1', {}, edit ? 'تعديل الملف الشخصي' : 'أكمل ملفك الشخصي'),
    el('p', { class: 'iq-sub' }, 'اختار صورتك من المعرض وعدّل اسمك'),
    av, file, el('p', { class: 'iq-sub', style: 'margin:0' }, 'اضغط على الصورة لتغييرها'), nameIn, msg, go));
  g.hidden = false;
}

// ===== نافذة تأكيد بحقول =====
function dialog(title, note, fields, okText, action, doneText) {
  const ov = el('div', { class: 'iq-modal' }), msg = el('div', { class: 'iq-msg', hidden: true });
  const say = (t, ok) => { msg.textContent = t; msg.className = 'iq-msg' + (ok ? ' ok' : ''); msg.hidden = !t; };
  const ins = fields.map(f => field(f[0], f[1], f[2]));
  const ok = el('button', { class: 'iq-main', type: 'button', onclick: async () => {
    ok.classList.add('load'); say('');
    try { const r = await action(...ins.map(i => i.value.trim())); if (r) { say(r); } else { toast(doneText || 'تم'); ov.remove(); } }
    catch (e) { say(errText(e)); }
    ok.classList.remove('load');
  } }, el('span', {}, okText));
  ov.append(el('div', { class: 'iq-dlg' }, el('h2', {}, title), note ? el('p', { class: 'iq-sub' }, note) : null, ...ins, msg,
    el('div', { class: 'btn-row' }, el('button', { class: 'btn', onclick: () => ov.remove() }, 'إلغاء'), ok)));
  document.body.append(ov);
}

// ===== قائمة الحساب =====
export function showAccount() {
  if (!user) { emit('ui:auth'); return; }
  const body = el('div'); openPage('حسابي', body);
  const draw = () => {
    const u = user; if (!u) { body.replaceChildren(); return; }
    const b = (t, fn, cls = '') => el('button', { class: 'btn ' + cls, onclick: fn }, t);
    body.replaceChildren(
      el('div', { class: 'acct-hd' }, avatar(u, 'av'), el('div', {}, el('b', {}, u.name || 'حسابك'), el('small', {}, u.email))),
      el('div', { class: 'acct-list' },
        b('✏️  تعديل الاسم والصورة', () => showProfileSetup({ edit: true })),
        u.social ? el('p', { class: 'muted', style: 'font-size:0.8125rem;margin:2px 4px' }, 'بريدك وكلمة السر مربوطين بحساب Google، تغيّرهم من إعدادات Google.') : [
          b('✉️  تغيير البريد الإلكتروني', () => dialog('تغيير البريد', 'نرسل رابط تأكيد للبريد الجديد، وما يتغير إلا بعد ما تضغطه. اكتب كلمة السر الحالية للتأكيد.',
            [['email', 'البريد الجديد', 'email'], ['password', 'كلمة السر الحالية', 'current-password']], 'إرسال رابط التأكيد',
            async (mail, pass) => { if (!mail || !pass) return 'عبّي الحقلين'; await changeEmail(mail, pass); return 'أرسلنا رابط التأكيد للبريد الجديد، اضغطه حتى يتغير'; })),
          b('🔑  تغيير كلمة السر', () => dialog('تغيير كلمة السر', 'اكتب كلمة السر الحالية للتأكيد.',
            [['password', 'كلمة السر الحالية', 'current-password'], ['password', 'كلمة السر الجديدة', 'new-password'], ['password', 'تأكيد كلمة السر الجديدة', 'new-password']], 'حفظ',
            async (c, n, n2) => { if (!c) return 'اكتب كلمة السر الحالية'; if (n.length < 6) return 'كلمة السر الجديدة 6 أحرف على الأقل'; if (n !== n2) return 'كلمتا السر مو متطابقتين'; await changePassword(c, n); }, 'تم تغيير كلمة السر')),
          b('📩  نسيت كلمة السر؟ أرسل رابط لبريدي', async () => { try { await resetPassword(u.email); toast('أرسلنا الرابط لبريدك', 3500); } catch (e) { toast(errText(e)); } })],
        b('⚙️  إعدادات التطبيق', () => emit('ui:settings')),
        b('تسجيل الخروج', () => dialog('تسجيل الخروج', 'تنزيلاتك وأماكنك تبقى محفوظة بحسابك.', [], 'خروج', async () => { await signOut(); }, 'تم تسجيل الخروج'), 'danger')));
  };
  draw();
  const off = on('auth', () => { if (body.isConnected) draw(); else off(); });
}
