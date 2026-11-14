// وسيط إشعارات الفارابي — Cloudflare Worker
// Secrets: SA_JSON (ملف Service Account كامل) , PUSH_KEY (كلمة سر تختارها)
const DB = 'https://shhb-1ae9e-default-rtdb.firebaseio.com';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS' };

const b64u = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const enc = (o) => b64u(new TextEncoder().encode(JSON.stringify(o)));

let TC = { v: '', exp: 0 };
async function accessToken(sa) {
  if (TC.v && Date.now() < TC.exp - 60000) return TC.v;
  const now = Math.floor(Date.now() / 1000);
  const head = enc({ alg: 'RS256', typ: 'JWT' });
  const claim = enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claim));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + head + '.' + claim + '.' + b64u(sig),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('oauth: ' + JSON.stringify(j));
  TC = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return j.access_token;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return new Response('ok', { headers: CORS });
    if (!env.PUSH_KEY || req.headers.get('x-af-key') !== env.PUSH_KEY) return new Response('forbidden', { status: 403, headers: CORS });

    let b; try { b = await req.json(); } catch (e) { return new Response('bad json', { status: 400, headers: CORS }); }
    /* الصيغة الجديدة: items=[{uids, d:{...}}] — كل عنصر إشعار دقيق (محادثة/تحضير/إعلان/درجة) يُرسل فوراً */
    const items = Array.isArray(b.items) ? b.items : [{ uids: b.uids, d: { title: b.title, body: b.body, tag: b.tag, call: b.call ? '1' : '0' } }];

    const sa = JSON.parse(env.SA_JSON);
    const tok = await accessToken(sa);
    const url = 'https://fcm.googleapis.com/v1/projects/' + sa.project_id + '/messages:send';
    let sent = 0, dead = 0;

    await Promise.all(items.slice(0, 60).map(async (it) => {
      const uids = (it.uids || []).slice(0, 100).map(String);
      const data = {};
      Object.keys(it.d || {}).forEach((k) => { data[k] = String(it.d[k] == null ? '' : it.d[k]).slice(0, 400); });
      await Promise.all(uids.map(async (uid) => {
        const r = await fetch(DB + '/fcm/' + encodeURIComponent(uid) + '.json');
        const devs = (await r.json()) || {};
        await Promise.all(Object.entries(devs).map(async ([dev, v]) => {
          if (!v || !v.t) return;
          const res = await fetch(url, {
            method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' },
            body: JSON.stringify({ message: { token: v.t, data, android: { priority: 'HIGH', ttl: '86400s' } } }),
          });
          if (res.ok) sent++;
          else if (res.status === 404 || res.status === 400) {
            const t = await res.text();
            if (/UNREGISTERED|NOT_FOUND|INVALID_ARGUMENT/.test(t)) { dead++; await fetch(DB + '/fcm/' + encodeURIComponent(uid) + '/' + encodeURIComponent(dev) + '.json', { method: 'DELETE' }); }
          }
        }));
      }));
    }));
    return new Response(JSON.stringify({ sent, dead }), { headers: { ...CORS, 'content-type': 'application/json' } });
  },
};
