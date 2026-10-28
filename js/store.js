/* Persistent state (settings, stats, journal, the current run) kept in localStorage. */
import { clamp } from './ui.js';

export const store = {
  get(k, d) { try { const v = localStorage.getItem('sisyphus.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sisyphus.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
};

export const PRESETS = { classic: { work: 1500, brk: 300 }, deep: { work: 3000, brk: 600 }, demo: { work: 30, brk: 15 } };
export const ROLL_MS = 2600;
export const PHASES = ['ready', 'work', 'rolling', 'reflect', 'break'];

const zeroStats = () => ({
  boulders: 0, workSec: 0, scorned: 0, yielded: 0, mood: 50, revolt: 0, hope: 0, escape: 0,
  days: {}, gods: [], revoltRun: 0, carved: 0, trophies: {},
});

export const S = {
  settings: Object.assign(
    { preset: 'classic', work: 1500, brk: 300, cWork: 25, cBrk: 5, sound: true, strict: false, gods: true, ambience: false, breathe: true, notify: false, hero: 'sisyphus' },
    store.get('settings', {})),
  stats: Object.assign(zeroStats(), store.get('stats', {})),
  journal: store.get('journal', []),
  run: null,
};
if (!Array.isArray(S.journal)) S.journal = [];
if (!S.stats.days || typeof S.stats.days !== 'object') S.stats.days = {};
if (!Array.isArray(S.stats.gods)) S.stats.gods = [];
if (!S.stats.trophies || typeof S.stats.trophies !== 'object') S.stats.trophies = {};

export function applyPreset() {
  const s = S.settings;
  if (s.preset === 'custom') {
    s.work = clamp(Math.round(Number(s.cWork)) || 25, 1, 180) * 60;
    s.brk = clamp(Math.round(Number(s.cBrk)) || 5, 1, 60) * 60;
  } else {
    if (!PRESETS[s.preset]) s.preset = 'classic';
    s.work = PRESETS[s.preset].work; s.brk = PRESETS[s.preset].brk;
  }
}
applyPreset();

/* S.keepPreset: the presenter's embedded timer runs in Class demo without changing the saved preset. */
export const save = () => {
  store.set('settings', S.keepPreset ? Object.assign({}, S.settings, { preset: S.keepPreset }) : S.settings);
  store.set('stats', S.stats); store.set('journal', S.journal);
};
/* S.ephemeral: the presenter's demo timer never overwrites a real session. */
export const saveRun = () => { if (!S.ephemeral) store.set('run', S.run); };
export const bumpMood = (n) => { S.stats.mood = clamp(S.stats.mood + n, 0, 100); };
export function resetStats() { Object.assign(S.stats, zeroStats()); S.journal = []; save(); }

export const remainingNow = () => (S.run.running ? Math.max(0, S.run.endAt - Date.now()) : S.run.remaining);
export const progress = () => (S.run.total ? clamp(1 - remainingNow() / S.run.total, 0, 1) : 0);

export function dayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function clientId() {
  let id = store.get('cid', null);
  if (typeof id !== 'string' || !/^[a-z0-9]{12}$/.test(id)) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
    store.set('cid', id);
  }
  return id;
}
