/* af-admin-edit.js — تعديل الإدارة للإعلانات المدرسية بعد نشرها.
   عند التعديل يتغير محتوى الإعلان فتصل للطلاب إشعار «تم تعديل الإشعار» تلقائياً (من محرك الإشعارات). */
(function () {
  'use strict';
  try {
    var s = window.ADMIN_SRC; if (!s) return;
    function rep(a, b) { if (s.indexOf(a) < 0) { try { console.warn('af-admin-edit: pattern missing', a.slice(0, 40)); } catch (e) {} return; } s = s.split(a).join(b); }

    rep("V.announcements=function(){", "V.announcements=function(){window.__annEd=null;");
    rep('<button data-del="\'+a.id+\'">حذف</button>',
        '<button data-ed="\'+a.id+\'" style="margin-inline-start:6px">تعديل</button><button data-del="\'+a.id+\'">حذف</button>');

    var oldPub = "A.push({id:Date.now(),title:title,desc:desc,image:$('annImage').value.trim(),target:target,student:student,targetLabel:target==='student'?student:labels[target],createdAt:Date.now()});$('annTitle').value='';$('annDesc').value='';$('annImage').value='';draw();toast('تم نشر الإعلان')";
    var newPub = "var _ed=window.__annEd?A.filter(function(x){return String(x.id)===String(window.__annEd)})[0]:null;"
      + "if(_ed){_ed.title=title;_ed.desc=desc;_ed.image=$('annImage').value.trim();_ed.target=target;_ed.student=student;_ed.targetLabel=target==='student'?student:labels[target];_ed.editedAt=Date.now();window.__annEd=null;$('annPublish').textContent='نشر الإعلان';$('annTitle').value='';$('annDesc').value='';$('annImage').value='';draw();toast('تم تعديل الإعلان وإرسال الإشعار')}"
      + "else{A.push({id:Date.now(),title:title,desc:desc,image:$('annImage').value.trim(),target:target,student:student,targetLabel:target==='student'?student:labels[target],createdAt:Date.now()});$('annTitle').value='';$('annDesc').value='';$('annImage').value='';draw();toast('تم نشر الإعلان')}";
    rep(oldPub, newPub);

    rep("$('annList').onclick=function(e){var b=e.target.closest('[data-del]');",
        "$('annList').onclick=function(e){var eb=e.target.closest('[data-ed]');if(eb){var x=A.filter(function(a){return String(a.id)===eb.dataset.ed})[0];if(x){window.__annEd=x.id;$('annTitle').value=x.title||'';$('annDesc').value=x.desc||'';$('annImage').value=x.image||'';$('annTarget').value=x.target||'all';$('annStudentWrap').style.display=x.target==='student'?'block':'none';$('annStudent').value=x.student||'';$('annPublish').textContent='حفظ التعديل';try{$('annTitle').focus()}catch(_){}}return}var b=e.target.closest('[data-del]');");
    window.ADMIN_SRC = s;
  } catch (e) { try { console.warn('af-admin-edit', e); } catch (x) {} }
})();
