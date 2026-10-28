/* Small DOM and formatting helpers shared by every module. */

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const pad = (n) => String(n).padStart(2, '0');
export const F = (n) => n.toFixed(1);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export function fmtS(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? h + ':' + pad(m) + ':' + pad(x) : pad(m) + ':' + pad(x);
}
export const fmt = (ms) => fmtS(Math.round(ms / 1000)).replace(/^0(\d:)/, '$1');
export function fmtDur(sec) {
  if (sec < 60) return sec + ' s';
  if (sec < 3600) return Math.round(sec / 60) + ' min';
  return Math.floor(sec / 3600) + ' h ' + Math.round((sec % 3600) / 60) + ' min';
}
export function fmtDate(t) {
  if (!t) return '';
  try {
    const d = new Date(t);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

let toastTimer = 0;
export function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.textContent = ''; }, 6500);
}
export function announce(msg) {
  const el = $('#sr');
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 60);
}

export function openDialog(d) {
  if (d.open) return;
  try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall back below */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}

export function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
