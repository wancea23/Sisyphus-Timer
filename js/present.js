/* Presenter mode: full-screen slides with the live timer and the class vote embedded as pages.
   Keys: arrows, Space, Page Up/Down, Home/End. N toggles speaker notes, F toggles fullscreen. */
import { $, $$ } from './ui.js';
import { drawQr } from './classroom.js';

const slides = $$('.slide');
let current = 0;

function go(n) {
  current = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((s, k) => { s.hidden = k !== current; });
  const slide = slides[current];
  $('#count').textContent = (current + 1) + ' / ' + slides.length;
  $('#bar').style.width = ((current + 1) / slides.length) * 100 + '%';
  $('#prev').disabled = current === 0;
  $('#next').disabled = current === slides.length - 1;
  const frame = slide.querySelector('iframe[data-src]');
  if (frame && !frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
  const notes = slide.querySelector('.notes');
  $('#notesText').innerHTML = notes ? notes.innerHTML : '';
  history.replaceState(null, '', '#' + (current + 1));
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
}

$('#prev').addEventListener('click', () => go(current - 1));
$('#next').addEventListener('click', () => go(current + 1));
$('#full').addEventListener('click', toggleFullscreen);
$('#notesBtn').addEventListener('click', () => {
  const box = $('#notes');
  box.hidden = !box.hidden;
  $('#notesBtn').setAttribute('aria-pressed', String(!box.hidden));
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.target.closest('button, a'))) { e.preventDefault(); go(current + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(slides.length - 1);
  else if (e.key === 'n' || e.key === 'N') $('#notesBtn').click();
  else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
});

/* Swipe on touch screens, outside the embedded pages. */
let startX = null;
$('#deck').addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
$('#deck').addEventListener('pointerup', (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (Math.abs(dx) > 60) go(current + (dx < 0 ? 1 : -1));
});

const site = location.origin + location.pathname.replace(/[^/]*$/, '');
const qrBox = $('#siteQr');
if (qrBox) drawQr(qrBox, site, qrBox.getAttribute('data-label') || '');
const urlBox = $('#siteUrl');
if (urlBox) urlBox.textContent = location.host + location.pathname.replace(/[^/]*$/, '');

go((parseInt(location.hash.slice(1), 10) || 1) - 1);
