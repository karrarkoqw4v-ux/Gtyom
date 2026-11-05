// معلومات وصور المحافظة من ويكيبيديا العربية
import { CONFIG } from '../config.js';
const cache = new Map();
async function facts(qid) {
  try {
    const j = await (await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`)).json();
    const c = j.entities[qid].claims, t = z => z.qualifiers?.P585?.[0]?.datavalue?.value?.time || '';
    const val = k => (c[k] || []).filter(x => x.mainsnak?.datavalue).sort((a, b) => t(b).localeCompare(t(a)))[0]?.mainsnak.datavalue.value;
    const pop = val('P1082'), area = val('P2046');
    return { population: pop ? Math.round(+pop.amount) : null, area: area && String(area.unit).endsWith('Q712226') ? Math.round(+area.amount) : null };
  } catch { return {}; }
}
export async function provinceInfo(title) {
  if (cache.has(title)) return cache.get(title);
  const t = encodeURIComponent(title);
  const [s, m] = await Promise.allSettled([
    fetch(CONFIG.wikiSummary + t).then(r => r.json()),
    fetch(CONFIG.wikiMedia + t).then(r => r.json())
  ]);
  const sum = s.status === 'fulfilled' ? s.value : {};
  const photos = (m.status === 'fulfilled' ? m.value.items || [] : [])
    .filter(i => i.type === 'image' && i.srcset?.length && !/\.svg/i.test(i.title))
    .slice(0, 8)
    .map(i => ({ src: 'https:' + i.srcset[0].src, caption: i.caption?.text || '' }));
  if (!photos.length && sum.originalimage?.source) photos.push({ src: sum.originalimage.source, caption: '' });
  const info = { title: sum.title || title.replace(/_/g, ' '), text: sum.extract || '', photos, url: sum.content_urls?.mobile?.page, facts: sum.wikibase_item ? await facts(sum.wikibase_item) : {} };
  cache.set(title, info);
  return info;
}
