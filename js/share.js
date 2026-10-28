/* "Share my myth": paints a 1080x1350 card on a canvas from the same geometry as the live scene, then saves or shares it. */
import { S } from './store.js';
import { fmtDur, download, toast } from './ui.js';
import { figureGeo, boulderAt, offAt, B_START, B_END, MOUNT_PATH, BOULDER_INC, tallyPath, heroOf } from './scene.js';
import { moodWord, streak } from './features.js';
import { TROPHIES } from './data.js';
import { t, cnt, quoted } from './i18n.js';

const W = 1080, H = 1350, MEANDER = 'M0 15H20M15 15V1H3V11H11V5H7';
const STRATA = ['M0 364H220L840 154H1000', 'M0 402H220L840 192H1000', 'M0 442H220L840 232H1000', 'M0 484H220L840 274H1000'];
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function band(ctx, x, y, w, c) {
  ctx.fillStyle = c.fig; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + 24, w, 2);
  ctx.strokeStyle = c.fig; ctx.lineWidth = 2; ctx.lineCap = 'butt';
  const tile = new Path2D(MEANDER);
  for (let i = 0; i * 20 < w; i++) { ctx.save(); ctx.translate(x + i * 20, y + 5); ctx.stroke(tile); ctx.restore(); }
}

function stroke(ctx, d, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(new Path2D(d));
}
function fill(ctx, d, color) { ctx.fillStyle = color; ctx.fill(new Path2D(d)); }
function dot(ctx, p, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); }

/* Same paint order as the SVG markup in scene.js. */
function paintFigure(ctx, g, c) {
  [['lB', 16], ['aB', 14], ['torso', 12], ['neck', 15], ['lA', 16], ['aA', 14]].forEach(([k, w]) => stroke(ctx, g[k], c.panel, w));
  dot(ctx, g.head, 14.5, c.panel); dot(ctx, g.knot, 8, c.panel);
  stroke(ctx, g.lB, c.fig, 10); stroke(ctx, g.aB, c.fig, 8);
  fill(ctx, g.torso, c.fig); stroke(ctx, g.torso, c.fig, 6);
  ctx.save(); ctx.translate(g.cloth.x, g.cloth.y); ctx.rotate((Number(g.rot) * Math.PI) / 180);
  ctx.fillStyle = c.red; ctx.beginPath(); ctx.ellipse(0, 0, 15, 9.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  stroke(ctx, g.neck, c.fig, 9); dot(ctx, g.knot, 5, c.fig); dot(ctx, g.head, 11, c.fig);
  fill(ctx, g.beard, c.fig); fill(ctx, g.nose, c.fig);
  ctx.fillStyle = c.panel; ctx.beginPath(); ctx.ellipse(g.eye.x, g.eye.y, 2.6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  stroke(ctx, g.mouth, c.panel, 1.5);
  g.gear.forEach((p) => {
    if (p.cls === 'fg') { stroke(ctx, p.d, c.panel, 4); fill(ctx, p.d, c.fig); }
    else if (p.cls === 'frf') { stroke(ctx, p.d, c.panel, 3); fill(ctx, p.d, c.red); }
    else if (p.cls === 'fw') fill(ctx, p.d, c.white);
    else if (p.cls === 'frs') stroke(ctx, p.d, c.red, 3);
    else if (p.cls === 'fd') stroke(ctx, p.d, c.fig, 1.8);
    else stroke(ctx, p.d, c.panel, 1.5);
  });
  stroke(ctx, g.lA, c.panel, 15); stroke(ctx, g.lA, c.fig, 10);
  stroke(ctx, g.aA, c.panel, 13); stroke(ctx, g.aA, c.fig, 8);
}

function wrap(ctx, text, x, y, maxW, lh, maxLines) {
  const words = text.split(' ');
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      if (n === maxLines - 1) { ctx.fillText(line + ' …', x, y); return y + lh; }
      ctx.fillText(line, x, y); y += lh; n++; line = words[i];
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

export async function makeCard() {
  try {
    await Promise.all(['400 60px Marcellus', 'italic 400 34px Alegreya', '500 15px Alegreya', '700 22px "Alegreya Sans"', '500 24px "Alegreya Sans"']
      .map((f) => document.fonts.load(f)));
  } catch (e) { /* fall back to whatever is loaded */ }
  const c = { bg: css('--bg'), fg: css('--fg'), panel: css('--panel'), fig: css('--figure'), white: css('--white'), red: css('--red'), muted: css('--muted') };
  const st = S.stats, hero = heroOf();
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = c.muted; ctx.font = '700 22px "Alegreya Sans", sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillText(t('card.brand'), 40, 92);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = c.fg; ctx.font = '400 66px Marcellus, Georgia, serif';
  ctx.fillText(t('card.title'), 40, 168);

  const fx = 40, fy = 210;
  ctx.fillStyle = c.panel; ctx.fillRect(fx, fy, 1000, 412);
  band(ctx, fx, fy, 1000, c); band(ctx, fx, fy + 386, 1000, c);
  ctx.save(); ctx.translate(fx, fy + 26); ctx.beginPath(); ctx.rect(0, 0, 1000, 360); ctx.clip();
  dot(ctx, { x: 230, y: 70 }, 19, c.white);
  fill(ctx, MOUNT_PATH, c.fig);
  ctx.setLineDash([16, 11]); ctx.globalAlpha = 0.5; STRATA.forEach((d) => stroke(ctx, d, c.panel, 1.6)); ctx.setLineDash([]); ctx.globalAlpha = 1;
  const bd = B_START + (B_END - B_START) * 0.55, C = boulderAt(bd);
  ctx.save(); ctx.translate(C.x, C.y); ctx.rotate(bd / 46);
  dot(ctx, { x: 0, y: 0 }, 48, c.panel); dot(ctx, { x: 0, y: 0 }, 46, c.fig);
  ctx.globalAlpha = 0.7; ctx.strokeStyle = c.panel; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, 0, 39, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  stroke(ctx, BOULDER_INC, c.panel, 2); stroke(ctx, tallyPath(st.boulders), c.panel, 2);
  ctx.restore();
  const g = figureGeo(bd - offAt(bd), 1, 1, 0, false, C, 0, st.mood, hero.gear);
  paintFigure(ctx, g, c);
  ctx.fillStyle = c.fig; ctx.font = '500 15px Alegreya, Georgia, serif'; ctx.textAlign = g.la === 'end' ? 'right' : 'left';
  ctx.fillText(hero.label, Number(g.lx), Number(g.ly)); ctx.textAlign = 'left';
  ctx.restore();

  const cols = [[String(st.boulders), t(st.boulders === 1 ? 'card.boulder' : 'card.boulders')], [fmtDur(st.workSec), t('card.mountain')], [String(st.scorned), t('card.gods')]];
  cols.forEach(([v, k], i) => {
    const x = 40 + i * 345;
    ctx.fillStyle = c.fg; ctx.font = '400 64px Marcellus, Georgia, serif'; ctx.fillText(v, x, 730);
    ctx.fillStyle = c.muted; ctx.font = '700 20px "Alegreya Sans", sans-serif'; ctx.fillText(k, x, 770);
  });
  ctx.fillStyle = c.fg; ctx.fillRect(40, 810, 1000, 2);
  ctx.font = '400 50px Marcellus, Georgia, serif';
  ctx.fillText(t('card.mood', { w: moodWord(st.mood) }), 40, 890);
  const last = S.journal.find((e) => e.why);
  ctx.font = 'italic 400 40px Alegreya, Georgia, serif'; ctx.fillStyle = c.fg;
  const y = wrap(ctx, quoted(last ? last.why : hero.quote), 40, 975, 1000, 56, 4);
  ctx.fillStyle = c.muted; ctx.font = '500 24px "Alegreya Sans", sans-serif';
  ctx.fillText(last ? t('card.answer') : t('card.hero', { name: hero.name, chapter: hero.chapter }), 40, y + 6);
  band(ctx, 40, H - 168, 1000, c);
  const got = TROPHIES.filter((t) => st.trophies[t.id]).length, s = streak();
  ctx.fillStyle = c.fg; ctx.font = '500 26px "Alegreya Sans", sans-serif';
  ctx.fillText(t('card.footer', { g: got, m: TROPHIES.length, s: cnt(s, 'days'), h: hero.name }), 40, H - 100);
  ctx.fillStyle = c.muted; ctx.font = '500 24px "Alegreya Sans", sans-serif';
  ctx.fillText('the-sisyphus-timer.vercel.app', 40, H - 52);

  const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
  if (!blob) { toast(t('card.fail')); return; }
  const file = new File([blob], 'my-sisyphus-myth.png', { type: 'image/png' });
  try {
    const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: t('card.shareTitle') });
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  download('my-sisyphus-myth.png', blob);
  toast(t('card.saved', { f: 'my-sisyphus-myth.png' }));
}
