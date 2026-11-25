#!/usr/bin/env python3
"""ينقل كل بيانات المدرسة من قاعدة Firebase قديمة لقاعدة جديدة (منطقة أقرب).
الاستعمال:  python3 migrate-db.py <رابط القاعدة القديمة> <رابط القاعدة الجديدة>
مثال:       python3 migrate-db.py https://ssjjs-591e7-default-rtdb.asia-southeast1.firebasedatabase.app https://اسم-الجديدة.europe-west1.firebasedatabase.app
قبل التشغيل: أنشئ القاعدة الجديدة وانسخ لها القواعد (Rules) من firebase-rules.json. يحفظ نسخة احتياطية backup.json أولاً."""
import sys, json, urllib.request
if len(sys.argv) != 3:
    print(__doc__); sys.exit(1)
old, new = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/")
print("1) تنزيل البيانات من القاعدة القديمة...")
data = urllib.request.urlopen(old + "/.json", timeout=300).read()
open("backup.json", "wb").write(data)
j = json.loads(data)
print(f"   تم ({len(data)/1048576:.1f} ميغا، {len(j or {})} فرع). نسخة احتياطية: backup.json")
print("2) رفع البيانات للقاعدة الجديدة (فرع فرع)...")
for k, v in (j or {}).items():
    body = json.dumps(v, ensure_ascii=False).encode("utf8")
    req = urllib.request.Request(f"{new}/{k}.json", data=body, method="PUT", headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=300).read()
    print(f"   ✓ {k} ({len(body)/1024:.0f} كيلو)")
print("\nتم النقل. أرسل لي رابط القاعدة الجديدة وأضبط التطبيق عليها وأطلع نسخة جديدة.")
print("ملاحظة: بعد التحويل لا تعدّل بالقاعدة القديمة (التعديلات اللي بعد النقل ما تنتقل).")
