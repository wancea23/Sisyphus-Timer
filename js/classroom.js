/* Class mode. The core (join, heartbeat, votes, boulders) also runs on the timer page.
   The class page adds the presenter's board (QR code, live results, export) and the student's answer form.
   A room is either about the rock (escape / hope / revolt) or running the worldview test; the host switches between them. */
import { store, clientId } from './store.js';
import { $, $$, esc, toast, copyText, download } from './ui.js';
import { RESP, CLASS_VERDICT, PANEL, WORLDVIEW } from './data.js';
import { t, quoted } from './i18n.js';
import { unlock, alliesHTML } from './features.js';
import { runQuiz, resultHTML } from './quiz.js';

const API = '/api/room';
const CODE_RE = /^[A-HJ-NP-Z]{4}$/;
const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
const ROCK = ['revolt', 'hope', 'escape'];
const remembered = store.get('joined', null);
export const room = { code: CODE_RE.test(remembered || '') ? remembered : null, round: 1, mode: 'rock', beat: 0 };
const host = { code: null, key: null, poll: 0, showAnswers: true, mode: 'rock', last: null };

async function call(body, query) {
  let res;
  try {
    res = await fetch(API + (query || ''), body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { cache: 'no-store' });
  } catch (e) { throw new Error(t('cls.noServer')); }
  let data = {};
  try { data = await res.json(); } catch (e) { /* not JSON */ }
  if (!res.ok) {
    const known = data.code && t('err.' + data.code) !== 'err.' + data.code;
    const err = new Error(known ? t('err.' + data.code) : data.error || t('cls.noServer'));
    err.code = data.code || '';
    throw err;
  }
  return data;
}

/* ---------- core ---------- */
export async function join(code) {
  code = String(code || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) throw new Error(t('cls.badCode'));
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
      .catch((e) => { if (e.code === 'not_found') { leave(); if (onChange) onChange(null, first); } });
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
    toast(t('cls.sent', { code: room.code }));
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
  if (host.code) $('#resumeHost').textContent = t('cls.resume', { code: host.code });
}

/* Student */
const studentInfo = () => t('cls.info', { code: room.code, r: room.round }) + (room.mode === 'test' ? t('cls.infoTest') : '');
function startTest() {
  runQuiz($('#stQuiz'), async (score) => {
    $('#stQuiz').innerHTML = resultHTML(score) + '<div class="controls left"><button class="btn ghost" id="stRetake" type="button">' + t('quiz.again') + '</button></div>';
    $('#stRetake').addEventListener('click', () => { $('#stStatus').textContent = ''; startTest(); });
    if (await sendVote(score.top, '')) $('#stStatus').textContent = t('cls.testSent');
  });
}
function resetStudentForm() {
  $('#stInfo').textContent = studentInfo();
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
    if (round === null) { showChooser(t('cls.ended')); return; }
    /* The first sync only redraws when the remembered mode was out of date, so an answer already started is kept. */
    if (initial) {
      if (room.mode !== shown) { shown = room.mode; resetStudentForm(); } else $('#stInfo').textContent = studentInfo();
      return;
    }
    shown = room.mode;
    resetStudentForm();
    toast(t(room.mode === 'test' ? 'cls.testNow' : 'cls.newRound'));
  });
}
async function joinAndShow(code) {
  $('#classErr').textContent = t('cls.joining');
  try { await join(code); showStudent(); toast(t('cls.joined', { code: room.code })); }
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
export async function drawQr(box, url, label) {
  if (!(await loadQr()) || !window.qrcode) { box.innerHTML = ''; return; }
  const qr = window.qrcode(0, 'M');
  qr.addData(url); qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
  box.innerHTML = '<svg viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" role="img" aria-label="' + esc(label) + '"><rect x="-2" y="-2" width="' + (n + 4) +
    '" height="' + (n + 4) + '" class="qr-bg"/><path d="' + d + '" class="qr-fg"/></svg>';
}

/* Rock rounds count escape / hope / revolt; test rounds count the seven worldviews. */
const optionsOf = (d) => (d.mode === 'test' ? PANEL.map((p) => p.id) : ROCK);
const thinker = (id) => PANEL.find((p) => p.id === id);
const labelOf = (d, id) => (d.mode === 'test' ? thinker(id).short : RESP[id].tag);
const totalOf = (d) => optionsOf(d).reduce((n, id) => n + (d.counts[id] || 0), 0);
function verdictOf(d) {
  const total = totalOf(d);
  if (d.mode === 'test') {
    if (!total) return t('cls.testWaiting');
    const most = Math.max(...optionsOf(d).map((id) => d.counts[id] || 0)), tops = PANEL.filter((p) => (d.counts[p.id] || 0) === most);
    if (tops.length > 1) return t('cls.testSplit', { names: tops.map((p) => p.short).join(t('cls.and')) });
    return t('cls.testTop', { name: tops[0].name, foe: thinker(WORLDVIEW[tops[0].id].rival).name });
  }
  if (!total) return CLASS_VERDICT.none;
  const top = ROCK.slice().sort((a, b) => d.counts[b] - d.counts[a])[0];
  return ROCK.filter((c) => d.counts[c] === d.counts[top]).length > 1 ? t('cls.tie') : CLASS_VERDICT[top];
}

function renderBoard(data) {
  host.last = data;
  const test = data.mode === 'test', total = totalOf(data);
  host.mode = test ? 'test' : 'rock';
  $('#hTitle').textContent = t(test ? 'cls.titleTest' : 'cls.titleRock');
  $('#hMode').textContent = t(test ? 'cls.modeRock' : 'cls.modeTest');
  $('#hBars').classList.toggle('seven', test);
  $('#hVotesL').textContent = t(test ? 'cls.votesResults' : 'cls.votesAnswers');
  $('#hShow').hidden = test;
  $('#hRound').textContent = data.round;
  $('#hPeople').textContent = data.people;
  $('#hVotes').textContent = total;
  $('#hBoulders').textContent = data.boulders;
  $('#hBars').innerHTML = optionsOf(data).map((c) => {
    const n = data.counts[c] || 0, pct = total ? Math.round((n / total) * 100) : 0, cls = test ? thinker(c).stance : c;
    return '<div class="bar-row ' + cls + '"><span class="bl">' + esc(labelOf(data, c)) + '</span><div class="track"><i style="width:' + pct + '%"></i></div><span class="bn">' + n + ' · ' + pct + '%</span></div>';
  }).join('');
  $('#hVerdict').textContent = verdictOf(data);
  const wall = $('#hWall');
  wall.hidden = test || !host.showAnswers;
  if (test) return;
  wall.innerHTML = data.answers.length
    ? data.answers.map((a) => '<li class="note-card ' + a.c + '"><span class="tag ' + a.c + '">' + RESP[a.c].tag + '</span><p>' + esc(quoted(a.w)) + '</p>' +
      '<button type="button" class="hide-btn" data-k="' + esc(a.k) + '" aria-label="' + t('cls.hideAria') + '">' + t('cls.hide') + '</button></li>').join('')
    : '<li class="wall-empty">' + t('cls.wallEmpty') + '</li>';
}

function summaryText(d) {
  const total = totalOf(d);
  const lines = [t(d.mode === 'test' ? 'cls.sumTest' : 'cls.sum', { code: d.code, r: d.round, n: total, p: d.people })];
  optionsOf(d).forEach((c) => lines.push(t('cls.sumLine', { tag: labelOf(d, c), n: d.counts[c] || 0, pct: total ? Math.round(((d.counts[c] || 0) / total) * 100) : 0 })));
  lines.push(verdictOf(d));
  if (d.mode !== 'test' && d.answers.length) {
    lines.push('', t('cls.sumAnswers'));
    d.answers.forEach((a) => lines.push('- [' + RESP[a.c].tag + '] ' + quoted(a.w)));
  }
  return lines.join('\n');
}
function csvOf(d) {
  const cell = (s) => { s = String(s); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = [[t('csv.class'), d.code], [t('csv.round'), d.round], [t('csv.people'), d.people], [t('csv.answers'), totalOf(d)]];
  optionsOf(d).forEach((c) => rows.push([labelOf(d, c), d.counts[c] || 0]));
  if (d.mode !== 'test') {
    rows.push([], t('csv.head').split(','));
    d.answers.forEach((a) => rows.push([RESP[a.c].tag, a.w, new Date(a.t).toISOString()]));
  }
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
}

async function pollBoard() {
  try { renderBoard(await call(null, '?code=' + host.code)); $('#hErr').textContent = ''; }
  catch (e) {
    $('#hErr').textContent = e.message;
    if (e.code === 'not_found') { forgetHost(); showChooser(t('cls.expired')); }
  }
}
function showBoard() {
  show('#board');
  const dir = location.pathname.replace(/[^/]*$/, '');
  $('#hCode').textContent = host.code;
  $('#hUrl').textContent = location.host + dir + 'class.html';
  drawQr($('#qr'), location.origin + dir + 'class.html?join=' + host.code, t('cls.qrAria'));
  pollBoard();
  clearInterval(host.poll);
  host.poll = setInterval(() => { if (!document.hidden) pollBoard(); }, 2500);
  unlock(['chorus']);
}
function forgetHost() {
  clearInterval(host.poll);
  host.code = null; host.key = null; host.last = null; store.set('host', null);
}

export function initClassPage() {
  const saved = store.get('host', null);
  if (saved && CODE_RE.test(saved.code || '') && typeof saved.key === 'string') { host.code = saved.code; host.key = saved.key; }

  $('#hostBtn').addEventListener('click', async () => {
    $('#classErr').textContent = t('cls.opening');
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
    if (await sendVote(sel.value, $('#stWhy').value.trim().slice(0, 160))) $('#stStatus').textContent = t('cls.sentStatus');
    btn.disabled = false;
  });
  $('#stLeave').addEventListener('click', () => { leave(); showChooser(t('cls.left')); });

  $('#hShow').addEventListener('click', () => {
    host.showAnswers = !host.showAnswers;
    $('#hShow').textContent = t(host.showAnswers ? 'cls.hideAnswers' : 'cls.showAnswers');
    $('#hWall').hidden = !host.showAnswers;
  });
  $('#hMode').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try {
      const r = await call({ action: 'mode', code: host.code, hostKey: host.key, mode: host.mode === 'test' ? 'rock' : 'test' });
      toast(t(r.mode === 'test' ? 'cls.testStarted' : 'cls.rockAgain'));
      pollBoard();
    } catch (e) { $('#hErr').textContent = e.message; }
    finally { btn.disabled = false; }
  });
  $('#hRoundBtn').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try { await call({ action: 'round', code: host.code, hostKey: host.key }); toast(t('cls.roundStarted')); pollBoard(); }
    catch (e) { $('#hErr').textContent = e.message; }
    finally { btn.disabled = false; }
  });
  $('#hFull').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if ($('#board').requestFullscreen) $('#board').requestFullscreen().catch(() => {});
  });
  $('#hCsv').addEventListener('click', () => {
    if (!host.last) { toast(t('cls.noData')); return; }
    const f = 'class-' + host.last.code + '-round-' + host.last.round + '.csv';
    download(f, new Blob([csvOf(host.last)], { type: 'text/csv;charset=utf-8' }));
    toast(t('cls.csvSaved', { f }));
  });
  $('#hCopy').addEventListener('click', async () => {
    if (!host.last) { toast(t('cls.noData')); return; }
    toast((await copyText(summaryText(host.last))) ? t('cls.copied') : t('copyFail'));
  });
  $('#hEnd').addEventListener('click', () => { forgetHost(); showChooser(t('cls.closed')); });
  $('#hWall').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    b.closest('li').remove();
    try { await call({ action: 'hide', code: host.code, hostKey: host.key, key: b.getAttribute('data-k') }); } catch (x) { $('#hErr').textContent = x.message; }
  });

  const fromUrl = new URLSearchParams(location.search).get('join');
  if (fromUrl) { history.replaceState(null, '', location.pathname + (/[?&]embed=1/.test(location.search) ? '?embed=1' : '')); joinAndShow(fromUrl); }
  else if (room.code) showStudent();
  else showChooser();
}
