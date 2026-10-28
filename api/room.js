/* Class mode backend: one room per class, stored in Upstash Redis through its REST API (no dependencies).
   Keys expire after 12 hours. Votes are keyed by the student's random client id, so voting again replaces the old vote.
   Each room gets a random epoch, so a reused code never inherits an old room's data.
   A room is in one of two modes: 'rock' (escape / hope / revolt, with a sentence) or 'test' (the worldview test result).
   A whole class usually shares one network address, so the per-network limits are generous; they stop scripts, not students. */

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL = 60 * 60 * 12;
const CODE_RE = /^[A-HJ-NP-Z]{4}$/;
const ID_RE = /^[a-z0-9]{12}$/;
const CHOICES = {
  rock: ['escape', 'hope', 'revolt'],
  test: ['camus', 'nietzsche', 'kierkegaard', 'marcus', 'epicurus', 'confucius', 'zen'],
};
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ACTIVE_MS = 3 * 60 * 1000;
const WRITES_PER_MINUTE = 150;
const DEVICES_PER_NETWORK = 150;

async function redis(commands) {
  const res = await fetch(REDIS_URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands.map((c) => c.map(String))),
  });
  if (!res.ok) throw new Error('redis http ' + res.status);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error('redis ' + r.error);
    return r.result;
  });
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const fail = (error, status = 400) => json({ error }, status);
const roomKey = (code) => 'room:' + code;
const sub = (room, part) => 'room:' + room.code + ':' + room.epoch + ':' + part;
const touch = (k) => ['EXPIRE', k, TTL];

function randomString(n, alphabet) {
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => alphabet[b % alphabet.length]).join('');
}
function clean(s, max) {
  return String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
function pairs(flat) {
  const o = {};
  for (let i = 0; flat && i < flat.length; i += 2) o[flat[i]] = flat[i + 1];
  return o;
}
async function hash(text, bytes) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d).slice(0, bytes), (x) => x.toString(16).padStart(2, '0')).join('');
}
/* Vercel sets x-forwarded-for to the real client address. Only a hash of it is stored. */
function network(request) {
  return (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local').split(',')[0].trim();
}

async function loadRoom(code) {
  const [flat] = await redis([['HGETALL', roomKey(code)]]);
  const m = pairs(flat);
  if (!m.host) return null;
  return { code, epoch: m.epoch || '0', host: m.host, round: Number(m.round) || 1, mode: m.mode === 'test' ? 'test' : 'rock' };
}

async function readRoom(code) {
  const r = await loadRoom(code);
  if (!r) return null;
  const [votes, hidden, people, boulders] = await redis([
    ['HGETALL', sub(r, 'v' + r.round)],
    ['SMEMBERS', sub(r, 'hidden')],
    ['ZCOUNT', sub(r, 'people'), Date.now() - ACTIVE_MS, '+inf'],
    ['GET', sub(r, 'boulders')],
  ]);
  const hide = new Set(hidden || []);
  const counts = Object.fromEntries(CHOICES[r.mode].map((c) => [c, 0]));
  const answers = [];
  const v = pairs(votes);
  for (const id of Object.keys(v)) {
    let e;
    try { e = JSON.parse(v[id]); } catch { continue; }
    if (!e || !CHOICES[r.mode].includes(e.c)) continue;
    counts[e.c]++;
    if (!e.w) continue;
    const k = await hash(code + ':' + id, 4);
    if (!hide.has(r.round + ':' + k)) answers.push({ k, c: e.c, w: e.w, t: Number(e.t) || 0 });
  }
  answers.sort((a, b) => b.t - a.t);
  return { code, round: r.round, mode: r.mode, counts, answers: answers.slice(0, 60), people: Number(people) || 0, boulders: Number(boulders) || 0 };
}

export async function GET(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return fail('Class mode is not set up on this server.', 503);
  try {
    const code = (new URL(request.url).searchParams.get('code') || '').toUpperCase();
    if (!CODE_RE.test(code)) return fail('That room code is not valid.');
    const room = await readRoom(code);
    return room ? json(room) : fail('No class with that code. Check the code on the projector.', 404);
  } catch (e) {
    return fail('The class server had a problem. Try again in a moment.', 500);
  }
}

export async function POST(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return fail('Class mode is not set up on this server.', 503);
  try {
    const raw = await request.text();
    if (raw.length > 2000) return fail('Request too large.', 413);
    let b;
    try { b = JSON.parse(raw); } catch { return fail('Bad request.'); }
    if (!b || typeof b !== 'object') return fail('Bad request.');

    if (b.action === 'create') {
      const hostKey = randomString(24, LOWER), epoch = randomString(6, LOWER);
      for (let i = 0; i < 8; i++) {
        const code = randomString(4, CODE_ALPHABET);
        const [ok] = await redis([['HSETNX', roomKey(code), 'host', hostKey]]);
        if (Number(ok) === 1) {
          await redis([['HSET', roomKey(code), 'round', 1, 'epoch', epoch, 'created', Date.now()], touch(roomKey(code))]);
          return json({ code, hostKey });
        }
      }
      return fail('Could not create a class right now. Try again.', 503);
    }

    const code = String(b.code || '').toUpperCase();
    if (!CODE_RE.test(code)) return fail('That room code is not valid.');
    const r = await loadRoom(code);
    if (!r) return fail('No class with that code. Check the code on the projector.', 404);

    if (b.action === 'round' || b.action === 'mode' || b.action === 'hide') {
      if (typeof b.hostKey !== 'string' || b.hostKey !== r.host) return fail('Only the host can do that.', 403);
      if (b.action === 'round') {
        const [n] = await redis([['HINCRBY', roomKey(code), 'round', 1], touch(roomKey(code))]);
        return json({ ok: true, round: Number(n) });
      }
      if (b.action === 'mode') {
        /* Switching mode always opens a fresh round, so rock votes and test results never mix. */
        const mode = b.mode === 'test' ? 'test' : 'rock';
        const [, n] = await redis([['HSET', roomKey(code), 'mode', mode], ['HINCRBY', roomKey(code), 'round', 1], touch(roomKey(code))]);
        return json({ ok: true, round: Number(n), mode });
      }
      const k = String(b.key || '');
      if (!/^[a-f0-9]{8}$/.test(k)) return fail('Bad answer key.');
      await redis([['SADD', sub(r, 'hidden'), r.round + ':' + k], touch(sub(r, 'hidden'))]);
      return json({ ok: true });
    }

    const id = String(b.id || '');
    if (!ID_RE.test(id)) return fail('Bad client id.');

    const net = await hash(network(request), 6);
    const rate = 'rl:' + code + ':' + net + ':' + Math.floor(Date.now() / 60000), devices = sub(r, 'net:' + net);
    const [hits, , added, count] = await redis([['INCR', rate], ['EXPIRE', rate, 120], ['SADD', devices, id], ['SCARD', devices]]);
    if (Number(hits) > WRITES_PER_MINUTE) return fail('Too many requests from this network. Wait a minute and try again.', 429);
    if (Number(added) === 1 && Number(count) > DEVICES_PER_NETWORK) {
      await redis([['SREM', devices, id]]);
      return fail('Too many devices from this network have joined this class.', 429);
    }
    const seen = [['ZADD', sub(r, 'people'), Date.now(), id], touch(sub(r, 'people')), touch(devices), touch(roomKey(code))];

    if (b.action === 'hello') {
      await redis(seen);
      return json({ ok: true, round: r.round, mode: r.mode });
    }
    if (b.action === 'vote') {
      const c = String(b.choice || '');
      if (!CHOICES[r.mode].includes(c)) {
        return fail(r.mode === 'test' ? 'This round is the worldview test. Take it on the class page.' : 'This round is about the rock. Pick escape, hope or revolt.', 409);
      }
      const vk = sub(r, 'v' + r.round);
      const [n, mine] = await redis([['HLEN', vk], ['HEXISTS', vk, id]]);
      if (Number(n) >= 400 && Number(mine) !== 1) return fail('This round is full.', 429);
      await redis([['HSET', vk, id, JSON.stringify({ c, w: r.mode === 'rock' ? clean(b.why, 160) : '', t: Date.now() })], touch(vk), ...seen]);
      return json({ ok: true, round: r.round });
    }
    if (b.action === 'boulder') {
      const [first] = await redis([['SET', sub(r, 'bl:' + id), 1, 'EX', 15, 'NX']]);
      if (first !== 'OK') return json({ ok: true, throttled: true });
      await redis([['INCR', sub(r, 'boulders')], touch(sub(r, 'boulders')), ...seen]);
      return json({ ok: true });
    }
    return fail('Unknown action.');
  } catch (e) {
    return fail('The class server had a problem. Try again in a moment.', 500);
  }
}
