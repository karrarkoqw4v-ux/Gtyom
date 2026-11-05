// رسائل قصيرة أسفل الشاشة
let t = null;
export function toast(text, ms = 2600) {
  const n = document.getElementById('toast');
  n.textContent = text; n.classList.add('on');
  clearTimeout(t); t = setTimeout(() => n.classList.remove('on'), ms);
}
