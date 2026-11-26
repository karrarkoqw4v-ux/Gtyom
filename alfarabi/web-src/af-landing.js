/* واجهة الدخول لنسخة الموقع: خيارات تثبيت (Android / Apple / المتصفح) بنفس ألوان التطبيق */
(function () {
  'use strict';
  var W = window, D = document, LS = null; try { LS = W.sessionStorage; } catch (e) { }
  var ua = navigator.userAgent || '';
  var standalone = (W.matchMedia && W.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (standalone) return;
  var BASE = (function () { var s = D.currentScript; var u = s && s.src ? s.src : location.href; return u.replace(/[^\/]*([?#].*)?$/, ''); })();
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAnd = /Android/i.test(ua);
  var isSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA|FBAN|FBAV|Instagram|Line\/|Telegram|Snapchat|MicroMessenger/.test(ua);
  var REPO = 'karrarkoqw4v-ux/Gtyom', BR = 'claude/hala-yweuvu', DIR = 'alfarabi/dist';
  var VER = '2026.11.28-e';
  var apk = { url: 'https://github.com/' + REPO + '/raw/' + BR + '/' + DIR + '/alfarabi-v2.0.apk', ver: '' };
  var dip = null, rtApk = null;
  setTimeout(function () { try { if (W.afSite) W.afSite.apkMeta().then(function (m) { if (m && m.ver) rtApk = m; }); } catch (e) { } }, 1500);
  W.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dip = e; refreshPwa(); });
  W.addEventListener('appinstalled', function () { close(); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var I = {
    and: '<svg viewBox="0 0 24 24"><path fill="#3DDC84" d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396"/></svg>',
    app: '<svg viewBox="0 0 24 24"><path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
    apk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9S14.500 18.500 12 21c-2.500-2.500-3.500-5.500-3.500-9S9.500 5.500 12 3z"/></svg>',
    shr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
    cp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    chv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.600-1.500H16.700V4.400c-.3 0-1.200-.1-2.300-.1-2.300 0-3.900 1.400-3.900 4v2.200H8v3h2.500V21z"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm5.200 14.200c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500.2.600.8 2 .9 2.200.1.1.1.3 0 .5-.1.200-.2.300-.3.500l-.4.500c-.1.100-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.100 1 2.100 1.300 2.400 1.400.3.100.5.100.6-.1l.9-1.100c.2-.3.400-.2.600-.1l2 1c.3.100.5.200.5.300.1.200.1.800-.1 1.400z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  var css = D.createElement('style');
  css.textContent = [
    '#afl{position:fixed;inset:0;z-index:2147483647;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;max-width:100vw;direction:rtl;font-family:"Cairo","Noto Naskh Arabic",sans-serif;color:#14213d;background:radial-gradient(420px 320px at 100% 0,rgba(127,211,255,.55),transparent 70%),radial-gradient(380px 300px at 0 100%,rgba(255,215,106,.5),transparent 70%),linear-gradient(180deg,#eaf6ff 0%,#f4f8ff 45%,#fff6dc 100%);background-attachment:local;-webkit-overflow-scrolling:touch}',
    '#afl *{box-sizing:border-box}',
    'html.afl-on body>*:not(#afl):not(#afs):not(#afz):not(#aftoast):not(#afar){display:none!important}',
    '#afl{contain:layout paint;will-change:scroll-position;-webkit-overflow-scrolling:touch}',
    '#afl .bg{position:fixed;inset:0;overflow:hidden;pointer-events:none}',
    '#afl .bl{position:absolute;border-radius:50%;filter:blur(46px);opacity:.55;pointer-events:none}',
    '#afl .b1{width:260px;height:260px;background:#7fd3ff;top:-70px;right:-60px}',
    '#afl .b2{width:240px;height:240px;background:#ffd76a;bottom:-60px;left:-60px}',
    '#afl .b3{width:200px;height:200px;background:#ffb3a7;bottom:30%;right:-90px;opacity:.35}',
    '#afl .wrap{position:relative;min-height:100%;display:flex;flex-direction:column;align-items:center;gap:16px;padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(18px + env(safe-area-inset-bottom,0px))}',
    '#afl .card{margin-top:auto;width:100%;max-width:420px;background:#fdfeff;border:1.5px solid rgba(255,255,255,.9);border-radius:30px;padding:26px 20px 20px;box-shadow:0 6px 18px rgba(30,100,170,.14);text-align:center}',
    '#afl .lgo{position:static;width:112px;height:112px;margin:0 auto 12px;border-radius:50%;background:#fff;box-shadow:0 4px 12px rgba(10,166,245,.3);overflow:hidden;display:grid;place-items:center}',
    '#afl .lgo img{width:100%;height:100%;object-fit:cover}',
    /* ===== واجهة العرض: لقطات حية، مميزات، فريق الفارابي ===== */
    '#afl .sw{width:100%;max-width:420px;display:flex;flex-direction:column;gap:18px;margin-bottom:8px}',
    '#afl .sh2{text-align:center;margin:6px 0 -4px}#afl .sh2 b{display:block;font-size:22px;color:#14213d;font-weight:800}#afl .sh2 small{font-size:13px;color:#51647e}',
    '@keyframes aflRing{0%{box-shadow:0 0 0 0 rgba(10,166,245,.45)}100%{box-shadow:0 0 0 22px rgba(10,166,245,0)}}',
    '@keyframes aflShine{0%{transform:translateX(-120%) skewX(-18deg)}60%,100%{transform:translateX(220%) skewX(-18deg)}}',
    '@keyframes aflUp{from{opacity:0;transform:translateY(26px) scale(.97)}to{opacity:1;transform:none}}',
    '@keyframes aflFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}',
    '@keyframes aflPop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}',
    '@keyframes aflNote{0%,8%{transform:translateY(-130%);opacity:0}16%,70%{transform:none;opacity:1}80%,100%{transform:translateY(-130%);opacity:0}}',
    '@keyframes aflDot{0%,100%{opacity:.25}50%{opacity:1}}',
    '#afl .lgo{animation:aflRing 2.4s ease-out infinite}',
    '#afl .bt.a{position:relative;overflow:hidden}#afl .bt.a::after{content:"";position:absolute;inset:0;width:38%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:aflShine 3.2s ease-in-out infinite}',
    '#afl .rv{opacity:0;transform:translateY(26px)}#afl .rv.in{animation:aflUp .6s cubic-bezier(.2,.8,.3,1) both}',
    '#afl .pv{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px 12px 14px;background:linear-gradient(160deg,rgba(255,255,255,.9),rgba(232,244,255,.85));border:1.5px solid #fff;border-radius:30px;box-shadow:0 10px 30px rgba(30,100,170,.14);position:relative;overflow:hidden}',
    '#afl .pvn{position:absolute;top:10px;right:12px;left:12px;z-index:3;display:flex;gap:10px;align-items:center;background:rgba(20,33,61,.94);color:#fff;border-radius:18px;padding:9px 12px;box-shadow:0 10px 24px rgba(0,0,0,.3);animation:aflNote 7s ease-in-out infinite}',
    '#afl .pvn i{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#2563eb);display:grid;place-items:center;font-style:normal;font-weight:800;flex:none}',
    '#afl .pvn b{display:block;font-size:13px}#afl .pvn span{font-size:12px;opacity:.85;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}',
    '#afl .phf{position:relative;width:206px;aspect-ratio:392/820;border-radius:34px;border:7px solid #14213d;background:#14213d;box-shadow:0 18px 40px rgba(20,33,61,.38);overflow:hidden;animation:aflFloat 5s ease-in-out infinite}',
    '#afl .phf img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.06);transition:opacity .7s ease,transform .9s ease}#afl .phf img.on{opacity:1;transform:none}',
    '#afl .dts{display:flex;gap:7px}#afl .dts i{width:8px;height:8px;border-radius:99px;background:#c3d4ea;transition:all .3s}#afl .dts i.on{width:24px;background:#0aa6f5}',
    '#afl .cap2{font-size:15px;font-weight:800;color:#14213d;min-height:22px;transition:opacity .3s}',
    '#afl .fg{display:grid;grid-template-columns:1fr 1fr;gap:11px}',
    '#afl .fc{background:rgba(255,255,255,.92);border:1.5px solid #fff;border-radius:24px;padding:14px 12px;box-shadow:0 8px 20px rgba(30,100,170,.1);text-align:right}',
    '#afl .fc .fi{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;margin-bottom:8px;box-shadow:0 8px 16px rgba(0,0,0,.14)}#afl .fc .fi svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '#afl .fc b{display:block;font-size:15px;color:#14213d;font-weight:800}#afl .fc small{display:block;font-size:12px;color:#51647e;line-height:1.6;margin-top:2px}',
    '#afl .cb{background:rgba(255,255,255,.94);border-radius:26px;padding:16px 14px;box-shadow:0 8px 22px rgba(30,100,170,.12);border:1.5px solid #fff}',
    '#afl .cb h4{margin:0 0 10px;font-size:16px;color:#14213d}',
    '#afl .msg{display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;opacity:0}',
    '#afl .cb.in .msg{animation:aflPop .5s both}#afl .cb.in .msg:nth-child(2){animation-delay:.5s}#afl .cb.in .msg:nth-child(3){animation-delay:1.1s}#afl .cb.in .msg:nth-child(4){animation-delay:1.7s}',
    '#afl .msg .av2{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:13px;flex:none}',
    '#afl .msg .bb2{background:#182533;color:#fff;border-radius:16px 16px 16px 4px;padding:8px 12px;font-size:13.5px;line-height:1.6;max-width:78%}#afl .msg .bb2 b{display:block;font-size:11.5px;margin-bottom:1px}',
    '#afl .msg.me{flex-direction:row-reverse}#afl .msg.me .bb2{background:linear-gradient(180deg,#31608f,#27527f);border-radius:16px 16px 4px 16px}',
    '#afl .typ{display:flex;gap:4px;padding:6px 2px}#afl .typ i{width:7px;height:7px;border-radius:50%;background:#7f91a4;animation:aflDot 1.2s infinite}#afl .typ i:nth-child(2){animation-delay:.2s}#afl .typ i:nth-child(3){animation-delay:.4s}',
    '#afl .team{display:flex;justify-content:center;margin:2px 0 10px;direction:ltr}#afl .team span{width:52px;height:52px;border-radius:50%;border:3px solid #fff;margin-left:-14px;display:grid;place-items:center;box-shadow:0 6px 14px rgba(0,0,0,.18);animation:aflPop .5s both}#afl .team span svg{width:34px;height:34px}',
    '#afl .stg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}#afl .stg div{background:linear-gradient(135deg,#eaf6ff,#fff6dc);border-radius:18px;padding:11px 12px;text-align:right}#afl .stg b{display:block;font-size:14px;color:#14213d}#afl .stg small{font-size:11.5px;color:#51647e;line-height:1.6;display:block}',
    '@media (prefers-reduced-motion:reduce){#afl *{animation:none!important;transition:none!important}#afl .rv,#afl .msg{opacity:1!important;transform:none!important}}',
    '#afl .hi{font-size:15px;color:#5a6b8c;font-weight:700}',
    '#afl h1{margin:2px 0 4px;font-size:32px;line-height:1.3;color:#1e90ff;font-weight:800}',
    '#afl .sn{font-size:18px;font-weight:800;color:#14213d}',
    '#afl .ds{font-size:13.5px;color:#4b5b78;margin:8px 4px 18px;line-height:1.8}',
    '#afl .bt{width:100%;display:flex;align-items:center;gap:12px;border:0;border-radius:18px;padding:14px 16px;margin:0 0 11px;font:inherit;font-size:16px;font-weight:800;cursor:pointer;text-align:right;position:relative}',
    '#afl .bt svg{width:30px;height:30px;flex:none}',
    '#afl .bt .lg2{width:46px;height:46px;border-radius:14px;background:#fff;display:grid;place-items:center;flex:none;box-shadow:0 2px 8px rgba(0,0,0,.15)}',
    '#afl .bt .lg2 svg{width:28px;height:28px}',
    '#afl .bt .t{flex:1;min-width:0}',
    '#afl .bt small{display:block;font-size:12px;font-weight:600;opacity:.85;margin-top:1px}',
    '#afl .bt:active{transform:scale(.98)}',
    '#afl .a{background:linear-gradient(135deg,#0aa6f5,#2a7de1);color:#fff;box-shadow:0 4px 10px rgba(10,166,245,.3)}',
    '#afl .i{background:#fff;color:#000;border:2px solid #14213d;box-shadow:0 3px 8px rgba(20,33,61,.14)}',
    '#afl .y{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d;box-shadow:0 8px 20px rgba(255,193,7,.4)}',
    '#afl .g{background:rgba(255,255,255,.45);color:#7b88a3;border:1.5px dashed #b8c6df;cursor:default;box-shadow:none}',
    '#afl .k{background:#fff;color:#14213d;border:2px solid #0aa6f5;box-shadow:0 3px 8px rgba(10,166,245,.18)}',
    '#afl .k small{color:#5a6b8c}',
    '#afl .g.c{justify-content:center;gap:10px;padding:16px}',
    '#afl .g .mid{font-weight:800;font-size:15px;color:#5a6b8c}',
    '#afl .g .lg2{background:rgba(255,255,255,.7);opacity:.6;box-shadow:none}',
    '#afl .g .bd{background:rgba(20,33,61,.08);color:#5a6b8c;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:700;white-space:nowrap}',
    '#afl .you{position:absolute;top:-9px;left:14px;background:#ffc107;color:#14213d;font-size:11px;font-weight:800;border-radius:999px;padding:2px 10px}',
    '#afl .sk{background:none;border:0;color:#2a7de1;font:inherit;font-size:14px;font-weight:700;padding:10px;cursor:pointer;text-decoration:underline;text-underline-offset:4px}',
    '#afl .ft{display:flex;gap:6px;align-items:center;justify-content:center;font-size:12px;color:#6b7a98;margin-top:6px}',
    '#afl .ft svg{width:14px;height:14px}',
    '#afs{position:fixed;inset:0;z-index:2147483647;background:rgba(20,33,61,.45);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:"Cairo","Noto Naskh Arabic",sans-serif;animation:aff .2s}',
    '#afs .sh{width:100%;max-width:460px;background:#fff;border-radius:26px 26px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));max-height:92vh;overflow:auto;color:#14213d;animation:afu .28s cubic-bezier(.2,.9,.3,1)}',
    '#afs .gr{width:44px;height:5px;border-radius:9px;background:#d7e0ef;margin:0 auto 12px}',
    '#afs h2{margin:0 0 4px;font-size:19px;text-align:center}',
    '#afs .sb{margin:0 0 14px;text-align:center;font-size:13px;color:#5a6b8c}',
    '#afs .bt{width:100%;display:flex;align-items:center;gap:12px;border:2px solid #e1e8f4;background:#f6f9fd;border-radius:18px;padding:13px 14px;margin:0 0 10px;font:inherit;font-size:15.5px;font-weight:800;color:#14213d;cursor:pointer;text-align:right}',
    '#afs .bt svg{width:26px;height:26px;color:#1288c4;flex:none}',
    '#afs .bt .t{flex:1}',
    '#afs .bt small{display:block;font-size:12px;font-weight:600;color:#5a6b8c;margin-top:1px}',
    '#afs .bt.p{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afs .bt.p svg,#afs .bt.p small{color:#fff}',
    '#afs .bt.y{background:linear-gradient(135deg,#ffe066,#ffc107);border-color:transparent}',
    '#afs .bt.y svg{color:#14213d}',
    '#afs .cl{width:100%;border:0;background:none;color:#5a6b8c;font:inherit;font-weight:700;padding:8px;cursor:pointer}',
    '#afs .ic{display:flex;gap:14px;align-items:center;background:#f6f9fd;border:2px solid #e1e8f4;border-radius:20px;padding:12px 14px;margin:0 0 12px}',
    '#afs .ic img{width:64px;height:64px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,.18)}',
    '#afs .ic b{font-size:17px;display:block}#afs .ic span{font-size:12.5px;color:#5a6b8c}',
    '#afs ol{margin:0 0 12px;padding:0;list-style:none;counter-reset:s}',
    '#afs ol li{counter-increment:s;display:flex;gap:10px;align-items:center;padding:9px 4px;font-size:14.5px;line-height:1.7;border-bottom:1px solid #eef2f9}',
    '#afs ol li::before{content:counter(s);flex:none;width:26px;height:26px;border-radius:50%;background:#0aa6f5;color:#fff;font-weight:800;display:grid;place-items:center;font-size:13px}',
    '#afs ol li svg{width:20px;height:20px;vertical-align:middle;color:#1288c4}',
    '#afs .wn{background:#fff6dc;border:1.5px solid #ffe08a;border-radius:16px;padding:12px;font-size:14px;line-height:1.8;margin:0 0 12px}',
    '#afs .ar{position:fixed;bottom:12px;left:50%;margin-left:-14px;font-size:30px;color:#ffc107;animation:afb 1s infinite;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.4)}',

    '#afl .doc{width:100%;max-width:420px;margin-bottom:auto}',
    '#afl .dc{background:#fdfeff;border:1.5px solid rgba(255,255,255,.95);border-radius:26px;padding:18px 16px;box-shadow:0 4px 12px rgba(30,100,170,.1);margin-bottom:14px}',
    '#afl .dc h3{margin:0 0 4px;font-size:19px;text-align:center;color:#14213d;font-weight:800}',
    '#afl .dc .sb2{margin:0 0 12px;text-align:center;font-size:13px;color:#5a6b8c}',
    '#afl .lb{font-size:12.5px;font-weight:800;color:#5a6b8c;margin:8px 4px 6px;text-align:right}',
    '#afl .gd{display:grid;gap:8px}#afl .g3{grid-template-columns:repeat(3,1fr)}#afl .g2{grid-template-columns:repeat(2,1fr)}',
    '#afl .gd button{border:2px solid #e1e8f4;background:#f6f9fd;color:#14213d;border-radius:14px;padding:10px 4px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;line-height:1.4}',
    '#afl .gd button.on{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afl .gd.r button.on{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d}',
    '#afl .ch{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:0 0 10px}',
    '#afl .ch button{border:2px solid #e1e8f4;background:#f6f9fd;color:#14213d;border-radius:999px;padding:7px 14px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}',
    '#afl .ch button.on{background:linear-gradient(135deg,#0aa6f5,#2a7de1);border-color:transparent;color:#fff}',
    '#afl .ch.r button.on{background:linear-gradient(135deg,#ffe066,#ffc107);color:#14213d}',
    '#afl .st{margin:0;padding:0;list-style:none;counter-reset:q}',
    '#afl .st li{counter-increment:q;display:flex;gap:10px;align-items:flex-start;padding:9px 2px;font-size:14.5px;line-height:1.8;border-bottom:1px solid #eef2f9;text-align:right}',
    '#afl .st li:last-child{border-bottom:0}',
    '#afl .st li::before{content:counter(q);flex:none;width:26px;height:26px;margin-top:2px;border-radius:50%;background:#0aa6f5;color:#fff;font-weight:800;display:grid;place-items:center;font-size:13px}',
    '#afl .nt{background:#fff6dc;border:1.5px solid #ffe08a;border-radius:14px;padding:10px 12px;font-size:13.5px;line-height:1.8;margin-top:10px;text-align:right}',
    '#afl .cr{text-align:center;padding:6px 8px 4px;color:#33425f;font-size:14px;line-height:2}',
    '#afl .cr b{color:#14213d}',
    '#afl .cr .ln{width:60px;height:4px;border-radius:9px;background:linear-gradient(90deg,#0aa6f5,#ffc107);margin:0 auto 10px}',
    '#afl .dn{text-align:center;font-size:12px;color:#6b7a98;margin:-2px 0 6px}',
    '#afl .dc h3{margin:0 0 4px}',
    '#afl .ac{width:100%;display:flex;align-items:center;gap:12px;border:2px solid #e1e8f4;background:#f6f9fd;border-radius:18px;padding:12px 14px;margin:0 0 10px;font:inherit;font-size:15.5px;font-weight:800;color:#14213d;text-align:right;text-decoration:none;cursor:pointer}',
    '#afl .ac .t{flex:1;min-width:0}',
    '#afl .ac small{display:block;font-size:12.5px;font-weight:600;color:#5a6b8c;margin-top:2px}',
    '#afl .ac>svg{width:18px;height:18px;color:#9aa8c4;flex:none}',
    '#afl .ai{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;flex:none}',
    '#afl .ai svg{width:26px;height:26px}',
    '#afl .ai.fb{background:linear-gradient(135deg,#1877f2,#0b5fd0)}',
    '#afl .ai.ph{background:linear-gradient(135deg,#0aa6f5,#2a7de1)}',
    '#afl .cr h3{margin:0 0 10px;font-size:18px}',
    '#afl .cm{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-bottom:1px dashed #dbe5f3;font-size:13.5px;color:#5a6b8c}',
    '#afl .cm b{font-size:16.5px;color:#14213d}',
    '#afl .rw{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}',
    '#afl .rw div{background:linear-gradient(135deg,#eaf6ff,#fff6dc);border:1.5px solid #e1e8f4;border-radius:16px;padding:10px 6px}',
    '#afl .rw small{display:block;font-size:12px;color:#5a6b8c;margin-bottom:3px}',
    '#afl .rw b{font-size:14.5px;color:#14213d;line-height:1.5}',
    '@keyframes afu{from{transform:translateY(100%)}to{transform:none}}@keyframes aff{from{opacity:0}to{opacity:1}}@keyframes afb{50%{transform:translateY(8px)}}',
    /* ===== صقل التصميم v2: بنر علوي، أزرار موحّدة، أيقونات أكبر، أحجام مرتبة ===== */
    '#afl .card{padding:0 18px 20px;overflow:hidden;border-radius:32px;box-shadow:0 18px 44px rgba(30,100,170,.2)}',
    '#afl .hero{position:relative;margin:0 -18px;padding:26px 18px 64px;background:linear-gradient(135deg,#1aa7f2,#2f5fd0 70%,#3a3fb8);color:#fff;overflow:hidden}',
    '#afl .hero i{position:absolute;border-radius:50%;background:rgba(255,255,255,.12);pointer-events:none}',
    '#afl .hero .d1{width:190px;height:190px;top:-70px;left:-50px;animation:aflFloat 7s ease-in-out infinite}#afl .hero .d2{width:120px;height:120px;bottom:-30px;right:-20px;background:rgba(255,193,7,.22);animation:aflFloat 6s ease-in-out infinite reverse}#afl .hero .d3{width:60px;height:60px;top:40px;right:46px;background:rgba(255,255,255,.18);animation:aflFloat 4.5s ease-in-out infinite}',
    '#afl .hero .hi{position:relative;font-size:14px;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:.2px}',
    '#afl .hero h1{position:relative;margin:4px 0 0;font-size:36px;line-height:1.25;color:#fff;font-weight:800;text-shadow:0 4px 14px rgba(0,0,40,.25)}',
    '#afl .hero .sn{position:relative;font-size:19px;font-weight:700;color:#fff;opacity:.96}',
    '#afl .hero .mo{position:relative;margin:8px auto 0;display:inline-block;font-size:12.5px;font-weight:700;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 14px}',
    '#afl .lgo{width:104px;height:104px;margin:-52px auto 10px;position:relative;z-index:2;border:5px solid #fff;box-shadow:0 10px 26px rgba(20,60,140,.28)}',
    '#afl .lgo img{object-fit:contain;padding:7px;background:#fff}',
    '#afl .ds{font-size:14.5px;line-height:1.9;margin:6px 2px 16px;color:#42536f}',
    '#afl .bt{min-height:74px;border-radius:22px;padding:12px 14px;gap:13px;font-size:17px;line-height:1.35;margin:0 0 12px}',
    '#afl .bt .lg2{width:50px;height:50px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,.18)}#afl .bt .lg2 svg{width:30px;height:30px}',
    '#afl .bt .t{text-align:right}#afl .bt small{font-size:12.5px;opacity:.9;margin-top:2px}',
    '#afl .bt.a{background:linear-gradient(135deg,#0aa6f5,#2f6fe0);color:#fff;box-shadow:0 12px 26px rgba(20,110,230,.38)}',
    '#afl .bt.d{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:0;box-shadow:0 12px 26px rgba(79,70,229,.32)}#afl .bt.d small{color:#fff;opacity:.9}',
    '#afl .bt.i{background:linear-gradient(135deg,#243556,#0f1a33);color:#fff;border:0;box-shadow:0 12px 26px rgba(15,26,51,.32)}#afl .bt.i small{color:#fff;opacity:.8}',
    '#afl .bt.g{min-height:62px;background:rgba(255,255,255,.7);border:1.5px dashed #b8c6df}',
    '#afl .you{position:static;order:5;margin-inline-start:auto;align-self:flex-start;font-size:11.5px;padding:3px 11px;box-shadow:0 4px 10px rgba(255,193,7,.45)}',
    '#afl .pl{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin:2px 0 10px}#afl .pl span{font-size:12px;font-weight:700;color:#2a5da8;background:#eaf3ff;border-radius:999px;padding:4px 11px}',
    '#afl .ft{font-size:12.5px;margin-top:8px}',
    '#afl .sh2 b{font-size:25px;line-height:1.35}#afl .sh2 small{font-size:14px}',
    '#afl .sh2 b::after{content:"";display:block;width:48px;height:4px;border-radius:4px;margin:9px auto 0;background:linear-gradient(90deg,#0aa6f5,#ffc107)}',
    '#afl .phf{width:224px;border-width:8px}#afl .cap2{font-size:16px}',
    '#afl .pv{background:linear-gradient(160deg,#ffffff,#e4f1ff 55%,#fff1dc)}',
    '#afl .fg{gap:12px}#afl .fc{padding:16px 13px;border-radius:26px}',
    '#afl .fc .fi{width:54px;height:54px;border-radius:18px;margin-bottom:10px}#afl .fc .fi svg{width:29px;height:29px;stroke-width:2}',
    '#afl .fc b{font-size:16.5px}#afl .fc small{font-size:12.5px;line-height:1.7;margin-top:3px}',
    '#afl .cb{padding:18px 15px}#afl .cb h4{font-size:18px;margin-bottom:12px}',
    '#afl .msg .bb2{font-size:14.5px}#afl .msg .bb2 b{font-size:12.5px}',
    '#afl .stg b{font-size:15px}#afl .stg small{font-size:12.5px}',
    /* ===== أزرار التثبيت: ترتيب نهائي (تتغلب على قاعدة الأزرار العامة) ===== */
    'html:root body #afl .bt{min-height:84px!important;height:auto!important;padding:14px 16px!important;border-radius:24px!important;display:flex!important;align-items:center!important;gap:14px!important;margin:0 0 12px!important;font-size:17px!important;line-height:1.4!important;overflow:visible!important}',
    'html:root body #afl .bt.g{min-height:70px!important}',
    'html:root body #afl .bt .lg2{width:56px!important;height:56px!important;min-width:56px!important;border-radius:18px!important;display:grid!important;place-items:center!important;flex:none!important;margin:0!important}',
    'html:root body #afl .bt .lg2 svg{width:32px!important;height:32px!important;margin:0!important}',
    'html:root body #afl .bt .t{flex:1!important;min-width:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:3px!important;text-align:right!important;direction:rtl!important}',
    'html:root body #afl .bt .t b{display:block!important;font-size:18px!important;font-weight:800!important;line-height:1.3!important}',
    'html:root body #afl .bt .t small{display:block!important;font-size:13px!important;font-weight:600!important;line-height:1.5!important;margin:0!important}',
    'html:root body #afl .bt .t bdi{unicode-bidi:isolate;white-space:nowrap}',
    'html:root body #afl .bt .you{position:static!important;order:0!important;margin:0!important;align-self:center!important;flex:none!important;font-size:12px!important;font-weight:800!important;padding:4px 12px!important;border-radius:999px!important;white-space:nowrap!important}',
    'html:root body #afl .bt .bd{flex:none!important;font-size:12.5px!important;padding:5px 12px!important;white-space:nowrap!important}',
    'html:root body #afl .bt.a .lg2{background:#fff!important}html:root body #afl .bt.i .lg2{background:#fff!important}',
    /* ===== أزرار كاملة التفاصيل: لوحة أيقونة كبيرة + عنوان + وصف + شرائط معلومات + زر إجراء ===== */
    'html:root body #afl .bt{min-height:118px!important;padding:0!important;overflow:hidden!important;gap:0!important;border-radius:28px!important;align-items:stretch!important}',
    'html:root body #afl .bt .lg2{width:92px!important;min-width:92px!important;height:auto!important;border-radius:0!important;align-self:stretch!important;background:rgba(255,255,255,.96)!important;box-shadow:none!important;display:grid!important;place-items:center!important}',
    'html:root body #afl .bt .lg2 svg{width:46px!important;height:46px!important}',
    'html:root body #afl .bt.k .lg2{background:#eaf6ff!important}html:root body #afl .bt.g .lg2{background:rgba(255,255,255,.6)!important}',
    'html:root body #afl .bt .t{padding:13px 14px!important;gap:4px!important}',
    'html:root body #afl .bt .t b{font-size:19px!important}html:root body #afl .bt .t small{font-size:13.5px!important}',
    'html:root body #afl .bt .mt{display:flex!important;flex-wrap:wrap;gap:5px;margin:5px 0 0!important;padding:0;font-style:normal;direction:rtl}',
    'html:root body #afl .bt .mt u{text-decoration:none;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.22);color:inherit;border:1px solid rgba(255,255,255,.3);white-space:nowrap}',
    'html:root body #afl .bt.k .mt u{background:#eaf6ff;color:#1d6fb8;border-color:#cfe6fb}',
    'html:root body #afl .bt .go{flex:none;width:50px;align-self:center;margin-inline-end:12px;height:50px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);color:inherit}',
    'html:root body #afl .bt .go svg{width:24px!important;height:24px!important;color:inherit;stroke:currentColor;fill:none}',
    'html:root body #afl .bt.k .go{background:#eaf6ff;border-color:#cfe6fb;color:#0a86d6}',
    'html:root body #afl .bt .you{position:absolute!important;top:10px!important;left:12px!important;margin:0!important;z-index:2}',
    'html:root body #afl .bt.g{min-height:96px!important}html:root body #afl .bt.g .bd{align-self:center;margin-inline-end:14px!important}',
    'html:root body #afl .bt:active .go{transform:scale(.9)}html:root body #afl .bt .go{transition:transform .15s}',
    '@keyframes aflNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}html:root body #afl .bt.a .go svg{animation:aflNudge 1.6s ease-in-out infinite}',
    /* ضبط نهائي للأزرار الكاملة: بلا التفاف، مقاسات متوازنة */
    'html:root body #afl .bt{min-height:104px!important}',
    'html:root body #afl .bt .lg2{width:74px!important;min-width:74px!important}html:root body #afl .bt .lg2 svg{width:40px!important;height:40px!important}',
    'html:root body #afl .bt .t{padding:12px 12px!important;gap:3px!important}',
    'html:root body #afl .bt .t b{font-size:17px!important;white-space:nowrap!important}html:root body #afl .bt .t small{font-size:12.5px!important;white-space:nowrap!important}',
    'html:root body #afl .bt .mt{flex-wrap:nowrap!important;gap:4px!important;margin-top:6px!important}html:root body #afl .bt .mt u{font-size:10.5px!important;padding:2px 7px!important}',
    'html:root body #afl .bt .go{width:42px!important;height:42px!important;margin-inline-end:10px!important}html:root body #afl .bt .go svg{width:21px!important;height:21px!important}',
    'html:root body #afl .bt .you{top:8px!important;left:10px!important;font-size:11px!important;padding:2px 9px!important}',
    'html:root body #afl .bt.g{min-height:84px!important}html:root body #afl .bt.g .t b{font-size:17px!important}',
    'html:root body #afl .bt .go{align-self:center!important;margin-top:18px!important}',
    /* بنر الموقع: صورة المدرسة كخلفية (أنوار + كتاب + اسم المدرسة + الهاتف والموقع) */
    'html:root body #afl .hero{padding:0!important;height:auto!important;aspect-ratio:1268/723;background:#0b1f6b!important}',
    'html:root body #afl .hero .hbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;animation:aflKen 14s ease-in-out infinite alternate}',
    '@keyframes aflKen{from{transform:scale(1)}to{transform:scale(1.07)}}',
    'html:root body #afl .hero .d1,html:root body #afl .hero .d3{background:rgba(255,255,255,.07)}',
    'html:root body #afl .hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(transparent,rgba(18,8,28,.55));pointer-events:none}',
    'html:root body #afl .lgo{margin-top:-58px!important}',
    /* الشعار تحت صورة البنر لا فوق الهاتف والموقع */
    'html:root body #afl .hero{aspect-ratio:auto!important;height:0!important;padding:0 0 calc(74.6% + 64px)!important}',
    'html:root body #afl .hero .hbg{height:calc(100% - 64px)!important;bottom:auto!important}',
    'html:root body #afl .hero::after{display:none!important}',
    'html:root body #afl .lgo{margin-top:-60px!important}',
    /* عرض صورة المدرسة كاملة عند الضغط على البنر */
    'html:root body #afl .hero{cursor:zoom-in;-webkit-tap-highlight-color:transparent}',
    'html:root body #afl .hero .zm{position:absolute;top:12px;left:12px;z-index:3;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.55);color:#fff;border-radius:999px;padding:5px 12px;font-size:12px;font-weight:700;pointer-events:none}',
    '#afz{position:fixed;inset:0;z-index:2147483647;background:rgba(8,4,14,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:16px;direction:rtl;font-family:"Cairo","Noto Naskh Arabic",sans-serif;animation:aff .25s}',
    '#afz img{width:100%;max-width:760px;max-height:72vh;object-fit:contain;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:aflPop .4s both}',
    '#afz button{border:0;border-radius:999px;padding:14px 30px;font:800 17px inherit;cursor:pointer;color:#fff;background:linear-gradient(135deg,#0aa6f5,#2f6fe0);box-shadow:0 10px 24px rgba(10,120,230,.45)}',
    '#afz .x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:14px;width:46px;height:46px;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.16);box-shadow:none;font-size:24px}',
    /* ===== الصورة خلفية فقط: ألوان التصميم كما هي، وأطراف الصورة تتلاشى بشفافية داخل لون الصفحة ===== */
    'html:root body #afl .wrap{position:relative;padding-top:0!important}',
    'html:root body #afl .pbg{position:absolute;top:0;left:0;right:0;height:min(112vw,470px);background:url(shots/school-hero2.jpg) center 6%/cover no-repeat;z-index:0;cursor:zoom-in;-webkit-tap-highlight-color:transparent;-webkit-mask-image:linear-gradient(to bottom,#000 70%,rgba(0,0,0,.6) 86%,transparent 100%);mask-image:linear-gradient(to bottom,#000 70%,rgba(0,0,0,.6) 86%,transparent 100%)}',
    'html:root body #afl .pbg .zm{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);background:rgba(20,33,61,.62);color:#fff;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:700;pointer-events:none;white-space:nowrap}',
    'html:root body #afl .card{position:relative;z-index:1;margin-top:min(74vw,310px)!important;overflow:visible!important;padding-top:56px!important}',
    'html:root body #afl .lgo{margin-top:-108px!important;margin-bottom:12px!important}',
  ].join('\n');
  D.head.appendChild(css);

  var root = D.createElement('div'); root.id = 'afl';
  var logo = BASE + 'logo.jpg', ico = BASE + 'icon-192.png';
  function badge(t) { return '<span class="you">' + t + '</span>'; }

  function svgi(d) { return '<svg viewBox="0 0 24 24">' + d + '</svg>'; }
  var AVA = function (c1, c2, face) { return '<svg viewBox="0 0 40 40"><defs><linearGradient id="g' + face + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="40" height="40" fill="url(#g' + face + ')"/><circle cx="20" cy="15" r="7.5" fill="#fff" opacity=".95"/><path d="M5 40c1.500-9 8-13 15-13s13.500 4 15 13z" fill="#fff" opacity=".95"/></svg>'; };
  var SHOTS = [['home', 'الرئيسية بتصميم عصري'], ['chat', 'محادثات الجروب بتصميم تيليجرام'], ['grades', 'درجات امتحاناتك بالألوان'], ['plans', 'تحاضير الدروس اليومية'], ['schedule', 'جدول الأسبوع والدوام']];
  var FEATS = [
    ['المحادثات الفورية', 'جروب الصف ومحادثة خاصة مع المدرس، تصلك الرسالة بالثانية.', 'linear-gradient(135deg,#38bdf8,#2563eb)', '<path d="M4 5h16v11H9l-5 4z"/>'],
    ['إشعارات بصورة المرسل', 'اسم المرسل وصورته ورسالته على شاشتك حتى لو التطبيق مغلق.', 'linear-gradient(135deg,#fb7185,#e11d48)', '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>'],
    ['درجاتك أولاً بأول', 'درجة كل امتحان مع المادة والنسبة، لك ولولي أمرك.', 'linear-gradient(135deg,#4ade80,#16a34a)', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
    ['تحاضير وملازم', 'تحضير الدرس ووصفه واسم المدرس، والملازم بقارئ داخل التطبيق.', 'linear-gradient(135deg,#a78bfa,#7c3aed)', '<path d="M5 4h10l4 4v12H5z"/><path d="M9 13h6M9 17h6"/>'],
    ['قنوات المدرسين', 'منشورات وصور وتعليقات من قناة كل مادة بتصميم أنيق.', 'linear-gradient(135deg,#fbbf24,#f97316)', '<path d="M3 11v3l12 5V6zM15 9a4 4 0 0 1 0 6"/>'],
    ['جدول ودوام وعطل', 'جدول الحصص الأسبوعي وأيام الدوام والعطل بمتناول يدك.', 'linear-gradient(135deg,#2dd4bf,#0d9488)', '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>']
  ];
  var showcase = '<section class="sw">' +
    '<div class="sh2 rv"><b>شاهد التطبيق من الداخل</b><small>لقطات حقيقية من تطبيق ثانوية الفارابي</small></div>' +
    '<div class="pv rv"><div class="pvn"><i>م</i><div><b>أستاذ الرياضيات</b><span>وصلت الملزمة الجديدة، حمّلوها من قسم الملازم</span></div></div>' +
    '<div class="phf" id="afph">' + SHOTS.map(function (x, i) { return '<img' + (i ? '' : ' class="on"') + ' src="' + BASE + 'shots/' + x[0] + '.jpg" alt="' + x[1] + '" loading="lazy">'; }).join('') + '</div>' +
    '<div class="cap2" id="afcap">' + SHOTS[0][1] + '</div><div class="dts" id="afdt">' + SHOTS.map(function (x, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div></div>' +
    '<div class="sh2 rv"><b>كل ما يحتاجه الطالب</b><small>في تطبيق واحد سريع وخفيف</small></div>' +
    '<div class="fg">' + FEATS.map(function (f, i) { return '<div class="fc rv" style="animation-delay:' + (i * .07) + 's"><div class="fi" style="background:' + f[2] + '">' + svgi(f[3]) + '</div><b>' + f[0] + '</b><small>' + f[1] + '</small></div>'; }).join('') + '</div>' +
    '<div class="cb rv" id="afcb"><h4>رسالة تصل بالثانية</h4>' +
    '<div class="msg"><div class="av2" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">م</div><div class="bb2"><b style="color:#a78bfa">أستاذ الرياضيات</b>الامتحان الشهري يوم الأحد الساعة التاسعة</div></div>' +
    '<div class="msg me"><div class="bb2">ان شاء الله، هل يشمل الفصل الثالث؟</div></div>' +
    '<div class="msg"><div class="av2" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">م</div><div class="bb2"><b style="color:#a78bfa">أستاذ الرياضيات</b>نعم، من الفصل الأول إلى الثالث</div></div>' +
    '<div class="msg"><div class="typ"><i></i><i></i><i></i></div></div></div>' +
    '<div class="cb rv"><h4>أسرة ثانوية الفارابي</h4><div class="team">' +
    [['#38bdf8', '#2563eb', 1], ['#fb7185', '#e11d48', 2], ['#4ade80', '#16a34a', 3], ['#a78bfa', '#7c3aed', 4], ['#fbbf24', '#f97316', 5]].map(function (c, i) { return '<span style="animation-delay:' + (i * .12) + 's">' + AVA(c[0], c[1], c[2]) + '</span>'; }).join('') +
    '</div><div class="sn" style="text-align:center;font-size:16px">ثانوية الفارابي الأهلية للبنين</div><p class="ds" style="text-align:center;margin:4px 0 0">تربية هادفة و تعليم متميز</p>' +
    '<div class="stg"><div><b>المرحلة المتوسطة</b><small>كادر التدريس · الطالب · ولي الأمر</small></div><div><b>المرحلة الإعدادية</b><small>كادر التدريس · الطلاب · ولي الأمر</small></div></div></div>' +
    '</section>';

  root.innerHTML = '<div class="wrap"><div class="pbg" id="afpb"><span class="zm">اضغط على الصورة للتكبير</span></div><div class="card">' +
    '<div class="lgo"><img src="' + logo + '" alt="شعار المدرسة"></div>' +
    '<p class="ds">ثبّت التطبيق على جهازك حتى توصلك الإشعارات والرسائل والتفاصيل مباشرة، حتى لو كان التطبيق مغلقاً.</p>' +
    '<button class="bt a" data-a="apk"><span class="lg2">' + I.and + '</span>' + '<span class="t"><b>تثبيت على <bdi dir="ltr">Android</bdi></b><small>تنزيل مباشر لنسخة <bdi dir="ltr">APK</bdi></small><em class="mt"><u id="afbv">أحدث إصدار</u><u id="afbs">تنزيل سريع</u></em></span>' + (isAnd ? badge('جهازك') : '') + '<span class="go">' + I.apk + '</span></button>' +
    '<button class="bt i" data-a="ios"><span class="lg2">' + I.app + '</span>' + '<span class="t"><b>تثبيت على <bdi dir="ltr">Apple</bdi></b><small><bdi dir="ltr">iPhone</bdi> و <bdi dir="ltr">iPad</bdi> من سفاري</small><em class="mt"><u>خطوتان فقط</u><u>بدون ملفات</u><u>Safari</u></em></span>' + (isIOS ? badge('جهازك') : '') + '<span class="go">' + I.shr + '</span></button>' +
    (isIOS ? '' : '<button class="bt d" data-a="designer"><span class="lg2"><svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M9 10l2 2 4-4"/></svg></span><span class="t"><b>تثبيت كتطبيق للمصممين</b><small>للمصمم والمسؤول فقط — يحتاج كلمة سر</small></span></button>') +
    '<div class="bt g"><span class="lg2">' + I.app + '</span><span class="t"><b><bdi dir="ltr">App Store</bdi></b><small>قريباً على متجر آبل</small></span><span class="bd">قيد التطبيق</span></div>' +
    '<div class="pl"><span id="afv2">أحدث إصدار</span><span>Android 8 فأحدث</span><span>تحديثات تلقائية</span></div>' +
    '<div class="ft">' + I.lock + '<span>بياناتك نفسها في الموقع والتطبيق</span></div><div class="ft" style="opacity:.7;margin-top:2px">نسخة الموقع <bdi dir="ltr">' + VER + '</bdi></div>' +
    '</div>' + showcase + '<div class="doc" id="afdoc"></div></div>';


  var STM = [['m1', 'أول متوسط'], ['m2', 'ثاني متوسط'], ['m3', 'ثالث متوسط']], STP = [['p4', 'الرابع العلمي'], ['p5', 'الخامس العلمي']];
  var ROLES = [['st', 'طالب'], ['pa', 'ولي الأمر'], ['te', 'كادر التدريس']];
  var GN = { m1: 'أول متوسط', m2: 'ثاني متوسط', m3: 'ثالث متوسط', p4: 'الرابع العلمي', p5: 'الخامس العلمي' };
  function isPrep(st) { return st === 'p4' || st === 'p5'; }
  function steps(role, stage) {
    var g = GN[stage];
    if (role === 'st') return ['اذا كنت طالباً، اختر «طالب» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'قم بإدخال اسمك الثلاثي.', 'قم بإدخال معرّف حسابك من خلال بطاقة المدرسة.', 'قم بإدخال كلمة السر.', 'حدّد الصف: <b>' + g + '</b>.', 'اضغط «موافقة والتالي».', 'أو استخدم «عبر معرّف حسابي»: امسح باركود البطاقة بالكاميرا وسجّل مباشرة.'];
    if (role === 'pa') return ['اختر «ولي الأمر» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'اكتب اسمك واسم ابنك الثلاثي.', 'حدّد صف الابن: <b>' + g + '</b>.', 'أكمل رقم الهاتف إذا طُلب منك.', 'اضغط «موافق ومتابعة»، وتظهر لك تفاصيل ابنك.'];
    return ['اختر «كادر التدريس» من صفحة الدخول (المرحلة ' + (isPrep(stage) ? 'الإعدادية' : 'المتوسطة') + ').', 'اكتب اسمك الثلاثي ومعرّف حساب المدرس.', 'اختر الصف الذي تدرّسه: <b>' + g + '</b>، ثم اختر المادة.', 'اضغط «تحقق»، وبعد نجاح التحقق تدخل لحسابك وتبدأ بالتحاضير والرسائل.'];
  }
  var dst = 'm3', drl = 'st';
  function docHtml() {
    function chips(a) { return a.map(function (x) { return '<button data-s="' + x[0] + '"' + (x[0] === dst ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join(''); }
    var rc = ROLES.map(function (x) { return '<button data-r="' + x[0] + '"' + (x[0] === drl ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('');
    return '<div class="dc"><h3>شروط الاستخدام وطريقة التسجيل</h3><p class="sb2">اختر صفك ثم نوع حسابك</p>' +
      '<div class="lb">المرحلة المتوسطة</div><div class="gd g3">' + chips(STM) + '</div><div class="lb">المرحلة الإعدادية</div><div class="gd g2">' + chips(STP) + '</div><div class="lb">نوع الحساب</div><div class="gd g3 r">' + rc + '</div>' +
      '<ol class="st">' + steps(drl, dst).map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('') + '</ol>' +
      '<div class="nt">المعرّف وكلمة السر تستلمهما من بطاقة المدرسة. إذا واجهتك مشكلة بالدخول راجع دعم المدرسة من صفحة الدخول.</div></div>' +
      '<div class="dc cr"><div class="ln"></div><h3>الشكر والتقدير</h3>' +
      '<div class="cm"><span>تم تطوير التطبيق من</span><b>الإدارة المحترمة</b></div>' +
      '<div class="cm"><span>وبجهود الأساتذة</span><b>كادر التدريس المحترم</b></div>' +
      '<div class="rw"><div><small>المشرف</small><b>الأستاذ زين العابدين</b></div><div><small>المصمم</small><b>كرار حيدر</b></div></div></div>' +
      '<button class="ac" data-a="dev" style="margin-top:2px"><span class="ai ph" style="background:linear-gradient(135deg,#1f2a44,#14213d)">' + I.lock + '</span><span class="t">حساب المطوّر<small>للمطوّر فقط</small></span>' + I.chv + '</button>';
  }


  /* حجم التطبيق داخل الزر */
  setTimeout(function () { try { fetch(BASE + 'alfarabi.apk', { method: 'HEAD', cache: 'no-store' }).then(function (r) { var n = +r.headers.get('content-length') || 0, e = D.getElementById('afbs'); if (n && e) e.textContent = (n / 1048576).toFixed(1) + ' MB'; }).catch(function () { }); } catch (e) { } }, 900);


  /* الضغط على صورة البنر: تظهر كاملة، وزر للرجوع إلى التثبيت */
  (function () {
    var h = root.querySelector('#afpb'); if (!h) return;
    function openZ() {
      if (D.getElementById('afz')) return;
      var o = D.createElement('div'); o.id = 'afz';
      o.innerHTML = '<button class="x" aria-label="إغلاق">✕</button><img src="' + BASE + 'shots/school-hero2.jpg" alt="ثانوية الفارابي الأهلية للبنين"><button class="bk">الرجوع للتثبيت</button>';
      function shut() { o.remove(); }
      o.addEventListener('click', function (e) { if (e.target === o || (e.target.closest && e.target.closest('button'))) shut(); });
      D.body.appendChild(o);
    }
    h.addEventListener('click', openZ);
  })();

  /* حركات العرض: تبديل اللقطات + ظهور تدريجي عند التمرير */
  (function () {
    var i = 0, ph = root.querySelector('#afph'), dt = root.querySelector('#afdt'), cap = root.querySelector('#afcap');
    function go(n) { var im = ph.querySelectorAll('img'), ds = dt.querySelectorAll('i'); im[i].classList.remove('on'); ds[i].classList.remove('on'); i = n % im.length; im[i].classList.add('on'); ds[i].classList.add('on'); cap.textContent = SHOTS[i][1]; }
    if (ph) { setInterval(function () { go(i + 1); }, 2800); dt.addEventListener('click', function (e) { var k = Array.prototype.indexOf.call(dt.children, e.target); if (k > -1) go(k); }); }
    function reveal() {
      var els = root.querySelectorAll('.rv,.cb');
      if (!('IntersectionObserver' in W)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { root: root, threshold: .15 });
      els.forEach(function (e) { io.observe(e); });
    }
    setTimeout(reveal, 80);
  })();

  function mount() { if (!D.body) return setTimeout(mount, 30); D.body.appendChild(root); D.documentElement.classList.add('afl-on'); D.documentElement.style.overflow = 'hidden'; D.documentElement.style.overflowX = 'hidden'; D.body.style.overflowX = 'hidden'; }
  mount();
  function renderDoc() { var d = root.querySelector('#afdoc'); if (d) d.innerHTML = docHtml(); }
  renderDoc();
  root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-s],[data-r]'); if (!b) return; if (b.hasAttribute('data-s')) dst = b.getAttribute('data-s'); else drl = b.getAttribute('data-r'); renderDoc(); });
  function close() { var s = D.getElementById('afs'); if (s) s.remove(); root.remove(); D.documentElement.classList.remove('afl-on'); D.documentElement.style.overflow = ''; }
  function skip() { try { LS && LS.setItem('af_land_skip', '1'); } catch (e) { } close(); }

  /* أحدث ملف APK: من نفس الاستضافة إن كان مرفوعاً، وإلا من المستودع */
  (function () {
    function setVer(v) { apk.ver = v || ''; var e3 = D.getElementById('afbv'); if (e3 && v) e3.textContent = 'الإصدار ' + v; var e2 = D.getElementById('afv2'); if (e2 && v) e2.textContent = 'الإصدار ' + v; var el = D.getElementById('afv'); if (el) el.textContent = apk.ver ? 'أحدث نسخة ' + apk.ver + ' — تنزيل مباشر' : 'تنزيل مباشر'; }
    function remote() {
      try {
        fetch('https://api.github.com/repos/' + REPO + '/contents/' + DIR + '?ref=' + encodeURIComponent(BR)).then(function (r) { return r.json(); }).then(function (l) {
          var f = (l || []).filter(function (x) { return /\.apk$/i.test(x.name); }).sort(function (a, b) { return b.name.localeCompare(a.name, undefined, { numeric: true }); })[0];
          if (f) { apk.url = f.download_url || apk.url; var m = /v([\d.]+)\.apk/.exec(f.name); setVer(m ? m[1] : ''); }
        }).catch(function () { });
      } catch (e) { }
    }
    try {
      fetch(BASE + 'alfarabi.apk', { method: 'HEAD', cache: 'no-store' }).then(function (r) {
        var ct = r.headers.get('content-type') || '', len = +(r.headers.get('content-length') || 0);
        if (r.ok && !/text\/html/i.test(ct) && len > 1000000) {
          apk.url = BASE + 'alfarabi.apk';
          fetch(BASE + 'apk-version.txt', { cache: 'no-store' }).then(function (x) { return x.ok ? x.text() : ''; }).then(function (t) { setVer(String(t).trim().slice(0, 10)); }).catch(function () { });
        } else remote();
      }).catch(remote);
    } catch (e) { remote(); }
  })();

  function sheet(html) {
    var o = D.getElementById('afs'); if (o) o.remove();
    o = D.createElement('div'); o.id = 'afs'; o.innerHTML = '<div class="sh"><div class="gr"></div>' + html + '<button class="cl" data-a="sc">رجوع</button></div>';
    o.addEventListener('click', function (e) { var t = e.target; if (t === o) { o.remove(); return; } var b = t.closest && t.closest('[data-a]'); if (!b) return; act(b.getAttribute('data-a')); });
    D.body.appendChild(o);
  }

  /* ===== تثبيت كتطبيق للمصممين (أندرويد فقط): بكلمة سر، نفس النسخة الأصلية، ولا يستلم تحديثات الموقع الجماعية ===== */
  var DHASH = '0d3f4081f6970a42d19d75caa6ce60ca8632ec2322817eef56ee686e3d978b6e';
  function designerSheet() {
    sheet('<h2>تثبيت كتطبيق للمصممين</h2><p class="sb">للمصمم والمسؤول فقط. اكتب كلمة السر ثم يثبّت التطبيق على جهاز الأندرويد مثل التطبيقات من جوجل.</p>' +
      '<input id="afdpw" type="password" autocomplete="off" placeholder="كلمة السر" style="width:100%;border:2px solid #e1e8f4;border-radius:14px;padding:13px;font:inherit;margin:0 0 10px;background:#f6f9fd;direction:ltr;text-align:center">' +
      '<div id="afdm" style="color:#d9283d;font-weight:700;font-size:13px;min-height:20px;text-align:center"></div>' +
      '<button class="bt p" data-a="dgo"><span class="t"><b>تثبيت</b></span></button>');
    var i = D.getElementById('afdpw'); if (i) { i.focus(); i.addEventListener('keydown', function (e) { if (e.key === 'Enter') designerGo(); }); }
  }
  function designerGo() {
    var i = D.getElementById('afdpw'), m = D.getElementById('afdm'); if (!i || !m) return;
    if (!W.crypto || !crypto.subtle) { m.textContent = 'افتح الموقع عبر رابط HTTPS'; return; }
    m.textContent = 'جاري التحقق...';
    crypto.subtle.digest('SHA-256', new TextEncoder().encode('alfarabi-designer:' + i.value.trim())).then(function (h) {
      var hex = Array.prototype.map.call(new Uint8Array(h), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      if (hex !== DHASH) { m.textContent = 'كلمة السر غير صحيحة'; return; }
      try { localStorage.setItem('af_designer', '1'); } catch (e) { }   /* هذي النسخة لا تستلم تحديثات الموقع الجماعية (zip المطوّر) */
      if (dip) { dip.prompt(); dip.userChoice.then(function (c) { dip = null; if (c && c.outcome === 'accepted') close(); }); m.style.color = '#0b7a3b'; m.textContent = 'اضغط «تثبيت» بالنافذة اللي ظهرت'; }
      else {
        /* الموقع على http (غير آمن) فكروم يمنع تثبيت PWA: نكمل تلقائياً بتنزيل التطبيق (APK) مباشرة بعد التحقق */
        m.style.color = '#0b7a3b'; m.innerHTML = 'تم التحقق ✓ جاري تنزيل التطبيق...<br>بعد ما ينتهي افتح الملف واسمح بالتثبيت.';
        setTimeout(function () { act('apk'); }, 400);
      }
    });
  }
  function refreshPwa() { var c = D.getElementById('afpwa'); if (c && dip && !isIOS) c.style.display = '';  var s = D.getElementById('afpw'); if (s) s.querySelector('small').textContent = dip ? 'تثبيت مباشر بضغطة وحدة' : 'من قائمة المتصفح ⋮ ← تثبيت التطبيق'; }

  function andSheet() {
    sheet('<h2>تثبيت كتطبيق Android</h2><p class="sb">اختر الطريقة المناسبة</p>' +
      '<button class="bt p" data-a="apk">' + I.apk + '<span class="t">تثبيت كتطبيق APK<small id="afv">' + (apk.ver ? 'أحدث نسخة ' + esc(apk.ver) + ' — تنزيل مباشر' : 'تنزيل أحدث نسخة مباشرة') + '</small></span></button>');
  }
  function iosSheet() {
    var head = '<h2>تثبيت كتطبيق Apple</h2>';
    if (!isIOS) { sheet(head + '<p class="sb">هذا الخيار لأجهزة iPhone و iPad</p><div class="wn">افتح هذا الرابط من جهاز آبل داخل <b>سفاري</b> حتى يظهر لك التثبيت.</div><button class="bt" data-a="copy">' + I.cp + '<span class="t">نسخ رابط الموقع</span></button>'); return; }
    if (!isSafari) { sheet(head + '<div class="wn">أنت داخل متصفح غير سفاري، وآبل تسمح بالتثبيت من <b>سفاري</b> فقط. افتح سفاري ثم حمّل التطبيق.</div><ol><li>اضغط «نسخ الرابط» بالأسفل</li><li>افتح تطبيق <b>Safari</b></li><li>الصق الرابط وافتحه ثم اضغط «تثبيت»</li></ol><button class="bt p" data-a="copy">' + I.cp + '<span class="t">نسخ الرابط</span></button>'); return; }
    sheet(head + '<p class="sb">ضغطة وحدة ويصير التطبيق على شاشتك</p><div class="ic"><img src="' + ico + '" alt=""><div><b>الفارابي</b><span>ثانوية الفارابي الأهلية للبنين</span></div></div>' +
      '<button class="bt p" data-a="share">' + I.shr + '<span class="t">تثبيت<small>سيظهر لك خيار «إضافة إلى الشاشة الرئيسية»</small></span></button>' +
      '<ol><li>اضغط زر المشاركة ' + I.shr + ' بأسفل سفاري</li><li>اختر «إضافة إلى الشاشة الرئيسية»</li><li>اضغط «إضافة» وافتح التطبيق من الشاشة</li></ol>');
    var ar = D.createElement('div'); ar.className = 'ar'; ar.textContent = '⬇'; ar.id = 'afar'; D.body.appendChild(ar);
  }

  /* ===== صيانة التحديثات (للمشرف) ===== */
  var MH = '82ac7a14b0a40085157b0176c8620d9396be1e0426566072b3b482d8c42c629f', MS = 'alfarabi-maint-v1';
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function chk(email, pw) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(email.trim().toLowerCase() + ':' + pw), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(MS), iterations: 150000 }, k, 256);
    }).then(function (b) { return hex(b) === MH; });
  }
  function fb(path) { var b = W.FBBASE; if (!b) return Promise.reject(new Error('no base')); return fetch(b + path).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function maintLogin() {
    sheet('<h2>صيانة التحديثات</h2><p class="sb">أدخل بريد المشرف وكلمة السر</p>' +
      '<input id="afme" type="email" dir="ltr" autocomplete="off" placeholder="البريد الإلكتروني" style="width:100%;border:2px solid #e1e8f4;border-radius:14px;padding:12px;font:inherit;margin:0 0 10px;background:#f6f9fd">' +
      '<input id="afmp" type="password" dir="ltr" autocomplete="off" placeholder="كلمة السر" style="width:100%;border:2px solid #e1e8f4;border-radius:14px;padding:12px;font:inherit;margin:0 0 10px;background:#f6f9fd">' +
      '<div id="afmm" style="color:#d9283d;font-weight:700;font-size:13px;min-height:20px;text-align:center"></div>' +
      '<button class="bt p" data-a="mgo"><span class="t">دخول</span></button>');
  }
  function maintGo() {
    var e = D.getElementById('afme').value, p = D.getElementById('afmp').value, m = D.getElementById('afmm');
    m.textContent = 'جاري التحقق...';
    chk(e, p).then(function (ok) { if (!ok) { m.textContent = 'البريد أو كلمة السر غير صحيحة'; return; } maintPanel(); }).catch(function () { m.textContent = 'تعذّر التحقق، افتح الموقع عبر رابط HTTPS'; });
  }
  function cnt(o) { return o && typeof o === 'object' ? Object.keys(o).length : 0; }
  function fmt(sec) { sec = +sec || 0; var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return (h ? h + ' س ' : '') + m + ' د'; }
  function maintPanel() {
    sheet('<h2>صيانة التحديثات</h2><p class="sb">لوحة المشرف</p><div id="afmb"><div class="wn">جاري تحميل الإحصائيات...</div></div>');
    var box = D.getElementById('afmb');
    Promise.all([fb('/stats/visitors.json').catch(function () { return null; }), fb('/stats/installs.json').catch(function () { return null; }), fb('/usage.json').catch(function () { return null; }), fb('/usagesrc.json').catch(function () { return null; }), fb('/updates.json').catch(function () { return null; }), fb('/handouts.json?shallow=true').catch(function () { return null; }), fb('/plans.json?shallow=true').catch(function () { return null; })]).then(function (r) {
      var vis = r[0] || {}, ins = r[1] || {}, use = r[2] || {}, src = r[3] || {}, upd = r[4] || {};
      var tot = Object.keys(use).map(function (k) { var d = use[k] || {}, t = 0; Object.keys(d).forEach(function (x) { t += +d[x] || 0; }); return { k: k, t: t, s: src[k] || 'app' }; }).sort(function (a, b) { return b.t - a.t; }).slice(0, 10);
      var ul = Object.keys(upd).map(function (k) { return upd[k]; }).filter(Boolean).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 8);
      function card(n, l) { return '<div style="flex:1;background:linear-gradient(135deg,#eaf6ff,#fff6dc);border:1.5px solid #e1e8f4;border-radius:16px;padding:12px 6px;text-align:center"><b style="font-size:24px;display:block">' + n + '</b><small style="color:#5a6b8c;font-weight:700">' + l + '</small></div>'; }
      var h = '<div style="display:flex;gap:10px;margin:0 0 10px">' + card(cnt(ins), 'ثبّتوا التطبيق من المتصفح') + card(cnt(vis), 'زوّار الموقع') + '</div>' +
        '<div style="display:flex;gap:10px;margin:0 0 12px">' + card(cnt(r[5]), 'ملازم منشورة') + card(cnt(r[6]), 'تحاضير منشورة') + '</div>' +
        '<h3 style="margin:8px 0;font-size:15px">الأكثر استخداماً</h3>';
      h += tot.length ? '<ol class="st" id="aftop">' + tot.map(function (x) { return '<li><span id="n_' + esc(x.k) + '">' + esc(x.k.replace(/^a/, '')) + ' — ' + (x.s === 'web' ? 'الموقع' : 'التطبيق') + ' — <b>' + fmt(x.t) + '</b></span></li>'; }).join('') + '</ol>' : '<div class="wn">ما توجد بيانات استخدام بعد.</div>';
      h += '<h3 style="margin:12px 0 8px;font-size:15px">آخر التحديثات</h3>' + (ul.length ? '<ol class="st">' + ul.map(function (x) { return '<li><span><b>' + esc(x.v || '') + '</b> ' + esc(x.note || '') + ' <small>' + new Date(x.ts || 0).toLocaleDateString('ar-IQ') + '</small></span></li>'; }).join('') + '</ol>' : '<div class="wn">لا توجد تحديثات منشورة بعد.</div>');
      h += '<button class="bt" disabled style="opacity:.55;cursor:default"><span class="t">رفع ملفات التحديث (ZIP)<small>غير مفعّل بعد — يحتاج توقيعاً أمنياً</small></span></button>';
      box.innerHTML = h;
      tot.forEach(function (x) { fb('/accounts/' + x.k + '/name.json').then(function (n) { var e = D.getElementById('n_' + x.k); if (e && n) e.innerHTML = e.innerHTML.replace(esc(x.k.replace(/^a/, '')), esc(String(n))); }).catch(function () { }); });
    });
  }
  function copy() {
    var u = location.href.split('#')[0];
    function ok() { var b = D.querySelector('#afs [data-a="copy"] .t'); if (b) b.textContent = 'تم نسخ الرابط ✓'; }
    try { navigator.clipboard.writeText(u).then(ok, function () { prompt('انسخ الرابط', u); }); } catch (e) { prompt('انسخ الرابط', u); }
  }

  /* فحص سبب عدم ظهور التثبيت المباشر وعرضه بوضوح */
  function diag() {
    if (!W.isSecureContext) return Promise.resolve('الموقع لازم يُفتح عبر رابط HTTPS حتى يشتغل التثبيت.');
    var l = D.querySelector('link[rel="manifest"]'), mu = l ? l.href : BASE + 'manifest.json';
    return fetch(mu, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) return 'ملف manifest.json غير موجود أو محجوب على الاستضافة (الحالة ' + r.status + '). ارفعه مع باقي الملفات.';
      return r.text().then(function (t) {
        var m; try { m = JSON.parse(t); } catch (e) { return 'الاستضافة ترجع صفحة بدل ملف manifest.json. تأكد أنه مرفوع بنفس مكان index.html.'; }
        var ic = (m.icons || []).filter(function (i) { return /png/.test(i.type || ''); })[0];
        if (!ic) return 'ملف manifest.json ما فيه أيقونات PNG.';
        return fetch(new URL(ic.src, mu).href, { cache: 'no-store' }).then(function (ri) {
          if (!ri.ok || !/image/.test(ri.headers.get('content-type') || '')) return 'ملفات الأيقونات (icon-192.png و icon-512.png) غير مرفوعة أو محجوبة.';
          if (!navigator.serviceWorker) return 'هذا المتصفح لا يدعم التثبيت.';
          return navigator.serviceWorker.register(BASE + 'sw.js').then(function (reg) { return navigator.serviceWorker.ready.then(function () { return ''; }); }, function (e) { return 'ملف sw.js غير مرفوع أو محجوب على الاستضافة (' + (e && e.message ? e.message.slice(0, 60) : 'خطأ') + ').'; });
        });
      });
    }).catch(function () { return 'تعذّر فحص ملفات التثبيت، تأكد من الاتصال.'; });
  }
  function toast(t) { var o = D.getElementById('aftoast'); if (o) o.remove(); o = D.createElement('div'); o.id = 'aftoast'; o.textContent = t; o.style.cssText = 'position:fixed;left:16px;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:2147483647;background:#14213d;color:#fff;border-radius:16px;padding:13px 16px;text-align:center;font:700 14px/1.7 Cairo,sans-serif;direction:rtl;box-shadow:0 8px 24px rgba(0,0,0,.3)'; D.body.appendChild(o); setTimeout(function () { o.remove(); }, 4500); }
  function act(a) {
    var ar = D.getElementById('afar'); if (ar && a !== 'share') ar.remove();
    if (a === 'and') return andSheet();
    if (a === 'ios') return iosSheet();
    if (a === 'designer') return designerSheet();
    if (a === 'dgo') return designerGo();
    if (a === 'sc') { var s = D.getElementById('afs'); if (s) s.remove(); if (ar) ar.remove(); return; }
    if (a === 'apk') {
      try { var tk = localStorage.getItem('af_web_tok') || 'x'; if (W.FBBASE) fetch(W.FBBASE + '/stats/apkdl/' + tk + '.json', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ last: Date.now() }) }).catch(function () { }); } catch (e) { }
      function ver(v) { return String(v || '0').split('.').map(function (x) { return +x || 0; }); }
      function newer(a1, b1) { a1 = ver(a1); b1 = ver(b1); for (var i = 0; i < 4; i++) { if ((a1[i] || 0) !== (b1[i] || 0)) return (a1[i] || 0) > (b1[i] || 0); } return false; }
      if (rtApk && W.afSite && newer(rtApk.ver, apk.ver)) {
        toast('جاري تجهيز التطبيق...');
        W.afSite.apkDownload(rtApk).then(function () { toast('بدأ التنزيل. افتح الملف بعد ما ينتهي واسمح بالتثبيت.'); }).catch(function () { var l0 = D.createElement('a'); l0.href = apk.url; D.body.appendChild(l0); l0.click(); l0.remove(); });
        return;
      }
      if (!D.querySelector('#afs .sh')) toast('بدأ تنزيل التطبيق. افتح الملف بعد ما ينتهي واسمح بالتثبيت.'); var l = D.createElement('a'); l.href = apk.url; l.rel = 'noopener'; D.body.appendChild(l); l.click(); l.remove(); var t = D.querySelector('#afs .sh'); if (t) { var n = D.createElement('div'); n.className = 'wn'; n.innerHTML = 'بدأ التنزيل. بعد ما ينتهي افتح الملف واسمح بالتثبيت من هذا المصدر عند ظهور الطلب، وبعدها افتح «الفارابي».'; t.insertBefore(n, t.querySelector('.cl')); } return;
    }
    if (a === 'pwa') {
      if (dip) { dip.prompt(); dip.userChoice.then(function (c) { dip = null; if (c && c.outcome === 'accepted') close(); }); return; }
      if (isIOS) { toast('على آيفون افتح الموقع من سفاري واضغط تثبيت Apple.'); return; }
      act('apk'); return;
    }
    if (a === 'share') { var u = location.href.split('#')[0]; if (navigator.share) navigator.share({ title: 'الفارابي', url: u }).catch(function () { }); return; }
    if (a === 'dev') { if (W.afDev) W.afDev(); else toast('حساب المطوّر غير متاح الآن'); return; }
    if (a === 'mnt') return maintLogin();
    if (a === 'mgo') return maintGo();
    if (a === 'ph') {
      sheet('<h2>اتصال بالمشرف</h2><p class="sb" dir="ltr">+964 780 018 8441</p>' +
        '<a class="bt p" href="tel:+9647800188441" style="text-decoration:none">' + I.ph.replace('#fff', 'currentColor') + '<span class="t">اتصال هاتفي<small>اتصل بالمشرف مباشرة</small></span></a>' +
        '<a class="bt" href="https://wa.me/9647800188441" target="_blank" rel="noopener" style="text-decoration:none">' + I.wa + '<span class="t">واتساب<small>أرسل رسالة للمشرف</small></span></a>');
      return;
    }
    if (a === 'copy') return copy();
  }
  (function () { var sx = 0, sy = 0;
    root.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    root.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (Math.abs(t.clientX - sx) > Math.abs(t.clientY - sy) && e.cancelable) e.preventDefault(); }, { passive: false });
    root.addEventListener('scroll', function () { if (root.scrollLeft) root.scrollLeft = 0; }, { passive: true });
  })();
  root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-a]'); if (b) act(b.getAttribute('data-a')); });
})();
