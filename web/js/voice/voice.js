// التوجيه الصوتي بالعربي
import { state } from '../core/state.js';
import { prefs } from '../core/prefs.js';
let voice = null;
function pick() {
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => v.lang === 'ar-IQ') || vs.find(v => v.lang?.startsWith('ar')) || null;
}
if ('speechSynthesis' in window) { pick(); speechSynthesis.onvoiceschanged = pick; }

export function speak(text, urgent = false) {
  if (!state.voice || !('speechSynthesis' in window) || !text) return;
  if (urgent) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang || 'ar-SA';
  if (voice) u.voice = voice;
  u.rate = prefs().voiceRate; u.pitch = 1;
  speechSynthesis.speak(u);
}
export function stopVoice() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
export const hasArabicVoice = () => !!voice;
