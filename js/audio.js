/* Synthesized sound: lyre plucks, the rumble of the falling rock, and an optional ambience (wind, cicadas, a distant lyre). */
import { S } from './store.js';

let ac = null, brown = null, white = null, amb = null;
const DORIAN = [293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33];

function makeNoise(seconds, smooth) {
  const len = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (smooth) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w * 0.5;
  }
  return buf;
}

export function ensureAudio() {
  if (!S.settings.sound) return;
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      brown = makeNoise(3, true);
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}

export function pluck(freqs, gap, vol) {
  if (!ac || !S.settings.sound) return;
  gap = gap == null ? 0.16 : gap; vol = vol || 0.1;
  try {
    const t0 = ac.currentTime + 0.02;
    freqs.forEach((fq, i) => {
      const t = t0 + i * gap, g = ac.createGain(), o = ac.createOscillator(), o2 = ac.createOscillator();
      o.type = 'triangle'; o.frequency.value = fq; o2.type = 'sine'; o2.frequency.value = fq * 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g); o2.connect(g); g.connect(ac.destination);
      o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
    });
  } catch (e) { /* audio is optional */ }
}

export function rumble(dur, cutoff, vol) {
  if (!ac || !S.settings.sound) return;
  try {
    const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = brown; lp.type = 'lowpass'; lp.frequency.value = cutoff;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(lp); lp.connect(g); g.connect(ac.destination); src.start(t); src.stop(t + dur);
  } catch (e) { /* audio is optional */ }
}

function startAmbience() {
  if (!white) white = makeNoise(2, false);
  const t = ac.currentTime, master = ac.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.5, t + 2.5);
  master.connect(ac.destination);

  const wind = ac.createBufferSource(), wf = ac.createBiquadFilter(), wg = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  wind.buffer = brown; wind.loop = true; wf.type = 'lowpass'; wf.frequency.value = 380; wg.gain.value = 0.16;
  lfo.frequency.value = 0.07; lg.gain.value = 0.09; lfo.connect(lg); lg.connect(wg.gain);
  wind.connect(wf); wf.connect(wg); wg.connect(master);

  const cic = ac.createBufferSource(), bp = ac.createBiquadFilter(), am = ac.createGain(), trem = ac.createOscillator(), tg = ac.createGain();
  const gate = ac.createGain(), slow = ac.createOscillator(), sg = ac.createGain();
  cic.buffer = white; cic.loop = true; bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = 6;
  am.gain.value = 0; trem.type = 'square'; trem.frequency.value = 42; tg.gain.value = 0.05; trem.connect(tg); tg.connect(am.gain);
  gate.gain.value = 0.5; slow.frequency.value = 0.17; sg.gain.value = 0.5; slow.connect(sg); sg.connect(gate.gain);
  cic.connect(bp); bp.connect(am); am.connect(gate); gate.connect(master);

  const nodes = [wind, lfo, cic, trem, slow];
  nodes.forEach((n) => n.start());
  const timer = setInterval(() => {
    if (Math.random() < 0.55) pluck([DORIAN[Math.floor(Math.random() * DORIAN.length)]], 0, 0.035);
  }, 4200);
  amb = { master, nodes, timer };
}

function stopAmbience() {
  const a = amb;
  amb = null;
  clearInterval(a.timer);
  try {
    const t = ac.currentTime;
    a.master.gain.cancelScheduledValues(t);
    a.master.gain.setValueAtTime(Math.max(0.0001, a.master.gain.value), t);
    a.master.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  } catch (e) { /* ignore */ }
  setTimeout(() => {
    a.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
    a.master.disconnect();
  }, 1400);
}

/* Ambience plays only while the timer runs and both Sound and Ambience are on. */
export function setAmbience(on) {
  const want = on && !!ac && S.settings.sound && S.settings.ambience;
  try {
    if (want && !amb) startAmbience();
    else if (!want && amb) stopAmbience();
  } catch (e) { amb = null; }
}
