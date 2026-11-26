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
})();
