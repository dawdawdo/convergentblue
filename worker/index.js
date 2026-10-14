// Cloudflare Worker entry. Static files are served straight from ./dist; this
// script only runs for /api/* (see "run_worker_first" in wrangler.jsonc).
//
// POST /api/submit — a visitor who ticked "send my results to Stephen" posts
// their color-test JSON here, and it's emailed to RESULTS_TO as an attachment.
//
// Setup (Cloudflare dashboard, one time):
//   1. Email Routing on convergentblue.com, with RESULTS_TO verified as a
//      destination address.
//   2. Worker > Settings > Variables and Secrets: add secret RESULTS_TO
//      (kept out of this public repo on purpose).
// RESULTS_FROM (a sender on the onboarded domain) lives in wrangler.jsonc.

const MAX_BYTES = 2_000_000;              // full threshold runs are ~0.3–0.6 MB
const KINDS = { swatch: 'Swatch test', threshold: 'Threshold test' };
const ALLOWED_ORIGINS = ['https://convergentblue.com', 'https://www.convergentblue.com'];

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// base64 for a UTF-8 string, chunked so large payloads don't blow the call stack
function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const clean = (s, n = 80) => String(s ?? '').replace(/[\r\n\t<>]/g, ' ').trim().slice(0, n);

async function submit(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'POST only' });

  const origin = request.headers.get('origin');
  const local = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !local) return json(403, { ok: false, error: 'bad origin' });

  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BYTES) return json(413, { ok: false, error: 'too large' });
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json(413, { ok: false, error: 'too large' });

  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'bad json' }); }

  // bots fill every field; people never see this one
  if (body.website) return json(200, { ok: true });
  if (body.consent !== true) return json(400, { ok: false, error: 'consent required' });
  if (!KINDS[body.kind] || typeof body.results !== 'object' || body.results === null)
    return json(400, { ok: false, error: 'bad payload' });

  if (!env.RESULTS_EMAIL || !env.RESULTS_TO || !env.RESULTS_FROM)
    return json(503, { ok: false, error: 'sending is not set up yet' });

  const name = clean(body.name) || 'anonymous';
  const note = clean(body.note, 500);
  const stamp = new Date().toISOString();
  const file = `${body.kind}-${name.replace(/[^A-Za-z0-9]+/g, '_')}-${stamp.slice(0, 10)}.json`;
  const pretty = JSON.stringify(body.results, null, 2);
  const summary = Array.isArray(body.summary) ? body.summary.slice(0, 60).map((l) => clean(l, 200)) : [];

  const lines = [`${KINDS[body.kind]} results from ${name}`, `Received ${stamp}`];
  if (note) lines.push(`Note: ${note}`);
  if (summary.length) lines.push('', ...summary);
  lines.push('', `Full results attached (${file}).`);
  const text = lines.join('\n');

  try {
    await env.RESULTS_EMAIL.send({
      to: env.RESULTS_TO,
      from: { email: env.RESULTS_FROM, name: 'convergentblue color tests' },
      subject: `${KINDS[body.kind]} results: ${name}`,
      text,
      attachments: [{ filename: file, type: 'application/json', disposition: 'attachment', content: b64(pretty) }],
    });
  } catch (e) {
    console.error('send failed', e && e.code, e && e.message);
    return json(502, { ok: false, error: 'could not send' });
  }
  return json(200, { ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/submit') return submit(request, env);
    if (url.pathname.startsWith('/api/')) return json(404, { ok: false, error: 'not found' });
    return env.ASSETS.fetch(request);
  },
};
