/* DTT Tor-Studio · Haus und Umgebung (aus Konfigurator v3, Wände mit echten Öffnungen) */
import * as THREE from 'three';
import { FACADE } from './catalog.js';
import { box } from './door.js';

const plane = (w, h, mat, x, y, z) => {
  const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  const m = new THREE.Mesh(g, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; return m;
};
function wall(w, h, t, openings, mat) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(0, h); s.closePath();
  openings.forEach(o => { const p = new THREE.Path(); p.moveTo(o.x, o.y); p.lineTo(o.x + o.w, o.y); p.lineTo(o.x + o.w, o.y + o.h); p.lineTo(o.x, o.y + o.h); p.closePath(); s.holes.push(p); });
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
export function dispose(obj) { obj.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }

/* returns { group, dims } ; openH = clear opening incl. transom */
export function buildHouse({ mats, state, openH }) {
  const { M, brickMat, tileMat, cutoutMat } = mats;
  const house = new THREE.Group();
  const dw = state.w / 1000, dh = openH / 1000;
  const T = .3, W = dw + 1.3, D = 6.4, H = Math.max(3.0, dh + .8);
  const dims = { dw, dh: state.h / 1000, openH: dh, W, D, H, T };
  const fac = FACADE.find(f => f.id === state.facade) || FACADE[0];
  const facade = fac.brick ? brickMat() : M.plaster;
  if (!fac.brick) M.plaster.color.set(fac.hex);

  const front = wall(W, H, T, [{ x: .65, y: 0, w: dw, h: dh }], facade); front.position.set(-W / 2, 0, 0); house.add(front);
  house.add(box(.3, H, D - T, facade, -(W / 2 - .15), H / 2, -T - (D - T) / 2));
  house.add(box(.3, H, D - T, facade, (W / 2 - .15), H / 2, -T - (D - T) / 2));
  house.add(box(W - .6, H, .3, M.interior, 0, H / 2, -D + .15));
  house.add(plane(W - .6, D - .2, M.garageFloor, 0, .02, -(D - .2) / 2 + .1));
  const slab = (w, d, xc, zc, y) => {
    house.add(box(w + .1, .3, d + .1, facade, xc, y + .15, zc));
    house.add(plane(w - .3, d - .3, M.gravel, xc, y + .302, zc));
    const ph = .32, pt = .16;
    house.add(box(w + .1, ph, pt, facade, xc, y + .3 + ph / 2, zc + d / 2 + .05 - pt / 2));
    house.add(box(w + .1, ph, pt, facade, xc, y + .3 + ph / 2, zc - d / 2 - .05 + pt / 2));
    house.add(box(pt, ph, d + .1, facade, xc - w / 2 - .05 + pt / 2, y + .3 + ph / 2, zc));
    house.add(box(pt, ph, d + .1, facade, xc + w / 2 + .05 - pt / 2, y + .3 + ph / 2, zc));
    const c = y + .3 + ph + .02;
    house.add(box(w + .18, .04, pt + .08, M.darkMetal, xc, c, zc + d / 2 + .05 - pt / 2, { shadow: false }));
    house.add(box(w + .18, .04, pt + .08, M.darkMetal, xc, c, zc - d / 2 - .05 + pt / 2, { shadow: false }));
    house.add(box(pt + .08, .04, d + .18, M.darkMetal, xc - w / 2 - .05 + pt / 2, c, zc, { shadow: false }));
    house.add(box(pt + .08, .04, d + .18, M.darkMetal, xc + w / 2 + .05 - pt / 2, c, zc, { shadow: false }));
  };
  slab(W, D, 0, -D / 2, H);
  const plinth = (x0, x1, z, depth = .04) => house.add(box(x1 - x0, .38, depth, M.plinth, (x0 + x1) / 2, .19, z, { shadow: false }));
  plinth(-W / 2 - .02, -dw / 2, 0); plinth(dw / 2, W / 2 + .02, 0);
  house.add(box(.04, .38, D, M.plinth, -W / 2, .19, -D / 2, { shadow: false }));
  house.add(box(dw + .3, .035, .5, M.kerb, 0, .0175, .22, { shadow: false }));
  [-1, 1].forEach(s => {
    house.add(box(.09, .2, .1, M.darkMetal, s * (dw / 2 + .325), dh - .25, .05, { shadow: false }));
    house.add(box(.05, .012, .06, M.lamp, s * (dw / 2 + .325), dh - .36, .06, { shadow: false }));
  });
  const bulb = new THREE.PointLight(0xfff0dc, 22, 14, 2); bulb.position.set(1.3, H - .2, -D / 2 - .6); house.add(bulb);
  house.add(box(.7, .05, .14, M.lamp, 1.3, H - .03, -D / 2 - .6, { shadow: false }));
  const pipe = (x, z, h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, h, 12), M.darkMetal); m.position.set(x, h / 2, z); m.castShadow = true; house.add(m); };
  pipe(-W / 2 - .07, .07, H + .3);

  const x0 = W / 2, hw = 8.6, hd = 9.6, zf = -.9;
  const wallH = state.roof === 'gable' ? 5.7 : 6.3;
  const xc = x0 + hw / 2, zc = zf - hd / 2;
  const wins = [{ x: 1.15, y: 3.55, w: 1.7, h: 1.5 }, { x: 4.9, y: 3.55, w: 2.6, h: 1.5 }, { x: 4.9, y: .85, w: 2.6, h: 1.9 }];
  const doorOp = { x: .6, y: 0, w: 1.1, h: 2.25 };
  const fw = wall(hw, wallH, T, [...wins, doorOp], facade); fw.position.set(x0, 0, zf); house.add(fw);
  const sideWins = [{ x: 1.3, y: 3.55, w: 2.0, h: 1.4 }, { x: 4.8, y: .85, w: 1.6, h: 1.8 }];
  const rw = wall(hd, wallH, T, sideWins, facade); rw.rotation.y = Math.PI / 2; rw.position.set(x0 + hw, 0, zf); house.add(rw);
  house.add(box(.3, wallH, hd, facade, x0 + .15, wallH / 2, zc));
  house.add(box(hw, wallH, .3, facade, xc, wallH / 2, zf - hd + .15));
  house.add(box(hw - .6, .2, hd - .6, M.interior, xc, 3.1, zc, { shadow: false }));
  const win = (o, parent, local) => {
    const g = new THREE.Group();
    const t = .07, d = .08, W2 = o.w + .02, H2 = o.h + .02;
    g.add(box(W2, t, d, M.frame, 0, H2 / 2 - t / 2, 0, { shadow: false })); g.add(box(W2, t, d, M.frame, 0, -H2 / 2 + t / 2, 0, { shadow: false }));
    g.add(box(t, H2 - 2 * t, d, M.frame, -W2 / 2 + t / 2, 0, 0, { shadow: false })); g.add(box(t, H2 - 2 * t, d, M.frame, W2 / 2 - t / 2, 0, 0, { shadow: false }));
    if (o.w > 2) g.add(box(.06, H2 - 2 * t, d, M.frame, 0, 0, 0, { shadow: false }));
    g.add(box(W2 - 2 * t + .02, H2 - 2 * t + .02, .012, M.glass, 0, 0, -.01, { shadow: false }));
    g.add(box(o.w + .24, .045, .2, M.sill, 0, -o.h / 2 - .035, .09));
    g.position.set(o.x + o.w / 2, o.y + o.h / 2, -.14); local(g); parent.add(g);
  };
  wins.forEach(o => win(o, house, g => g.position.add(new THREE.Vector3(x0, 0, zf))));
  sideWins.forEach(o => win(o, house, g => { g.rotation.y = Math.PI / 2; g.position.set(x0 + hw - .14, o.y + o.h / 2, zf - (o.x + o.w / 2)); }));
  house.add(box(1.06, 2.2, .06, M.frame, x0 + doorOp.x + .55, 1.1, zf - .2));
  house.add(box(.03, .8, .04, M.chrome, x0 + doorOp.x + .95, 1.08, zf - .15, { shadow: false }));
  house.add(box(2.1, .1, 1.25, M.darkMetal, x0 + doorOp.x + .55, 2.5, zf + .56));
  house.add(box(1.7, .15, 1.1, M.kerb, x0 + doorOp.x + .55, .075, zf + .55, { shadow: false }));
  house.add(box(.09, .2, .1, M.frame, x0 + 2.05, 2.05, zf + .04, { shadow: false }));
  house.add(box(.05, .09, .05, M.lamp, x0 + 2.05, 1.95, zf + .07, { shadow: false }));
  house.add(box(.34, .4, .12, M.darkMetal, x0 + 2.15, 1.2, zf + .05, { shadow: false }));
  const clad = wall(3.6, 2.5, .06, [{ x: wins[0].x - .2, y: wins[0].y - 3.05, w: wins[0].w, h: wins[0].h }], M.cladding);
  clad.position.set(x0 + .2, 3.05, zf + .04); house.add(clad);
  plinth(x0 + doorOp.x + doorOp.w, x0 + hw + .02, zf); plinth(x0, x0 + doorOp.x, zf);
  house.add(box(.04, .38, hd, M.plinth, x0 + hw, .19, zc, { shadow: false }));
  pipe(x0 + hw + .07, zf + .07, wallH + .2);
  if (state.roof === 'gable') {
    const rise = 2.7, run = hw / 2, o = .55;
    const s = new THREE.Shape([new THREE.Vector2(-run, 0), new THREE.Vector2(run, 0), new THREE.Vector2(0, rise)]);
    const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: hd, bevelEnabled: false }), facade);
    gable.position.set(xc, wallH, zf - hd); gable.castShadow = true; gable.receiveShadow = true; house.add(gable);
    const ang = Math.atan(rise / run), len = Math.hypot(run + o, rise * (run + o) / run) + .05;
    [-1, 1].forEach(sg => {
      const g = new THREE.Group();
      const tiles = box(len, .07, hd + .8, tileMat(), 0, .12, 0); const deck = box(len, .12, hd + .8, M.darkMetal, 0, .02, 0);
      const fascia = box(.03, .22, hd + .8, M.frame, sg * len / 2 * -1, .0, 0, { shadow: false });
      g.add(deck, tiles, fascia); g.position.set(xc + sg * (run + o) / 2, wallH + (rise - rise * o / run) / 2 + .03, zc); g.rotation.z = -sg * ang; house.add(g);
      const gutter = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, hd + .8, 12), M.darkMetal);
      gutter.rotation.x = Math.PI / 2; gutter.position.set(xc + sg * (run + o + .05), wallH - rise * o / run + .03, zc); gutter.castShadow = true; house.add(gutter);
    });
  } else slab(hw, hd, xc, zc, wallH);

  house.add(plane(400, 400, M.lawn, 0, 0, 0));
  house.add(plane(dw + 2.2, 17.2, M.pavers, 0, .02, 8.6));
  [-1, 1].forEach(s => house.add(box(.12, .07, 17.2, M.kerb, s * (dw / 2 + 1.16), .035, 8.6, { shadow: false })));
  house.add(plane(1.4, 1.6, M.concrete, x0 + doorOp.x + .55, .025, zf + 1.9));
  house.add(plane(x0 + doorOp.x + .55 - dw / 2 + 1.4, 1.4, M.concrete, (x0 + doorOp.x + .55 + dw / 2 - .8) / 2, .04, 1.9));
  house.add(plane(400, 2.0, M.concrete, 0, .03, 18.2));
  house.add(box(400, .1, .16, M.kerb, 0, .05, 19.28, { shadow: false }));
  house.add(plane(400, 9, M.asphalt, 0, .015, 23.8));
  const cross = (file, x, z, h, aspect, rot = 0, planes = 3) => {
    const g = new THREE.Group(), m = cutoutMat(file), w = h * aspect;
    for (let i = 0; i < planes; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = rot + i * Math.PI / planes; p.position.y = h / 2; p.castShadow = true; p.userData.cutout = true; g.add(p); }
    g.position.set(x, 0, z); house.add(g);
  };
  const cyp = (x, z, h = 4.6, r = 0) => cross('tree_cypress.webp', x, z, h, 164 / 1002, r);
  const lind = (x, z, h = 8.5, r = 0) => cross('tree_linden.webp', x, z, h, 837 / 993, r);
  cyp(-W / 2 - 1.3, .9, 4.4, .3); cyp(-W / 2 - 2.5, -.5, 3.9, 1.1); cyp(x0 + hw + 1.4, zf + .7, 4.8, .5); cyp(x0 + hw + 2.6, zf - 1.3, 4.2, 1.4);
  lind(-W / 2 - 7.5, -4, 9, .2); lind(x0 + hw + 8, -7.5, 8, .9); lind(-15, 11, 8.5, 1.7); lind(x0 + hw + 11, 9, 7.5, .6);
  const hedge = (x, z, w, d, h = .8) => house.add(box(w, h, d, M.hedge, x, h / 2, z));
  hedge(-W / 2 - 3.6, 4.2, 5.6, .7); hedge(x0 + hw / 2 + 1.2, zf + 4.6, 5.2, .7); hedge(-W / 2 - .6, 9.5, 1.0, 8.5, .55);
  cross('shrub.webp', x0 + .25, zf + 1.05, 1.15, 422 / 768, .4); cross('shrub.webp', x0 + doorOp.x + doorOp.w + .55, zf + 1.05, 1.15, 422 / 768, .9);
  return { group: house, dims };
}

/* Studio: neutral cyclorama, soft floor, no house */
export function buildStudio({ mats, dims }) {
  const { M } = mats; const g = new THREE.Group();
  const r = Math.max(9, dims.dw * 2.4);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(r, 72), M.studioFloor); floor.rotation.x = -Math.PI / 2; floor.position.y = -.001; floor.receiveShadow = true; g.add(floor);
  // cyclorama: back wall curving into the floor
  // profile in XY (x = depth towards the wall, y = height): floor -> quarter circle -> vertical wall, extruded along the width
  const s = new THREE.Shape(); s.moveTo(-2.5, 0); s.lineTo(0, 0); s.absarc(0, 1.2, 1.2, -Math.PI / 2, 0, false); s.lineTo(1.2, 9); s.lineTo(1.6, 9); s.lineTo(1.6, -.4); s.lineTo(-2.5, -.4); s.closePath();
  const cyc = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: r * 2, bevelEnabled: false }), M.studioWall);
  cyc.rotation.y = Math.PI / 2; cyc.position.set(-r, -.002, -(dims.T + 1.6)); cyc.receiveShadow = true; g.add(cyc);
  // soft contact shadow under the door (radial gradient sprite on the floor)
  const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 128); grd.addColorStop(0, 'rgba(0,0,0,.42)'); grd.addColorStop(.55, 'rgba(0,0,0,.16)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const cs = new THREE.Mesh(new THREE.PlaneGeometry(dims.dw + 1.2, 1.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  cs.rotation.x = -Math.PI / 2; cs.position.set(0, .004, -.12); cs.renderOrder = 1; g.add(cs);
  return g;
}
