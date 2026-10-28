/* The timer page: a small state machine (ready -> work -> rolling -> reflect -> break -> ready) and its wiring. */
import { S, store, save, saveRun, bumpMood, resetStats, applyPreset, remainingNow, progress, ROLL_MS, PHASES } from './store.js';
import { $, $$, clamp, esc, fmtS, fmt, toast, announce, openDialog } from './ui.js';
import { Q, PROMPTS, GODS, RESP } from './data.js';
import { t, quoted } from './i18n.js';
import { ensureAudio, pluck, rumble, setAmbience } from './audio.js';
import { initScene, draw, view, strike, heroOf } from './scene.js';
import { renderStats, heroUnlocked, heroesUnlockedBetween, unlock, checkTrophies, alliesHTML, panelVoice, setBreathing, markDay } from './features.js';
import { room, heartbeat, onBoulder as classBoulder, sendVote } from './classroom.js';
import { initNav } from './nav.js';

const params = new URLSearchParams(location.search);
/* Old QR links pointed at /?join=CODE; joining now happens on the class page. */
if (params.get('join')) location.replace('class.html?join=' + encodeURIComponent(params.get('join')));

const run = (S.run = {
  phase: 'ready', running: false, endAt: 0, remaining: S.settings.work * 1000, total: S.settings.work * 1000, brkTotal: S.settings.brk * 1000,
  workClock: 0, nextGod: 0, god: null, rollStart: 0, hiddenAt: 0, prompt: 0, lastTick: 0, slips: 0, task: '',
});
const st = S.stats;

/* ---------- screen wake lock ---------- */
let lock = null, wantLock = false;
async function wake(on) {
  wantLock = on;
  try {
    if (on && !lock && 'wakeLock' in navigator && !document.hidden) {
      const l = await navigator.wakeLock.request('screen');
      if (!wantLock || lock) { await l.release(); return; }
      lock = l;
      lock.addEventListener('release', () => { if (lock === l) lock = null; });
    } else if (!on && lock) { const l = lock; lock = null; await l.release(); }
  } catch (e) { lock = null; }
}

/* ---------- "time is up" notifications, only while the tab is in the background ---------- */
async function notify(kind) {
  if (!S.settings.notify || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
  const title = t(kind === 'work' ? 'notify.workTitle' : 'notify.breakTitle');
  const opts = { body: t(kind === 'work' ? 'notify.workBody' : 'notify.breakBody'), icon: '/icon-192.png', badge: '/icon-192.png', tag: 'sisyphus' };
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg) await reg.showNotification(title, opts); else new Notification(title, opts);
  } catch (e) {
    try { new Notification(title, opts); } catch (x) { /* not allowed here */ }
  }
}

/* ---------- rendering ---------- */
let lastClock = '', shownQuarter = -1, shownQuote = '', armed = 0;
function setQuote(q) {
  if (q === shownQuote) return;
  shownQuote = q;
  const el = $('#quote');
  el.textContent = quoted(q);
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
}
function renderClock() {
  const ms = run.phase === 'rolling' || run.phase === 'reflect' ? 0 : remainingNow();
  const txt = fmtS(Math.ceil(ms / 1000));
  if (txt !== lastClock) {
    lastClock = txt;
    const el = $('#timer');
    el.innerHTML = Array.from(txt).map((c) => (c === ':' ? '<span class="c">:</span>' : '<span class="d">' + c + '</span>')).join('');
    el.setAttribute('aria-label', t('timer.left', { t: txt }));
    document.title = run.running && run.phase === 'work' ? t('title.pushing', { t: txt }) : run.running && run.phase === 'break' ? t('title.descent', { t: txt }) : run.phase === 'reflect' ? t('title.reflect') : t('title.base');
  }
  if (run.phase === 'work' && run.running) {
    const q = Math.min(3, Math.floor(progress() * 4));
    if (q !== shownQuarter) { shownQuarter = q; setQuote(Q.work[q]); }
  }
}
function updateUI() {
  const ph = run.phase, pBtn = $('#primary'), sBtn = $('#secondary'), hero = heroOf();
  let label = '', quote = '', prim = '', sec = '', prompt = '', voice = null;
  if (ph === 'ready') {
    label = t('ready.label', { n: st.boulders + 1 });
    quote = hero.id !== 'sisyphus' ? hero.quote : st.boulders ? Q.ready : Q.first;
    prim = t('btn.push');
  } else if (ph === 'work') {
    label = run.running ? t('work.label', { n: st.boulders + 1 }) + (run.task ? ' · ' + run.task : '') : t('work.paused');
    quote = run.running ? Q.work[Math.min(3, Math.floor(progress() * 4))] : Q.paused;
    prim = t(run.running ? 'btn.pause' : 'btn.resume'); sec = t('btn.abandon');
  } else if (ph === 'rolling' || ph === 'reflect') {
    label = t('roll.label', { n: st.boulders }); quote = Q.rolling;
  } else if (ph === 'break') {
    label = t(run.running ? 'break.label' : 'break.paused');
    quote = Q.brk[run.prompt % 2]; prompt = PROMPTS[run.prompt % PROMPTS.length]; voice = panelVoice(run.prompt);
    prim = t(run.running ? 'btn.pause' : 'btn.resume'); sec = t('btn.skip');
  }
  shownQuarter = ph === 'work' && run.running ? Math.min(3, Math.floor(progress() * 4)) : -1;
  $('#phase').textContent = label;
  setQuote(quote);
  pBtn.hidden = !prim; pBtn.textContent = prim;
  sBtn.hidden = !sec;
  if (!(ph === 'work' && Date.now() - armed < 3000)) sBtn.textContent = sec;
  $('#prompt').hidden = !prompt; $('#prompt').textContent = prompt;
  $('#voice').hidden = !voice;
  if (voice) $('#voice').innerHTML = '<span>' + t('voice.from') + '</span> <b>' + esc(voice.name) + ':</b> ' + esc(quoted(voice.quote));
  $('#taskRow').hidden = ph !== 'ready';
  $('#settingsNote').hidden = ph === 'ready';
  setAmbience(run.running);
  setBreathing(ph === 'break' && run.running && S.settings.breathe);
  lastClock = '';
  renderClock();
  saveRun();
}

/* ---------- the gods ---------- */
let lastGod = -1;
const scheduleGod = (lo, span) => run.workClock + run.total * (lo + Math.random() * span);
function showGod() {
  let i;
  do { i = Math.floor(Math.random() * GODS.length); } while (i === lastGod);
  lastGod = i;
  const dur = Math.min(12000, run.total * 0.25);
  run.god = { i, until: Date.now() + dur, dur };
  renderGod(); saveRun();
  announce(t('god.announce', { name: GODS[i].name, line: GODS[i].line }));
  pluck([1046.5, 1318.5], 0.09, 0.05);
}
function renderGod() {
  const el = $('#god');
  if (!run.god || !run.running) { el.hidden = true; return; }
  const g = GODS[run.god.i];
  $('#godGr').textContent = g.gr;
  $('#godWho').textContent = g.name + ', ' + g.role;
  $('#godLine').textContent = g.line;
  const bar = $('#godBar'), left = Math.max(0, run.god.until - Date.now());
  bar.style.animation = 'none'; void bar.offsetWidth;
  bar.style.setProperty('--from', String(clamp(left / run.god.dur, 0, 1)));
  bar.style.animation = 'drain ' + left + 'ms linear forwards';
  el.hidden = false;
}
function slip() {
  const want = Math.max(1000, Math.round((run.total * 0.08) / 1000) * 1000);
  const before = remainingNow(), after = Math.min(run.total, before + want), added = after - before;
  run.remaining = after;
  if (run.running) run.endAt = Date.now() + after;
  run.slips++;
  rumble(0.6, 420, 0.25);
  return added;
}
function dismissGod(kind) {
  if (!run.god) return;
  const g = GODS[run.god.i];
  run.god = null; renderGod();
  if (kind === 'yield') {
    st.yielded++; bumpMood(-5); strike();
    const ms = slip();
    toast(ms > 0 ? t('god.yield', { t: fmt(ms) }) : t('god.yield0'));
  } else {
    st.scorned++; bumpMood(kind === 'scorn' ? 3 : 2);
    if (!st.gods.includes(g.gr)) st.gods.push(g.gr);
    toast(t(kind === 'scorn' ? 'god.scorn' : 'god.ignored', { name: g.name }));
    checkTrophies();
  }
  run.nextGod = scheduleGod(0.18, 0.14);
  save(); saveRun(); renderStats();
}

/* ---------- phases ---------- */
function resume() {
  run.running = true; run.endAt = Date.now() + run.remaining; run.lastTick = Date.now();
  if (run.god && run.god.left != null) { run.god.until = Date.now() + run.god.left; delete run.god.left; }
  if (run.phase === 'work') wake(true);
  updateUI(); renderGod();
}
function pause() {
  run.remaining = remainingNow(); run.running = false;
  if (run.god) run.god.left = Math.max(0, run.god.until - Date.now());
  wake(false); updateUI(); renderGod();
}
function primary() {
  ensureAudio();
  if (run.phase === 'ready') {
    Object.assign(run, { total: S.settings.work * 1000, brkTotal: S.settings.brk * 1000, workClock: 0, god: null, slips: 0, phase: 'work' });
    run.remaining = run.total;
    run.task = $('#task').value.trim().slice(0, 60);
    run.nextGod = scheduleGod(0.18, 0.14);
    const h = new Date().getHours();
    if (h >= 4 && h < 7) unlock(['dawn']);
    pluck([196, 261.63], 0.12, 0.08);
    resume();
  } else if (run.phase === 'work' || run.phase === 'break') {
    if (run.running) pause(); else resume();
  }
}
function toReady() {
  run.phase = 'ready'; run.running = false; run.god = null; renderGod();
  run.total = S.settings.work * 1000; run.remaining = run.total; run.workClock = 0;
  wake(false); updateUI();
}
function secondary() {
  if (run.phase === 'work') {
    if (Date.now() - armed > 3000) {
      armed = Date.now(); $('#secondary').textContent = t('btn.abandonConfirm');
      setTimeout(() => { if (Date.now() - armed >= 3000) updateUI(); }, 3050);
      return;
    }
    armed = 0;
    toReady();
    toast(t('abandoned'));
  } else if (run.phase === 'break') toReady();
}
function completeWork(now) {
  run.running = false; run.remaining = 0;
  if (run.god) { run.god = null; renderGod(); }
  run.phase = 'rolling'; run.rollStart = now;
  const before = st.boulders;
  st.boulders++; st.workSec += Math.round(run.workClock / 1000); bumpMood(2); markDay();
  const h = new Date().getHours(), events = [];
  if (h >= 22 || h < 4) events.push('night');
  if (run.total >= 3000 * 1000) events.push('deep');
  if (run.slips === 0) events.push('unmoved');
  save(); renderStats(); wake(false);
  unlock(events); checkTrophies();
  heroesUnlockedBetween(before, st.boulders).forEach((hr) => setTimeout(() => toast(t('hero.new', { name: hr.name })), 2600));
  classBoulder();
  notify('work');
  rumble(ROLL_MS / 1000, 160, 0.5);
  pluck([329.63, 293.66, 261.63, 220], 0.22, 0.1);
  updateUI();
}

/* ---------- the reflection after each boulder ---------- */
function openReflect() {
  run.phase = 'reflect';
  $('#reflectNo').textContent = t('reflect.no', { n: st.boulders });
  $('#why').value = '';
  $$('input[name=resp]').forEach((r) => { r.checked = false; });
  $('#verdict').hidden = true; $('#allies').innerHTML = '';
  $('#descend').disabled = true; $('#skipDescent').disabled = true;
  $('#shareRow').hidden = !room.code || room.mode === 'test';
  if (room.code) $('#shareLabel').textContent = t('reflect.share', { code: room.code });
  openDialog($('#reflect'));
  updateUI();
}
function saveReflection() {
  const sel = document.querySelector('input[name=resp]:checked');
  if (!sel || !RESP[sel.value]) return false;
  const why = $('#why').value.trim().slice(0, 500);
  S.journal.unshift({ n: st.boulders, why, choice: sel.value, t: Date.now(), task: run.task || '' });
  S.journal = S.journal.slice(0, 300);
  st[sel.value] = (st[sel.value] || 0) + 1;
  st.revoltRun = sel.value === 'revolt' ? (st.revoltRun || 0) + 1 : 0;
  if (why) st.carved = (st.carved || 0) + 1;
  bumpMood(RESP[sel.value].mood);
  if (room.code && $('#shareClass').checked) sendVote(sel.value, why.slice(0, 160));
  save(); renderStats(); checkTrophies();
  $('#reflect').close();
  return true;
}
function startBreak() {
  run.phase = 'break'; run.total = run.brkTotal || S.settings.brk * 1000; run.remaining = run.total;
  run.prompt = Math.floor(Math.random() * 35);
  resume();
}
function endBreak() {
  unlock(['descent']);
  notify('break');
  pluck([261.63, 329.63, 392, 523.25], 0.18, 0.1);
  toReady();
}

let lastSave = 0;
function tick() {
  const now = Date.now(), dt = run.lastTick ? now - run.lastTick : 0;
  run.lastTick = now;
  if (run.running) {
    const before = run.remaining;
    run.remaining = Math.max(0, run.endAt - now);
    if (run.phase === 'work') {
      run.workClock += Math.min(dt, before);
      if (S.settings.gods && !run.god && run.nextGod && run.workClock >= run.nextGod && run.remaining > run.total * 0.1) showGod();
      if (run.god && now >= run.god.until) dismissGod('ignored');
      if (run.remaining <= 0) completeWork(now);
    } else if (run.phase === 'break' && run.remaining <= 0) endBreak();
  }
  if (run.phase === 'rolling' && now - run.rollStart >= ROLL_MS) openReflect();
  if (run.running && now - lastSave > 5000) { lastSave = now; saveRun(); }
  renderClock();
}

let lastFrame = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const idle = !run.running && run.phase !== 'rolling' && view.settled;
  if (lastFrame && ts - lastFrame < (idle ? 90 : 32)) return;
  const dt = lastFrame ? Math.min(0.1, (ts - lastFrame) / 1000) : 0.016;
  lastFrame = ts;
  tick();
  draw(dt, ts / 1000);
}

/* ---------- settings ---------- */
function syncSettingsForm() {
  const s = S.settings;
  $$('input[name=preset]').forEach((r) => { r.checked = r.value === s.preset; });
  $('#cWork').value = s.cWork; $('#cBrk').value = s.cBrk;
  const custom = s.preset === 'custom';
  $('#customRow').classList.toggle('off', !custom);
  $('#cWork').disabled = !custom; $('#cBrk').disabled = !custom;
  [['#tGods', 'gods'], ['#tStrict', 'strict'], ['#tSound', 'sound'], ['#tAmb', 'ambience'], ['#tBreathe', 'breathe']].forEach(([id, k]) => { $(id).checked = !!s[k]; });
  $('#tNotify').checked = !!s.notify && 'Notification' in window && Notification.permission === 'granted';
  $('#settingsNote').hidden = run.phase === 'ready';
}
function settingsChanged() {
  applyPreset();
  if (!heroUnlocked(heroOf())) S.settings.hero = 'sisyphus';
  save();
  if (run.phase === 'ready') { run.total = S.settings.work * 1000; run.remaining = run.total; lastClock = ''; renderClock(); saveRun(); }
  syncSettingsForm();
}

/* ---------- wiring ---------- */
function wire() {
  $('#primary').addEventListener('click', primary);
  $('#secondary').addEventListener('click', secondary);
  $('#scorn').addEventListener('click', () => dismissGod('scorn'));
  $('#yield').addEventListener('click', () => dismissGod('yield'));

  $$('input[name=resp]').forEach((r) => r.addEventListener('change', () => {
    const v = RESP[r.value];
    $('#vQuote').textContent = v.quote; $('#vNote').textContent = v.note; $('#allies').innerHTML = alliesHTML(r.value);
    $('#verdict').hidden = false; $('#descend').disabled = false; $('#skipDescent').disabled = false;
  }));
  $('#descend').addEventListener('click', () => { if (saveReflection()) { startBreak(); $('#primary').focus({ preventScroll: true }); } });
  $('#skipDescent').addEventListener('click', () => { if (saveReflection()) { toReady(); $('#primary').focus({ preventScroll: true }); } });
  $('#reflect').addEventListener('cancel', (e) => e.preventDefault());
  document.addEventListener('pointerdown', ensureAudio, { passive: true });
  window.addEventListener('pagehide', saveRun);

  const dlg = $('#settings');
  $('#openSettings').addEventListener('click', () => { syncSettingsForm(); openDialog(dlg); });
  $('#closeSettings').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $$('input[name=preset]').forEach((r) => r.addEventListener('change', () => { S.settings.preset = r.value; settingsChanged(); }));
  [['cWork', 25, 180], ['cBrk', 5, 60]].forEach(([id, def, max]) => {
    $('#' + id).addEventListener('change', (e) => { S.settings[id] = clamp(Math.round(Number(e.target.value)) || def, 1, max); settingsChanged(); });
  });
  $('#tGods').addEventListener('change', (e) => { S.settings.gods = e.target.checked; if (!S.settings.gods && run.god) { run.god = null; renderGod(); } save(); });
  $('#tStrict').addEventListener('change', (e) => { S.settings.strict = e.target.checked; save(); });
  $('#tSound').addEventListener('change', (e) => { S.settings.sound = e.target.checked; if (S.settings.sound) { ensureAudio(); pluck([392], 0, 0.08); } save(); setAmbience(run.running); });
  $('#tAmb').addEventListener('change', (e) => { S.settings.ambience = e.target.checked; save(); ensureAudio(); setAmbience(run.running); if (e.target.checked && !run.running) toast(t('amb.later')); });
  $('#tBreathe').addEventListener('change', (e) => { S.settings.breathe = e.target.checked; save(); setBreathing(run.phase === 'break' && run.running && S.settings.breathe); });
  $('#tNotify').addEventListener('change', async (e) => {
    const box = e.target;
    if (!box.checked) { S.settings.notify = false; save(); return; }
    if (!('Notification' in window)) { box.checked = false; toast(t('notify.unsupported')); return; }
    let p = Notification.permission;
    if (p === 'default') { try { p = await Notification.requestPermission(); } catch (x) { p = 'denied'; } }
    if (p !== 'granted') { box.checked = false; S.settings.notify = false; save(); toast(t('notify.denied')); return; }
    S.settings.notify = true; save(); toast(t('notify.on'));
  });
  let eraseArmed = 0;
  $('#erase').addEventListener('click', () => {
    const b = $('#erase');
    if (Date.now() - eraseArmed > 3000) {
      eraseArmed = Date.now(); b.textContent = t('erase.confirm');
      setTimeout(() => { if (Date.now() - eraseArmed >= 3000) b.textContent = t('erase'); }, 3050);
      return;
    }
    eraseArmed = 0;
    resetStats(); S.settings.hero = 'sisyphus'; save();
    renderStats(); updateUI();
    b.textContent = t('erased');
    setTimeout(() => { b.textContent = t('erase'); }, 2000);
  });

  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const tgt = e.target, inside = (sel) => !!(tgt && tgt.closest && tgt.closest(sel));
    if (inside('input, textarea, select, dialog, [contenteditable]')) return;
    if ((e.code === 'KeyS' || e.code === 'KeyY') && run.god && run.running) {
      e.preventDefault(); dismissGod(e.code === 'KeyS' ? 'scorn' : 'yield'); return;
    }
    if (e.code !== 'Space' || inside('button, a')) return;
    if (run.phase === 'rolling' || run.phase === 'reflect') return;
    e.preventDefault(); primary();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (S.settings.strict && run.phase === 'work' && run.running) run.hiddenAt = Date.now();
      saveRun();
      return;
    }
    if (run.hiddenAt && run.phase === 'work' && run.running) {
      const away = Date.now() - run.hiddenAt;
      if (away > 4000) {
        st.yielded++; bumpMood(-4);
        const ms = slip();
        toast(t('strict.slip', { a: fmt(away), b: fmt(ms) }));
        save(); saveRun(); renderStats();
      }
    }
    run.hiddenAt = 0;
    if (run.running && run.phase === 'work') wake(true);
  });
}

/* ---------- boot ---------- */
function boot() {
  const saved = store.get('run', null);
  if (saved && typeof saved === 'object' && PHASES.indexOf(saved.phase) !== -1) {
    Object.assign(run, saved); run.lastTick = 0; run.hiddenAt = 0;
    if (run.god && !GODS[run.god.i]) run.god = null;
    if (typeof run.slips !== 'number') run.slips = 0;
  }
  if (run.task) $('#task').value = run.task;
  initNav('timer'); initScene(); wire();
  syncSettingsForm(); updateUI(); renderGod();
  if (room.code) {
    $('#classBar').hidden = false; $('#cbCode').textContent = room.code;
    heartbeat(45000, (round) => { if (round === null) $('#classBar').hidden = true; });
  }
  if (run.phase === 'reflect') openReflect();
  if (run.running && run.phase === 'work') wake(true);
  draw(10, 0);
  requestAnimationFrame(frame);
  setInterval(tick, 250);
}
boot();
