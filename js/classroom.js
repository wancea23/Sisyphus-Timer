/* Class mode. The core (join, heartbeat, votes, boulders) also runs on the timer page.
   The class page adds the presenter's board (QR code, live results) and the student's answer form.
   A room is either about the rock (escape / hope / revolt) or running the worldview test; the host switches between them. */
import { store, clientId } from './store.js';
import { $, $$, esc, toast } from './ui.js';
import { RESP, CLASS_VERDICT, PANEL, WORLDVIEW } from './data.js';
import { unlock, alliesHTML } from './features.js';
import { runQuiz, resultHTML } from './quiz.js';

const API = '/api/room';
const CODE_RE = /^[A-HJ-NP-Z]{4}$/;
const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
const remembered = store.get('joined', null);
export const room = { code: CODE_RE.test(remembered || '') ? remembered : null, round: 1, mode: 'rock', beat: 0 };
const host = { code: null, key: null, poll: 0, showAnswers: true, mode: 'rock' };

async function call(body, query) {
  const res = await fetch(API + (query || ''), body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { cache: 'no-store' });
  let data = {};
  try { data = await res.json(); } catch (e) { /* not JSON */ }
  if (!res.ok) throw new Error(data.error || 'The class server did not answer. Check your connection.');
  return data;
}

/* ---------- core ---------- */
export async function join(code) {
  code = String(code || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) throw new Error('Codes are 4 letters, like KTRM.');
  const r = await call({ action: 'hello', code, id: clientId() });
  room.code = code; room.round = r.round; room.mode = r.mode || 'rock'; store.set('joined', code);
  unlock(['chorus']);
  return r;
}

export function leave() {
  clearInterval(room.beat);
  room.code = null; store.set('joined', null);
}

/* Keeps this device counted as present. onChange(round, initial) reports the first sync and every new round; round is null when the class is gone. */
export function heartbeat(ms, onChange) {
  clearInterval(room.beat);
  if (!room.code) return;
  let first = true;
  const beat = () => {
    if (document.hidden || !room.code) return;
    call({ action: 'hello', code: room.code, id: clientId() })
      .then((r) => {
        const changed = r.round !== room.round;
        room.round = r.round; room.mode = r.mode || 'rock';
        if (onChange && (first || changed)) onChange(r.round, first);
        first = false;
      })
      .catch((e) => { if (/No class/.test(e.message)) { leave(); if (onChange) onChange(null, first); } });
  };
  beat();
  room.beat = setInterval(beat, ms);
}

export function onBoulder() {
  if (room.code) call({ action: 'boulder', code: room.code, id: clientId() }).catch(() => {});
}

export async function sendVote(choice, why) {
  if (!room.code) return false;
  try {
    await call({ action: 'vote', code: room.code, id: clientId(), choice, why });
    toast('Sent to class ' + room.code + '.');
    return true;
  } catch (e) { toast(e.message); return false; }
}

/* ---------- class page ---------- */
function show(id) {
  ['#classChoose', '#classStudent', '#board'].forEach((s) => { $(s).hidden = s !== id; });
  if (id !== '#board') clearInterval(host.poll);
}

function showChooser(msg) {
  show('#classChoose');
  $('#classErr').textContent = msg || '';
  $('#resumeHost').hidden = !host.code;
  if (host.code) $('#resumeHost').textContent = 'Return to class ' + host.code;
}

/* Student */
function startTest() {
  runQuiz($('#stQuiz'), async (score) => {
    $('#stQuiz').innerHTML = resultHTML(score) + '<div class="controls left"><button class="btn ghost" id="stRetake" type="button">Take it again</button></div>';
    $('#stRetake').addEventListener('click', () => { $('#stStatus').textContent = ''; startTest(); });
    if (await sendVote(score.top, '')) $('#stStatus').textContent = 'Sent. If you take it again, your new result replaces this one.';
  });
}
function resetStudentForm() {
  $('#stInfo').textContent = 'Class ' + room.code + ' · Round ' + room.round + (room.mode === 'test' ? ' · Worldview test' : '');
  $('#stRock').hidden = room.mode === 'test'; $('#stTest').hidden = room.mode !== 'test';
  $('#stStatus').textContent = '';
  if (room.mode === 'test') { startTest(); return; }
  $('#stWhy').value = '';
  $$('input[name=cresp]').forEach((r) => { r.checked = false; });
  $('#stVerdict').hidden = true; $('#stSend').disabled = true;
}
function showStudent() {
  show('#classStudent');
  resetStudentForm();
  let shown = room.mode;
  heartbeat(15000, (round, initial) => {
    if (round === null) { showChooser('That class has ended.'); return; }
    /* The first sync only redraws when the remembered mode was out of date, so an answer already started is kept. */
    if (initial) {
      if (room.mode !== shown) { shown = room.mode; resetStudentForm(); }
      else $('#stInfo').textContent = 'Class ' + room.code + ' · Round ' + round + (room.mode === 'test' ? ' · Worldview test' : '');
      return;
    }
    shown = room.mode;
    resetStudentForm();
    toast(room.mode === 'test' ? 'The class is taking the worldview test now.' : 'New round. You can answer again.');
  });
}
async function joinAndShow(code) {
  $('#classErr').textContent = 'Joining…';
  try { await join(code); showStudent(); toast('You joined class ' + room.code + '.'); }
  catch (e) { showChooser(e.message); }
}

/* Presenter */
function loadQr() {
  if (window.qrcode) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = QR_LIB; s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}
async function drawQr(url) {
  const box = $('#qr');
  if (!(await loadQr()) || !window.qrcode) { box.innerHTML = ''; return; }
  const qr = window.qrcode(0, 'M');
  qr.addData(url); qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
  box.innerHTML = '<svg viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" role="img" aria-label="QR code to join the class"><rect x="-2" y="-2" width="' + (n + 4) +
    '" height="' + (n + 4) + '" class="qr-bg"/><path d="' + d + '" class="qr-fg"/></svg>';
}

function renderTestBoard(data) {
  const ids = PANEL.map((p) => p.id), count = (id) => data.counts[id] || 0;
  const total = ids.reduce((n, id) => n + count(id), 0);
  $('#hBars').innerHTML = PANEL.map((p) => {
    const n = count(p.id), pct = total ? Math.round((n / total) * 100) : 0;
    return '<div class="bar-row ' + p.stance + '"><span class="bl">' + esc(p.short) + '</span><div class="track"><i style="width:' + pct + '%"></i></div><span class="bn">' + n + ' · ' + pct + '%</span></div>';
  }).join('');
  const most = Math.max(...ids.map(count)), tops = PANEL.filter((p) => count(p.id) === most);
  if (!total) $('#hVerdict').textContent = 'Waiting for the first results.';
  else if (tops.length > 1) $('#hVerdict').textContent = 'The class is split between ' + tops.map((p) => p.short).join(' and ') + '. Let them argue it out.';
  else {
    const foe = PANEL.find((p) => p.id === WORLDVIEW[tops[0].id].rival);
    $('#hVerdict').textContent = 'The class sounds most like ' + tops[0].name + '. ' + foe.name + ' would argue back.';
  }
  return total;
}

function renderBoard(data) {
  const test = data.mode === 'test';
  host.mode = data.mode;
  $('#hTitle').textContent = test ? 'Who would push your rock?' : 'Why are you pushing it?';
  $('#hMode').textContent = test ? 'Back to the rock' : 'Worldview test';
  $('#hBars').classList.toggle('seven', test);
  $('#hVotesL').textContent = test ? 'results' : 'answers';
  $('#hShow').hidden = test;
  $('#hWall').hidden = test || !host.showAnswers;
  $('#hRound').textContent = data.round;
  $('#hPeople').textContent = data.people;
  $('#hBoulders').textContent = data.boulders;
  if (test) { $('#hVotes').textContent = renderTestBoard(data); return; }
  const total = data.counts.escape + data.counts.hope + data.counts.revolt;
  $('#hVotes').textContent = total;
  $('#hBars').innerHTML = ['revolt', 'hope', 'escape'].map((c) => {
    const n = data.counts[c], pct = total ? Math.round((n / total) * 100) : 0;
    return '<div class="bar-row ' + c + '"><span class="bl">' + RESP[c].tag + '</span><div class="track"><i style="width:' + pct + '%"></i></div><span class="bn">' + n + ' · ' + pct + '%</span></div>';
  }).join('');
  const top = total ? ['revolt', 'hope', 'escape'].sort((a, b) => data.counts[b] - data.counts[a])[0] : 'none';
  const tie = total && ['revolt', 'hope', 'escape'].filter((c) => data.counts[c] === data.counts[top]).length > 1;
  $('#hVerdict').textContent = tie ? 'The class is split. That is the absurd too.' : CLASS_VERDICT[top];
  const wall = $('#hWall');
  wall.innerHTML = data.answers.length
    ? data.answers.map((a) => '<li class="note-card ' + a.c + '"><span class="tag ' + a.c + '">' + RESP[a.c].tag + '</span><p>“' + esc(a.w) + '”</p>' +
      '<button type="button" class="hide-btn" data-k="' + esc(a.k) + '" aria-label="Hide this answer">Hide</button></li>').join('')
    : '<li class="wall-empty">Written answers will appear here.</li>';
}
async function pollBoard() {
  try { renderBoard(await call(null, '?code=' + host.code)); $('#hErr').textContent = ''; }
  catch (e) {
    $('#hErr').textContent = e.message;
    if (/No class/.test(e.message)) { forgetHost(); showChooser('That class has expired. Start a new one.'); }
  }
}
function showBoard() {
  show('#board');
  const base = location.origin + location.pathname.replace(/[^/]*$/, '');
  $('#hCode').textContent = host.code;
  $('#hUrl').textContent = location.host + location.pathname.replace(/[^/]*$/, '') + 'class.html';
  drawQr(base + 'class.html?join=' + host.code);
  pollBoard();
  clearInterval(host.poll);
  host.poll = setInterval(() => { if (!document.hidden) pollBoard(); }, 2500);
  unlock(['chorus']);
}
function forgetHost() {
  clearInterval(host.poll);
  host.code = null; host.key = null; store.set('host', null);
}

export function initClassPage() {
  const saved = store.get('host', null);
  if (saved && CODE_RE.test(saved.code || '') && typeof saved.key === 'string') { host.code = saved.code; host.key = saved.key; }

  $('#hostBtn').addEventListener('click', async () => {
    $('#classErr').textContent = 'Opening a class…';
    try {
      const r = await call({ action: 'create' });
      host.code = r.code; host.key = r.hostKey; store.set('host', { code: r.code, key: r.hostKey });
      showBoard();
    } catch (e) { $('#classErr').textContent = e.message; }
  });
  $('#resumeHost').addEventListener('click', showBoard);
  $('#joinForm').addEventListener('submit', (e) => { e.preventDefault(); joinAndShow($('#joinCode').value); });

  $$('input[name=cresp]').forEach((r) => r.addEventListener('change', () => {
    const v = RESP[r.value];
    $('#stQuote').textContent = v.quote; $('#stNote').textContent = v.note; $('#stAllies').innerHTML = alliesHTML(r.value);
    $('#stVerdict').hidden = false; $('#stSend').disabled = false;
  }));
  $('#stSend').addEventListener('click', async () => {
    const sel = document.querySelector('input[name=cresp]:checked');
    if (!sel) return;
    const btn = $('#stSend');
    btn.disabled = true;
    if (await sendVote(sel.value, $('#stWhy').value.trim().slice(0, 160))) $('#stStatus').textContent = 'Sent. You can change your answer until the next round.';
    btn.disabled = false;
  });
  $('#stLeave').addEventListener('click', () => { leave(); showChooser('You left the class.'); });

  $('#hShow').addEventListener('click', () => {
    host.showAnswers = !host.showAnswers;
    $('#hShow').textContent = host.showAnswers ? 'Hide answers' : 'Show answers';
    $('#hWall').hidden = !host.showAnswers;
  });
  $('#hMode').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try {
      const r = await call({ action: 'mode', code: host.code, hostKey: host.key, mode: host.mode === 'test' ? 'rock' : 'test' });
      toast(r.mode === 'test' ? 'Worldview test started. Phones switch within a few seconds.' : 'Back to the rock. Everyone can answer again.');
      pollBoard();
    } catch (e) { $('#hErr').textContent = e.message; }
    finally { btn.disabled = false; }
  });
  $('#hRoundBtn').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try { await call({ action: 'round', code: host.code, hostKey: host.key }); toast('New round. Everyone can answer again.'); pollBoard(); }
    catch (e) { $('#hErr').textContent = e.message; }
    finally { btn.disabled = false; }
  });
  $('#hFull').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if ($('#board').requestFullscreen) $('#board').requestFullscreen().catch(() => {});
  });
  $('#hEnd').addEventListener('click', () => { forgetHost(); showChooser('Class closed. Its results disappear within 12 hours.'); });
  $('#hWall').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    b.closest('li').remove();
    try { await call({ action: 'hide', code: host.code, hostKey: host.key, key: b.getAttribute('data-k') }); } catch (x) { $('#hErr').textContent = x.message; }
  });

  const fromUrl = new URLSearchParams(location.search).get('join');
  if (fromUrl) { history.replaceState(null, '', location.pathname); joinAndShow(fromUrl); }
  else if (room.code) showStudent();
  else showChooser();
}
