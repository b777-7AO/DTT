/* DTT · 3D-Tor-Konfigurator (Three.js) */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ------------------------------------------------------------------
   Options
------------------------------------------------------------------ */
const TYPES = {
  sectional: { label: 'Sektionaltor', desc: 'Läuft unter die Decke', designs: ['gross', 'mittel', 'glatt', 'kassette'] },
  tilt:      { label: 'Schwingtor',   desc: 'Einteilig, kippt nach oben', designs: ['glatt', 'lamellen', 'kassette', 'linien'] },
  wing:      { label: 'Flügeltor',    desc: 'Zweiflügelig, öffnet nach außen', designs: ['glatt', 'rahmen', 'lamellen', 'linien'] },
};
const DESIGNS = { gross: 'Großsicke', mittel: 'Mittelsicke', glatt: 'Glatt', kassette: 'Kassette', lamellen: 'Lamellen vertikal', rahmen: 'Rahmen & Füllung', linien: 'Linien horizontal' };
const RAL = [
  { id: '7016', name: 'Anthrazitgrau', hex: '#383e42' }, { id: '9016', name: 'Verkehrsweiß', hex: '#f1f0ea' },
  { id: '9006', name: 'Weißaluminium', hex: '#a5a8a6' }, { id: '7040', name: 'Fenstergrau', hex: '#9da3a6' },
  { id: '7035', name: 'Lichtgrau', hex: '#c5c7c4' },     { id: '9005', name: 'Tiefschwarz', hex: '#101012' },
  { id: '5011', name: 'Stahlblau', hex: '#232c3f' },     { id: '6005', name: 'Moosgrün', hex: '#0f4336' },
  { id: '3004', name: 'Purpurrot', hex: '#75151e' },     { id: '8014', name: 'Sepiabraun', hex: '#382c1e' },
  { id: '8028', name: 'Terrabraun', hex: '#4e3b2b' },    { id: '1015', name: 'Hellelfenbein', hex: '#e6d2b5' },
];
const WOOD = [
  { id: 'eiche', name: 'Golden Oak', base: '#a8672c', grain: '#6a3a12' }, { id: 'nuss', name: 'Nussbaum', base: '#5a3a26', grain: '#2e1a0c' },
  { id: 'laerche', name: 'Lärche natur', base: '#c79a63', grain: '#8a5f30' }, { id: 'teak', name: 'Teak', base: '#7e4f2c', grain: '#452612' },
  { id: 'grau', name: 'Eiche grau', base: '#8c8378', grain: '#554d44' }, { id: 'fichte', name: 'Fichte weiß', base: '#e3ddd0', grain: '#b3a892' },
];
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
  { id: 'modern', label: 'Modern Anthrazit', patch: { type: 'sectional', design: 'gross', color: '7016', finish: 'struktur', glazing: false } },
  { id: 'klassik', label: 'Klassisch Weiß', patch: { type: 'sectional', design: 'kassette', color: '9016', finish: 'matt', glazing: true } },
  { id: 'holz', label: 'Echtholz Eiche', patch: { type: 'tilt', design: 'lamellen', color: 'eiche', glazing: false } },
  { id: 'landhaus', label: 'Landhaus Grün', patch: { type: 'wing', design: 'rahmen', color: '6005', finish: 'seide', glazing: true } },
];
readHash();

/* ------------------------------------------------------------------
   Renderer, scene, camera
------------------------------------------------------------------ */
const T = { start: performance.now() };
const canvas = document.getElementById('cfgCanvas');
const wrap = document.getElementById('canvasWrap');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const SKY = new THREE.Color(0xd7dfe6);
scene.background = makeSky();
scene.backgroundBlurriness = 0;
scene.fog = new THREE.Fog(SKY, 50, 140);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
T.pmrem = performance.now();

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.minDistance = 2.2;
controls.maxDistance = 34;
controls.enablePan = false;

const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x7d8a6c, 0.42);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
sun.position.set(-9, 15, 16);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { near: 1, far: 70, left: -14, right: 14, top: 14, bottom: -14 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.00015;
sun.shadow.normalBias = 0.06;
sun.shadow.radius = 3;
scene.add(hemi, sun);
hemi.layers.enable(1);
sun.layers.enable(1);

/* ------------------------------------------------------------------
   Procedural textures
------------------------------------------------------------------ */
const texCache = new Map();
function makeNoise(base, variance, size = 256, repeat = 24) {
  const key = `n${base}${variance}${repeat}`;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) { const v = (Math.random() - .5) * variance; img.data[i] += v; img.data[i + 1] += v; img.data[i + 2] += v; }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  texCache.set(key, t); return t;
}
function makeWood(wood, horizontal) {
  const key = `w${wood.id}${horizontal}`;
  if (texCache.has(key)) return texCache.get(key);
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = wood.base; ctx.fillRect(0, 0, s, s);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) {
    const x = rnd() * s, w = 0.6 + rnd() * 2.2, a = 0.06 + rnd() * 0.22;
    ctx.strokeStyle = wood.grain; ctx.globalAlpha = a; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x, 0);
    for (let y = 0; y <= s; y += 32) ctx.lineTo(x + Math.sin(y / 60 + i) * 4 + (rnd() - .5) * 3, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (horizontal) { t.rotation = Math.PI / 2; t.center.set(.5, .5); }
  t.repeat.set(horizontal ? 1.4 : 2.2, horizontal ? 2.2 : 1.4);
  texCache.set(key, t); return t;
}
function makePavers() {
  if (texCache.has('pavers')) return texCache.get('pavers');
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const ctx = c.getContext('2d');
  ctx.fillStyle = '#9f9b93'; ctx.fillRect(0, 0, s, s);
  const bw = 64, bh = 32; let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < s; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < s; x += bw) { const g = 190 + Math.round(rnd() * 34); ctx.fillStyle = `rgb(${g},${g - 3},${g - 9})`; ctx.fillRect(x + off + 1.5, y + 1.5, bw - 3, bh - 3); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.repeat.set(6, 18);
  texCache.set('pavers', t); return t;
}
function makeBrick() {
  if (texCache.has('brick')) return texCache.get('brick');
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const ctx = c.getContext('2d');
  ctx.fillStyle = '#d9d2c6'; ctx.fillRect(0, 0, s, s);
  const bw = 64, bh = 20; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < s; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < s; x += bw) { const v = rnd(); ctx.fillStyle = `rgb(${132 + v * 40},${70 + v * 22},${56 + v * 16})`; ctx.fillRect(x + off + 2, y + 2, bw - 4, bh - 4); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.repeat.set(3, 9);
  texCache.set('brick', t); return t;
}
function makeSky() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512; const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#5f8fc9'); g.addColorStop(.42, '#b7cfe6'); g.addColorStop(.5, '#e4ecf3'); g.addColorStop(.56, '#d7dfe6'); g.addColorStop(1, '#c9d2d9');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
const bumpTex = (() => { const t = makeNoise('#808080', 60, 256, 6); t.colorSpace = THREE.NoColorSpace; return t; })();

/* ------------------------------------------------------------------
   Materials
------------------------------------------------------------------ */
const M = {
  frame: new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: .5, metalness: .4 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x1b2a3a, metalness: .8, roughness: .1, envMapIntensity: 1.4 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe0e2e4, metalness: 1, roughness: .22 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x3a3b3e, roughness: .9 }),
  tiles: new THREE.MeshStandardMaterial({ color: 0x46403f, roughness: .95 }),
  wood: new THREE.MeshStandardMaterial({ map: null, roughness: .6 }),
  concrete: new THREE.MeshStandardMaterial({ map: makeNoise('#c6c2b9', 22, 256, 30), roughness: .95 }),
  pavers: new THREE.MeshStandardMaterial({ map: null, roughness: .9 }),
  plinth: new THREE.MeshStandardMaterial({ color: 0x5b5f63, roughness: .9 }),
  sill: new THREE.MeshStandardMaterial({ color: 0xcfd2d4, roughness: .5, metalness: .3 }),
  seal: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9 }),
  doorLight: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5, metalness: .12 }),
  interior: new THREE.MeshStandardMaterial({ color: 0xd8d8d4, roughness: .95 }),
  floor: new THREE.MeshStandardMaterial({ map: makeNoise('#9c9c98', 26, 256, 14), roughness: .9 }),
  lawn: new THREE.MeshStandardMaterial({ map: makeNoise('#6d8c4c', 34, 256, 80), roughness: 1 }),
  asphalt: new THREE.MeshStandardMaterial({ map: makeNoise('#55575a', 20, 256, 60), roughness: .95 }),
  kerb: new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: .9 }),
  door: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: .5, metalness: .12 }),
  doorDark: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .8 }),
  drive: new THREE.MeshStandardMaterial({ color: 0xbfc3c7, roughness: .5, metalness: .3 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: .95 }),
  foliageDark: new THREE.MeshStandardMaterial({ color: 0x2d4f2d, roughness: .95 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 1 }),
  facade: new THREE.MeshStandardMaterial({ color: 0xefece5, roughness: .94, bumpMap: null }),
  cladding: new THREE.MeshStandardMaterial({ map: makeWood({ id: 'clad', base: '#7a5a3c', grain: '#4d3620' }, true), roughness: .7 }),
};
M.wood.map = makeWood(WOOD[0], true);
M.facade.bumpMap = bumpTex; M.facade.bumpScale = .0015;
M.pavers.map = makePavers();

function applyDoorMaterial() {
  const wood = WOOD.find(w => w.id === state.color);
  const horizontal = !['lamellen'].includes(state.design);
  if (wood) {
    M.door.map = makeWood(wood, horizontal); M.door.color.set(0xffffff); M.door.roughness = .58; M.door.metalness = 0; M.door.bumpMap = null;
    M.doorDark.color.set(wood.grain).multiplyScalar(.6);
    M.doorLight.map = null; M.doorLight.color.set(wood.base).multiplyScalar(1.25);
  } else {
    const ral = RAL.find(r => r.id === state.color) || RAL[0];
    M.door.map = null; M.door.color.set(ral.hex);
    M.door.roughness = { matt: .62, seide: .34, struktur: .78 }[state.finish];
    M.door.metalness = state.finish === 'seide' ? .18 : .1;
    M.door.bumpMap = state.finish === 'struktur' ? bumpTex : null; M.door.bumpScale = .0035;
    M.doorDark.color.set(ral.hex).multiplyScalar(.5);
    M.doorLight.color.set(ral.hex).multiplyScalar(1.35); M.doorLight.roughness = M.door.roughness;
  }
  M.door.needsUpdate = true; M.doorDark.needsUpdate = true; M.doorLight.needsUpdate = true;
}

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
const box = (w, h, d, mat, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = shadow; return m;
};
const rbox = (w, h, d, mat, x = 0, y = 0, z = 0, r = .012) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function dispose(obj) {
  obj.traverse(o => { if (o.geometry) o.geometry.dispose(); });
}

/* ------------------------------------------------------------------
   House
------------------------------------------------------------------ */
let house = null, doorRig = null, dims = {};
const world = new THREE.Group(); scene.add(world);

function buildHouse() {
  if (house) { world.remove(house); dispose(house); }
  house = new THREE.Group();
  const dw = state.w / 1000, dh = state.h / 1000;
  const W = dw + 1.3, D = 6.4, H = Math.max(3.0, dh + .8);
  dims = { dw, dh, W, D, H, z0: -0.22 };
  const fac = FACADE.find(f => f.id === state.facade);
  M.facade.color.set(fac.brick ? '#ffffff' : fac.hex); M.facade.map = fac.brick ? makeBrick() : null; M.facade.bumpMap = fac.brick ? null : bumpTex; M.facade.needsUpdate = true;

  // ---- garage wing
  house.add(box(.65, H, D, M.facade, -(dw / 2 + .325), H / 2, -D / 2));
  house.add(box(.65, H, D, M.facade, (dw / 2 + .325), H / 2, -D / 2));
  house.add(box(dw, H - dh, .12, M.facade, 0, dh + (H - dh) / 2, -.06));           // lintel
  house.add(box(W, H, .3, M.interior, 0, H / 2, -D + .15));                       // back wall
  house.add(box(W + .35, .28, D + .35, M.roof, 0, H + .14, -D / 2 + .05));        // roof slab
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, .006, -D / 2); floor.receiveShadow = true; house.add(floor);
  // door frame (also part of the door snapshot layer)
  const frame = new THREE.Group();
  frame.add(box(.08, dh, .12, M.frame, -(dw / 2 + .04), dh / 2, -.06));
  frame.add(box(.08, dh, .12, M.frame, (dw / 2 + .04), dh / 2, -.06));
  frame.add(box(dw + .16, .08, .12, M.frame, 0, dh + .04, -.06));
  frame.traverse(o => { o.layers.enable(1); o.castShadow = false; });
  house.add(frame);
  // threshold + plinth band
  house.add(box(dw + .2, .03, .6, M.kerb, 0, .015, .2, false));
  house.add(box(.66, .35, D + .02, M.plinth, -(dw / 2 + .325), .175, -D / 2 + .005, false));
  house.add(box(.66, .35, D + .02, M.plinth, (dw / 2 + .325), .175, -D / 2 + .005, false));

  // ---- main house (right of the garage)
  const x0 = W / 2 + .06, hw = 8.6, hd = 9.6, zf = -.9;
  const wallH = state.roof === 'gable' ? 5.7 : 6.3;
  const xc = x0 + hw / 2, zc = zf - hd / 2;
  house.add(box(hw, wallH, hd, M.facade, xc, wallH / 2, zc));
  // wood cladding accent, upper floor next to the garage
  house.add(box(3.6, 2.5, .05, M.cladding, x0 + 2.0, 4.35, zf + .03, false));
  // windows
  const win = (x, y, w, h, z = zf, rotY = 0) => {
    const g = new THREE.Group();
    g.add(box(w + .14, h + .14, .06, M.frame, 0, 0, 0, false));
    g.add(box(w, h, .06, M.glass, 0, 0, .012, false));
    g.add(box(.05, h, .07, M.frame, 0, 0, .02, false));
    g.add(box(w + .3, .05, .16, M.sill, 0, -h / 2 - .1, .05));
    g.position.set(x, y, z + .02); g.rotation.y = rotY; house.add(g);
  };
  win(x0 + 2.0, 4.35, 1.7, 1.5);
  win(x0 + 6.2, 4.35, 2.6, 1.5);
  win(x0 + 6.2, 1.75, 2.6, 1.9);
  win(x0 + hw, 4.3, 2.0, 1.4, zc + 1.5, Math.PI / 2);
  win(x0 + hw, 1.7, 1.6, 1.8, zc - 1.8, Math.PI / 2);
  // front door + canopy + step
  house.add(box(1.1, 2.25, .08, M.frame, x0 + 1.1, 1.125, zf + .04));
  house.add(box(.03, .9, .05, M.chrome, x0 + 1.45, 1.1, zf + .1, false));
  house.add(box(2.0, .12, 1.3, M.roof, x0 + 1.1, 2.55, zf + .6));
  house.add(box(1.8, .16, 1.2, M.kerb, x0 + 1.1, .08, zf + .6, false));
  house.add(box(hw + .02, .35, hd + .02, M.plinth, xc, .175, zc, false));
  // wall lamp beside the front door
  house.add(box(.1, .22, .12, M.frame, x0 + 1.95, 2.0, zf + .06, false));
  house.add(box(.06, .1, .06, new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd48a, emissiveIntensity: .8 }), x0 + 1.95, 1.9, zf + .1, false));
  // roof
  if (state.roof === 'gable') {
    const rise = 2.6, run = hw / 2, o = .5;
    const shape = new THREE.Shape([new THREE.Vector2(-run, 0), new THREE.Vector2(run, 0), new THREE.Vector2(0, rise)]);
    const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: hd, bevelEnabled: false }), M.facade);
    gable.position.set(xc, wallH, zf); gable.rotation.y = Math.PI; gable.castShadow = true; gable.receiveShadow = true;
    gable.rotation.y = 0; gable.position.z = zf - hd; house.add(gable);
    const len = Math.hypot(run + o, rise * (run + o) / run) + .1, ang = Math.atan(rise / run);
    [-1, 1].forEach(s => {
      const slab = box(len, .2, hd + .9, M.tiles, xc + s * (run + o) / 2, wallH + (rise - rise * o / run) / 2 + .06, zc);
      slab.rotation.z = -s * ang; house.add(slab);
    });
  } else {
    house.add(box(hw + .5, .32, hd + .5, M.roof, xc, wallH + .16, zc));
    house.add(box(hw + .5, .5, .12, M.roof, xc, wallH + .05, zf + .2, false));
  }

  // ---- ground, driveway, street
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), M.lawn); lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true; house.add(lawn);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(dw + 2.2, 16.6), M.pavers); drive.rotation.x = -Math.PI / 2; drive.position.set(0, .012, 8.3); drive.receiveShadow = true; house.add(drive);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), M.concrete); path.rotation.x = -Math.PI / 2; path.position.set(x0 + 1.1, .012, zf + 1.5); path.receiveShadow = true; house.add(path);
  const path2 = new THREE.Mesh(new THREE.PlaneGeometry(x0 + 1.1 - dw / 2 + 1.4, 1.4), M.concrete); path2.rotation.x = -Math.PI / 2; path2.position.set((x0 + 1.1 + dw / 2 - .8) / 2, .013, 1.4); path2.receiveShadow = true; house.add(path2);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(160, 1.8), M.kerb); walk.rotation.x = -Math.PI / 2; walk.position.set(0, .014, 17.4); walk.receiveShadow = true; house.add(walk);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(160, 8), M.asphalt); street.rotation.x = -Math.PI / 2; street.position.set(0, .01, 22.3); street.receiveShadow = true; house.add(street);

  // ---- greenery
  const cypress = (x, z, h = 3.4) => {
    const g = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(.55, h, 9), M.foliageDark); c1.position.y = h / 2 + .1; c1.castShadow = true;
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(.42, h * .8, 9), M.foliage); c2.position.y = h * .75; c2.castShadow = true;
    g.add(c1, c2); g.position.set(x, 0, z); house.add(g);
  };
  const tree = (x, z, r = 1.9, h = 3.2) => {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, h, 8), M.trunk); t.position.y = h / 2; t.castShadow = true;
    const c = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), M.foliage); c.position.y = h + r * .6; c.castShadow = true; c.scale.y = .85;
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(r * .7, 12, 10), M.foliageDark); c2.position.set(r * .5, h + r * .3, r * .4); c2.castShadow = true;
    g.add(t, c, c2); g.position.set(x, 0, z); house.add(g);
  };
  cypress(-W / 2 - 1.5, .9); cypress(-W / 2 - 2.6, -.4, 2.9); cypress(x0 + hw + 1.3, zf + .6); cypress(x0 + hw + 2.4, zf - 1.2, 2.8);
  tree(-W / 2 - 6.5, -3.5); tree(x0 + hw + 7, -6, 2.3, 3.8); tree(-14, 12, 2.6, 4.2);
  const hedge = (x, z, w, d) => { const h = box(w, .75, d, M.foliageDark, x, .375, z); house.add(h); };
  hedge(-W / 2 - 3.5, 4, 5.5, .7); hedge(x0 + hw / 2 + 1, zf + 4.5, 5, .7);
  // planters by the front door
  house.add(box(.6, .5, .6, M.frame, x0 + .2, .25, zf + 1.1)); const p = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 8), M.foliage); p.position.set(x0 + .2, .8, zf + 1.1); p.castShadow = true; house.add(p);

  world.add(house);
}

/* ------------------------------------------------------------------
   Door
------------------------------------------------------------------ */
function decorate(panel, w, h, design) {
  const zf = .045 / 2; // front face of the base panel
  const groove = (y, t = .014) => { panel.add(box(w - .04, t, .008, M.doorDark, 0, y, zf, false)); panel.add(box(w - .04, .004, .006, M.doorLight, 0, y - t / 2 - .003, zf, false)); };
  if (design === 'gross') groove(0);
  if (design === 'mittel') [-h / 4, 0, h / 4].forEach(y => groove(y, .01));
  if (design === 'linien') { const n = Math.max(2, Math.round(h / .27)); for (let i = 1; i < n; i++) groove(-h / 2 + i * h / n, .012); }
  if (design === 'kassette') {
    const n = Math.max(1, Math.round(w / .62)), cw = w / n - .13, ch = Math.min(h - .13, .9);
    for (let i = 0; i < n; i++) { const x = -w / 2 + w / n * (i + .5);
      panel.add(box(cw + .05, ch + .05, .006, M.doorDark, x, 0, zf + .002, false));
      panel.add(box(cw, ch, .018, M.door, x, 0, zf + .006, false)); }
  }
  if (design === 'lamellen') {
    panel.material = M.doorDark;
    const bw = .11, n = Math.round(w / bw);
    for (let i = 0; i < n; i++) panel.add(box(w / n - .01, h - .01, .016, M.door, -w / 2 + w / n * (i + .5), 0, zf + .006, false));
  }
  if (design === 'rahmen') {
    const t = .14;
    panel.add(box(w, t, .016, M.door, 0, h / 2 - t / 2, zf + .006, false));
    panel.add(box(w, t, .016, M.door, 0, -h / 2 + t / 2, zf + .006, false));
    panel.add(box(t, h, .016, M.door, -w / 2 + t / 2, 0, zf + .006, false));
    panel.add(box(t, h, .016, M.door, w / 2 - t / 2, 0, zf + .006, false));
    panel.add(box(w - 2 * t - .04, h - 2 * t - .04, .004, M.doorDark, 0, 0, zf + .001, false));
  }
}
function addGlazing(panel, w, y, h = .32) {
  const n = Math.max(1, Math.round(w / .62)), ww = w / n - .18;
  for (let i = 0; i < n; i++) { const x = -w / 2 + w / n * (i + .5);
    panel.add(box(ww + .06, h + .06, .03, M.frame, x, y, .04, false));
    panel.add(box(ww, h, .03, M.glass, x, y, .05, false)); }
}
function handle(parent, x, y) { parent.add(box(.09, .34, .006, M.frame, x, y, .028, false)); parent.add(box(.025, .28, .03, M.chrome, x, y, .045, false)); }

function buildDoor() {
  if (doorRig) { world.remove(doorRig.group); dispose(doorRig.group); }
  applyDoorMaterial();
  const { dw, dh, z0 } = dims;
  const g = new THREE.Group();
  const design = TYPES[state.type].designs.includes(state.design) ? state.design : TYPES[state.type].designs[0];
  state.design = design;
  let animate;

  if (state.type === 'sectional') {
    const n = 4, ph = dh / n, R = .36, Ht = dh + .25, parts = [];
    for (let i = 0; i < n; i++) {
      const p = rbox(dw - .03, ph - .012, .045, M.door, 0, ph * i + ph / 2, z0);
      decorate(p, dw - .03, ph - .012, design);
      if (i === 0) p.add(box(dw - .03, .03, .04, M.seal, 0, -(ph - .012) / 2 + .01, 0, false));
      if (state.glazing && i === n - 1) addGlazing(p, dw - .03, 0, Math.min(.3, ph - .16));
      if (i === 0) handle(p, 0, 0);
      g.add(p); parts.push({ p, y0: ph * i + ph / 2 });
    }
    // rails
    [-1, 1].forEach(s => { g.add(box(.04, Ht + .1, .05, M.drive, s * (dw / 2 + .04), (Ht + .1) / 2, z0 - .06, false)); g.add(box(.04, .05, 2.9, M.drive, s * (dw / 2 + .04), Ht + R + .05, z0 - R - 1.45, false)); });
    if (state.drive) { g.add(box(.06, .08, 3.2, M.drive, 0, dims.H - .06, z0 - 1.7, false)); g.add(box(.3, .17, .44, M.drive, 0, dims.H - .1, z0 - 3.5, false)); }
    const smax = (Ht - parts[0].y0) + R * Math.PI / 2 + .12;
    animate = t => { const s = ease(t) * smax; parts.forEach(({ p, y0 }) => {
      const d1 = Ht - y0;
      if (s < d1) { p.position.set(0, y0 + s, z0); p.rotation.x = 0; }
      else if (s < d1 + R * Math.PI / 2) { const a = (s - d1) / R; p.position.set(0, Ht + R * Math.sin(a), z0 - R * (1 - Math.cos(a))); p.rotation.x = -a; }
      else { p.position.set(0, Ht + R, z0 - R - (s - d1 - R * Math.PI / 2)); p.rotation.x = -Math.PI / 2; } }); };
  }

  if (state.type === 'tilt') {
    const pivot = new THREE.Group(); pivot.position.set(0, dh, z0);
    const p = rbox(dw - .03, dh - .02, .05, M.door, 0, -dh / 2, 0);
    decorate(p, dw - .03, dh - .02, design);
    p.add(box(dw - .03, .03, .045, M.seal, 0, -(dh - .02) / 2 + .01, 0, false));
    if (state.glazing) addGlazing(p, dw - .03, dh / 2 - .32);
    handle(p, 0, 1.05 - dh / 2);
    pivot.add(p); g.add(pivot);
    [-1, 1].forEach(s => g.add(box(.04, dh + .3, .05, M.drive, s * (dw / 2 + .04), (dh + .3) / 2, z0 - .06, false)));
    if (state.drive) { g.add(box(.06, .08, 3.2, M.drive, 0, dims.H - .06, z0 - 1.7, false)); g.add(box(.3, .17, .44, M.drive, 0, dims.H - .1, z0 - 3.5, false)); }
    animate = t => { const e = ease(t); pivot.position.set(0, dh + .48 * e, z0 - (dh - .08) * e); pivot.rotation.x = -Math.PI / 2 * e; };
  }

  if (state.type === 'wing') {
    const lw = dw / 2 - .025, pivots = [];
    [-1, 1].forEach(s => {
      const pivot = new THREE.Group(); pivot.position.set(s * dw / 2, dh / 2, z0);
      const p = rbox(lw, dh - .02, .05, M.door, -s * lw / 2, 0, 0);
      decorate(p, lw, dh - .02, design);
      p.add(box(lw, .03, .045, M.seal, 0, -(dh - .02) / 2 + .01, 0, false));
      if (state.glazing) addGlazing(p, lw, dh / 2 - .32);
      handle(p, -s * (lw - .16) * 1, 1.05 - dh / 2);
      pivot.add(p); g.add(pivot); pivots.push({ pivot, s });
      // hinges
      [.3, dh / 2, dh - .3].forEach(y => g.add(box(.05, .12, .07, M.frame, s * (dw / 2 + .02), y, z0 + .02, false)));
      if (state.drive) g.add(box(.55, .1, .1, M.drive, s * (dw / 2 - .35), dh - .12, z0 - .12, false));
    });
    animate = t => { const e = ease(t); pivots.forEach(({ pivot, s }) => { pivot.rotation.y = s * 1.75 * e; }); };
  }

  g.traverse(o => { o.layers.enable(1); });
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
    street: { pos: [dw * .55 + 6.8, 2.5, 12.8], tgt: [1.8, 1.5, -1.6] },
    front:  { pos: [0, 1.75, 9.6], tgt: [0, 1.35, 0] },
    close:  { pos: [1.8, 1.6, 5.0], tgt: [0, 1.45, 0] },
    inside: { pos: [.6, 1.45, -5.2], tgt: [0, 1.95, .6] },
  };
}
function goView(name, instant = false) {
  const v0 = views()[name];
  // portrait screens: pull the camera back so the garage stays in frame
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
  _v.set(0, dims.dh + .32, dims.z0).project(camera);
  const w = wrap.clientWidth, h = wrap.clientHeight;
  const x = (_v.x + 1) / 2 * w, y = (1 - _v.y) / 2 * h;
  const visible = _v.z < 1 && x > 40 && x < w - 40 && y > 60 && y < h - 40;
  dimLabel.hidden = !visible;
  if (visible) { dimLabel.style.left = x + 'px'; dimLabel.style.top = y + 'px'; }
}
let firstFrame = true;
// adaptive quality: if the device renders slowly, lower pixel ratio and shadow resolution once
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
    scene.environmentIntensity = .45;
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

// 2D projective transform (quad to quad) for the CSS overlay
function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
function mulMM(a, b) { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
function mulMV(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function basisToPoints(p1, p2, p3, p4) { const m = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1]; const v = mulMV(adj(m), [p4[0], p4[1], 1]); return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
function homography(w, h, c) { // (0,0)->c0 (w,0)->c1 (w,h)->c2 (0,h)->c3
  const s = basisToPoints([0, 0], [w, 0], [0, h], [w, h]);
  const d = basisToPoints(c[0], c[1], c[3], c[2]);
  const t = mulMM(d, adj(s)); return t.map(v => v / t[8]);
}
function transform2d(el, w, h, c) {
  const t = homography(w, h, c);
  el.style.transform = `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(',')})`;
}
function project(t, x, y) { const v = mulMV(t, [x, y, 1]); return [v[0] / v[2], v[1] / v[2]]; }

// export photo mode as image (photo + perspective-warped door)
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

function renderUI() {
  const t = $('optType'); t.innerHTML = '';
  Object.entries(TYPES).forEach(([id, v]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cfg-card'; b.dataset.id = id; b.innerHTML = `${ICONS[id]}<span>${v.label}<small>${v.desc}</small></span>`; b.setAttribute('aria-pressed', String(state.type === id)); t.appendChild(b); });
  const d = $('optDesign'); d.innerHTML = ''; TYPES[state.type].designs.forEach(id => chip(d, id, DESIGNS[id], state.design === id));
  const r = $('optColorRal'); r.innerHTML = ''; RAL.forEach(c => swatch(r, c.id, `${c.name}<br>RAL ${c.id}`, c.hex, state.color === c.id));
  const w = $('optColorWood'); w.innerHTML = ''; WOOD.forEach(c => swatch(w, c.id, c.name, `repeating-linear-gradient(100deg, ${c.base} 0 4px, ${c.grain}55 4px 5px, ${c.base} 5px 9px, ${c.grain}33 9px 10px)`, state.color === c.id));
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
  return [['Torart', TYPES[state.type].label], ['Design', DESIGNS[state.design]], ['Farbe', colorLabel()], ['Oberfläche', WOOD.some(c => c.id === state.color) ? 'Holz, geölt' : FINISH[state.finish]], ['Lichtausschnitte', state.glazing ? 'Ja' : 'Nein'], ['Antrieb', state.drive ? 'Elektrisch' : 'Manuell'], ['Maße (B × H)', `${state.w} × ${state.h} mm`], ['Fassade', FACADE.find(f => f.id === state.facade).name + ', ' + ROOF[state.roof]]];
}
function renderSummary() {
  $('summary').innerHTML = summaryLines().map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  const text = summaryLines().map(([k, v]) => `${k}: ${v}`).join('\n') + `\nLink: ${location.href.split('#')[0]}${hash()}`;
  const href = `pages/kontakt.html?konfiguration=${encodeURIComponent(text)}`;
  $('requestBtn').href = href; $('stickyRequest').href = href;
  dimText.textContent = `${state.w} × ${state.h} mm`;
  $('stickySummary').textContent = `${TYPES[state.type].label} · ${DESIGNS[state.design]} · ${colorLabel()} · ${state.w} × ${state.h} mm`;
  const wood = WOOD.find(c => c.id === state.color), ral = RAL.find(c => c.id === state.color);
  $('stickyDot').style.background = wood ? `repeating-linear-gradient(100deg, ${wood.base} 0 3px, ${wood.grain}66 3px 4px)` : ral.hex;
}
function hash() { return `#t=${state.type}&d=${state.design}&c=${state.color}&f=${state.finish}&g=${state.glazing ? 1 : 0}&m=${state.drive ? 1 : 0}&w=${state.w}&h=${state.h}&fa=${state.facade}&r=${state.roof}`; }
function readHash() {
  if (!location.hash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  const pick = (key, obj, dflt) => obj.includes ? (obj.includes(p.get(key)) ? p.get(key) : dflt) : (obj[p.get(key)] ? p.get(key) : dflt);
  state.type = pick('t', TYPES, state.type);
  state.design = p.get('d') || state.design;
  const colors = [...RAL, ...WOOD].map(c => c.id); state.color = pick('c', colors, state.color);
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
  const url = location.href.split('#')[0] + hash();
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
if (new URLSearchParams(location.search).has('clean')) document.body.classList.add('cfg-clean');
buildHouse(); T.house = performance.now();
buildDoor(); T.door = performance.now();
renderUI(); T.ui = performance.now();
goView('street', true);
history.replaceState(null, '', hash());
// compile all shader programs in parallel before the first frame (avoids a long stall on first render)
(async () => {
  try { await renderer.compileAsync(scene, camera); } catch (e) { /* fall through, render will compile lazily */ }
  T.compiled = performance.now();
  loop(performance.now());   // draw once immediately, even if the tab is not visible yet
})();
