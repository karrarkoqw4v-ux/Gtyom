/* af-sched.js — (1) الجدول الأسبوعي للإدارة: عرض وإضافة وحفظ لكل الصفوف (مهم للرابع والخامس العلمي)
   (2) تحاضير الدروس للإدارة (عرض كل التحاضير) (3) نافذة «تحضير جديد» للطالب/ولي الأمر عند فتح التطبيق
   (4) «تمت المشاهدة» تحت آخر رسالة لك في الجروبات والمحادثات الخاصة. */
(function () {
  'use strict';

  /* =========================== واجهة الإدارة =========================== */
  var ADMIN = function () {
    var SCH = { start: '', len: 45, brk: 10 };
    function info() { SD.info = SD.info || {}; return SD.info; }
    function periodsOf(g) { var s = SD.schedule && SD.schedule[g], n = 0; if (s && s.days) DAYS.forEach(function (d) { var a = s.days[d]; if (Array.isArray(a)) n = Math.max(n, a.length); }); return Math.max(n, 5); }
    function hm(m) { function t(n) { return (n < 10 ? '0' : '') + n; } return t(Math.floor(m / 60) % 24) + ':' + t(m % 60); }
    function timesFor(n) { var c = info().sched || {}, st = c.start, len = +c.len, br = +c.brk || 0; if (!st || !len) return []; var p = String(st).split(':'), t = (+p[0]) * 60 + (+p[1] || 0), o = []; for (var i = 0; i < n; i++) { o.push([t, t + len]); t += len + (i === 2 ? br : 0); } return o; }

    (function () { var st = document.createElement('style'); st.textContent = 'html:root body:not(#zz):not(#zy) .af-hq-btn b{white-space:normal!important;text-overflow:clip!important;overflow:visible!important;font-size:15.5px!important;line-height:1.3!important}'; document.head.appendChild(st); })();
    V.schedule = function () {
      mark('');
      var gset = Object.keys(GN);
      if (gset.indexOf(String(g0)) < 0) g0 = gset[0];
      var work = null, nP = 5;
      function load() {
        var s = SD.schedule && SD.schedule[g0] || { cls: GN[g0], days: {} };
        work = { cls: s.cls || GN[g0], days: {} };
        nP = periodsOf(g0);
        DAYS.forEach(function (d) { var a = Array.isArray(s.days && s.days[d]) ? s.days[d].slice() : []; while (a.length < nP) a.push(''); work.days[d] = a; });
        var c = info().sched || {}; SCH = { start: c.start || '', len: c.len || 45, brk: c.brk == null ? 10 : c.brk };
      }
      function grid() {
        var html = '';
        DAYS.forEach(function (d) {
          html += '<div class="afsd"><h4>' + d + '</h4>';
          for (var i = 0; i < nP; i++) html += '<div class="afsr"><i>' + (i + 1) + '</i><input data-d="' + d + '" data-i="' + i + '" value="' + esc(work.days[d][i] || '') + '" placeholder="المادة ' + (i + 1) + '" list="afsl"></div>';
          html += '</div>';
        });
        return html;
      }
      function render() {
        load();
        shell('جدول الأسبوع', '', '<div class="sc"><style>.afsd{background:#fff;border:1.5px solid #e1e8f4;border-radius:20px;padding:10px 12px;margin:0 0 10px}.afsd h4{margin:0 0 8px;font-size:16px;color:#14213d}.afsr{display:flex;align-items:center;gap:8px;margin-bottom:6px}.afsr i{flex:none;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#0a86d6);color:#fff;font-style:normal;display:grid;place-items:center;font-weight:800;font-size:13px}.afsr input{flex:1;min-width:0;height:40px;border:1.5px solid #e1e8f4;border-radius:12px;padding:0 10px;font:inherit;font-size:15px;background:#f7faff}.aft{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px}.aft label{font-size:12px;color:#51647e;display:block;margin-bottom:3px}.aft input{width:100%;height:40px;border:1.5px solid #e1e8f4;border-radius:12px;padding:0 8px;font:inherit;background:#f7faff}.afpb{display:flex;gap:8px;margin:2px 0 10px}.afpb button{flex:1;height:42px;border:0;border-radius:14px;background:#eaf3ff;color:#0a66c2;font:inherit;font-weight:800;cursor:pointer}</style>' +
          chips() + '<p class="hint" style="margin:2px 0 8px">اكتب مواد كل يوم، ثم اضغط «حفظ الجدول». يظهر لطلاب هذا الصف فقط، وللمدرسين والإدارة.</p>' +
          '<div class="aft"><div><label>بداية الحصة الأولى</label><input id="afs1" type="time" value="' + esc(SCH.start) + '"></div><div><label>مدة الحصة (دقيقة)</label><input id="afs2" type="number" min="10" max="120" value="' + esc(SCH.len) + '"></div><div><label>استراحة بعد الثالثة</label><input id="afs3" type="number" min="0" max="60" value="' + esc(SCH.brk) + '"></div></div>' +
          '<div class="afpb"><button type="button" id="afadd">+ إضافة حصة</button><button type="button" id="afdel">− حذف آخر حصة</button></div>' +
          '<datalist id="afsl">' + SUBJ.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>' +
          '<div id="afg">' + grid() + '</div>' +
          '<button class="bt" id="afsv">حفظ الجدول</button></div>', home);
        card.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { g0 = b.dataset.g; render(); }; });
        var gbox = card.querySelector('#afg');
        gbox.oninput = function (e) { var t = e.target; if (t.dataset && t.dataset.d) work.days[t.dataset.d][+t.dataset.i] = t.value; };
        card.querySelector('#afadd').onclick = function () { if (nP >= 10) { toast('الحد الأقصى 10 حصص'); return; } nP++; DAYS.forEach(function (d) { work.days[d].push(''); }); gbox.innerHTML = grid(); };
        card.querySelector('#afdel').onclick = function () { if (nP <= 1) return; nP--; DAYS.forEach(function (d) { work.days[d].pop(); }); gbox.innerHTML = grid(); };
        card.querySelector('#afsv').onclick = function () {
          var any = false; DAYS.forEach(function (d) { work.days[d] = work.days[d].map(function (x) { return String(x || '').trim(); }); if (work.days[d].some(Boolean)) any = true; });
          if (!any) { toast('اكتب مادة واحدة على الأقل'); return; }
          SD.schedule = SD.schedule || {};
          var days = {}; DAYS.forEach(function (d) { var a = work.days[d].slice(); while (a.length && !a[a.length - 1]) a.pop(); days[d] = a; });
          SD.schedule[g0] = { cls: work.cls || GN[g0], days: days };
          var st = card.querySelector('#afs1').value, ln = +card.querySelector('#afs2').value, bk = +card.querySelector('#afs3').value;
          info().sched = { start: st || (info().sched && info().sched.start) || '', len: ln || 45, brk: isNaN(bk) ? 10 : bk };
          save(); toast('تم حفظ جدول ' + GN[g0] + ' ✓');
        };
      }
      render();
    };

    /* تحاضير الدروس: عرض كل التحاضير لإدارة الصف الحالي */
    V.plans = function () {
      mark('');
      var RK = 'alfarabi_rec_v1';
      function recs() { try { return JSON.parse(P.localStorage.getItem(RK) || '[]'); } catch (e) { return []; } }
      function bs(g) { return String(g == null ? '' : g).charAt(0); }
      function left(exp) { var m = Math.max(0, Math.round((exp - Date.now()) / 60000)); if (m >= 1440) return 'متبقي ' + Math.floor(m / 1440) + ' يوم'; if (m >= 60) return 'متبقي ' + Math.floor(m / 60) + ' ساعة'; return 'متبقي ' + m + ' دقيقة'; }
      function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []); }
      function all() {
        var a = recs().filter(function (r) { return r && r.k === 'lp'; }).map(function (r) { return { id: r.id, gr: bs(r.gr), title: r.title, d: r.d, s: r.s, by: r.by, exp: r.exp, ts: r.ts || 0, rec: 1 }; });
        arr((SD.info || {}).lessonPlans).forEach(function (x) { if (x) a.push({ id: x.id, gr: bs(x.grade), title: x.title, d: x.description, s: x.subject, by: x.teacher, exp: x.exp, ts: x.createdAt || 0 }); });
        return a.filter(function (x) { return Object.keys(GN).indexOf(x.gr) > -1; }).sort(function (a, b) { return b.ts - a.ts; });
      }
      var gset = Object.keys(GN), cur = gset.indexOf(String(g0)) > -1 ? String(g0) : gset[0];
      function render() {
        var list = all().filter(function (x) { return x.gr === cur; }), now = Date.now();
        shell('تحاضير الدروس', '', '<div class="sc"><div class="chips">' + gset.map(function (g) { return '<button type="button" class="chip' + (g === cur ? ' on' : '') + '" data-g="' + g + '">' + GN[g] + '</button>'; }).join('') + '</div>' +
          (list.length ? list.map(function (x) {
            var act = !x.exp || x.exp > now;
            return '<div class="li" style="display:block;margin-bottom:10px;opacity:' + (act ? 1 : .55) + '"><div style="font-weight:800;font-size:16px">' + esc(x.title || '') + '</div><small style="display:block;margin:3px 0 6px;color:#51647e">' + esc(x.s || '') + (x.by ? ' — ' + esc(x.by) : '') + ' — ' + (x.exp ? (act ? left(x.exp) : 'منتهي') : 'مفتوح') + '</small><div style="font-size:14.5px;line-height:1.8;white-space:pre-wrap">' + esc(x.d || '') + '</div>' + (x.rec ? '<button class="bt ghost" data-del="' + x.id + '" style="margin:8px 0 0;height:38px;font-size:13px">حذف التحضير</button>' : '') + '</div>';
          }).join('') : '<p class="hint" style="margin:14px 4px">لا توجد تحاضير منشورة لهذا الصف.</p>') + '</div>', home);
        card.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { cur = b.dataset.g; g0 = cur; render(); }; });
        card.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { if (!confirm('حذف هذا التحضير؟')) return; try { P.delRec(+b.dataset.del); } catch (e) { } render(); toast('تم الحذف'); }; });
      }
      render();
    };
  };

  /* =========================== واجهة الطالب / المدرس / ولي الأمر / الإدارة (المحادثات) =========================== */
  var USER = function () {
    /* ---- (أ) نافذة التحضير الجديد عند فتح التطبيق ---- */
    (function () {
      if (U.role !== 'student' && U.role !== 'parent') return;
      var SK = 'af_lpp_' + ok(String(uid)), seen = J(SK, null), busy = false;
      function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []); }
      function g1(g) { return String(g == null ? '' : g).charAt(0); }
      function cur() {
        var g = g1(U.grade), now = Date.now(), out = [];
        arr(J('alfarabi_rec_v1', [])).forEach(function (r) { if (r && r.k === 'lp' && g1(r.gr) === g && (!r.exp || r.exp > now)) out.push({ id: r.id, title: r.title, d: r.d, s: r.s, by: r.by, ts: r.ts || 0 }); });
        arr((SD.info || {}).lessonPlans).forEach(function (x) { if (x && g1(x.grade) === g && (!x.exp || x.exp > now)) out.push({ id: x.id, title: x.title, d: x.description, s: x.subject, by: x.teacher, ts: x.createdAt || 0 }); });
        return out.filter(function (p) { return p.id != null; });
      }
      function keyOf(p) { return String(p.id) + ':' + (p.ts || 0); }
      function tick() {
        if (busy) return;
        var sh = document.getElementById('sheet'); if (sh && sh.classList.contains('open')) return;
        if (document.body.classList.contains('cho')) return;
        var list = cur(); if (!list.length) return;
        seen = seen || {};
        var nw = list.filter(function (p) { return !seen[keyOf(p)]; });
        if (!nw.length) return;
        nw.forEach(function (p) { seen[keyOf(p)] = 1; });
        try { LS.setItem(SK, JSON.stringify(seen)); } catch (e) { }
        busy = true;
        var show = nw.slice(0, 3), more = nw.length - show.length;
        S('<div class="gp aflpp"><style>.aflpp{position:relative;text-align:right}.aflpp .afx{position:absolute;top:-4px;left:-2px;width:38px;height:38px;border:0;border-radius:50%;background:#eef3fb;color:#14213d;font-size:20px;cursor:pointer;line-height:1}.aflpp h2{text-align:center;margin:2px 0 12px;font-size:19px}.aflpp .afc{background:#f4f9ff;border:1.5px solid #dbe8f7;border-radius:18px;padding:12px 14px;margin:0 0 10px}.aflpp .afc b{display:block;font-size:16.5px;color:#14213d}.aflpp .afc small{display:block;color:#51647e;margin:2px 0 6px;font-size:12.5px}.aflpp .afc p{margin:0;font-size:14.5px;line-height:1.8;color:#14213d;white-space:pre-wrap}</style>' +
          '<button class="afx" id="aflx" aria-label="إغلاق">✕</button><h2>' + (nw.length > 1 ? 'تحاضير جديدة (' + nw.length + ')' : 'تحضير جديد') + '</h2>' +
          show.map(function (p) { return '<div class="afc"><b>' + esc(p.title || 'تحضير') + '</b><small>' + esc((p.s || '') + (p.by ? ' — ' + p.by : '')) + '</small><p>' + esc(String(p.d || '').slice(0, 400)) + '</p></div>'; }).join('') +
          (more > 0 ? '<p style="text-align:center;color:#51647e;margin:0 0 8px">و' + more + ' تحاضير أخرى</p>' : '') +
          '<button class="bt" id="aflo">فتح قسم التحاضير</button></div>', null);
        try { ding(); } catch (e) { }
        var x = document.getElementById('aflx'), o = document.getElementById('aflo');
        function done() { busy = false; }
        if (x) x.onclick = function () { close(); done(); };
        if (o) o.onclick = function () { close(); done(); try { V.plans(); } catch (e) { } };
        var ov = document.getElementById('overlay'); if (ov) ov.addEventListener('click', done, { once: true });
        setTimeout(done, 60000);
      }
      setTimeout(function () { tick(); setInterval(tick, 3000); }, 2800);
    })();

    /* ---- (ب) تمت المشاهدة ---- */
    (function () {
      var SEEN = {}, lastW = 0, lastUp = 0;
      function open() { return document.body.classList.contains('cho') && cg && !document.hidden; }
      function lastMsgTs() { var a = msgs(cg).filter(function (x) { return x && !x.c && x.ts; }); return a.length ? a[a.length - 1].ts : 0; }
      function write() {
        var b = P.FBBASE; if (!b || !open()) return;
        var up = lastMsgTs(), now = Date.now();
        if (up === lastUp && now - lastW < 20000) return;
        lastUp = up; lastW = now;
        fetch(b + '/seen/' + ok(String(cg)) + '/' + ok(String(uid)) + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ n: U.name || '', ts: now, up: up }) }).catch(function () { });
      }
      function read() {
        var b = P.FBBASE; if (!b || !open()) { SEEN = {}; return; }
        var room = cg;
        fetch(b + '/seen/' + ok(String(room)) + '.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (room === cg) { SEEN = d || {}; paint(); } }).catch(function () { });
      }
      function rel(ts) { var s = Math.max(0, Math.round((Date.now() - ts) / 1000)); if (s < 20) return 'الآن'; if (s < 60) return 'منذ ' + s + ' ث'; var m = Math.round(s / 60); if (m < 60) return 'منذ ' + m + ' د'; var h = Math.round(m / 60); if (h < 24) return 'منذ ' + h + ' س'; return 'منذ ' + Math.round(h / 24) + ' يوم'; }
      function paint() {
        var l = document.getElementById('cl'); if (!l || !open()) return;
        var el = document.getElementById('afseen');
        var mine = msgs(cg).filter(function (x) { return x && !x.c && String(x.u) === String(uid) && x.ts; });
        if (!mine.length) { if (el) el.remove(); return; }
        var mts = mine[mine.length - 1].ts, me = ok(String(uid));
        var who = Object.keys(SEEN).filter(function (k) { return k !== me && SEEN[k] && (SEEN[k].up || 0) >= mts; }).map(function (k) { return SEEN[k]; });
        var txt = '';
        if (who.length) {
          var t = Math.max.apply(null, who.map(function (w) { return w.ts || 0; })); txt = 'تمت المشاهدة ' + rel(t);
        }
        if (!txt) { if (el) el.remove(); return; }
        if (!el) { el = document.createElement('div'); el.id = 'afseen'; el.style.cssText = 'text-align:right;direction:rtl;font-size:12.5px;font-weight:700;color:#9fb2cc;margin:2px 14px 6px;padding-bottom:2px'; }
        el.textContent = txt;
        if (l.lastElementChild !== el) l.appendChild(el);
      }
      try { var _dm = drawMsgs; drawMsgs = function () { var r = _dm.apply(this, arguments); try { paint(); } catch (e) { } return r; }; } catch (e) { }
      setInterval(function () { try { write(); } catch (e) { } }, 2500);
      setInterval(function () { try { read(); } catch (e) { } }, 2500);
      setInterval(function () { try { paint(); } catch (e) { } }, 1500);
    })();
  };

  /* =========================== الحقن (نفس أسلوب af-menu.js) =========================== */
  var ASRC = '\n/* ===== af-sched: إدارة ===== */\n(' + ADMIN.toString() + ')();\n';
  var USRC = '\n/* ===== af-sched: مستخدم ===== */\n(' + USER.toString() + ')();\n';
  try {
    var s = window.ADMIN_SRC;
    if (s) {
      var a = '\nhome();\n})();';
      var i = s.lastIndexOf(a);
      if (i > -1) { s = s.slice(0, i) + ASRC + s.slice(i); window.ADMIN_SRC = s; }
    }
  } catch (e) { try { console.warn('af-sched admin', e); } catch (x) { } }
  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + USRC + '\n}';
      window.userMain = (0, eval)('(' + src + ')');
    }
  } catch (e) { try { console.warn('af-sched user', e); } catch (x) { } }
})();
