/* af-perm.js — صلاحيات الأندرويد من نظام الجهاز نفسه (نافذة النظام) بدل نوافذ/تخزين المتصفح.
   على الآيفون والمتصفح لا يتغير شي (يبقى السلوك الحالي). */
(function () {
  'use strict';
  var A = window.Android;
  if (!A || !A.askPerm || !A.hasPerm) return;
  var cbs = {};
  window.__afPerm = function (k, ok) { var l = cbs[k] || []; cbs[k] = []; l.forEach(function (f) { try { f(ok); } catch (e) { } }); };
  window.permOK = function (k) { try { return !!A.hasPerm(k); } catch (e) { return true; } };
  /* نكمّل دائماً بعد رد النظام: منتقي الصور يشتغل حتى لو رُفض الإذن، وللمايك تظهر رسالة الرفض من الصفحة */
  window.askPerm = function (doc, k, cb) {
    if (window.permOK(k)) { cb(); return; }
    (cbs[k] = cbs[k] || []).push(function () { cb(); });
    try { A.askPerm(k); } catch (e) { cb(); }
  };

  /* معرض داخلي يعرض كل صور الجهاز (مو منتقي النظام): شبكة صور بتحديد متعدد، وتُرسل الصور للمنشور */
  if (!A.listPhotos || !A.photoThumb || !A.photoData) return;
  window.afPhotos = function (doc, multi, done, fallback) {
    var go = function () {
      if (!window.permOK('media')) { try { fallback && fallback(); } catch (e) { } return; }
      open();
    };
    if (window.permOK('media')) go(); else window.askPerm(doc, 'media', go);
    function open() {
      var sel = [], off = 0, loading = 0, end = 0, q = [], busy = 0;
      var R = doc.createElement('div');
      R.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#0d1721;color:#fff;display:flex;flex-direction:column;direction:rtl;font-family:Cairo,sans-serif';
      R.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:#14222f"><button data-x style="width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:20px">✕</button><b style="flex:1;font-size:17px">صوري</b><button data-v style="height:40px;padding:0 12px;border:0;border-radius:20px;background:rgba(255,255,255,.1);color:#fff;font:inherit;font-size:13px;font-weight:700">فيديو</button><button data-ok style="height:40px;padding:0 18px;border:0;border-radius:20px;background:#1d7fc4;color:#fff;font:inherit;font-weight:800;opacity:.5">تم</button></div><div data-g style="flex:1;min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;align-content:start;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))"></div><div data-m style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-weight:800">جاري تحضير الصور...</div>';
      (doc.body || doc.documentElement).appendChild(R);
      var G = R.querySelector('[data-g]'), OK = R.querySelector('[data-ok]');
      function upd() { OK.textContent = sel.length ? 'تم (' + sel.length + ')' : 'تم'; OK.style.opacity = sel.length ? 1 : .5; }
      function pump() {
        if (busy) return; var t = q.shift(); if (!t) return; busy = 1;
        setTimeout(function () {
          try { var d = A.photoThumb(t.id); if (d) t.el.style.backgroundImage = 'url(data:image/jpeg;base64,' + d + ')'; } catch (e) { }
          busy = 0; pump();
        }, 0);
      }
      function more() {
        if (loading || end) return; loading = 1;
        setTimeout(function () {
          var ids = []; try { ids = JSON.parse(A.listPhotos(off, 90)); } catch (e) { }
          if (!ids.length) { end = 1; if (!off) G.innerHTML = '<div style="grid-column:1/4;text-align:center;padding:40px;opacity:.7">لا توجد صور في الجهاز</div>'; }
          off += ids.length;
          ids.forEach(function (id) {
            var el = doc.createElement('div');
            el.style.cssText = 'position:relative;aspect-ratio:1;background:#1b2a3a center/cover no-repeat;cursor:pointer';
            el.dataset.id = id; G.appendChild(el); q.push({ id: id, el: el });
          });
          loading = 0; pump();
        }, 0);
      }
      G.addEventListener('scroll', function () { if (G.scrollTop + G.clientHeight > G.scrollHeight - 600) more(); });
      G.addEventListener('click', function (e) {
        var el = e.target.closest('[data-id]'); if (!el) return; var id = +el.dataset.id, i = sel.indexOf(id);
        if (i >= 0) { sel.splice(i, 1); el.innerHTML = ''; el.style.outline = ''; }
        else {
          if (!multi) { sel = []; [].forEach.call(G.querySelectorAll('[data-id]'), function (x) { x.innerHTML = ''; x.style.outline = ''; }); }
          sel.push(id); el.style.outline = '3px solid #1d9bf0'; el.style.outlineOffset = '-3px';
          el.innerHTML = '<span style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:#1d9bf0;display:grid;place-items:center;font-size:14px;font-weight:800">' + '✓' + '</span>';
        }
        upd();
      });
      R.addEventListener('click', function (e) {
        if (e.target.closest('[data-x]')) { R.remove(); return; }
        if (e.target.closest('[data-v]')) { R.remove(); fallback && fallback(); return; }
        if (e.target.closest('[data-ok]') && sel.length) {
          var M = R.querySelector('[data-m]'); M.style.display = 'flex';
          var ids = sel.slice(), files = [];
          (function nx() {
            var id = ids.shift();
            if (id == null) { R.remove(); if (files.length) done(files); return; }
            M.textContent = 'جاري تحضير الصور... (' + (files.length + 1) + '/' + (files.length + 1 + ids.length) + ')';
            setTimeout(function () {
              try {
                var d = A.photoData(id, 1600);
                if (d) { var bin = atob(d), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); files.push(new File([u], 'photo_' + id + '.jpg', { type: 'image/jpeg' })); }
              } catch (e) { }
              nx();
            }, 20);
          })();
        }
      });
      more();
    }
  };
})();
