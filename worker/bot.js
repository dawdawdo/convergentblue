// D2R bot remote control (Stephen's own bot on GLaDOS; page at /bot/).
//
// POST /api/bot/checkin   the bot's supervisor, every 30 s, Bearer BOT_TOKEN. Body: its status snapshot.
//                         Reply: {"desired": {...}} and/or {"command": "..."} when the page queued one (sent once,
//                         so a local F12 is never overridden by a stale request from here).
// GET  /api/bot/state     the page; public. Last snapshot (pids stripped), run history, what's queued. With a valid
//                         Bearer DASH_TOKEN it adds owner: true (a wrong one is 401); public replies are cached 10 s.
// POST /api/bot/control   the page, Bearer DASH_TOKEN: {"desired": {"run": bool, "tasks": "meph"}} or
//                         {"command": "stop_now" | "stop_after_run"}.
//
// State lives in one SQLite-backed Durable Object (BotState): KV's free tier allows 1000 writes a day and a
// check-in every 30 s is 2880. Secrets BOT_TOKEN and DASH_TOKEN are set in the Cloudflare dashboard (Worker >
// Settings > Variables and Secrets); without them every route answers 503.

import { DurableObject } from 'cloudflare:workers';

const TASKS = ['meph', 'lk', 'lk,meph'];
const COMMANDS = ['stop_now', 'stop_after_run'];
const MAX_BODY = 256_000;
const KEEP_RUNS = 5000;

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

export async function bot(request, env, path) {
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
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS runs (
      start TEXT NOT NULL, task TEXT NOT NULL, result TEXT, duration REAL, chests INTEGER, picked TEXT, error TEXT,
      PRIMARY KEY (start, task))`);
  }

  async checkin(snap) {
    const now = Date.now();
    for (const r of Array.isArray(snap.runs) ? snap.runs : []) {
      if (!r || !r.start || !r.task) continue;
      this.sql.exec(
        'INSERT OR IGNORE INTO runs (start, task, result, duration, chests, picked, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
        String(r.start).slice(0, 19), String(r.task).slice(0, 20), String(r.result ?? '').slice(0, 20),
        Number(r.duration_s) || 0, Number(r.chests) || 0, String(r.picked ?? '').slice(0, 400),
        String(r.error ?? '').slice(0, 300));
    }
    this.sql.exec(`DELETE FROM runs WHERE rowid NOT IN (SELECT rowid FROM runs ORDER BY start DESC LIMIT ${KEEP_RUNS})`);
    const { runs, ...rest } = snap;
    await this.ctx.storage.put('snapshot', { ...rest, received: now });
    const pending = (await this.ctx.storage.get('pending')) || null;
    if (!pending) return { ok: true };
    await this.ctx.storage.delete('pending');
    await this.ctx.storage.put('delivered', { ...pending, delivered: now });
    const { queued, ...reply } = pending;
    return { ok: true, ...reply };
  }

  async queue(req) {
    const old = (await this.ctx.storage.get('pending')) || {};
    const pending = { ...old, ...req, queued: Date.now() };
    await this.ctx.storage.put('pending', pending);
    return { ok: true, pending };
  }

  async state() {
    const since = new Date(Date.now() - 8 * 86400e3).toISOString().slice(0, 10);
    const runs = this.sql.exec(
      'SELECT start, task, result, duration, chests, picked, error FROM runs WHERE start >= ? ORDER BY start DESC LIMIT 3000',
      since).toArray();
    const [snapshot, pending, delivered] = await Promise.all(
      ['snapshot', 'pending', 'delivered'].map((k) => this.ctx.storage.get(k)));
    if (snapshot) {  // pids are of no use to the page and needn't be public
      for (const k of ['supervisor', 'bot']) if (snapshot[k]) snapshot[k] = { ...snapshot[k], pid: snapshot[k].pid ? 1 : 0 };
      delete snapshot.loot;
    }
    return { ok: true, now: Date.now(), snapshot: snapshot || null, pending: pending || null,
             delivered: delivered || null, runs };
  }
}
