/* DTT · Tor-Studio v4 (Three.js r170)
   Produkt-Studio (Tor allein, maßstäblich), 3D-Haus und Foto-Modus. Katalog, Geometrie, Materialien und Haus in assets/js/cfg/. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as C from './cfg/catalog.js';
import * as G from './cfg/catalog_guardy.js';
import { createMaterials, TEX } from './cfg/materials.js';
import { buildDoorRig, makeLeaf, ease, steelSections } from './cfg/door.js';
import { buildHouse, buildStudio, dispose, updateImpostors } from './cfg/house.js';

const q = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);

/* ------------------------------------------------------------------ State */
const state = {
  type: 'secur', model: 'vip', essence: 'oak', surface: 'natural', color: 'oak', finish: 'matt',   // first visit: natural oak, never a dark lacquer
  securplus: false, nonprotruding: false, pedestrian: false, windows: '', transom: '', grille: false, glazing: false,
  handle: 'std', drive: 'combimatic', sildomo: false, link: false, keypad: false, remote: false, blockmatic: false,
  w: 3000, h: 2250, facade: 'weiss', roof: 'flat', mode: 'house', view: 'street',
  // Stahl-Sektionaltor
  hardware: 'LHF-C', springs: '20000', fve: false, fveType: 'doppelt-pmma', thermal: false, stwindow: '', sthandle: '466', stdrive: '', stgrille: false,
};
const BOOLS = ['securplus', 'nonprotruding', 'pedestrian', 'grille', 'glazing', 'sildomo', 'link', 'keypad', 'remote', 'blockmatic', 'fve', 'thermal', 'stgrille'];
const HASH_KEYS = ['type', 'model', 'essence', 'surface', 'color', 'finish', 'windows', 'transom', 'handle', 'drive', 'w', 'h', 'facade', 'roof', 'mode', 'hardware', 'springs', 'fveType', 'stwindow', 'sthandle', 'stdrive', ...BOOLS];
const STEEL_LIMITS = { w: [2000, 5500], h: [1875, 3000] };
const limitsFor = type => type === 'steel' ? STEEL_LIMITS : C.LIMITS;
const isSteel = () => state.type === 'steel';
function hash() { return '#' + HASH_KEYS.map(k => `${k}=${typeof state[k] === 'boolean' ? (state[k] ? 1 : 0) : state[k]}`).join('&'); }
function readHash() {
  if (!location.hash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  HASH_KEYS.forEach(k => { if (!p.has(k)) return; const v = p.get(k); state[k] = BOOLS.includes(k) ? v === '1' : (k === 'w' || k === 'h' ? parseInt(v, 10) : v); });
  if (!C.TYPES[state.type]) state.type = 'secur';
  if (!C.MODELS[state.model]) state.model = 'vip';
  state.w = clamp(state.w, limitsFor(state.type).w); state.h = clamp(state.h, limitsFor(state.type).h);
  normalise();
}
const clamp = (v, [a, b]) => Math.min(b, Math.max(a, Number.isFinite(v) ? v : a));

/* Which coverings are allowed for the chosen model (price list columns) */
function essencesFor(modelId) {
  const m = C.MODELS[modelId];
  if (m.family === 'steel') return [];
  if (m.family === 'basculap') return C.ESSENCES.filter(e => e.id === 'okoume');
  if (!m.table) return C.ESSENCES.filter(e => ['okoume', 'oak', 'oak_br', 'larch_br', 'fir'].includes(e.id));
  const cols = Object.keys(C.PRICES[m.table].A0);
  return C.ESSENCES.filter(e => cols.includes(e.col) && !(e.col === 'brushed' && m.table === 'bugne' && !m.brushedOk));
}
function surfacesFor(modelId, essenceId) {
  const m = C.MODELS[modelId];
  if (m.family === 'materia' || m.family === 'japan' || m.family === 'steel') return [];
  if (m.lacquerOnly || m.family === 'basculap') return ['paint'];
  if (essenceId === 'okoume') return m.metalskin ? ['paint', 'stain', 'metal'] : ['paint', 'stain'];
  return ['natural', 'stain'];
}
function normalise() {
  const t = C.TYPES[state.type], models = C.modelsOf(state.type);
  if (!models.includes(state.model)) state.model = models[0];
  const ess = essencesFor(state.model); if (!ess.some(e => e.id === state.essence)) state.essence = ess[0] ? ess[0].id : 'okoume';
  const surf = surfacesFor(state.model, state.essence);
  if (state.type === 'steel') {
    if (!['std', 'paint', 'db703'].includes(state.surface)) state.surface = 'std';
    if (state.surface === 'paint' && !C.RAL.some(r => r.id === state.color)) state.color = '7016';
    if (!G.HARDWARE.some(h => h.id === state.hardware)) state.hardware = 'LHF-C';
    if (!G.SURCHARGES.springs[state.springs]) state.springs = '20000';
    if (!G.GLAZING.some(g => g.id === state.fveType)) state.fveType = 'doppelt-pmma';
    if (state.stwindow && !G.WINDOWS.some(w => w.code === state.stwindow)) state.stwindow = '';
    if (!G.HANDLES.some(h => h.code === state.sthandle)) state.sthandle = '466';
    if (state.stdrive && !G.DRIVES.some(d => d.id === state.stdrive)) state.stdrive = '';
    state.w = clamp(Math.round(state.w / 5) * 5, STEEL_LIMITS.w); state.h = clamp(Math.round(state.h / 5) * 5, STEEL_LIMITS.h);
    state.windows = ''; state.transom = ''; state.grille = false;
  } else {
    if (['std', 'db703'].includes(state.surface)) state.surface = 'paint';
    state.fve = false; state.thermal = false; state.stgrille = false; state.stwindow = ''; state.stdrive = '';
    state.w = clamp(state.w, C.LIMITS.w); state.h = clamp(state.h, C.LIMITS.h);
  }
  if (surf.length && !surf.includes(state.surface)) state.surface = surf[0];
  if (state.surface === 'paint' && !C.RAL.some(r => r.id === state.color)) state.color = '7016';
  if (state.surface === 'stain' && !C.STAINS.some(s => s.id === state.color)) state.color = 'noce';
  if (state.surface === 'metal' && !C.METAL.some(s => s.id === state.color)) state.color = 'ms_steel';
  if (state.surface === 'natural') state.color = state.essence;
  if (state.type !== 'secur') { state.securplus = false; state.nonprotruding = false; state.transom = ''; state.grille = false; if (state.type !== 'steel') state.pedestrian = false; }
  if (state.type !== 'sr') state.glazing = false;
  if (!C.HANDLES.some(h => h.id === state.handle)) state.handle = 'std';
  if (!t.kind) state.mode = 'studio';
}
readHash();

/* ------------------------------------------------------------------ Renderer, scene, lights */
const canvas = $('cfgCanvas'), wrap = $('canvasWrap');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
const useAO = !q.has('noao') && window.matchMedia('(pointer: fine)').matches && Math.min(window.innerWidth, window.innerHeight) > 600;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, useAO ? 1.75 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
let assetsReady = false;
const manager = new THREE.LoadingManager(() => { assetsReady = true; finishLoading(); if (window.__thumbsReady) window.__thumbsReady(); });
const mats = createMaterials(renderer, manager);
const { M, tx } = mats;

const scene = new THREE.Scene();
const sky = tx('sky.jpg', { srgb: true, wrap: false }); sky.mapping = THREE.EquirectangularReflectionMapping;
let skyEnv = sky; new RGBELoader(manager).load(TEX + 'sky_1k.hdr', t => { t.mapping = THREE.EquirectangularReflectionMapping; skyEnv = t; if (state.mode === 'house') scene.environment = t; });
scene.background = sky; scene.environment = sky; scene.environmentIntensity = .55; scene.backgroundIntensity = .9;
const SUN_IN_SKY = new THREE.Vector3(.555, .742, .377), SKY_ROT = 1.95;
const pmrem = new THREE.PMREMGenerator(renderer); const studioEnv = pmrem.fromScene(new RoomEnvironment(), .04).texture; pmrem.dispose();
scene.backgroundRotation.set(0, SKY_ROT, 0); scene.environmentRotation.set(0, SKY_ROT, 0);
const sunDir = SUN_IN_SKY.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -SKY_ROT).normalize();
const camera = new THREE.PerspectiveCamera(36, 1, .2, 320);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08; controls.enablePan = false; controls.maxPolarAngle = Math.PI / 2 - .03;
class AOPass extends GTAOPass { overrideVisibility() { super.overrideVisibility(); this.scene.traverse(o => { if (o.userData.cutout) o.visible = false; }); } }
let composer = null, aoPass = null, aoOn = useAO;
if (useAO) {
  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  aoPass = new AOPass(scene, camera, 1, 1, {}, { radius: .34, distanceExponent: 1, thickness: 1, scale: 1, samples: 16, distanceFallOff: 1, screenSpaceRadius: false }, { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 16 });
  aoPass.output = GTAOPass.OUTPUT.Default; aoPass.blendIntensity = .95;
  composer.addPass(aoPass);
  const lensPass = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmount: { value: .28 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float uTime; uniform float uAmount; varying vec2 vUv; float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); } void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - .5; float v = 1.0 - uAmount * smoothstep(.25, 1.1, dot(d, d) * 2.2); float g = (hash(vUv * 1200.0) - .5) * .012; gl_FragColor = vec4(c.rgb * v + g, c.a); }' });
  composer.addPass(lensPass); composer.addPass(new OutputPass());
  window.__lens = lensPass;
}
function draw() { if (composer && aoOn) composer.render(); else renderer.render(scene, camera); }
const sun = new THREE.DirectionalLight(0xfff1dc, 3.4);
sun.position.copy(sunDir).multiplyScalar(45).add(new THREE.Vector3(3, 0, 0)); sun.target.position.set(3, 0, 0); scene.add(sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { near: 5, far: 110, left: -24, right: 24, top: 24, bottom: -24 }); sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -.0003; sun.shadow.normalBias = .03;
const hemi = new THREE.HemisphereLight(0xdde8ff, 0x6f7a63, .06);
const fill = new THREE.DirectionalLight(0xeaf2ff, .55); fill.position.set(-6, 5, 14); scene.add(fill); fill.layers.enable(1);
scene.add(hemi, sun); hemi.layers.enable(1); sun.layers.enable(1);
// studio key + fill (soft boxes), switched with the mode
const studioKey = new THREE.DirectionalLight(0xffffff, 2.1); studioKey.position.set(-3.5, 9, 6); studioKey.castShadow = true; studioKey.shadow.mapSize.set(2048, 2048);
Object.assign(studioKey.shadow.camera, { near: 1, far: 30, left: -6, right: 6, top: 7, bottom: -2 }); studioKey.shadow.camera.updateProjectionMatrix(); studioKey.shadow.bias = -.0003; studioKey.shadow.normalBias = .02;
const studioFill = new THREE.DirectionalLight(0xe8f0ff, .9); studioFill.position.set(6, 3, 5);
const studioRim = new THREE.DirectionalLight(0xffffff, .6); studioRim.position.set(0, 4, -6);
const studioLights = new THREE.Group(); studioLights.add(studioKey, studioFill, studioRim); scene.add(studioLights);

/* ------------------------------------------------------------------ World */
const world = new THREE.Group(); scene.add(world);
let house = null, studio = null, doorRig = null, dims = {};
let doorT = 0, doorTarget = 0, doorAnimStart = null, doorFrom = 0, camTween = null, autoRotate = false, turnTarget = 0;

function transomH() { return state.transom && state.type === 'secur' ? 450 : 0; }
function buildWorld() {
  if (house) { world.remove(house); dispose(house); house = null; }
  if (studio) { world.remove(studio); dispose(studio); studio = null; }
  const studioMode = state.mode !== 'house';
  const h = buildHouse({ mats, state, openH: state.h + transomH() });
  dims = h.dims;
  if (studioMode) { studio = buildStudio({ mats, dims }); world.add(studio); dispose(h.group); }
  else { house = h.group; world.add(house); }
  scene.background = studioMode ? new THREE.Color(0xe9eaec) : sky;
  scene.environment = studioMode ? studioEnv : skyEnv;
  scene.fog = studioMode ? null : new THREE.Fog(0xc9d2da, 70, 220);
  scene.environmentIntensity = studioMode ? .75 : .55;
  sun.visible = !studioMode; hemi.visible = !studioMode; fill.visible = !studioMode; studioLights.visible = studioMode;
  renderer.toneMappingExposure = studioMode ? 1.1 : 1.0;
}
function buildDoor() {
  if (doorRig) { world.remove(doorRig.group); dispose(doorRig.group); }
  surfaceLabel = mats.applyDoor(state);
  doorRig = buildDoorRig({ M, state, dims, studio: state.mode !== 'house' });
  world.add(doorRig.group);
  doorRig.animate(doorT);
  thumbs.invalidate();
  buildTrajectory(); setTrajVisible(state.view === 'inside' && state.mode === 'house');
}
let surfaceLabel = '';

/* ------------------------------------------------------------------ Öffnungsbahn (Preisliste S. 9/10): swept volume + dimensions, shown in the inside view */
let traj = null, trajPts = {}, trajRow = null;
const trajMat = new THREE.MeshBasicMaterial({ color: 0x0018a8, transparent: true, opacity: .09, side: THREE.DoubleSide, depthWrite: false });
const trajLine = new THREE.LineBasicMaterial({ color: 0x0018a8, transparent: true, opacity: .75 });
function buildTrajectory() {
  if (traj) { world.remove(traj); dispose(traj); traj = null; }
  trajRow = null; trajPts = {};
  $('trajCard').hidden = true; $('trajLabels').innerHTML = '';
  if (state.type !== 'secur' || photo.active) return;
  const tr = C.trajectoryFor(state.h, state.nonprotruding); if (!tr) { renderTrajCard(null); return; }
  trajRow = tr;
  const H = state.h / 1000, dw = dims.dw, sOut = tr.nonprotruding ? 0 : tr.s / 1000, r = tr.r / 1000, e = tr.e / 1000;
  const aOut = tr.aOut / 1000, aIn = tr.aIn / 1000, bOut = tr.bOut / 1000, bIn = tr.bIn / 1000;
  // side profile in (z, y): z > 0 is outside the frame line, the closed leaf stands on z = 0
  const sh = new THREE.Shape();
  sh.moveTo(0, .02);
  sh.splineThru([new THREE.Vector2(aOut, H / 2), new THREE.Vector2(bOut, H * .75), new THREE.Vector2(sOut + .02, H - .13)]);
  sh.lineTo(-r, H - .15);
  sh.splineThru([new THREE.Vector2(-bIn, H * .75), new THREE.Vector2(-aIn, H / 2), new THREE.Vector2(-.02, .02)]);
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: dw, bevelEnabled: false, curveSegments: 24 });
  geo.rotateY(-Math.PI / 2); geo.translate(dw / 2, 0, 0);   // shape x -> world z, extrusion -> world -x, centred on the door
  traj = new THREE.Group();
  const m = new THREE.Mesh(geo, trajMat); m.renderOrder = 2; traj.add(m);
  traj.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), trajLine));
  traj.visible = false; world.add(traj);
  trajPts = {
    s: [dw / 2 - .15, H - .13, sOut], r: [dw / 2 - .15, H - .15, -r], e: [0, e, sOut * .5],
    a: [-dw / 2 + .15, H / 2, -aIn], b: [-dw / 2 + .15, H * .75, -bIn],
  };
  const mm = v => v.toLocaleString('de-DE');
  const L = { s: `S ${mm(tr.s || 0)} mm · Überstand außen`, r: `R ${mm(tr.r)} mm · Platzbedarf innen`, e: `E ${mm(tr.e)} mm · Durchfahrtshöhe offen`, a: `½ H · ${mm(tr.aOut)} mm außen / ${mm(tr.aIn)} mm innen`, b: `¾ H · ${mm(tr.bOut)} mm außen / ${mm(tr.bIn)} mm innen` };
  if (tr.nonprotruding) delete L.s;
  Object.entries(L).forEach(([k, t]) => { const d = el('div', 'cfg-traj', t); d.dataset.k = k; d.hidden = true; $('trajLabels').appendChild(d); });
  renderTrajCard(tr);
}
function renderTrajCard(tr) {
  const card = $('trajCard'), mm = v => v.toLocaleString('de-DE');
  if (!tr) { card.innerHTML = `<strong>Öffnungsbahn</strong><p>Nicht ausschwenkend ist bis 2.580 mm Bestellhöhe gelistet. Für ${mm(state.h)} mm bitte anfragen.</p>`; return; }
  const rows = [
    !tr.nonprotruding ? ['S', 'Überstand außen, Tor offen', tr.s] : null,
    ['R', 'Platzbedarf nach innen ab Rahmenlinie', tr.r],
    ['E', 'Durchfahrtshöhe bei offenem Tor', tr.e],
    ['½ H', 'Ausschwenken außen / innen', `${mm(tr.aOut)} / ${mm(tr.aIn)}`],
    ['¾ H', 'Ausschwenken außen / innen', `${mm(tr.bOut)} / ${mm(tr.bIn)}`],
  ].filter(Boolean);
  card.innerHTML = `<strong>Öffnungsbahn ${tr.nonprotruding ? 'nicht ausschwenkend' : 'ausschwenkend (Standard)'}</strong>
    <small>Bestellhöhe H ${mm(state.h)} mm${tr.exact ? '' : ` · Tabellenzeile ${mm(tr.h)} mm`} · Rahmenkopf 110 mm · Torblatt hinten 150 mm unter dem Sturz</small>
    <table>${rows.map(([k, l, v]) => `<tr><th>${k}</th><td>${l}</td><td>${typeof v === 'number' ? mm(v) : v} mm</td></tr>`).join('')}</table>
    <small>Preisliste 08/2026, Seite ${tr.nonprotruding ? '10' : '9'}. ${tr.nonprotruding ? 'Nicht ausschwenkendes Torblatt: Code F01, 651 €.' : 'Vergrößerter Überstand 50/100/150 mm: Code G31, 514 €.'}</small>`;
}
function setTrajVisible(on) {
  if (traj) traj.visible = on;
  $('trajCard').hidden = !on || !trajRow && state.type !== 'secur';
  if (!on) $('trajLabels').querySelectorAll('.cfg-traj').forEach(d => { d.hidden = true; });
}

/* ------------------------------------------------------------------ Camera views */
function views() {
  const { dw, W, D, H } = dims, th = transomH() / 1000, oh = dw * .5;
  const front = { az: [-1.25, 1.25], dist: [3.0, 30], polar: .4 };
  const maxD = Math.min(4.6, D - 1.6), halfIn = W / 2 - .5;
  const azIn = Math.min(.7, Math.asin(Math.min(1, halfIn / maxD)) * .9), polarIn = Math.acos(Math.min(1, (H - .35 - 1.15) / maxD));
  const sd = Math.max(5.2, dw * 1.55 + 1.2);
  return {
    studio: { pos: [sd * .42, 1.75 + th * .4, sd], tgt: [0, (dims.dh + th) / 2, 0], az: [-1.45, 1.45], dist: [2.4, 16], polar: .25 },
    detail: { pos: [-1.7, 1.05, 2.1], tgt: [-.55, 1.0, 0], az: [-1.45, 1.45], dist: [1.2, 16], polar: .25 },
    back: { pos: [-sd * .45, 1.9, sd * .95], tgt: [0, (dims.dh + th) / 2, 0], az: [-1.45, 1.45], dist: [2.4, 16], polar: .25, turn: Math.PI },
    street: { pos: [dw * .55 + 8.6, 2.6, 25.0], tgt: [1.2, 1.0, 0], ...front },
    front: { pos: [dw * .35 + 1.6, 1.65, 9.4], tgt: [.5, 1.25, .4], ...front },
    close: { pos: [2.2, 1.5, 5.8], tgt: [0, 1.25, .45], ...front },
    inside: { pos: [-(halfIn - .35), Math.min(H - .3, dims.dh * .6 + .3), -(maxD - .05)], tgt: [.35, dims.dh * .55, -.7], az: [Math.PI - azIn, Math.PI + azIn], dist: [2.0, maxD], polar: polarIn },
  };
}
let pendingLimits = null;
function applyLimits(v) { controls.minAzimuthAngle = v.az[0]; controls.maxAzimuthAngle = v.az[1]; controls.minDistance = v.dist[0]; controls.maxDistance = v.dist[1]; controls.minPolarAngle = v.polar; }
function goView(name, instant = false) {
  const all = views(), v0 = all[name] || all[state.mode === 'house' ? 'front' : 'studio'];
  state.view = name;
  turnTarget = v0.turn || 0;
  const k = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 1.1 : 1;
  const v = { tgt: v0.tgt, pos: v0.tgt.map((t, i) => t + (v0.pos[i] - t) * k) };
  document.querySelectorAll('#cfgViews button').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  setTrajVisible(name === 'inside' && state.mode === 'house');
  if (name === 'inside' && state.mode === 'house' && state.type === 'secur' && doorTarget === 0 && !instant) setDoor(true);
  controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity; controls.minDistance = .5; controls.maxDistance = 60; controls.minPolarAngle = 0;
  if (instant) { camera.position.fromArray(v.pos); controls.target.fromArray(v.tgt); applyLimits(v0); controls.update(); return; }
  pendingLimits = v0;
  camTween = { from: camera.position.clone(), fromT: controls.target.clone(), to: new THREE.Vector3().fromArray(v.pos), toT: new THREE.Vector3().fromArray(v.tgt), start: performance.now(), dur: 900 };
}
function setDoor(open) {
  doorTarget = open ? 1 : 0; doorFrom = doorT; doorAnimStart = performance.now();
  const btn = $('toggleDoor'); btn.querySelector('span').textContent = open ? 'Tor schließen' : 'Tor öffnen'; btn.classList.toggle('is-open', open);
}
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.cfg-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
  photo.active = mode === 'photo';
  $('photoMode').hidden = !photo.active;
  $('viewsStudio').hidden = mode !== 'studio'; $('viewsHouse').hidden = mode !== 'house';
  $('toggleDoor').hidden = photo.active; $('autoRotate').hidden = mode !== 'studio'; $('dimToggle').hidden = mode !== 'studio';
  $('houseGroup').hidden = mode === 'studio';
  if (!photo.active) { buildWorld(); buildDoor(); goView(mode === 'house' ? 'front' : 'studio', true); }
  else if (!photo.img.hidden) { renderDoorSnapshot(); applyOverlay(); }
  history.replaceState(null, '', hash());
}

/* ------------------------------------------------------------------ Render loop + dimension labels */
function resize() { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); if (composer) composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(wrap); resize();
const _v = new THREE.Vector3();
function place(el, x, y, z, edge = 40) {
  _v.set(x, y, z).project(camera); const w = wrap.clientWidth, h = wrap.clientHeight;
  const px = (_v.x + 1) / 2 * w, py = (1 - _v.y) / 2 * h, vis = _v.z < 1 && px > edge && px < w - edge && py > 60 && py < h - edge;
  el.hidden = !vis; if (vis) { el.style.left = px + 'px'; el.style.top = py + 'px'; }
}
let showDims = true;
function updateLabels() {
  const studioMode = state.mode === 'studio' && !photo.active, th = transomH() / 1000;
  const dl = $('dimLabel');
  if (traj && traj.visible) $('trajLabels').querySelectorAll('.cfg-traj').forEach(d => { const p = trajPts[d.dataset.k]; if (p) place(d, p[0], p[1], p[2], 10); });
  if (!studioMode || !showDims || turnTarget) { dl.hidden = true; $('dimW').hidden = $('dimH').hidden = $('dimT').hidden = true; if (!photo.active) { place(dl, 0, dims.dh + th + .32, 0); dl.hidden = dl.hidden || !showDims; } return; }
  if (traj && traj.visible) $('trajLabels').querySelectorAll('.cfg-traj').forEach(d => { const p = trajPts[d.dataset.k]; if (p) place(d, p[0], p[1], p[2], 10); });
  dl.hidden = true;
  place($('dimW'), 0, -.22, .35); place($('dimH'), dims.dw / 2 + .3, (dims.dh + th) / 2, 0); place($('dimT'), 0, dims.dh + th + .3, 0, 10);
}
let firstFrame = true, overlayDone = false;
const perf = { samples: [], last: 0, adjusted: false };
function adaptQuality(now) {
  if (perf.adjusted) return; if (perf.last) perf.samples.push(now - perf.last); perf.last = now; if (perf.samples.length < 40) return;
  const avg = perf.samples.slice(5).reduce((a, b) => a + b, 0) / (perf.samples.length - 5); perf.adjusted = true;
  if (avg > 45) { aoOn = false; renderer.setPixelRatio(1); if (composer) composer.setPixelRatio(1); resize(); if (avg > 70) { sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.needsUpdate = true; } }
}
function finishLoading() {
  if (overlayDone || !doorRig) return; overlayDone = true;
  controls.update(); draw(); $('cfgLoading').classList.add('done'); perf.last = 0; perf.samples.length = 0;
  const hint = $('cfgHint'); hint.hidden = false; const hide = () => { hint.hidden = true; canvas.removeEventListener('pointerdown', hide); }; canvas.addEventListener('pointerdown', hide); setTimeout(hide, 6500);
  setTimeout(() => mats.prefetch(), 1200);
}
function loop(now) {
  requestAnimationFrame(loop);
  if (camTween) { const k = Math.min(1, (now - camTween.start) / camTween.dur), e = ease(k); camera.position.lerpVectors(camTween.from, camTween.to, e); controls.target.lerpVectors(camTween.fromT, camTween.toT, e); if (k >= 1) { camTween = null; if (pendingLimits) { applyLimits(pendingLimits); pendingLimits = null; } } }
  if (doorAnimStart !== null) { const k = Math.min(1, (now - doorAnimStart) / 2400); doorT = doorFrom + (doorTarget - doorFrom) * k; doorRig.animate(doorT); if (k >= 1) doorAnimStart = null; }
  if (doorRig) { const r = doorRig.group.rotation; const d = turnTarget - r.y; if (Math.abs(d) > .0005) r.y += d * .08; else r.y = turnTarget; }
  controls.autoRotate = autoRotate && state.mode === 'studio' && !camTween; controls.autoRotateSpeed = .9;
  if (window.__lens) window.__lens.uniforms.uTime.value = (now % 1000) / 37;
  controls.update(); if (house) updateImpostors(house, camera); draw(); updateLabels();
  if (firstFrame) { firstFrame = false; window.__t = { frame: performance.now() }; }
  if (!overlayDone && (assetsReady || now - T0 > 7000)) finishLoading();
  if (overlayDone) adaptQuality(now);
  window.__frames = (window.__frames || 0) + 1;
}
const T0 = performance.now();

/* ------------------------------------------------------------------ Thumbnails: live previews of every model in the current finish (offscreen) */
const thumbs = (() => {
  const W = 220, H = 150; let r = null, sc = null, cam = null, cache = new Map(), queue = [], busy = false;
  function init() {
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(W, H, false); r.setPixelRatio(1);
    r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace; r.toneMappingExposure = 1.05;
    sc = new THREE.Scene(); sc.environment = studioEnv; sc.environmentIntensity = .7;
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-1.5, 2.2, 3); sc.add(key);
    const fill = new THREE.DirectionalLight(0xe8f0ff, .9); fill.position.set(2, .5, 2); sc.add(fill);
    sc.background = new THREE.Color(0xe6e8eb); cam = new THREE.PerspectiveCamera(26, W / H, .05, 20); cam.position.set(.55, .3, 2.05); cam.lookAt(0, -.02, 0);
  }
  function key(id) { return id + '|' + (fixedFinish(id) ? 'own' : state.surface + state.color + state.essence + state.finish); }
  const fixedFinish = id => { const m = C.MODELS[id]; return m.family === 'materia' || m.family === 'japan' || !!m.woodlook; };
  function render(id) {
    if (!r) init();
    // models with their own surface (sandstone, charred or aged fir, wood-look foil) are drawn in that surface, not in the current one
    const own = fixedFinish(id) || fixedFinish(state.model);
    if (own) mats.applyDoor({ ...state, model: id });
    const leaf = makeLeaf(1.24, .8, id, M, { joints: false }); sc.add(leaf); const fl = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), M.studioFloor); fl.rotation.x = -Math.PI / 2; fl.position.y = -.4; sc.add(fl); r.render(sc, cam); sc.remove(leaf, fl); dispose(leaf); fl.geometry.dispose();
    const url = r.domElement.toDataURL('image/jpeg', .85);
    if (own) mats.applyDoor(state);
    // only cache once every texture of this finish has arrived, otherwise the leaf renders black
    const ready = [M.door.map, M.door.normalMap, M.door.roughnessMap].every(t => !t || (t.image && (t.image.complete !== false)) || t.isCanvasTexture);
    if (assetsReady && ready) cache.set(key(id), url); else setTimeout(() => thumbs.refresh(), 900);
    return url;
  }
  function pump() {
    if (busy || !queue.length) return; busy = true;
    const { id, el } = queue.shift();
    try { if (el.isConnected) { const k = key(id); el.src = cache.get(k) || render(id); } }
    catch (err) { console.error('thumb', id, err); }
    finally { busy = false; if (queue.length) setTimeout(pump, 0); }
  }
  return {
    request(id, el) { const k = key(id); if (cache.has(k)) { el.src = cache.get(k); return; } queue.push({ id, el }); setTimeout(pump, 0); },
    invalidate() { queue = queue.filter(q => q.el.isConnected); },
    clearCache() { cache.clear(); },
    debug(id) { return render(id); },
    refresh() { cache.clear(); document.querySelectorAll('#optModel .cfg-model').forEach(b => { queue.push({ id: b.dataset.id, el: b.querySelector('img') }); }); setTimeout(pump, 0); },
  };
})();
window.__thumbsReady = () => thumbs.refresh();

/* ------------------------------------------------------------------ Price indication (manufacturer list prices 08/2026) */
/* list price of the steel sectional door (price list Rev. 2635, valid from 14.09.2026) */
function steelCell(w, h, hardware) {
  const hw = G.HARDWARE.find(x => x.id === hardware) || G.HARDWARE[2], grid = hw.grid === 'ext' ? G.GRID_EXT : G.GRID_STD;
  const wi = grid.widths.find(x => x >= w), rows = [...grid.rows].sort((a, b) => a.h - b.h), row = rows.find(r => r.h >= h);
  return { hw, grid: hw.grid, w: wi, h: row ? row.h : null, sections: row ? row.sections : null };
}
function steelPrice(st) {
  const m = C.MODELS[st.model], lines = [], warn = [], cell = steelCell(st.w, st.h, st.hardware);
  const base = G.gridPrice(cell.grid, st.w, st.h);
  if (!base) return { lines, total: null, note: 'Dieses Maß liegt außerhalb des Preisrasters für den gewählten Beschlag: Preis und Machbarkeit auf Anfrage', warn };
  lines.push([`Stahl-Sektionaltor, Beschlag ${cell.hw.id}, Raster ${cell.w} × ${cell.h} mm, ${cell.sections} Sektionen`, base]);
  let total = base;
  const add = (label, p) => { if (p) { lines.push([label, p]); total += p; } };
  if (cell.hw.surcharge) add(`Beschlagstyp ${cell.hw.id}`, cell.hw.surcharge);
  if (m.woodlook) add('Paneel mit Holzimitation (+15 %)', Math.round(base * G.SURCHARGES.panelWoodLook));
  if (st.surface === 'db703') add('Paneel DB 703 (+5 %)', Math.round(base * G.SURCHARGES.panelDB703));
  if (st.surface === 'paint') { const rate = ['9006', '9007'].includes(st.color) ? G.SURCHARGES.paintRal9006_9007PerM2 : G.SURCHARGES.paintRalPerM2PerSide; add(`Lackierung RAL ${st.color} außen (${rate} €/m²)`, G.paintPrice(st.w, st.h, rate, 1)); }
  if (st.springs !== '20000') add(`Torsionsfedern ${Number(st.springs).toLocaleString('de-DE')} Zyklen`, G.SURCHARGES.springs[st.springs]);
  if (st.fve) { const gp = G.glazingPrice(st.fveType, st.w, st.thermal); const gl = G.GLAZING.find(g => g.id === st.fveType); if (gp) add(`Lichtsektion: ${gl.label}${st.thermal ? ', thermisch getrennt' : ''}`, gp); else warn.push('Diese Verglasung ist für die gewählte Breite oder mit thermischer Trennung nicht gelistet, Preis auf Anfrage'); }
  if (st.stwindow) { const wd = G.WINDOWS.find(x => x.code === st.stwindow), cnt = st.w > 4200 ? 4 : st.w > 3100 ? 3 : 2; add(`${cnt} × Fenster ${wd.code} ${wd.label}`, wd.price * cnt); }
  if (st.pedestrian) add('Schlupftür mit Türschließer und Schloss', G.SURCHARGES.pedestrianDoor);
  if (st.stgrille) add('Lüftungsgitter, verschließbar', G.SURCHARGES.ventGrillePlastic);
  const hd = G.HANDLES.find(x => x.code === st.sthandle); if (hd && hd.code !== '466') add(`Handgriff ${hd.code} ${hd.label}`, hd.price);
  const dr = st.stdrive ? G.DRIVES.find(d => d.id === st.stdrive) : null; if (dr) { add(dr.label, dr.price); if (dr.maxH && st.h > dr.maxH) warn.push(`${dr.label}: maximale Torhöhe ${dr.maxH} mm, für dieses Maß bitte längere Schiene anfragen`); }
  const fam = dr ? (dr.id.startsWith('CUBE') ? 'cube' : dr.id.startsWith('COMFORT') ? 'marantec' : 'tormatic') : 'tormatic';
  const accIds = { tormatic: ['tm-digicode', 'tm-handsender'], cube: ['cube-codetaster', 'cube-handsender'], marantec: ['mar-codetaster-526', 'mar-handsender-564'] }[fam];
  if (st.keypad) { const a = G.ACCESSORIES.find(x => x.id === accIds[0]); add(a.label, a.price); }
  if (st.remote) { const a = G.ACCESSORIES.find(x => x.id === accIds[1]); add(a.label, a.price); }
  return { lines, total, cell, note: '', warn, steel: true };
}
function priceFor(st) {
  if (st.type === 'steel') return steelPrice(st);
  const t = C.TYPES[st.type], m = C.MODELS[st.model], lines = [], warn = [];
  if (!t.priced || !m.table) return { lines, total: null, note: 'Preis auf Anfrage', warn };
  const sec = C.sector(st.w, st.h);
  if (!sec) return { lines, total: null, note: 'Dieses Maß liegt außerhalb des Standard-Rasters: Preis und Machbarkeit auf Anfrage', warn };
  if (m.sectors && !m.sectors.includes(sec)) return { lines, total: null, note: `${m.label} ist nur in den Sektoren ${m.sectors.join(' und ')} lieferbar, Preis auf Anfrage`, warn };
  if (m.maxH && st.h > m.maxH) return { lines, total: null, note: `${m.label} ist bis ${m.maxH} mm Höhe lieferbar, Preis auf Anfrage`, warn };
  const ess = C.ESSENCES.find(e => e.id === st.essence) || C.ESSENCES[0];
  const col = m.table === 'materia' ? 'stone' : m.table === 'japan' ? 'wood' : ess.col;
  const base = C.PRICES[m.table][sec][col];
  if (!base) return { lines, total: null, note: 'Preis auf Anfrage', warn };
  lines.push([`${t.label} ${m.label}, ${m.family === 'materia' ? 'Sandstein' : m.family === 'japan' ? C.SPECIAL_WOOD[m.wood].name : ess.name}, Sektor ${sec}`, base]);
  let total = base;
  const add = (label, p) => { if (p) { lines.push([label, p]); total += p; } };
  if (st.surface === 'metal') add('Metal Skin Oberfläche (254 €/m²)', Math.round(254 * st.w * st.h / 1e6));
  if (st.securplus) { if (C.PLUS_SECTORS.includes(sec)) add(C.OPTIONS.securplus.label, C.OPTIONS.securplus.price); else warn.push('SECUR PLUS ist bis Sektor D lieferbar, für dieses Maß auf Anfrage'); }
  if (st.nonprotruding) add(C.OPTIONS.nonprotruding.label, C.OPTIONS.nonprotruding.price);
  if (st.pedestrian) add(C.OPTIONS.pedestrian.label, C.OPTIONS.pedestrian.price);
  if (st.windows) add(C.OPTIONS['windows_' + st.windows].label, C.OPTIONS['windows_' + st.windows].price);
  if (st.transom) add(C.OPTIONS['transom_' + st.transom].label, C.OPTIONS['transom_' + st.transom].price);
  if (st.grille) add(C.OPTIONS.grille.label, C.OPTIONS.grille.price);
  const hd = C.HANDLES.find(h => h.id === st.handle); if (hd && hd.price) add(hd.name, hd.price);
  ['sildomo', 'link', 'keypad', 'remote', 'blockmatic'].forEach(k => { if (st[k]) add(C.OPTIONS[k === 'link' ? 'sildomo_link' : k].label, C.OPTIONS[k === 'link' ? 'sildomo_link' : k].price); });
  if (st.h > 2980) warn.push(C.SECTOR_NOTES.certified);
  return { lines, total, sector: sec, note: st.drive === 'manual' ? 'Manuelle Ausführung: Abzug vom Listenpreis auf Anfrage' : '', warn };
}
/* Range for the chosen model and size: cheapest to most expensive covering, each with the chosen options */
function priceRange() {
  const m = C.MODELS[state.model]; if (!m.table || isSteel()) return null;
  const ess = essencesFor(state.model), totals = [];
  const cands = (m.family === 'materia' || m.family === 'japan') ? [state.essence] : ess.map(e => e.id);
  cands.forEach(id => { const st = { ...state, essence: id }; if (st.surface === 'metal' && id !== 'okoume') st.surface = 'natural'; const p = priceFor(st); if (p.total != null) totals.push(p.total); });
  if (!totals.length) return null;
  return { min: Math.min(...totals), max: Math.max(...totals) };
}
function price() { return priceFor(state); }
const eur = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ Photo mode (own house photo + perspective overlay) */
const photo = { active: false, img: $('photoImg'), overlay: $('doorOverlay'), stage: $('photoStage'), handles: [...document.querySelectorAll('.cfg-handle[data-corner]')], corners: null, snapW: 0, snapH: 0, drag: null };
function renderDoorSnapshot() {
  const { dw, dh } = dims, th = transomH() / 1000;
  const w = 1024, h = Math.round(w * (dh + th + .16) / (dw + .24));
  const cam = new THREE.OrthographicCamera(-(dw / 2 + .12), dw / 2 + .12, dh + th + .12, -.04, .1, 40);
  cam.position.set(0, 0, 8); cam.lookAt(0, 0, 0); cam.layers.set(1);
  const prevT = doorT; if (prevT !== 0) doorRig.animate(0);
  const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
  renderer.setSize(w, h, false); renderer.setClearColor(0x000000, 0); renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  scene.background = bg; scene.fog = fog; resize(); if (prevT !== 0) doorRig.animate(prevT);
  photo.snapW = w; photo.snapH = h; photo.overlay.src = url; photo.overlay.style.width = w + 'px'; photo.overlay.style.height = h + 'px';
}
function photoRect() { const s = photo.stage.getBoundingClientRect(), i = photo.img.getBoundingClientRect(); return { x: i.left - s.left, y: i.top - s.top, w: i.width, h: i.height }; }
function defaultCorners() {
  const { dw, dh } = dims, r = photoRect(); let w = r.w * .38, h = w * dh / dw; if (h > r.h * .5) { h = r.h * .5; w = h * dw / dh; }
  const x = r.w * .5 - w / 2, y = r.h * .8 - h; photo.corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => [px / r.w, py / r.h]);
}
function applyOverlay() {
  if (!photo.corners || !photo.snapW) return;
  const r = photoRect(), pts = photo.corners.map(([nx, ny]) => [r.x + nx * r.w, r.y + ny * r.h]);
  transform2d(photo.overlay, photo.snapW, photo.snapH, pts);
  photo.handles.forEach((hd, i) => { hd.style.left = pts[i][0] + 'px'; hd.style.top = pts[i][1] + 'px'; hd.hidden = false; });
  const svg = $('quadSvg'); svg.removeAttribute('hidden'); $('quadPoly').setAttribute('points', pts.map(p => p.join(',')).join(' '));
  const mv = $('moveHandle'); mv.hidden = false; const cx = pts.reduce((a, p) => a + p[0], 0) / 4, cy = pts.reduce((a, p) => a + p[1], 0) / 4; mv.style.left = cx + 'px'; mv.style.top = cy + 'px';
  photo.overlay.hidden = false;
}
function loadPhoto(file) {
  if (!file) return; const url = URL.createObjectURL(file);
  photo.img.onload = () => { $('photoEmpty').hidden = true; photo.img.hidden = false; $('photoTools').hidden = false; renderDoorSnapshot(); defaultCorners(); applyOverlay(); };
  photo.img.src = url;
}
photo.handles.forEach((hd, i) => {
  hd.addEventListener('pointerdown', e => { hd.setPointerCapture(e.pointerId); photo.drag = i; e.preventDefault(); });
  hd.addEventListener('pointermove', e => { if (photo.drag !== i) return; const s = photo.stage.getBoundingClientRect(), r = photoRect(); photo.corners[i] = [(e.clientX - s.left - r.x) / r.w, (e.clientY - s.top - r.y) / r.h]; applyOverlay(); });
  hd.addEventListener('pointerup', () => { photo.drag = null; });
});
(() => { const mv = $('moveHandle'); let last = null;
  mv.addEventListener('pointerdown', e => { mv.setPointerCapture(e.pointerId); last = [e.clientX, e.clientY]; e.preventDefault(); });
  mv.addEventListener('pointermove', e => { if (!last) return; const r = photoRect(); const dx = (e.clientX - last[0]) / r.w, dy = (e.clientY - last[1]) / r.h; last = [e.clientX, e.clientY]; photo.corners = photo.corners.map(([x, y]) => [x + dx, y + dy]); applyOverlay(); });
  mv.addEventListener('pointerup', () => { last = null; }); })();
$('photoInput').addEventListener('change', e => loadPhoto(e.target.files[0]));
$('photoInput2').addEventListener('change', e => loadPhoto(e.target.files[0]));
$('photoReset').addEventListener('click', () => { defaultCorners(); applyOverlay(); });
window.addEventListener('resize', () => { if (photo.active) applyOverlay(); });
function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
function mulMM(a, b) { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
function mulMV(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function basisToPoints(p1, p2, p3, p4) { const m = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1]; const v = mulMV(adj(m), [p4[0], p4[1], 1]); return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
function homography(w, h, c) { const s = basisToPoints([0, 0], [w, 0], [0, h], [w, h]); const d = basisToPoints(c[0], c[1], c[3], c[2]); const t = mulMM(d, adj(s)); return t.map(v => v / t[8]); }
function transform2d(el, w, h, c) { const t = homography(w, h, c); el.style.transform = `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(',')})`; }
function project(t, x, y) { const v = mulMV(t, [x, y, 1]); return [v[0] / v[2], v[1] / v[2]]; }
function det3(m) { return m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]); }
function solve3(Mx, r) { const D = det3(Mx); if (Math.abs(D) < 1e-9) return null; const col = k => { const m = Mx.slice(); m[k] = r[0]; m[3 + k] = r[1]; m[6 + k] = r[2]; return det3(m) / D; }; return [col(0), col(1), col(2)]; }
function drawTri(ctx, img, s, d) {
  const Mx = [s[0][0], s[0][1], 1, s[1][0], s[1][1], 1, s[2][0], s[2][1], 1];
  const A = solve3(Mx, [d[0][0], d[1][0], d[2][0]]), B = solve3(Mx, [d[0][1], d[1][1], d[2][1]]); if (!A || !B) return;
  const cx = (d[0][0] + d[1][0] + d[2][0]) / 3, cy = (d[0][1] + d[1][1] + d[2][1]) / 3;
  ctx.save(); ctx.beginPath(); d.forEach(([x, y], i) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; const px = x + dx / l * .7, py = y + dy / l * .7; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.closePath(); ctx.clip(); ctx.setTransform(A[0], B[0], A[1], B[1], A[2], B[2]); ctx.drawImage(img, 0, 0); ctx.restore();
}
function exportPhoto() {
  const r = photoRect(), k = Math.min(3, photo.img.naturalWidth / r.w);
  const c = document.createElement('canvas'); c.width = Math.round(r.w * k); c.height = Math.round(r.h * k); const ctx = c.getContext('2d');
  ctx.drawImage(photo.img, 0, 0, c.width, c.height);
  const pts = photo.corners.map(([nx, ny]) => [nx * r.w * k, ny * r.h * k]);
  const t = homography(photo.snapW, photo.snapH, pts), N = 22, w = photo.snapW, h = photo.snapH;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const u0 = w * i / N, u1 = w * (i + 1) / N, v0 = h * j / N, v1 = h * (j + 1) / N;
    const p00 = project(t, u0, v0), p10 = project(t, u1, v0), p11 = project(t, u1, v1), p01 = project(t, u0, v1);
    drawTri(ctx, photo.overlay, [[u0, v0], [u1, v0], [u1, v1]], [p00, p10, p11]); drawTri(ctx, photo.overlay, [[u0, v0], [u1, v1], [u0, v1]], [p00, p11, p01]);
  }
  return c.toDataURL('image/jpeg', .92);
}

/* ------------------------------------------------------------------ UI */
const ICONS = {
  secur: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M11 3v28M35 3v28M14 8h18M14 26h18"/><path d="M19 18h8" stroke-width="2.4"/></svg>',
  sr: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M3 10h40M3 17h40M3 24h40"/></svg>',
  sl: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M11 3v28M19 3v28M27 3v28M35 3v28"/><path d="M8 17H4m0 0 3-3M4 17l3 3" stroke-width="1.4"/></svg>',
  basculap: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M3 12h40M3 22h40"/><path d="M23 27V8M18 13l5-5 5 5"/></svg>',
  wing: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M23 3v28M19 17h2M25 17h2"/></svg>',
  steel: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="40" height="28" rx="1"/><path d="M3 10h40M3 17h40M3 24h40"/><path d="M20 27h6" stroke-width="2.4"/></svg>',
};
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const chip = (c, id, label, on, title) => { const b = el('button', 'cfg-chip', label); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(on)); if (title) b.title = title; c.appendChild(b); return b; };
const swatch = (c, id, label, css, on) => { const b = el('button', 'cfg-swatch', `<span class="dot" style="background:${css}"></span><small>${label}</small>`); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(on)); c.appendChild(b); return b; };
const swCss = sw => `url(${TEX}swatch/${sw}.jpg) center/cover`;
const CAT = 'assets/img/catalog/';
const imgopt = (c, id, label, sub, img, on) => { const b = el('button', 'cfg-imgopt', `<span class="pic">${img ? `<img src="${CAT}${img}" alt="" loading="lazy">` : ''}</span><span class="txt"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span>`); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(on)); c.appendChild(b); return b; };
const sw = (id, key, label, sub, on) => `<label class="cfg-switch"><input type="checkbox" id="${id}" data-key="${key}"${on ? ' checked' : ''}><span class="track"></span><span class="text"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
let familyTab = null;

function renderUI() {
  const t = C.TYPES[state.type], model = C.MODELS[state.model];
  // 1 Tortyp
  const ty = $('optType'); ty.innerHTML = '';
  Object.entries(C.TYPES).forEach(([id, v]) => { const b = el('button', 'cfg-card', `${ICONS[id]}<span>${v.label}<small>${v.desc}</small></span>`); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(state.type === id)); ty.appendChild(b); });
  $('typeFacts').innerHTML = t.facts.map(f => `<li>${f}</li>`).join('');
  // 2 Modell: family tabs + cards with live thumbnails
  const fams = t.families; if (!fams.includes(familyTab)) familyTab = model.family;
  const ft = $('optFamily'); ft.innerHTML = ''; ft.hidden = fams.length < 2;
  fams.forEach(f => chip(ft, f, C.FAMILIES[f].label, familyTab === f));
  $('familyDesc').textContent = C.FAMILIES[familyTab].desc;
  const mc = $('optModel'); mc.innerHTML = '';
  C.modelsOf(state.type).filter(id => C.MODELS[id].family === familyTab).forEach(id => {
    const m = C.MODELS[id]; const b = el('button', 'cfg-model', `<img alt="" width="220" height="150"><span><strong>${m.label}</strong><small>${m.desc}</small></span>`);
    b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(state.model === id)); mc.appendChild(b); thumbs.request(id, b.querySelector('img'));
  });
  // 3 Oberfläche
  const steel = isSteel();
  const ess = essencesFor(state.model), surfs = surfacesFor(state.model, state.essence);
  const fixed = !surfs.length && !steel;
  $('surfFixed').hidden = !fixed; $('surfChoice').hidden = fixed || steel; $('steelSurface').hidden = !steel;
  if (steel) {
    const ss = $('optSteelSurface'); ss.innerHTML = '';
    if (model.woodlook) { ss.hidden = true; $('optSteelColor').innerHTML = ''; $('optSteelColor').className = 'cfg-swatches is-empty'; $('steelPaintNote').textContent = 'Holzimitation: Paneel mit Holzdekor, Aufpreis 15 % auf den Torpreis. Für eine lackierte Fläche wählen Sie das glatte Paneel.'; }
    else {
      ss.hidden = false;
      [['std', 'Standardpaneel'], ['paint', 'Lackiert in RAL'], ['db703', 'DB 703 Eisenglimmer']].forEach(([id, l]) => chip(ss, id, l, state.surface === id));
      const sc = $('optSteelColor'); sc.innerHTML = ''; sc.className = 'cfg-swatches' + (state.surface === 'paint' ? '' : ' is-empty');
      if (state.surface === 'paint') C.RAL.forEach(c => swatch(sc, c.id, `RAL ${c.id}<br>${c.name}`, c.hex, state.color === c.id));
      $('steelPaintNote').textContent = state.surface === 'paint' ? `Lackierung außen ${['9006', '9007'].includes(state.color) ? '43' : '38'} € je m² Torfläche, auch in NCS oder beidseitig auf Anfrage.` : state.surface === 'db703' ? 'DB 703 Eisenglimmer-Paneel, Aufpreis 5 % auf den Torpreis.' : 'Paneel laut aktuellem Paneelangebot, ohne Lackierung.';
    }
  }
  if (fixed) $('surfFixed').innerHTML = `<strong>${surfaceLabel}</strong><p>${model.family === 'materia' ? 'Sandstein-Matte auf Okoumé-Meeresholz, Innenseite glattes Okoumé in Honigton.' : 'Nordische Fichtenbretter, Innenseite glattes Okoumé in Honigton.'}</p>`;
  const es = $('optEssence'); es.innerHTML = ''; ess.forEach(e => swatch(es, e.id, e.name, swCss(e.sw), state.essence === e.id));
  const st = $('optSurface'); st.innerHTML = '';
  const SL = { paint: 'Lackiert (RAL)', stain: 'Imprägniert', natural: 'Natur', metal: 'Metal Skin' };
  surfs.forEach(s => chip(st, s, SL[s], state.surface === s)); st.hidden = surfs.length < 2;
  const co = $('optColor'); co.innerHTML = ''; const cn = $('colorName');
  if (state.surface === 'paint') { C.RAL.forEach(c => swatch(co, c.id, `RAL ${c.id}<br>${c.name}`, c.hex, state.color === c.id)); co.className = 'cfg-swatches'; }
  else if (state.surface === 'stain') { C.STAINS.forEach(c => swatch(co, c.id, c.name, swCss(c.sw), state.color === c.id)); co.className = 'cfg-swatches'; }
  else if (state.surface === 'metal') { C.METAL.forEach(c => swatch(co, c.id, c.name, c.hex, state.color === c.id)); co.className = 'cfg-swatches'; }
  else co.className = 'cfg-swatches is-empty';
  cn.textContent = surfaceLabel;
  const fi = $('optFinish'); fi.innerHTML = ''; Object.entries(C.PAINT_FINISH).forEach(([id, l]) => chip(fi, id, l, state.finish === id)); $('finishRow').hidden = state.surface !== 'paint';
  // 4 Ausstattung
  const isSecur = state.type === 'secur';
  $('securOptions').hidden = !isSecur; $('srOptions').hidden = state.type !== 'sr'; $('woodOptions').hidden = steel; $('steelOptions').hidden = !steel;
  if (steel) renderSteelOptions();
  ['securplus', 'nonprotruding', 'pedestrian', 'grille', 'glazing', 'sildomo', 'link', 'keypad', 'remote', 'blockmatic'].forEach(k => { const i = $('opt_' + k); if (i) i.checked = !!state[k]; });
  const wi = $('optWindows'); wi.innerHTML = ''; [['', 'Keine'], ['s', '2 × 400 × 300 mm'], ['l', '2 × 800 × 300 mm']].forEach(([id, l]) => chip(wi, id || 'none', l, state.windows === id));
  const tr = $('optTransom'); tr.innerHTML = ''; [['', 'Kein Oberlicht'], ['blind', 'Blind, im Tordesign'], ['glass', 'Verglast']].forEach(([id, l]) => chip(tr, id || 'none', l, state.transom === id));
  const ha = $('optHandle'); ha.innerHTML = ''; C.HANDLES.forEach(h => swatch(ha, h.id, h.name + (h.price ? `<br>+ ${eur(h.price)}` : ''), h.hex || M.door.color.getStyle(), state.handle === h.id));
  const dr = $('optDrive'); dr.innerHTML = ''; C.DRIVES.forEach(d => chip(dr, d.id, d.name, state.drive === d.id, d.note));
  // 5 Maße & Haus
  const lim = limitsFor(state.type); $('inpW').min = lim.w[0]; $('inpW').max = lim.w[1]; $('inpH').min = lim.h[0]; $('inpH').max = lim.h[1];
  $('inpW').value = state.w; $('inpH').value = state.h;
  const sp = $('optSize'); sp.innerHTML = ''; C.SIZE_PRESETS.forEach((v, i) => chip(sp, 'size' + i, `${v.label} ${v.w} × ${v.h}`, state.w === v.w && state.h === v.h));
  const sec = C.sector(state.w, state.h); $('sectorNote').textContent = steel ? (() => { const c = steelCell(state.w, state.h, state.hardware); return c.w && c.h ? `Preisraster bis ${c.w} × ${c.h} mm, ${c.sections} Sektionen, Beschlag ${c.hw.id}. Bestellmaß = lichte Öffnung.` : 'Außerhalb des Preisrasters für diesen Beschlag: Preis und Machbarkeit auf Anfrage.'; })() : isSecur ? (sec ? `Preissektor ${sec}, Rahmenpfosten ${C.pillarFor(state.w, state.h, state.pedestrian)} mm, Bestellmaß Außenkante Rahmen.${state.h > 2980 ? ' ' + C.SECTOR_NOTES.certified : ''}` : 'Außerhalb des Standard-Rasters: Preis und Machbarkeit auf Anfrage.') : 'Bestellmaß = lichte Öffnung.';
  const fa = $('optFacade'); fa.innerHTML = ''; C.FACADE.forEach(c => swatch(fa, c.id, c.name, c.hex, state.facade === c.id));
  const ro = $('optRoof'); ro.innerHTML = ''; Object.entries(C.ROOF).forEach(([id, l]) => chip(ro, id, l, state.roof === id));
  const pr = $('optPreset'); pr.innerHTML = ''; C.PRESETS.forEach(v => chip(pr, v.id, v.label, Object.entries(v.patch).every(([k, val]) => state[k] === val)));
  renderSummary();
}
function renderSteelOptions() {
  const root = $('steelOptions');
  root.innerHTML = `
    <div class="cfg-subhead">Beschlag und Federn</div>
    <div class="cfg-chips" id="optHardware"></div>
    <p class="cfg-help" id="hardwareNote"></p>
    <div class="cfg-chips" id="optSprings"></div>
    <div class="cfg-subhead">Lichtsektion</div>
    ${sw('opt_fve', 'fve', 'Verglaste obere Sektion', 'Alurahmen-Sektion mit Verglasung oder Lüftungsfüllung', state.fve)}
    <div id="fveGroup"${state.fve ? '' : ' hidden'}>
      <div class="cfg-imgopts cols-2" id="optFve"></div>
      ${sw('opt_thermal', 'thermal', 'Thermisch getrennt', 'Alurahmen mit thermischer Trennung', state.thermal)}
    </div>
    <div class="cfg-subhead">Fenster</div>
    <div class="cfg-imgopts" id="optStWindow"></div>
    <div class="cfg-subhead">Weitere Ausstattung</div>
    ${sw('opt_pedestrian_s', 'pedestrian', 'Schlupftür', 'Mit Türschließer, Schloss und Drücker beidseitig', state.pedestrian)}
    ${sw('opt_stgrille', 'stgrille', 'Lüftungsgitter', 'Kunststoff, verschließbar', state.stgrille)}
    <div class="cfg-subhead">Handgriff</div>
    <div class="cfg-imgopts" id="optStHandle"></div>
    <div class="cfg-subhead">Antrieb</div>
    <div class="cfg-imgopts cols-2" id="optStDrive"></div>
    <div class="cfg-subhead">Zubehör</div>
    ${sw('opt_keypad_s', 'keypad', 'Funk-Codetaster', 'Passend zum gewählten Antrieb', state.keypad)}
    ${sw('opt_remote_s', 'remote', 'Zusätzlicher Handsender', 'Passend zum gewählten Antrieb', state.remote)}`;
  const hw = $('optHardware'); G.HARDWARE.forEach(h => chip(hw, h.id, h.id, state.hardware === h.id, h.label));
  const cur = G.HARDWARE.find(h => h.id === state.hardware); $('hardwareNote').textContent = `${cur.label}. Sturz ${cur.headroom}, seitlicher Anschlag ${cur.sideRoom}.${cur.surcharge ? ' Aufpreis ' + eur(cur.surcharge) + '.' : ''}`;
  const sp = $('optSprings'); Object.keys(G.SURCHARGES.springs).forEach(k => chip(sp, k, `${Number(k).toLocaleString('de-DE')} Zyklen${G.SURCHARGES.springs[k] ? ' + ' + eur(G.SURCHARGES.springs[k]) : ''}`, state.springs === k));
  const fv = $('optFve'); const fveImg = { 'einfach-pmma': 'guardy-fve-1.png', 'einfach-polycarbonat': 'guardy-fve-1.png', 'einfach-glas': 'guardy-fve-1.png', 'doppelt-pmma': 'guardy-fve-2.png', 'doppelt-pmma-kratzfest-1x': 'guardy-fve-2.png', 'doppelt-pmma-kratzfest-2x': 'guardy-fve-2.png', 'doppelt-pmma-farbe': 'guardy-fve-2.png', 'doppelt-polycarbonat': 'guardy-fve-2.png', 'alu-stucco': 'guardy-fve-3.png', 'streckgitter-16-8': 'guardy-fve-mesh-16-8.png', 'streckgitter-22-12': 'guardy-fve-mesh-22-12.png', 'lochblech-10-10': 'guardy-fve-perforated-10-10.png' };
  G.GLAZING.forEach(g => { const pr = G.glazingPrice(g.id, state.w, state.thermal); imgopt(fv, g.id, g.label, pr ? '+ ' + eur(pr) : 'auf Anfrage', fveImg[g.id], state.fveType === g.id); });
  const wi = $('optStWindow'); imgopt(wi, 'none', 'Ohne Fenster', '', null, !state.stwindow);
  G.WINDOWS.forEach(w => imgopt(wi, w.code, `${w.code} ${w.label}`, `${w.outer[0]} × ${w.outer[1]} mm · + ${eur(w.price)} je Stück`, w.img, state.stwindow === w.code));
  const ha = $('optStHandle'); G.HANDLES.forEach(h => imgopt(ha, h.code, `${h.code} ${h.label}`, h.code === '466' ? 'Serie' : '+ ' + eur(h.price), h.img, state.sthandle === h.code));
  const dr = $('optStDrive'); imgopt(dr, 'none', 'Ohne Antrieb', 'Handbedienung', null, !state.stdrive);
  G.DRIVES.forEach(d => imgopt(dr, d.id, d.label, `${d.force ? d.force + ' N' : ''}${d.maxH ? ' · bis ' + d.maxH + ' mm Höhe' : ''} · + ${eur(d.price)}`, d.img, state.stdrive === d.id));
}
function summaryLines() {
  const t = C.TYPES[state.type], m = C.MODELS[state.model], th = transomH();
  if (isSteel()) {
    const cell = steelCell(state.w, state.h, state.hardware), extras = [];
    if (state.pedestrian) extras.push('Schlupftür'); if (state.stgrille) extras.push('Lüftungsgitter'); if (state.springs !== '20000') extras.push(`Federn ${Number(state.springs).toLocaleString('de-DE')} Zyklen`);
    const wd = state.stwindow ? G.WINDOWS.find(x => x.code === state.stwindow) : null, dr = state.stdrive ? G.DRIVES.find(d => d.id === state.stdrive) : null, gl = G.GLAZING.find(g => g.id === state.fveType);
    const acc = [state.keypad ? 'Funk-Codetaster' : '', state.remote ? 'Handsender' : ''].filter(Boolean);
    return [['Tortyp', t.label], ['Paneel', `${m.label}, 40 mm PUR`], ['Oberfläche', surfaceLabel], ['Beschlag', `${state.hardware}${cell.sections ? `, ${cell.sections} Sektionen` : ''}`],
      ['Lichtsektion', state.fve ? gl.label + (state.thermal ? ', thermisch getrennt' : '') : 'keine'], ['Fenster', wd ? `${wd.code} ${wd.label}` : 'keine'],
      ['Handgriff', `${state.sthandle} ${G.HANDLES.find(h => h.code === state.sthandle).label}`], ['Antrieb', dr ? dr.label : 'ohne Antrieb'], ['Ausstattung', extras.length ? extras.join(', ') : 'Serie'], ['Zubehör', acc.length ? acc.join(', ') : 'keins'],
      ['Bestellmaß (B × H)', `${state.w} × ${state.h} mm`]];
  }
  const extras = [];
  if (state.securplus) extras.push('SECUR PLUS Klasse 3'); if (state.nonprotruding) extras.push('nicht ausschwenkend'); if (state.pedestrian) extras.push('Schlupftür');
  if (state.windows) extras.push(state.windows === 'l' ? 'Fenster 800 × 300' : 'Fenster 400 × 300'); if (state.transom) extras.push(state.transom === 'glass' ? 'Oberlicht verglast' : 'Oberlicht blind'); if (state.grille) extras.push('Lüftungsgitter'); if (state.glazing) extras.push('Lichtausschnitte');
  const smart = ['sildomo', 'link', 'keypad', 'remote', 'blockmatic'].filter(k => state[k]).map(k => C.OPTIONS[k === 'link' ? 'sildomo_link' : k].label.split(' (')[0]);
  return [['Tortyp', t.label], ['Modell', `${m.label} (${C.FAMILIES[m.family].label})`], ['Oberfläche', surfaceLabel + (state.surface === 'paint' ? ', ' + C.PAINT_FINISH[state.finish] : '')],
    ['Griff', C.HANDLES.find(h => h.id === state.handle).name], ['Antrieb', C.DRIVES.find(d => d.id === state.drive).name], ['Ausstattung', extras.length ? extras.join(', ') : 'Serie'], ['Smart & Zubehör', smart.length ? smart.join(', ') : 'keins'],
    ['Bestellmaß (B × H)', `${state.w} × ${state.h} mm${th ? ` + Oberlicht ${th} mm` : ''}`]];
}
function renderSummary() {
  $('summary').innerHTML = summaryLines().map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  const p = price(); const box = $('priceBox');
  const r = priceRange();
  if (p.total != null) {
    const range = r && r.max > r.min ? `<p class="cfg-price-range"><span>Preisspanne ${C.MODELS[state.model].label} in ${state.w} × ${state.h} mm</span><strong>${eur(r.min)} bis ${eur(r.max)}</strong><small>je nach Holzart, mit den gewählten Optionen</small></p>` : '';
    const basis = p.steel ? 'Listenpreis laut Preisliste Stahl-Sektionaltore, gültig ab 14.09.2026, vor Rabatt, ohne MwSt., Lieferung, Montage und Aufmaß.' : 'Listenpreis 08/2026 netto ab Werk, ohne MwSt., Lieferung, Montage und Aufmaß.';
    box.innerHTML = `<div class="cfg-price-total"><span>Preisindikation Listenpreis</span><strong>${eur(p.total)}</strong></div><ul class="cfg-price-lines">${p.lines.map(([l, v]) => `<li><span>${l}</span><span>${eur(v)}</span></li>`).join('')}</ul>${range}${p.warn.map(w => `<p class="cfg-price-warn">${w}</p>`).join('')}<p class="cfg-price-note">${basis} ${p.note} <a href="pages/preise.html">Alle Listenpreise</a></p>`;
  } else box.innerHTML = `<div class="cfg-price-total"><span>Preis</span><strong>auf Anfrage</strong></div><p class="cfg-price-note">${p.note}. Wir melden uns innerhalb eines Werktags mit Aufmaß-Termin und Angebot. ${C.TYPES[state.type].priced ? '' : 'Zur Orientierung: <a href="pages/preise.html">Listenpreise SECUR</a>.'}</p>`;
  const text = summaryLines().map(([k, v]) => `${k}: ${v}`).join('\n') + (p.total != null ? `\nPreisindikation: ${eur(p.total)} (Listenpreis netto)` : '') + `\nLink: ${location.href.split('#')[0].split('?')[0]}${hash()}`;
  const href = `pages/kontakt.html?konfiguration=${encodeURIComponent(text)}`;
  $('requestBtn').href = href; $('stickyRequest').href = href;
  $('dimText').textContent = `${state.w} × ${state.h} mm`; $('dimW').textContent = `${state.w} mm`; $('dimH').textContent = `${state.h + transomH()} mm`; $('dimT').textContent = isSteel() ? `Paneel 40 mm · ${steelSections(state.w, state.h, state.hardware)} Sektionen` : `Torblatt 80 mm · Rahmen ${C.pillarFor(state.w, state.h, state.pedestrian)} mm`;
  $('stickySummary').textContent = `${C.MODELS[state.model].label} · ${surfaceLabel} · ${state.w} × ${state.h}`;
  $('stickyPrice').textContent = p.total != null ? eur(p.total) : 'auf Anfrage';
  const mdl = C.MODELS[state.model];
  const wood = mdl.family === 'materia' ? C.STONES[mdl.stone].hex : mdl.family === 'japan' ? C.SPECIAL_WOOD[mdl.wood].hex : mdl.woodlook ? '#c9a06a'
    : state.surface === 'paint' ? (C.RAL.find(c => c.id === state.color) || {}).hex : state.surface === 'stain' ? (C.STAINS.find(c => c.id === state.color) || {}).hex : state.surface === 'metal' ? (C.METAL.find(c => c.id === state.color) || {}).hex
    : state.surface === 'std' ? '#f1f0ec' : state.surface === 'db703' ? '#4b4d50' : (C.ESSENCES.find(e => e.id === state.essence) || {}).hex;
  $('stickyDot').style.background = wood || '#383e42';
  $('stageModel').textContent = `${C.TYPES[state.type].short} ${C.MODELS[state.model].label}`; $('stageSurface').textContent = surfaceLabel; $('stageDot').style.background = wood || '#383e42';
  $('selType').textContent = C.TYPES[state.type].short; $('selModel').textContent = C.MODELS[state.model].label; $('selSize').textContent = `${state.w} × ${state.h} mm`;
  const optLine = summaryLines().find(l => l[0] === 'Ausstattung'); $('selOptions').textContent = optLine ? optLine[1] : '';
}
function update(patch, { world: rebuild = false } = {}) {
  Object.assign(state, patch); normalise();
  if (rebuild && !photo.active) { buildWorld(); goView(state.view, true); }
  buildDoor(); renderUI(); history.replaceState(null, '', hash());
  if (photo.active && !photo.img.hidden) { renderDoorSnapshot(); applyOverlay(); }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]'); if (!b) return;
  const id = b.dataset.id, box = b.parentElement.id;
  if (box === 'optType') { update(id === 'steel' ? { type: id, surface: state.surface === 'paint' ? 'paint' : 'std' } : { type: id }); familyTab = null; renderUI(); }
  else if (box === 'optFamily') { familyTab = id; renderUI(); }
  else if (box === 'optModel') update({ model: id });
  else if (box === 'optEssence') update({ essence: id, surface: id === 'okoume' ? (state.surface === 'natural' ? 'paint' : state.surface) : (state.surface === 'paint' || state.surface === 'metal' ? 'natural' : state.surface) });
  else if (box === 'optSurface') update({ surface: id });
  else if (box === 'optColor') update({ color: id });
  else if (box === 'optFinish') update({ finish: id });
  else if (box === 'optWindows') update({ windows: id === 'none' ? '' : id });
  else if (box === 'optTransom') update({ transom: id === 'none' ? '' : id }, { world: true });
  else if (box === 'optHandle') update({ handle: id });
  else if (box === 'optDrive') update({ drive: id });
  else if (box === 'optSize') { const v = C.SIZE_PRESETS[parseInt(id.slice(4), 10)]; update({ w: v.w, h: v.h }, { world: true }); }
  else if (box === 'optPreset') update(C.PRESETS.find(v => v.id === id).patch);
  else if (box === 'optFacade') update({ facade: id }, { world: true });
  else if (box === 'optRoof') update({ roof: id }, { world: true });
  else if (box === 'optSteelSurface') update({ surface: id });
  else if (box === 'optSteelColor') update({ color: id });
  else if (box === 'optHardware') update({ hardware: id });
  else if (box === 'optSprings') update({ springs: id });
  else if (box === 'optFve') update({ fveType: id });
  else if (box === 'optStWindow') update({ stwindow: id === 'none' ? '' : id });
  else if (box === 'optStHandle') update({ sthandle: id });
  else if (box === 'optStDrive') update({ stdrive: id === 'none' ? '' : id });
});
$('steelOptions').addEventListener('change', e => { const k = e.target.dataset.key; if (k) update({ [k]: e.target.checked }); });
BOOLS.forEach(k => { const i = $('opt_' + k); if (i) i.addEventListener('change', e => update({ [k]: e.target.checked })); });
function sizeInput(id, key, lim) {
  const e = $(id); const commit = () => { let v = parseInt(e.value, 10); if (!Number.isFinite(v)) v = state[key]; v = clamp(Math.round(v / 5) * 5, limitsFor(state.type)[key]); e.value = v; if (v !== state[key]) update({ [key]: v }, { world: true }); };
  e.addEventListener('change', commit); e.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); commit(); } });
}
sizeInput('inpW', 'w', C.LIMITS.w); sizeInput('inpH', 'h', C.LIMITS.h);
$('resetBtn').addEventListener('click', () => { history.replaceState(null, '', location.pathname); location.reload(); });
$('toggleDoor').addEventListener('click', () => setDoor(doorTarget === 0));
$('autoRotate').addEventListener('click', () => { autoRotate = !autoRotate; $('autoRotate').setAttribute('aria-pressed', String(autoRotate)); });
$('dimToggle').addEventListener('click', () => { showDims = !showDims; $('dimToggle').setAttribute('aria-pressed', String(showDims)); });
document.querySelectorAll('.cfg-views button').forEach(b => b.addEventListener('click', () => { autoRotate = false; $('autoRotate').setAttribute('aria-pressed', 'false'); goView(b.dataset.view); }));
$('shareBtn').addEventListener('click', async () => { const url = location.href.split('#')[0].split('?')[0] + hash(); try { await navigator.clipboard.writeText(url); } catch (err) { prompt('Link zum Kopieren:', url); } $('shareNote').hidden = false; setTimeout(() => { $('shareNote').hidden = true; }, 3500); });
$('saveImage').addEventListener('click', () => {
  let url; if (photo.active && !photo.img.hidden) url = exportPhoto(); else { draw(); url = renderer.domElement.toDataURL('image/jpeg', .92); }
  const a = document.createElement('a'); a.href = url; a.download = `DTT-${C.MODELS[state.model].label}-${state.surface === 'paint' ? state.color : state.surface}.jpg`; a.click();
});
document.querySelectorAll('.cfg-tab').forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
document.querySelectorAll('.cfg-step-head').forEach(h => h.addEventListener('click', () => { const s = h.parentElement; s.classList.toggle('is-collapsed'); }));
document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { const s = $(b.dataset.jump); s.classList.remove('is-collapsed'); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
document.querySelectorAll('.cfg-stepnav a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const s = $(a.dataset.step); s.classList.remove('is-collapsed'); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
(() => { const panel = document.querySelector('.cfg-panel'), links = [...document.querySelectorAll('.cfg-stepnav a')]; if (!panel) return;
  const io = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.dataset.step === en.target.id)); }); }, { root: window.matchMedia('(max-width: 900px)').matches ? null : panel, rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  ['step1', 'step2', 'step3', 'step4', 'step5'].forEach(id => io.observe($(id))); })();

/* ------------------------------------------------------------------ Go */
if (q.has('clean')) document.body.classList.add('cfg-clean');
window.__cfg = { camera, controls, state, scene, world, dims: () => dims, price, thumbs, update, setMode, goView, setDoor, THREE };
buildWorld(); buildDoor(); renderUI();
setMode(state.mode === 'photo' ? 'house' : state.mode);
goView(q.get('view') || (state.mode === 'house' ? 'front' : 'studio'), true);
if (q.get('open') === '1') { doorT = 1; doorTarget = 1; doorRig.animate(1); $('toggleDoor').querySelector('span').textContent = 'Tor schließen'; }
history.replaceState(null, '', location.pathname + location.search + hash());
(async () => { try { await renderer.compileAsync(scene, camera); } catch (e) { /* lazy compile */ } loop(performance.now()); })();
