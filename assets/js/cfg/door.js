/* DTT Tor-Studio · Torgeometrie
   Maßhaltig nach Herstellerangaben (Torblatt 80 mm, Rahmenpfosten 110 mm, Gegengewichtskasten 370 mm tief, Fräsnut 9 × 5 mm).
   Jede Fräsung ist echte Geometrie: dunkle Rückplatte + erhabene Leisten/Kassetten, keine koplanaren Flächen. */
import * as THREE from 'three';
import { MODELS, HANDLES, pillarFor } from './catalog.js';

const LEAF_T = .08;        // Torblattstärke 80 mm
const GROOVE_W = .009;     // Nutbreite 9 mm (Fig. 9)
const GROOVE_D = .005;     // Nuttiefe 5 mm
const JOINT = .004;        // Brettfuge
export const PILLAR = .11; // Rahmenpfosten 110 mm
const CW_D = .37, CW_W = .11;   // Gegengewichtskasten

/* ---------- geometry helpers ---------- */
function boxUV(geo, w, h, d, rotZ = false) {
  const uv = geo.attributes.uv, per = uv.count / 6, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < per; i++) {
    const k = f * per + i; let u = uv.getX(k) * dims[f][0], v = uv.getY(k) * dims[f][1];
    if (rotZ && f >= 4) { const t = u; u = v; v = t; }
    uv.setXY(k, u, v);
  }
  return geo;
}
export const box = (w, h, d, mat, x = 0, y = 0, z = 0, opt = {}) => {
  const m = new THREE.Mesh(boxUV(new THREE.BoxGeometry(w, h, d), w, h, d, !!opt.rot), mat);
  m.position.set(x, y, z); m.castShadow = opt.shadow !== false; m.receiveShadow = opt.shadow !== false; return m;
};
/* merge many boxes into one mesh (hundreds of fine ribs stay one draw call); UVs in metres with a world offset so the grain is continuous */
class Merger {
  constructor() { this.pos = []; this.nor = []; this.uv = []; }
  box(w, h, d, x, y, z, { rot = false, ox = 0, oy = 0 } = {}) {
    const g = boxUV(new THREE.BoxGeometry(w, h, d), w, h, d, rot).toNonIndexed();
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      this.pos.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z); this.nor.push(n.getX(i), n.getY(i), n.getZ(i));
      this.uv.push(u.getX(i) + ox + x, u.getY(i) + oy + y);
    }
    g.dispose();
  }
  geometry(geo, x = 0, y = 0, z = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo; const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { this.pos.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z); this.nor.push(n.getX(i), n.getY(i), n.getZ(i)); this.uv.push(u ? u.getX(i) + x : 0, u ? u.getY(i) + y : 0); }
  }
  mesh(mat, shadow = true) {
    if (!this.pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    const m = new THREE.Mesh(g, mat); m.castShadow = shadow; m.receiveShadow = shadow; return m;
  }
}
/* Sutherland–Hodgman polygon clip against an axis-aligned rectangle */
function clipPoly(poly, [x0, y0, x1, y1]) {
  const edges = [[p => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]], [p => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [p => p[1] >= y0, (a, b) => [a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0]], [p => p[1] <= y1, (a, b) => [a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1]]];
  let out = poly;
  for (const [inside, cross] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      if (inside(b)) { if (!inside(a)) out.push(cross(a, b)); out.push(b); } else if (inside(a)) out.push(cross(a, b));
    }
    if (!out.length) return out;
  }
  return out;
}
function prism(poly, depth) {   // extruded polygon, front at z = depth, back at z = 0
  if (poly.length < 3) return null;
  const s = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], p[1])));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { /* ExtrudeGeometry already uses world xy as uv */ }
  return g;
}
function arcShape(w, h, r, depth) {   // rectangle with a semicircular top: width w, straight height h, radius r
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.absarc(0, h, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

/* ---------- leaf: back plate + milling pattern ---------- */
export function makeLeaf(w, h, modelId, M, { depth = LEAF_T, band = null, joints = true, windows = null } = {}) {
  const model = MODELS[modelId] || MODELS.vip, pat = model.pattern;
  const g = new THREE.Group();
  const m = joints ? .003 : 0;
  const raise = ['vgroove', 'hgroove', 'chevron', 'ribs', 'flat'].includes(pat) ? GROOVE_D : (pat === 'hboard' || pat === 'slab' ? .008 : .018);
  const yR = [-h / 2 + m, h / 2 - m], xR = [-w / 2 + m, w / 2 - m];
  const RAIL = .05, ex = band ? [band[0] - RAIL, band[1] + RAIL] : null;
  const face = new Merger(), dark = new Merger();
  const plates = band ? [[-h / 2, band[0]], [band[1], h / 2]] : [[-h / 2, h / 2]];
  plates.forEach(([a, b]) => {
    dark.box(w, b - a, depth, 0, (a + b) / 2, -depth / 2);          // dark core = grooves and joints
    face.box(w, b - a, .004, 0, (a + b) / 2, -depth - .002, { rot: true });   // rear skin in the door finish (seen from inside)
  });
  const clipY = (ranges) => !ex ? ranges : ranges.flatMap(([a, b]) => { if (b <= ex[0] || a >= ex[1]) return [[a, b]]; const o = []; if (a < ex[0] - .01) o.push([a, ex[0] - .01]); if (b > ex[1] + .01) o.push([ex[1] + .01, b]); return o; }).filter(([a, b]) => b - a > .02);
  const hStrip = (y0, y1, x0 = xR[0], x1 = xR[1], r = raise) => face.box(x1 - x0, y1 - y0, r, (x0 + x1) / 2, (y0 + y1) / 2, r / 2, { rot: true });
  const vStrip = (x0, x1, y0, y1, r = raise) => face.box(x1 - x0, y1 - y0, r, (x0 + x1) / 2, (y0 + y1) / 2, r / 2);
  const cassette = (x, y, cw, ch, r = .014) => { dark.box(cw + .05, ch + .05, .003, x, y, raise + .0015); face.box(cw, ch, r, x, y, raise + .003 + r / 2, { rot: true }); };

  if (pat === 'flat') {
    // three vertical fields with 9 mm joints (FLAT, Piana, Liscio)
    const n = w > 1.6 ? 3 : 1, fw = (xR[1] - xR[0] - (n - 1) * GROOVE_W) / n;
    clipY([yR]).forEach(([a, b]) => { for (let i = 0; i < n; i++) vStrip(xR[0] + i * (fw + GROOVE_W), xR[0] + i * (fw + GROOVE_W) + fw, a, b); });
  }
  if (pat === 'vgroove' || pat === 'ribs') {
    const pitch = model.pitch || .1, gw = pat === 'ribs' ? pitch * .35 : GROOVE_W;
    const n = Math.max(2, Math.round((xR[1] - xR[0]) / pitch)), sw = (xR[1] - xR[0]) / n;
    const horizontal = model.horizontal;
    clipY([yR]).forEach(([a, b]) => {
      if (!horizontal) for (let i = 0; i < n; i++) vStrip(xR[0] + i * sw + (i ? gw / 2 : 0), xR[0] + (i + 1) * sw - (i < n - 1 ? gw / 2 : 0), a, b);
      else { const nh = Math.max(2, Math.round((b - a) / pitch)), sh = (b - a) / nh; for (let i = 0; i < nh; i++) hStrip(a + i * sh + (i ? gw / 2 : 0), a + (i + 1) * sh - (i < nh - 1 ? gw / 2 : 0)); }
    });
  }
  if (pat === 'hgroove' || pat === 'hboard') {
    const pitch = model.pitch || .25, gw = pat === 'hboard' ? JOINT : GROOVE_W;
    clipY([yR]).forEach(([a, b]) => { const n = Math.max(2, Math.round((b - a) / pitch)), sh = (b - a) / n; for (let i = 0; i < n; i++) hStrip(a + i * sh + (i ? gw / 2 : 0), a + (i + 1) * sh - (i < n - 1 ? gw / 2 : 0)); });
  }
  if (pat === 'vboard') {
    const pitch = model.pitch || .14, n = Math.max(2, Math.round((xR[1] - xR[0]) / pitch)), sw = (xR[1] - xR[0]) / n;
    clipY([yR]).forEach(([a, b]) => { for (let i = 0; i < n; i++) vStrip(xR[0] + i * sw + (i ? JOINT / 2 : 0), xR[0] + (i + 1) * sw - (i < n - 1 ? JOINT / 2 : 0), a, b, .006); });
  }
  if (pat === 'chevron') {
    // SPI: herringbone, grooves at 45 degrees meeting on the centre line
    const pitch = model.pitch || .11;
    clipY([yR]).forEach(([a, b]) => {
      [[xR[0], 0, 1], [0, xR[1], -1]].forEach(([x0, x1, s]) => {
        const rect = [x0, a, x1, b], span = (b - a) + (x1 - x0);
        for (let c = -span; c < span; c += pitch) {
          const bw = pitch - GROOVE_W;
          // band between the lines y = s*x + c and y = s*x + c + bw (parallelogram far larger than the rect, then clipped)
          const L = 20, poly = [[-L, s * -L + c], [L, s * L + c], [L, s * L + c + bw], [-L, s * -L + c + bw]];
          const pg = prism(clipPoly(poly, rect), raise); if (pg) face.geometry(pg, 0, 0, 0);
        }
      });
    });
  }
  if (pat === 'grid') {
    // BIG / Cassettata: raised cassettes in a regular grid
    clipY([yR]).forEach(([a, b]) => {
      const ah = b - a, cols = Math.max(2, Math.round((xR[1] - xR[0]) / .5)), rows = Math.max(1, Math.round(ah / .45));
      const cw = (xR[1] - xR[0]) / cols, ch = ah / rows;
      hStrip(a, b);
      for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) cassette(xR[0] + cw * (i + .5), a + ch * (r + .5), cw - .07, ch - .07);
    });
  }
  if (pat === 'old' || pat === 'ego' || pat === 'arc') {
    const cols = w > 1.3 ? 3 : 1, cw = (xR[1] - xR[0]) / cols;
    clipY([yR]).forEach(([a, b]) => {
      hStrip(a, b);
      for (let i = 0; i < cols; i++) {
        const x = xR[0] + cw * (i + .5), fw = cw - .11, ah = b - a;
        if (pat === 'old') { const th = Math.min(.42, ah * .28); cassette(x, b - .06 - th / 2, fw, th); cassette(x, a + .06 + (ah - .18 - th) / 2, fw, ah - .18 - th); }
        if (pat === 'ego') { const bandY = a + ah * .33; cassette(x, (bandY + .05 + b - .06) / 2, fw, b - .06 - bandY - .05); cassette(x, (a + .06 + bandY - .05) / 2, fw, bandY - .05 - a - .06, .006); }
        if (pat === 'arc') {
          const ph = ah - .12 - fw / 2; if (ph > .2) { const gg = arcShape(fw, ph, fw / 2, .014); face.geometry(gg, x, a + .06, raise + .003); const gd = arcShape(fw + .05, ph + .025, fw / 2 + .025, .003); dark.geometry(gd, x, a + .035, raise); }
        }
      }
    });
  }
  if (pat === 'slot' || pat === 'layer') {
    // rails top and bottom, three fields of vertical slats
    const rail = .12, fields = w > 1.3 ? 3 : 1, fw = (xR[1] - xR[0]) / fields;
    clipY([yR]).forEach(([a, b]) => {
      hStrip(b - rail, b, xR[0], xR[1], .012); hStrip(a, a + rail, xR[0], xR[1], .012);
      for (let f = 0; f < fields; f++) {
        const x0 = xR[0] + f * fw + .03, x1 = xR[0] + (f + 1) * fw - .03;
        if (f) vStrip(x0 - .03, x0 + .03, a + rail, b - rail, .012);
        if (pat === 'slot') { const n = Math.max(3, Math.round((x1 - x0) / .06)), sw = (x1 - x0) / n; for (let i = 0; i < n; i++) vStrip(x0 + i * sw + .006, x0 + (i + 1) * sw - .006, a + rail + .02, b - rail - .02, .018); }
        else { let x = x0; const ws = [.09, .04, .13, .06]; let k = f; while (x < x1 - .02) { const sw = Math.min(ws[k++ % 4], x1 - x - .012); vStrip(x, x + sw, a + rail + .02, b - rail - .02, .012 + (k % 2) * .008); x += sw + .012; } }
      }
    });
  }
  if (pat === 'matrix') {
    // staggered short vertical slats
    clipY([yR]).forEach(([a, b]) => {
      const rows = Math.max(3, Math.round((b - a) / .3)), rh = (b - a) / rows, n = Math.max(6, Math.round((xR[1] - xR[0]) / .05)), sw = (xR[1] - xR[0]) / n;
      for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { if ((i + r) % 2) continue; vStrip(xR[0] + i * sw + .004, xR[0] + (i + 1) * sw - .004, a + r * rh + .006, a + (r + 1) * rh - .006, .012); }
    });
  }
  if (pat === 'wave') {
    // ONDULÉ: horizontal half-round ribs, radius 10 mm, pitch 20 mm
    clipY([yR]).forEach(([a, b]) => {
      const n = Math.floor((b - a) / .02), geo = new THREE.CylinderGeometry(.01, .01, xR[1] - xR[0], 10, 1, false, 0, Math.PI); geo.rotateZ(Math.PI / 2); geo.rotateX(Math.PI / 2);
      for (let i = 0; i < n; i++) face.geometry(geo, 0, a + .01 + i * .02, 0);
      geo.dispose();
    });
  }
  if (pat === 'plisse') {
    // vertical pleats: triangular prisms, pitch 60 mm
    clipY([yR]).forEach(([a, b]) => {
      const n = Math.max(4, Math.round((xR[1] - xR[0]) / .06)), sw = (xR[1] - xR[0]) / n;
      const tri = new THREE.Shape([new THREE.Vector2(-sw / 2, 0), new THREE.Vector2(sw / 2, 0), new THREE.Vector2(sw / 6, .016)]);
      const geo = new THREE.ExtrudeGeometry(tri, { depth: b - a, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
      for (let i = 0; i < n; i++) face.geometry(geo, xR[0] + sw * (i + .5), a, 0);
      geo.dispose();
    });
  }
  if (pat === 'weave') {
    // INTRECCIO: basket weave of 150 mm squares, three slats each, alternating direction
    clipY([yR]).forEach(([a, b]) => {
      const sq = .15, cols = Math.max(2, Math.round((xR[1] - xR[0]) / sq)), rows = Math.max(2, Math.round((b - a) / sq)), cw = (xR[1] - xR[0]) / cols, ch = (b - a) / rows;
      for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
        const x0 = xR[0] + i * cw, y0 = a + r * ch, vert = (i + r) % 2 === 0;
        for (let k = 0; k < 3; k++) {
          if (vert) vStrip(x0 + cw * k / 3 + .004, x0 + cw * (k + 1) / 3 - .004, y0 + .004, y0 + ch - .004, .012);
          else hStrip(y0 + ch * k / 3 + .004, y0 + ch * (k + 1) / 3 - .004, x0 + .004, x0 + cw - .004, .012);
        }
      }
    });
  }
  if (pat === 'slab') {
    const n = w > 1.6 ? 3 : 1, fw = (xR[1] - xR[0] - (n - 1) * .008) / n;
    clipY([yR]).forEach(([a, b]) => { for (let i = 0; i < n; i++) vStrip(xR[0] + i * (fw + .008), xR[0] + i * (fw + .008) + fw, a, b, .008); });
  }
  // glazing band (sectional top panel): anthracite rails, mullions and reflective glass
  if (band) {
    const bh = band[1] - band[0], yc = (band[0] + band[1]) / 2, n = Math.max(1, Math.round(w / .62)), pw = w / n, mt = .05;
    const fd = depth + raise - .002, fz = (raise - depth + .002) / 2;
    g.add(box(w, RAIL, fd, M.frame, 0, band[0] - RAIL / 2, fz, { shadow: false }));
    g.add(box(w, RAIL, fd, M.frame, 0, band[1] + RAIL / 2, fz, { shadow: false }));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + i * pw; g.add(box(mt, bh, fd, M.frame, x + (i === 0 ? mt / 2 : i === n ? -mt / 2 : 0), yc, fz, { shadow: false })); }
    g.add(box(w - .02, bh - .01, .012, M.glass, 0, yc, -.02, { shadow: false }));
  }
  // built-in windows (Option D02): wooden spacers in the door colour, safety glass
  if (windows) windows.forEach(([x, y, ww, wh]) => {
    g.add(box(ww + .06, wh + .06, raise + .03, M.doorDark, x, y, (raise + .03) / 2 - .012, { shadow: false }));
    g.add(box(ww + .02, wh + .02, .03, M.door, x, y, raise + .006, { shadow: false, rot: true }));
    g.add(box(ww, wh, .012, M.glass, x, y, raise + .018, { shadow: false }));
    if (ww > .5) g.add(box(.03, wh, .02, M.door, x, y, raise + .02, { shadow: false }));
  });
  const fm = face.mesh(M.door), dm = dark.mesh(M.doorDark);
  if (dm) g.add(dm); if (fm) g.add(fm);
  g.userData.raise = raise;
  return g;
}

/* ---------- fittings ---------- */
function shellHandle(parent, x, y, z, M, handleId, color) {
  const h = HANDLES.find(v => v.id === handleId) || HANDLES[0];
  const mat = M.handle.clone(); mat.color.set(h.hex || color || '#3a3d40');
  if (h.band) { parent.add(box(.30, .022, .004, mat, x, y, z + .002, { shadow: false })); parent.add(box(.14, .022, .004, mat, x, y + .05, z + .002, { shadow: false })); return; }
  // recessed shell: dark pocket + grey shell lip, flush with the leaf
  parent.add(box(.082, .082, .03, M.doorDark, x, y, z - .014, { shadow: false }));
  parent.add(box(.096, .096, .003, mat, x, y, z + .0015, { shadow: false }));
  parent.add(box(.064, .014, .014, mat, x, y + .022, z - .006, { shadow: false }));
  parent.add(box(.014, .05, .006, mat, x, y - .012, z - .02, { shadow: false }));
}
function bottomTrim(parent, w, y, z, M, color) { const mat = M.handle.clone(); mat.color.set(color || '#3a3d40'); parent.add(box(w, .06, .006, mat, 0, y + .03, z + .003, { shadow: false })); }
function seal(parent, w, y, z, M) { parent.add(box(w, .03, .03, M.seal, 0, y - .015, z, { shadow: false })); }
export const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ---------- complete door rig ----------
   dims: dw, dh = clear opening (m), T = wall thickness, H = garage height. studio = door alone (frame + counterweights visible) */
export function buildDoorRig({ M, state, dims, studio = false }) {
  const { dw, dh, T, H } = dims;
  const type = state.type, model = MODELS[state.model];
  const g = new THREE.Group(), snap = new THREE.Group(); g.add(snap);
  const handleColor = state.handle === 'ral' ? M.door.color.getStyle() : null;
  const windows = () => {
    if (!state.windows) return null;
    const ww = state.windows === 'l' ? .8 : .4, wh = .3;
    return [[-dw / 4, 0, ww, wh], [dw / 4, 0, ww, wh]];
  };
  let animate = () => {};
  const transomH = state.transom ? .45 : 0;

  if (type === 'sr') {
    const n = dh > 2.4 ? 5 : 4, ph = dh / n, w = dw + .08, R = .36, Ht = dh + .12, zL = -T - .035, parts = [];
    for (let i = 0; i < n; i++) {
      const top = i === n - 1, band = state.glazing && top ? [-ph / 2 + .1, ph / 2 - .1] : null;
      const leaf = makeLeaf(w, ph, state.model, M, { band, windows: i === n - 2 && !state.glazing ? windows()?.map(v => [v[0], 0, v[2], Math.min(v[3], ph - .16)]) : null });
      if (i === 0) { shellHandle(leaf, 0, 0, leaf.userData.raise, M, state.handle, handleColor); seal(leaf, w, -ph / 2, -.02, M); }
      const y0 = ph * i + ph / 2; leaf.position.set(0, y0, zL); snap.add(leaf); parts.push({ p: leaf, y0 });
    }
    [-1, 1].forEach(s => { g.add(box(.05, Ht + .3, .06, M.metal, s * (w / 2 + .05), (Ht + .3) / 2, zL - .06, { shadow: false })); g.add(box(.05, .06, 3.0, M.metal, s * (w / 2 + .05), Ht + R + .02, zL - R - 1.5, { shadow: false })); });
    if (state.drive !== 'manual') { g.add(box(.06, .08, 3.4, M.drive, 0, H - .07, zL - 1.85, { shadow: false })); g.add(box(.3, .17, .44, M.drive, 0, H - .12, zL - 3.7, { shadow: false })); }
    const smax = (Ht - parts[0].y0) + R * Math.PI / 2 + .12;
    animate = t => { const s = ease(t) * smax; parts.forEach(({ p, y0 }) => { const d1 = Ht - y0;
      if (s < d1) { p.position.set(0, y0 + s, zL); p.rotation.x = 0; }
      else if (s < d1 + R * Math.PI / 2) { const a = (s - d1) / R; p.position.set(0, Ht + R * Math.sin(a), zL - R * (1 - Math.cos(a))); p.rotation.x = -a; }
      else { p.position.set(0, Ht + R, zL - R - (s - d1 - R * Math.PI / 2)); p.rotation.x = -Math.PI / 2; } }); };
  }

  if (type === 'sl') {
    // side sectional: vertical slats run on a floor rail, turn the corner and park along the left garage wall
    const n = Math.max(4, Math.round(dw / .5)), pw = (dw + .06) / n, h = dh - .06, zL = -T - .05, R = .3, parts = [];
    for (let i = 0; i < n; i++) {
      const leaf = makeLeaf(pw, h, state.model, M, {}); const x0 = -dw / 2 - .03 + pw * (i + .5);
      leaf.position.set(x0, h / 2 + .03, zL); snap.add(leaf); parts.push({ p: leaf, x0 });
      if (i === Math.floor(n / 2)) shellHandle(leaf, 0, 1.05 - h / 2, leaf.userData.raise, M, state.handle, handleColor);
    }
    g.add(box(dw + .2, .05, .05, M.metal, 0, h + .09, zL, { shadow: false }));
    g.add(box(.05, .05, 4.0, M.metal, -dw / 2 - .1 - R, h + .09, zL - R - 2.0, { shadow: false }));
    const xc = -dw / 2 - .1;   // corner x
    animate = t => { const s = ease(t) * (dw + .3 + R * Math.PI / 2); parts.forEach(({ p, x0 }, i) => {
      const d1 = x0 - xc - pw / 2 + i * .002;
      if (s < d1) { p.position.x = x0 - s; p.position.z = zL; p.rotation.y = 0; }
      else if (s < d1 + R * Math.PI / 2) { const a = (s - d1) / R; p.position.x = xc - R * Math.sin(a) + pw / 2 * Math.cos(a) - pw / 2; p.position.z = zL - R * (1 - Math.cos(a)) - pw / 2 * Math.sin(a); p.rotation.y = a; }
      else { p.position.x = xc - R - pw / 2; p.position.z = zL - R - (s - d1 - R * Math.PI / 2) - pw / 2; p.rotation.y = Math.PI / 2; } }); };
  }

  if (type === 'secur' || type === 'basculap') {
    // SECUR: frame pillars 110 mm, 80 mm leaf flush with the frame, counterweight boxes 370 mm deep beside the opening (inside)
    const P = pillarFor(state.w, state.h, state.pedestrian) / 1000, FM = type === 'secur' ? M.door : M.frame;
    const fh = dh, fw = dw, zF = -.05, lw = fw - 2 * P + .02, lh = fh - P - .03 + .01, lz = zF + .005;
    const frame = new THREE.Group();
    frame.add(box(P, fh, LEAF_T + .02, FM, -(fw / 2 - P / 2), fh / 2, zF - .01));
    frame.add(box(P, fh, LEAF_T + .02, FM, (fw / 2 - P / 2), fh / 2, zF - .01));
    frame.add(box(fw - 2 * P + .002, P, LEAF_T + .02, FM, 0, fh - P / 2, zF - .01, { rot: true }));
    // 12 mm shadow gap between frame and leaf, as on the real door
    [-1, 1].forEach(sgn => frame.add(box(.012, lh, .03, M.doorDark, sgn * (lw / 2 + .004), lh / 2 + .02, zF - .012, { shadow: false })));
    frame.add(box(lw + .02, .012, .03, M.doorDark, 0, lh + .026, zF - .012, { shadow: false }));
    snap.add(frame);
    if (studio || true) { [-1, 1].forEach(s => { g.add(box(CW_W, fh - .02, CW_D, M.galv, s * (fw / 2 - CW_W / 2), (fh - .02) / 2, zF - LEAF_T - CW_D / 2 - .02, { shadow: studio })); }); }
    const pivot = new THREE.Group(); pivot.position.set(0, lh + .02, lz);
    const leaf = makeLeaf(lw, lh, state.model, M, { joints: false, windows: windows()?.map(v => [v[0], lh / 2 - .45, v[2], v[3]]) });
    leaf.position.set(0, -lh / 2, 0);
    shellHandle(leaf, 0, 1.05 - lh / 2 - .02, leaf.userData.raise, M, state.handle, handleColor);
    bottomTrim(leaf, lw, -lh / 2, leaf.userData.raise, M, handleColor); seal(leaf, lw, -lh / 2, -.02, M);
    if (state.pedestrian) {   // pedestrian door outline on the right, own handle
      const px = lw / 2 - .46, pw = .8, ph = lh - .1;
      leaf.add(box(pw + .01, .006, LEAF_T + .03, M.doorDark, px, -lh / 2 + ph, -LEAF_T / 2 + .012, { shadow: false }));
      leaf.add(box(.006, ph, LEAF_T + .03, M.doorDark, px - pw / 2, -lh / 2 + ph / 2, -LEAF_T / 2 + .012, { shadow: false }));
      leaf.add(box(.006, ph, LEAF_T + .03, M.doorDark, px + pw / 2, -lh / 2 + ph / 2, -LEAF_T / 2 + .012, { shadow: false }));
      leaf.add(box(.02, .12, .02, M.chrome, px - pw / 2 + .09, 1.05 - lh / 2, leaf.userData.raise + .012, { shadow: false }));
    }
    if (state.grille) { leaf.add(box(.4, .2, .012, M.frame, -lw / 2 + .45, -lh / 2 + .25, leaf.userData.raise + .004, { shadow: false })); for (let i = 0; i < 6; i++) leaf.add(box(.36, .008, .006, M.darkMetal, -lw / 2 + .45, -lh / 2 + .17 + i * .03, leaf.userData.raise + .012, { shadow: false })); }
    pivot.add(leaf); snap.add(pivot);
    // counterweight arms (visible from inside and in the studio)
    const arms = [-1, 1].map(s => { const a = box(.03, .05, lh * .55, M.galv, s * (lw / 2 - .02), 0, 0, { shadow: false }); return a; });
    const protruding = !state.nonprotruding;
    animate = t => {
      const e = ease(t);
      // leaf top travels up and back along the counterweight guides, the leaf swings to horizontal; protruding doors swing past the frame line
      // open position: leaf horizontal under the ceiling, front edge 10 cm outside the frame line (both trajectories end there);
      // protruding doors swing the lower edge out past the frame while opening, non-protruding doors retract first
      const up = .22, back = lh - .10, kz = protruding ? e : Math.min(1, e * 1.7);
      pivot.position.set(0, lh + .02 + up * e, lz - back * kz);
      pivot.rotation.x = -Math.PI / 2 * e;
      arms.forEach((a, i) => { a.position.set((i ? 1 : -1) * (lw / 2 - .02), -lh * .3 * (1 - e) - lh * .25, -lh * .2 * e); a.rotation.x = Math.PI / 2 * e * .5; });
    };
    if (state.drive !== 'manual' && !studio) { g.add(box(.5, .14, .22, M.drive, lw / 2 - .4, fh + .12, -T - .16, { shadow: false })); }
  }

  if (type === 'wing') {
    const zarge = (parent) => { const t = .07, d = .1, zc = -.088, top = .10, hv = dh - top + .01;
      parent.add(box(t, hv, d, M.door, -(dw / 2 - t / 2 + .01), hv / 2, zc, { shadow: false })); parent.add(box(t, hv, d, M.door, (dw / 2 - t / 2 + .01), hv / 2, zc, { shadow: false })); parent.add(box(dw + .02, top, d, M.door, 0, dh + .01 - top / 2, zc, { shadow: false, rot: true })); };
    zarge(snap);
    const h = dh - .11, lw = dw / 2 - .075, zL = -.06, pivots = [];
    [-1, 1].forEach(s => {
      const pivot = new THREE.Group(); pivot.position.set(s * (dw / 2 - .075), h / 2 + .03, zL + .02);
      const leaf = makeLeaf(lw, h, state.model, M, { joints: false, windows: s > 0 ? null : null }); leaf.position.set(-s * lw / 2, 0, -.02);
      shellHandle(leaf, -s * (lw / 2 - .18), 1.05 - h / 2, leaf.userData.raise, M, state.handle, handleColor); seal(leaf, lw, -h / 2, -.02, M);
      pivot.add(leaf); snap.add(pivot); pivots.push({ pivot, s });
      [.35, h / 2, h - .35].forEach(y => snap.add(box(.04, .12, .06, M.frame, s * (dw / 2 - .085), y + .03, zL + .01, { shadow: false })));
      if (state.drive !== 'manual' && !studio) g.add(box(.55, .1, .1, M.drive, s * (dw / 2 - .4), dh - .16, -T - .12, { shadow: false }));
    });
    animate = t => { const e = ease(t); pivots.forEach(({ pivot, s }) => { pivot.rotation.y = s * 1.75 * e; }); };
  }

  // transom above the door (blind panel in the door design, or glazed), only for SECUR
  if (transomH && (type === 'secur' || type === 'basculap')) {
    const tw = dw, th = transomH, zF = -.05;
    if (state.transom === 'glass') {
      snap.add(box(tw, th, .06, M.frame, 0, dh + th / 2, zF - .03)); snap.add(box(tw - .12, th - .12, .012, M.glass, 0, dh + th / 2, zF - .01, { shadow: false }));
      const n = Math.max(1, Math.round(tw / .9)); for (let i = 1; i < n; i++) snap.add(box(.05, th - .1, .05, M.frame, -tw / 2 + tw * i / n, dh + th / 2, zF, { shadow: false }));
    } else {
      const P = pillarFor(state.w, state.h, state.pedestrian) / 1000, FM = type === 'secur' ? M.door : M.frame;
      snap.add(box(P, th, LEAF_T + .02, FM, -(tw / 2 - P / 2), dh + th / 2, zF - .01)); snap.add(box(P, th, LEAF_T + .02, FM, (tw / 2 - P / 2), dh + th / 2, zF - .01));
      const p = makeLeaf(tw - 2 * P + .02, th - .02, state.model, M, { joints: false }); p.position.set(0, dh + th / 2, zF + .005); snap.add(p);
    }
  }
  snap.traverse(o => { o.layers.enable(1); });
  return { group: g, snap, animate, transomH };
}
