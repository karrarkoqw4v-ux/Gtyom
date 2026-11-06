#!/bin/sh
# يبني نسخة الموقع (قابلة للتثبيت كتطبيق PWA) في alfarabi/web
cd "$(dirname "$0")" || exit 1
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
