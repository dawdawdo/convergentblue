// Draws a visitor's "color smear" map: their measured zones vs typical zones on
// the a*b* plane at L* = 60, from threshold-test results.
import { labToRGBArr, typicalRadius, TYPICAL_LIGHTNESS } from './lab';

export interface Cond { condition?: string; L: number; a: number; b: number; direction: number | 'L'; threshold: number; trials: number; sd?: number; }

const RANGE = 46;                 // a*, b* shown from -RANGE to +RANGE
const key = (c: Cond) => `${Math.round(c.a)},${Math.round(c.b)}`;

/** Smooth closed zone through radii measured along a few directions.
 *  log r(θ) = c0 + c1·cos 2θ + s1·sin 2θ (an ellipse-like, 180°-symmetric shape that
 *  can never blow up). A weak round-shape prior fills in what the measured directions
 *  don't pin down: 0°/90° only -> axis-aligned; diagonals only -> tilt only. */
function fit(points: { deg: number; r: number }[]): (deg: number) => number {
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], y = [0, 0, 0];
  const add = (row: number[], v: number, w = 1) => {
    for (let i = 0; i < 3; i++) { y[i] += w * row[i] * v; for (let j = 0; j < 3; j++) A[i][j] += w * row[i] * row[j]; }
  };
  for (const { deg, r } of points) {
    const t = (2 * deg * Math.PI) / 180;
    add([1, Math.cos(t), Math.sin(t)], Math.log(r));
  }
  add([0, 1, 0], 0, 1e-3); add([0, 0, 1], 0, 1e-3);
  const det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  const col = (k: number) => det(A.map((row, i) => row.map((v, j) => (j === k ? y[i] : v))));
  const [c0, c1, s1] = [col(0) / D, col(1) / D, col(2) / D];
  // The log-Fourier curve pinches into a figure-8 once it's more than ~1.6:1, so use it
  // only for the orientation and the long/short radii, then draw a true ellipse.
  const amp = Math.hypot(c1, s1), phi = 0.5 * Math.atan2(s1, c1);
  const RA = Math.exp(c0 + amp), RB = Math.exp(c0 - amp);
  return (deg) => {
    const t = (deg * Math.PI) / 180 - phi;
    return 1 / Math.sqrt((Math.cos(t) / RA) ** 2 + (Math.sin(t) / RB) ** 2);
  };
}

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
  const groups = new Map<string, { a: number; b: number; pts: { deg: number; r: number }[] }>();
  let lightness: number | null = null;
  for (const c of results) {
    if (!c.trials || !(c.threshold > 0)) continue;
    if (c.direction === 'L') { if (Math.abs(c.a) < 1 && Math.abs(c.b) < 1) lightness = c.threshold; continue; }
    const g = groups.get(key(c)) ?? { a: c.a, b: c.b, pts: [] };
    g.pts.push({ deg: Number(c.direction), r: c.threshold });
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
