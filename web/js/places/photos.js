// صور المكان من ويكيميديا كومنز (صور حقيقية قريبة من الموقع): نوسّع البحث تدريجياً حتى نجيب أكبر عدد
const cache = new Map();
async function geo(p, radius, limit = 30) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ action: 'query', generator: 'geosearch', ggscoord: `${p.lat}|${p.lng}`, ggsradius: radius, ggslimit: limit, ggsnamespace: 6, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: 900, format: 'json', origin: '*' }).forEach(([k, v]) => u.searchParams.set(k, v));
  try {
    const j = await (await fetch(u)).json();
    return Object.values(j.query?.pages || {}).map(pg => {
      const ii = pg.imageinfo?.[0]; if (!ii?.thumburl || !/\.(jpe?g|png|webp)$/i.test(pg.title)) return null;
      const m = ii.extmetadata || {}, strip = s => String(s || '').replace(/<[^>]+>/g, '').trim();
      return { src: ii.thumburl, full: ii.url, title: (strip(m.ObjectName?.value) || pg.title.replace(/^File:/, '').replace(/\.\w+$/, '')).slice(0, 110), credit: strip(m.Artist?.value).slice(0, 60), page: ii.descriptionurl };
    }).filter(Boolean);
  } catch { return []; }
}
export async function placePhotos(p) {
  const key = (+p.lat).toFixed(4) + ',' + (+p.lng).toFixed(4);
  if (cache.has(key)) return cache.get(key);
  const seen = new Set(), out = [];
  for (const r of [250, 1000, 4000]) {
    (await geo(p, r)).forEach(x => { if (!seen.has(x.src)) { seen.add(x.src); out.push(x); } });
    if (out.length >= 12) break;
  }
  cache.set(key, out.slice(0, 40)); return cache.get(key);
}
