// مركبات بنظرة من الأعلى: سيارة، دراجة نارية، دراجة هوائية براكبها، ومشي (كلها تتجه للأعلى = الأمام)
const SH = (rx, ry) => `<ellipse cx="23" cy="44" rx="${rx}" ry="${ry}" fill="#000" opacity=".2"/>`;
const SVG = (cls, body) => `<svg class="vs vs-${cls}" viewBox="0 0 44 80" width="44" height="80" aria-hidden="true">${body}</svg>`;
const S = {
  car: SVG('car', `${SH(19, 36)}
    <g fill="#161616"><rect x="2" y="15" width="6" height="14" rx="2.5"/><rect x="36" y="15" width="6" height="14" rx="2.5"/><rect x="2" y="52" width="6" height="14" rx="2.5"/><rect x="36" y="52" width="6" height="14" rx="2.5"/></g>
    <rect x="1" y="31" width="4" height="3" rx="1" fill="#b02525"/><rect x="39" y="31" width="4" height="3" rx="1" fill="#b02525"/>
    <path d="M8 12 Q22 2 36 12 L38 28 L38 60 Q38 74 31 76 L13 76 Q6 74 6 60 L6 28 Z" fill="#e03131" stroke="#8f1d1d" stroke-width="1"/>
    <path d="M12 14 Q22 9 32 14" stroke="#ff9a9a" fill="none" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M11 29 Q22 24 33 29 L31.5 40 L12.5 40 Z" fill="#bfe3ff" stroke="#6b93b8" stroke-width=".8"/>
    <rect x="12.5" y="40" width="19" height="15" rx="3.5" fill="#c92a2a"/>
    <path d="M12.5 55 L31.5 55 L33 62 Q22 66 11 62 Z" fill="#9cc7ee"/>
    <ellipse cx="12" cy="10.5" rx="3.3" ry="2" fill="#fff8b5"/><ellipse cx="32" cy="10.5" rx="3.3" ry="2" fill="#fff8b5"/>
    <rect x="9" y="73.5" width="7" height="2.6" rx="1" fill="#ff2b2b"/><rect x="28" y="73.5" width="7" height="2.6" rx="1" fill="#ff2b2b"/>`),
  moto: SVG('moto', `${SH(10, 35)}
    <rect x="19.5" y="3" width="5" height="19" rx="2.5" fill="#1a1a1a"/><rect x="19.5" y="58" width="5" height="19" rx="2.5" fill="#1a1a1a"/>
    <ellipse cx="22" cy="31" rx="7.2" ry="11" fill="#1d6fe0" stroke="#124a9a" stroke-width="1"/>
    <rect x="17" y="44" width="10" height="13" rx="4" fill="#222"/>
    <line x1="10" y1="22" x2="34" y2="22" stroke="#222" stroke-width="3" stroke-linecap="round"/>
    <path d="M14.5 40 Q10 32 11 23 M29.5 40 Q34 32 33 23" stroke="#2b2f3a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="11" cy="22" r="2.6" fill="#f1c27d"/><circle cx="33" cy="22" r="2.6" fill="#f1c27d"/>
    <ellipse cx="22" cy="46" rx="9.5" ry="11" fill="#2b2f3a"/>
    <circle cx="22" cy="37" r="6.8" fill="#f08c00" stroke="#b35f00" stroke-width="1"/><path d="M17.5 34 Q22 31.5 26.5 34" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="5" r="2.6" fill="#fff8b5"/><rect x="19" y="75" width="6" height="2.4" rx="1" fill="#ff2b2b"/>`),
  bike: SVG('bike', `${SH(13, 34)}
    <ellipse cx="22" cy="14" rx="3.4" ry="12" fill="none" stroke="#1f1f1f" stroke-width="2.6"/><ellipse class="wr" cx="22" cy="14" rx="3.4" ry="12" fill="none" stroke="#fff" stroke-width="1.1" stroke-dasharray="2 6"/>
    <ellipse cx="22" cy="63" rx="3.4" ry="12" fill="none" stroke="#1f1f1f" stroke-width="2.6"/><ellipse class="wr" cx="22" cy="63" rx="3.4" ry="12" fill="none" stroke="#fff" stroke-width="1.1" stroke-dasharray="2 6"/>
    <line x1="22" y1="20" x2="22" y2="54" stroke="#555" stroke-width="2.6" stroke-linecap="round"/>
    <line x1="10.5" y1="25" x2="33.5" y2="25" stroke="#222" stroke-width="3" stroke-linecap="round"/>
    <ellipse class="l1" cx="17.5" cy="49" rx="3.8" ry="8" fill="#243b6b"/><ellipse class="l2" cx="26.5" cy="49" rx="3.8" ry="8" fill="#243b6b"/>
    <ellipse cx="22" cy="40" rx="8.8" ry="12" fill="#e8590c" stroke="#b34006" stroke-width="1"/>
    <path d="M14.5 36 Q10.5 31 11.5 25.5 M29.5 36 Q33.5 31 32.5 25.5" stroke="#f1c27d" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="29" r="5.8" fill="#ffd43b" stroke="#c99a00" stroke-width="1"/><path d="M18 27 Q22 24.5 26 27" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),
  walk: SVG('walk', `${SH(12, 22)}
    <ellipse class="l1" cx="17" cy="56" rx="4.2" ry="7.5" fill="#2f3542"/><ellipse class="l2" cx="28" cy="56" rx="4.2" ry="7.5" fill="#2f3542"/>
    <ellipse class="a1" cx="9" cy="42" rx="3.6" ry="9" fill="#f1c27d"/><ellipse class="a2" cx="36" cy="42" rx="3.6" ry="9" fill="#f1c27d"/>
    <ellipse cx="22.5" cy="42" rx="11.5" ry="8.5" fill="#1d6fe0" stroke="#124a9a" stroke-width="1"/>
    <circle cx="22.5" cy="38" r="7" fill="#3b2a20"/><path d="M18 35.5 Q22.5 33 27 35.5" stroke="#6b4a36" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)
};
export const sprite = key => S[key] || S.car;
// حجم المركبة يتناسب مع التقريب حتى تبقى واضحة على الطريق
export const vehScale = z => Math.min(1.9, Math.max(0.5, 2 ** (z - 17.4) * 0.9));
