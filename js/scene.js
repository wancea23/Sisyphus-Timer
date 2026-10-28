/* The painted frieze: mountain, boulder, sky and the hero, drawn in black-figure style.
   The figure's SVG nodes are built once; every frame only moves them. */
import { S, ROLL_MS, progress } from './store.js';
import { $, clamp, lerp, F, reduced } from './ui.js';
import { HEROES } from './data.js';

export const MOUNT_PATH = 'M0 360V330H220L840 120H1000V360Z';
export const BOULDER_INC = 'M-22-30L-8-12L-15 4L1 22M14-37L20-16L35-9M-37 9L-19 17L-24 33M8 8L22 14L26 30';
const P0 = { x: 220, y: 330 }, P1 = { x: 840, y: 120 };
const L = Math.hypot(P1.x - P0.x, P1.y - P0.y);
const U = { x: (P1.x - P0.x) / L, y: (P1.y - P0.y) / L };
const NS = { x: U.y, y: -U.x };
export const R = 46;
export const B_START = -40, B_END = L + 50;
const S_TOP = B_END - 104, S_BOTTOM = B_START - 104;

const slopeT = (d) => (d < L / 2 ? clamp((d + 24) / 48, 0, 1) : clamp((L + 24 - d) / 48, 0, 1));
export function ground(d) {
  if (d < 0) return { x: P0.x + d, y: P0.y };
  if (d > L) return { x: P1.x + (d - L), y: P1.y };
  return { x: P0.x + U.x * d, y: P0.y + U.y * d };
}
export function boulderAt(d) {
  const g = ground(d), t = slopeT(d), nx = NS.x * t, ny = -1 + (NS.y + 1) * t, m = Math.hypot(nx, ny);
  return { x: g.x + (nx / m) * R, y: g.y + (ny / m) * R };
}
export const offAt = (bd) => lerp(104, 128, slopeT(bd));
const arc = (p) => ({ x: 70 + p * 560, y: 100 - Math.sin(Math.PI * p) * 60 });
function rollCurve(k) {
  if (k < 0.8) { const u = k / 0.8; return u * u * 1.05; }
  const u = (k - 0.8) / 0.2;
  return 1.05 - 0.05 * (1 - (1 - u) * (1 - u));
}
const pt = (p) => F(p.x) + ' ' + F(p.y);
const along = (p, v, s) => ({ x: p.x + v.x * s, y: p.y + v.y * s });
function ik(a, b, l1, l2, bend) {
  let dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.5;
  if (dist > max) { b = { x: a.x + (dx / dist) * max, y: a.y + (dy / dist) * max }; dx = b.x - a.x; dy = b.y - a.y; dist = max; }
  const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const ang = Math.atan2(dy, dx) - Math.acos(cosA) * bend;
  return { mid: { x: a.x + Math.cos(ang) * l1, y: a.y + Math.sin(ang) * l1 }, end: b };
}

export const heroOf = () => HEROES.find((h) => h.id === S.settings.hero) || HEROES[0];

/* Each hero's headgear, as up to three painted parts. Classes map to fills in styles.css (and in share.js). */
function gearParts(gear, hx, hy, f) {
  const X = (o) => F(hx + f * o), Y = (o) => F(hy + o), P = (x, y) => X(x) + ' ' + Y(y);
  if (gear === 'hat') return [
    { cls: 'fg', d: 'M' + P(-18, -6) + 'Q' + P(0, -12) + ' ' + P(19, -7) + 'Q' + P(0, -3) + ' ' + P(-18, -6) + 'Z' +
      'M' + P(-9, -8) + 'C' + P(-9, -23) + ' ' + P(9, -23) + ' ' + P(9, -9) + 'Z' },
    { cls: 'frs', d: 'M' + P(-9, -10) + 'Q' + P(0, -12.5) + ' ' + P(9, -11) },
  ];
  if (gear === 'mask') return [
    { cls: 'fw', d: 'M' + P(-1, -12) + 'C' + P(12, -13) + ' ' + P(16, -2) + ' ' + P(13, 8) + 'C' + P(10, 15) + ' ' + P(1, 14) + ' ' + P(-1, 8) + 'Z' },
    { cls: 'fd', d: 'M' + P(5, -3) + 'Q' + P(8, -5.5) + ' ' + P(11, -3) + 'M' + P(5, 8) + 'Q' + P(8.5, 5) + ' ' + P(12, 8) },
  ];
  if (gear === 'helmet') return [
    { cls: 'frf', d: 'M' + P(-15, -2) + 'C' + P(-12, -31) + ' ' + P(10, -31) + ' ' + P(14, -12) + 'L' + P(9, -12) + 'C' + P(6, -23) + ' ' + P(-8, -23) + ' ' + P(-10, -2) + 'Z' },
    { cls: 'fg', d: 'M' + P(-12, 4) + 'C' + P(-14, -14) + ' ' + P(10, -18) + ' ' + P(13, -3) + 'L' + P(13, 9) + 'L' + P(7, 9) + 'L' + P(7, 1) + 'L' + P(-4, 0) + 'Z' },
    { cls: 'fi', d: 'M' + P(6, -3) + 'L' + P(12, -3) },
  ];
  if (gear === 'wreath') {
    let d = '';
    for (let i = 0; i < 7; i++) {
      const th = (-165 + i * 25) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
      const p = { x: hx + f * c * 12.5, y: hy + s * 12.5 }, tx = -f * s, ty = c;
      const a = { x: p.x - tx * 4.2, y: p.y - ty * 4.2 }, b = { x: p.x + tx * 4.2, y: p.y + ty * 4.2 };
      const n1 = { x: p.x + f * c * 2.6, y: p.y + s * 2.6 }, n2 = { x: p.x - f * c * 2.6, y: p.y - s * 2.6 };
      d += 'M' + pt(a) + 'Q' + pt(n1) + ' ' + pt(b) + 'Q' + pt(n2) + ' ' + pt(a) + 'Z';
    }
    return [{ cls: 'fw', d }];
  }
  return [{ cls: 'frs', d: 'M' + P(-11, -2) + 'Q' + P(0, -13) + ' ' + P(10, -5) }];
}

/* Pose geometry for one frame. Used by the live scene and by the share card. */
export function figureGeo(d, f, lean, ph, stepping, C, t, mood, gear) {
  const g = ground(d);
  const bob = stepping ? -Math.abs(Math.sin(ph)) * 1.6 : (reduced ? 0 : Math.sin(t * 1.7) * 1.1);
  const hip = { x: g.x - f * 8 * lean, y: g.y - 60 + 8 * lean + bob };
  const tor = lerp(0.07, 0.95, lean);
  const dir = { x: f * Math.sin(tor), y: -Math.cos(tor) }, pr = { x: -dir.y, y: dir.x };
  const sh = along(hip, dir, 42);
  const hd = { x: sh.x + dir.x * 13 + f * 4, y: sh.y + dir.y * 13 - 5 };

  const amp = lean > 0.5 ? 22 : (stepping ? 15 : 7);
  const ctr = d - f * 14 * lean;
  const s = stepping ? Math.sin(ph) : 1, c = stepping ? Math.cos(ph) : 0;
  const foot = (off, lift) => { const p = ground(ctr + f * off); return { x: p.x, y: p.y - 3 - lift }; };
  const legA = ik(hip, foot(amp * s, stepping ? Math.max(0, c) * 7 : 0), 33, 33, f);
  const legB = ik(hip, foot(-amp * s, stepping ? Math.max(0, -c) * 7 : 0), 33, 33, f);

  const sw = stepping ? Math.sin(ph) * 0.45 : 0.08;
  const hang = (a) => ({ x: sh.x + f * Math.sin(a) * 50, y: sh.y + Math.cos(a) * 50 });
  let h1 = hang(-sw), h2 = hang(sw);
  if (lean > 0.02) {
    const vx = sh.x - C.x, vy = sh.y - C.y, m = Math.hypot(vx, vy) || 1;
    const on = (r) => { const cs = Math.cos(r), sn = Math.sin(r); return { x: C.x + ((vx * cs - vy * sn) / m) * (R + 2), y: C.y + ((vx * sn + vy * cs) / m) * (R + 2) }; };
    const k = clamp(lean, 0, 1), p1 = on(f * 0.3), p2 = on(-f * 0.22);
    h1 = { x: lerp(h1.x, p1.x, k), y: lerp(h1.y, p1.y, k) };
    h2 = { x: lerp(h2.x, p2.x, k), y: lerp(h2.y, p2.y, k) };
  }
  const armA = ik(sh, h1, 28, 28, -f), armB = ik(sh, h2, 28, 28, -f);

  const toe = (p) => ({ x: p.x + f * 8, y: p.y });
  const legP = (lg) => 'M' + pt(hip) + 'L' + pt(lg.mid) + 'L' + pt(lg.end) + 'L' + pt(toe(lg.end));
  const armP = (a) => 'M' + pt(sh) + 'L' + pt(a.mid) + 'L' + pt(a.end);
  const hx = hd.x, hy = hd.y, X = (o) => F(hx + f * o), Y = (o) => F(hy + o);
  const mouth = mood >= 65 ? 'M' + X(5) + ' ' + Y(6.5) + 'Q' + X(8) + ' ' + Y(10) + ' ' + X(11) + ' ' + Y(6)
    : mood < 35 ? 'M' + X(5) + ' ' + Y(9) + 'Q' + X(8) + ' ' + Y(5.5) + ' ' + X(11) + ' ' + Y(9)
    : 'M' + X(5) + ' ' + Y(7.5) + 'L' + X(10.5) + ' ' + Y(7.5);
  return {
    lA: legP(legA), lB: legP(legB), aA: armP(armA), aB: armP(armB),
    torso: 'M' + pt(along(hip, pr, 9)) + 'L' + pt(along(sh, pr, 12)) + 'L' + pt(along(sh, pr, -12)) + 'L' + pt(along(hip, pr, -9)) + 'Z',
    neck: 'M' + pt(sh) + 'L' + pt(hd),
    beard: 'M' + X(1) + ' ' + Y(5) + 'Q' + X(5) + ' ' + Y(19) + ' ' + X(13) + ' ' + Y(13) + 'L' + X(10) + ' ' + Y(4) + 'Z',
    nose: 'M' + X(9) + ' ' + Y(-4) + 'L' + X(15) + ' ' + Y(2) + 'L' + X(9) + ' ' + Y(3) + 'Z',
    mouth,
    head: hd, knot: { x: hx - f * 11, y: hy + 3 }, eye: { x: hx + f * 5.5, y: hy - 2 },
    cloth: along(hip, dir, 5), rot: F(f * tor * 57.2958),
    gear: gearParts(gear, hx, hy, f),
    lx: F(hx - f * 27), ly: F(hy + 4), la: f === 1 ? 'end' : 'start',
  };
}

export function tallyPath(n) {
  let d = '';
  for (let i = 0; i < Math.min(n, 40); i++) {
    const a = (i / 40) * Math.PI * 2, r0 = i % 5 === 4 ? 26 : 31, c = Math.cos(a), s = Math.sin(a);
    d += 'M' + F(c * r0) + ' ' + F(s * r0) + 'L' + F(c * 37) + ' ' + F(s * 37);
  }
  return d;
}

let figPaths, figDots, clothEl, gearEls, figEl, boulderEl, sunEl, moonEl, nightEl, starsEl, labelEl, tallyEl;
let shownTally = -1;
export const view = { bd: B_START, sd: S_BOTTOM, lean: 1, ph: 0, night: 0, settled: false };

export function initScene() {
  figEl = $('#fig'); boulderEl = $('#boulder'); sunEl = $('#sun'); moonEl = $('#moon');
  nightEl = $('#night'); starsEl = $('#stars'); labelEl = $('#label'); tallyEl = $('#marks');
  figEl.innerHTML =
    '<g class="fo"><path data-d="lB" stroke-width="16"/><path data-d="aB" stroke-width="14"/><path data-d="torso" stroke-width="12"/>' +
    '<path data-d="neck" stroke-width="15"/><path data-d="lA" stroke-width="16"/><path data-d="aA" stroke-width="14"/></g>' +
    '<circle class="fpo" data-c="head" r="14.5"/><circle class="fpo" data-c="knot" r="8"/>' +
    '<path class="fk" data-d="lB" stroke-width="10"/><path class="fk" data-d="aB" stroke-width="8"/>' +
    '<path class="ff fk" data-d="torso" stroke-width="6"/><ellipse class="fr" id="cloth" rx="15" ry="9.5"/>' +
    '<path class="fk" data-d="neck" stroke-width="9"/><circle class="ff" data-c="knot" r="5"/><circle class="ff" data-c="head" r="11"/>' +
    '<path class="ff" data-d="beard"/><path class="ff" data-d="nose"/><ellipse class="fie" data-c="eye" rx="2.6" ry="1.4"/>' +
    '<path class="fi" data-d="mouth"/><path data-g="0"/><path data-g="1"/><path data-g="2"/>' +
    '<path class="fo" data-d="lA" stroke-width="15"/><path class="fk" data-d="lA" stroke-width="10"/>' +
    '<path class="fo" data-d="aA" stroke-width="13"/><path class="fk" data-d="aA" stroke-width="8"/>';
  figPaths = Array.from(figEl.querySelectorAll('[data-d]')).map((el) => [el, el.getAttribute('data-d')]);
  figDots = Array.from(figEl.querySelectorAll('[data-c]')).map((el) => [el, el.getAttribute('data-c')]);
  gearEls = Array.from(figEl.querySelectorAll('[data-g]'));
  clothEl = $('#cloth');
  let seed = 7, html = '';
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 18; i++) {
    html += '<circle cx="' + F(30 + rnd() * 760) + '" cy="' + F(14 + rnd() * 80) + '" r="' + F(1.2 + rnd() * 1.6) + '" style="animation-delay:-' + F(rnd() * 2.6) + 's"/>';
  }
  starsEl.innerHTML = html;
}

function placeFigure(g, label) {
  figPaths.forEach(([el, k]) => el.setAttribute('d', g[k]));
  figDots.forEach(([el, k]) => { el.setAttribute('cx', F(g[k].x)); el.setAttribute('cy', F(g[k].y)); });
  clothEl.setAttribute('cx', F(g.cloth.x)); clothEl.setAttribute('cy', F(g.cloth.y));
  clothEl.setAttribute('transform', 'rotate(' + g.rot + ' ' + F(g.cloth.x) + ' ' + F(g.cloth.y) + ')');
  gearEls.forEach((el, i) => {
    const part = g.gear[i];
    const cls = part ? part.cls : '';
    if (el.getAttribute('class') !== cls) el.setAttribute('class', cls);
    el.setAttribute('d', part ? part.d : '');
  });
  labelEl.setAttribute('x', g.lx); labelEl.setAttribute('y', g.ly);
  if (labelEl.style.textAnchor !== g.la) labelEl.style.textAnchor = g.la;
  if (labelEl.textContent !== label) labelEl.textContent = label;
}

export function strike() {
  if (reduced) return;
  const fr = $('.frieze');
  fr.classList.remove('struck'); void fr.offsetWidth; fr.classList.add('struck');
  setTimeout(() => fr.classList.remove('struck'), 700);
}

export function draw(dt, t) {
  const run = S.run, ph = run.phase, p = progress();
  let bT = B_START, sT = S_BOTTOM, leanT = 1, f = 1, stepping = false, nightT = 0, sunP = 0.02, sunOn = true, moonOn = false, moonP = 0.04, direct = false;
  if (ph === 'work') {
    bT = lerp(B_START, B_END, p); sT = bT - offAt(bT); stepping = run.running;
    nightT = p > 0.85 ? ((p - 0.85) / 0.15) * 0.12 : 0; sunP = 0.02 + p * 0.96;
  } else if (ph === 'rolling') {
    const k = clamp((Date.now() - run.rollStart) / ROLL_MS, 0, 1);
    bT = B_END - (B_END - B_START) * rollCurve(k); direct = true;
    sT = S_TOP; leanT = 0; f = k > 0.45 ? -1 : 1; nightT = 0.2; sunOn = false;
  } else if (ph === 'reflect') {
    sT = S_TOP; leanT = 0; f = -1; nightT = 0.3; sunOn = false; moonOn = true;
  } else if (ph === 'break') {
    sT = lerp(S_TOP, S_BOTTOM, p); leanT = 0; f = -1; stepping = run.running;
    nightT = 0.34 * (1 - Math.pow(p, 3)); sunOn = false; moonOn = true; moonP = 0.04 + p * 0.92;
  }
  const a = 1 - Math.exp(-dt * 5);
  view.bd = direct ? bT : view.bd + (bT - view.bd) * a;
  view.sd += (sT - view.sd) * a;
  view.lean += (leanT - view.lean) * (1 - Math.exp(-dt * 4));
  view.night += (nightT - view.night) * (1 - Math.exp(-dt * 2));
  view.settled = Math.abs(bT - view.bd) < 0.5 && Math.abs(sT - view.sd) < 0.5 && Math.abs(leanT - view.lean) < 0.01 && Math.abs(nightT - view.night) < 0.005;
  const walk = stepping && !reduced;
  if (walk) view.ph += dt * (view.lean > 0.5 ? 1.7 : 3.2);

  if (S.stats.boulders !== shownTally) { shownTally = S.stats.boulders; tallyEl.setAttribute('d', tallyPath(shownTally)); }
  const C = boulderAt(view.bd), hero = heroOf();
  boulderEl.setAttribute('transform', 'translate(' + F(C.x) + ' ' + F(C.y) + ') rotate(' + F(((view.bd / R) * 57.2958) % 360) + ')');
  placeFigure(figureGeo(view.sd, f, view.lean, view.ph, walk, C, t, S.stats.mood, hero.gear), hero.label);
  const sp = arc(sunP), mp = arc(moonP);
  sunEl.setAttribute('transform', 'translate(' + F(sp.x) + ' ' + F(sp.y) + ')'); sunEl.style.opacity = sunOn ? '1' : '0';
  moonEl.setAttribute('transform', 'translate(' + F(mp.x) + ' ' + F(mp.y) + ')'); moonEl.style.opacity = moonOn ? '1' : '0';
  nightEl.setAttribute('opacity', view.night.toFixed(3));
  starsEl.style.opacity = clamp(view.night / 0.25, 0, 1).toFixed(2);
}
