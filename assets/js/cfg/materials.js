/* DTT Tor-Studio · Materialien (PBR, Texturen in Metern) */
import * as THREE from 'three';
import { RAL, STAINS, ESSENCES, METAL, STONES, SPECIAL_WOOD, MODELS } from './catalog.js';

export const TEX = 'assets/tex/';

export function createMaterials(renderer, manager) {
  const loader = new THREE.TextureLoader(manager);
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const cache = new Map();
  function tx(file, { srgb = false, tile = 1, wrap = true, mirror = false } = {}) {
    const key = file + '|' + tile + '|' + mirror;
    if (cache.has(key)) return cache.get(key);
    const t = loader.load(TEX + file);
    if (wrap) { t.wrapS = t.wrapT = mirror ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping; t.repeat.set(1 / tile, 1 / tile); }
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = maxAniso;
    cache.set(key, t); return t;
  }
  const pbr = (name, tile, { rough = true, mirror = false } = {}) => ({ map: tx(name + '_d.jpg', { srgb: true, tile, mirror }), normalMap: tx(name + '_n.jpg', { tile, mirror }), roughnessMap: rough ? tx(name + '_r.jpg', { tile, mirror }) : null });
  const std = (o) => new THREE.MeshStandardMaterial(o);
  /* soft value-noise blotches (lightMap on uv channel 0) to break up large tiled surfaces */
  const noiseCache = new Map();
  function noiseTex(lo, hi, metres = 14) {
    const key = lo + '|' + hi + '|' + metres; if (noiseCache.has(key)) return noiseCache.get(key);
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const ctx = c.getContext('2d');
    const img = ctx.createImageData(N, N), g = 8, grid = []; let seed = 7 + metres;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let y = 0; y <= g; y++) { grid[y] = []; for (let x = 0; x <= g; x++) grid[y][x] = rnd(); }
    const sm = t => t * t * (3 - 2 * t);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = x / N * g, fy = y / N * g, x0 = Math.floor(fx) % g, y0 = Math.floor(fy) % g, tx_ = sm(fx - Math.floor(fx)), ty_ = sm(fy - Math.floor(fy));
      const a = grid[y0][x0], b = grid[y0][(x0 + 1) % g], cc = grid[(y0 + 1) % g][x0], d = grid[(y0 + 1) % g][(x0 + 1) % g];
      const v = (a * (1 - tx_) + b * tx_) * (1 - ty_) + (cc * (1 - tx_) + d * tx_) * ty_;
      const l = Math.round(255 * (lo + (hi - lo) * v)); const i = (y * N + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = l; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / metres, 1 / metres); t.channel = 0; t.colorSpace = THREE.NoColorSpace;
    noiseCache.set(key, t); return t;
  }

  const M = {
    plaster: std({ color: 0xefece5, roughness: .93, normalMap: tx('plaster_n.jpg', { tile: 2.2, mirror: true }), normalScale: new THREE.Vector2(.28, .28), lightMap: noiseTex(.85, 1.0), lightMapIntensity: 1 }),
    interior: std({ color: 0xe6e4df, roughness: .95 }),
    plinth: std({ color: 0x55585c, roughness: .9, normalMap: tx('plaster_n.jpg', { tile: 2.2, mirror: true }), normalScale: new THREE.Vector2(.3, .3) }),
    frame: std({ color: 0x2a2d30, roughness: .42, metalness: .55 }),          // anthracite RAL 7016 textured steel frame
    chrome: std({ color: 0xdadcdd, metalness: 1, roughness: .2 }),
    metal: std({ color: 0x9da2a6, metalness: .85, roughness: .38 }),
    glass: std({ color: 0x4a6070, metalness: .85, roughness: .08, envMapIntensity: 1.3 }),
    darkMetal: std({ color: 0x2f3234, roughness: .5, metalness: .6 }),
    galv: std({ color: 0xb7bcc0, roughness: .45, metalness: .8 }),            // galvanised counterweight boxes
    sill: std({ color: 0xc9ccce, roughness: .45, metalness: .35 }),
    seal: std({ color: 0x141414, roughness: .92 }),
    gravel: std({ ...pbr('gravel', 1.1), roughness: 1, color: 0xd6d3cd }),
    garageFloor: std({ ...pbr('garagefloor', 3), roughness: 1 }),
    pavers: std({ ...pbr('pavers', 2.0, { mirror: true }), roughness: 1, lightMap: noiseTex(.8, 1.0, 9), lightMapIntensity: 1 }),
    concrete: std({ ...pbr('concrete', 2.0), roughness: 1 }),
    asphalt: std({ ...pbr('asphalt', 4), roughness: 1 }),
    lawn: std({ map: tx('lawn_d.jpg', { srgb: true, tile: 2.6, mirror: true }), normalMap: tx('lawn_n.jpg', { tile: 2.6, mirror: true }), normalScale: new THREE.Vector2(.5, .5), roughness: 1, lightMap: noiseTex(.62, 1.0, 18), lightMapIntensity: 1 }),
    hedge: std({ map: tx('hedge_d.jpg', { srgb: true, tile: 1.1 }), normalMap: tx('hedge_n.jpg', { tile: 1.1 }), normalScale: new THREE.Vector2(.8, .8), roughness: 1 }),
    cladding: std({ ...pbr('wood_clad', 1.25), roughness: 1, color: 0xd9c0a0 }),
    kerb: std({ color: 0xb4b1aa, roughness: .9 }),
    door: new THREE.MeshPhysicalMaterial({ color: 0x383e3f, roughness: .55, metalness: .05 }),
    doorDark: std({ color: 0x1a1a1a, roughness: .8 }),
    handle: std({ color: 0x3a3d40, roughness: .5, metalness: .4 }),
    drive: std({ color: 0xc4c7ca, roughness: .5, metalness: .3 }),
    lamp: std({ color: 0xfff1c8, emissive: 0xffd48a, emissiveIntensity: .9 }),
    trunk: std({ color: 0x5b4636, roughness: 1 }),
    studioFloor: std({ color: 0xe4e5e7, roughness: .32, metalness: 0, envMapIntensity: .6 }),
    studioWall: std({ color: 0xe9eaec, roughness: .95 }),
  };
  [M.cladding.map, M.cladding.normalMap, M.cladding.roughnessMap].forEach(t => { t.center.set(.5, .5); t.rotation = Math.PI / 2; });
  let matBrick = null, matTiles = null;
  const brickMat = () => matBrick || (matBrick = std({ ...pbr('brick', 2.4), roughness: 1 }));
  const tileMat = () => matTiles || (matTiles = std({ ...pbr('rooftile', 2.2), roughness: 1 }));
  const cutoutCache = new Map();
  function cutoutMat(file) {
    if (cutoutCache.has(file)) return cutoutCache.get(file);
    const m = std({ map: tx(file, { srgb: true, wrap: false }), alphaTest: .5, side: THREE.DoubleSide, roughness: 1 });
    cutoutCache.set(file, m); return m;
  }
  const sets = {};
  const woodSet = (base) => sets['w' + base] || (sets['w' + base] = pbr('wood_' + base, 1.0));
  const specialSet = (name, tile) => sets[name] || (sets[name] = pbr(name, tile, { mirror: true }));
  const fineStructure = tx('finestructure_n.jpg', { tile: .22 });
  const paintRough = tx('paint_r.jpg', { tile: .7 });
  const WOOD_BASE_MEAN = { okoume: '#e09e6f', oak: '#a67c4e', larch: '#9f7447', fir: '#e6cfa9' };
  const lin = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };

  /* Door surface from the configuration state */
  function applyDoor(state) {
    const d = M.door, model = MODELS[state.model] || MODELS.vip;
    const had = [!!d.map, !!d.normalMap, !!d.roughnessMap];
    d.map = null; d.normalMap = null; d.roughnessMap = null; d.metalness = 0; d.clearcoat = 0; d.color.set(0xffffff); d.normalScale.set(1, 1);
    let dark = '#1a1a1a', label = '';
    if (model.family === 'materia') {
      const st = STONES[model.stone]; Object.assign(d, specialSet(st.tex, 1.0)); d.roughness = 1; d.normalScale.set(.9, .9); dark = '#2a2826'; label = 'Sandstein ' + st.name;
    } else if (model.family === 'japan') {
      const sw = SPECIAL_WOOD[model.wood]; Object.assign(d, specialSet(sw.tex, .98)); d.roughness = model.wood === 'sugi' ? .7 : 1; d.normalScale.set(1.1, 1.1); if (model.wood === 'sugi') d.color.setRGB(1.5, 1.3, 1.15); dark = model.wood === 'sugi' ? '#050505' : '#4a4138'; label = sw.name;
    } else if (state.surface === 'metal') {
      const mt = METAL.find(m => m.id === state.color) || METAL[0]; Object.assign(d, specialSet(mt.tex, 1.2));
      d.color.set(mt.hex).multiplyScalar(1.45); d.metalness = .4; d.roughness = .48; d.normalScale.set(.4, .4); d.clearcoat = .25; d.clearcoatRoughness = .5; dark = new THREE.Color(mt.hex).multiplyScalar(.35).getStyle(); label = 'Metal Skin ' + mt.name;
    } else if (state.surface === 'paint') {
      const ral = RAL.find(r => r.id === state.color) || RAL[0];
      d.roughnessMap = paintRough; d.normalMap = fineStructure; d.normalScale.set(.22, .22); d.color.set(ral.hex); d.roughness = state.finish === 'seide' ? .34 : .5; d.metalness = .04;
      d.clearcoat = state.finish === 'seide' ? .55 : .12; d.clearcoatRoughness = state.finish === 'seide' ? .3 : .6;
      dark = new THREE.Color(ral.hex).multiplyScalar(.42).getStyle(); label = `RAL ${ral.id} ${ral.name}`;
    } else {
      // stain or natural essence: photographic grain tinted to the manufacturer chart colour
      const ess = ESSENCES.find(e => e.id === state.essence) || ESSENCES[0];
      const stain = state.surface === 'stain' ? STAINS.find(s => s.id === state.color) : null;
      const set = woodSet(ess.base), tgt = lin(stain ? stain.hex : ess.hex), base = lin(WOOD_BASE_MEAN[ess.base]);
      Object.assign(d, set);
      d.color.setRGB(Math.min(1.9, tgt[0] / base[0]), Math.min(1.9, tgt[1] / base[1]), Math.min(1.9, tgt[2] / base[2]));
      d.normalScale.set(ess.brushed ? 1.6 : 1.0, ess.brushed ? 1.6 : 1.0); d.roughness = .88;
      dark = new THREE.Color(stain ? stain.hex : ess.hex).multiplyScalar(.45).getStyle(); label = stain ? `${ess.name}, ${stain.name} imprägniert` : `${ess.name} natur`;
    }
    // all grain textures run vertically; horizontal models (FOR, GEO, Multidoga, Bidoga) turn the grain by 90 degrees
    const horizontal = model.grain === 'h' || model.pattern === 'hboard' || (model.pattern === 'hgroove' && model.family !== 'linee') || model.horizontal;
    // the larch photo runs horizontally (board wall), every other grain texture vertically
    const base = (state.surface === 'stain' || state.surface === 'natural') && (ESSENCES.find(e => e.id === state.essence) || {}).base === 'larch' ? Math.PI / 2 : 0;
    [d.map, d.normalMap, d.roughnessMap].forEach(t => { if (!t) return; t.center.set(.5, .5); t.rotation = (horizontal ? Math.PI / 2 : 0) + base; });
    M.doorDark.color.set(dark);
    if (had[0] !== !!d.map || had[1] !== !!d.normalMap || had[2] !== !!d.roughnessMap) d.needsUpdate = true;
    M.doorDark.needsUpdate = true;
    return label;
  }

  return { M, tx, pbr, brickMat, tileMat, cutoutMat, woodSet, applyDoor, prefetch: () => { ['okoume', 'oak', 'larch'].forEach(woodSet); brickMat(); tileMat(); } };
}
