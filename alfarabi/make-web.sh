#!/bin/sh
# يبني نسخة الموقع (قابلة للتثبيت كتطبيق PWA) في alfarabi/web
cd "$(dirname "$0")" || exit 1
PREFIX="${WEB_PREFIX:-}"   # مثال: /Gtyom عند النشر على GitHub Pages
rm -rf web && mkdir web && cp -r www/. web/
mv web/manifest.webmanifest web/manifest.json   # بعض الاستضافات المجانية تمنع امتداد webmanifest
sed -i 's#manifest\.webmanifest#manifest.json#g' web/index.html
cp web-src/icons/* web/
: > web/android-responsive.css
cp web-src/af-webshim.js web-src/af-landing.js web-src/af-dev.js web-src/sw.js web/
python3 - <<'P'
import re,json
p='web/index.html'; s=open(p,encoding='utf8').read()
s=s.replace('<script src="/af-android.js"></script>','<script src="/af-webshim.js"></script>\n  <script src="/af-landing.js"></script>\n  <script src="/af-dev.js"></script>\n  <script src="/af-android.js"></script>',1)
# النسخة الجديدة من index.html فيها af-webshim مسبقاً: نضيف شاشة التثبيت (landing) وحساب المطوّر بعده إن لم يكونا موجودين
if 'af-landing.js' not in s:
    s=re.sub(r'(<script src="(?:/)?af-webshim\.js[^"]*"></script>)',r'\1\n  <script src="af-landing.js"></script>',s,count=1)
if 'af-dev.js' not in s:
    s=re.sub(r'(<script src="(?:/)?af-landing\.js[^"]*"></script>)',r'\1\n  <script src="af-dev.js"></script>',s,count=1)
open(p,'w',encoding='utf8').write(s)
m={"id":"./","name":"ثانوية الفارابي الأهلية للبنين","short_name":"مدرسة الفارابي","description":"بوابة ثانوية الفارابي الأهلية للبنين","lang":"ar","dir":"rtl","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#ffffff","theme_color":"#0aa6f5","prefer_related_applications":False,
"icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
json.dump(m,open('web/manifest.json','w',encoding='utf8'),ensure_ascii=False,indent=2)
# رابط الأيقونات والـmanifest نسبية + favicon
s=open(p,encoding='utf8').read()
s=s.replace('<link rel="apple-touch-icon" href="/icon-192.png">','<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="icon" type="image/png" sizes="48x48" href="favicon-48.png">\n<link rel="shortcut icon" href="favicon.ico">')
s=s.replace('href="/manifest.json"','href="manifest.json"').replace("m.href='/manifest.json?dt='","m.href='manifest.json?dt='")
open(p,'w',encoding='utf8').write(s)
P
python3 - "$PREFIX" <<'P'
import re,sys,glob,json
pre=sys.argv[1]
if pre:
    pat=re.compile(r"""(["'(])/(af-[a-z0-9]+\.js|fonts/|vendor/|sw\.js|manifest\.json|icon-\d+\.png|school-install-icon\.svg|logo\.jpg|version\.json|index\.html)""")
    for f in glob.glob('web/**/*',recursive=True):
        if f.endswith(('.html','.js','.css')):
            t=open(f,encoding='utf8').read(); n=pat.sub(lambda m:m.group(1)+pre+'/'+m.group(2),t)
            if n!=t: open(f,'w',encoding='utf8').write(n)
    t=open('web/sw.js',encoding='utf8').read().replace("openWindow('/')","openWindow('"+pre+"/')"); open('web/sw.js','w',encoding='utf8').write(t)
P
# مسارات نسبية حتى يشتغل الموقع من أي مجلد
sed -i -E 's#(src|href)="/(af-[a-z0-9]+\.js|fonts/|vendor/|icon|logo|school|manifest)#\1="\2#g' web/index.html
sed -i "s#register('/sw.js')#register('sw.js')#g" web/index.html
sed -i '/rel="icon" href="school-install-icon.svg"/d' web/index.html
# رقم إصدار على روابط السكربتات حتى لا يعرض المتصفح نسخاً قديمة محفوظة
V=$(cat www/*.js web-src/*.js | md5sum | cut -c1-8)
sed -i -E "s#(src=\"[^\"]*(af-webshim|af-landing|af-dev|af-android|af-extra|af-handouts)\.js)\"#\1?v=$V\"#" web/index.html
# نسخة APK الأحدث داخل الموقع (إن وُجدت) ليحمّلها الموقع مباشرة من نفس الاستضافة
APK=$(ls -1 dist/alfarabi-v*.apk 2>/dev/null | sort -V | tail -1)
if [ -n "$APK" ]; then cp "$APK" web/alfarabi.apk; basename "$APK" | sed -E 's/alfarabi-v(.*)\.apk/\1/' | tr -d '\n' > web/apk-version.txt; fi
# نسخة الـAPK تُخفي واجهة التثبيت (#afl)؛ في نسخة الموقع نُظهر شاشة تثبيت التطبيق
sed -i 's/,#afl{display:none!important}/{display:none!important}/' web/index.html
