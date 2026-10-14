// CIELAB <-> sRGB (D65) and CIEDE2000, shared by the color-vision test pages.

const WP = [0.95047, 1.0, 1.08883];
const M = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
];
const finv = (t: number) => { const d = 6 / 29; return t > d ? t * t * t : 3 * d * d * (t - 4 / 29); };
const enc = (v: number) => { v = Math.min(1, Math.max(0, v)); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };

export function labToLinear(L: number, a: number, b: number): number[] {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const x = finv(fx) * WP[0], y = finv(fy) * WP[1], z = finv(fz) * WP[2];
  return M.map((r) => r[0] * x + r[1] * y + r[2] * z);
}
export function inGamut(L: number, a: number, b: number): boolean {
  return labToLinear(L, a, b).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
}
/** sRGB bytes; out-of-gamut colors lose chroma toward gray (L* and hue kept). */
export function labToRGBArr(L: number, a: number, b: number): number[] {
  if (!inGamut(L, a, b)) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; inGamut(L, a * m, b * m) ? (lo = m) : (hi = m); }
    a *= lo; b *= lo;
  }
  return labToLinear(L, a, b).map((v) => Math.round(enc(v) * 255));
}
export function labToRGB(L: number, a: number, b: number): string {
  const c = labToRGBArr(L, a, b);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** CIEDE2000 (kL = kC = kH = 1). */
export function deltaE00(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (b: number, a: number) => (a === 0 && b === 0 ? 0 : (Math.atan2(b, a) * deg + 360) % 360);
  const h1p = h(b1, a1p), h2p = h(b2, a2p);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp += h1p + h2p < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad)
    + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTh = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dTh * rad) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

/** Normal-observer just-noticeable difference, fitted to 9 controls (r = 0.86). */
export const NORMAL_JND = 1.1;
/** Typical lightness threshold (geometric mean of the controls). */
export const TYPICAL_LIGHTNESS = 0.69;

/** Lab distance from (L,a,b) along a*b* direction `dirDeg` at which ΔE00 reaches the normal JND.
 *  Both signs are averaged, since the test measures a symmetric threshold. */
export function typicalRadius(L: number, a: number, b: number, dirDeg: number, jnd = NORMAL_JND): number {
  const r = (dirDeg * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r);
  const one = (s: number) => {
    let lo = 0, hi = 40;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      deltaE00(L, a, b, L, a + s * m * ux, b + s * m * uy) < jnd ? (lo = m) : (hi = m);
    }
    return (lo + hi) / 2;
  };
  return (one(1) + one(-1)) / 2;
}
