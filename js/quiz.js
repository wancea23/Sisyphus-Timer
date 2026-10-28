/* The worldview test: seven situations, one answer each, and the worldview you answered like most.
   Runs on the worldviews page and, as a class round, on the student's phone. */
import { S, store } from './store.js';
import { $, esc } from './ui.js';
import { PANEL, QUIZ, WORLDVIEW, STANCES, RESP } from './data.js';
import { t } from './i18n.js';

const find = (id) => PANEL.find((p) => p.id === id);

function shuffled(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* picks: one worldview id per question. A tie goes to the worldview picked latest. */
export function scoreQuiz(picks) {
  const counts = Object.fromEntries(PANEL.map((p) => [p.id, 0]));
  picks.forEach((id) => { counts[id]++; });
  const last = (id) => picks.lastIndexOf(id);
  const order = PANEL.map((p) => p.id).sort((a, b) => counts[b] - counts[a] || last(b) - last(a));
  return { top: order[0], runner: counts[order[1]] ? order[1] : null, counts };
}

/* Shows one question at a time in root, then calls onDone(score). */
export function runQuiz(root, onDone) {
  const order = QUIZ.map((item) => shuffled(Object.keys(item.a)));
  const picks = [];
  let i = 0;
  const paint = () => {
    const item = QUIZ[i];
    root.innerHTML = '<div class="quiz">' +
      '<div class="quiz-top"><p class="eyebrow">' + t('quiz.of', { i: i + 1, n: QUIZ.length }) + '</p>' +
      '<div class="quiz-track" aria-hidden="true"><i style="width:' + Math.round((i / QUIZ.length) * 100) + '%"></i></div></div>' +
      '<fieldset class="choices"><legend class="quiz-q">' + esc(item.q) + '</legend>' +
      order[i].map((id) => '<label class="opt"><input type="radio" name="quizA" value="' + id + '"' + (picks[i] === id ? ' checked' : '') + '><b>' + esc(item.a[id]) + '</b></label>').join('') +
      '</fieldset><div class="controls left">' +
      (i ? '<button class="btn ghost" type="button" data-quiz="back">' + t('quiz.back') + '</button>' : '') +
      '<button class="btn primary" type="button" data-quiz="next"' + (picks[i] ? '' : ' disabled') + '>' + t(i === QUIZ.length - 1 ? 'quiz.finish' : 'quiz.next') + '</button>' +
      '</div></div>';
    $('.quiz-q', root).setAttribute('tabindex', '-1');
    $('.quiz-q', root).focus({ preventScroll: true });
  };
  root.onchange = (e) => {
    if (e.target.name !== 'quizA') return;
    picks[i] = e.target.value;
    $('[data-quiz=next]', root).disabled = false;
  };
  root.onclick = (e) => {
    const b = e.target.closest('[data-quiz]');
    if (!b || b.disabled) return;
    if (b.dataset.quiz === 'back') { i--; paint(); return; }
    if (i < QUIZ.length - 1) { i++; paint(); return; }
    root.onchange = null; root.onclick = null;
    onDone(scoreQuiz(picks.slice(0, QUIZ.length)));
  };
  paint();
}

export function resultHTML(score) {
  const p = find(score.top), w = WORLDVIEW[score.top], foe = find(w.rival), total = QUIZ.length;
  const mix = PANEL.map((x) => x.id).filter((id) => score.counts[id]).sort((a, b) => score.counts[b] - score.counts[a]).map((id) =>
    '<div class="mix-row"><span>' + esc(find(id).short) + '</span><div class="mix-track"><i style="width:' + Math.round((score.counts[id] / total) * 100) + '%"></i></div><b>' + score.counts[id] + '</b></div>').join('');
  return '<article class="thinker wv-result">' +
    '<p class="eyebrow">' + t('quiz.who') + '</p>' +
    '<div class="th-head"><span class="mono" aria-hidden="true">' + esc(p.name.charAt(0)) + '</span><div><b>' + esc(p.name) + '</b><span>' + esc(p.school) +
    '</span></div><span class="stance ' + p.stance + '">' + STANCES[p.stance] + '</span></div>' +
    '<p class="wv-you">' + esc(w.you) + '</p>' +
    '<q>' + esc(p.quote) + '</q><cite>' + esc(p.source) + '</cite>' +
    '<p class="allies"><b>' + t('allies.against') + '</b> ' + esc(foe.name) + '. ' + esc(w.why) + '</p>' +
    (score.runner ? '<p class="allies"><b>' + t('quiz.close') + '</b> ' + esc(find(score.runner).name) + '.</p>' : '') +
    '<div class="mix" aria-label="' + t('quiz.mixAria') + '">' + mix + '</div>' +
    '</article>';
}

/* What you say against what you do: the test result next to the answers given on the timer. */
export function sayVsDo(id) {
  const st = S.stats, n = { revolt: st.revolt || 0, hope: st.hope || 0, escape: st.escape || 0 };
  const total = n.revolt + n.hope + n.escape;
  if (total < 3) return t('sv.few');
  const did = ['revolt', 'hope', 'escape'].sort((a, b) => n[b] - n[a])[0], p = find(id);
  const fact = t('sv.fact', { tag: RESP[did].tag, n: n[did], total });
  if (!RESP[p.stance]) return t('sv.cannot', { name: p.short, fact });
  if (p.stance === did) return t('sv.same', { fact });
  return t('sv.diff', { fact });
}

/* The worldviews page: start the test, show the saved result, compare it with the timer. */
export function initWorldviewTest() {
  const box = $('#wvQuiz'), start = $('#wvStart');
  const show = (score) => {
    box.hidden = false;
    box.innerHTML = resultHTML(score) + '<p class="note wv-check">' + esc(sayVsDo(score.top)) + '</p>' +
      '<p class="small">' + t('quiz.classHint') + '</p>';
    start.textContent = t('quiz.again'); start.hidden = false;
  };
  const saved = store.get('worldview', null);
  if (saved && find(saved.top) && saved.counts) show(saved);
  start.addEventListener('click', () => {
    box.hidden = false; start.hidden = true;
    runQuiz(box, (score) => {
      store.set('worldview', Object.assign({ at: Date.now() }, score));
      show(score);
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
