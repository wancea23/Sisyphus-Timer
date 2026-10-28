/* Everything around the timer: stats, inscriptions, heroes, trophies, the calendar, the philosopher panel, the breathing guide.
   Each render function does nothing on pages that do not have its section. */
import { S, save, dayKey } from './store.js';
import { $, esc, fmtDate, fmtDur, toast, announce, copyText, download } from './ui.js';
import { RESP, EXAMPLES, HEROES, PANEL, ALLIES, STANCES, TROPHIES } from './data.js';
import { GODS as GODS_EN } from './data-en.js';
import { t, cnt, quoted, LOCALE } from './i18n.js';
import { pluck } from './audio.js';

const MOODS = ['despairing', 'weary', 'lucid', 'content', 'happy'];
export const moodWord = (m) => t('mood.' + MOODS[m < 25 ? 0 : m < 45 ? 1 : m < 65 ? 2 : m < 85 ? 3 : 4]);

/* ---------- stats and the mood chip in the header ---------- */
export function renderStats() {
  const st = S.stats, w = moodWord(st.mood), chip = $('#moodChip');
  if (chip) chip.innerHTML = t('chip', { w: esc(w) });
  if (!$('#sBoulders')) return;
  $('#sBoulders').textContent = st.boulders;
  $('#sTime').textContent = fmtDur(st.workSec);
  $('#sScorn').textContent = st.scorned;
  $('#sScornN').textContent = cnt(st.yielded, 'gaveIn');
  $('#sMood').textContent = w.charAt(0).toUpperCase() + w.slice(1);
  $('#meter').style.width = st.mood + '%';
}

/* ---------- inscriptions ---------- */
export function renderJournal() {
  const list = $('#inscriptions');
  if (!list) return;
  const st = S.stats, own = S.journal.length > 0, items = own ? S.journal : EXAMPLES;
  $('#tally').textContent = own
    ? t('journal.counts', { c: cnt(S.journal.length, 'insc'), r: st.revolt || 0, h: st.hope || 0, e: st.escape || 0 })
    : t('journal.empty');
  $('#exportRow').hidden = !own;
  list.innerHTML = items.map((e) => {
    const ch = RESP[e.choice] ? e.choice : 'hope';
    const when = e.example ? '<span class="ex">' + t('example') + '</span>' : '<time>' + esc(fmtDate(e.t)) + '</time>';
    const task = e.task ? '<span class="task">' + esc(e.task) + '</span>' : '';
    const body = e.why ? esc(quoted(e.why)) : '<span class="none">' + t('noAnswer') + '</span>';
    return '<li><div class="meta"><span class="n">' + t('boulderN', { n: Number(e.n) || 0 }) + '</span><span class="tag ' + ch + '">' + RESP[ch].tag + '</span>' + task + when + '</div><p>' + body + '</p></li>';
  }).join('');
}

function journalText() {
  const st = S.stats;
  const lines = [
    t('exp.title'),
    t('exp.stats', { b: st.boulders, t: fmtDur(st.workSec), w: moodWord(st.mood) }),
    t('exp.counts', { r: st.revolt || 0, h: st.hope || 0, e: st.escape || 0 }),
    '',
  ];
  S.journal.forEach((e) => {
    lines.push(t('boulderN', { n: e.n }) + ' · ' + (RESP[e.choice] ? RESP[e.choice].tag : '') + ' · ' + fmtDate(e.t) + (e.task ? ' · ' + e.task : ''));
    lines.push(e.why ? quoted(e.why) : t('exp.none'));
    lines.push('');
  });
  return lines.join('\n');
}

export function initJournalExport() {
  if (!$('#copyJournal')) return;
  $('#copyJournal').addEventListener('click', async () => {
    toast((await copyText(journalText())) ? t('copied') : t('copyFail'));
  });
  $('#downloadJournal').addEventListener('click', () => {
    download(t('exp.file') + dayKey() + '.txt', new Blob([journalText()], { type: 'text/plain;charset=utf-8' }));
  });
}

/* ---------- heroes ---------- */
export const heroUnlocked = (h) => S.stats.boulders >= h.unlock || S.settings.preset === 'demo';

export function renderHeroes() {
  const grid = $('#heroes');
  if (!grid) return;
  grid.innerHTML = HEROES.map((h) => {
    const open = heroUnlocked(h), on = S.settings.hero === h.id;
    return '<button type="button" class="hero' + (on ? ' on' : '') + '" data-hero="' + h.id + '"' + (open ? '' : ' disabled') + ' aria-pressed="' + on + '">' +
      '<span class="hero-gr">' + esc(h.label) + '</span><b>' + esc(h.name) + '</b>' +
      (open ? '<span class="hero-line">' + esc(h.line) + '</span><q>' + esc(h.quote) + '</q><span class="hero-ch">' + esc(t('hero.from', { c: h.chapter })) + '</span>'
        : '<span class="hero-lock">' + esc(t('hero.locked', { n: h.unlock, de: '' })) + '</span>') +
      (on ? '<span class="hero-on">' + t('hero.on') + '</span>' : '') + '</button>';
  }).join('');
}

export function initHeroes() {
  const grid = $('#heroes');
  if (!grid) return;
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hero]');
    if (!b || b.disabled) return;
    S.settings.hero = b.getAttribute('data-hero');
    save(); renderHeroes();
    toast(t('hero.takes', { name: HEROES.find((x) => x.id === S.settings.hero).name }));
  });
}

export function heroesUnlockedBetween(before, after) {
  return HEROES.filter((h) => h.unlock > 0 && before < h.unlock && after >= h.unlock);
}

/* ---------- trophies ---------- */
export function unlock(ids) {
  const fresh = ids.filter((id) => !S.stats.trophies[id] && TROPHIES.some((tr) => tr.id === id));
  if (!fresh.length) return;
  fresh.forEach((id) => { S.stats.trophies[id] = Date.now(); });
  save(); renderTrophies();
  const names = fresh.map((id) => TROPHIES.find((tr) => tr.id === id).name).join(', ');
  setTimeout(() => {
    toast(t(fresh.length === 1 ? 'trophy.one' : 'trophy.many', { names }));
    announce(t('trophy.announce', { names }));
    pluck([523.25, 659.25, 783.99], 0.09, 0.07);
  }, 900);
}

export function streak() {
  const days = S.stats.days, d = new Date();
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* Trophies that follow from the saved stats. Event trophies (unmoved, descent, night, dawn, deep, chorus) unlock where they happen. */
export function checkTrophies() {
  const st = S.stats, ids = [];
  if (st.boulders >= 1) ids.push('first');
  if (st.boulders >= 10) ids.push('ten');
  if (st.boulders >= 50) ids.push('fifty');
  /* Scorned gods are stored by Greek name; older saves used English names. */
  const greek = new Set(st.gods.map((n) => (GODS_EN.find((g) => g.name === n) || { gr: n }).gr));
  if (greek.size >= 8) ids.push('pantheon');
  if (st.revoltRun >= 3) ids.push('revolt3');
  if (st.carved >= 5) ids.push('carver');
  if (st.mood >= 85) ids.push('happy');
  if (st.boulders >= 15) ids.push('heroes');
  if (streak() >= 3) ids.push('streak');
  unlock(ids);
}

export function renderTrophies() {
  const list = $('#trophies');
  if (!list) return;
  const got = S.stats.trophies, n = TROPHIES.filter((tr) => got[tr.id]).length;
  $('#trophyCount').textContent = t('trophy.count', { n, m: TROPHIES.length });
  list.innerHTML = TROPHIES.map((tr) => {
    const on = !!got[tr.id];
    return '<li class="trophy' + (on ? ' on' : '') + '"><span class="medal" aria-hidden="true">' + tr.gl + '</span><span><b>' + esc(tr.name) + '</b><span>' +
      esc(tr.desc) + '</span></span><span class="sr-only">' + t(on ? 'unlocked' : 'locked') + '</span></li>';
  }).join('');
}

/* ---------- mountain calendar ---------- */
export function renderCalendar() {
  const cal = $('#calendar');
  if (!cal) return;
  const span = Number(cal.getAttribute('data-days')) || 28, days = S.stats.days, cells = [], today = new Date();
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const n = Number(days[dayKey(d)]) || 0, lvl = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4;
    const label = t('cal.day', { date: d.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' }), b: cnt(n, 'boulders') });
    cells.push('<span class="day l' + lvl + (i === 0 ? ' today' : '') + '" title="' + esc(label) + '" role="img" aria-label="' + esc(label) + '"></span>');
  }
  cal.innerHTML = cells.join('');
  const active = Object.keys(days).filter((k) => days[k] > 0).length;
  $('#calNote').textContent = t('cal.note', { s: cnt(streak(), 'days'), a: cnt(active, 'days') });
}

export function markDay() {
  const k = dayKey();
  S.stats.days[k] = (Number(S.stats.days[k]) || 0) + 1;
  const keys = Object.keys(S.stats.days).sort();
  while (keys.length > 400) delete S.stats.days[keys.shift()];
}

/* ---------- the philosopher panel ---------- */
export function renderPanel() {
  const list = $('#panel');
  if (!list) return;
  list.innerHTML = PANEL.map((p) =>
    '<li class="thinker"><div class="th-head"><span class="mono" aria-hidden="true">' + esc(p.name.charAt(0)) + '</span><div><b>' + esc(p.name) + '</b><span>' + esc(p.school) +
    '</span></div><span class="stance ' + p.stance + '">' + STANCES[p.stance] + '</span></div><q>' + esc(p.quote) + '</q><cite>' + esc(p.source) +
    '</cite><p><span class="says">' + t('panel.to') + '</span> ' + esc(p.says) + '</p></li>').join('');
}

export function alliesHTML(choice) {
  const a = ALLIES[choice];
  if (!a) return '';
  const find = (id) => PANEL.find((p) => p.id === id), foe = find(a.against);
  return '<p class="allies"><b>' + t('allies.with') + '</b> ' + a.with.map((id) => esc(find(id).name)).join(', ') + '.</p>' +
    '<p class="allies"><b>' + t('allies.against') + '</b> ' + esc(foe.name) + ', ' + esc(quoted(foe.quote)) + '</p>';
}

export const panelVoice = (i) => PANEL[i % PANEL.length];

/* ---------- breathing guide for the descent ---------- */
let breathTimer = 0, breathStart = 0;
export function setBreathing(on) {
  const box = $('#breath');
  if (!box) return;
  if (!on) { box.hidden = true; clearInterval(breathTimer); breathTimer = 0; return; }
  if (breathTimer) return;
  box.hidden = false;
  breathStart = Date.now();
  const ring = $('#breathRing');
  ring.style.animation = 'none'; void ring.offsetWidth; ring.style.animation = '';
  const tickBreath = () => { $('#breathLabel').textContent = t('breath.' + Math.floor(((Date.now() - breathStart) % 16000) / 4000)); };
  tickBreath();
  breathTimer = setInterval(tickBreath, 250);
}
