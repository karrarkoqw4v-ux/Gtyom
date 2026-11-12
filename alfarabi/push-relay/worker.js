/* وسيط إشعارات الفارابي (Cloudflare Worker)
   يستلم من التطبيق: POST {uids:[...], title, body, tag, sub?, photo?}
   يقرأ توكنات الأجهزة من قاعدة المدرسة (fcm/<uid>/<device>) ويرسلها عبر FCM HTTP v1.
   الأسرار (Secrets): SA = ملف حساب الخدمة JSON كاملاً، PUSH_KEY = مفتاح مشترك مع التطبيق.
   المتغير RTDB = عنوان قاعدة المدرسة بدون / في النهاية. */
let tokenCache = { v: '', exp: 0 };

const b64u = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = (o) => b64u(new TextEncoder().encode(JSON.stringify(o)));

async function accessToken(sa) {
  if (tokenCache.v && Date.now() < tokenCache.exp - 60000) return tokenCache.v;
  const now = Math.floor(Date.now() / 1000);
  const head = enc({ alg: 'RS256', typ: 'JWT' });
  const claim = enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claim));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + head + '.' + claim + '.' + b64u(sig)
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('oauth: ' + JSON.stringify(j).slice(0, 200));
  tokenCache = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.v;
}

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,x-af-key', 'access-control-allow-methods': 'POST,OPTIONS' };
const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...cors } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return out({ ok: true, service: 'alfarabi-push' });
    if (!env.PUSH_KEY || req.headers.get('x-af-key') !== env.PUSH_KEY) return out({ error: 'unauthorized' }, 401);
    let d; try { d = await req.json(); } catch (e) { return out({ error: 'bad json' }, 400); }
    const uids = (Array.isArray(d.uids) ? d.uids : []).slice(0, 100).map(String);
    const title = String(d.title || '').slice(0, 120), body = String(d.body || '').slice(0, 400);
    if (!uids.length || !title) return out({ error: 'missing' }, 400);
    const sa = JSON.parse(env.SA), rtdb = String(env.RTDB).replace(/\/$/, '');

    /* جمع التوكنات */
    const list = [];
    await Promise.all(uids.map(async (u) => {
      try {
        const r = await fetch(rtdb + '/fcm/' + encodeURIComponent(u) + '.json');
        const m = await r.json();
        if (m && typeof m === 'object') for (const dev of Object.keys(m)) if (m[dev] && m[dev].t) list.push({ u, dev, t: m[dev].t });
      } catch (e) {}
    }));
    if (!list.length) return out({ sent: 0, failed: 0, tokens: 0 });

    const at = await accessToken(sa);
    const url = 'https://fcm.googleapis.com/v1/projects/' + sa.project_id + '/messages:send';
    const data = { title, body, tag: String(d.tag || ''), sub: String(d.sub || ''), photo: String(d.photo || '').slice(0, 2000) };
    let sent = 0, failed = 0;
    await Promise.all(list.map(async (x) => {
      try {
        const r = await fetch(url, {
          method: 'POST', headers: { authorization: 'Bearer ' + at, 'content-type': 'application/json' },
          body: JSON.stringify({ message: { token: x.t, data, android: { priority: 'HIGH', ttl: '3600s' } } })
        });
        if (r.ok) { sent++; return; }
        failed++;
        const e = await r.text();
        if (r.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(e)) await fetch(rtdb + '/fcm/' + encodeURIComponent(x.u) + '/' + encodeURIComponent(x.dev) + '.json', { method: 'DELETE' });
      } catch (e) { failed++; }
    }));
    return out({ sent, failed, tokens: list.length });
  }
};
