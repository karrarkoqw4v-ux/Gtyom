#!/usr/bin/env python3
"""يتحقق من ملف تحديث الواجهة (OTA) قبل إرساله: نفس شروط التطبيق (Ota.kt) + فحص صيغة JS + فحص المراجع.
الاستعمال: python3 validate-ota-zip.py alfarabi-ui-update-X.zip"""
import sys, zipfile, re, subprocess, tempfile, os, json
ALLOWED = {"html","js","css","json","svg","png","jpg","jpeg","webp","woff2","ttf","ico","txt","mp3","ogg","bcmap","pfb","webmanifest","map"}
MAX_TOTAL, MAX_FILES, MAX_ZIP = 80*1024*1024, 800, 25*1024*1024
def main(p):
    bad = []; warn = []
    size = os.path.getsize(p)
    if size > MAX_ZIP: bad.append(f"حجم الملف {size/1048576:.1f} ميغا أكبر من حد الرفع 25 ميغا")
    with open(p,'rb') as f:
        if f.read(2) != b'PK': bad.append("الملف ليس ZIP")
    try: z = zipfile.ZipFile(p)
    except Exception as e: print("❌ ZIP تالف:", e); return 1
    t = z.testzip()
    if t: bad.append("ملف تالف داخل الـZIP: "+t)
    names = [i.filename for i in z.infolist() if not i.filename.endswith('/')]
    if len(names) > MAX_FILES: bad.append(f"عدد الملفات {len(names)} أكبر من {MAX_FILES}")
    total = sum(i.file_size for i in z.infolist())
    if total > MAX_TOTAL: bad.append("الحجم بعد الفك أكبر من 80 ميغا")
    for n in names:
        ext = n.rsplit('.',1)[-1].lower() if '.' in n else ''
        if '..' in n or n.startswith('/') or '\\' in n: bad.append("مسار غير آمن: "+n)
        if ext not in ALLOWED: bad.append("امتداد غير مسموح: "+n)
    if 'index.html' not in names: bad.append("لا يوجد index.html في جذر الـZIP")
    idx = z.read('index.html').decode('utf8','replace') if 'index.html' in names else ''
    # كل سكربت/ستايل محلي مذكور في index.html لازم يكون موجوداً
    for m in re.finditer(r'<script[^>]+src="([^"#?:\'+]+)(?:\?[^"]*)?"', idx):
        r = m.group(1).lstrip('/')
        if r and r not in names and not r.endswith('/') and '.' in r.split('/')[-1]:
            warn.append("مرجع غير موجود في الـZIP (يُحمَّل من الأصل داخل التطبيق إن وُجد): "+r)
    # فحص صيغة JS
    with tempfile.TemporaryDirectory() as d:
        nbad = 0
        for n in names:
            if n.endswith('.js'):
                fp = os.path.join(d, os.path.basename(n)); open(fp,'wb').write(z.read(n))
                r = subprocess.run(['node','--check',fp],capture_output=True,text=True)
                if r.returncode: nbad += 1; bad.append("خطأ صيغة JS في "+n+": "+r.stderr.strip().splitlines()[0][:120])
            if n.endswith('.json'):
                try: json.loads(z.read(n))
                except Exception as e: bad.append("JSON غير صالح: "+n)
    print(f"الملفات: {len(names)} · الحجم المضغوط: {size/1048576:.2f} ميغا · بعد الفك: {total/1048576:.1f} ميغا")
    for w in warn[:8]: print("⚠️ ", w)
    if bad:
        for b in bad: print("❌", b)
        return 1
    print("✅ الملف صالح: يطابق شروط التطبيق (الامتدادات، الحجم، index.html، صيغة JS)")
    return 0
sys.exit(main(sys.argv[1]))
