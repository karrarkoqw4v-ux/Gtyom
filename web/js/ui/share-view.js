// شاشة المشاركة: صورة البنايات + العنوان + الرابط، وأزرار الواتساب والتلغرام وغيرها
import { el } from '../core/dom.js';
import { openView, setMini } from './sheet.js';
import { map } from '../map/map.js';
import { reverse } from '../places/search.js';
import { composeCard, messageText, placeLink, waitIdle } from '../share/share.js';
import { toast } from './toast.js';
import { icon } from './icons.js';

export async function showShare(p) {
  const body = el('div', {}, el('div', { class: 'spinner' }), el('p', { class: 'muted', style: 'text-align:center' }, 'نجهّز صورة ثلاثية الأبعاد للموقع…'));
  openView('مشاركة الموقع', body);
  try {
    map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 17.2), pitch: 60, duration: 900, padding: { top: 0, bottom: 0, left: 0, right: 0 } });
    await new Promise(r => { map.once('moveend', r); setTimeout(r, 1500); });
    await waitIdle();
    let address = p.address || '';
    if (!address) { try { address = (await reverse(p.lng, p.lat))?.display_name || ''; } catch {} }
    const blob = await composeCard(p, address), url = URL.createObjectURL(blob);
    const file = new File([blob], 'khartkum-location.jpg', { type: 'image/jpeg' });
    const text = messageText(p, address), link = placeLink(p);
    const share = async () => {
      try {
        if (window.Android?.shareText) { window.Android.shareText('موقع ' + p.name, text); return; }
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'موقع ' + p.name, text, files: [file] });
        else if (navigator.share) await navigator.share({ title: 'موقع ' + p.name, text });
        else { await navigator.clipboard.writeText(text); toast('تم نسخ الرسالة'); }
      } catch (e) { if (e.name !== 'AbortError') toast('ما قدرنا نفتح المشاركة'); }
    };
    const open = u => window.open(u, '_blank', 'noopener');
    const copy = async (t, m) => { try { await navigator.clipboard.writeText(t); toast(m); } catch { toast('ما قدرنا ننسخ'); } };
    const b = (ic, t, fn, cls = '') => el('button', { class: 'btn ' + cls, onclick: fn }, icon(ic, { size: 20, anim: '' }), t);
    body.replaceChildren(
      el('img', { class: 'share-img', src: url, alt: 'صورة الموقع' }),
      el('pre', { class: 'share-text' }, text),
      b('share', 'مشاركة (كل التطبيقات مع الصورة)', share, 'primary block'),
      el('div', { class: 'btn-row' },
        b('chat', 'واتساب', () => open('https://wa.me/?text=' + encodeURIComponent(text))),
        b('send', 'تلغرام', () => open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text.split('\n\n')[0])}`))),
      el('div', { class: 'btn-row' },
        b('link', 'نسخ الرابط', () => copy(link, 'تم نسخ الرابط')),
        el('a', { class: 'btn', href: url, download: 'khartkum-location.jpg' }, icon('photo', { size: 20, anim: '' }), 'حفظ الصورة')));
  } catch (e) {
    body.replaceChildren(el('p', { class: 'muted' }, 'ما قدرنا نجهّز الصورة، جرّب مرة ثانية.'));
  }
}
