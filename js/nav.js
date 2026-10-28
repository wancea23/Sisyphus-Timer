/* The shared header: Sisyphus' mood, a badge that keeps a running session visible on other pages,
   embed mode for the presenter's slides, and the offline service worker. */
import { store } from './store.js';
import { $, fmtS } from './ui.js';
import { t } from './i18n.js';
import { renderStats } from './features.js';

export const EMBED = /[?&]embed=1/.test(location.search);

export function initNav(current) {
  if (EMBED) document.body.classList.add('embed');
  renderStats();
  if (current !== 'timer') runBadge();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function runBadge() {
  const run = store.get('run', null), badge = $('#runPill');
  if (!badge || !run || !run.phase || run.phase === 'ready') return;
  const paint = () => {
    if (run.phase === 'work' || run.phase === 'break') {
      const ms = run.running ? Math.max(0, run.endAt - Date.now()) : run.remaining;
      const what = t(run.phase === 'work' ? 'pill.pushing' : 'pill.descent');
      badge.textContent = ms > 0 ? fmtS(Math.ceil(ms / 1000)) + ' · ' + what + (run.running ? '' : ' · ' + t('pill.paused')) : t('pill.up');
    } else badge.textContent = t('pill.waiting');
  };
  badge.hidden = false;
  paint();
  setInterval(paint, 1000);
}
