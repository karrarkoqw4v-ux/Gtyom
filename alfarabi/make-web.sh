#!/bin/sh
# يبني نسخة الموقع (قابلة للتثبيت كتطبيق PWA) في alfarabi/web
cd "$(dirname "$0")" || exit 1
PREFIX="${WEB_PREFIX:-}"   # مثال: /Gtyom عند النشر على GitHub Pages
rm -rf web && mkdir web && cp -r www/. web/
cp web-src/af-webshim.js web-src/sw.js web/
python3 - <<'P'
import re,json
p='web/index.html'; s=open(p,encoding='utf8').read()
s=s.replace('<script src="/af-android.js"></script>','<script src="/af-webshim.js"></script>\n  <script src="/af-android.js"></script>',1)
open(p,'w',encoding='utf8').write(s)
m=json.load(open('web/manifest.webmanifest',encoding='utf8'))
m['icons']=[{"src":"/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"/icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"},{"src":"/school-install-icon.svg","sizes":"any","type":"image/svg+xml"}]
json.dump(m,open('web/manifest.webmanifest','w',encoding='utf8'),ensure_ascii=False,indent=2)
P
python3 - "$PREFIX" <<'P'
import re,sys,glob,json
pre=sys.argv[1]
if pre:
    pat=re.compile(r"""(["'(])/(af-[a-z0-9]+\.js|fonts/|vendor/|sw\.js|manifest\.webmanifest|icon-\d+\.png|school-install-icon\.svg|logo\.jpg|version\.json|index\.html)""")
    for f in glob.glob('web/**/*',recursive=True):
        if f.endswith(('.html','.js','.css')):
            t=open(f,encoding='utf8').read(); n=pat.sub(lambda m:m.group(1)+pre+'/'+m.group(2),t)
            if n!=t: open(f,'w',encoding='utf8').write(n)
    m=json.load(open('web/manifest.webmanifest',encoding='utf8')); m['start_url']=pre+'/'; m['scope']=pre+'/'; m['id']=pre+'/'
    for i in m['icons']: i['src']=pre+i['src']
    json.dump(m,open('web/manifest.webmanifest','w',encoding='utf8'),ensure_ascii=False,indent=2)
    t=open('web/sw.js',encoding='utf8').read().replace("openWindow('/')","openWindow('"+pre+"/')"); open('web/sw.js','w',encoding='utf8').write(t)
P
