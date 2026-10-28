/* The shared header: Sisyphus' mood, and on pages other than the timer a badge that keeps a running session visible. */
import { store } from './store.js';
import { $, fmtS } from './ui.js';
import { renderStats } from './features.js';

export function initNav(current) {
  renderStats();
  if (current !== 'timer') runBadge();
}

function runBadge() {
  const run = store.get('run', null), badge = $('#runPill');
  if (!badge || !run || !run.phase || run.phase === 'ready') return;
  const paint = () => {
    if (run.phase === 'work' || run.phase === 'break') {
      const ms = run.running ? Math.max(0, run.endAt - Date.now()) : run.remaining;
      const what = run.phase === 'work' ? 'Pushing' : 'The descent';
      badge.textContent = ms > 0 ? fmtS(Math.ceil(ms / 1000)) + ' · ' + what + (run.running ? '' : ' · Paused') : 'Time is up · Back to the rock';
    } else badge.textContent = 'The rock is waiting for you';
  };
  badge.hidden = false;
  paint();
  setInterval(paint, 1000);
}
