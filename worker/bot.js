// D2R bot remote control (Stephen's own bot on GLaDOS; page at /bot/).
//
// POST /api/bot/checkin   the bot's supervisor, every 30 s, Bearer BOT_TOKEN. Body: its status snapshot.
//                         Reply: {"desired": {...}} and/or {"command": "..."} when the page queued one (sent once,
//                         so a local F12 is never overridden by a stale request from here).
// GET  /api/bot/state     the page; public. Last snapshot (pids stripped), run history, what's queued. With a valid
//                         Bearer DASH_TOKEN it adds owner: true (a wrong one is 401); public replies are cached 10 s.
// POST /api/bot/armory    GLaDOS, Bearer BOT_TOKEN: gzipped pagedata.json for the armory page, sent when it changes.
// GET  /api/bot/armory    public: that JSON (edge-cached 5 min). 404 until the first upload.
// POST /api/bot/control   the page, Bearer DASH_TOKEN: {"desired": {"run": bool, "tasks": "meph"}} or
//                         {"command": "stop_now" | "stop_after_run"}.
//
// State lives in one SQLite-backed Durable Object (BotState): KV's free tier allows 1000 writes a day and a
// check-in every 30 s is 2880. Secrets BOT_TOKEN and DASH_TOKEN are set in the Cloudflare dashboard (Worker >
// Settings > Variables and Secrets); without them every route answers 503.

import { DurableObject } from 'cloudflare:workers';

const TASKS = ['lk', 'meph', 'tunnels'];  // one task at a time (Stephen 2026-11-13: modular, no LK + Meph)
const COMMANDS = ['stop_now', 'stop_after_run'];
const MAX_BODY = 256_000;
const MAX_ARMORY_GZ = 1_000_000;
const RECENT_H = 25;     // the page shows the last 24 h
const RECENT_MAX = 1100; // keeps the 'recent' blob well under the 128 KiB value limit
const KEEP_DAYS = 60;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

async function sameSecret(given, want) {
  if (!given || !want) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, want].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  return crypto.subtle.timingSafeEqual(a, b);
}

const bearer = (request) => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

// A Durable Object call that throws (e.g. the free plan's daily rows-read limit, 2026-11-10) used to surface as
// Cloudflare error 1101 / HTTP 500 with no message; say what it is instead.
export async function bot(request, env, path) {
  try {
    return await route(request, env, path);
  } catch (e) {
    return json(503, { ok: false, error: `bot storage unavailable (free plan's daily limit? resets 00:00 UTC): ${String(e && e.message || e).slice(0, 120)}` });
  }
}

async function route(request, env, path) {
  if (!env.BOT_STATE || !env.BOT_TOKEN || !env.DASH_TOKEN) return json(503, { ok: false, error: 'not set up yet' });
  const stub = env.BOT_STATE.get(env.BOT_STATE.idFromName('glados'));

  if (path === 'checkin') {
    if (request.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
    if (!(await sameSecret(bearer(request), env.BOT_TOKEN))) return json(401, { ok: false, error: 'bad token' });
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json(413, { ok: false, error: 'too large' });
    let snap;
    try { snap = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'bad json' }); }
    return json(200, await stub.checkin(snap));
  }

  if (path === 'armory') {
    if (request.method === 'POST') {
      if (!(await sameSecret(bearer(request), env.BOT_TOKEN))) return json(401, { ok: false, error: 'bad token' });
      const gz = await request.arrayBuffer();
      if (gz.byteLength > MAX_ARMORY_GZ) return json(413, { ok: false, error: 'too large' });
      try { JSON.parse(await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).text()); }
      catch { return json(400, { ok: false, error: 'not gzipped json' }); }
      await stub.putArmory(gz);
      await caches.default.delete(new Request(new URL('/api/bot/armory', request.url)));
      return json(200, { ok: true, bytes: gz.byteLength });
    }
    const key = new Request(new URL('/api/bot/armory', request.url));
    const hit = await caches.default.match(key);
    if (hit) return hit;
    const gz = await stub.getArmory();
    if (!gz) return json(404, { ok: false, error: 'no armory yet' });
    const res = new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip')),
      { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
    await caches.default.put(key, res.clone());
    return res;
  }

  if (path === 'state') {
    const given = bearer(request);
    if (given) {
      if (!(await sameSecret(given, env.DASH_TOKEN))) return json(401, { ok: false, error: 'bad password' });
      return json(200, { ...(await stub.state()), owner: true });
    }
    const cache = caches.default;
    const key = new Request(new URL('/api/bot/state?public', request.url));
    const hit = await cache.match(key);
    if (hit) return hit;
    const res = json(200, { ...(await stub.state()), owner: false });
    res.headers.set('cache-control', 'public, max-age=10');
    await cache.put(key, res.clone());
    res.headers.set('cache-control', 'no-store');
    return res;
  }

  if (path === 'control') {
    if (!(await sameSecret(bearer(request), env.DASH_TOKEN))) return json(401, { ok: false, error: 'bad password' });
    if (request.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
    let body;
    try { body = await request.json(); } catch { return json(400, { ok: false, error: 'bad json' }); }
    const out = {};
    if (body.desired && typeof body.desired === 'object') {
      const d = body.desired;
      if (typeof d.run !== 'boolean') return json(400, { ok: false, error: 'run must be true or false' });
      out.desired = { run: d.run };
      if (d.tasks !== undefined) {
        if (!TASKS.includes(d.tasks)) return json(400, { ok: false, error: 'unknown tasks' });
        out.desired.tasks = d.tasks;
      }
    }
    if (body.command !== undefined) {
      if (!COMMANDS.includes(body.command)) return json(400, { ok: false, error: 'unknown command' });
      out.command = body.command;
    }
    if (!out.desired && !out.command) return json(400, { ok: false, error: 'nothing to do' });
    return json(200, await stub.queue(out));
  }
  return json(404, { ok: false, error: 'not found' });
}

export class BotState extends DurableObject {
  // Free plan: 5M rows read a day. So nothing here scans the runs table on a timer: a check-in only inserts runs newer
  // than the newest one stored, the page reads one stored blob ('recent': the last RECENT_H hours of runs, rebuilt
  // when new runs arrive), and old rows are pruned once a day by an index range. Each KV get/put is ~1 row.
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS runs (
      start TEXT NOT NULL, task TEXT NOT NULL, result TEXT, duration REAL, chests INTEGER, picked TEXT, error TEXT,
      PRIMARY KEY (start, task))`);
  }

  async checkin(snap) {
    const now = Date.now();
    let meta = await this.ctx.storage.get('meta');
    if (!meta) {  // first run of this version: carry on from the table (one index range read, once)
      const top = this.sql.exec('SELECT max(start) AS m FROM runs').toArray()[0];
      meta = { last: (top && top.m) || '', pruned: '' };
      const rows = this.sql.exec('SELECT start, task, result, duration, chests, picked, error FROM runs WHERE start >= ? ORDER BY start DESC LIMIT ?',
        hoursBefore(meta.last, RECENT_H), RECENT_MAX).toArray();
      await this.ctx.storage.put('recent', rows.map(pack));
    }
    const fresh = (Array.isArray(snap.runs) ? snap.runs : [])
      .filter((r) => r && r.start && r.task && String(r.start).slice(0, 19) > meta.last)
      .map((r) => ({
        start: String(r.start).slice(0, 19), task: String(r.task).slice(0, 20), result: String(r.result ?? '').slice(0, 20),
        duration: Math.round((Number(r.duration_s) || 0) * 10) / 10, chests: Number(r.chests) || 0,
        picked: String(r.picked ?? '').slice(0, 400), error: String(r.error ?? '').slice(0, 300),
      }))
      .sort((x, y) => (x.start < y.start ? -1 : 1));
    if (fresh.length) {
      for (const r of fresh) {
        this.sql.exec('INSERT OR IGNORE INTO runs (start, task, result, duration, chests, picked, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
          r.start, r.task, r.result, r.duration, r.chests, r.picked, r.error);
      }
      meta.last = fresh[fresh.length - 1].start;
      const cutoff = hoursBefore(meta.last, RECENT_H);
      const recent = [...fresh.reverse().map(pack), ...((await this.ctx.storage.get('recent')) || [])]
        .filter((t) => t[0] >= cutoff).slice(0, RECENT_MAX);
      await this.ctx.storage.put('recent', recent);
    }
    const today = new Date(now).toISOString().slice(0, 10);
    if (meta.pruned !== today) {  // once a day; the PK index makes this read only the rows it deletes
      if (meta.last) this.sql.exec('DELETE FROM runs WHERE start < ?', hoursBefore(meta.last, KEEP_DAYS * 24));
      meta.pruned = today;
    }
    await this.ctx.storage.put('meta', meta);
    const { runs, loot, ...rest } = snap;
    await this.ctx.storage.put('snapshot', { ...rest, received: now });
    const pending = (await this.ctx.storage.get('pending')) || null;
    if (!pending) return { ok: true };
    await this.ctx.storage.delete('pending');
    await this.ctx.storage.put('delivered', { ...pending, delivered: now });
    const { queued, ...reply } = pending;
    return { ok: true, ...reply };
  }

  async putArmory(gz) { await this.ctx.storage.put('armory', gz); }
  async getArmory() { return (await this.ctx.storage.get('armory')) || null; }

  async queue(req) {
    const old = (await this.ctx.storage.get('pending')) || {};
    const pending = { ...old, ...req, queued: Date.now() };
    await this.ctx.storage.put('pending', pending);
    return { ok: true, pending };
  }

  async state() {
    const got = await this.ctx.storage.get(['snapshot', 'pending', 'delivered', 'recent']);
    const snapshot = got.get('snapshot') || null;
    if (snapshot) {  // pids are of no use to the page and needn't be public
      for (const k of ['supervisor', 'bot']) if (snapshot[k]) snapshot[k] = { ...snapshot[k], pid: snapshot[k].pid ? 1 : 0 };
      delete snapshot.loot;
    }
    return { ok: true, now: Date.now(), snapshot, pending: got.get('pending') || null,
             delivered: got.get('delivered') || null, runs: (got.get('recent') || []).map(unpack) };
  }
}

// 'recent' holds runs as arrays (no repeated keys), newest first.
const FIELDS = ['start', 'task', 'result', 'duration', 'chests', 'picked', 'error'];
const pack = (r) => FIELDS.map((f) => r[f]);
const unpack = (t) => Object.fromEntries(FIELDS.map((f, i) => [f, t[i]]));

// Run start times are the bot's local wall clock ("YYYY-MM-DD HH:MM:SS"), so cutoffs count back from the newest run in
// that same clock (treated as UTC on both sides) instead of from the server's time.
const hoursBefore = (start, h) => {
  const ms = Date.parse(String(start || '').replace(' ', 'T') + 'Z');
  return Number.isNaN(ms) ? '' : new Date(ms - h * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
};
