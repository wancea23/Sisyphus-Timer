/* Entry point for every page except the timer. <body data-page="..."> picks what to render. */
import { initNav } from './nav.js';
import { $, toast } from './ui.js';
import { renderStats, renderJournal, initJournalExport, renderHeroes, initHeroes, renderTrophies, renderCalendar, renderPanel } from './features.js';

const page = document.body.getAttribute('data-page');
initNav(page);

if (page === 'heroes') {
  renderHeroes(); initHeroes();
} else if (page === 'journal') {
  renderJournal(); initJournalExport();
} else if (page === 'progress') {
  renderStats(); renderTrophies(); renderCalendar();
  $('#shareCard').addEventListener('click', async () => {
    try { const { makeCard } = await import('./share.js'); await makeCard(); } catch (e) { toast('The card could not be drawn in this browser.'); }
  });
} else if (page === 'worldviews') {
  renderPanel();
} else if (page === 'class') {
  import('./classroom.js').then((m) => m.initClassPage());
}
