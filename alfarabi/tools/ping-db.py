#!/usr/bin/env python3
"""يقيس سرعة الوصول لمناطق قاعدة البيانات من جهازك (شغّله من الحاسبة أو الموبايل بالعراق).
الاستعمال:  python3 ping-db.py
أقل رقم = أقرب منطقة. حتى لو القاعدة غير موجودة بالمنطقة فالرقم يعطي سرعة الوصول للمنطقة نفسها."""
import time, urllib.request, urllib.error, statistics
PROJ = "ssjjs-591e7-default-rtdb"
REGIONS = [
    ("آسيا - سنغافورة (الحالية)", f"https://{PROJ}.asia-southeast1.firebasedatabase.app"),
    ("أوروبا - بلجيكا (europe-west1)", f"https://{PROJ}.europe-west1.firebasedatabase.app"),
    ("أمريكا - (us-central1)", f"https://{PROJ}.firebaseio.com"),
]
def one(u):
    t = time.time()
    try:
        urllib.request.urlopen(urllib.request.Request(u + "/.json?shallow=true&limitToFirst=1", headers={"User-Agent": "ping"}), timeout=15).read()
    except urllib.error.HTTPError:
        pass   # 404/401 تكفي: المهم الوصول للمنطقة
    except Exception as e:
        return None
    return (time.time() - t) * 1000
print("جاري القياس (5 محاولات لكل منطقة)...\n")
for name, u in REGIONS:
    r = [x for x in (one(u) for _ in range(5)) if x]
    print(f"{name:34s}", f"{statistics.median(r):7.0f} ms" if r else "   تعذّر الوصول")
print("\nاختر المنطقة الأقل رقماً. الأقل = رسائل أسرع.")
