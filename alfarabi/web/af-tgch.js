/* af-tgch.js — قناة المدرس بتصميم شبيه بتيليجرام:
   وسائط (صور/فيديو) وملفات بحسب صيغتها، رفع بأجزاء مع نسبة التقدم، تحميل ومشاركة وفتح داخل التطبيق،
   فحص أمان الروابط، تفاعلات إيموجي مع تأثيرات، تعليقات وردود المدرس، ملف تعريف القناة (يظهر عند الضغط على الرأس)،
   تعديل القناة (اسم/وصف/صورة/لون/روابط/حسابات)، المشتركون والتفاعل مع بحث.
   يُحقن داخل واجهة المستخدم (userMain) بعد af-channels.js */
(function () {
  'use strict';

  /* ألوان القنوات = ألوان المحادثات (داكنة): الخلفية #0a0908، الكبسولة #262e3f، الفقاعة #11181d، زر الإرسال #e2705b */
  var CSS = '<style id="af-tgch-css">'
    + '.cx.tg,.tg-cmw{--bg:#0a0908;--pill:#262e3f;--bub:#11181d;--bub2:#1a232b;--tx:#e9edef;--mut:#8d98a5;--ac:#8fa2ff;--lnk:#7fb0ff;--btn:#e2705b;--line:#222c34;--chip:#1c2630;--me:#7b3f29;--ok:#6fcf8f;--bad:#ff7b7b}'
    + '.cx.tg{background:var(--bg);font-family:inherit;color:var(--tx)}'
    + '.tgi{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none;vertical-align:middle}'
    + '.tg .tg-top,.tg-cmw .tg-top{display:flex;align-items:center;gap:10px;direction:ltr;padding:calc(10px + var(--sa-top,env(safe-area-inset-top,0px))) 12px 10px;background:var(--bg);border-bottom:1px solid var(--line);z-index:3}'
    + '.tg .tg-rb,.tg-cmw .tg-rb{width:44px;height:44px;border-radius:50%;border:0;background:transparent;color:var(--tx);display:grid;place-items:center;cursor:pointer;flex:none}'
    + '.tg .tg-rb:active{background:var(--chip)}.tg .tg-rb .tgi,.tg-cmw .tg-rb .tgi{width:24px;height:24px}.tg-cmw .tg-rb.ghost{visibility:hidden}'
    + '.tg .tg-pill,.tg-cmw .tg-pill{flex:1;min-width:0;direction:rtl;display:flex;align-items:center;gap:11px;background:var(--pill);border-radius:28px;padding:5px 6px 5px 16px;cursor:pointer;height:54px}'
    + '.tg .tg-pill #tgav,.tg-cmw .tg-pill>span{flex:none;display:block;line-height:0}.tg .tg-pill #tgav .av,.tg .tg-pill #tgav img,.tg-cmw .tg-pill img,.tg-cmw .tg-pill .av{width:44px!important;height:44px!important;border-radius:50%!important;object-fit:cover}'
    + '.tg .tg-pill .cx-t,.tg-cmw .tg-pill .cx-t{flex:1;min-width:0}.tg .tg-pill b,.tg-cmw .tg-pill b{display:block;font-size:16.5px;font-weight:800;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tg .tg-pill small,.tg-cmw .tg-pill small{display:block;color:var(--mut);font-size:13px;font-weight:600}'
    + '.tg .tg-pill input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:16px;color:var(--tx);outline:0;font-weight:600}.tg .tg-x{border:0;background:transparent;color:var(--mut);display:grid;place-items:center;cursor:pointer;padding:4px}'
    + '.tg .tg-pin{margin:0;background:var(--bg);border-bottom:1px solid var(--line);padding:9px 14px;display:flex;align-items:center;gap:11px;cursor:pointer;z-index:2}'
    + '.tg .tg-pin .bar{width:3px;height:34px;border-radius:3px;background:var(--ac);flex:none}.tg .tg-pin>div{flex:1;min-width:0}.tg .tg-pin b{display:block;color:var(--ac);font-size:14px;font-weight:800}.tg .tg-pin small{display:block;color:var(--tx);font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tg .tg-pin .pi{color:var(--mut);flex:none}'
    + '.tg .tg-m{flex:1;overflow-y:auto;padding:12px 10px 8px;display:flex;flex-direction:column;gap:9px;-webkit-overflow-scrolling:touch;background-color:var(--bg)}'
    + '.tg .tg-dy{align-self:center;background:#161c20;color:var(--tx);font-size:13px;font-weight:700;padding:5px 16px;border-radius:12px;margin:3px 0}'
    + '.tg .tg-p{position:relative;background:var(--bub);color:var(--tx);border-radius:16px 16px 16px 5px;padding:10px 12px 8px;align-self:stretch;max-width:94%;animation:tgIn .3s cubic-bezier(.22,1,.36,1) both;overflow-wrap:anywhere}'
    + '@keyframes tgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
    + '.tg .tg-cn{font-size:15.5px;font-weight:800;color:var(--ac);margin:0 0 5px;display:flex;align-items:center;gap:6px}.tg .tg-pn{color:var(--mut);display:inline-flex}'
    + '.tg .tg-t{font-size:16.5px;line-height:1.85;white-space:pre-wrap;color:var(--tx);padding:1px 0 5px;font-weight:500}.tg .tg-t a{color:var(--lnk);font-weight:700;text-decoration:none}'
    + '.tg .tg-im{display:block;width:100%;max-height:360px;object-fit:cover;border-radius:12px;margin-bottom:6px;cursor:pointer;background:#1a232b}'
    + '.tg .tg-vd{position:relative;border-radius:12px;overflow:hidden;margin-bottom:6px;background:#000;min-height:170px;display:grid;place-items:center;cursor:pointer}.tg .tg-vd img,.tg .tg-vd video{width:100%;max-height:360px;object-fit:cover;display:block}'
    + '.tg .tg-pl{position:absolute;inset:0;display:grid;place-items:center}.tg .tg-pl i{width:60px;height:60px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center;color:#fff;font-style:normal;padding-inline-start:3px}.tg .tg-pl i .tgi{width:26px;height:26px;stroke:#fff;fill:#fff}'
    + '.tg .tg-bd{direction:ltr;position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.6);color:#fff;border-radius:999px;font-size:12px;padding:2px 10px;font-weight:700}'
    + '.tg .tg-fl{display:flex;align-items:center;gap:12px;background:var(--bub2);border-radius:14px;padding:10px;margin-bottom:6px;border-right:3px solid var(--ac)}'
    + '.tg .tg-fi{width:54px;height:54px;border-radius:50%;color:#fff;display:grid;place-items:center;flex:none;cursor:pointer}.tg .tg-fi .tgi{width:26px;height:26px;stroke:#fff}'
    + '.tg .tg-fn{flex:1;min-width:0;cursor:pointer}.tg .tg-fn b{display:block;font-size:15px;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:right}.tg .tg-fn small{color:var(--mut);font-size:13px;font-weight:600;direction:ltr;display:block;text-align:right}'
    + '.tg .tg-fa{display:flex;gap:6px}.tg .tg-fa button,.tg .tg-ib{border:0;background:#26323c;color:var(--tx);width:38px;height:38px;border-radius:50%;display:grid;place-items:center;cursor:pointer}'
    + '.tg .tg-lk{display:flex;align-items:center;gap:11px;background:var(--bub2);border-radius:14px;padding:10px 12px;margin:6px 0;cursor:pointer;border-right:3px solid var(--lnk)}.tg .tg-lk.tgbad{border-right-color:var(--bad)}'
    + '.tg .tg-li{color:var(--lnk);display:inline-flex;flex:none}.tg .tg-lk.tgbad .tg-li{color:var(--bad)}'
    + '.tg .tg-lk b{display:block;font-size:14.5px;font-weight:700;color:var(--tx);direction:ltr;text-align:right}.tg .tg-lk small{display:block;color:var(--mut);font-size:12px;direction:ltr;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}'
    + '.tg .tg-lk .tgb{margin-inline-start:auto;font-size:11.5px;font-weight:800;border-radius:999px;padding:3px 11px;background:#17382a;color:var(--ok);flex:none}.tg .tg-lk.tgbad .tgb{background:#43201f;color:var(--bad)}'
    + '.tg .tg-ft{display:flex;align-items:center;flex-direction:row-reverse;gap:2px;padding:3px 0 0;flex-wrap:wrap}'
    + '.tg .tg-sm{border:0;background:transparent;color:var(--mut);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none}.tg .tg-sm:active{background:var(--chip)}'
    + '.tg .tg-mt{margin-inline-start:auto;display:flex;align-items:center;gap:6px;color:var(--mut);font-size:13px;font-weight:600;direction:rtl}.tg .tg-mt i{font-style:normal;opacity:.6}.tg .tg-mt .tgi{width:16px;height:16px}'
    + '.tg .tg-cmr{display:flex;align-items:center;gap:10px;border-top:1px solid var(--line);margin:7px -12px 0;padding:10px 12px 1px;color:var(--ac);cursor:pointer}.tg .tg-cmr b{flex:1;font-size:15.5px;font-weight:700}.tg .tg-cmr .chv{color:var(--mut);display:inline-flex}'
    + '.tg .tg-rxs{display:flex;flex-wrap:wrap;gap:7px;margin:6px 0 2px}'
    + '.tg .tg-rx{border:1.5px solid transparent;background:var(--chip);border-radius:999px;padding:4px 12px;font:inherit;font-size:14px;font-weight:800;color:var(--tx);display:flex;align-items:center;gap:6px;cursor:pointer;transition:transform .12s}.tg .tg-rx .e{font-size:17px}.tg .tg-rx.on{background:#2b3a66;border-color:var(--ac)}.tg .tg-rx:active{transform:scale(.9)}.tg .tg-rx.pop{animation:tgPop .35s}'
    + '@keyframes tgPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}'
    + '.tg .cx-q{background:var(--bub2);border-radius:12px;padding:9px;margin:2px 0 6px}.tg .cx-q b{color:var(--tx);font-size:15.5px}.tg .cx-o{border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;margin-top:6px;display:flex;justify-content:space-between;color:var(--tx);font-weight:600;cursor:pointer}'
    + '.tg .tg-bar{background:var(--bg);padding:8px 10px calc(8px + var(--sa-bottom,env(safe-area-inset-bottom,0px)));border-top:1px solid var(--line)}'
    + '.tg .tg-bt{display:flex;align-items:center;gap:10px;direction:ltr}.tg .tg-mp{flex:1;direction:rtl;height:52px;border:0;border-radius:28px;background:#151515;border:1px solid #2a2a2a;color:var(--tx);font:inherit;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer}.tg .tg-mp .tgi{color:var(--mut)}.tg .tg-mp.pri{background:var(--btn);border-color:var(--btn);color:#fff}'
    + '.tg .tg-cp,.tg-cmw .tg-cp{display:flex;align-items:flex-end;gap:8px}.tg .tg-cp textarea,.tg-cmw .tg-cp textarea{flex:1;border:1px solid #2a2a2a;background:#151515;border-radius:24px;padding:12px 16px;font:inherit;font-size:16px;max-height:120px;resize:none;outline:0;color:var(--tx);line-height:1.5}.tg .tg-cp textarea::placeholder,.tg-cmw .tg-cp textarea::placeholder{color:#8d93a1}'
    + '.tg .tg-sb,.tg-cmw .tg-sb{width:48px;height:48px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;flex:none;background:var(--btn)}.tg .tg-sb svg,.tg-cmw .tg-sb svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    + '.tg .tg-ab{width:46px;height:46px;border-radius:50%;border:0;background:transparent;color:#aeb4bf;display:grid;place-items:center;cursor:pointer;flex:none;transition:transform .2s}.tg .tg-ab.on{transform:rotate(45deg);color:var(--btn)}.tg .tg-ab svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    + '.tg .tg-tray{display:none;grid-template-columns:repeat(5,1fr);gap:6px;padding:2px 2px 10px;animation:tgUp .25s both}.tg .tg-tray.on{display:grid}'
    + '.tg .tg-tray button{border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:700;color:var(--tx);display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer}.tg .tg-tray i{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:var(--chip);color:var(--ac)}.tg .tg-tray svg{width:24px;height:24px;fill:none;stroke:var(--ac);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
    + '.tg-pk{position:fixed;z-index:200;background:#232d36;border-radius:999px;padding:7px 9px;display:flex;gap:2px;box-shadow:0 12px 32px rgba(0,0,0,.55)}.tg-pk button{border:0;background:transparent;font-size:27px;width:40px;height:40px;cursor:pointer;animation:tgPk .28s both;border-radius:50%}.tg-pk button:active{transform:scale(1.4)}'
    + '@keyframes tgPk{from{opacity:0;transform:translateY(14px) scale(.4)}to{opacity:1;transform:none}}'
    + '.tg-bst{position:fixed;z-index:210;font-size:28px;pointer-events:none;animation:tgBst 1s ease-out forwards}@keyframes tgBst{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),-170px) scale(1.5) rotate(var(--rt))}}'
    + '.tg-ov{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;animation:tgFd .2s both}'
    + '.tg-sh{background:#171c22;border-radius:26px 26px 0 0;width:100%;max-height:84%;display:flex;flex-direction:column;animation:tgUp .3s cubic-bezier(.22,1,.36,1) both;direction:rtl;color:#e9edef;font-family:inherit}@keyframes tgFd{from{opacity:0}to{opacity:1}}@keyframes tgUp{from{transform:translateY(100%)}to{transform:none}}'
    + '.tg-sh h4{margin:0;padding:16px 18px 8px;font-size:17px;font-weight:800;color:#e9edef;display:flex;align-items:center;justify-content:space-between}.tg-sh h4 button{border:0;background:#232d36;width:34px;height:34px;border-radius:50%;cursor:pointer;color:#e9edef;display:grid;place-items:center}.tg-sh h4 button .tgi{width:18px;height:18px}'
    + '.tg-sh .tgbd{overflow-y:auto;padding:4px 16px 18px;flex:1}'
    + '.tg-sh .tgrw{display:flex;align-items:center;gap:13px;width:100%;border:0;background:#1f272e;border-radius:14px;padding:14px 15px;margin-bottom:8px;font:inherit;font-size:15.5px;font-weight:600;color:#e9edef;cursor:pointer;text-align:right}.tg-sh .tgrw .tgi{color:#8fa2ff}'
    + '.tg-sh .tgrw.red{color:#ff8a8a}.tg-sh .tgrw.red .tgi,.tg-sh .tgrw.warn .tgi{color:#ff8a8a}.tg-sh .tgrw.pri{background:var(--btn);color:#fff}.tg-sh .tgrw.pri .tgi{color:#fff}.tg-sh .tgrw.warn{background:#3a1f1f;color:#ff8a8a}'
    + '.tg-sh input,.tg-sh textarea,.tg-sh select{width:100%;border:1px solid #2c3640;background:#11161b;border-radius:14px;padding:12px 14px;font:inherit;font-size:15.5px;color:#e9edef;margin-bottom:9px;outline:0}.tg-sh input::placeholder,.tg-sh textarea::placeholder{color:#7b8794}'
    + '.tg-sh .bt2{border:0;border-radius:14px;padding:14px;width:100%;font:inherit;font-size:16px;font-weight:800;color:#fff;background:var(--btn);cursor:pointer}'
    + '.tg-sh .tghint{color:#9aa6b2;font-size:13.5px;line-height:1.8;margin:2px 2px 9px;font-weight:500}.tg-sh .tg-fl{background:#1f272e}.tg-sh .tg-fn b{color:#e9edef}.tg-sh .tg-fn small{color:#9aa6b2}'
    + '.tg-pgs{width:100%;height:8px;border-radius:6px;background:#232d36;overflow:hidden;margin:9px 0}.tg-pgs i{display:block;height:100%;width:0;background:var(--btn);transition:width .2s}'
    + '.tg-info{position:absolute;inset:0;z-index:40;background:var(--bg);display:flex;flex-direction:column;animation:tgFd .2s both;overflow-y:auto;color:var(--tx)}'
    + '.tg-info .ban{background:var(--pill);border-radius:0 0 26px 26px}.tg-info .ih{padding:calc(10px + var(--sa-top,env(safe-area-inset-top,0px))) 12px 6px;display:flex;align-items:center;gap:10px;color:var(--tx)}.tg-info .ih .cx-b{background:transparent;color:var(--tx)}.tg-info .ih .cx-b .tgi,.tg-info .ih .cx-b svg{stroke:var(--tx)}.tg-info .ih b{flex:1;font-size:17px;font-weight:800}'
    + '.tg-info .ic{text-align:center;color:var(--tx);padding:0 16px 22px}.tg-info .ic .av,.tg-info .ic img{width:96px!important;height:96px!important;border-radius:50%!important;object-fit:cover}.tg-info .ic h3{margin:10px 0 2px;font-size:22px;font-weight:800}.tg-info .ic p{margin:2px 0;color:var(--mut);font-size:14px;font-weight:600}'
    + '.tg-info .cd{background:var(--bub);border-radius:16px;margin:10px;padding:13px 15px}.tg-info .cd h5{margin:0 0 7px;font-size:13px;color:var(--ac);font-weight:800}.tg-info .cd p{margin:0;font-size:15.5px;line-height:1.85;color:var(--tx);white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.tg-info .ln{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line);cursor:pointer;color:var(--tx);font-weight:600;font-size:15px}.tg-info .ln:first-of-type{border-top:0}.tg-info .ln .ci{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12.5px;font-weight:800;flex:none}.tg-info .ln .ci .tgi{stroke:#fff;width:20px;height:20px}'
    + '.tg-info .tb{display:flex;gap:6px;margin:10px 10px 0;background:var(--bub);border-radius:16px;padding:5px}.tg-info .tb button{flex:1;border:0;background:transparent;border-radius:12px;padding:10px 4px;font:inherit;font-weight:700;font-size:14px;color:var(--mut);cursor:pointer}.tg-info .tb button.on{background:var(--pill);color:var(--tx)}'
    + '.tg-gr{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:10px}.tg-gr div{aspect-ratio:1;background:#1a232b center/cover;border-radius:8px;position:relative;cursor:pointer;overflow:hidden}.tg-gr div span{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35)}.tg-gr div span .tgi{stroke:#fff;fill:#fff;width:24px;height:24px}'
    + '.tg-sub{display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)}.tg-sub:first-of-type{border-top:0}.tg-sub b{font-size:15px;font-weight:700;color:var(--tx)}.tg-sub small{display:block;color:var(--mut);font-size:12.5px;font-weight:600}.tg-sub .st{margin-inline-start:auto;display:flex;gap:10px;font-size:13px;font-weight:700;color:var(--mut)}.tg-sub .st .tgi{width:16px;height:16px}'
    + '.tg-sub .rk{width:28px;height:28px;border-radius:50%;background:var(--btn);color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px;flex:none}'
    + '.tg-info input#sq{width:100%;border:1px solid #2c3640;background:#11161b;border-radius:14px;padding:11px 14px;font:inherit;color:var(--tx);margin-bottom:8px;outline:0}'
    + '.tg-v{position:fixed;inset:0;z-index:99;background:#000;display:flex;flex-direction:column;direction:rtl;animation:tgFd .2s both}'
    + '.tg-v .tgvh{display:flex;align-items:center;gap:8px;padding:calc(8px + var(--sa-top,env(safe-area-inset-top,0px))) 10px 8px;color:#fff;background:#0b0b0b}.tg-v .tgvh b{flex:1;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:right}.tg-v .tgvh button{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:50%;width:40px;height:40px;cursor:pointer;display:grid;place-items:center}.tg-v .tgvh button .tgi{stroke:#fff;width:21px;height:21px}'
    + '.tg-v .tgvb{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;overflow:auto;position:relative}.tg-v .tgvb img,.tg-v .tgvb video{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transition:transform .2s}.tg-v .tgvb audio{width:90%}'
    + '.tg-v .tgvb canvas{display:block;width:100%;margin:0 0 8px;background:#fff;border-radius:8px}.tg-v .tgvb.pdf{display:block;align-items:initial;background:#14181d;padding:8px}.tg-v .tgvb pre{color:#e6edf7;white-space:pre-wrap;font:13px/1.7 monospace;padding:14px;direction:ltr;text-align:left;align-self:start}.tg-v .tgvl{color:#fff;text-align:center;padding:20px;font-weight:600}'
    + '.tg-land{position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:20px;direction:rtl;animation:tgFd .25s both;font-family:inherit}'
    + '.tg-land .lc{width:100%;max-width:360px;background:#171c22;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:tgPopIn .45s cubic-bezier(.2,1.3,.4,1) both;text-align:center;color:#e9edef}@keyframes tgPopIn{from{opacity:0;transform:scale(.8) translateY(30px)}to{opacity:1;transform:none}}'
    + '.tg-land .lb{background:#262e3f;padding:24px 16px 50px}.tg-land .lb small{display:block;color:#aeb8c6;font-weight:600;font-size:13px}.tg-land .la{margin:-40px auto 0;position:relative;width:84px}.tg-land .la .av,.tg-land .la img{border-radius:50%!important;border:4px solid #171c22}'
    + '.tg-land h2{margin:10px 16px 2px;font-size:22px;font-weight:800;color:#e9edef}.tg-land p{margin:2px 18px;color:#9aa6b2;font-size:14px;font-weight:600;line-height:1.7}.tg-land p b{color:#e9edef}'
    + '.tg-land .lbs{padding:14px 16px 18px;display:grid;gap:9px}.tg-land .lbs button{border:0;border-radius:16px;padding:14px;font:inherit;font-size:15.5px;font-weight:800;cursor:pointer;color:#fff;background:#e2705b}.tg-land .lbs button.g{background:#232d36;color:#e9edef}'
    + '.tg-cmw{position:absolute;inset:0;z-index:55;display:flex;flex-direction:column;background:var(--bg);animation:tgFd .2s both;color:var(--tx)}.tg-cmw .tg-m{flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:9px;background-color:var(--bg)}.tg-cmw .tg-bar{background:var(--bg);padding:8px 10px calc(8px + var(--sa-bottom,env(safe-area-inset-bottom,0px)));border-top:1px solid var(--line)}'
    + '.tg-cmw .tg-dy{align-self:center;background:#161c20;color:var(--tx);font-size:13px;font-weight:700;padding:5px 16px;border-radius:12px}'
    + '.tg-qp{display:flex;align-items:center;gap:10px;background:var(--bub);border-radius:14px;padding:9px 13px}.tg-qp .bar{width:3px;height:32px;border-radius:3px;background:var(--ac);flex:none}.tg-qp b{display:block;color:var(--ac);font-size:14px;font-weight:800}.tg-qp small{display:block;color:var(--tx);font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:270px}'
    + '.tg-cb{display:flex;align-items:flex-end;gap:8px;align-self:flex-end;max-width:88%}.tg-cb.me{align-self:flex-start}.tg-cb .bb{background:var(--bub);border-radius:14px 14px 14px 4px;padding:7px 12px 5px;min-width:96px}.tg-cb.me .bb{background:var(--me);border-radius:14px 14px 4px 14px}'
    + '.tg-cb .nm{display:block;font-size:14px;font-weight:800;color:var(--ok);margin-bottom:1px}.tg-cb .nm .tc{display:inline-block;background:#17382a;color:var(--ok);font-size:11px;border-radius:999px;padding:0 8px;margin-inline-start:6px;font-weight:700}.tg-cb p{color:var(--tx);margin:0;font-size:16px;line-height:1.65;font-weight:500;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.tg-cb .mt{display:flex;align-items:center;justify-content:flex-end;gap:2px;margin-top:3px;color:var(--mut);font-size:12px;font-weight:600}.tg-cb.me .mt{color:rgba(255,255,255,.75)}.tg-cb .mt span{margin-inline-end:6px}.tg-cb .mt button{border:0;background:transparent;color:inherit;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;cursor:pointer;padding:0}.tg-cb .mt button:active{background:rgba(255,255,255,.12)}.tg-cb .mt .tgi{width:16px;height:16px}'
    + '.tg-cb .rq{border-right:3px solid var(--ac);background:rgba(143,162,255,.12);border-radius:6px;padding:2px 8px;font-size:13px;font-weight:700;color:var(--ac);margin-bottom:3px}.tg-cb.me .rq{background:rgba(255,255,255,.14);color:#fff;border-color:#fff}'
    + '.tg-rq{display:flex;align-items:center;justify-content:space-between;background:#1c2630;border-radius:12px;padding:6px 12px;margin-bottom:7px;font-size:14px;color:var(--ac);font-weight:600}.tg-rq button{border:0;background:transparent;color:var(--ac);display:grid;place-items:center}'
    + '</style>';

  /* ===== الدالة التي تُحقن داخل userMain ===== */
  function TG(SITE) {
    try {
      var RX = ['👍', '❤️', '🔥', '😂', '😮', '😢', '🎉', '👏'];
      var COLS = window.__afChCols || [['#0aa6f5', '#1d4ed8']];
      /* أيقونات مخططة (outline) موحّدة بدل الإيموجي الملوّنة */
      var ICN = {
        back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', more: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', pin: '<path d="M12 17v5M9 3h6l-1 6 3 3H7l3-3z"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        img: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>', vid: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="M16 10l6-3v10l-6-3z"/>',
        fl: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>', q: '<path d="M4 21V9M10 21V3M16 21v-8M22 21H2"/>',
        lnk: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
        dl: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', share: '<path d="M20 12l-7-7v4C6 10 4 15 3 20c3-4 6-5 10-5v4z"/>', eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
        cm: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
        smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
        bellx: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0M2 2l20 20"/>', close: '<path d="M18 6L6 18M6 6l12 12"/>',
        chev: '<path d="M15 6l-6 6 6 6"/>', camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
        warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
        play: '<path d="M7 4l13 8-13 8z"/>', reply: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 6 6v3"/>', send: '<path d="M3 11l18-8-8 18-2-8z"/>', plus: '<path d="M12 5v14M5 12h14"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>', msg: '<path d="M4 5h16v11H9l-5 4z"/>', check: '<path d="M20 6L9 17l-5-5"/>'
      };
      function ic(k, z) { return '<svg class="tgi" viewBox="0 0 24 24"' + (z ? ' style="width:' + z + 'px;height:' + z + 'px"' : '') + '>' + (ICN[k] || '') + '</svg>'; }
      var SEND = ic('send'), PLUS = ic('plus');
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
        if (/^audio/.test(t) || ['mp3', 'm4a', 'wav', 'ogg', 'aac'].indexOf(e) > -1) return { k: 'aud', l: 'ملف صوتي', c: '#d6458f', x: 'AUDIO' };
        if (/^video/.test(t) || ['mp4', 'mov', 'mkv', 'webm', 'avi', '3gp'].indexOf(e) > -1) return { k: 'vid', l: 'فيديو', c: '#0aa6f5', x: 'VIDEO' };
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
        var g = gcol(c), grad = 'linear-gradient(135deg,#0aa6f5,#1d4ed8)';
        var searching = false, qs = '';
        root.innerHTML = '<div class="tg-top" id="tgh"><button class="tg-rb" id="tgb">' + ic('back') + '</button><div class="tg-pill" id="tgpl"><span id="tgav"></span><div class="cx-t"><b id="tgn"></b><small id="tgs"></small></div></div><button class="tg-rb" id="tgmn">' + ic('more') + '</button></div><div class="tg-pin" id="tgpin" style="display:none"></div><div class="tg-m" id="tgm"></div><div class="tg-bar" id="tgbar"></div>';
        function wall(el) {
          try {
            var bg = '', cm0 = document.getElementById('cl');
            if (cm0) { var cs0 = getComputedStyle(cm0); if (cs0.backgroundImage && cs0.backgroundImage !== 'none') bg = cs0.backgroundImage; }
            if (!bg) { for (var i = 0; i < document.styleSheets.length && !bg; i++) { var rl; try { rl = document.styleSheets[i].cssRules; } catch (e) { continue; } for (var j = 0; j < rl.length; j++) { var r = rl[j]; if (r.selectorText && /#ch\s+\.ch-m/.test(r.selectorText) && r.style && r.style.backgroundImage && /url\(/.test(r.style.backgroundImage)) { bg = r.style.backgroundImage; break; } } } }
            if (bg) { el.style.backgroundImage = bg; el.style.backgroundSize = '260px'; el.style.backgroundRepeat = 'repeat'; }
          } catch (e) {}
        }
        wall($('tgm'));
        function me() { c = chOne(id) || c; return mrole(c); }
        function memb() { return !!(c.m && c.m['u' + ok(uid)]) || me() > 0; }
        function canPost() { return me() > 0; }
        function head() {
          c = chOne(id); if (!c) { closeCh(); return; }
          if (searching) return;
          var hk = [c.cn, (c.img || '').length, c.col, Object.keys(c.m || {}).length, c.on].join('|'); if (hk === head.k) return; head.k = hk;
          g = gcol(c);
          $('tgav').innerHTML = av(null, 40, c.img); $('tgn').textContent = c.cn;
          $('tgs').textContent = Object.keys(c.m || {}).length + ' مشترك';
        }
        $('tgb').onclick = function (e) { e.stopPropagation(); closeCh(); };
        $('tgpl').onclick = function (e) { if (e.target.closest('input')) return; showInfo('m'); };
        $('tgmn').onclick = function (e) { e.stopPropagation(); channelMenu(); };
        function toggleSearch() {
          var pl = $('tgpl');
          if (!searching) { searching = true; pl.innerHTML = '<input id="tgqi" placeholder="بحث في القناة..." autocomplete="off"><button class="tg-x" id="tgqx">' + ic('close') + '</button>'; var qi = $('tgqi'); qi.focus(); qi.oninput = function () { qs = this.value.trim(); lastSig = ''; render(); }; $('tgqx').onclick = function (e) { e.stopPropagation(); toggleSearch(); }; }
          else { searching = false; qs = ''; pl.innerHTML = '<span id="tgav"></span><div class="cx-t"><b id="tgn"></b><small id="tgs"></small></div>'; head.k = ''; head(); lastSig = ''; render(); }
        }

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
          if (p.vid) h += '<div class="tg-vd" data-vp="' + p.id + '"><video src="' + p.vid + '#t=0.3" preload="metadata" muted playsinline></video><div class="tg-pl"><i>' + ic('play', 26) + '</i></div></div>';
          if (p.md && p.md.k === 'vid') h += '<div class="tg-vd" data-vp="' + p.id + '">' + (p.md.th ? '<img src="' + p.md.th + '">' : '') + '<div class="tg-pl"><i>' + ic('play', 26) + '</i></div><span class="tg-bd">' + fsz(p.md.s) + '</span></div>';
          if (p.md && p.md.k === 'fl') h += fileCard(p, p.md);
          if (p.fl) h += fileCard(p, { n: p.fl.n, s: (p.fl.d || '').length * 0.75, t: p.fl.t || '', inline: p.fl.d });
          return h;
        }
        function fileCard(p, f) {
          var k = fkind(f.n, f.t);
          return '<div class="tg-fl"><div class="tg-fi" style="background:' + k.c + '" data-fo="' + p.id + '">' + ic('fl', 26) + '</div><div class="tg-fn" data-fo="' + p.id + '"><b>' + esc(f.n || 'ملف') + '</b><small>' + fsz(f.s) + ' · ' + k.x + '</small></div><div class="tg-fa"><button data-fd="' + p.id + '" title="تحميل">' + ic('dl') + '</button><button data-fs="' + p.id + '" title="مشاركة">' + ic('share') + '</button></div></div>';
        }
        function pollHtml(p) {
          var o = arr(p.o), vt = p.vt || {}, tot = Object.keys(vt).length, mn = vt['u' + ok(uid)];
          return '<div class="cx-q"><b>' + esc(p.q) + '</b>' + o.map(function (x, k) { var n = Object.keys(vt).filter(function (u) { return vt[u] === k; }).length, pc = tot ? Math.round(n * 100 / tot) : 0; return '<div class="cx-o" data-vt="' + p.id + '" data-k="' + k + '" style="background:linear-gradient(90deg,rgba(10,166,245,.3) ' + pc + '%,transparent ' + pc + '%)"><span>' + (mn === k ? '✓ ' : '') + esc(x) + '</span><span>' + n + ' (' + pc + '%)</span></div>'; }).join('') + '</div>';
        }
        function linksHtml(p) {
          var us = urlsIn(p.t); if (p.lk && /^https?:\/\//i.test(p.lk) && us.indexOf(p.lk) < 0) us.push(p.lk);
          return us.slice(0, 3).map(function (u) { var s = lsafe(u); return '<div class="tg-lk' + (s.ok ? '' : ' tgbad') + '" data-lk="' + esc(u) + '"><span class="tg-li">' + ic(s.ok ? 'lnk' : 'warn', 22) + '</span><div><b>' + esc(s.h) + '</b><small>' + esc(u) + '</small></div><span class="tgb">' + (s.ok ? 'آمن' : (s.unk ? 'غير موثوق' : 'خطر')) + '</span></div>'; }).join('');
        }
        function postHtml(p, cn) {
          var v = Object.keys(p.vw || {}).length, rr = rxMap(p), canM = me() > 0;
          var chips = Object.keys(rr.m).sort(function (a, b) { return rr.m[b] - rr.m[a]; }).map(function (i) { return '<button class="tg-rx' + (rr.mine === +i ? ' on' : '') + '" data-rx="1" data-p="' + p.id + '" data-i="' + i + '"><span class="e">' + RX[i] + '</span><b>' + rr.m[i] + '</b></button>'; }).join('');
          return '<div class="tg-p" id="tgp' + p.id + '" data-id="' + p.id + '"><div class="tg-cn">' + esc(c.cn) + (c.pin === p.id ? '<span class="tg-pn">' + ic('pin', 15) + '</span>' : '') + '</div>' + mediaHtml(p) + (p.q ? pollHtml(p) : '') + (p.t ? '<div class="tg-t">' + linkify(p.t) + '</div>' : '') + linksHtml(p)
            + (chips ? '<div class="tg-rxs">' + chips + '</div>' : '')
            + '<div class="tg-ft"><button class="tg-sm" data-rxp="' + p.id + '" title="تفاعل">' + ic('smile', 18) + '</button><button class="tg-sm" data-sp="' + p.id + '" title="مشاركة">' + ic('share', 18) + '</button>' + (canM ? '<button class="tg-sm" data-pm="' + p.id + '" title="خيارات">' + ic('more', 18) + '</button>' : '') + '<span class="tg-mt">' + ic('eye', 15) + ' ' + v + '<i>•</i>' + esc(c.on || 'المدرس') + '<i>•</i>' + tmf(p.ts) + (p.edited ? ' · معدّل' : '') + '</span></div>'
            + '<div class="tg-cmr" data-cm="' + p.id + '">' + ic('cm', 21) + '<b>' + (cn ? cn + ' تعليق' : 'كتابة تعليق') + '</b><span class="chv">' + ic('chev', 20) + '</span></div></div>';
        }
        function render() {
          c = chOne(id); if (!c) { closeCh(); return; } head();
          var m = memb(), ps = cposts(id), ccs = comments(id), cnt = {};
          ccs.forEach(function (x) { cnt[x.cp] = (cnt[x.cp] || 0) + 1; });
          var sig = (m ? 1 : 0) + '|' + (c.pin || '') + '|' + qs + '|' + ps.map(function (p) { return p.id + ':' + (p.edited || 0) + ':' + Object.keys(p.rx || {}).map(function (k) { return k + p.rx[k]; }).join(',') + ':' + Object.keys(p.vt || {}).length + ':' + Object.keys(p.vw || {}).length + ':' + (cnt[p.id] || 0); }).join(';');
          if (sig !== lastSig) {
            lastSig = sig; var el = $('tgm'), end = el.scrollHeight - el.scrollTop - el.clientHeight < 120, h = '', lastD = '';
            if (!m) h = '<div class="tg-dy" style="align-self:center;margin-top:30px">انضم للقناة لمشاهدة منشورات المدرس</div>';
            else if (!ps.length) h = '<div class="tg-dy" style="margin-top:30px">لا توجد منشورات بعد</div>';
            else { var shown = qs ? ps.filter(function (p) { return nm((p.t || '') + ' ' + (p.q || '') + ' ' + ((p.md && p.md.n) || '') + ' ' + ((p.fl && p.fl.n) || '')).indexOf(nm(qs)) > -1; }) : ps;
              if (!shown.length) h = '<div class="tg-dy" style="margin-top:30px">لا توجد نتائج</div>';
              shown.forEach(function (p) { var d = dyf(p.ts); if (d !== lastD) { lastD = d; h += '<div class="tg-dy">' + d + '</div>'; } h += postHtml(p, cnt[p.id]); }); }
            el.innerHTML = h; if (end || first) el.scrollTop = el.scrollHeight; first = 0;
          }
          var pb = $('tgpin'), pp = c.pin ? ps.filter(function (p) { return p.id === c.pin; })[0] : null;
          if (m && pp) { var pt = (pp.t || pp.q || (pp.md && pp.md.n) || (pp.fl && pp.fl.n) || (pp.img ? 'صورة' : 'منشور')).replace(/\s+/g, ' ').slice(0, 80); var pk = pp.id + pt; if (pb.dataset.k !== pk) { pb.dataset.k = pk; pb.innerHTML = '<span class="bar"></span><div><b>رسالة مثبتة</b><small>' + esc(pt) + '</small></div><span class="pi">' + ic('pin', 22) + '</span>'; } pb.style.display = 'flex'; pb.dataset.p = pp.id; } else { pb.style.display = 'none'; pb.dataset.k = ''; }
          if (m && me() === 0) ps.forEach(function (p) { if (!(p.vw && p.vw['u' + ok(uid)])) rs(p.id, 'vw/u' + ok(uid), 1); });
        }

        /* ---- شريط الأسفل ---- */
        var barSt = '';
        $('tgpin').onclick = function () { var el = document.getElementById('tgp' + this.dataset.p); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
        function bar() {
          var role = me(), m = memb(), mu = !!(c.mu && c.mu['u' + ok(uid)]), st = role + '|' + (m ? 1 : 0) + '|' + (mu ? 1 : 0); var b = $('tgbar');
          if (b.dataset.s === st && barSt === st) return; b.dataset.s = st; barSt = st;
          if (role > 0) {
            var TL = [['img', 'صورة'], ['vid', 'فيديو'], ['fl', 'ملف'], ['q', 'استطلاع'], ['lnk', 'رابط']];
            b.innerHTML = '<div class="tg-tray" id="tgtr">' + TL.map(function (x) { return '<button data-a="' + x[0] + '"><i>' + ic(x[0], 24) + '</i>' + x[1] + '</button>'; }).join('') + '</div><div class="tg-cp"><button class="tg-ab" id="tgat">' + PLUS + '</button><textarea id="tgin" rows="1" placeholder="اكتب منشوراً للقناة..."></textarea><button class="tg-sb" id="tgsn">' + SEND + '</button></div>';
            $('tgat').onclick = function () { var tr = $('tgtr'), on = !tr.classList.contains('on'); tr.classList.toggle('on', on); this.classList.toggle('on', on); };
            $('tgtr').onclick = function (e) { var bt = e.target.closest('[data-a]'); if (!bt) return; $('tgtr').classList.remove('on'); $('tgat').classList.remove('on'); attachDo(bt.dataset.a); };
            var ta = $('tgin'); ta.oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(120, this.scrollHeight) + 'px'; };
            $('tgsn').onclick = function () { var t = ta.value.trim(); if (!t) return toast('اكتب نصاً أو أرفق ملفاً'); if (pub({ t: t }) !== false) { ta.value = ''; ta.style.height = 'auto'; } };
          } else if (m) {
            b.innerHTML = '<div class="tg-bt"><button class="tg-rb" id="tgsr" title="بحث">' + ic('search') + '</button><button class="tg-mp" id="tgmu">' + (mu ? ic('bell', 20) + ' إلغاء كتم الصوت' : ic('bellx', 20) + ' كتم الصوت') + '</button><button class="tg-rb" id="tgsh" title="مشاركة">' + ic('share') + '</button></div>';
            $('tgsr').onclick = toggleSearch;
            $('tgmu').onclick = function () { rs(id, 'mu/u' + ok(uid), mu ? null : 1); toast(mu ? 'تم إلغاء الكتم' : 'تم كتم الصوت'); barSt = ''; bar(); };
            $('tgsh').onclick = function () { shareText(c.cn + '\n' + chLink(c)); };
          } else {
            b.innerHTML = '<div class="tg-bt"><button class="tg-mp pri" id="tgjn">انضمام للقناة</button></div>';
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
          ov.innerHTML = '<div class="tg-sh"><h4><span>' + title + '</span><button data-x="1">' + ic('close') + '</button></h4><div class="tgbd">' + body + '</div></div>';
          root.appendChild(ov);
          ov.onclick = function (e) { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); };
          if (onReady) onReady(ov, function () { ov.remove(); });
          return ov;
        }
        function attachDo(a) {
          if (a === 'img') pick('image/*', function (f) { shrink(f, 1280, function (d) { composeSheet('img', f, d); }); });
          else if (a === 'vid') pick('video/*', function (f) { composeSheet('vid', f); });
          else if (a === 'fl') pick('*/*', function (f) { composeSheet('fl', f); });
          else if (a === 'lnk') linkPubSheet();
          else pollSheet();
        }
        function linkPubSheet() {
          sheet('نشر رابط', '<input id="lu" placeholder="https://..." style="direction:ltr;text-align:left" autocapitalize="off"><textarea id="lt" rows="2" placeholder="وصف الرابط (اختياري)"></textarea><div class="tghint">يُفحص الرابط تلقائياً ويظهر للطلاب بعلامة آمن / غير آمن.</div><button class="bt2" id="lg2">نشر</button>', function (ov, close) {
            ov.querySelector('#lg2').onclick = function () { var u = ov.querySelector('#lu').value.trim(); if (!u) return toast('اكتب الرابط'); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; if (!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(u)) return toast('رابط غير صالح'); close(); pub({ t: ov.querySelector('#lt').value.trim(), lk: u }); };
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
            : '<div class="tg-fl"><div class="tg-fi" style="background:' + k.c + '">' + ic(kind === 'vid' ? 'vid' : 'fl', 26) + '</div><div class="tg-fn"><b>' + esc(file.name) + '</b><small>' + (kind === 'vid' ? 'فيديو' : k.l) + ' · ' + fsz(file.size) + '</small></div></div>';
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
          v.innerHTML = '<div class="tgvh"><button data-x="1">' + ic('close') + '</button><b>' + esc(title) + '</b><button data-dl="1" title="تحميل">' + ic('dl') + '</button><button data-sh="1" title="مشاركة">' + ic('share') + '</button></div><div class="tgvb" id="vb"></div>';
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
            } else vb.innerHTML = '<div class="tgvl"><div class="tg-fi" style="background:' + f.k.c + ';margin:0 auto 14px;width:78px;height:78px">' + ic('fl', 38) + '</div>' + esc(f.n) + '<br><small>' + f.k.l + ' · ' + fsz(b.size) + '</small><br><br>هذه الصيغة لا تُعرض داخل التطبيق.<br>استعمل زر التحميل أو المشاركة في الأعلى وافتحها بتطبيق مناسب.</div>';
          }, f.get, f.n);
        }
        function openImg(p) { openFile(p); }
        function playVideo(p) { openFile(p); }

        /* ---- روابط ---- */
        function linkSheet(u) {
          var s = lsafe(u);
          var body = s.ok
            ? '<div class="tghint">' + ic('shield', 20) + ' الرابط آمن حسب الفحص (موقع معروف ومشفّر).<br><b dir="ltr">' + esc(u) + '</b></div><button class="tgrw pri" data-a="open">فتح الرابط</button><button class="tgrw" data-a="share">مشاركة الرابط</button><button class="tgrw" data-a="copy">نسخ الرابط</button>'
            : '<div class="tghint" style="color:#c62828">' + ic('warn', 20) + ' تنبيه: هذا الرابط غير آمن / غير موثوق.<br><b>السبب:</b> ' + esc(s.w) + '<br><b dir="ltr">' + esc(u) + '</b></div><button class="tgrw warn" data-a="open">أنا أتحمّل المسؤولية — فتح الرابط</button><button class="tgrw" data-a="share">مشاركة الرابط</button><button class="tgrw" data-a="copy">نسخ الرابط</button>';
          sheet(s.ok ? 'فتح رابط' : 'رابط غير آمن', body, function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a; close();
              if (a === 'open') { try { P.open(u, '_blank'); } catch (x) { toast('تعذّر فتح الرابط'); } }
              else if (a === 'share') shareText(u); else { try { P.navigator.clipboard.writeText(u); toast('تم نسخ الرابط'); } catch (x) { toast(u); } } };
          });
        }

        /* ---- تعليقات: نافذة مستقلة مثل الكروب ---- */
        function commentsSheet(pid) {
          var p = pbyid(pid); if (!p) return; var rp = null, firstC = 1, lastC = '';
          var ttl = (p.t || p.q || (p.md && p.md.n) || (p.fl && p.fl.n) || ((p.img || (p.md && p.md.k === 'img')) ? 'صورة' : 'منشور')).replace(/\s+/g, ' ').slice(0, 70);
          var w = document.createElement('div'); w.className = 'tg-cmw';
          w.innerHTML = '<div class="tg-top"><button class="tg-rb" data-x="1">' + ic('back') + '</button><div class="tg-pill" style="cursor:default"><span>' + av(null, 40, c.img) + '</span><div class="cx-t"><b>التعليقات</b><small id="cmn"></small></div></div><span class="tg-rb ghost"></span></div><div class="tg-m" id="cml"></div><div class="tg-bar"><div id="rqb" class="tg-rq" style="display:none"></div><div class="tg-cp"><textarea id="ci" rows="1" placeholder="اكتب تعليقاً..."></textarea><button class="tg-sb" id="cs">' + SEND + '</button></div></div>';
          root.appendChild(w);
          wall(w.querySelector('#cml'));
          var cl = w.querySelector('#cml'), rb = w.querySelector('#rqb'), ci = w.querySelector('#ci'), tm;
          function close() { clearInterval(tm); w.remove(); lastSig = ''; render(); }
          function draw(force) {
            var cs = comments(id, pid), sg = cs.map(function (x) { return x.id; }).join(',');
            if (!force && sg === lastC) return; lastC = sg;
            w.querySelector('#cmn').textContent = cs.length + ' تعليق';
            var h = '<div class="tg-qp"><span class="bar"></span><div><b>' + esc(c.cn) + '</b><small>' + esc(ttl) + '</small></div></div>';
            if (!cs.length) h += '<div class="tg-dy" style="margin:24px auto">لا توجد تعليقات بعد. كن أول من يعلّق</div>';
            cs.forEach(function (x) {
              var mine = String(x.u) === String(uid), isT = String(x.u) === String(c.o), a = accOf(x.u), canDel = me() > 0 || mine;
              h += '<div class="tg-cb' + (mine ? ' me' : '') + '">' + (mine ? '' : av(a || null, 36, null)) + '<div class="bb">' + (mine ? '' : '<b class="nm' + (isT ? '' : ' st') + '">' + esc(x.n || 'مستخدم') + (isT ? '<span class="tc">المدرس</span>' : '') + '</b>') + (x.rp ? '<div class="rq">' + esc(x.rp.n || '') + '</div>' : '') + '<p>' + linkify(x.t) + '</p><div class="mt"><span>' + tmf(x.ts) + '</span>' + (me() > 0 && !mine ? '<button data-rp="' + x.id + '" title="رد">' + ic('reply') + '</button>' : '') + (canDel ? '<button data-dc="' + x.id + '" title="حذف">' + ic('trash') + '</button>' : '') + '</div></div></div>';
            });
            var end = cl.scrollHeight - cl.scrollTop - cl.clientHeight < 140; cl.innerHTML = h; if (end || firstC) cl.scrollTop = cl.scrollHeight; firstC = 0;
          }
          draw(true); tm = setInterval(function () { if (!document.hidden) draw(); }, 2000);
          w.onclick = function (e) {
            if (e.target.closest('[data-x]')) return close();
            var r = e.target.closest('[data-rp]'); if (r) { var x = comments(id, pid).filter(function (q) { return q.id === +r.dataset.rp; })[0]; if (x) { rp = { id: x.id, u: x.u, n: x.n }; rb.style.display = 'flex'; rb.innerHTML = '<span>رد على <b>' + esc(x.n) + '</b></span><button id="rpx">' + ic('close', 18) + '</button>'; rb.querySelector('#rpx').onclick = function () { rp = null; rb.style.display = 'none'; }; ci.focus(); } return; }
            var d = e.target.closest('[data-dc]'); if (d && confirm('حذف التعليق؟')) { dr(+d.dataset.dc); draw(true); }
          };
          ci.oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(120, this.scrollHeight) + 'px'; };
          w.querySelector('#cs').onclick = function () {
            var t = ci.value.trim(); if (!t) return; if (!memb()) return toast('انضم للقناة أولاً');
            var isOwner = me() > 0, to = rp ? String(rp.u) : (isOwner ? '' : String(c.o));
            try { ar({ id: Date.now(), k: 'cc', ch: id, cp: pid, u: String(uid), n: U.name, ro: U.role, t: t, ts: Date.now(), rp: rp, to: to, cn: c.cn }); } catch (e) { return toast('تعذّر الإرسال'); }
            ci.value = ''; ci.style.height = 'auto'; rp = null; rb.style.display = 'none'; draw(true);
          };
        }

        /* ---- قائمة المنشور (للمدرس/المسؤول) ---- */
        function postMenu(pid) {
          var p = cposts(id).filter(function (q) { return q.id === pid; })[0]; if (!p) return;
          var items = '<button class="tgrw" data-a="pin">' + ic('pin', 22) + (c.pin === pid ? 'إلغاء تثبيت المنشور' : 'تثبيت المنشور') + '</button>' + (p.t ? '<button class="tgrw" data-a="edit">' + ic('edit', 22) + 'تعديل النص</button>' : '') + '<button class="tgrw red" data-a="del">' + ic('trash', 22) + 'حذف المنشور</button>';
          sheet('المنشور', items, function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; close();
              if (b.dataset.a === 'pin') { rs(id, 'pin', c.pin === pid ? null : pid); lastSig = ''; render(); toast(c.pin === pid ? 'تم إلغاء التثبيت' : 'تم تثبيت المنشور'); }
              else if (b.dataset.a === 'del') { if (confirm('حذف المنشور؟')) { dr(pid); if (c.pin === pid) rs(id, 'pin', null); if (p.md) { P.fetch(fbase() + '/handout_files/' + p.md.id + '.json', { method: 'DELETE' }).catch(function () {}); } lastSig = ''; render(); } }
              else { var nt = prompt('تعديل نص المنشور', p.t || ''); if (nt !== null) { rs(pid, 't', nt.trim()); rs(pid, 'edited', Date.now()); lastSig = ''; render(); } } };
          });
        }
        function channelMenu() {
          var role = me(), m = memb(), mu = !!(c.mu && c.mu['u' + ok(uid)]);
          var rows = '<button class="tgrw" data-a="info">' + ic('info', 22) + 'معلومات القناة</button><button class="tgrw" data-a="search">' + ic('search', 22) + 'بحث في القناة</button><button class="tgrw" data-a="share">' + ic('share', 22) + 'مشاركة رابط القناة</button>';
          if (role > 0) rows += '<button class="tgrw" data-a="edit">' + ic('edit', 22) + 'تعديل القناة</button><button class="tgrw" data-a="subs">' + ic('users', 22) + 'المشتركون والتفاعل</button>' + (c.pin ? '<button class="tgrw" data-a="unpin">' + ic('pin', 22) + 'إلغاء تثبيت الرسالة</button>' : '');
          else if (m) rows += '<button class="tgrw" data-a="mute">' + ic(mu ? 'bell' : 'bellx', 22) + (mu ? 'إلغاء كتم الصوت' : 'كتم الصوت') + '</button><button class="tgrw" data-a="own">' + ic('msg', 22) + 'مراسلة المدرس</button>';
          sheet('خيارات القناة', rows, function (ov, close) {
            ov.querySelector('.tgbd').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; close(); var a = b.dataset.a;
              if (a === 'info') showInfo('m'); else if (a === 'search') { if (!searching) toggleSearch(); } else if (a === 'share') shareText(c.cn + '\n' + chLink(c));
              else if (a === 'edit') editSheet(null); else if (a === 'subs') showInfo('s'); else if (a === 'unpin') { rs(id, 'pin', null); lastSig = ''; render(); }
              else if (a === 'mute') { rs(id, 'mu/u' + ok(uid), mu ? null : 1); toast(mu ? 'تم إلغاء الكتم' : 'تم كتم الصوت'); barSt = ''; bar(); }
              else if (a === 'own') { var o = accOf(c.o); if (o) { closeCh(); openChat(dmKey(o)); } else toast('تعذّر العثور على المدرس'); } };
          });
        }

        /* ===================== ملف تعريف القناة ===================== */
        var SOC = { tiktok: ['TikTok', '#111', function (u) { return 'https://www.tiktok.com/@' + u.replace(/^@/, ''); }], instagram: ['Instagram', '#d6249f', function (u) { return 'https://www.instagram.com/' + u.replace(/^@/, ''); }], facebook: ['Facebook', '#1877f2', function (u) { return /^https?:/.test(u) ? u : 'https://www.facebook.com/' + u.replace(/^@/, ''); }], telegram: ['Telegram', '#229ed9', function (u) { return 'https://t.me/' + u.replace(/^@/, ''); }], youtube: ['YouTube', '#e62117', function (u) { return /^https?:/.test(u) ? u : 'https://www.youtube.com/@' + u.replace(/^@/, ''); }], whatsapp: ['WhatsApp', '#25d366', function (u) { return 'https://wa.me/' + u.replace(/[^\d]/g, ''); }], x: ['X', '#000', function (u) { return 'https://x.com/' + u.replace(/^@/, ''); }], snapchat: ['Snapchat', '#fffc00', function (u) { return 'https://www.snapchat.com/add/' + u.replace(/^@/, ''); }] };
        function showInfo(tab) {
          closeInfo(); c = chOne(id); var role = me(), g2 = gcol(c), gr2 = '';
          var el = document.createElement('div'); el.className = 'tg-info'; el.id = 'tgi'; root.appendChild(el);
          var T = [['m', 'الوسائط'], ['f', 'الملفات'], ['l', 'الروابط']]; if (role > 0) T.push(['s', 'المشتركون']);
          tab = tab || 'm'; var q = '';
          function draw() {
            c = chOne(id); if (!c) return closeInfo(); var ps = cposts(id), n = Object.keys(c.m || {}).length;
            var lks = arr(c.lks), socs = arr(c.so), ownerAcc = accOf(c.o);
            var head = '<div class="ban"><div class="ih"><button class="cx-b" data-x="1">' + ARW + '</button><b>معلومات القناة</b>' + (role > 0 ? '<button class="cx-b" data-edit="1" title="تعديل القناة">' + ic('edit', 20) + '</button>' : '') + '</div><div class="ic">' + av(null, 96, c.img) + '<h3>' + esc(c.cn) + '</h3><p>' + n + ' مشترك' + (c.sj ? ' · ' + esc(c.sj) : '') + '</p></div></div>';
            var about = '<div class="cd"><h5>الوصف</h5><p>' + esc(c.cd || 'قناة مادة ' + (c.sj || '')) + '</p></div>'
              + '<div class="cd"><h5>رابط القناة</h5><div class="ln" data-lk="' + esc(chLink(c)) + '"><span class="ci" style="background:#1d6fd6">' + ic('lnk', 20) + '</span><span style="direction:ltr;font-size:12.5px;word-break:break-all">' + esc(chLink(c)) + '</span></div><div class="ln" data-sharech="1"><span class="ci" style="background:#14a38b">' + ic('share', 20) + '</span>مشاركة رابط القناة</div></div>'
              + '<div class="cd"><h5>المدرس</h5><div class="ln" data-own="1"><span class="ci" style="background:' + g2[1] + '">' + esc((c.on || '؟').trim()[0] || '؟') + '</span>' + esc(c.on || '') + (role === 0 ? '<span style="margin-inline-start:auto;color:#1d6fd6">مراسلة</span>' : '') + '</div></div>';
            var extra = '';
            if (lks.length) extra += '<div class="cd"><h5>روابط القناة</h5>' + lks.map(function (x, i) { return '<div class="ln" data-lk="' + esc(x.u) + '"><span class="ci" style="background:#1d6fd6">' + ic('lnk', 20) + '</span><div><div>' + esc(x.t || lsafe(x.u).h) + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600">' + esc(x.u) + '</small></div></div>'; }).join('') + '</div>';
            if (socs.length) extra += '<div class="cd"><h5>حسابات القناة</h5>' + socs.map(function (x) { var s = SOC[x.p] || ['رابط', '#475569', function (u) { return u; }]; return '<div class="ln" data-lk="' + esc(s[2](x.u || '')) + '"><span class="ci" style="background:' + s[1] + ';' + (x.p === 'snapchat' ? 'color:#000' : '') + '">' + s[0].slice(0, 2) + '</span><div><div>' + s[0] + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600">' + esc(x.u) + '</small></div></div>'; }).join('') + '</div>';
            var tabs = '<div class="tb">' + T.map(function (x) { return '<button data-tb="' + x[0] + '" class="' + (x[0] === tab ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
            var body = '';
            var show = memb();
            if (!show) body = '<div class="cd"><p style="text-align:center;color:#6b7c99">انضم للقناة لعرض المحتوى</p></div>';
            else if (tab === 'm') { var ms = ps.filter(function (p) { return p.img || p.vid || (p.md && (p.md.k === 'vid' || p.md.k === 'img')); }); body = ms.length ? '<div class="tg-gr">' + ms.map(function (p) { var th = p.img || (p.md && p.md.th) || ''; return '<div data-iv="' + p.id + '" style="' + (th ? 'background-image:url(' + th + ')' : '') + '">' + ((p.vid || (p.md && p.md.k === 'vid')) ? '<span>' + ic('play', 24) + '</span>' : '') + '</div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد صور أو فيديوهات</p></div>'; }
            else if (tab === 'f') { var fs = ps.filter(function (p) { return p.fl || (p.md && p.md.k === 'fl'); }); body = fs.length ? '<div class="cd">' + fs.map(function (p) { var f = p.md || p.fl, k = fkind(f.n, f.t); return '<div class="tg-fl" style="background:none;padding:6px 0"><div class="tg-fi" style="background:' + k.c + '">' + ic('fl', 26) + '</div><div class="tg-fn"><b>' + esc(f.n) + '</b><small>' + fsz(f.s || ((f.d || '').length * 0.75)) + ' · ' + k.x + ' · ' + dyf(p.ts) + '</small></div><div class="tg-fa"><button data-fo="' + p.id + '">' + ic('eye') + '</button><button data-fd="' + p.id + '">' + ic('dl') + '</button><button data-fs="' + p.id + '">' + ic('share') + '</button></div></div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد ملفات</p></div>'; }
            else if (tab === 'l') { var us = []; ps.forEach(function (p) { urlsIn(p.t).concat(p.lk ? [p.lk] : []).forEach(function (u) { if (us.indexOf(u) < 0) us.push(u); }); }); body = us.length ? '<div class="cd">' + us.map(function (u) { var s = lsafe(u); return '<div class="ln" data-lk="' + esc(u) + '"><span class="ci" style="background:' + (s.ok ? '#14a38b' : '#e5484d') + '">' + ic(s.ok ? 'lnk' : 'warn', 20) + '</span><div style="min-width:0"><div>' + esc(s.h) + '</div><small style="color:#6b7c99;direction:ltr;display:block;font-weight:600;word-break:break-all">' + esc(u) + '</small></div></div>'; }).join('') + '</div>' : '<div class="cd"><p style="text-align:center;color:#6b7c99">لا توجد روابط</p></div>'; }
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
              + (f.length ? f.map(function (r, i) { return '<div class="tg-sub">' + (i < 3 && r.s > 0 && !q ? '<span class="rk">' + (i + 1) + '</span>' : av(accOf(r.u) || null, 34, null)) + '<div><b>' + esc(r.n) + '</b><small>' + esc(r.g) + (r.s ? ' · نقاط التفاعل ' + r.s : ' · لا تفاعل بعد') + '</small></div><div class="st"><span>' + ic('eye', 16) + ' ' + r.v + '</span><span>' + ic('smile', 16) + ' ' + r.r + '</span><span>' + ic('cm', 16) + ' ' + r.c + '</span></div></div>'; }).join('') : '<p style="text-align:center;color:#6b7c99">لا يوجد مشتركون' + (q ? ' بهذا الاسم' : ' بعد') + '</p>') + '</div>';
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
          function rowsL() { return lks.map(function (x, i) { return '<div style="display:flex;gap:6px"><input data-lt="' + i + '" placeholder="العنوان" value="' + esc(x.t) + '" style="flex:1"><input data-lu="' + i + '" placeholder="https://..." value="' + esc(x.u) + '" style="flex:2;direction:ltr"><button class="tg-ib" data-ld="' + i + '">' + ic('close', 18) + '</button></div>'; }).join(''); }
          function rowsS() { return socs.map(function (x, i) { return '<div style="display:flex;gap:6px"><select data-sp="' + i + '" style="flex:1">' + Object.keys(SOC).map(function (k) { return '<option value="' + k + '"' + (x.p === k ? ' selected' : '') + '>' + SOC[k][0] + '</option>'; }).join('') + '</select><input data-su="' + i + '" placeholder="اسم الحساب أو الرقم" value="' + esc(x.u) + '" style="flex:2;direction:ltr"><button class="tg-ib" data-sd="' + i + '">' + ic('close', 18) + '</button></div>'; }).join(''); }
          var ov = sheet('تعديل القناة', '<div style="text-align:center;margin-bottom:8px"><span id="eav">' + av(null, 84, img) + '</span><br><button class="tgrw" id="eim" style="width:auto;display:inline-flex;margin-top:6px">' + ic('camera', 20) + ' تغيير صورة القناة</button></div>'
            + '<input id="en" maxlength="40" placeholder="اسم القناة" value="' + esc(c.cn) + '"><textarea id="ed" rows="3" maxlength="300" placeholder="وصف القناة">' + esc(c.cd || '') + '</textarea>'
            + '<div class="tghint">روابط القناة</div><div id="el">' + rowsL() + '</div><button class="tgrw" id="ela">+ إضافة رابط</button>'
            + '<div class="tghint">حسابات القناة (تيك توك، انستغرام، ...)</div><div id="es">' + rowsS() + '</div><button class="tgrw" id="esa">+ إضافة حساب</button>'
            + '<button class="tgrw" id="eadm">' + ic('users', 20) + ' مسؤولو القناة</button>' + (me() === 2 ? '<button class="tgrw red" id="edel">' + ic('trash', 20) + ' حذف القناة</button>' : '') + '<button class="bt2" id="esv">حفظ التعديلات</button>', function (ov2, close) {
            ov2.querySelector('.tg-sh').style.maxHeight = '92%';
            function sync() { ov2.querySelectorAll('[data-lt]').forEach(function (x) { lks[+x.dataset.lt].t = x.value; }); ov2.querySelectorAll('[data-lu]').forEach(function (x) { lks[+x.dataset.lu].u = x.value; }); ov2.querySelectorAll('[data-sp]').forEach(function (x) { socs[+x.dataset.sp].p = x.value; }); ov2.querySelectorAll('[data-su]').forEach(function (x) { socs[+x.dataset.su].u = x.value; }); }
            ov2.querySelector('#eim').onclick = function () { pick('image/*', function (f) { (window.__afSq || function (ff, z, cb) { shrink(ff, z, cb); })(f, 400, function (d) { img = d; ov2.querySelector('#eav').innerHTML = av(null, 84, d); }); }); };
            ov2.querySelector('#ela').onclick = function () { sync(); if (lks.length >= 8) return; lks.push({ t: '', u: '' }); ov2.querySelector('#el').innerHTML = rowsL(); };
            ov2.querySelector('#esa').onclick = function () { sync(); if (socs.length >= 8) return; socs.push({ p: 'tiktok', u: '' }); ov2.querySelector('#es').innerHTML = rowsS(); };
            ov2.querySelector('#el').onclick = function (e) { var d = e.target.closest('[data-ld]'); if (d) { sync(); lks.splice(+d.dataset.ld, 1); this.innerHTML = rowsL(); } };
            ov2.querySelector('#es').onclick = function (e) { var d = e.target.closest('[data-sd]'); if (d) { sync(); socs.splice(+d.dataset.sd, 1); this.innerHTML = rowsS(); } };
            var ed0 = ov2.querySelector('#edel');
            if (ed0) ed0.onclick = function () {
              if (!confirm('حذف القناة نهائياً مع كل منشوراتها وتعليقاتها وملفاتها؟')) return;
              if (!confirm('تأكيد أخير: لا يمكن التراجع عن حذف القناة')) return;
              cposts(id).forEach(function (p) { if (p.md) P.fetch(fbase() + '/handout_files/' + p.md.id + '.json', { method: 'DELETE' }).catch(function () {}); dr(p.id); });
              comments(id).forEach(function (x) { dr(x.id); });
              dr(id); close(); closeCh(); toast('تم حذف القناة'); try { V.parents(); } catch (e) {}
            };
            ov2.querySelector('#eadm').onclick = function () { try { adminSheet(id); } catch (e) { toast('غير متاح'); } };
            ov2.querySelector('#esv').onclick = function () {
              sync(); var n = ov2.querySelector('#en').value.trim(); if (n.length < 2) return toast('اكتب اسم القناة');
              var L = {}, S = {}, bad = '';
              lks.filter(function (x) { return x.u.trim(); }).forEach(function (x, i) { var u = x.u.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; if (!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(u)) bad = u; L[i] = { t: x.t.trim(), u: u }; });
              if (bad) return toast('رابط غير صالح: ' + bad);
              socs.filter(function (x) { return x.u.trim(); }).forEach(function (x, i) { S[i] = { p: x.p, u: x.u.trim() }; });
              rs(id, 'cn', n); rs(id, 'cd', ov2.querySelector('#ed').value.trim()); if (img) rs(id, 'img', img);
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

      /* ===== نافذة فتح رابط القناة (تظهر لمن يفتح الرابط) ===== */
      chLanding = function () {
        var p = null; try { p = JSON.parse(LS.getItem('af_pend_ch') || 'null'); } catch (e) {}
        if (!p || !(p.id || p.s) || Date.now() - p.t > 864e5 || U.role === 'guest' || U.role === 'admin') return;
        var tries = 0;
        (function w() {
          var c = p.id ? chOne(p.id) : chBySlug(p.s);
          if (!c) { if (++tries > 24) { try { LS.removeItem('af_pend_ch'); } catch (e) {} toast('لم يتم العثور على القناة، تأكد من الرابط'); return; } setTimeout(w, 500); return; }
          try { LS.removeItem('af_pend_ch'); } catch (e) {}
          var mem = isMem(c) || isOwnCh(c), n = Object.keys(c.m || {}).length, o = document.createElement('div'); o.className = 'tg-land';
          o.innerHTML = '<div class="lc"><div class="lb"><small>' + esc(SD.name || '') + '</small><small style="margin-top:4px">قناة مادة</small></div><div class="la">' + av(null, 84, c.img) + '</div><h2>' + esc(c.cn) + '</h2>' + (c.cd ? '<p>' + esc(c.cd) + '</p>' : '') + '<p>المدرس: <b>' + esc(c.on || '—') + '</b>' + (c.sj ? ' · ' + esc(c.sj) : '') + '</p><p>' + n + ' مشترك</p><div class="lbs"><button id="tlGo">' + (mem ? 'فتح القناة' : 'انضمام وفتح القناة') + '</button><button class="g" id="tlNo">ليس الآن</button></div></div>';
          document.body.appendChild(o);
          o.querySelector('#tlNo').onclick = function () { o.remove(); };
          o.querySelector('#tlGo').onclick = function () { if (!mem) rs(c.id, 'm/u' + ok(uid), String(uid)); o.remove(); openCh(c.id); };
          o.onclick = function (e) { if (e.target === o) o.remove(); };
        })();
      };
      /* رابط يُفتح من خارج التطبيق (أندرويد) */
      setInterval(function () {
        try {
          var a = A(); if (!a || !a.pendingLink) return; var v = a.pendingLink(); if (!v) return;
          var m = v.match(/^c=(.+)$/), m2 = v.match(/^ch=(\d+)$/);
          if (m) LS.setItem('af_pend_ch', JSON.stringify({ s: decodeURIComponent(m[1]).toLowerCase(), t: Date.now() }));
          else if (m2) LS.setItem('af_pend_ch', JSON.stringify({ id: +m2[1], t: Date.now() }));
          else return;
          chLanding();
        } catch (e) {}
      }, 1000);
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
