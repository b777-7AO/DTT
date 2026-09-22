/* DTT · 3D-Tor-Konfigurator v3 (Three.js)
   Photographic PBR materials (CC0 Poly Haven + Silvelox finish references), sky HDRI lighting,
   walls with real openings and reveals (no coplanar faces), Silvelox essences, stains and RAL lacquers. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TEX = 'assets/tex/';

/* ------------------------------------------------------------------
   Options
------------------------------------------------------------------ */
const TYPES = {
  sectional: { label: 'Sektionaltor', desc: 'Läuft unter die Decke', designs: ['gross', 'mittel', 'glatt', 'linien', 'kassette'] },
  tilt:      { label: 'Schwingtor',   desc: 'Einteilig, kippt nach oben', designs: ['linien', 'glatt', 'lamellen', 'kassette'] },
  wing:      { label: 'Flügeltor',    desc: 'Zweiflügelig, öffnet nach außen', designs: ['linien', 'glatt', 'rahmen', 'lamellen'] },
};
const DESIGNS = { gross: 'Großsicke', mittel: 'Mittelsicke', glatt: 'Glatt', kassette: 'Kassette', lamellen: 'Lamellen vertikal', rahmen: 'Rahmen & Füllung', linien: 'Bretter horizontal' };
// Silvelox lacquer palette (colour values measured from the Silvelox finish charts)
const RAL = [
  { id: '9016', name: 'Verkehrsweiß', hex: '#f4f3ef' }, { id: '9010', name: 'Reinweiß', hex: '#f5f2e8' },
  { id: '1013', name: 'Perlweiß', hex: '#f1ead8' },     { id: '7035', name: 'Lichtgrau', hex: '#d1d2d0' },
  { id: '7040', name: 'Fenstergrau', hex: '#9fa0a4' },  { id: '7036', name: 'Platingrau', hex: '#a29c9b' },
  { id: '7001', name: 'Silbergrau', hex: '#a2a7af' },   { id: '7030', name: 'Steingrau', hex: '#96928a' },
  { id: '7006', name: 'Beigegrau', hex: '#79685a' },    { id: '7016', name: 'Anthrazitgrau', hex: '#383e3f' },
  { id: '7013', name: 'Braungrau', hex: '#555040' },    { id: '9005', name: 'Tiefschwarz', hex: '#0d1113' },
  { id: '9006', name: 'Weißaluminium', hex: '#a5a8a6' }, { id: '3003', name: 'Rubinrot', hex: '#8f3122' },
  { id: '3009', name: 'Oxidrot', hex: '#642c26' },      { id: '6005', name: 'Moosgrün', hex: '#164239' },
  { id: '6009', name: 'Tannengrün', hex: '#0f2e21' },   { id: '8017', name: 'Schokobraun', hex: '#42221b' },
];
// Silvelox essences (natural) and stains (on Okoumé base). base = photographic grain set, hex = target mean colour from the Silvelox chart
const WOOD = [
  { id: 'okoume',    name: 'Okoumé natur',      base: 'okoume', hex: '#c69464', sw: 'okoume' },
  { id: 'larice',    name: 'Lärche natur',      base: 'larch',  hex: '#d5a379', sw: 'larice' },
  { id: 'larice_sp', name: 'Lärche gebürstet',  base: 'larch',  hex: '#d8a473', sw: 'larice_spazz', brushed: true },
  { id: 'rovere',    name: 'Eiche natur',       base: 'oak',    hex: '#c5a176', sw: 'rovere' },
  { id: 'rovere_sp', name: 'Eiche gebürstet',   base: 'oak',    hex: '#c09c74', sw: 'rovere_spazz', brushed: true },
  { id: 'rovere_sg', name: 'Eiche sägerau',     base: 'oak',    hex: '#d5b085', sw: 'rovere_segato', rough: true },
  { id: 'miele',     name: 'Lasur Honig',       base: 'okoume', hex: '#a4743b', sw: 't_miele' },
  { id: 't_rovere',  name: 'Lasur Eiche',       base: 'okoume', hex: '#956a3b', sw: 't_rovere' },
  { id: 'douglas',   name: 'Lasur Douglasie',   base: 'okoume', hex: '#92562b', sw: 't_douglas' },
  { id: 'ciliegio',  name: 'Lasur Kirsche',     base: 'okoume', hex: '#964b21', sw: 't_ciliegio' },
  { id: 'mogano',    name: 'Lasur Mahagoni',    base: 'okoume', hex: '#7c4324', sw: 't_mogano' },
  { id: 'noce',      name: 'Lasur Nussbaum',    base: 'okoume', hex: '#6c4422', sw: 't_noce' },
  { id: 'noce_sc',   name: 'Lasur Nussbaum dunkel', base: 'okoume', hex: '#402e20', sw: 't_noce_scuro' },
  { id: 'verde',     name: 'Lasur Grün',        base: 'okoume', hex: '#46563c', sw: 't_verde' },
];
const WOOD_BASE_MEAN = { okoume: '#e09e6f', oak: '#a67c4e', larch: '#9f7447' }; // mean colour of the grain photos (used for tinting)
const LEGACY_WOOD = { eiche: 'rovere', nuss: 'noce', laerche: 'larice', teak: 'mogano', grau: 'rovere_sp', fichte: 'okoume' };
const FINISH = { matt: 'Matt', seide: 'Seidenglanz', struktur: 'Feinstruktur' };
const SIZE_PRESETS = [{ label: 'Einzelgarage', w: 2500, h: 2125 }, { label: 'Einzel hoch', w: 3000, h: 2250 }, { label: 'Doppelgarage', w: 5000, h: 2250 }, { label: 'Doppel hoch', w: 5500, h: 2500 }];
const LIMITS = { w: [2000, 6500], h: [1875, 3000] };
const FACADE = [
  { id: 'weiss', name: 'Weiß', hex: '#efece5' }, { id: 'hellgrau', name: 'Hellgrau', hex: '#cdd1d3' },
  { id: 'sand', name: 'Sandstein', hex: '#d8c8a9' }, { id: 'anthrazit', name: 'Anthrazit', hex: '#4b4e51' },
  { id: 'klinker', name: 'Klinker', hex: '#8d4b3a', brick: true },
];
const ROOF = { flat: 'Flachdach', gable: 'Satteldach' };

const state = { type: 'sectional', design: 'gross', color: '7016', finish: 'matt', glazing: false, drive: true, w: 5000, h: 2250, facade: 'weiss', roof: 'flat' };
const PRESETS = [
  { id: 'modern', label: 'Modern Anthrazit', patch: { type: 'sectional', design: 'gross', color: '7016', finish: 'matt', glazing: false } },
  { id: 'klassik', label: 'Klassisch Weiß', patch: { type: 'sectional', design: 'kassette', color: '9016', finish: 'matt', glazing: true } },
  { id: 'holz', label: 'Echtholz Okoumé', patch: { type: 'tilt', design: 'linien', color: 'okoume', glazing: false } },
  { id: 'laerche', label: 'Lärche Landhaus', patch: { type: 'wing', design: 'rahmen', color: 'larice', glazing: true } },
];
readHash();

/* ------------------------------------------------------------------
   Renderer, scene, camera, sky, sun
------------------------------------------------------------------ */
const T = { start: performance.now() };
const canvas = document.getElementById('cfgCanvas');
const wrap = document.getElementById('canvasWrap');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const loader = new THREE.TextureLoader();
const texCache = new Map();
function tx(file, { srgb = false, tile = 1, wrap = true } = {}) {
  const key = file + '|' + tile;
  if (texCache.has(key)) return texCache.get(key);
  const t = loader.load(TEX + file);
  if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile, 1 / tile); }
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = maxAniso;
  texCache.set(key, t); return t;
}
const pbr = (name, tile, { rough = true } = {}) => ({ map: tx(name + '_d.jpg', { srgb: true, tile }), normalMap: tx(name + '_n.jpg', { tile }), roughnessMap: rough ? tx(name + '_r.jpg', { tile }) : null });

const scene = new THREE.Scene();
const sky = tx('sky.jpg', { srgb: true, wrap: false });
sky.mapping = THREE.EquirectangularReflectionMapping;
scene.background = sky; scene.environment = sky;
scene.environmentIntensity = 0.8; scene.backgroundIntensity = 1.0;
// sun position measured in the sky panorama; rotate the sky so the sun lights the facade from the front left
const SUN_IN_SKY = new THREE.Vector3(0.555, 0.742, 0.377);
const SKY_ROT = 1.95;
scene.backgroundRotation.set(0, SKY_ROT, 0); scene.environmentRotation.set(0, SKY_ROT, 0);
const sunDir = SUN_IN_SKY.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -SKY_ROT).normalize();
scene.fog = new THREE.Fog(0xc9d2da, 70, 220);

const camera = new THREE.PerspectiveCamera(42, 1, 0.2, 320);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2 - 0.03; controls.minDistance = 2.2; controls.maxDistance = 34; controls.enablePan = false;

const sun = new THREE.DirectionalLight(0xfff3e0, 3.3);
sun.position.copy(sunDir).multiplyScalar(45).add(new THREE.Vector3(3, 0, 0));
sun.target.position.set(3, 0, 0); scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { near: 5, far: 110, left: -24, right: 24, top: 24, bottom: -24 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.035;
const hemi = new THREE.HemisphereLight(0xdde8ff, 0x6f7a63, 0.12);
scene.add(hemi, sun);
hemi.layers.enable(1); sun.layers.enable(1);

/* ------------------------------------------------------------------
   Materials (all texture UVs are in metres; textures repeat per tile size)
------------------------------------------------------------------ */
const std = (o) => new THREE.MeshStandardMaterial(o);
const M = {
  plaster: std({ color: 0xefece5, roughness: .93, normalMap: tx('plaster_n.jpg', { tile: 2.2 }), normalScale: new THREE.Vector2(.32, .32) }),
  interior: std({ color: 0xe6e4df, roughness: .95 }),
  plinth: std({ color: 0x55585c, roughness: .9, normalMap: tx('plaster_n.jpg', { tile: 2.2 }), normalScale: new THREE.Vector2(.3, .3) }),
  frame: std({ color: 0x2a2d30, roughness: .42, metalness: .55 }),
  chrome: std({ color: 0xdadcdd, metalness: 1, roughness: .2 }),
  metal: std({ color: 0x9da2a6, metalness: .85, roughness: .38 }),
  glass: std({ color: 0x4a6070, metalness: .85, roughness: .08, envMapIntensity: 1.3 }),
  darkMetal: std({ color: 0x2f3234, roughness: .5, metalness: .6 }),
  sill: std({ color: 0xc9ccce, roughness: .45, metalness: .35 }),
  seal: std({ color: 0x141414, roughness: .92 }),
  gravel: std({ ...pbr('gravel', 1.1), roughness: 1, color: 0xd6d3cd }),
  garageFloor: std({ ...pbr('garagefloor', 3), roughness: 1 }),
  pavers: std({ ...pbr('pavers', 2.0), roughness: 1 }),
  concrete: std({ ...pbr('concrete', 2.0), roughness: 1 }),
  asphalt: std({ ...pbr('asphalt', 4), roughness: 1 }),
  lawn: std({ map: tx('lawn_d.jpg', { srgb: true, tile: 2.6 }), normalMap: tx('lawn_n.jpg', { tile: 2.6 }), normalScale: new THREE.Vector2(.5, .5), roughness: 1 }),
  hedge: std({ map: tx('hedge_d.jpg', { srgb: true, tile: 1.1 }), normalMap: tx('hedge_n.jpg', { tile: 1.1 }), normalScale: new THREE.Vector2(.8, .8), roughness: 1 }),
  cladding: std({ ...pbr('wood_clad', 1.25), roughness: 1, color: 0xd9c0a0 }),
  kerb: std({ color: 0xb4b1aa, roughness: .9 }),
  door: new THREE.MeshPhysicalMaterial({ color: 0x383e3f, roughness: .55, metalness: .05 }),
  doorDark: std({ color: 0x1a1a1a, roughness: .8 }),
  drive: std({ color: 0xc4c7ca, roughness: .5, metalness: .3 }),
  lamp: std({ color: 0xfff1c8, emissive: 0xffd48a, emissiveIntensity: .9 }),
  trunk: std({ color: 0x5b4636, roughness: 1 }),
};
[M.cladding.map, M.cladding.normalMap, M.cladding.roughnessMap].forEach(t => { t.center.set(.5, .5); t.rotation = Math.PI / 2; }); // horizontal boards
let matBrick = null, matTiles = null;
const brickMat = () => matBrick || (matBrick = std({ ...pbr('brick', 2.4), roughness: 1 }));
const tileMat = () => matTiles || (matTiles = std({ ...pbr('rooftile', 2.2), roughness: 1 }));
const cutoutCache = new Map();
function cutoutMat(file) {
  if (cutoutCache.has(file)) return cutoutCache.get(file);
  const m = std({ map: tx(file, { srgb: true, wrap: false }), alphaTest: .5, side: THREE.DoubleSide, roughness: 1 });
  cutoutCache.set(file, m); return m;
}
const woodSets = {};
function woodSet(base) {
  if (!woodSets[base]) woodSets[base] = pbr('wood_' + base, 1.0);
  return woodSets[base];
}
const fineStructure = tx('finestructure_n.jpg', { tile: .22 });

function srgbToLin(hex) { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; } // THREE.Color converts sRGB hex to linear working space
function applyDoorMaterial() {
  const d = M.door, wood = WOOD.find(w => w.id === state.color);
  const hadMap = !!d.map, hadNormal = !!d.normalMap;
  if (wood) {
    const set = woodSet(wood.base), tgt = srgbToLin(wood.hex), base = srgbToLin(WOOD_BASE_MEAN[wood.base]);
    d.map = set.map; d.roughnessMap = set.roughnessMap; d.normalMap = set.normalMap;
    d.color.setRGB(Math.min(1.9, tgt[0] / base[0]), Math.min(1.9, tgt[1] / base[1]), Math.min(1.9, tgt[2] / base[2]));
    d.normalScale.set(wood.brushed ? 1.6 : 1.0, wood.brushed ? 1.6 : 1.0);
    d.roughness = wood.rough ? 1 : .9; d.metalness = 0; d.clearcoat = 0;
    M.doorDark.color.set(wood.hex).multiplyScalar(.45);
  } else {
    const ral = RAL.find(r => r.id === state.color) || RAL[0];
    d.map = null; d.roughnessMap = null; d.color.set(ral.hex);
    d.roughness = { matt: .5, seide: .32, struktur: .68 }[state.finish];
    d.metalness = .06;
    d.normalMap = state.finish === 'struktur' ? fineStructure : null; d.normalScale.set(.55, .55);
    d.clearcoat = state.finish === 'seide' ? .55 : 0; d.clearcoatRoughness = .3;
    M.doorDark.color.set(ral.hex).multiplyScalar(.45);
  }
  if (hadMap !== !!d.map || hadNormal !== !!d.normalMap) d.needsUpdate = true;
  M.doorDark.needsUpdate = true;
}

/* ------------------------------------------------------------------
   Geometry helpers (UVs in metres, so 1 texture tile = tile size)
------------------------------------------------------------------ */
function boxUV(geo, w, h, d, rotZ = false) {
  const uv = geo.attributes.uv, per = uv.count / 6, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < per; i++) {
    const k = f * per + i; let u = uv.getX(k) * dims[f][0], v = uv.getY(k) * dims[f][1];
    if (rotZ && f >= 4) { const t = u; u = v; v = t; }
    uv.setXY(k, u, v);
  }
  return geo;
}
const box = (w, h, d, mat, x = 0, y = 0, z = 0, opt = {}) => {
  const m = new THREE.Mesh(boxUV(new THREE.BoxGeometry(w, h, d), w, h, d, !!opt.rot), mat);
  m.position.set(x, y, z); m.castShadow = opt.shadow !== false; m.receiveShadow = opt.shadow !== false; return m;
};
const plane = (w, h, mat, x, y, z) => {
  const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  const m = new THREE.Mesh(g, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; return m;
};
// wall slab in its local XY plane (origin bottom-left), front face at local z = 0, body extruded towards -z, with rectangular openings
function wall(w, h, t, openings, mat) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(0, h); s.closePath();
  openings.forEach(o => { const p = new THREE.Path(); p.moveTo(o.x, o.y); p.lineTo(o.x + o.w, o.y); p.lineTo(o.x + o.w, o.y + o.h); p.lineTo(o.x, o.y + o.h); p.closePath(); s.holes.push(p); });
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function dispose(obj) { obj.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
const Y = new THREE.Vector3(0, 1, 0);

/* ------------------------------------------------------------------
   House
------------------------------------------------------------------ */
let house = null, doorRig = null, dims = {};
const world = new THREE.Group(); scene.add(world);

function buildHouse() {
  if (house) { world.remove(house); dispose(house); }
  house = new THREE.Group();
  const dw = state.w / 1000, dh = state.h / 1000;
  const T = .3, W = dw + 1.3, D = 6.4, H = Math.max(3.0, dh + .8);
  dims = { dw, dh, W, D, H, T };
  const fac = FACADE.find(f => f.id === state.facade);
  const facade = fac.brick ? brickMat() : M.plaster;
  if (!fac.brick) M.plaster.color.set(fac.hex);

  // ---- garage wing: front wall with the door opening (real reveal), side walls, back wall, floor, flat roof with parapet
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
  // plinth band (proud 2 cm, split around the opening)
  const plinth = (x0, x1, z, depth = .04) => house.add(box(x1 - x0, .38, depth, M.plinth, (x0 + x1) / 2, .19, z, { shadow: false }));
  plinth(-W / 2 - .02, -dw / 2, 0); plinth(dw / 2, W / 2 + .02, 0);
  house.add(box(.04, .38, D, M.plinth, -W / 2, .19, -D / 2, { shadow: false }));
  // threshold
  house.add(box(dw + .3, .035, .5, M.kerb, 0, .0175, .22, { shadow: false }));
  // downpipe at the garage corner
  const pipe = (x, z, h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, h, 12), M.darkMetal); m.position.set(x, h / 2, z); m.castShadow = true; house.add(m); };
  pipe(-W / 2 - .07, .07, H + .3);

  // ---- main house (right of the garage, set back 0.9 m)
  const x0 = W / 2, hw = 8.6, hd = 9.6, zf = -.9;
  const wallH = state.roof === 'gable' ? 5.7 : 6.3;
  const xc = x0 + hw / 2, zc = zf - hd / 2;
  const wins = [
    { x: 1.15, y: 3.55, w: 1.7, h: 1.5 }, { x: 4.9, y: 3.55, w: 2.6, h: 1.5 }, { x: 4.9, y: .85, w: 2.6, h: 1.9 },
  ];
  const doorOp = { x: .6, y: 0, w: 1.1, h: 2.25 };
  const fw = wall(hw, wallH, T, [...wins, doorOp], facade); fw.position.set(x0, 0, zf); house.add(fw);
  const sideWins = [{ x: 1.3, y: 3.55, w: 2.0, h: 1.4 }, { x: 4.8, y: .85, w: 1.6, h: 1.8 }];
  const rw = wall(hd, wallH, T, sideWins, facade); rw.rotation.y = Math.PI / 2; rw.position.set(x0 + hw, 0, zf); house.add(rw);
  house.add(box(.3, wallH, hd, facade, x0 + .15, wallH / 2, zc));                  // left wall (against the garage)
  house.add(box(hw, wallH, .3, facade, xc, wallH / 2, zf - hd + .15));              // back wall
  house.add(box(hw - .6, .2, hd - .6, M.interior, xc, 3.1, zc, { shadow: false })); // upper floor slab (seen through windows)
  // windows: frame recessed 12 cm into the reveal, glass behind, sill in front
  const win = (o, parent, local) => {
    const g = new THREE.Group();
    const t = .07, d = .08, W2 = o.w + .02, H2 = o.h + .02;
    g.add(box(W2, t, d, M.frame, 0, H2 / 2 - t / 2, 0, { shadow: false }));
    g.add(box(W2, t, d, M.frame, 0, -H2 / 2 + t / 2, 0, { shadow: false }));
    g.add(box(t, H2 - 2 * t, d, M.frame, -W2 / 2 + t / 2, 0, 0, { shadow: false }));
    g.add(box(t, H2 - 2 * t, d, M.frame, W2 / 2 - t / 2, 0, 0, { shadow: false }));
    if (o.w > 2) g.add(box(.06, H2 - 2 * t, d, M.frame, 0, 0, 0, { shadow: false }));
    g.add(box(W2 - 2 * t + .02, H2 - 2 * t + .02, .012, M.glass, 0, 0, -.01, { shadow: false }));
    g.add(box(o.w + .24, .045, .2, M.sill, 0, -o.h / 2 - .035, .09));
    g.position.set(o.x + o.w / 2, o.y + o.h / 2, -.14);
    local(g); parent.add(g);
  };
  wins.forEach(o => win(o, house, g => g.position.add(new THREE.Vector3(x0, 0, zf))));
  sideWins.forEach(o => win(o, house, g => { g.rotation.y = Math.PI / 2; g.position.set(x0 + hw - .14, o.y + o.h / 2, zf - (o.x + o.w / 2)); }));
  // front door, recessed, with canopy, step, lamp and cladding accent
  house.add(box(1.06, 2.2, .06, M.frame, x0 + doorOp.x + .55, 1.1, zf - .2));
  house.add(box(.03, .8, .04, M.chrome, x0 + doorOp.x + .95, 1.08, zf - .15, { shadow: false }));
  house.add(box(2.1, .1, 1.25, M.darkMetal, x0 + doorOp.x + .55, 2.5, zf + .56));
  house.add(box(1.7, .15, 1.1, M.kerb, x0 + doorOp.x + .55, .075, zf + .55, { shadow: false }));
  house.add(box(.09, .2, .1, M.frame, x0 + 2.05, 2.05, zf + .04, { shadow: false }));
  house.add(box(.05, .09, .05, M.lamp, x0 + 2.05, 1.95, zf + .07, { shadow: false }));
  const clad = wall(3.6, 2.5, .06, [{ x: wins[0].x - .2, y: wins[0].y - 3.05, w: wins[0].w, h: wins[0].h }], M.cladding);
  clad.position.set(x0 + .2, 3.05, zf + .04); house.add(clad);
  plinth(x0 + doorOp.x + doorOp.w, x0 + hw + .02, zf); plinth(x0, x0 + doorOp.x, zf);
  house.add(box(.04, .38, hd, M.plinth, x0 + hw, .19, zc, { shadow: false }));
  pipe(x0 + hw + .07, zf + .07, wallH + .2);
  // roof
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
      g.add(deck, tiles, fascia);
      g.position.set(xc + sg * (run + o) / 2, wallH + (rise - rise * o / run) / 2 + .03, zc);
      g.rotation.z = -sg * ang; house.add(g);
      const gutter = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, hd + .8, 12), M.darkMetal);
      gutter.rotation.x = Math.PI / 2; gutter.position.set(xc + sg * (run + o + .05), wallH - rise * o / run + .03, zc); gutter.castShadow = true; house.add(gutter);
    });
  } else {
    slab(hw, hd, xc, zc, wallH);
  }

  // ---- ground: lawn, driveway, path, sidewalk, kerb, street
  house.add(plane(400, 400, M.lawn, 0, 0, 0));
  house.add(plane(dw + 2.2, 17.2, M.pavers, 0, .02, 8.6));
  house.add(plane(1.4, 1.6, M.concrete, x0 + doorOp.x + .55, .025, zf + 1.9));
  house.add(plane(x0 + doorOp.x + .55 - dw / 2 + 1.4, 1.4, M.concrete, (x0 + doorOp.x + .55 + dw / 2 - .8) / 2, .04, 1.9));
  house.add(plane(400, 2.0, M.concrete, 0, .03, 18.2));
  house.add(box(400, .1, .16, M.kerb, 0, .05, 19.28, { shadow: false }));
  house.add(plane(400, 9, M.asphalt, 0, .015, 23.8));

  // ---- greenery (photographic cut-outs on crossed planes, trimmed hedges)
  const cross = (file, x, z, h, aspect, rot = 0) => {
    const g = new THREE.Group(), m = cutoutMat(file), w = h * aspect;
    for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = rot + i * Math.PI / 2; p.position.y = h / 2; p.castShadow = true; g.add(p); }
    g.position.set(x, 0, z); house.add(g);
  };
  const cyp = (x, z, h = 4.6, r = 0) => cross('tree_cypress.webp', x, z, h, 164 / 1002, r);
  const lind = (x, z, h = 8.5, r = 0) => cross('tree_linden.webp', x, z, h, 837 / 993, r);
  cyp(-W / 2 - 1.3, .9, 4.4, .3); cyp(-W / 2 - 2.5, -.5, 3.9, 1.1); cyp(x0 + hw + 1.4, zf + .7, 4.8, .5); cyp(x0 + hw + 2.6, zf - 1.3, 4.2, 1.4);
  lind(-W / 2 - 7.5, -4, 9, .2); lind(x0 + hw + 8, -7.5, 8, .9); lind(-15, 11, 8.5, 1.7); lind(x0 + hw + 11, 9, 7.5, .6);
  const hedge = (x, z, w, d, h = .8) => house.add(box(w, h, d, M.hedge, x, h / 2, z));
  hedge(-W / 2 - 3.6, 4.2, 5.6, .7); hedge(x0 + hw / 2 + 1.2, zf + 4.6, 5.2, .7); hedge(-W / 2 - .6, 9.5, 1.0, 8.5, .55);
  cross('shrub.webp', x0 + .25, zf + 1.05, 1.15, 422 / 768, .4);
  cross('shrub.webp', x0 + doorOp.x + doorOp.w + .55, zf + 1.05, 1.15, 422 / 768, .9);

  world.add(house);
}

/* ------------------------------------------------------------------
   Door leaves: back plate + raised boards / cassettes / frame (real grooves, no coplanar faces)
------------------------------------------------------------------ */
const RAISE = .018;
function clipRanges(ranges, band) {
  if (!band) return ranges;
  const out = [];
  ranges.forEach(([a, b]) => { if (b <= band[0] || a >= band[1]) out.push([a, b]); else { if (a < band[0] - .01) out.push([a, band[0] - .01]); if (b > band[1] + .01) out.push([band[1] + .01, b]); } });
  return out.filter(([a, b]) => b - a > .02);
}
function makeLeaf(w, h, design, { depth = .045, band = null, joints = true } = {}) {
  const g = new THREE.Group();
  const m = joints ? .003 : 0;                          // joint gap at panel edges (shows the recessed back plate)
  const yRange = [-h / 2 + m, h / 2 - m];
  const RAIL = .05, ex = band ? [band[0] - RAIL, band[1] + RAIL] : null;   // strips must stop at the glazing rails
  const hStrip = (y0, y1, x = 0, sw = w) => g.add(box(sw, y1 - y0, RAISE, M.door, x, (y0 + y1) / 2, RAISE / 2, { shadow: false, rot: true }));
  const vStrip = (x0, x1, y0, y1) => g.add(box(x1 - x0, y1 - y0, RAISE, M.door, (x0 + x1) / 2, (y0 + y1) / 2, RAISE / 2, { shadow: false }));
  // back plate(s), split around a glazing band
  const plates = band ? [[-h / 2, band[0]], [band[1], h / 2]] : [[-h / 2, h / 2]];
  const plateMat = design === 'rahmen' ? M.door : M.doorDark;   // dark back plate = shadow in the grooves and joints
  plates.forEach(([a, b]) => g.add(box(w, b - a, depth, plateMat, 0, (a + b) / 2, -depth / 2, { rot: true })));
  let ranges = [];
  if (design === 'glatt') ranges = [yRange];
  if (design === 'gross') ranges = [[yRange[0], -.009], [.009, yRange[1]]];
  if (design === 'mittel') { const gp = .006; ranges = [[yRange[0], -h / 4 - gp], [-h / 4 + gp, -gp], [gp, h / 4 - gp], [h / 4 + gp, yRange[1]]]; }
  if (design === 'linien') { const n = Math.max(2, Math.round(h / .165)), bh = (h - 2 * m) / n, gp = .0035; for (let i = 0; i < n; i++) ranges.push([yRange[0] + i * bh + (i ? gp : 0), yRange[0] + (i + 1) * bh - (i < n - 1 ? gp : 0)]); }
  if (design === 'lamellen') {
    const n = Math.max(3, Math.round(w / .116)), bw = w / n, gp = .003;
    clipRanges([yRange], ex).forEach(([a, b]) => { for (let i = 0; i < n; i++) vStrip(-w / 2 + i * bw + (i ? gp : 0), -w / 2 + (i + 1) * bw - (i < n - 1 ? gp : 0), a, b); });
  }
  if (design === 'kassette') {
    const avail = clipRanges([yRange], ex);
    avail.forEach(([a, b]) => hStrip(a, b));   // smooth face, cassettes raised on top
    avail.forEach(([a, b]) => {
      const ah = b - a; if (ah < .3) return;
      const rows = ah > 1.3 ? Math.round(ah / .65) : 1, n = Math.max(1, Math.round(w / .62)), cw = w / n - .14, ch = Math.min(ah / rows - .16, .95);
      for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
        const x = -w / 2 + w / n * (i + .5), y = a + ah / rows * (r + .5);
        g.add(box(cw + .05, ch + .05, .004, M.doorDark, x, y, RAISE + .002, { shadow: false }));
        g.add(box(cw, ch, .012, M.door, x, y, RAISE + .006, { shadow: false, rot: true }));
      }
    });
    ranges = [];
  }
  if (design === 'rahmen') {
    const t = .14;
    clipRanges([yRange], ex).forEach(([a, b]) => {
      hStrip(b - t, b); hStrip(a, a + t);
      vStrip(-w / 2, -w / 2 + t, a + t, b - t); vStrip(w / 2 - t, w / 2, a + t, b - t);
    });
    ranges = [];
  }
  clipRanges(ranges, ex).forEach(([a, b]) => hStrip(a, b));
  // glazing band: dark frame rails (2 mm shallower than the back plate, no coplanar faces), mullions and reflective glass
  if (band) {
    const bh = band[1] - band[0], yc = (band[0] + band[1]) / 2, n = Math.max(1, Math.round(w / .62)), pw = w / n, mt = .05;
    const fd = depth + RAISE - .002, fz = (RAISE - depth + .002) / 2;
    g.add(box(w, RAIL, fd, M.frame, 0, band[0] - RAIL / 2, fz, { shadow: false }));
    g.add(box(w, RAIL, fd, M.frame, 0, band[1] + RAIL / 2, fz, { shadow: false }));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + i * pw; g.add(box(mt, bh, fd, M.frame, x + (i === 0 ? mt / 2 : i === n ? -mt / 2 : 0), yc, fz, { shadow: false })); }
    g.add(box(w - .02, bh - .01, .012, M.glass, 0, yc, -.02, { shadow: false }));
  }
  return g;
}
function handle(parent, x, y, z) { parent.add(box(.09, .34, .006, M.frame, x, y, z + .003, { shadow: false })); parent.add(box(.025, .28, .03, M.chrome, x, y, z + .02, { shadow: false })); }
function seal(parent, w, y, z) { parent.add(box(w, .03, .03, M.seal, 0, y - .015, z, { shadow: false })); }

function buildDoor() {
  if (doorRig) { world.remove(doorRig.group); dispose(doorRig.group); }
  applyDoorMaterial();
  const { dw, dh, T, H } = dims;
  const g = new THREE.Group(), snap = new THREE.Group(); g.add(snap);   // snap = what the photo overlay shows
  const design = TYPES[state.type].designs.includes(state.design) ? state.design : TYPES[state.type].designs[0];
  state.design = design;
  let animate;

  if (state.type === 'sectional') {
    const n = dh > 2.4 ? 5 : 4, ph = dh / n, w = dw + .08, R = .36, Ht = dh + .12, zL = -T - .035, parts = [];
    for (let i = 0; i < n; i++) {
      const top = i === n - 1, band = state.glazing && top ? [-ph / 2 + .1, ph / 2 - .1] : null;
      const leaf = makeLeaf(w, ph, design, { band });
      if (i === 0) { handle(leaf, 0, 0, RAISE); seal(leaf, w, -ph / 2, -.02); }
      const y0 = ph * i + ph / 2; leaf.position.set(0, y0, zL);
      snap.add(leaf); parts.push({ p: leaf, y0 });
    }
    [-1, 1].forEach(s => {
      g.add(box(.05, Ht + .3, .06, M.metal, s * (w / 2 + .05), (Ht + .3) / 2, zL - .06, { shadow: false }));
      g.add(box(.05, .06, 3.0, M.metal, s * (w / 2 + .05), Ht + R + .02, zL - R - 1.5, { shadow: false }));
    });
    if (state.drive) { g.add(box(.06, .08, 3.4, M.drive, 0, H - .07, zL - 1.85, { shadow: false })); g.add(box(.3, .17, .44, M.drive, 0, H - .12, zL - 3.7, { shadow: false })); }
    const smax = (Ht - parts[0].y0) + R * Math.PI / 2 + .12;
    animate = t => { const s = ease(t) * smax; parts.forEach(({ p, y0 }) => {
      const d1 = Ht - y0;
      if (s < d1) { p.position.set(0, y0 + s, zL); p.rotation.x = 0; }
      else if (s < d1 + R * Math.PI / 2) { const a = (s - d1) / R; p.position.set(0, Ht + R * Math.sin(a), zL - R * (1 - Math.cos(a))); p.rotation.x = -a; }
      else { p.position.set(0, Ht + R, zL - R - (s - d1 - R * Math.PI / 2)); p.rotation.x = -Math.PI / 2; } }); };
  }

  // frame (Zarge) inside the reveal for doors mounted in the opening: extends 1 cm into the wall (no coplanar faces)
  const zarge = (parent) => {
    const t = .07, d = .1, zc = -.09;
    parent.add(box(t, dh - t + .01, d, M.frame, -(dw / 2 - t / 2 + .01), (dh - t + .01) / 2, zc, { shadow: false }));
    parent.add(box(t, dh - t + .01, d, M.frame, (dw / 2 - t / 2 + .01), (dh - t + .01) / 2, zc, { shadow: false }));
    parent.add(box(dw + .02, t, d, M.frame, 0, dh - t / 2 + .01, zc, { shadow: false }));
  };

  if (state.type === 'tilt') {
    zarge(snap);
    const w = dw - .16, h = dh - .11, depth = .045, zL = -.06;
    const band = state.glazing ? [h / 2 - .5, h / 2 - .14] : null;
    const pivot = new THREE.Group(); pivot.position.set(0, h + .03, zL);
    const leaf = makeLeaf(w, h, design, { depth, band, joints: false }); leaf.position.set(0, -h / 2, 0);
    handle(leaf, 0, 1.05 - h / 2, RAISE); seal(leaf, w, -h / 2, -.02);
    pivot.add(leaf); snap.add(pivot);
    if (state.drive) { g.add(box(.06, .08, 3.2, M.drive, 0, H - .07, -T - 1.7, { shadow: false })); g.add(box(.3, .17, .44, M.drive, 0, H - .12, -T - 3.5, { shadow: false })); }
    animate = t => { const e = ease(t); pivot.position.set(0, h + .03 + .42 * e, zL - (T + .1 + h) * e); pivot.rotation.x = -Math.PI / 2 * e; };
  }

  if (state.type === 'wing') {
    zarge(snap);
    const h = dh - .11, lw = dw / 2 - .09, depth = .045, zL = -.06, pivots = [];
    const band = state.glazing ? [h / 2 - .5, h / 2 - .14] : null;
    [-1, 1].forEach(s => {
      const pivot = new THREE.Group(); pivot.position.set(s * (dw / 2 - .075), h / 2 + .03, zL - depth / 2);
      const leaf = makeLeaf(lw, h, design, { depth, band, joints: false }); leaf.position.set(-s * lw / 2, 0, depth / 2);
      handle(leaf, -s * (lw / 2 - .18), 1.05 - h / 2, RAISE); seal(leaf, lw, -h / 2, -.02);
      pivot.add(leaf); snap.add(pivot); pivots.push({ pivot, s });
      [.35, h / 2, h - .35].forEach(y => snap.add(box(.04, .12, .06, M.frame, s * (dw / 2 - .085), y + .03, zL + .01, { shadow: false })));
      if (state.drive) g.add(box(.55, .1, .1, M.drive, s * (dw / 2 - .4), dh - .16, -T - .12, { shadow: false }));
    });
    animate = t => { const e = ease(t); pivots.forEach(({ pivot, s }) => { pivot.rotation.y = s * 1.75 * e; }); };
  }

  snap.traverse(o => { o.layers.enable(1); });
  world.add(g);
  doorRig = { group: g, animate };
  animate(doorT);
}

/* ------------------------------------------------------------------
   Camera views + door animation
------------------------------------------------------------------ */
let doorT = 0, doorTarget = 0, doorAnimStart = null, doorFrom = 0;
let camTween = null;
function views() {
  const { dw } = dims;
  return {
    street: { pos: [dw * .55 + 7.6, 2.3, 13.6], tgt: [1.7, 1.5, -1.5] },
    front:  { pos: [0, 1.7, 9.8], tgt: [0, 1.35, 0] },
    close:  { pos: [2.1, 1.5, 5.3], tgt: [0, 1.3, -.2] },
    inside: { pos: [.8, 1.6, -5.4], tgt: [0, 1.15, 0] },
  };
}
function goView(name, instant = false) {
  const v0 = views()[name] || views().street;
  const k = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 1.1 : 1;
  const v = { tgt: v0.tgt, pos: v0.tgt.map((t, i) => t + (v0.pos[i] - t) * k) };
  document.querySelectorAll('#cfgViews button').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  if (instant) { camera.position.fromArray(v.pos); controls.target.fromArray(v.tgt); controls.update(); return; }
  camTween = { from: camera.position.clone(), fromT: controls.target.clone(), to: new THREE.Vector3().fromArray(v.pos), toT: new THREE.Vector3().fromArray(v.tgt), start: performance.now(), dur: 900 };
}
function setDoor(open) {
  doorTarget = open ? 1 : 0; doorFrom = doorT; doorAnimStart = performance.now();
  const btn = document.getElementById('toggleDoor');
  btn.querySelector('span').textContent = open ? 'Tor schließen' : 'Tor öffnen';
  btn.querySelector('svg').style.transform = open ? 'rotate(180deg)' : '';
}

/* ------------------------------------------------------------------
   Render loop
------------------------------------------------------------------ */
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(wrap);
resize();

const dimLabel = document.getElementById('dimLabel'), dimText = document.getElementById('dimText');
const _v = new THREE.Vector3();
function updateDimLabel() {
  if (photo.active) { dimLabel.hidden = true; return; }
  _v.set(0, dims.dh + .32, 0).project(camera);
  const w = wrap.clientWidth, h = wrap.clientHeight;
  const x = (_v.x + 1) / 2 * w, y = (1 - _v.y) / 2 * h;
  const visible = _v.z < 1 && x > 40 && x < w - 40 && y > 60 && y < h - 40;
  dimLabel.hidden = !visible;
  if (visible) { dimLabel.style.left = x + 'px'; dimLabel.style.top = y + 'px'; }
}
let firstFrame = true;
const perf = { samples: [], last: 0, adjusted: false };
function adaptQuality(now) {
  if (perf.adjusted) return;
  if (perf.last) perf.samples.push(now - perf.last);
  perf.last = now;
  if (perf.samples.length < 40) return;
  const avg = perf.samples.slice(5).reduce((a, b) => a + b, 0) / (perf.samples.length - 5);
  perf.adjusted = true;
  if (avg > 45) {
    renderer.setPixelRatio(1); resize();
    sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
    renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.needsUpdate = true;
  }
}
function loop(now) {
  requestAnimationFrame(loop);
  if (camTween) {
    const k = Math.min(1, (now - camTween.start) / camTween.dur), e = ease(k);
    camera.position.lerpVectors(camTween.from, camTween.to, e);
    controls.target.lerpVectors(camTween.fromT, camTween.toT, e);
    if (k >= 1) camTween = null;
  }
  if (doorAnimStart !== null) {
    const k = Math.min(1, (now - doorAnimStart) / 2400);
    doorT = doorFrom + (doorTarget - doorFrom) * k;
    doorRig.animate(doorT);
    if (k >= 1) doorAnimStart = null;
  }
  controls.update();
  renderer.render(scene, camera);
  updateDimLabel();
  adaptQuality(now);
  if (firstFrame) { firstFrame = false; T.frame = performance.now(); window.__t = T; document.getElementById('cfgLoading').classList.add('done');
    const hint = document.getElementById('cfgHint'); hint.hidden = false;
    const hide = () => { hint.hidden = true; canvas.removeEventListener('pointerdown', hide); };
    canvas.addEventListener('pointerdown', hide); setTimeout(hide, 6500); }
}

/* ------------------------------------------------------------------
   Photo mode (own house photo + perspective overlay)
------------------------------------------------------------------ */
const photo = {
  active: false, img: document.getElementById('photoImg'), overlay: document.getElementById('doorOverlay'),
  stage: document.getElementById('photoStage'), handles: [...document.querySelectorAll('.cfg-handle[data-corner]')],
  corners: null, snapW: 0, snapH: 0, drag: null,
};
function renderDoorSnapshot() {
  const { dw, dh } = dims;
  const w = 1024, h = Math.round(w * (dh + .16) / (dw + .24));
  const cam = new THREE.OrthographicCamera(-(dw / 2 + .12), dw / 2 + .12, dh + .12, -.04, .1, 40);
  cam.position.set(0, 0, 8); cam.lookAt(0, 0, 0); cam.layers.set(1);
  const prevT = doorT; if (prevT !== 0) doorRig.animate(0);
  const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
  renderer.setSize(w, h, false); renderer.setClearColor(0x000000, 0);
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  scene.background = bg; scene.fog = fog; resize();
  if (prevT !== 0) doorRig.animate(prevT);
  photo.snapW = w; photo.snapH = h;
  photo.overlay.src = url; photo.overlay.style.width = w + 'px'; photo.overlay.style.height = h + 'px';
}
function photoRect() {
  const s = photo.stage.getBoundingClientRect(), i = photo.img.getBoundingClientRect();
  return { x: i.left - s.left, y: i.top - s.top, w: i.width, h: i.height };
}
function defaultCorners() {
  const { dw, dh } = dims, r = photoRect();
  let w = r.w * .38, h = w * dh / dw;
  if (h > r.h * .5) { h = r.h * .5; w = h * dw / dh; }
  const x = r.w * .5 - w / 2, y = r.h * .8 - h;
  photo.corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => [px / r.w, py / r.h]);
}
function applyOverlay() {
  if (!photo.corners || !photo.snapW) return;
  const r = photoRect();
  const pts = photo.corners.map(([nx, ny]) => [r.x + nx * r.w, r.y + ny * r.h]);
  transform2d(photo.overlay, photo.snapW, photo.snapH, pts);
  photo.handles.forEach((hd, i) => { hd.style.left = pts[i][0] + 'px'; hd.style.top = pts[i][1] + 'px'; hd.hidden = false; });
  const svg = document.getElementById('quadSvg'); svg.removeAttribute('hidden');
  document.getElementById('quadPoly').setAttribute('points', pts.map(p => p.join(',')).join(' '));
  const mv = document.getElementById('moveHandle'); mv.hidden = false;
  const cx = pts.reduce((a, p) => a + p[0], 0) / 4, cy = pts.reduce((a, p) => a + p[1], 0) / 4;
  mv.style.left = cx + 'px'; mv.style.top = cy + 'px';
  photo.overlay.hidden = false;
}
function loadPhoto(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  photo.img.onload = () => { document.getElementById('photoEmpty').hidden = true; photo.img.hidden = false; document.getElementById('photoTools').hidden = false; renderDoorSnapshot(); defaultCorners(); applyOverlay(); };
  photo.img.src = url;
}
photo.handles.forEach((hd, i) => {
  hd.addEventListener('pointerdown', e => { hd.setPointerCapture(e.pointerId); photo.drag = i; e.preventDefault(); });
  hd.addEventListener('pointermove', e => {
    if (photo.drag !== i) return;
    const s = photo.stage.getBoundingClientRect(), r = photoRect();
    photo.corners[i] = [(e.clientX - s.left - r.x) / r.w, (e.clientY - s.top - r.y) / r.h]; applyOverlay();
  });
  hd.addEventListener('pointerup', () => { photo.drag = null; });
});
(() => {
  const mv = document.getElementById('moveHandle'); let last = null;
  mv.addEventListener('pointerdown', e => { mv.setPointerCapture(e.pointerId); last = [e.clientX, e.clientY]; e.preventDefault(); });
  mv.addEventListener('pointermove', e => {
    if (!last) return; const r = photoRect(); const dx = (e.clientX - last[0]) / r.w, dy = (e.clientY - last[1]) / r.h; last = [e.clientX, e.clientY];
    photo.corners = photo.corners.map(([x, y]) => [x + dx, y + dy]); applyOverlay();
  });
  mv.addEventListener('pointerup', () => { last = null; });
})();
document.getElementById('photoInput').addEventListener('change', e => loadPhoto(e.target.files[0]));
document.getElementById('photoInput2').addEventListener('change', e => loadPhoto(e.target.files[0]));
document.getElementById('photoReset').addEventListener('click', () => { defaultCorners(); applyOverlay(); });
window.addEventListener('resize', () => { if (photo.active) applyOverlay(); });

function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
function mulMM(a, b) { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
function mulMV(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function basisToPoints(p1, p2, p3, p4) { const m = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1]; const v = mulMV(adj(m), [p4[0], p4[1], 1]); return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
function homography(w, h, c) {
  const s = basisToPoints([0, 0], [w, 0], [0, h], [w, h]);
  const d = basisToPoints(c[0], c[1], c[3], c[2]);
  const t = mulMM(d, adj(s)); return t.map(v => v / t[8]);
}
function transform2d(el, w, h, c) {
  const t = homography(w, h, c);
  el.style.transform = `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(',')})`;
}
function project(t, x, y) { const v = mulMV(t, [x, y, 1]); return [v[0] / v[2], v[1] / v[2]]; }
function det3(m) { return m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]); }
function solve3(Mx, r) { const D = det3(Mx); if (Math.abs(D) < 1e-9) return null; const col = k => { const m = Mx.slice(); m[k] = r[0]; m[3 + k] = r[1]; m[6 + k] = r[2]; return det3(m) / D; }; return [col(0), col(1), col(2)]; }
function drawTri(ctx, img, s, d) {
  const Mx = [s[0][0], s[0][1], 1, s[1][0], s[1][1], 1, s[2][0], s[2][1], 1];
  const A = solve3(Mx, [d[0][0], d[1][0], d[2][0]]), B = solve3(Mx, [d[0][1], d[1][1], d[2][1]]); if (!A || !B) return;
  const cx = (d[0][0] + d[1][0] + d[2][0]) / 3, cy = (d[0][1] + d[1][1] + d[2][1]) / 3;
  ctx.save(); ctx.beginPath();
  d.forEach(([x, y], i) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; const px = x + dx / l * .7, py = y + dy / l * .7; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.closePath(); ctx.clip();
  ctx.setTransform(A[0], B[0], A[1], B[1], A[2], B[2]); ctx.drawImage(img, 0, 0); ctx.restore();
}
function exportPhoto() {
  const r = photoRect(), k = Math.min(3, photo.img.naturalWidth / r.w);
  const c = document.createElement('canvas'); c.width = Math.round(r.w * k); c.height = Math.round(r.h * k);
  const ctx = c.getContext('2d');
  ctx.drawImage(photo.img, 0, 0, c.width, c.height);
  const pts = photo.corners.map(([nx, ny]) => [nx * r.w * k, ny * r.h * k]);
  const t = homography(photo.snapW, photo.snapH, pts), N = 22, w = photo.snapW, h = photo.snapH;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const u0 = w * i / N, u1 = w * (i + 1) / N, v0 = h * j / N, v1 = h * (j + 1) / N;
    const p00 = project(t, u0, v0), p10 = project(t, u1, v0), p11 = project(t, u1, v1), p01 = project(t, u0, v1);
    drawTri(ctx, photo.overlay, [[u0, v0], [u1, v0], [u1, v1]], [p00, p10, p11]);
    drawTri(ctx, photo.overlay, [[u0, v0], [u1, v1], [u0, v1]], [p00, p11, p01]);
  }
  return c.toDataURL('image/jpeg', .92);
}

/* ------------------------------------------------------------------
   UI
------------------------------------------------------------------ */
const $ = id => document.getElementById(id);
const ICONS = {
  sectional: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M3 10h40M3 17h40M3 24h40"/></svg>',
  tilt: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M23 26V9M17 15l6-6 6 6"/></svg>',
  wing: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M23 3v28M19 17h2M25 17h2"/></svg>',
};
function chip(container, id, label, pressed) { const b = document.createElement('button'); b.type = 'button'; b.className = 'cfg-chip'; b.dataset.id = id; b.textContent = label; b.setAttribute('aria-pressed', String(pressed)); container.appendChild(b); return b; }
function swatch(container, id, label, css, pressed) { const b = document.createElement('button'); b.type = 'button'; b.className = 'cfg-swatch'; b.dataset.id = id; b.innerHTML = `<span class="dot" style="background:${css}"></span><small>${label}</small>`; b.setAttribute('aria-pressed', String(pressed)); container.appendChild(b); return b; }
const woodCss = c => `url(${TEX}swatch/${c.sw}.jpg) center/cover`;

function renderUI() {
  const t = $('optType'); t.innerHTML = '';
  Object.entries(TYPES).forEach(([id, v]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cfg-card'; b.dataset.id = id; b.innerHTML = `${ICONS[id]}<span>${v.label}<small>${v.desc}</small></span>`; b.setAttribute('aria-pressed', String(state.type === id)); t.appendChild(b); });
  const d = $('optDesign'); d.innerHTML = ''; TYPES[state.type].designs.forEach(id => chip(d, id, DESIGNS[id], state.design === id));
  const r = $('optColorRal'); r.innerHTML = ''; RAL.forEach(c => swatch(r, c.id, `${c.name}<br>RAL ${c.id}`, c.hex, state.color === c.id));
  const w = $('optColorWood'); w.innerHTML = ''; WOOD.forEach(c => swatch(w, c.id, c.name, woodCss(c), state.color === c.id));
  const f = $('optFinish'); f.innerHTML = ''; Object.entries(FINISH).forEach(([id, l]) => chip(f, id, l, state.finish === id));
  const wd = $('optWidth'); wd.innerHTML = ''; SIZE_PRESETS.forEach((v, i) => chip(wd, 'size' + i, v.label, state.w === v.w && state.h === v.h));
  $('inpW').value = state.w; $('inpH').value = state.h;
  const pr = $('optPreset'); pr.innerHTML = ''; PRESETS.forEach(v => { const on = Object.entries(v.patch).every(([k, val]) => state[k] === val); chip(pr, v.id, v.label, on); });
  const sel = $('colorName'); if (sel) sel.textContent = colorLabel();
  const fa = $('optFacade'); fa.innerHTML = ''; FACADE.forEach(c => swatch(fa, c.id, c.name, c.hex, state.facade === c.id));
  const ro = $('optRoof'); ro.innerHTML = ''; Object.entries(ROOF).forEach(([id, l]) => chip(ro, id, l, state.roof === id));
  $('optGlazing').checked = state.glazing; $('optDrive').checked = state.drive;
  const woodSel = WOOD.some(c => c.id === state.color);
  $('optFinish').closest('.cfg-group').querySelectorAll('.cfg-subhead')[2].style.opacity = woodSel ? .45 : 1;
  $('optFinish').style.opacity = woodSel ? .45 : 1;
  renderSummary();
}
function colorLabel() { const w = WOOD.find(c => c.id === state.color); if (w) return `${w.name} (Holz)`; const r = RAL.find(c => c.id === state.color); return `${r.name}, RAL ${r.id}`; }
function summaryLines() {
  const wood = WOOD.find(c => c.id === state.color);
  return [['Torart', TYPES[state.type].label], ['Design', DESIGNS[state.design]], ['Farbe', colorLabel()], ['Oberfläche', wood ? (wood.id.startsWith('t_') || ['miele', 'douglas', 'ciliegio', 'mogano', 'noce', 'noce_sc', 'verde'].includes(wood.id) ? 'Echtholz, lasiert' : 'Echtholz, imprägniert') : 'Lackiert, ' + FINISH[state.finish]], ['Lichtausschnitte', state.glazing ? 'Ja' : 'Nein'], ['Antrieb', state.drive ? 'Elektrisch' : 'Manuell'], ['Maße (B × H)', `${state.w} × ${state.h} mm`], ['Fassade', FACADE.find(f => f.id === state.facade).name + ', ' + ROOF[state.roof]]];
}
function renderSummary() {
  $('summary').innerHTML = summaryLines().map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  const text = summaryLines().map(([k, v]) => `${k}: ${v}`).join('\n') + `\nLink: ${location.href.split('#')[0].split('?')[0]}${hash()}`;
  const href = `pages/kontakt.html?konfiguration=${encodeURIComponent(text)}`;
  $('requestBtn').href = href; $('stickyRequest').href = href;
  dimText.textContent = `${state.w} × ${state.h} mm`;
  $('stickySummary').textContent = `${TYPES[state.type].label} · ${DESIGNS[state.design]} · ${colorLabel()} · ${state.w} × ${state.h} mm`;
  const wood = WOOD.find(c => c.id === state.color), ral = RAL.find(c => c.id === state.color);
  $('stickyDot').style.background = wood ? woodCss(wood) : ral.hex;
}
function hash() { return `#t=${state.type}&d=${state.design}&c=${state.color}&f=${state.finish}&g=${state.glazing ? 1 : 0}&m=${state.drive ? 1 : 0}&w=${state.w}&h=${state.h}&fa=${state.facade}&r=${state.roof}`; }
function readHash() {
  if (!location.hash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  const pick = (key, obj, dflt) => obj.includes ? (obj.includes(p.get(key)) ? p.get(key) : dflt) : (obj[p.get(key)] ? p.get(key) : dflt);
  state.type = pick('t', TYPES, state.type);
  state.design = p.get('d') || state.design;
  const colors = [...RAL, ...WOOD].map(c => c.id); let c = p.get('c'); if (LEGACY_WOOD[c]) c = LEGACY_WOOD[c];
  state.color = colors.includes(c) ? c : state.color;
  state.finish = pick('f', FINISH, state.finish);
  state.glazing = p.get('g') === '1'; state.drive = p.get('m') !== '0';
  const num = (key, lim, dflt) => { const v = parseInt(p.get(key), 10); return Number.isFinite(v) ? Math.min(lim[1], Math.max(lim[0], v)) : dflt; };
  state.w = num('w', LIMITS.w, state.w); state.h = num('h', LIMITS.h, state.h);
  state.facade = pick('fa', FACADE.map(c => c.id), state.facade);
  state.roof = pick('r', ROOF, state.roof);
}
function update(patch, rebuildHouse = false) {
  Object.assign(state, patch);
  if (rebuildHouse) { buildHouse(); goView(document.querySelector('#cfgViews .is-active')?.dataset.view || 'street', true); }
  buildDoor();
  renderUI();
  history.replaceState(null, '', hash());
  if (photo.active && !photo.img.hidden) { renderDoorSnapshot(); applyOverlay(); }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]'); if (!b) return;
  const id = b.dataset.id, box = b.parentElement.id;
  if (box === 'optType') update({ type: id, design: TYPES[id].designs.includes(state.design) ? state.design : TYPES[id].designs[0] });
  else if (box === 'optDesign') update({ design: id });
  else if (box === 'optColorRal' || box === 'optColorWood') update({ color: id });
  else if (box === 'optFinish') update({ finish: id });
  else if (box === 'optWidth') { const v = SIZE_PRESETS[parseInt(id.slice(4), 10)]; update({ w: v.w, h: v.h }, true); }
  else if (box === 'optPreset') update(PRESETS.find(v => v.id === id).patch);
  else if (box === 'optFacade') update({ facade: id }, true);
  else if (box === 'optRoof') update({ roof: id }, true);
});
$('optGlazing').addEventListener('change', e => update({ glazing: e.target.checked }));
function sizeInput(id, key, lim) {
  const el = $(id);
  const commit = () => { let v = parseInt(el.value, 10); if (!Number.isFinite(v)) v = state[key]; v = Math.min(lim[1], Math.max(lim[0], Math.round(v / 5) * 5)); el.value = v; if (v !== state[key]) update({ [key]: v }, true); };
  el.addEventListener('change', commit); el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
}
sizeInput('inpW', 'w', LIMITS.w); sizeInput('inpH', 'h', LIMITS.h);
$('resetBtn').addEventListener('click', () => { history.replaceState(null, '', location.pathname); location.reload(); });
$('optDrive').addEventListener('change', e => update({ drive: e.target.checked }));
$('toggleDoor').addEventListener('click', () => setDoor(doorTarget === 0));
document.querySelectorAll('#cfgViews button').forEach(b => b.addEventListener('click', () => goView(b.dataset.view)));
$('shareBtn').addEventListener('click', async () => {
  const url = location.href.split('#')[0].split('?')[0] + hash();
  try { await navigator.clipboard.writeText(url); } catch (err) { prompt('Link zum Kopieren:', url); }
  $('shareNote').hidden = false; setTimeout(() => { $('shareNote').hidden = true; }, 3500);
});
$('saveImage').addEventListener('click', () => {
  let url;
  if (photo.active && !photo.img.hidden) url = exportPhoto();
  else { renderer.render(scene, camera); url = renderer.domElement.toDataURL('image/jpeg', .92); }
  const a = document.createElement('a'); a.href = url; a.download = `DTT-Tor-${TYPES[state.type].label}-${state.color}.jpg`; a.click();
});
document.querySelectorAll('.cfg-tab').forEach(tab => tab.addEventListener('click', () => {
  const mode = tab.dataset.mode;
  document.querySelectorAll('.cfg-tab').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  photo.active = mode === 'photo';
  $('photoMode').hidden = !photo.active;
  $('cfgViews').hidden = photo.active; $('toggleDoor').hidden = photo.active;
  if (photo.active && !photo.img.hidden) { renderDoorSnapshot(); applyOverlay(); }
}));

/* ------------------------------------------------------------------
   Go
------------------------------------------------------------------ */
const q = new URLSearchParams(location.search);
if (q.has('clean')) document.body.classList.add('cfg-clean');
buildHouse(); T.house = performance.now();
buildDoor(); T.door = performance.now();
renderUI(); T.ui = performance.now();
goView(q.get('view') || 'street', true);
if (q.get('open') === '1') { doorT = 1; doorTarget = 1; doorRig.animate(1); }
history.replaceState(null, '', location.pathname + location.search + hash());
(async () => {
  try { await renderer.compileAsync(scene, camera); } catch (e) { /* render will compile lazily */ }
  T.compiled = performance.now();
  loop(performance.now());
})();
