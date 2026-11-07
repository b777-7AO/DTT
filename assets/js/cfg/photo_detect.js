/* DTT Tor-Studio · Tor-Erkennung im Hausfoto (läuft komplett im Browser, kein Upload)
   Sucht das größte rechteckige, ruhige Feld mit vier kräftigen Kanten in der unteren Bildhälfte: das Garagentor.
   Verfahren: Graustufen + Sobel, Hough-Transformation für nahezu senkrechte und waagerechte Linien,
   Kandidaten-Vierecke aus Linienpaaren, Bewertung nach Kantenstütze, Seitenverhältnis, Größe und innerer Ruhe. */

const MAXW = 420;
const opt = (k, d) => (typeof window !== 'undefined' && window.__detectOpts && window.__detectOpts[k] != null) ? window.__detectOpts[k] : d;

function toGray(img) {
  const k = Math.min(1, opt('maxw', MAXW) / img.naturalWidth), W = Math.max(64, Math.round(img.naturalWidth * k)), H = Math.max(64, Math.round(img.naturalHeight * k));
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
  return peaks.slice(0, opt('peaks', 20)).map(pk => ({ ...pk, vertical, cx, cy }));
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
/* interior statistics: fine edge density (texture) and the tonal spread of coarse blocks. A door face may be ribbed or
   boarded (fine texture), but its coarse tone is even; a quad that also swallows a wall pillar or the driveway shows
   distinct coarse blocks. */
function interior(mag, g, W, H, c, thr) {
  const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
  const x0 = Math.max(1, Math.round(Math.min(...xs) * .85 + Math.max(...xs) * .15)), x1 = Math.min(W - 2, Math.round(Math.min(...xs) * .15 + Math.max(...xs) * .85));
  const y0 = Math.max(1, Math.round(Math.min(...ys) * .85 + Math.max(...ys) * .15)), y1 = Math.min(H - 2, Math.round(Math.min(...ys) * .15 + Math.max(...ys) * .85));
  let n = 0, e = 0;
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const i = y * W + x; n++; if (mag[i] > thr) e++; }
  if (!n) return { density: 1, blockStd: 99 };
  // coarse blocks: 6 x 4 grid of block means
  const means = []; const bw = (x1 - x0) / 6, bh = (y1 - y0) / 4;
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 6; bx++) {
    let sum = 0, cnt = 0;
    for (let y = Math.round(y0 + by * bh); y < y0 + (by + 1) * bh; y += 2) for (let x = Math.round(x0 + bx * bw); x < x0 + (bx + 1) * bw; x += 2) { sum += g[y * W + x]; cnt++; }
    if (cnt) means.push(sum / cnt);
  }
  const m = means.reduce((a, b) => a + b, 0) / means.length, v = means.reduce((a, b) => a + (b - m) * (b - m), 0) / means.length;
  // contrast to the surroundings: mean tone of a ring just outside the quad (a door differs from the facade around it)
  const ox0 = Math.max(1, Math.round(Math.min(...xs) - (x1 - x0) * .12)), ox1 = Math.min(W - 2, Math.round(Math.max(...xs) + (x1 - x0) * .12));
  const oy0 = Math.max(1, Math.round(Math.min(...ys) - (y1 - y0) * .12)), oy1 = Math.min(H - 2, Math.round(Math.max(...ys) + (y1 - y0) * .12));
  let osum = 0, ocnt = 0;
  for (let y = oy0; y <= oy1; y += 2) for (let x = ox0; x <= ox1; x += 2) { if (x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys)) continue; osum += g[y * W + x]; ocnt++; }
  const contrast = ocnt ? Math.abs(m - osum / ocnt) / 255 : 0;
  return { density: e / n, blockStd: Math.sqrt(v), contrast };
}

/* refinement: each side of the quad is snapped to the strongest nearby edge of matching orientation.
   The two end points of a side move independently along the side's normal (coarse 2 px steps, then 1 px) within
   ±rad px; the score is the mean oriented gradient along the line. Corners are then re-intersected. */
function lineScore(mag, gx, gy, W, H, p, q, vertical) {
  const n = 64; let s = 0, cnt = 0;
  for (let k = 0; k <= n; k++) {
    const x = Math.round(p[0] + (q[0] - p[0]) * k / n), y = Math.round(p[1] + (q[1] - p[1]) * k / n);
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
    const i = y * W + x; const o = vertical ? Math.abs(gx[i]) : Math.abs(gy[i]);
    s += Math.min(o, 255); cnt++;
  }
  return cnt ? s / cnt : 0;
}
function refineQuad(mag, gx, gy, W, H, c) {
  const rad = Math.round(Math.max(W, H) * .03), tilt = 4;
  const sides = [[0, 1, false], [1, 2, true], [2, 3, false], [3, 0, true]];
  const lines = sides.map(([a, b, vertical]) => {
    const P0 = c[a], Q0 = c[b], nx = vertical ? 1 : 0, ny = vertical ? 0 : 1;
    const sc = (dp, dq) => lineScore(mag, gx, gy, W, H, [P0[0] + nx * dp, P0[1] + ny * dp], [Q0[0] + nx * dq, Q0[1] + ny * dq], vertical);
    // 1) shift the whole side along its normal: strongest edge within ±rad, ties resolved towards the original position
    let bestD = 0, bestS = sc(0, 0);
    for (let d = -rad; d <= rad; d++) { const v = sc(d, d); if (v > bestS * 1.01 || (v > bestS && Math.abs(d) < Math.abs(bestD))) { bestS = v; bestD = d; } }
    // 2) small independent tilt of the two end points (±tilt px) by hill climbing
    let dp = bestD, dq = bestD, improved = true;
    while (improved) { improved = false;
      for (const [ep, eq] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const np = dp + ep, nq = dq + eq; if (Math.abs(np - bestD) > tilt || Math.abs(nq - bestD) > tilt) continue; const v = sc(np, nq); if (v > bestS * 1.003) { bestS = v; dp = np; dq = nq; improved = true; } } }
    return [[P0[0] + nx * dp, P0[1] + ny * dp], [Q0[0] + nx * dq, Q0[1] + ny * dq]];
  });
  const TL = intersect(lines[3], lines[0]), TR = intersect(lines[0], lines[1]), BR = intersect(lines[1], lines[2]), BL = intersect(lines[2], lines[3]);
  if (!TL || !TR || !BR || !BL) return c;
  const out = [TL, TR, BR, BL];
  return out.every((p, i) => Math.hypot(p[0] - c[i][0], p[1] - c[i][1]) <= rad * 1.8) ? out : c;
}

/* returns { corners: [[x,y] TL, TR, BR, BL] normalised 0..1, score 0..1 } or null */
export function detectDoor(img) {
  const gi = toGray(img), { W, H } = gi, { mag, gx, gy } = sobel(gi);
  // adaptive threshold: 80th percentile of the gradient magnitude
  const sample = []; for (let i = 0; i < mag.length; i += 7) sample.push(mag[i]);
  sample.sort((a, b) => a - b); const thr = Math.max(40, sample[Math.floor(sample.length * .82)]), thrLow = thr * .55;
  const V = hough(W, H, mag, gx, gy, true, thr), Hh = hough(W, H, mag, gx, gy, false, thr);
  const dbg = { W, H, V: V.map(l => [+(l.p / W).toFixed(3), +(Math.atan(l.tan) * 180 / Math.PI).toFixed(1), Math.round(l.v)]), Hh: Hh.map(l => [+(l.p / H).toFixed(3), +(Math.atan(l.tan) * 180 / Math.PI).toFixed(1), Math.round(l.v)]), cands: [] }; if (typeof window !== 'undefined') window.__detectDebug = dbg;
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
      // a door is a flat rectangle seen in perspective: opposite sides may converge (up to 35°), but only towards the shorter side
      const dTB = Math.atan(T.tan) - Math.atan(B.tan), dLR = Math.atan(L.tan) - Math.atan(R.tan);
      if (Math.abs(dTB) > 35 * Math.PI / 180 || Math.abs(dLR) > 35 * Math.PI / 180) continue;
      if (Math.abs(dTB) > 3 * Math.PI / 180) { const vp = intersect(lT, lB); if (vp && ((vp[0] < (TL[0] + TR[0]) / 2) !== (hL < hR))) continue; }   // top/bottom must meet on the side of the shorter upright
      if (Math.abs(dLR) > 3 * Math.PI / 180) { const vp = intersect(lL, lR); if (vp && ((vp[1] < (TL[1] + BL[1]) / 2) !== (wTop < wBot))) continue; }   // uprights must meet on the side of the shorter edge
      if (hL / hR < .42 || hL / hR > 2.4 || wTop / wBot < .55 || wTop / wBot > 1.8) continue;   // strong perspective: the near upright can be well over twice the far one
      const ar = ((wTop + wBot) / 2) / ((hL + hR) / 2);
      const arPrior = ar >= 1.05 && ar <= 2.9 ? 1 : ar < 1.05 ? Math.max(.2, ar / 1.05) : Math.max(.2, 2.9 / ar);
      const sup = [support(mag, W, H, TL, TR, thrLow), support(mag, W, H, TR, BR, thrLow), support(mag, W, H, BR, BL, thrLow), support(mag, W, H, BL, TL, thrLow)];
      const minSup = Math.min(...sup), meanSup = sup.reduce((a, b) => a + b, 0) / 4;
      if (minSup < .35) continue;
      const area = ((wTop + wBot) / 2) * ((hL + hR) / 2) / (W * H);
      const sizePrior = Math.min(1, Math.pow(area / .12, .5));
      const { density, blockStd, contrast } = interior(mag, gi.g, W, H, c, thr);
      const calm = (density < .12 ? 1 : Math.max(.5, 1 - (density - .12) * 2)) * (blockStd < 14 ? 1 : Math.max(.3, 1 - (blockStd - 14) / 40));   // even coarse tone = one surface
      const cxq = (TL[0] + TR[0] + BR[0] + BL[0]) / 4 / W, centre = 1 - Math.min(.5, Math.abs(cxq - .5)) * .6;   // doors sit near the middle of a garage photo
      const score = (.6 * meanSup + .4 * minSup) * arPrior * sizePrior * calm * centre * (.6 + Math.min(.4, contrast * 2));   // a door stands out from the facade around it
      dbg.cands.push({ score: +score.toFixed(3), c: c.map(p => [+(p[0] / W).toFixed(3), +(p[1] / H).toFixed(3)]), meanSup: +meanSup.toFixed(2), minSup: +minSup.toFixed(2), arPrior: +arPrior.toFixed(2), sizePrior: +sizePrior.toFixed(2), calm: +calm.toFixed(2), density: +density.toFixed(3), blockStd: +blockStd.toFixed(1), contrast: +contrast.toFixed(3), centre: +centre.toFixed(2) });
      if (!best || score > best.score) best = { score, corners: c.map(p => [p[0] / W, p[1] / H]), ar, area, inner: density, blockStd };
    }
  }
  if (best && opt('refine', true)) { const px = best.corners.map(p => [p[0] * W, p[1] * H]); const r = refineQuad(mag, gx, gy, W, H, px); best.corners = r.map(p => [p[0] / W, p[1] / H]); }
  return best;
}
