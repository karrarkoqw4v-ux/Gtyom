/* af-sync.js — محرك الموازنة الفورية + حل مشاكل الاتصال التلقائي (Auto-Heal & Native Bridge)
   - موازنة ذكية بين الخوادم مع قياس السرعة والانتقال التلقائي لأسرع نقطة اتصال.
   - جسر اتصال مزدوج (Dual-Transport: Fetch + Native Android HTTP Fallback) يتجاوز أي تعليق أو حظر في المتصفح.
   - بث حي مباشر (SSE) للغرفة المفتوحة + استعلام تزايدي فائق السرعة دون انقطاع.
   - دفع فوري (Zero-Delay) لأي رسالة أو تعديل أو حذف أو مكالمة من جميع الإطارات.
   - معالج ذكي لمشاكل الاتصال (Connection Troubleshooter & Auto-Repair) يفحص ويعالج الاتصال بضغطة واحدة أو تلقائياً. */
(function () {
  'use strict';
  var CK = 'alfarabi_chat_v2', DBK = 'alfarabi_db_v1', BK = 'alfarabi_fbbase_shhb';
  var PROJ = 'shhb-1ae9e-default-rtdb';
  var CANDS = [
    'https://' + PROJ + '.firebaseio.com',
    'https://' + PROJ + '.europe-west1.firebasedatabase.app',
    'https://' + PROJ + '.asia-southeast1.firebasedatabase.app'
  ];
  var LS = window.localStorage, A = window.Android || {};
  var rawSet = Storage.prototype.setItem;
  var origFetch = window.fetch ? window.fetch.bind(window) : null;

  function J(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }
  function rawW(k, v) { try { rawSet.call(LS, k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} }
  function ok(k) { return String(k == null ? '' : k).replace(/[.#$\[\]\/]/g, '_'); }
  function toArr(v) {
    return Array.isArray(v) ? v.filter(function (x) { return x != null; }) :
      (v && typeof v === 'object' ? Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; }) : []);
  }
  function csj(m) {
    if (!m || typeof m !== 'object') return '';
    var c = {};
    var ks = Object.keys(m).sort();
    for (var i = 0; i < ks.length; i++) {
      var k = ks[i];
      if (k === 'o' && Array.isArray(m.o)) {
        c.o = m.o.map(function (x) { return { t: x && x.t, v: Array.isArray(x && x.v) ? x.v.slice().sort() : [] }; });
      } else {
        c[k] = (k === 'img' || k === 'vid' || k === 'aud') && typeof m[k] === 'string' ? m[k].length : m[k];
      }
    }
    return JSON.stringify(c);
  }

  function base() {
    return window.FBBASE || LS.getItem(BK) || CANDS[0];
  }

  function meInfo() {
    var c = window.CUR;
    if (c && (c.createdAt || c.name)) {
      return { uid: String(c.createdAt || c.name), role: c.role || 'student', grade: String(c.grade || '') };
    }
    var s = '';
    try { s = LS.getItem('alfarabi_session') || ''; } catch (e) {}
    if (s === 'admin') return { uid: 'admin', role: 'admin', grade: '' };
    var a = J('alfarabi_sess_acc', null);
    if (a && (a.createdAt || a.name)) {
      return { uid: String(a.createdAt || a.name), role: a.role || 'student', grade: String(a.grade || '') };
    }
    return { uid: '', role: '', grade: '' };
  }
  function me() { return meInfo().uid; }
  function vis() { return !document.hidden; }

  var confirmed = {}, inFlight = {}, tries = {}, busyG = {}, lastShallow = 0;
  var rttMap = {}, failCount = 0, racing = false, lastHeal = 0;
  var roomES = null, roomESKey = '', roomESLast = 0;

  /* ---- 0) جسر الاتصال المزدوج (WebView Fetch + Native Android HttpURLConnection) ---- */
  function u8ToB64(u8) {
    var s = '', i = 0, n = 0x8000;
    for (; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(u8.length, i + n)));
    return btoa(s);
  }
  function strToB64(str) {
    try {
      if (typeof TextEncoder !== 'undefined') return u8ToB64(new TextEncoder().encode(str));
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) { return ''; }
  }
  function b64ToText(b64) {
    if (!b64) return '';
    try {
      var bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(u8);
      return decodeURIComponent(escape(bin));
    } catch (e) { return ''; }
  }

  function nativeFetch(url, opt, timeoutMs) {
    if (!A || !A.httpFetch || A.__web) return Promise.reject(new Error('no_native_bridge'));
    return new Promise(function (resolve, reject) {
      var id = 700000 + Math.floor(Math.random() * 250000);
      var prev = window.__afHttp;
      var method = (opt && opt.method) || 'GET';
      var hdr = (opt && opt.headers) || {};
      var b64Body = '';
      if (opt && typeof opt.body === 'string' && method !== 'GET') b64Body = strToB64(opt.body);
      var timer = setTimeout(function () {
        if (window.__afHttp === handler) window.__afHttp = prev;
        reject(new Error('native_timeout'));
      }, timeoutMs || 8000);
      function handler(rid, status, ct, b64) {
        if (rid !== id) {
          if (prev) return prev.apply(this, arguments);
          return;
        }
        clearTimeout(timer);
        window.__afHttp = prev;
        if (status <= 0) {
          reject(new Error('native_net_err'));
          return;
        }
        var txt = b64ToText(b64);
        resolve({
          ok: status >= 200 && status < 300,
          status: status,
          text: function () { return Promise.resolve(txt); },
          json: function () {
            try { return Promise.resolve(txt ? JSON.parse(txt) : null); }
            catch (e) { return Promise.reject(e); }
          }
        });
      }
      window.__afHttp = handler;
      try {
        A.httpFetch(id, url, method, JSON.stringify(hdr), b64Body);
      } catch (e) {
        clearTimeout(timer);
        window.__afHttp = prev;
        reject(e);
      }
    });
  }

  function fetchTimed(url, opt, timeoutMs) {
    timeoutMs = timeoutMs || 5500;
    var p;
    if (typeof AbortController === 'function' && origFetch) {
      var ctrl = new AbortController();
      var tid = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, timeoutMs);
      var o = Object.assign({}, opt || {}, { signal: ctrl.signal });
      p = origFetch(url, o).then(function (r) { clearTimeout(tid); return r; }, function (err) { clearTimeout(tid); throw err; });
    } else if (origFetch) {
      p = origFetch(url, opt);
    } else {
      p = Promise.reject(new Error('no_fetch'));
    }
    return p.catch(function (err) {
      if (A && A.httpFetch && !A.__web) {
        return nativeFetch(url, opt, timeoutMs + 2000);
      }
      throw err;
    });
  }

  function getJ(url, timeoutMs) {
    var t0 = Date.now();
    return fetchTimed(url, { cache: 'no-store' }, timeoutMs || 5000).then(function (r) {
      if (!r.ok) throw r.status;
      var dt = Date.now() - t0;
      var b = base();
      if (b) rttMap[b] = rttMap[b] ? Math.round(rttMap[b] * 0.7 + dt * 0.3) : dt;
      failCount = 0;
      return r.json();
    });
  }

  function raceEndpoints(cb) {
    if (racing) { if (cb) setTimeout(function () { cb(base()); }, 400); return; }
    racing = true;
    var best = null, done = 0, called = false;
    CANDS.forEach(function (u) {
      var t0 = Date.now();
      fetchTimed(u + '/school.json?shallow=true', { cache: 'no-store' }, 3500)
        .then(function (r) {
          if (!r.ok) throw r.status;
          var dt = Date.now() - t0;
          rttMap[u] = dt;
          if (!best || dt < best.dt) {
            best = { u: u, dt: dt };
            window.FBBASE = u;
            rawW(BK, u);
            try { if (A && A.setBase) A.setBase(u); } catch (e) {}
            if (cb && !called) { called = true; cb(u); }
          }
        })
        .catch(function () {})
        .then(function () {
          if (++done >= CANDS.length) {
            racing = false;
            if (cb && !called) { called = true; cb(base()); }
          }
        });
    });
  }

  /* ---- 1) إشعار جميع الإطارات وتحديث الواجهة فوراً ---- */
  function getOpenChats() {
    var open = [];
    if (window.ADMINCHAT) open.push(String(window.ADMINCHAT));
    ['adminFrame', 'chatFrame'].forEach(function (id) {
      try {
        var f = document.getElementById(id);
        var d = f && f.contentDocument;
        if (!d) return;
        var ch = d.getElementById('ch');
        if (ch && ch.classList.contains('on')) {
          var g = ch.getAttribute('data-g');
          if (g && open.indexOf(g) < 0) open.push(g);
        }
      } catch (e) {}
    });
    return open;
  }

  function refreshUI(changedG) {
    try { if (window.__afChat) window.__afChat(changedG); } catch (e) {}
    if (Array.isArray(window.__afChatListeners)) {
      window.__afChatListeners.forEach(function (fn) {
        try { fn(changedG); } catch (e) {}
      });
    }
    ['adminFrame', 'chatFrame'].forEach(function (id) {
      try {
        var f = document.getElementById(id);
        var cw = f && f.contentWindow;
        var cd = f && f.contentDocument;
        if (cw && cw.__afChatFrame) cw.__afChatFrame(changedG);
        else if (cd) {
          var ch = cd.getElementById('ch');
          if (ch && ch.classList.contains('on')) {
            try { cw.dispatchEvent(new cw.StorageEvent('storage', { key: CK })); } catch (e2) {}
          }
        }
      } catch (e) {}
    });
  }

  /* ---- 2) دمج ذكي للرسائل والتعديلات والحذف والتصويت ---- */
  function mergeRoomMessages(g, remObj, votesObj) {
    if (!remObj || typeof remObj !== 'object') return 0;
    var loc = J(CK, {});
    var arr = Array.isArray(loc[g]) ? loc[g].slice() : [];
    var byId = {};
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x && x.id != null) byId[String(x.id)] = i;
    }
    var changed = 0;
    var u = me();
    Object.keys(remObj).forEach(function (k) {
      var m = remObj[k];
      if (!m || typeof m !== 'object' || m.id == null) return;
      var rm = JSON.parse(JSON.stringify(m));
      if (rm.o) {
        var vs = (votesObj && votesObj[k]) || {};
        rm.o = toArr(rm.o).map(function (opt) { return { t: opt && opt.t ? opt.t : '', v: [] }; });
        Object.keys(vs).forEach(function (uk) {
          var idx = vs[uk];
          if (rm.o[idx]) {
            var uidVal = /^\d+$/.test(uk.slice(1)) ? Number(uk.slice(1)) : uk.slice(1);
            if (rm.o[idx].v.indexOf(uidVal) < 0) rm.o[idx].v.push(uidVal);
          }
        });
      }
      var sid = String(rm.id);
      var key = g + '|' + sid;
      var sig = csj(rm);
      confirmed[key] = sig;
      if (u && String(rm.u) === u) {
        try { A.cancelNotif && (A.cancelNotif('chat:' + g), A.cancelNotif('chat:g' + g)); } catch (e) {}
      }
      if (sid in byId) {
        var idx0 = byId[sid];
        var oldM = arr[idx0];
        if (!votesObj && rm.o && oldM && Array.isArray(oldM.o)) {
          rm.o = rm.o.map(function (opt, oi) {
            return { t: opt.t, v: (oldM.o[oi] && Array.isArray(oldM.o[oi].v)) ? oldM.o[oi].v : [] };
          });
          sig = csj(rm);
        }
        if (csj(oldM) !== sig) {
          arr[idx0] = Object.assign({}, oldM, rm);
          changed++;
        }
      } else {
        arr.push(rm);
        byId[sid] = arr.length - 1;
        changed++;
      }
    });
    if (changed > 0) {
      arr.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
      loc[g] = arr;
      rawW(CK, loc);
      refreshUI(g);
    }
    return changed;
  }

  /* ---- 3) دفع فوري للرسائل الصادرة (Zero-Delay Outgoing Push) ---- */
  function pushSingleMessage(g, m) {
    var b = base();
    if (!b || !g || !m || m.id == null || m.c === 't') return Promise.resolve(false);
    var sid = String(m.id);
    var key = g + '|' + sid;
    var sig = csj(m);
    if (confirmed[key] === sig || inFlight[key] === sig) return Promise.resolve(true);

    var gk = 'g' + ok(g), mk = 'm' + ok(sid);
    var payload = JSON.parse(JSON.stringify(m));
    var voteMap = null;
    if (payload.o && Array.isArray(m.o)) {
      voteMap = {};
      m.o.forEach(function (x, i) {
        (x.v || []).forEach(function (u) { voteMap['u' + ok(u)] = i; });
      });
      payload.o = payload.o.map(function (x) { return { t: x.t }; });
    }
    var body = JSON.stringify(payload);
    if (body.length > 950000) return Promise.resolve(false);

    inFlight[key] = sig;
    var url = b + '/chat/' + gk + '/' + mk + '.json';
    return fetchTimed(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: body.length < 60000
    }, 5500).then(function (r) {
      delete inFlight[key];
      if (!r.ok) throw r.status;
      confirmed[key] = sig;
      tries[key] = 0;
      if (voteMap) {
        Object.keys(voteMap).forEach(function (uk) {
          fetchTimed(b + '/votes/' + gk + '/' + mk + '/' + uk + '.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voteMap[uk]),
            keepalive: true
          }, 4500).catch(function () {});
        });
      }
      try { if (window.pushOut && !m.ed && !m.dl) window.pushOut(g, m); } catch (e) {}
      try { A.cancelNotif && (A.cancelNotif('chat:' + g), A.cancelNotif('chat:g' + g)); } catch (e) {}
      return true;
    }).catch(function () {
      delete inFlight[key];
      tries[key] = (tries[key] || 0) + 1;
      if (++failCount >= 2) autoHealConnection(false);
      return false;
    });
  }

  function verifyOutgoing(forceAll) {
    var b = base(), u = me();
    if (!b) return;
    var d = J(CK, {}), now = Date.now(), count = 0;
    var open = getOpenChats();
    var groups = Object.keys(d).sort(function (a, b2) {
      return (open.indexOf(b2) > -1 ? 1 : 0) - (open.indexOf(a) > -1 ? 1 : 0);
    });
    groups.forEach(function (g) {
      var list = d[g] || [];
      var startIdx = Math.max(0, list.length - 25);
      for (var i = list.length - 1; i >= startIdx; i--) {
        var m = list[i];
        if (!m || m.id == null || m.c === 't') continue;
        if (!forceAll && u && String(m.u) !== u && m.r !== 'admin' && m.r !== 'assistant') continue;
        var age = now - (m.ts || 0);
        if (!forceAll && age > 15 * 60e3 && !m.ed && !m.dl) continue;
        var key = g + '|' + m.id;
        var sig = csj(m);
        if (confirmed[key] === sig || inFlight[key] === sig || (tries[key] || 0) > 12) continue;
        if (count >= 10) return;
        count++;
        pushSingleMessage(g, m);
      }
    });
  }

  /* ---- 4) جلب سريع وبث حي (SSE + Delta Sync) للمحادثات ---- */
  function loadRoom(g, cb, limit) {
    var b = base();
    if (!b || !g) { cb && cb(0); return; }
    var lim = limit || 150;
    var gk = 'g' + ok(String(g));
    getJ(b + '/chat/' + gk + '.json?orderBy=%22%24key%22&limitToLast=' + lim, 5000)
      .then(function (d) {
        if (!d || typeof d !== 'object') { cb && cb(0); return; }
        var hasPolls = Object.keys(d).some(function (k) { return d[k] && d[k].o; });
        if (hasPolls) {
          return getJ(b + '/votes/' + gk + '.json', 3500).catch(function () { return null; }).then(function (vd) {
            var ch = mergeRoomMessages(String(g), d, vd);
            cb && cb(ch);
          });
        }
        var ch2 = mergeRoomMessages(String(g), d, null);
        cb && cb(ch2);
      })
      .catch(function () {
        if (++failCount >= 2) autoHealConnection(false);
        cb && cb(-1);
      });
  }

  window.AFChatLoad = function (g, cb) {
    loadRoom(g, cb, 150);
  };

  /* بث حي (SSE) لعدة غرف بنفس الوقت: المفتوحة أولاً ثم صف الطالب وأحدث المحادثات (حتى 4).
     أي رسالة جديدة تصل فوراً بدون انتظار الفحص الدوري (الفحص صار احتياطاً فقط). */
  var roomESs = {};
  function streamAlive(g) {
    var r = roomESs[base() + '|g' + ok(g)];
    return !!(r && Date.now() - r.last < 25000);
  }
  function closeAllStreams() {
    Object.keys(roomESs).forEach(function (k) { try { roomESs[k].es.close(); } catch (e) {} delete roomESs[k]; });
    roomES = null; roomESKey = '';
  }
  function openStream(b, target, key) {
    var rec = { es: null, last: Date.now() };
    roomESs[key] = rec;
    try {
      var es = new EventSource(b + '/chat/g' + ok(target) + '.json');
      rec.es = es; roomES = es; roomESKey = key; roomESLast = Date.now();
      var handleEvent = function (e) {
        rec.last = Date.now(); roomESLast = rec.last;
        try {
          var p = JSON.parse(e.data);
          if (!p) return;
          if (p.path === '/' && p.data && typeof p.data === 'object') {
            mergeRoomMessages(target, p.data, null);
          } else if (p.path && p.path.indexOf('/m') === 0) {
            var parts = p.path.split('/').filter(Boolean);
            var mk = parts[0];
            if (parts.length === 1 && p.data && typeof p.data === 'object') {
              var wrap = {}; wrap[mk] = p.data;
              mergeRoomMessages(target, wrap, null);
            } else if (parts.length === 1 && p.data === null) {
              loadRoom(target);
            } else {
              loadRoom(target);
            }
          }
        } catch (err) {}
      };
      es.addEventListener('put', handleEvent);
      es.addEventListener('patch', handleEvent);
      es.addEventListener('keep-alive', function () { rec.last = Date.now(); roomESLast = rec.last; });
      es.onerror = function () {
        try { es.close(); } catch (e) {}
        if (roomESs[key] === rec) delete roomESs[key];
      };
    } catch (e) { delete roomESs[key]; }
  }
  function maintainRoomStream() {
    var b = base();
    if (!b || !vis() || typeof EventSource === 'undefined') { closeAllStreams(); return; }
    var targets = [];
    getOpenChats().forEach(function (g) { if (targets.indexOf(g) < 0) targets.push(g); });
    activeGroups().forEach(function (g) { if (targets.indexOf(g) < 0) targets.push(g); });
    targets = targets.slice(0, 4);
    var keys = targets.map(function (t) { return b + '|g' + ok(t); });
    Object.keys(roomESs).forEach(function (k) {
      var r = roomESs[k];
      if (keys.indexOf(k) < 0 || Date.now() - r.last > 40000) { try { r.es && r.es.close(); } catch (e) {} delete roomESs[k]; }
    });
    targets.forEach(function (t, i) { if (!roomESs[keys[i]]) openStream(b, t, keys[i]); });
  }

  function activeGroups() {
    var d = J(CK, {});
    var open = getOpenChats();
    var out = open.slice();
    var info = meInfo();
    if (info.role === 'student' && info.grade) {
      var gr = info.grade.charAt(0);
      if (gr && out.indexOf(gr) < 0) out.push(gr);
    } else if (info.role === 'teacher' || info.role === 'admin') {
      ['1', '2', '3', '4', '5'].forEach(function (g) {
        if (out.indexOf(g) < 0) out.push(g);
      });
    }
    var arr = Object.keys(d).map(function (g) {
      var l = d[g] || [], t = 0;
      for (var i = 0; i < l.length; i++) { if (l[i] && l[i].ts > t) t = l[i].ts; }
      return { g: g, t: t };
    });
    arr.sort(function (a, b) { return b.t - a.t; });
    arr.slice(0, 8).forEach(function (x) {
      if (out.indexOf(x.g) < 0) out.push(x.g);
    });
    if (info.uid) {
      var supKey = 'dsup_' + info.uid;
      if (d[supKey] && out.indexOf(supKey) < 0) out.push(supKey);
    }
    return out;
  }

  var lastProbe = {};
  function probe(g, isOpen) {
    var b = base();
    if (!b || !g || busyG[g]) return;
    /* البث الحي شغّال لهذه الغرفة: الفحص الدوري يصير احتياطاً بطيئاً فقط */
    if (streamAlive(g) && Date.now() - (lastProbe[g] || 0) < (isOpen ? 4000 : 8000)) return;
    lastProbe[g] = Date.now();
    busyG[g] = 1;
    var lim = isOpen ? 30 : 5;
    getJ(b + '/chat/g' + ok(g) + '.json?orderBy=%22%24key%22&limitToLast=' + lim, 4000)
      .then(function (d) {
        if (!d || typeof d !== 'object') return;
        var locArr = J(CK, {})[g] || [];
        var locById = {};
        locArr.forEach(function (x) { if (x && x.id != null) locById[String(x.id)] = x; });
        var needFull = false;
        Object.keys(d).forEach(function (k) {
          var m = d[k];
          if (!m || m.id == null) return;
          var old = locById[String(m.id)];
          if (!old || csj(old) !== csj(m)) needFull = true;
        });
        if (needFull) {
          mergeRoomMessages(g, d, null);
        }
      })
      .catch(function () {})
      .then(function () { busyG[g] = 0; });
  }

  function discoverRemoteRooms() {
    var b = base(), info = meInfo();
    if (!b || !info.uid) return;
    var now = Date.now();
    if (now - lastShallow < 5000) return;
    lastShallow = now;
    getJ(b + '/chat.json?shallow=true', 4500).then(function (map) {
      if (!map || typeof map !== 'object') return;
      var loc = J(CK, {});
      Object.keys(map).forEach(function (gk) {
        if (gk.charAt(0) !== 'g') return;
        var g = gk.slice(1);
        var relevant = false;
        if (g.indexOf('dsup_') === 0) {
          relevant = (info.role === 'admin' || g === 'dsup_' + info.uid);
        } else if (g.charAt(0) === 'd') {
          var parts = g.slice(1).split('~');
          relevant = (info.role === 'admin' || parts.indexOf(info.uid) > -1);
        }
        if (relevant && (!loc[g] || !loc[g].length)) {
          probe(g, false);
        }
      });
    }).catch(function () {});
  }

  /* ---- 5) نظام حل مشاكل الاتصال التلقائي واليدوي (Connection Troubleshooter & Auto-Heal) ---- */
  function autoHealConnection(manual, onStep) {
    var now = Date.now();
    if (!manual && now - lastHeal < 8000) return Promise.resolve(false);
    lastHeal = now;
    if (onStep) onStep('جاري فحص مسارات الاتصال واختيار أسرع خادم...');
    closeAllStreams();
    tries = {};
    inFlight = {};
    failCount = 0;
    return new Promise(function (resolve) {
      raceEndpoints(function (bestUrl) {
        if (onStep) onStep('تم الربط بأسرع خادم (' + (bestUrl || '').replace('https://', '').split('/')[0] + ') — جاري مزامنة البيانات...');
        try {
          if (window.AFSchoolNow) window.AFSchoolNow(4000);
          if (window.AFAccountsNow) window.AFAccountsNow(4000);
        } catch (e) {}
        maintainRoomStream();
        activeGroups().forEach(function (g) { loadRoom(g, null, 150); });
        discoverRemoteRooms();
        verifyOutgoing(true);
        var b0 = document.getElementById('afNet');
        if (b0) b0.remove();
        window.FBSTATE = 'متصل';
        var e0 = document.getElementById('fbst');
        if (e0) e0.textContent = 'الاتصال بالخادم: متصل';
        resolve(true);
      });
    });
  }

  function openTroubleshooter(doc) {
    doc = doc || document;
    var old = doc.getElementById('afHealModal');
    if (old) old.remove();
    var o = doc.createElement('div');
    o.id = 'afHealModal';
    o.style.cssText = 'position:fixed;inset:0;z-index:2147483640;background:rgba(10,20,40,.68);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;font-family:Cairo,Tahoma,sans-serif';
    o.innerHTML = '<div style="background:#fff;color:#14213d;border-radius:22px;padding:20px;max-width:390px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.35)">' +
      '<h3 style="margin:0 0 8px;font-size:18px;font-weight:800">⚡ معالج إصلاح وتسريع الاتصال</h3>' +
      '<p style="margin:0 0 12px;font-size:13.5px;color:#475569;line-height:1.7">يقوم هذا المعالج بفحص جميع مسارات قاعدة البيانات، تفعيل الجسر المزدوج للتطبيق، تنظيف الذاكرة المؤقتة العالقة، وإعادة ربط المحادثات والملازم بأسرع خادم.</p>' +
      '<div id="afHealLog" style="background:#f1f5f9;border-radius:14px;padding:12px;font-size:13px;font-weight:700;line-height:1.9;color:#0f172a;min-height:90px">جاري الفحص التلقائي...</div>' +
      '<div style="display:flex;gap:8px;margin-top:14px">' +
      '<button id="afHealRun" style="flex:1;height:46px;border:0;border-radius:13px;background:linear-gradient(135deg,#12a15a,#0b7a3b);color:#fff;font:inherit;font-weight:800;cursor:pointer">إصلاح وتسريع الآن</button>' +
      '<button id="afHealClose" style="width:90px;height:46px;border:0;border-radius:13px;background:#e2e8f0;color:#1e293b;font:inherit;font-weight:800;cursor:pointer">إغلاق</button>' +
      '</div></div>';
    doc.body.appendChild(o);
    var logEl = o.querySelector('#afHealLog');
    var runBtn = o.querySelector('#afHealRun');
    o.querySelector('#afHealClose').onclick = function () { o.remove(); };
    o.onclick = function (e) { if (e.target === o) o.remove(); };

    function runDiagAndFix() {
      runBtn.disabled = true;
      runBtn.textContent = 'جاري الإصلاح...';
      var lines = [];
      function addLine(txt, color) {
        lines.push('<div style="color:' + (color || '#0f172a') + '">' + txt + '</div>');
        logEl.innerHTML = lines.join('');
      }
      addLine('• حالة الإنترنت بالجهاز: ' + (navigator.onLine ? 'متصل ✓' : 'غير متصل ✗'), navigator.onLine ? '#15803d' : '#be123c');
      addLine('• جسر الأندرويد المباشر: ' + (A && A.httpFetch && !A.__web ? 'مفعّل ✓' : 'وضع المتصفح القياسي'), '#1d4ed8');
      var done = 0, anyOk = false;
      CANDS.forEach(function (u) {
        var nm = u.replace('https://', '').split('/')[0];
        var t0 = Date.now();
        fetchTimed(u + '/school.json?shallow=true', { cache: 'no-store' }, 4000)
          .then(function (r) {
            var dt = Date.now() - t0;
            if (r.ok) {
              anyOk = true;
              rttMap[u] = dt;
              addLine('✓ ' + nm + ' — سريع (' + dt + ' ms)', '#15803d');
            } else {
              addLine('⚠ ' + nm + ' — رد ' + r.status, '#b45309');
            }
          })
          .catch(function () {
            addLine('✗ ' + nm + ' — لا يستجيب', '#be123c');
          })
          .then(function () {
            if (++done >= CANDS.length) {
              autoHealConnection(true, function (st) { addLine('• ' + st, '#0369a1'); }).then(function () {
                if (anyOk) {
                  addLine('✅ تم إصلاح الاتصال وتنشيط المزامنة الفورية بنجاح!', '#15803d');
                } else {
                  addLine('⚠ تعذّر الوصول لجميع الخوادم. تأكد من الإنترنت أو جرّب تشغيل VPN إذا كانت الشبكة تحجب الخدمة.', '#be123c');
                }
                runBtn.disabled = false;
                runBtn.textContent = 'إعادة الفحص والإصلاح';
              });
            }
          });
      });
    }
    runBtn.onclick = runDiagAndFix;
    runDiagAndFix();
  }

  window.AFConnFix = openTroubleshooter;
  window.afConnFix = openTroubleshooter;

  function fastTick() {
    if (!vis()) return;
    if (/غير متصل|تعذّر/.test(window.FBSTATE || '')) {
      autoHealConnection(false);
    }
    maintainRoomStream();
    var open = getOpenChats();
    open.forEach(function (g) { probe(g, true); });
    var groups = activeGroups();
    groups.forEach(function (g) {
      if (open.indexOf(g) < 0) probe(g, false);
    });
    discoverRemoteRooms();
    verifyOutgoing(false);
  }

  function fullSync() {
    raceEndpoints(function () {
      maintainRoomStream();
      activeGroups().forEach(function (g) {
        loadRoom(g, null, 150);
      });
      discoverRemoteRooms();
      verifyOutgoing(true);
    });
  }

  window.AFSyncKick = function (g, m) {
    try {
      if (g && m && typeof m === 'object') {
        pushSingleMessage(String(g), m);
      } else {
        verifyOutgoing(true);
      }
      if (g) setTimeout(function () { probe(String(g), true); }, 200);
    } catch (e) {}
  };

  window.AFRegisterChatFrame = function (fn) {
    window.__afChatListeners = window.__afChatListeners || [];
    if (typeof fn === 'function' && window.__afChatListeners.indexOf(fn) < 0) {
      window.__afChatListeners.push(fn);
    }
  };

  setInterval(function () {
    var open = getOpenChats();
    if (open.length && vis()) {
      open.forEach(function (g) { probe(g, true); });
      verifyOutgoing(false);
    }
  }, 750);

  setInterval(fastTick, 1500);
  setInterval(function () { raceEndpoints(); }, 35000);

  document.addEventListener('visibilitychange', function () { if (vis()) setTimeout(fullSync, 50); });
  window.addEventListener('online', function () { setTimeout(function () { autoHealConnection(true); }, 80); });
  window.addEventListener('focus', function () { setTimeout(fullSync, 50); });
  setTimeout(fullSync, 300);

  window.AFSYNC = {
    build: '2026.11.08-tg-sync3',
    fullSync: fullSync,
    verify: verifyOutgoing,
    kick: window.AFSyncKick,
    loadRoom: loadRoom,
    heal: autoHealConnection,
    troubleshoot: openTroubleshooter,
    fetchTimed: fetchTimed
  };
})();
