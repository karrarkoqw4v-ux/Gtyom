/* af-tgch.js — قناة المدرس بتصميم شبيه بتيليجرام:
   وسائط (صور/فيديو) وملفات بحسب صيغتها، رفع بأجزاء مع نسبة التقدم، تحميل ومشاركة وفتح داخل التطبيق،
   فحص أمان الروابط، تفاعلات إيموجي مع تأثيرات، تعليقات وردود المدرس، ملف تعريف القناة (يظهر عند الضغط على الرأس)،
   تعديل القناة (اسم/وصف/صورة/لون/روابط/حسابات)، المشتركون والتفاعل مع بحث.
   يُحقن داخل واجهة المستخدم (userMain) بعد af-channels.js */
(function () {
  'use strict';

  var CSS = '<style id="af-tgch-css">'
    + '.cx.tg{background:#e9eff6;font-family:system-ui,-apple-system,Roboto,"Noto Sans Arabic","Segoe UI",sans-serif}'
    + '.tg .tg-h{display:flex;align-items:center;gap:10px;padding:calc(8px + var(--sa-top,env(safe-area-inset-top,0px))) 10px 10px;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.18);z-index:2;cursor:pointer}'
    + '.tg .tg-h .cx-b{background:rgba(255,255,255,.22);color:#fff}'
    + '.tg .tg-h b{display:block;font-size:16px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tg .tg-h small{color:rgba(255,255,255,.85);font-size:12px}'
    + '.tg .tg-m{flex:1;overflow-y:auto;padding:10px 10px 6px;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch}'
    + '.tg .tg-dy{align-self:center;background:rgba(15,23,42,.35);color:#fff;font-size:11.5px;font-weight:700;padding:3px 12px;border-radius:999px;margin:4px 0}'
    + '.tg .tg-p{position:relative;background:#fff;border-radius:18px 18px 18px 6px;padding:8px;box-shadow:0 2px 8px rgba(40,70,110,.12);align-self:stretch;max-width:100%;animation:tgIn .3s ease both;overflow-wrap:anywhere}'
    + '@keyframes tgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
    + '.tg .tg-t{font-size:14.5px;line-height:1.75;white-space:pre-wrap;color:#12203a;padding:2px 4px}'
    + '.tg .tg-t a{color:#1d6fd6;font-weight:700;text-decoration:none}'
    + '.tg .tg-im{display:block;width:100%;max-height:340px;object-fit:cover;border-radius:12px;margin-bottom:6px;cursor:pointer;background:#dfe7f1}'
    + '.tg .tg-vd{position:relative;border-radius:12px;overflow:hidden;margin-bottom:6px;background:#0f172a;min-height:160px;display:grid;place-items:center;cursor:pointer}'
    + '.tg .tg-vd img,.tg .tg-vd video{width:100%;max-height:340px;object-fit:cover;display:block}'
    + '.tg .tg-pl{position:absolute;inset:0;display:grid;place-items:center}.tg .tg-pl i{width:58px;height:58px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center;color:#fff;font-style:normal;font-size:24px;padding-inline-start:4px}'
    + '.tg .tg-bd{direction:ltr;position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.55);color:#fff;border-radius:10px;font-size:11.5px;padding:2px 8px;font-weight:700}'
    + '.tg .tg-fl{display:flex;align-items:center;gap:10px;background:#f3f7fc;border-radius:14px;padding:9px;margin-bottom:6px}'
    + '.tg .tg-fi{width:52px;height:52px;border-radius:14px;color:#fff;font-weight:900;font-size:13px;display:grid;place-items:center;flex:none;letter-spacing:.3px;box-shadow:0 4px 10px rgba(0,0,0,.18)}'
    + '.tg .tg-fn{flex:1;min-width:0}.tg .tg-fn b{display:block;font-size:14px;color:#12203a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:right}.tg .tg-fn small{color:#6b7c99;font-size:12px}'
    + '.tg .tg-fa{display:flex;gap:6px}.tg .tg-fa button,.tg .tg-ib{border:0;background:#e3edf9;color:#1d4ed8;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;font-size:16px}'
    + '.tg .tg-lk{display:flex;align-items:center;gap:10px;background:#f3f7fc;border-radius:14px;padding:9px 10px;margin:4px 0;cursor:pointer;border-right:4px solid #1d6fd6}'
    + '.tg .tg-lk.tgbad{border-right-color:#e5484d;background:#fff4f4}'
    + '.tg .tg-lk b{display:block;font-size:13.5px;color:#12203a;direction:ltr;text-align:right}.tg .tg-lk small{display:block;color:#6b7c99;font-size:11px;direction:ltr;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}'
    + '.tg .tg-lk .tgb{margin-inline-start:auto;font-size:11px;font-weight:800;border-radius:999px;padding:2px 9px;background:#dcf7e6;color:#13794a;flex:none}.tg .tg-lk.tgbad .tgb{background:#ffe1e1;color:#c62828}'
    + '.tg .tg-ft{display:flex;align-items:center;justify-content:flex-end;gap:10px;font-size:11px;color:#8a99b3;padding:2px 4px 0}'
    + '.tg .tg-rxs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 2px 2px;align-items:center}'
    + '.tg .tg-rx{border:1.5px solid #dbe5f2;background:#f3f7fc;border-radius:999px;padding:3px 10px;font:inherit;font-size:13px;font-weight:800;color:#33476b;display:flex;align-items:center;gap:5px;cursor:pointer;transition:transform .12s}'
    + '.tg .tg-rx .e{font-size:16px}.tg .tg-rx.on{background:#dcebff;border-color:#4b9bf5;color:#1d4ed8}.tg .tg-rx:active{transform:scale(.9)}.tg .tg-rx.pop{animation:tgPop .35s}'
    + '@keyframes tgPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}'
    + '.tg .tg-ad{width:34px;height:30px;padding:0;justify-content:center;font-size:17px}'
    + '.tg .tg-act{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #eef2f8;margin-top:6px;padding-top:6px;font-size:13px;color:#33476b;font-weight:700}'
    + '.tg .tg-act button{border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px 6px}'
    + '.tg .tg-bar{background:#fff;padding:8px 10px calc(10px + var(--sa-bottom,env(safe-area-inset-bottom,0px)));box-shadow:0 -4px 16px rgba(40,70,110,.10)}'
    + '.tg .tg-cp{display:flex;align-items:flex-end;gap:8px}.tg .tg-cp textarea{flex:1;border:0;background:#eef3fa;border-radius:20px;padding:10px 14px;font:inherit;font-size:14.5px;max-height:120px;resize:none;outline:0;color:#12203a;line-height:1.5}'
    + '.tg .tg-sb{width:42px;height:42px;border-radius:50%;border:0;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}.tg .tg-sb svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    + '.tg .tg-ab{width:42px;height:42px;border-radius:50%;border:0;background:#eef3fa;color:#33476b;display:grid;place-items:center;cursor:pointer;flex:none}.tg .tg-ab svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    + '.tg .tg-jn{display:flex;gap:8px;justify-content:center}.tg .tg-jn button{border:0;border-radius:14px;padding:11px 18px;font:inherit;font-weight:800;color:#fff;cursor:pointer;flex:1}.tg .tg-jn .g{background:#eef3fa;color:#33476b;flex:none}'
    + '.tg-pk{position:absolute;z-index:60;background:#fff;border-radius:999px;padding:6px 8px;display:flex;gap:2px;box-shadow:0 10px 30px rgba(20,40,80,.28)}'
    + '.tg-pk button{border:0;background:transparent;font-size:26px;width:40px;height:40px;cursor:pointer;animation:tgPk .28s both;border-radius:50%}.tg-pk button:active{transform:scale(1.4)}'
    + '@keyframes tgPk{from{opacity:0;transform:translateY(14px) scale(.4)}to{opacity:1;transform:none}}'
    + '.tg-bst{position:fixed;z-index:80;font-size:28px;pointer-events:none;animation:tgBst 1s ease-out forwards}'
    + '@keyframes tgBst{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),-170px) scale(1.5) rotate(var(--rt))}}'
    + '.tg-ov{position:absolute;inset:0;z-index:50;background:rgba(10,20,40,.5);display:flex;align-items:flex-end;animation:tgFd .2s both}'
    + '.tg-sh{background:#fff;border-radius:24px 24px 0 0;width:100%;max-height:82%;display:flex;flex-direction:column;animation:tgUp .28s cubic-bezier(.22,1,.36,1) both;direction:rtl}'
    + '@keyframes tgFd{from{opacity:0}to{opacity:1}}@keyframes tgUp{from{transform:translateY(100%)}to{transform:none}}'
    + '.tg-sh h4{margin:0;padding:14px 16px 8px;font-size:16px;color:#12203a;display:flex;align-items:center;justify-content:space-between}.tg-sh h4 button{border:0;background:#eef3fa;width:32px;height:32px;border-radius:50%;cursor:pointer;color:#33476b;font-size:16px}'
    + '.tg-sh .tgbd{overflow-y:auto;padding:4px 14px 14px;flex:1}'
    + '.tg-sh .tgrw{display:flex;align-items:center;gap:12px;width:100%;border:0;background:#f3f7fc;border-radius:16px;padding:13px 14px;margin-bottom:8px;font:inherit;font-weight:800;color:#12203a;cursor:pointer;text-align:right}'
    + '.tg-sh .tgrw.red{color:#c62828}.tg-sh .tgrw.pri{background:linear-gradient(135deg,#0aa6f5,#1d4ed8);color:#fff}.tg-sh .tgrw.warn{background:#fff1f1;color:#c62828}'
    + '.tg-sh input,.tg-sh textarea,.tg-sh select{width:100%;border:1.5px solid #dbe5f2;background:#f8fafd;border-radius:14px;padding:11px 13px;font:inherit;font-size:14.5px;color:#12203a;margin-bottom:8px;outline:0}'
    + '.tg-sh .bt2{border:0;border-radius:14px;padding:12px;width:100%;font:inherit;font-weight:800;color:#fff;background:linear-gradient(135deg,#0aa6f5,#1d4ed8);cursor:pointer}'
    + '.tg-sh .tghint{color:#6b7c99;font-size:12.5px;line-height:1.7;margin:2px 2px 8px}'
    + '.tg-cm{display:flex;gap:9px;margin-bottom:10px}.tg-cm .cb{text-align:right;flex:1;background:#f3f7fc;border-radius:16px;padding:8px 12px}.tg-cm .cb b{font-size:13px;color:#12203a}.tg-cm .cb .tc{display:inline-block;background:#dcebff;color:#1d4ed8;border-radius:8px;font-size:10.5px;padding:0 6px;margin-inline-start:6px}.tg-cm .cb p{margin:2px 0;font-size:14px;line-height:1.6;color:#12203a;white-space:pre-wrap;overflow-wrap:anywhere}.tg-cm .cb small{color:#8a99b3;font-size:11px}.tg-cm .cb button{border:0;background:transparent;color:#1d6fd6;font:inherit;font-size:12px;font-weight:800;cursor:pointer;padding:0 6px}'
    + '.tg-cm .rq{background:#e6eef9;border-radius:10px;padding:4px 8px;font-size:12px;color:#33476b;margin-bottom:4px}'
    + '.tg-pgs{width:100%;height:8px;border-radius:6px;background:#e3edf9;overflow:hidden;margin:8px 0}.tg-pgs i{display:block;height:100%;width:0;background:linear-gradient(90deg,#0aa6f5,#1d4ed8);transition:width .2s}'
    + '.tg-info{position:absolute;inset:0;z-index:40;background:#e9eff6;display:flex;flex-direction:column;animation:tgFd .2s both;overflow-y:auto}'
    + '.tg-info .ih{padding:calc(8px + var(--sa-top,env(safe-area-inset-top,0px))) 10px 8px;display:flex;align-items:center;gap:10px;color:#fff}.tg-info .ih .cx-b{background:rgba(255,255,255,.22);color:#fff}.tg-info .ih b{flex:1;font-size:16px}'
    + '.tg-info .ic{text-align:center;color:#fff;padding:0 16px 22px}.tg-info .ic h3{margin:8px 0 2px;font-size:20px}.tg-info .ic p{margin:2px 0;opacity:.92;font-size:13px}'
    + '.tg-info .cd{background:#fff;border-radius:18px;margin:10px;padding:12px 14px;box-shadow:0 2px 8px rgba(40,70,110,.1)}.tg-info .cd h5{margin:0 0 6px;font-size:12.5px;color:#6b7c99}.tg-info .cd p{margin:0;font-size:14px;line-height:1.8;color:#12203a;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.tg-info .ln{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #eef2f8;cursor:pointer;color:#12203a;font-weight:700;font-size:14px}.tg-info .ln:first-of-type{border-top:0}.tg-info .ln .ci{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:900;flex:none}'
    + '.tg-info .tb{display:flex;gap:6px;margin:10px 10px 0;background:#fff;border-radius:16px;padding:5px;box-shadow:0 2px 8px rgba(40,70,110,.1)}.tg-info .tb button{flex:1;border:0;background:transparent;border-radius:12px;padding:9px 4px;font:inherit;font-weight:800;font-size:13px;color:#6b7c99;cursor:pointer}.tg-info .tb button.on{background:#e3f0ff;color:#1d4ed8}'
    + '.tg-gr{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin:10px}.tg-gr div{aspect-ratio:1;background:#cfd9e6 center/cover;border-radius:8px;position:relative;cursor:pointer;overflow:hidden}.tg-gr div span{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:22px;background:rgba(0,0,0,.25)}'
    + '.tg-sub{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #eef2f8}.tg-sub:first-of-type{border-top:0}.tg-sub b{font-size:14px;color:#12203a}.tg-sub small{display:block;color:#6b7c99;font-size:11.5px}.tg-sub .st{margin-inline-start:auto;display:flex;gap:8px;font-size:12px;font-weight:800;color:#33476b}'
    + '.tg-sub .rk{width:26px;height:26px;border-radius:50%;background:#ffe9a8;color:#8a5a00;display:grid;place-items:center;font-weight:900;font-size:12px;flex:none}'
    + '.tg-v{position:fixed;inset:0;z-index:99;background:#000;display:flex;flex-direction:column;direction:rtl;animation:tgFd .2s both}'
    + '.tg-v .tgvh{display:flex;align-items:center;gap:8px;padding:calc(8px + var(--sa-top,env(safe-area-inset-top,0px))) 10px 8px;color:#fff;background:rgba(0,0,0,.6)}.tg-v .tgvh b{flex:1;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:right}.tg-v .tgvh button{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:50%;width:38px;height:38px;font-size:17px;cursor:pointer}'
    + '.tg-v .tgvb{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;overflow:auto;position:relative}.tg-v .tgvb img,.tg-v .tgvb video{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transition:transform .2s}.tg-v .tgvb audio{width:90%}'
    + '.tg-v .tgvb canvas{display:block;width:100%;margin:0 0 8px;background:#fff}.tg-v .tgvb.pdf{display:block;align-items:initial;background:#2b2f36;padding:8px}.tg-v .tgvb pre{color:#e6edf7;white-space:pre-wrap;font:13px/1.7 monospace;padding:14px;direction:ltr;text-align:left;align-self:start}'
    + '.tg-v .tgvl{color:#fff;text-align:center;padding:20px;font-weight:700}'
    + '.tg-ring{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.45);color:#fff;font-weight:800;font-size:14px}'
    + '</style>';

  /* ===== الدالة التي تُحقن داخل userMain ===== */
  function TG(SITE) {
    try {
      var RX = ['👍', '❤️', '🔥', '😂', '😮', '😢', '🎉', '👏'];
      var COLS = window.__afChCols || [['#0aa6f5', '#1d4ed8']];
      var SEND = '<svg viewBox="0 0 24 24"><path d="M3 11l18-8-8 18-2-8z"/></svg>', PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
      var MC = {};            // ذاكرة مؤقتة للملفات المنزّلة
      var BASE_DEF = 'https://shhb-1ae9e-default-rtdb.firebaseio.com';

      /* ===== أداء: قراءة السجلات من التخزين مرة كل 600ms كحد أقصى (التحليل المتكرر لملف كبير كان سبب التقطيع) ===== */
      var _rawC = null, _recC = [], _tC = 0;
      function recs() {
        var n = Date.now(); if (n - _tC < 600) return _recC; _tC = n;
        var raw = null; try { raw = P.localStorage.getItem('alfarabi_rec_v1'); } catch (e) {}
        if (raw !== _rawC) { _rawC = raw; try { _recC = JSON.parse(raw) || []; } catch (e) { _recC = []; } }
        return _recC;
      }
      function inv() { _tC = 0; }
      function rs() { inv(); return P.recSet.apply(P, arguments); }
      function ar(r) { inv(); return P.addRec(r); }
      function dr(i) { inv(); return P.delRec(i); }
      chans = function () { return recs().filter(function (r) { return r.k === 'ch'; }).sort(function (a, b) { return a.ts - b.ts; }); };
      chOne = function (i) { var a = recs(); for (var k = 0; k < a.length; k++) if (a[k].k === 'ch' && a[k].id === i) return a[k]; return undefined; };
      cposts = function (i) { return recs().filter(function (r) { return r.k === 'cp' && r.ch === i; }).sort(function (a, b) { return a.ts - b.ts; }); };
      function arr(o) { return Array.isArray(o) ? o.filter(Boolean) : (o && typeof o === 'object' ? Object.keys(o).map(function (k) { return o[k]; }) : []); }
      function fsz(n) { n = +n || 0; return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
      function tmf(ts) { return new Date(ts).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }); }
      function dyf(ts) { var d = new Date(ts), n = new Date(); if (d.toDateString() === n.toDateString()) return 'اليوم'; return d.toLocaleDateString('ar', { day: 'numeric', month: 'long' }); }
      function A() { return window.Android || (P && P.Android) || null; }
      function fbase() { return P.FBBASE || (function () { try { return P.localStorage.getItem('alfarabi_fbbase_shhb'); } catch (e) { return ''; } })() || BASE_DEF; }
      function gcol(c) { return COLS[(c && c.col) || 0] || COLS[0]; }

      /* ---- نوع الملف حسب الصيغة ---- */
      function fkind(n, t) {
        var e = (String(n || '').split('.').pop() || '').toLowerCase(); t = t || '';
        if (/pdf/.test(t) || e === 'pdf') return { k: 'pdf', l: 'PDF', c: '#e5484d', x: 'PDF' };
        if (['doc', 'docx', 'rtf', 'odt'].indexOf(e) > -1) return { k: 'doc', l: 'مستند Word', c: '#2b6cd4', x: 'DOC' };
        if (['xls', 'xlsx', 'csv', 'ods'].indexOf(e) > -1) return { k: 'xls', l: 'جدول Excel', c: '#1e9e5a', x: 'XLS' };
        if (['ppt', 'pptx', 'odp'].indexOf(e) > -1) return { k: 'ppt', l: 'عرض PowerPoint', c: '#e0692b', x: 'PPT' };
        if (['zip', 'rar', '7z', 'tar', 'gz'].indexOf(e) > -1) return { k: 'zip', l: 'ملف مضغوط', c: '#8a5cf6', x: 'ZIP' };
        if (/^audio/.test(t) || ['mp3', 'm4a', 'wav', 'ogg', 'aac'].indexOf(e) > -1) return { k: 'aud', l: 'ملف صوتي', c: '#d6458f', x: '♪' };
        if (/^video/.test(t) || ['mp4', 'mov', 'mkv', 'webm', 'avi', '3gp'].indexOf(e) > -1) return { k: 'vid', l: 'فيديو', c: '#0aa6f5', x: '▶' };
        if (/^image/.test(t) || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].indexOf(e) > -1) return { k: 'img', l: 'صورة', c: '#14a38b', x: 'IMG' };
        if (/^text/.test(t) || ['txt', 'md', 'log', 'json'].indexOf(e) > -1) return { k: 'txt', l: 'ملف نصي', c: '#64748b', x: 'TXT' };
        return { k: 'fl', l: e ? ('ملف ' + e.toUpperCase()) : 'ملف', c: '#475569', x: (e || 'FILE').slice(0, 4).toUpperCase() };
      }

      /* ---- فحص أمان الروابط (محلي: قائمة موثوقة + علامات خطر) ---- */
      var TRUST = ['youtube.com', 'youtu.be', 'google.com', 'facebook.com', 'fb.com', 'instagram.com', 'tiktok.com', 't.me', 'telegram.org', 'wa.me', 'whatsapp.com', 'github.com', 'github.io', 'wikipedia.org', 'microsoft.com', 'office.com', 'khanacademy.org', 'zoom.us', 'twitter.com', 'x.com', 'linkedin.com', 'apple.com', 'snapchat.com', 'moe.gov.iq', 'edu.iq', 'gov.iq', 'mawdoo3.com', 'noor-book.com'];
      var BADTLD = ['zip', 'mov', 'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'click', 'link', 'work', 'rest', 'country', 'kim', 'loan', 'men', 'review', 'stream', 'download', 'racing', 'win', 'bid', 'party', 'science', 'date', 'trade', 'accountant', 'cricket', 'faith', 'host', 'monster', 'buzz', 'cyou', 'icu'];
      var SHORT = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'ow.ly', 'tiny.cc', 'rebrand.ly', 'lnkd.in'];
      function lsafe(u) {
        var m = String(u).match(/^(https?):\/\/([^\/?#]+)([^]*)$/i); if (!m) return { ok: 0, w: 'رابط غير صالح', h: String(u) };
        var proto = m[1].toLowerCase(), hostp = m[2].toLowerCase(), rest = m[3] || '', why = [];
        var h = hostp.replace(/^.*@/, '').replace(/:\d+$/, '').replace(/^www\./, '');
        if (hostp.indexOf('@') > -1) why.push('الرابط يحتوي @ لإخفاء الوجهة الحقيقية');
        if (proto !== 'https') why.push('الاتصال غير مشفّر (http)');
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) why.push('عنوان رقمي (IP) بدل اسم موقع');
        if (h.indexOf('xn--') > -1) why.push('اسم موقع مُموَّه بحروف مشابهة');
        var tld = h.split('.').pop(); if (BADTLD.indexOf(tld) > -1) why.push('امتداد موقع شائع في الروابط الضارة (.' + tld + ')');
        if (SHORT.indexOf(h) > -1) why.push('رابط مختصر يخفي الوجهة الحقيقية');
        if (h.split('.').length > 4) why.push('نطاق فرعي طويل غير معتاد');
        if (/\.(exe|apk|bat|scr|msi|jar|vbs|cmd|dmg|ps1)(\?|#|$)/i.test(rest)) why.push('يحمّل ملفاً تنفيذياً قد يكون ضاراً');
        if (/(free-?(gift|money|robux|vbucks)|verify.*account|account.*(suspend|verify)|prize|lottery)/i.test(h + rest)) why.push('كلمات تُستعمل في الاحتيال');
        var trusted = TRUST.some(function (d) { return h === d || h.slice(-d.length - 1) === '.' + d; });
        if (why.length) return { ok: 0, w: why.join(' · '), h: h };
        if (trusted) return { ok: 1, h: h };
        return { ok: 0, w: 'موقع غير معروف، لم يتم التحقق من أمانه', h: h, unk: 1 };
      }
      function urlsIn(t) { return (String(t || '').match(/https?:\/\/[^\s<>"'،]+/gi) || []).map(function (u) { return u.replace(/[).,;!؟]+$/, ''); }); }
      function linkify(t) {
        return esc(t).replace(/https?:\/\/[^\s<>"'،]+/gi, function (u) { var c = u.replace(/[).,;!؟]+$/, ''), tail = u.slice(c.length); return '<a data-lk="' + c + '">' + c + '</a>' + tail; });
      }

      /* ---- مشاركة وتحميل ---- */
      function shareText(t) {
        var a = A(); if (a && a.shareText) { try { a.shareText(t); return; } catch (e) {} }
        try { if (P.navigator.share) { P.navigator.share({ text: t }).catch(function () {}); return; } } catch (e) {}
        try { P.navigator.clipboard.writeText(t); toast('تم نسخ النص'); } catch (e) { toast(t); }
      }
      function b64of(blob, cb) { var fr = new FileReader(); fr.onload = function () { cb(String(fr.result).split(',')[1] || ''); }; fr.readAsDataURL(blob); }
      function saveBlob(blob, name) {
        var a = A();
        if (a && a.saveFile) { b64of(blob, function (b) { try { a.saveFile(name, blob.type || 'application/octet-stream', b); } catch (e) { toast('تعذّر الحفظ'); } }); return; }
        var u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click();
        setTimeout(function () { l.remove(); URL.revokeObjectURL(u); }, 4000); toast('جاري التحميل');
      }
      function shareBlob(blob, name) {
        var a = A();
        if (a && a.shareFile) { b64of(blob, function (b) { try { a.shareFile(name, blob.type || 'application/octet-stream', b); } catch (e) { toast('تعذّرت المشاركة'); } }); return; }
        try { var f = new File([blob], name, { type: blob.type }); if (P.navigator.canShare && P.navigator.canShare({ files: [f] })) { P.navigator.share({ files: [f], title: name }).catch(function () {}); return; } } catch (e) {}
        saveBlob(blob, name); toast('تم تحميل الملف، شاركه من التنزيلات');
      }
      function dataToBlob(d) { return fetch(d).then(function (r) { return r.blob(); }); }

      /* ---- رفع وتنزيل بأجزاء (نفس مسار الملازم handout_files) ---- */
      var CH = 1048576;
      function readSlice(file, a, b) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1] || ''); }; fr.onerror = function () { rej(new Error('read')); }; fr.readAsDataURL(file.slice(a, b)); }); }
      function putChunk(mid, i, b64) { return P.fetch(fbase() + '/handout_files/' + mid + '/c' + i + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b64) }).then(function (r) { if (!r.ok) throw new Error('رفض الخادم (' + r.status + ')'); }); }
      function getChunk(mid, i) { return P.fetch(fbase() + '/handout_files/' + mid + '/c' + i + '.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('رفض الخادم (' + r.status + ')'); return r.json(); }); }
      function upMedia(file, mid, onP) {
        var n = Math.ceil(file.size / CH), next = 0, done = 0, failed = null;
        function one(i, tr) { return readSlice(file, i * CH, Math.min(file.size, (i + 1) * CH)).then(function (b) { return putChunk(mid, i, b); }).catch(function (e) { if (tr > 0) return one(i, tr - 1); throw e; }); }
        function w() { if (failed || next >= n) return Promise.resolve(); var i = next++; return one(i, 2).then(function () { done++; onP(done / n); return w(); }, function (e) { failed = e; throw e; }); }
        var ws = []; for (var k = 0; k < Math.min(4, n); k++) ws.push(w());
        return Promise.all(ws).then(function () { return n; });
      }
      function b64u8(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
      function getMedia(md, onP) {
        if (MC[md.id]) return Promise.resolve(MC[md.id]);
        var n = +md.c || 1, parts = new Array(n), done = 0, next = 0, failed = null;
        function one(i, tr) { return getChunk(md.id, i).then(function (s) { if (typeof s !== 'string') throw new Error('جزء ناقص'); parts[i] = b64u8(s); }).catch(function (e) { if (tr > 0) return one(i, tr - 1); throw e; }); }
        function w() { if (failed || next >= n) return Promise.resolve(); var i = next++; return one(i, 2).then(function () { done++; onP && onP(done / n); return w(); }, function (e) { failed = e; throw e; }); }
        var ws = []; for (var k = 0; k < Math.min(4, n); k++) ws.push(w());
        return Promise.all(ws).then(function () { var b = new Blob(parts, { type: md.t || 'application/octet-stream' }); MC[md.id] = b; return b; });
      }

      /* ---- بيانات القناة ---- */
      function mrole(c) { return isOwnCh(c) ? 2 : (c.ad && c.ad['u' + ok(uid)] ? 1 : 0); }
      function accOf(u) { try { return DB().accounts.find(function (a) { return String(a.createdAt || a.name) === String(u); }); } catch (e) { return null; } }
      function comments(chId, pid) { return recs().filter(function (r) { return r.k === 'cc' && r.ch === chId && (pid == null || r.cp === pid); }).sort(function (a, b) { return a.ts - b.ts; }); }

      /* ===================== فتح القناة ===================== */
      openCh = function (id) {
        closeCh(); var c = chOne(id); if (!c) return;
        cxEl = document.createElement('div'); cxEl.className = 'cx tg'; cxEl.dataset.id = id; document.body.appendChild(cxEl);
        var root = cxEl, first = 1, lastSig = '', pickerEl = null;
        try { if (isOwnCh(c) && !c.gr && U.grade) rs(id, 'gr', String(U.grade)); } catch (e) {}
        var g = gcol(c), grad = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')';
        root.innerHTML = '<div class="tg-h" id="tgh" style="background:' + grad + '"><button class="cx-b" id="tgb">' + ARW + '</button><span id="tgav"></span><div class="cx-t"><b id="tgn"></b><small id="tgs"></small></div></div><div class="tg-m" id="tgm"></div><div class="tg-bar" id="tgbar"></div>';
        function me() { c = chOne(id) || c; return mrole(c); }
        function memb() { return !!(c.m && c.m['u' + ok(uid)]) || me() > 0; }
        function canPost() { return me() > 0; }
        function head() {
          c = chOne(id); if (!c) { closeCh(); return; }
          var hk = [c.cn, (c.img || '').length, c.col, Object.keys(c.m || {}).length, c.on].join('|'); if (hk === head.k) return; head.k = hk;
          g = gcol(c); grad = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')'; $('tgh').style.background = grad;
          $('tgav').innerHTML = av(null, 40, c.img); $('tgn').textContent = c.cn;
          $('tgs').textContent = Object.keys(c.m || {}).length + ' مشترك' + (c.on ? ' · ' + c.on : '');
        }
        $('tgb').onclick = function (e) { e.stopPropagation(); closeCh(); };
        $('tgh').onclick = function (e) { if (e.target.closest('#tgb')) return; showInfo('m'); };

        /* ---- تفاعلات ---- */
        function rxMap(p) { var m = {}, mine = -1; var o = p.rx || {}; Object.keys(o).forEach(function (k) { var v = +o[k]; if (isNaN(v)) return; m[v] = (m[v] || 0) + 1; if (k === 'u' + ok(uid)) mine = v; }); return { m: m, mine: mine }; }
        function burst(x, y, e) { for (var i = 0; i < 7; i++) { var s = document.createElement('span'); s.className = 'tg-bst'; s.textContent = e; s.style.left = (x - 14 + (Math.random() * 40 - 20)) + 'px'; s.style.top = (y - 14) + 'px'; s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); s.style.setProperty('--rt', (Math.random() * 60 - 30) + 'deg'); s.style.animationDelay = (i * 40) + 'ms'; document.body.appendChild(s); setTimeout(function (el) { el.remove(); }, 1300, s); } }
        function react(pid, i, x, y) {
          if (!memb()) return toast('انضم للقناة أولاً');
          var p = cposts(id).filter(function (q) { return q.id === pid; })[0]; if (!p) return;
          var cur = rxMap(p).mine; var nv = (cur === i) ? null : i;
          rs(pid, 'rx/u' + ok(uid), nv);
          if (nv !== null) burst(x || innerWidth / 2, y || innerHeight / 2, RX[i]);
          lastSig = ''; render(); if (nv !== null) { var chip = root.querySelector('.tg-rx[data-p="' + pid + '"][data-i="' + i + '"]'); if (chip) chip.classList.add('pop'); }
        }
        function openPicker(pid, el) {
          closePicker(); var r = el.getBoundingClientRect(); pickerEl = document.createElement('div'); pickerEl.className = 'tg-pk';
          pickerEl.innerHTML = RX.map(function (e, i) { return '<button data-pi="' + i + '" style="animation-delay:' + (i * 25) + 'ms">' + e + '</button>'; }).join('');
          document.body.appendChild(pickerEl); pickerEl.style.position = 'fixed';
          var w = pickerEl.offsetWidth || 330; var left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2)); pickerEl.style.left = left + 'px'; pickerEl.style.top = Math.max(60, r.top - 58) + 'px';
          pickerEl.onclick = function (e) { var b = e.target.closest('[data-pi]'); if (!b) return; var bb = b.getBoundingClientRect(); closePicker(); react(pid, +b.dataset.pi, bb.left + 20, bb.top + 10); };
          setTimeout(function () { document.addEventListener('click', outside, true); }, 30);
        }
        function outside(e) { if (pickerEl && !pickerEl.contains(e.target)) closePicker(); }
        function closePicker() { if (pickerEl) { pickerEl.remove(); pickerEl = null; } document.removeEventListener('click', outside, true); }

        /* ---- عرض منشور ---- */
        function mediaHtml(p) {
          var h = '';
          if (p.img) h += '<img class="tg-im" data-iv="' + p.id + '" src="' + p.img + '" loading="lazy" decoding="async">';
          if (p.md && p.md.k === 'img') h += '<div class="tg-vd" data-iv="' + p.id + '" style="min-height:0"><img src="' + (p.md.th || '') + '" decoding="async" style="max-height:340px"><span class="tg-bd">' + fsz(p.md.s) + '</span></div>';
          if (p.vid) h += '<div class="tg-vd" data-vp="' + p.id + '"><video src="' + p.vid + '#t=0.3" preload="metadata" muted playsinline></video><div class="tg-pl"><i>▶</i></div></div>';
          if (p.md && p.md.k === 'vid') h += '<div class="tg-vd" data-vp="' + p.id + '">' + (p.md.th ? '<img src="' + p.md.th + '">' : '') + '<div class="tg-pl"><i>▶</i></div><span class="tg-bd">' + fsz(p.md.s) + '</span></div>';
          if (p.md && p.md.k === 'fl') h += fileCard(p, p.md);
          if (p.fl) h += fileCard(p, { n: p.fl.n, s: (p.fl.d || '').length * 0.75, t: p.fl.t || '', inline: p.fl.d });
          return h;
        }
        function fileCard(p, f) {
          var k = fkind(f.n, f.t);
          return '<div class="tg-fl"><div class="tg-fi" style="background:' + k.c + '">' + esc(k.x) + '</div><div class="tg-fn"><b>' + esc(f.n || 'ملف') + '</b><small>' + k.l + ' · ' + fsz(f.s) + '</small></div><div class="tg-fa"><button data-fo="' + p.id + '" title="فتح">👁</button><button data-fd="' + p.id + '" title="تحميل">⬇</button><button data-fs="' + p.id + '" title="مشاركة">↗</button></div></div>';
        }
        function pollHtml(p) {
          var o = arr(p.o), vt = p.vt || {}, tot = Object.keys(vt).length, mn = vt['u' + ok(uid)];
          return '<div class="cx-q"><b>' + esc(p.q) + '</b>' + o.map(function (x, k) { var n = Object.keys(vt).filter(function (u) { return vt[u] === k; }).length, pc = tot ? Math.round(n * 100 / tot) : 0; return '<div class="cx-o" data-vt="' + p.id + '" data-k="' + k + '" style="background:linear-gradient(90deg,rgba(10,166,245,.3) ' + pc + '%,transparent ' + pc + '%)"><span>' + (mn === k ? '✓ ' : '') + esc(x) + '</span><span>' + n + ' (' + pc + '%)</span></div>'; }).join('') + '</div>';
        }
        function linksHtml(p) {
          var us = urlsIn(p.t); if (p.lk && /^https?:\/\//i.test(p.lk) && us.indexOf(p.lk) < 0) us.push(p.lk);
          return us.slice(0, 3).map(function (u) { var s = lsafe(u); return '<div class="tg-lk' + (s.ok ? '' : ' tgbad') + '" data-lk="' + esc(u) + '"><span style="font-size:20px">' + (s.ok ? '🔗' : '⚠️') + '</span><div><b>' + esc(s.h) + '</b><small>' + esc(u) + '</small></div><span class="tgb">' + (s.ok ? 'آمن' : (s.unk ? 'غير موثوق' : 'خطر')) + '</span></div>'; }).join('');
        }
        function postHtml(p, cn) {
          var v = Object.keys(p.vw || {}).length, rr = rxMap(p), canM = me() > 0;
          var chips = Object.keys(rr.m).sort(function (a, b) { return rr.m[b] - rr.m[a]; }).map(function (i) { return '<button class="tg-rx' + (rr.mine === +i ? ' on' : '') + '" data-rx="1" data-p="' + p.id + '" data-i="' + i + '"><span class="e">' + RX[i] + '</span><b>' + rr.m[i] + '</b></button>'; }).join('');
          return '<div class="tg-p" data-id="' + p.id + '">' + mediaHtml(p) + (p.q ? pollHtml(p) : '') + (p.t ? '<div class="tg-t">' + linkify(p.t) + '</div>' : '') + linksHtml(p)
            + '<div class="tg-ft"><span>👁 ' + v + '</span><span>' + tmf(p.ts) + (p.edited ? ' · معدّل' : '') + '</span>' + (canM ? '<a data-pm="' + p.id + '" style="cursor:pointer;font-size:16px">⋮</a>' : '') + '</div>'
            + '<div class="tg-rxs">' + chips + '<button class="tg-rx tg-ad" data-rxp="' + p.id + '">☺</button></div>'
            + '<div class="tg-act"><button data-cm="' + p.id + '">💬 ' + (cn ? cn + ' تعليق' : 'اكتب تعليقاً') + '</button><button data-sp="' + p.id + '">↗ مشاركة</button></div></div>';
        }
        function render() {
          c = chOne(id); if (!c) { closeCh(); return; } head();
          var m = memb(), ps = cposts(id), ccs = comments(id), cnt = {};
          ccs.forEach(function (x) { cnt[x.cp] = (cnt[x.cp] || 0) + 1; });
          var sig = (m ? 1 : 0) + '|' + ps.map(function (p) { return p.id + ':' + (p.edited || 0) + ':' + Object.keys(p.rx || {}).map(function (k) { return k + p.rx[k]; }).join(',') + ':' + Object.keys(p.vt || {}).length + ':' + Object.keys(p.vw || {}).length + ':' + (cnt[p.id] || 0); }).join(';');
          if (sig !== lastSig) {
            lastSig = sig; var el = $('tgm'), end = el.scrollHeight - el.scrollTop - el.clientHeight < 120, h = '', lastD = '';
            if (!m) h = '<div class="tg-dy" style="align-self:center;margin-top:30px">انضم للقناة لمشاهدة منشورات المدرس</div>';
            else if (!ps.length) h = '<div class="tg-dy" style="margin-top:30px">لا توجد منشورات بعد</div>';
            else ps.forEach(function (p) { var d = dyf(p.ts); if (d !== lastD) { lastD = d; h += '<div class="tg-dy">' + d + '</div>'; } h += postHtml(p, cnt[p.id]); });
            el.innerHTML = h; if (end || first) el.scrollTop = el.scrollHeight; first = 0;
          }
          if (m && me() === 0) ps.forEach(function (p) { if (!(p.vw && p.vw['u' + ok(uid)])) rs(p.id, 'vw/u' + ok(uid), 1); });
        }

        /* ---- شريط الأسفل ---- */
        var barSt = '';
        function bar() {
          var role = me(), m = memb(), mu = !!(c.mu && c.mu['u' + ok(uid)]), st = role + '|' + (m ? 1 : 0) + '|' + (mu ? 1 : 0); var b = $('tgbar');
          if (b.dataset.s === st && barSt === st) return; b.dataset.s = st; barSt = st;
          if (role > 0) {
            b.innerHTML = '<div class="tg-cp"><button class="tg-ab" id="tgat">' + CLP + '</button><textarea id="tgin" rows="1" placeholder="اكتب منشوراً للقناة..."></textarea><button class="tg-sb" id="tgsn" style="background:' + grad + '">' + SEND + '</button></div>';
            $('tgat').onclick = attachMenu;
            var ta = $('tgin'); ta.oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(120, this.scrollHeight) + 'px'; };
            $('tgsn').onclick = function () { var t = ta.value.trim(); if (!t) return toast('اكتب نصاً أو أرفق ملفاً'); if (pub({ t: t }) !== false) { ta.value = ''; ta.style.height = 'auto'; } };
          } else if (m) {
            b.innerHTML = '<div class="tg-jn"><button style="background:' + (mu ? '#8a99b3' : grad) + '" id="tgmu">' + (mu ? '🔔 إلغاء الكتم' : '🔕 كتم الصوت') + '</button><button class="g" id="tgsh">↗ مشاركة</button><button class="g" id="tgow">✉ مراسلة</button></div>';
            $('tgmu').onclick = function () { rs(id, 'mu/u' + ok(uid), mu ? null : 1); toast(mu ? 'تم إلغاء الكتم' : 'تم كتم الصوت'); barSt = ''; bar(); };
            $('tgsh').onclick = function () { shareText(c.cn + '\n' + chLink(c)); };
            $('tgow').onclick = function () { var o = accOf(c.o); if (o) { closeCh(); openChat(dmKey(o)); } else toast('تعذّر العثور على المدرس'); };
          } else {
            b.innerHTML = '<div class="tg-jn"><button style="background:' + grad + '" id="tgjn">انضمام للقناة</button></div>';
            $('tgjn').onclick = function () { rs(id, 'm/u' + ok(uid), String(uid)); toast('تم الانضمام للقناة'); lastSig = ''; barSt = ''; render(); bar(); };
          }
        }

        /* ---- نشر ---- */
        function pub(o) {
          var r = Object.assign({ id: Date.now(), k: 'cp', ch: id, ts: Date.now() }, o);
          try { ar(r); } catch (e) { toast('تعذّر الحفظ: مساحة التخزين ممتلئة'); return false; }
          try { notifyCh(c, o.t || o.q || (o.md ? (o.md.k === 'vid' ? 'فيديو جديد' : (o.md.n || 'ملف جديد')) : 'صورة جديدة')); } catch (e) {}
          lastSig = ''; render(); var el = $('tgm'); el.scrollTop = el.scrollHeight; return r;
        }

        /* ---- نوافذ سفلية ---- */
        function sheet(title, body, onReady) {
          var ov = document.createElement('div'); ov.className = 'tg-ov';
          ov.innerHTML = '<div class="tg-sh"><h4><span>' + title + '</span><button data-x="1">✕</button></h4><div class="tgbd">' + body + '</div></div>';
          root.appendChild(ov);
          ov.onclick = function (e) { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); };
          if (onReady) onReady(ov, function () { ov.remove(); });
          return ov;
        }
        function attachMenu() {
          sheet('إرفاق', '<button class="tgrw" data-a="img">📷 صورة</button><button class="tgrw" data-a="vid">🎬 فيديو</button><button class="tgrw" data-a="fl">📎 ملف (PDF, Word, Excel, ...)</button><button class="tgrw" data-a="q">📊 استطلاع / سؤال</button>', function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; close(); var a = b.dataset.a;
              if (a === 'img') pick('image/*', function (f) { shrink(f, 1280, function (d) { composeSheet('img', f, d); }); });
              else if (a === 'vid') pick('video/*', function (f) { composeSheet('vid', f); });
              else if (a === 'fl') pick('*/*', function (f) { composeSheet('fl', f); });
              else pollSheet(); };
          });
        }
        function pollSheet() {
          sheet('استطلاع جديد', '<input id="pq" placeholder="السؤال"><div id="pos"><input class="po" placeholder="الخيار 1"><input class="po" placeholder="الخيار 2"></div><button class="tgrw" id="pad">+ إضافة خيار</button><button class="bt2" id="pgo">نشر</button>', function (ov, close) {
            ov.querySelector('#pad').onclick = function () { var n = ov.querySelectorAll('.po').length; if (n >= 6) return; var i = document.createElement('input'); i.className = 'po'; i.placeholder = 'الخيار ' + (n + 1); ov.querySelector('#pos').appendChild(i); };
            ov.querySelector('#pgo').onclick = function () { var q = ov.querySelector('#pq').value.trim(), o = [].map.call(ov.querySelectorAll('.po'), function (x) { return x.value.trim(); }).filter(Boolean); if (!q || o.length < 2) return toast('اكتب السؤال وخيارين على الأقل'); var oo = {}; o.forEach(function (x, i) { oo[i] = x; }); close(); pub({ q: q, o: oo }); };
          });
        }
        function vthumb(file) {
          return new Promise(function (res) {
            try { var u = URL.createObjectURL(file), v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.src = u;
              var done = false, fin = function (d) { if (done) return; done = true; try { URL.revokeObjectURL(u); } catch (e) {} res(d || ''); };
              v.onloadeddata = function () { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); } catch (e) { fin(''); } };
              v.onseeked = function () { try { var k = Math.min(1, 360 / Math.max(v.videoWidth || 360, v.videoHeight || 360)), cv = document.createElement('canvas'); cv.width = Math.round((v.videoWidth || 360) * k); cv.height = Math.round((v.videoHeight || 202) * k); cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height); fin(cv.toDataURL('image/jpeg', 0.6)); } catch (e) { fin(''); } };
              v.onerror = function () { fin(''); }; setTimeout(function () { fin(''); }, 4000); } catch (e) { res(''); }
          });
        }
        function composeSheet(kind, file, dataUrl) {
          var MAXV = 60 * 1048576, MAXF = 40 * 1048576;
          if (kind === 'vid' && file.size > MAXV) return toast('الفيديو أكبر من 60 ميغا');
          if (kind === 'fl' && file.size > MAXF) return toast('الملف أكبر من 40 ميغا');
          var k = fkind(file.name, file.type);
          var prev = kind === 'img' ? '<img src="' + dataUrl + '" style="width:100%;border-radius:14px;max-height:260px;object-fit:cover;margin-bottom:8px">'
            : '<div class="tg-fl"><div class="tg-fi" style="background:' + k.c + '">' + esc(kind === 'vid' ? '▶' : k.x) + '</div><div class="tg-fn"><b>' + esc(file.name) + '</b><small>' + (kind === 'vid' ? 'فيديو' : k.l) + ' · ' + fsz(file.size) + '</small></div></div>';
          sheet(kind === 'img' ? 'نشر صورة' : kind === 'vid' ? 'نشر فيديو' : 'نشر ملف', prev + '<textarea id="cap" rows="2" placeholder="أضف وصفاً (اختياري)"></textarea><div class="tg-pgs" id="pg" style="display:none"><i></i></div><div class="tghint" id="pm"></div><button class="bt2" id="go">نشر</button>', function (ov, close) {
            var busy = 0, bar2 = ov.querySelector('#pg'), pm = ov.querySelector('#pm');
            ov.querySelector('#go').onclick = function () {
              if (busy) return; var cap = ov.querySelector('#cap').value.trim();
              busy = 1; this.disabled = true; bar2.style.display = 'block'; pm.textContent = 'جاري الرفع... لا تغلق الشاشة';
              var mid = 'chm_' + Date.now(), self = this, upF = file;
              (kind === 'vid' ? vthumb(file) : kind === 'img' ? new Promise(function (res) { shrink(file, 560, function (d) { res(d); }); }) : Promise.resolve('')).then(function (th) {
                var pf = kind === 'img' ? dataToBlob(dataUrl).then(function (b) { upF = b; return b; }) : Promise.resolve(file);
                return pf.then(function () { return upMedia(upF, mid, function (f) { bar2.firstChild.style.width = Math.round(f * 100) + '%'; pm.textContent = 'جاري الرفع ' + Math.round(f * 100) + '% (' + fsz(upF.size * f) + ' من ' + fsz(upF.size) + ')'; }).then(function (n) {
                  var md = { id: mid, n: file.name, t: kind === 'img' ? 'image/jpeg' : (file.type || ''), s: upF.size, c: n, k: kind === 'vid' ? 'vid' : kind === 'img' ? 'img' : 'fl' }; if (th) md.th = th;
                  if (pub({ md: md, t: cap }) !== false) { MC[mid] = upF; close(); }
                }); });
              }).catch(function (e) { busy = 0; self.disabled = false; bar2.style.display = 'none'; pm.textContent = 'تعذّر الرفع: ' + ((e && e.message) || e) + ' — تأكد من الاتصال ثم أعد المحاولة'; });
            };
          });
        }

        /* ---- عارض الملفات داخل التطبيق ---- */
        function viewer(title, build, blobGetter, name) {
          var v = document.createElement('div'); v.className = 'tg-v';
          v.innerHTML = '<div class="tgvh"><button data-x="1">✕</button><b>' + esc(title) + '</b><button data-dl="1" title="تحميل">⬇</button><button data-sh="1" title="مشاركة">↗</button></div><div class="tgvb" id="vb"></div>';
          document.body.appendChild(v); var vb = v.querySelector('#vb'), cur = null;
          function close() { v.remove(); }
          v.onclick = function (e) { if (e.target.closest('[data-x]')) return close(); if (e.target.closest('[data-dl]')) { if (cur) saveBlob(cur, name); else toast('انتظر اكتمال التحميل'); } if (e.target.closest('[data-sh]')) { if (cur) shareBlob(cur, name); else toast('انتظر اكتمال التحميل'); } };
          vb.innerHTML = '<div class="tgvl" id="vl">جاري التحميل...</div>';
          blobGetter(function (f) { var l = v.querySelector('#vl'); if (l) l.textContent = 'جاري التحميل ' + Math.round(f * 100) + '%'; }).then(function (b) { cur = b; vb.innerHTML = ''; build(vb, b); }).catch(function (e) { vb.innerHTML = '<div class="tgvl">تعذّر التحميل: ' + esc((e && e.message) || e) + '</div>'; });
          return v;
        }
        function loadPdfLib() {
          return new Promise(function (res, rej) {
            var lib = P.__afPdf || P.pdfjsLib; if (lib) return res(lib);
            var s = P.document.createElement('script'); s.src = '/vendor/pdfjs/pdf.min.js';
            s.onload = function () { try { P.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js'; P.__afPdf = P.pdfjsLib; res(P.pdfjsLib); } catch (e) { rej(e); } };
            s.onerror = function () { rej(new Error('تعذّر تحميل عارض PDF')); }; P.document.head.appendChild(s);
          });
        }
        function fileOf(p) { // يرجع {name,type,get(onP)->Promise<Blob>}
          if (p.md) return { n: p.md.n, t: p.md.t, k: fkind(p.md.n, p.md.t), get: function (onP) { return getMedia(p.md, onP); } };
          if (p.fl) return { n: p.fl.n, t: p.fl.t || '', k: fkind(p.fl.n, p.fl.t), get: function () { return dataToBlob(p.fl.d); } };
          if (p.vid) return { n: 'video.mp4', t: 'video/mp4', k: fkind('video.mp4', 'video/mp4'), get: function () { return dataToBlob(p.vid); } };
          if (p.img) return { n: 'image.jpg', t: 'image/jpeg', k: fkind('image.jpg', 'image/jpeg'), get: function () { return dataToBlob(p.img); } };
          return null;
        }
        function openFile(p) {
          var f = fileOf(p); if (!f) return;
          viewer(f.n, function (vb, b) {
            var u = URL.createObjectURL(b);
            if (f.k.k === 'img') { vb.innerHTML = '<img src="' + u + '">'; var im = vb.firstChild, z = 1; im.onclick = function () { z = z > 1 ? 1 : 2.5; im.style.transform = 'scale(' + z + ')'; }; }
            else if (f.k.k === 'vid') vb.innerHTML = '<video src="' + u + '" controls playsinline autoplay></video>';
            else if (f.k.k === 'aud') vb.innerHTML = '<audio src="' + u + '" controls autoplay></audio>';
            else if (f.k.k === 'txt') { b.text().then(function (t) { vb.innerHTML = '<pre>' + esc(t.slice(0, 200000)) + '</pre>'; }); }
            else if (f.k.k === 'pdf') {
              vb.className = 'tgvb pdf'; vb.innerHTML = '<div class="tgvl">جاري تجهيز الصفحات...</div>';
              loadPdfLib().then(function (lib) { return b.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf }).promise; }); }).then(function (pdf) {
                vb.innerHTML = ''; var n = Math.min(pdf.numPages, 80), i = 1;
                (function nx() { if (i > n) return; pdf.getPage(i++).then(function (pg) { var v0 = pg.getViewport({ scale: 1 }), sc = Math.min(2.2, (innerWidth * 2) / v0.width), vp = pg.getViewport({ scale: sc }), cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height); vb.appendChild(cv); return pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(nx); }); })();
              }).catch(function (e) { vb.className = 'tgvb'; vb.innerHTML = '<div class="tgvl">تعذّر عرض PDF داخل التطبيق: ' + esc((e && e.message) || e) + '<br><br>استعمل زر التحميل أو المشاركة في الأعلى</div>'; });
            } else vb.innerHTML = '<div class="tgvl"><div class="tg-fi" style="background:' + f.k.c + ';margin:0 auto 14px;width:78px;height:78px;font-size:18px">' + esc(f.k.x) + '</div>' + esc(f.n) + '<br><small>' + f.k.l + ' · ' + fsz(b.size) + '</small><br><br>هذه الصيغة لا تُعرض داخل التطبيق.<br>استعمل ⬇ للتحميل أو ↗ للمشاركة وافتحها بتطبيق مناسب.</div>';
          }, f.get, f.n);
        }
        function openImg(p) { openFile(p); }
        function playVideo(p) { openFile(p); }

        /* ---- روابط ---- */
        function linkSheet(u) {
          var s = lsafe(u);
          var body = s.ok
            ? '<div class="tghint">✅ الرابط آمن حسب الفحص (موقع معروف ومشفّر).<br><b dir="ltr">' + esc(u) + '</b></div><button class="tgrw pri" data-a="open">فتح الرابط</button><button class="tgrw" data-a="share">مشاركة الرابط</button><button class="tgrw" data-a="copy">نسخ الرابط</button>'
            : '<div class="tghint" style="color:#c62828">⚠️ تنبيه: هذا الرابط غير آمن / غير موثوق.<br><b>السبب:</b> ' + esc(s.w) + '<br><b dir="ltr">' + esc(u) + '</b></div><button class="tgrw warn" data-a="open">أنا أتحمّل المسؤولية — فتح الرابط</button><button class="tgrw" data-a="share">مشاركة الرابط</button><button class="tgrw" data-a="copy">نسخ الرابط</button>';
          sheet(s.ok ? 'فتح رابط' : 'رابط غير آمن', body, function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a; close();
              if (a === 'open') { try { P.open(u, '_blank'); } catch (x) { toast('تعذّر فتح الرابط'); } }
              else if (a === 'share') shareText(u); else { try { P.navigator.clipboard.writeText(u); toast('تم نسخ الرابط'); } catch (x) { toast(u); } } };
          });
        }

        /* ---- تعليقات ---- */
        function commentsSheet(pid) {
          var p = cposts(id).filter(function (q) { return q.id === pid; })[0]; if (!p) return; var rp = null;
          function listHtml() {
            var cs = comments(id, pid); if (!cs.length) return '<div class="tghint" style="text-align:center;padding:24px 0">لا توجد تعليقات بعد. كن أول من يعلّق</div>';
            var by = {}; cs.forEach(function (x) { by[x.id] = x; });
            return cs.map(function (x) {
              var a = accOf(x.u), isT = String(x.u) === String(c.o), canDel = me() > 0 || String(x.u) === String(uid);
              return '<div class="tg-cm">' + av(a || null, 36, null) + '<div class="cb">' + (x.rp ? '<div class="rq">↩ ' + esc(x.rp.n || '') + '</div>' : '') + '<b>' + esc(x.n || 'مستخدم') + '</b>' + (isT ? '<span class="tc">المدرس</span>' : '') + '<p>' + linkify(x.t) + '</p><small>' + tmf(x.ts) + '</small>' + (me() > 0 ? '<button data-rp="' + x.id + '">رد</button>' : '') + (canDel ? '<button data-dc="' + x.id + '" style="color:#c62828">حذف</button>' : '') + '</div></div>';
            }).join('');
          }
          var ov = sheet('التعليقات', '<div id="cl">' + listHtml() + '</div><div id="rqb" class="tghint" style="display:none"></div><div class="tg-cp"><textarea id="ci" rows="1" placeholder="اكتب تعليقك..."></textarea><button class="tg-sb" id="cs" style="background:' + grad + '">' + SEND + '</button></div>', function (ov2) {
            var cl = ov2.querySelector('#cl'), rb = ov2.querySelector('#rqb'), ci = ov2.querySelector('#ci');
            function redraw() { cl.innerHTML = listHtml(); }
            ov2.querySelector('.tg-sh').style.maxHeight = '90%';
            cl.onclick = function (e) {
              var r = e.target.closest('[data-rp]'); if (r) { var x = comments(id, pid).filter(function (q) { return q.id === +r.dataset.rp; })[0]; if (x) { rp = { id: x.id, u: x.u, n: x.n }; rb.style.display = 'block'; rb.innerHTML = '↩ رد على <b>' + esc(x.n) + '</b> <a style="color:#c62828;cursor:pointer" id="rpx">إلغاء</a>'; rb.querySelector('#rpx').onclick = function () { rp = null; rb.style.display = 'none'; }; ci.focus(); } return; }
              var d = e.target.closest('[data-dc]'); if (d && confirm('حذف التعليق؟')) { dr(+d.dataset.dc); redraw(); lastSig = ''; render(); }
            };
            ov2.querySelector('#cs').onclick = function () {
              var t = ci.value.trim(); if (!t) return; if (!memb()) return toast('انضم للقناة أولاً');
              var isOwner = me() > 0, to = rp ? String(rp.u) : (isOwner ? '' : String(c.o));
              try { ar({ id: Date.now(), k: 'cc', ch: id, cp: pid, u: String(uid), n: U.name, ro: U.role, t: t, ts: Date.now(), rp: rp, to: to, cn: c.cn }); } catch (e) { return toast('تعذّر الإرسال'); }
              ci.value = ''; rp = null; rb.style.display = 'none'; redraw(); lastSig = ''; render(); cl.parentNode.scrollTop = cl.parentNode.scrollHeight;
            };
          });
        }

        /* ---- قائمة المنشور (للمدرس/المسؤول) ---- */
        function postMenu(pid) {
          var p = cposts(id).filter(function (q) { return q.id === pid; })[0]; if (!p) return;
          var items = (p.t ? '<button class="tgrw" data-a="edit">✏️ تعديل النص</button>' : '') + '<button class="tgrw red" data-a="del">🗑 حذف المنشور</button>';
          sheet('المنشور', items, function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; close();
              if (b.dataset.a === 'del') { if (confirm('حذف المنشور؟')) { dr(pid); if (p.md) { P.fetch(fbase() + '/handout_files/' + p.md.id + '.json', { method: 'DELETE' }).catch(function () {}); } lastSig = ''; render(); } }
              else { var nt = prompt('تعديل نص المنشور', p.t || ''); if (nt !== null) { rs(pid, 't', nt.trim()); rs(pid, 'edited', Date.now()); lastSig = ''; render(); } } };
          });
        }

        /* ===================== ملف تعريف القناة ===================== */
        var SOC = { tiktok: ['TikTok', '#111', function (u) { return 'https://www.tiktok.com/@' + u.replace(/^@/, ''); }], instagram: ['Instagram', '#d6249f', function (u) { return 'https://www.instagram.com/' + u.replace(/^@/, ''); }], facebook: ['Facebook', '#1877f2', function (u) { return /^https?:/.test(u) ? u : 'https://www.facebook.com/' + u.replace(/^@/, ''); }], telegram: ['Telegram', '#229ed9', function (u) { return 'https://t.me/' + u.replace(/^@/, ''); }], youtube: ['YouTube', '#e62117', function (u) { return /^https?:/.test(u) ? u : 'https://www.youtube.com/@' + u.replace(/^@/, ''); }], whatsapp: ['WhatsApp', '#25d366', function (u) { return 'https://wa.me/' + u.replace(/[^\d]/g, ''); }], x: ['X', '#000', function (u) { return 'https://x.com/' + u.replace(/^@/, ''); }], snapchat: ['Snapchat', '#fffc00', function (u) { return 'https://www.snapchat.com/add/' + u.replace(/^@/, ''); }] };
        function showInfo(tab) {
          closeInfo(); c = chOne(id); var role = me(), g2 = gcol(c), gr2 = 'linear-gradient(135deg,' + g2[0] + ',' + g2[1] + ')';
          var el = document.createElement('div'); el.className = 'tg-info'; el.id = 'tgi'; root.appendChild(el);
          var T = [['m', 'الوسائط'], ['f', 'الملفات'], ['l', 'الروابط']]; if (role > 0) T.push(['s', 'المشتركون']);
          tab = tab || 'm'; var q = '';
          function draw() {
            c = chOne(id); if (!c) return closeInfo(); var ps = cposts(id), n = Object.keys(c.m || {}).length;
            var lks = arr(c.lks), socs = arr(c.so), ownerAcc = accOf(c.o);
            var head = '<div style="background:' + gr2 + '"><div class="ih"><button class="cx-b" data-x="1">' + ARW + '</button><b>معلومات القناة</b>' + (role > 0 ? '<button class="cx-b" data-edit="1" title="تعديل القناة">✏️</button>' : '') + '</div><div class="ic">' + av(null, 96, c.img) + '<h3>' + esc(c.cn) + '</h3><p>' + n + ' مشترك' + (c.sj ? ' · ' + esc(c.sj) : '') + '</p></div></div>';
            var about = '<div class="cd"><h5>الوصف</h5><p>' + esc(c.cd || 'قناة مادة ' + (c.sj || '')) + '</p></div>'
              + '<div class="cd"><h5>رابط القناة</h5><div class="ln" data-lk="' + esc(chLink(c)) + '"><span class="ci" style="background:#1d6fd6">🔗</span><span style="direction:ltr;font-size:12.5px;word-break:break-all">' + esc(chLink(c)) + '</span></div><div class="ln" data-sharech="1"><span class="ci" style="background:#14a38b">↗</span>مشاركة رابط القناة</div></div>'
              + '<div class="cd"><h5>المدرس</h5><div class="ln" data-own="1"><span class="ci" style="background:' + g2[1] + '">' + esc((c.on || '؟').trim()[0] || '؟') + '</span>' + esc(c.on || '') + (role === 0 ? '<span style="margin-inline-start:auto;color:#1d6fd6">مراسلة</span>' : '') + '</div></div>';
            var extra = '';
            if (lks.length) extra += '<div class="cd"><h5>روابط القناة</h5>' + lks.map(function (x, i) { return '<div class="ln" data-lk="' + esc(x.u) + '"><span class="ci" style="background:#1d6fd6">🔗</span><div><div>' + esc(x.t || lsafe(x.u).h) + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600">' + esc(x.u) + '</small></div></div>'; }).join('') + '</div>';
            if (socs.length) extra += '<div class="cd"><h5>حسابات القناة</h5>' + socs.map(function (x) { var s = SOC[x.p] || ['رابط', '#475569', function (u) { return u; }]; return '<div class="ln" data-lk="' + esc(s[2](x.u || '')) + '"><span class="ci" style="background:' + s[1] + ';' + (x.p === 'snapchat' ? 'color:#000' : '') + '">' + s[0].slice(0, 2) + '</span><div><div>' + s[0] + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600">' + esc(x.u) + '</small></div></div>'; }).join('') + '</div>';
            var tabs = '<div class="tb">' + T.map(function (x) { return '<button data-tb="' + x[0] + '" class="' + (x[0] === tab ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
            var body = '';
            var show = memb();
            if (!show) body = '<div class="cd"><p style="text-align:center;color:#6b7c99">انضم للقناة لعرض المحتوى</p></div>';
            else if (tab === 'm') { var ms = ps.filter(function (p) { return p.img || p.vid || (p.md && (p.md.k === 'vid' || p.md.k === 'img')); }); body = ms.length ? '<div class="tg-gr">' + ms.map(function (p) { var th = p.img || (p.md && p.md.th) || ''; return '<div data-iv="' + p.id + '" style="' + (th ? 'background-image:url(' + th + ')' : '') + '">' + ((p.vid || (p.md && p.md.k === 'vid')) ? '<span>▶</span>' : '') + '</div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد صور أو فيديوهات</p></div>'; }
            else if (tab === 'f') { var fs = ps.filter(function (p) { return p.fl || (p.md && p.md.k === 'fl'); }); body = fs.length ? '<div class="cd">' + fs.map(function (p) { var f = p.md || p.fl, k = fkind(f.n, f.t); return '<div class="tg-fl" style="background:none;padding:6px 0"><div class="tg-fi" style="background:' + k.c + '">' + esc(k.x) + '</div><div class="tg-fn"><b>' + esc(f.n) + '</b><small>' + k.l + ' · ' + fsz(f.s || ((f.d || '').length * 0.75)) + ' · ' + dyf(p.ts) + '</small></div><div class="tg-fa"><button data-fo="' + p.id + '">👁</button><button data-fd="' + p.id + '">⬇</button><button data-fs="' + p.id + '">↗</button></div></div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد ملفات</p></div>'; }
            else if (tab === 'l') { var us = []; ps.forEach(function (p) { urlsIn(p.t).concat(p.lk ? [p.lk] : []).forEach(function (u) { if (us.indexOf(u) < 0) us.push(u); }); }); body = us.length ? '<div class="cd">' + us.map(function (u) { var s = lsafe(u); return '<div class="ln" data-lk="' + esc(u) + '"><span class="ci" style="background:' + (s.ok ? '#14a38b' : '#e5484d') + '">' + (s.ok ? '🔗' : '⚠') + '</span><div style="min-width:0"><div>' + esc(s.h) + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600;word-break:break-all">' + esc(u) + '</small></div></div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد روابط</p></div>'; }
            else if (tab === 's') body = subsHtml();
            el.innerHTML = head + about + extra + tabs + body;
            var si = el.querySelector('#sq'); if (si) { si.value = q; si.oninput = function () { q = this.value; var pos = this.selectionStart; draw(); var s2 = el.querySelector('#sq'); if (s2) { s2.focus(); try { s2.setSelectionRange(pos, pos); } catch (e) {} } }; }
          }
          function subsHtml() {
            var ps = cposts(id), ccs = comments(id), ms = Object.keys(c.m || {}).map(function (k) { return String(c.m[k]); }).filter(function (u) { return u !== String(c.o); });
            var rows = ms.map(function (u) {
              var a = accOf(u), views = ps.filter(function (p) { return p.vw && p.vw['u' + ok(u)]; }).length, rx = ps.filter(function (p) { return p.rx && p.rx['u' + ok(u)] != null; }).length, cm = ccs.filter(function (x) { return String(x.u) === u; }).length;
              return { u: u, n: a ? a.name : u, g: a && a.grade ? (GN[a.grade] || '') : '', v: views, r: rx, c: cm, s: views + rx * 2 + cm * 3 };
            }).sort(function (a, b) { return b.s - a.s; });
            var f = q.trim() ? rows.filter(function (r) { return nm(r.n).indexOf(nm(q)) > -1; }) : rows;
            return '<div class="cd"><h5>المشتركون (' + rows.length + ') — مرتّبون حسب التفاعل</h5><input id="sq" placeholder="ابحث باسم الطالب..." style="width:100%;border:1.5px solid #dbe5f2;background:#f8fafd;border-radius:14px;padding:10px 13px;font:inherit;margin-bottom:8px;outline:0">'
              + (f.length ? f.map(function (r, i) { return '<div class="tg-sub">' + (i < 3 && r.s > 0 && !q ? '<span class="rk">' + (i + 1) + '</span>' : av(accOf(r.u) || null, 34, null)) + '<div><b>' + esc(r.n) + '</b><small>' + esc(r.g) + (r.s ? ' · نقاط التفاعل ' + r.s : ' · لا تفاعل بعد') + '</small></div><div class="st"><span>👁 ' + r.v + '</span><span>☺ ' + r.r + '</span><span>💬 ' + r.c + '</span></div></div>'; }).join('') : '<p style="text-align:center;color:#6b7c99">لا يوجد مشتركون' + (q ? ' بهذا الاسم' : ' بعد') + '</p>') + '</div>';
          }
          el.onclick = function (e) {
            if (e.target.closest('[data-x]')) return closeInfo();
            var ed = e.target.closest('[data-edit]'); if (ed) return editSheet(draw);
            var tb = e.target.closest('[data-tb]'); if (tb) { tab = tb.dataset.tb; return draw(); }
            var lk = e.target.closest('[data-lk]'); if (lk) return linkSheet(lk.dataset.lk);
            if (e.target.closest('[data-sharech]')) return shareText(c.cn + '\n' + chLink(c));
            if (e.target.closest('[data-own]')) { if (role === 0) { var o = accOf(c.o); if (o) { closeCh(); openChat(dmKey(o)); } else toast('تعذّر العثور على المدرس'); } return; }
            var fo = e.target.closest('[data-fo]'), fd = e.target.closest('[data-fd]'), fs2 = e.target.closest('[data-fs]'), iv = e.target.closest('[data-iv]');
            if (fo) return openFile(pbyid(+fo.dataset.fo)); if (fd) return fileAct(pbyid(+fd.dataset.fd), 'd'); if (fs2) return fileAct(pbyid(+fs2.dataset.fs), 's'); if (iv) return openFile(pbyid(+iv.dataset.iv));
          };
          draw(); el._draw = draw;
        }
        function closeInfo() { var e = root.querySelector('#tgi'); if (e) e.remove(); }
        function pbyid(pid) { return cposts(id).filter(function (q) { return q.id === pid; })[0]; }
        function fileAct(p, act) {
          var f = fileOf(p); if (!f) return; toast(act === 'd' ? 'جاري تجهيز الملف...' : 'جاري تجهيز الملف للمشاركة...');
          f.get(function (x) { }).then(function (b) { if (act === 'd') saveBlob(b, f.n); else shareBlob(b, f.n); }).catch(function (e) { toast('تعذّر: ' + ((e && e.message) || e)); });
        }

        /* ---- تعديل القناة (للمدرس) ---- */
        function editSheet(after) {
          c = chOne(id); var img = c.img, col = c.col || 0, lks = arr(c.lks).map(function (x) { return { t: x.t || '', u: x.u || '' }; }), socs = arr(c.so).map(function (x) { return { p: x.p, u: x.u }; });
          function rowsL() { return lks.map(function (x, i) { return '<div style="display:flex;gap:6px"><input data-lt="' + i + '" placeholder="العنوان" value="' + esc(x.t) + '" style="flex:1"><input data-lu="' + i + '" placeholder="https://..." value="' + esc(x.u) + '" style="flex:2;direction:ltr"><button class="tg-ib" data-ld="' + i + '">✕</button></div>'; }).join(''); }
          function rowsS() { return socs.map(function (x, i) { return '<div style="display:flex;gap:6px"><select data-sp="' + i + '" style="flex:1">' + Object.keys(SOC).map(function (k) { return '<option value="' + k + '"' + (x.p === k ? ' selected' : '') + '>' + SOC[k][0] + '</option>'; }).join('') + '</select><input data-su="' + i + '" placeholder="اسم الحساب أو الرقم" value="' + esc(x.u) + '" style="flex:2;direction:ltr"><button class="tg-ib" data-sd="' + i + '">✕</button></div>'; }).join(''); }
          var ov = sheet('تعديل القناة', '<div style="text-align:center;margin-bottom:8px"><span id="eav">' + av(null, 84, img) + '</span><br><button class="tgrw" id="eim" style="width:auto;display:inline-flex;margin-top:6px">📷 تغيير صورة القناة</button></div>'
            + '<input id="en" maxlength="40" placeholder="اسم القناة" value="' + esc(c.cn) + '"><textarea id="ed" rows="3" maxlength="300" placeholder="وصف القناة">' + esc(c.cd || '') + '</textarea>'
            + '<div class="tghint">لون القناة</div><div class="afch-cols" id="ecol">' + COLS.map(function (g3, i) { return '<button type="button" data-c="' + i + '" class="' + (i === col ? 'on' : '') + '" style="background:linear-gradient(135deg,' + g3[0] + ',' + g3[1] + ')"></button>'; }).join('') + '</div>'
            + '<div class="tghint">روابط القناة</div><div id="el">' + rowsL() + '</div><button class="tgrw" id="ela">+ إضافة رابط</button>'
            + '<div class="tghint">حسابات القناة (تيك توك، انستغرام، ...)</div><div id="es">' + rowsS() + '</div><button class="tgrw" id="esa">+ إضافة حساب</button>'
            + '<button class="tgrw" id="eadm">👥 مسؤولو القناة</button><button class="bt2" id="esv">حفظ التعديلات</button>', function (ov2, close) {
            ov2.querySelector('.tg-sh').style.maxHeight = '92%';
            function sync() { ov2.querySelectorAll('[data-lt]').forEach(function (x) { lks[+x.dataset.lt].t = x.value; }); ov2.querySelectorAll('[data-lu]').forEach(function (x) { lks[+x.dataset.lu].u = x.value; }); ov2.querySelectorAll('[data-sp]').forEach(function (x) { socs[+x.dataset.sp].p = x.value; }); ov2.querySelectorAll('[data-su]').forEach(function (x) { socs[+x.dataset.su].u = x.value; }); }
            ov2.querySelector('#eim').onclick = function () { pick('image/*', function (f) { shrink(f, 400, function (d) { img = d; ov2.querySelector('#eav').innerHTML = av(null, 84, d); }); }); };
            ov2.querySelector('#ecol').onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b) return; col = +b.dataset.c; this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
            ov2.querySelector('#ela').onclick = function () { sync(); if (lks.length >= 8) return; lks.push({ t: '', u: '' }); ov2.querySelector('#el').innerHTML = rowsL(); };
            ov2.querySelector('#esa').onclick = function () { sync(); if (socs.length >= 8) return; socs.push({ p: 'tiktok', u: '' }); ov2.querySelector('#es').innerHTML = rowsS(); };
            ov2.querySelector('#el').onclick = function (e) { var d = e.target.closest('[data-ld]'); if (d) { sync(); lks.splice(+d.dataset.ld, 1); this.innerHTML = rowsL(); } };
            ov2.querySelector('#es').onclick = function (e) { var d = e.target.closest('[data-sd]'); if (d) { sync(); socs.splice(+d.dataset.sd, 1); this.innerHTML = rowsS(); } };
            ov2.querySelector('#eadm').onclick = function () { try { adminSheet(id); } catch (e) { toast('غير متاح'); } };
            ov2.querySelector('#esv').onclick = function () {
              sync(); var n = ov2.querySelector('#en').value.trim(); if (n.length < 2) return toast('اكتب اسم القناة');
              var L = {}, S = {}, bad = '';
              lks.filter(function (x) { return x.u.trim(); }).forEach(function (x, i) { var u = x.u.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; if (!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(u)) bad = u; L[i] = { t: x.t.trim(), u: u }; });
              if (bad) return toast('رابط غير صالح: ' + bad);
              socs.filter(function (x) { return x.u.trim(); }).forEach(function (x, i) { S[i] = { p: x.p, u: x.u.trim() }; });
              rs(id, 'cn', n); rs(id, 'cd', ov2.querySelector('#ed').value.trim()); rs(id, 'col', col); if (img) rs(id, 'img', img);
              rs(id, 'lks', Object.keys(L).length ? L : null); rs(id, 'so', Object.keys(S).length ? S : null);
              toast('تم حفظ تعديلات القناة'); close(); head(); lastSig = ''; render(); if (after) setTimeout(after, 60);
              var inf = root.querySelector('#tgi'); if (inf) { closeInfo(); showInfo(tab0()); }
            };
          });
          function tab0() { return 'm'; }
        }

        /* ---- أحداث المنشورات ---- */
        var lastTap = 0, lastP = 0;
        $('tgm').onclick = function (e) {
          var t = e.target;
          var lk = t.closest('[data-lk]'); if (lk) { e.preventDefault(); return linkSheet(lk.dataset.lk); }
          var rx = t.closest('[data-rx]'); if (rx) { var r = rx.getBoundingClientRect(); return react(+rx.dataset.p, +rx.dataset.i, r.left + 14, r.top); }
          var rp = t.closest('[data-rxp]'); if (rp) return openPicker(+rp.dataset.rxp, rp);
          var cm = t.closest('[data-cm]'); if (cm) return commentsSheet(+cm.dataset.cm);
          var sp = t.closest('[data-sp]'); if (sp) { var p0 = pbyid(+sp.dataset.sp); return shareText((c.cn || '') + '\n' + (p0 && p0.t ? p0.t + '\n' : '') + chLink(c)); }
          var pm = t.closest('[data-pm]'); if (pm) return postMenu(+pm.dataset.pm);
          var iv = t.closest('[data-iv]'); if (iv) return openFile(pbyid(+iv.dataset.iv));
          var vp = t.closest('[data-vp]'); if (vp) return openFile(pbyid(+vp.dataset.vp));
          var fo = t.closest('[data-fo]'); if (fo) return openFile(pbyid(+fo.dataset.fo));
          var fd = t.closest('[data-fd]'); if (fd) return fileAct(pbyid(+fd.dataset.fd), 'd');
          var fs = t.closest('[data-fs]'); if (fs) return fileAct(pbyid(+fs.dataset.fs), 's');
          var vt = t.closest('[data-vt]'); if (vt) { if (!memb()) return toast('انضم للقناة أولاً'); rs(+vt.dataset.vt, 'vt/u' + ok(uid), +vt.dataset.k); lastSig = ''; render(); return; }
          var pb = t.closest('.tg-p'); if (pb && !t.closest('button,a,.tg-rxs')) { var now = Date.now(), pid = +pb.dataset.id; if (now - lastTap < 350 && lastP === pid) { react(pid, 1, e.clientX, e.clientY); lastTap = 0; } else { lastTap = now; lastP = pid; } }
        };

        head(); render(); bar();
        cxT = setInterval(function () { if (!cxEl || document.hidden) return; render(); bar(); }, 2000);
      };
    } catch (e) { try { console.warn('af-tgch', e); } catch (x) {} }
  }

  try {
    var src = window.userMain && window.userMain.toString();
    if (src) {
      var k = src.lastIndexOf('}');
      src = src.slice(0, k) + '\n/* af-tgch */(' + TG.toString() + ')();\n}';
      window.userMain = (0, eval)('(' + src + ')');
      window.USER_CSS = (window.USER_CSS || '') + CSS;
    }
  } catch (e) { try { console.warn('af-tgch user', e); } catch (x) {} }
})();
