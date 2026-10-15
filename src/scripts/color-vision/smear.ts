// Draws a visitor's "color smear" map: their measured zones vs typical zones on
// the a*b* plane at L* = 60, from threshold-test results.
import { labToRGBArr, typicalRadius, TYPICAL_LIGHTNESS } from './lab';

export interface Cond { condition?: string; L: number; a: number; b: number; direction: number | 'L'; threshold: number; trials: number; sd?: number; }

const RANGE = 46;                 // a*, b* shown from -RANGE to +RANGE
const key = (c: Cond) => `${Math.round(c.a)},${Math.round(c.b)}`;

/** Radius of a centred ellipse (log long axis, log short axis, axis angle in radians) along `deg`. */
const rOf = (la: number, lb: number, phi: number, deg: number) => {
  const t = (deg * Math.PI) / 180 - phi;
  return 1 / Math.sqrt((Math.cos(t) / Math.exp(la)) ** 2 + (Math.sin(t) / Math.exp(lb)) ** 2);
};

/** Small Nelder-Mead minimiser (enough for three parameters and a handful of points). */
function nelderMead(f: (x: number[]) => number, x0: number[], step = 0.3, iters = 600) {
  const n = x0.length, mk = (x: number[]) => ({ x, v: f(x) });
  let pts = [x0, ...x0.map((_, i) => x0.map((v, j) => (i === j ? v + step : v)))].map(mk);
  for (let k = 0; k < iters; k++) {
    pts.sort((p, q) => p.v - q.v);
    const best = pts[0], worst = pts[n], second = pts[n - 1];
    if (worst.v - best.v < 1e-10) break;
    const c = x0.map((_, j) => pts.slice(0, n).reduce((s, p) => s + p.x[j], 0) / n);
    const toward = (t: number) => mk(c.map((cj, j) => cj + t * (worst.x[j] - cj)));
    const r = toward(-1);
    if (r.v < best.v) { const e = toward(-2); pts[n] = e.v < r.v ? e : r; continue; }
    if (r.v < second.v) { pts[n] = r; continue; }
    const ct = toward(r.v < worst.v ? -0.5 : 0.5);
    if (ct.v < Math.min(r.v, worst.v)) { pts[n] = ct; continue; }
    pts = pts.map((p, i) => (i === 0 ? p : mk(p.x.map((v, j) => best.x[j] + 0.5 * (v - best.x[j])))));
  }
  pts.sort((p, q) => p.v - q.v);
  return pts[0];
}

/** Smear zone as a true ellipse, fitted directly to the measured thresholds - the same method as
 *  the analysis behind the blog maps (ellipse_fit.py): least squares in r, each threshold weighted
 *  by its own posterior SD, parameterised as (long, short, angle) so the result is always an
 *  ellipse. A very weak round-shape prior settles what the directions can't pin down
 *  (0°/90° only -> axis-aligned; diagonals only -> tilted 45°). */
export function fitEllipse(points: { deg: number; r: number; sd?: number }[]): { long: number; short: number; axis: number; at: (deg: number) => number } {
  const rs = points.map((p) => p.r);
  const cost = ([la, lb, phi]: number[]) =>
    points.reduce((s, { deg, r, sd }) => s + ((rOf(la, lb, phi, deg) - r) / Math.max(sd ?? 0.15 * r, 0.02)) ** 2, 0) + 1e-3 * (la - lb) ** 2;
  let best = { x: [0, 0, 0], v: Infinity };
  for (let p0 = 0; p0 < 180; p0 += 15) {
    const s = nelderMead(cost, [Math.log(Math.max(...rs)), Math.log(Math.min(...rs)), (p0 * Math.PI) / 180]);
    if (s.v < best.v) best = s;
  }
  let [la, lb, phi] = best.x;
  if (lb > la) { [la, lb] = [lb, la]; phi += Math.PI / 2; }
  const axis = (((phi * 180) / Math.PI) % 180 + 180) % 180;
  return { long: Math.exp(la), short: Math.exp(lb), axis, at: (deg) => rOf(la, lb, phi, deg) };
}
const fit = (points: { deg: number; r: number; sd?: number }[]) => fitEllipse(points).at;

/** Combine runs: for the same anchor + direction, weight by 1/sd² (newer data wins ties). */
export function mergeResults(...runs: Cond[][]): Cond[] {
  const m = new Map<string, Cond & { w: number; acc: number }>();
  for (const run of runs) for (const c of run) {
    if (!c || !c.trials || !isFinite(c.threshold)) continue;
    const k = `${key(c)}@${c.direction}`, w = 1 / Math.max(0.05, (c.sd ?? 1) ** 2);
    const prev = m.get(k);
    if (!prev) m.set(k, { ...c, w, acc: Math.log(c.threshold) * w });
    else { prev.w += w; prev.acc += Math.log(c.threshold) * w; prev.trials += c.trials; prev.threshold = Math.exp(prev.acc / prev.w); }
  }
  return [...m.values()].map(({ w, acc, ...c }) => c);
}

export interface Summary { multiple: number | null; lightness: number | null; anchors: number; fourDir: boolean; }

export function analyze(results: Cond[]) {
  const groups = new Map<string, { a: number; b: number; pts: { deg: number; r: number; sd?: number }[] }>();
  let lightness: number | null = null;
  for (const c of results) {
    if (!c.trials || !(c.threshold > 0)) continue;
    if (c.direction === 'L') { if (Math.abs(c.a) < 1 && Math.abs(c.b) < 1) lightness = c.threshold; continue; }
    const g = groups.get(key(c)) ?? { a: c.a, b: c.b, pts: [] };
    g.pts.push({ deg: Number(c.direction), r: c.threshold, sd: c.sd });
    groups.set(key(c), g);
  }
  const logs: number[] = [];
  const zones = [...groups.values()].map((g) => {
    const you = fit(g.pts);
    const typical = (deg: number) => typicalRadius(60, g.a, g.b, deg);
    g.pts.forEach(({ deg, r }) => logs.push(Math.log(r / typical(deg))));
    return { a: g.a, b: g.b, you, typical, dirs: g.pts.map((p) => p.deg) };
  });
  const multiple = logs.length ? Math.exp(logs.reduce((x, y) => x + y, 0) / logs.length) : null;
  const fourDir = zones.some((z) => new Set(z.dirs.map((d) => ((d % 180) + 180) % 180)).size >= 3);
  return { zones, summary: { multiple, lightness: lightness && lightness / TYPICAL_LIGHTNESS, anchors: zones.length, fourDir } as Summary };
}

/** Render the map. `zoom` magnifies the zones (not the plane) so small, normal zones stay visible. */
export function drawSmearMap(canvas: HTMLCanvasElement, results: Cond[], zoom = 1) {
  const { zones, summary } = analyze(results);
  const N = 720, LEG = 92, dpr = 1;
  canvas.width = N * dpr; canvas.height = (N + LEG) * dpr;
  const ctx = canvas.getContext('2d')!;
  const scale = N / (2 * RANGE);
  const X = (a: number) => N / 2 + a * scale, Y = (b: number) => N / 2 - b * scale;

  // the plane itself, at the test's L* = 60
  const R = 240, img = ctx.createImageData(R, R);
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
    const a = -RANGE + ((i + 0.5) / R) * 2 * RANGE, b = RANGE - ((j + 0.5) / R) * 2 * RANGE;
    const [r, g, bl] = labToRGBArr(60, a, b), o = 4 * (j * R + i);
    img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = bl; img.data[o + 3] = 255;
  }
  const tmp = document.createElement('canvas'); tmp.width = R; tmp.height = R;
  tmp.getContext('2d')!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, N, N);

  const path = (cx: number, cy: number, rf: (deg: number) => number) => {
    ctx.beginPath();
    for (let d = 0; d <= 360; d += 3) {
      const r = rf(d) * zoom, t = (d * Math.PI) / 180;
      const x = X(cx + r * Math.cos(t)), y = Y(cy + r * Math.sin(t));
      d === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  };
  const stroke = (w: number) => {
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = w + 2.5; ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = w; ctx.stroke();
  };
  for (const z of zones) {
    path(z.a, z.b, z.typical); stroke(1.2);
    path(z.a, z.b, z.you); stroke(3.4);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(X(z.a), Y(z.b), 2.2, 0, 7); ctx.fill();
  }

  // legend strip (part of the canvas so a saved PNG explains itself)
  ctx.fillStyle = '#fff'; ctx.fillRect(0, N, N, LEG);
  ctx.fillStyle = '#111'; ctx.font = '600 20px Inter, system-ui, sans-serif';
  ctx.fillText('My color smear zones', 18, N + 32);
  ctx.font = '15px Inter, system-ui, sans-serif'; ctx.fillStyle = '#444';
  const m = summary.multiple ? `about ${summary.multiple.toFixed(1)}× typical size` : '';
  ctx.fillText(`Colors inside a shape look the same. Thick = mine${m ? ` (${m})` : ''}, thin = typical.`, 18, N + 56);
  ctx.fillText(`Shapes ${zoom > 1 ? `magnified ×${zoom}` : 'at true size'} · L* = 60 · convergentblue.com/color-threshold-test`, 18, N + 78);
  ctx.lineCap = 'round';
  return summary;
}
