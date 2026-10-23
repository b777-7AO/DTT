/* DTT Tor-Studio · Tor-Erkennung im Hausfoto (läuft komplett im Browser, kein Upload)
   Sucht das größte rechteckige, ruhige Feld mit vier kräftigen Kanten in der unteren Bildhälfte: das Garagentor.
   Verfahren: Graustufen + Sobel, Hough-Transformation für nahezu senkrechte und waagerechte Linien,
   Kandidaten-Vierecke aus Linienpaaren, Bewertung nach Kantenstütze, Seitenverhältnis, Größe und innerer Ruhe. */

const MAXW = 420;

function toGray(img) {
  const k = Math.min(1, MAXW / img.naturalWidth), W = Math.max(64, Math.round(img.naturalWidth * k)), H = Math.max(64, Math.round(img.naturalHeight * k));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2];
  // light blur to calm texture (3x3 box)
  const b = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += g[(y + dy) * W + x + dx];
    b[y * W + x] = s / 9;
  }
  return { W, H, g: b };
}

function sobel({ W, H, g }) {
  const mag = new Float32Array(W * H), gx = new Float32Array(W * H), gy = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    const sx = -g[i - W - 1] - 2 * g[i - 1] - g[i + W - 1] + g[i - W + 1] + 2 * g[i + 1] + g[i + W + 1];
    const sy = -g[i - W - 1] - 2 * g[i - W] - g[i - W + 1] + g[i + W - 1] + 2 * g[i + W] + g[i + W + 1];
    gx[i] = sx; gy[i] = sy; mag[i] = Math.hypot(sx, sy);
  }
  return { mag, gx, gy };
}

/* Hough for one family: vertical lines x = x0 + (y - cy) * tan(phi), horizontal lines y = y0 + (x - cx) * tan(psi) */
function hough(W, H, mag, gx, gy, vertical, thr) {
  const ANG = 24, STEP = 1, NA = 2 * ANG / STEP + 1, cx = W / 2, cy = H / 2, size = vertical ? W : H;
  const acc = new Float32Array(NA * size), tans = [];
  for (let a = 0; a < NA; a++) tans.push(Math.tan((-ANG + a * STEP) * Math.PI / 180));
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const i = y * W + x, m = mag[i]; if (m < thr) continue;
    const ax = Math.abs(gx[i]), ay = Math.abs(gy[i]);
    if (vertical ? ax < 1.3 * ay : ay < 1.3 * ax) continue;   // orientation must match the line family
    for (let a = 0; a < NA; a++) {
      const p = vertical ? x - (y - cy) * tans[a] : y - (x - cx) * tans[a];
      const q = Math.round(p); if (q < 0 || q >= size) continue;
      acc[a * size + q] += m;
    }
  }
  // peaks with non-maximum suppression (±3 angle steps, ±6 px)
  const peaks = [];
  for (let a = 0; a < NA; a++) for (let q = 0; q < size; q++) {
    const v = acc[a * size + q]; if (v <= 0) continue;
    let best = true;
    for (let da = -3; da <= 3 && best; da++) for (let dq = -6; dq <= 6; dq++) {
      const aa = a + da, qq = q + dq; if (aa < 0 || aa >= NA || qq < 0 || qq >= size) continue;
      if (acc[aa * size + qq] > v) { best = false; break; }
    }
    if (best) peaks.push({ v, tan: tans[a], p: q });
  }
  peaks.sort((u, w) => w.v - u.v);
  return peaks.slice(0, 14).map(pk => ({ ...pk, vertical, cx, cy }));
}

/* a line as two points for intersection */
function linePts(l, W, H) {
  return l.vertical ? [[l.p + (0 - l.cy) * l.tan, 0], [l.p + (H - l.cy) * l.tan, H]] : [[0, l.p + (0 - l.cx) * l.tan], [W, l.p + (W - l.cx) * l.tan]];
}
function intersect([a, b], [c, d]) {
  const den = (a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]); if (Math.abs(den) < 1e-6) return null;
  const t = ((a[0] - c[0]) * (c[1] - d[1]) - (a[1] - c[1]) * (c[0] - d[0])) / den;
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}
function support(mag, W, H, p, q, thr) {
  const n = 48; let hit = 0;
  for (let k = 0; k <= n; k++) {
    const x = Math.round(p[0] + (q[0] - p[0]) * k / n), y = Math.round(p[1] + (q[1] - p[1]) * k / n);
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
    let m = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) m = Math.max(m, mag[(y + dy) * W + x + dx]);
    if (m > thr) hit++;
  }
  return hit / (n + 1);
}
/* interior statistics: edge density (texture) and tonal spread (a door face is calm and even) */
function interior(mag, g, W, H, c, thr) {
  const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
  const x0 = Math.max(1, Math.round(Math.min(...xs) * .85 + Math.max(...xs) * .15)), x1 = Math.min(W - 2, Math.round(Math.min(...xs) * .15 + Math.max(...xs) * .85));
  const y0 = Math.max(1, Math.round(Math.min(...ys) * .85 + Math.max(...ys) * .15)), y1 = Math.min(H - 2, Math.round(Math.min(...ys) * .15 + Math.max(...ys) * .85));
  let n = 0, e = 0, sum = 0, sq = 0;
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const i = y * W + x; n++; if (mag[i] > thr) e++; sum += g[i]; sq += g[i] * g[i]; }
  if (!n) return { density: 1, std: 99 };
  const mean = sum / n; return { density: e / n, std: Math.sqrt(Math.max(0, sq / n - mean * mean)) };
}

/* returns { corners: [[x,y] TL, TR, BR, BL] normalised 0..1, score 0..1 } or null */
export function detectDoor(img) {
  const gi = toGray(img), { W, H } = gi, { mag, gx, gy } = sobel(gi);
  // adaptive threshold: 80th percentile of the gradient magnitude
  const sample = []; for (let i = 0; i < mag.length; i += 7) sample.push(mag[i]);
  sample.sort((a, b) => a - b); const thr = Math.max(40, sample[Math.floor(sample.length * .82)]), thrLow = thr * .55;
  const V = hough(W, H, mag, gx, gy, true, thr), Hh = hough(W, H, mag, gx, gy, false, thr);
  let best = null;
  for (let i = 0; i < V.length; i++) for (let j = 0; j < V.length; j++) {
    const L = V[i], R = V[j]; const width = R.p - L.p; if (width < .22 * W || width > .95 * W) continue;
    for (let k = 0; k < Hh.length; k++) for (let m = 0; m < Hh.length; m++) {
      const T = Hh[k], B = Hh[m]; const height = B.p - T.p; if (height < .14 * H || height > .8 * H) continue;
      if (B.p < .4 * H) continue;   // the door stands in the lower part of the picture
      const lL = linePts(L, W, H), lR = linePts(R, W, H), lT = linePts(T, W, H), lB = linePts(B, W, H);
      const TL = intersect(lL, lT), TR = intersect(lR, lT), BR = intersect(lR, lB), BL = intersect(lL, lB);
      if (!TL || !TR || !BR || !BL) continue;
      const c = [TL, TR, BR, BL];
      if (c.some(p => p[0] < -.04 * W || p[0] > 1.04 * W || p[1] < -.04 * H || p[1] > 1.04 * H)) continue;
      const wTop = TR[0] - TL[0], wBot = BR[0] - BL[0], hL = BL[1] - TL[1], hR = BR[1] - TR[1];
      if (wTop <= 0 || wBot <= 0 || hL <= 0 || hR <= 0) continue;
      const ar = ((wTop + wBot) / 2) / ((hL + hR) / 2);
      const arPrior = ar >= 1.05 && ar <= 2.9 ? 1 : ar < 1.05 ? Math.max(.2, ar / 1.05) : Math.max(.2, 2.9 / ar);
      const sup = [support(mag, W, H, TL, TR, thrLow), support(mag, W, H, TR, BR, thrLow), support(mag, W, H, BR, BL, thrLow), support(mag, W, H, BL, TL, thrLow)];
      const minSup = Math.min(...sup), meanSup = sup.reduce((a, b) => a + b, 0) / 4;
      if (minSup < .35) continue;
      const area = ((wTop + wBot) / 2) * ((hL + hR) / 2) / (W * H);
      const sizePrior = Math.min(1, Math.pow(area / .12, .5));
      const { density, std } = interior(mag, gi.g, W, H, c, thr);
      const calm = (density < .08 ? 1 : Math.max(.35, 1 - (density - .08) * 3)) * (std < 28 ? 1 : Math.max(.4, 1 - (std - 28) / 70));
      const cxq = (TL[0] + TR[0] + BR[0] + BL[0]) / 4 / W, centre = 1 - Math.min(.5, Math.abs(cxq - .5)) * .6;   // doors sit near the middle of a garage photo
      const score = (.6 * meanSup + .4 * minSup) * arPrior * sizePrior * calm * centre;
      if (!best || score > best.score) best = { score, corners: c.map(p => [p[0] / W, p[1] / H]), ar, area, inner: density, std };
    }
  }
  return best;
}
