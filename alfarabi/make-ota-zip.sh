#!/bin/sh
# يبني ملف التحديث عن بعد بصيغة تقبلها كل نسخ التطبيق (بدون الامتدادات غير المسموحة في النسخ القديمة)
# الامتدادات المستبعدة تبقى متاحة من ملفات التطبيق نفسه: bcmap pfb webmanifest map
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/www" || exit 1
OUT="${1:-../ota.zip}"; rm -f "$OUT"
zip -qr "$OUT" . -x "*.bcmap" "*.pfb" "*.webmanifest" "*.map"
# فحص الصلاحية قبل التسليم (نفس شروط التطبيق)
case "$OUT" in /*) OZ="$OUT";; *) OZ="$PWD/$OUT";; esac
python3 "$HERE/validate-ota-zip.py" "$OZ" || { echo "فشل الفحص: لا تُرسل هذا الملف"; exit 1; }
