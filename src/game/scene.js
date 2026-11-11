import * as B from "@babylonjs/core/Legacy/legacy";
import { WORLD, WORLD_BOUNDS, currentTarget, distance2D } from "./world-map.js";
import { movementVector, WALK_SPEED, RUN_SPEED } from "./logic.js";

// Os modelos são procedurais; nenhum arquivo proprietário do Unity é exigido.
// Câmera inicial olha para +Z: W avança, S recua, Q/R giram a câmera.
const v = (x, y, z) => new B.Vector3(x, y, z);
const color = (hex) => B.Color3.FromHexString(hex);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const blendAngle = (from, to, t) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * t;

export function createWorld(canvas, onInteractRequest) {
  const isMobile = matchMedia("(pointer:coarse)").matches || innerWidth < 850;
  const engine = new B.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false, antialias: true }, true);
  engine.setHardwareScalingLevel(isMobile ? 1.45 : Math.max(1, Math.min(devicePixelRatio || 1, 1.5)));
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(0.055, 0.15, 0.18, 1);
  scene.fogMode = B.Scene.FOGMODE_EXP2;
  scene.fogColor = color("#183c42");
  scene.fogDensity = 0.008;
  const camera = new B.FreeCamera("Câmera de exploração", v(0, 9, -17), scene);
  camera.minZ = 0.1;
  camera.maxZ = 270;
  camera.fov = 0.9;
  camera.inputs.clear();
  scene.activeCamera = camera;

  const hemi = new B.HemisphericLight("Luz natural", v(-0.2, 1, 0.2), scene);
  hemi.intensity = 0.9;
  hemi.diffuse = color("#d9f8e6");
  hemi.groundColor = color("#263f43");
  const sun = new B.DirectionalLight("Sol", v(-0.45, -1, 0.6), scene);
  sun.position = v(23, 40, -34);
  sun.intensity = 1.45;
  sun.diffuse = color("#ffe9c0");

  const shadow = !isMobile ? new B.ShadowGenerator(1024, sun) : null;
  if (shadow) {
    shadow.useBlurExponentialShadowMap = true;
    shadow.blurKernel = 14;
  }

  function material(name, hex, emissive = null) {
    const mat = new B.StandardMaterial(name, scene);
    mat.diffuseColor = color(hex);
    mat.specularColor = color("#102020");
    if (emissive) mat.emissiveColor = color(emissive);
    return mat;
  }
  const mats = {
    grass: material("grama", "#31574a"),
    path: material("trilha de terra", "#9a8463"),
    stone: material("pedra clara", "#718a89"),
    darkStone: material("pedra escura", "#304950"),
    wood: material("madeira", "#634735"),
    leaf: material("folhas claras", "#376f59"),
    leaf2: material("folhas escuras", "#265746"),
    roof: material("telhado", "#895b50"),
    magic: material("energia e objetivos", "#6cffe0", "#44d1b2"),
    gold: material("ouro antigo", "#c9ad63", "#8d6c25"),
    white: material("off-white", "#e1e7d8")
  };

  const ground = B.MeshBuilder.CreateGround("Vale dos Conjuntos", { width: 95, height: 145, subdivisions: 1 }, scene);
  ground.position.z = 33;
  ground.material = mats.grass;
  ground.receiveShadows = true;
  function box(name, pos, size, mat, rotationY = 0) {
    const mesh = B.MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene);
    mesh.position.copyFrom(pos);
    mesh.rotation.y = rotationY;
    mesh.material = mat;
    mesh.receiveShadows = true;
    return mesh;
  }
  function sphere(name, pos, radius, mat, segments = 8) {
    const mesh = B.MeshBuilder.CreateSphere(name, { diameter: radius * 2, segments }, scene);
    mesh.position.copyFrom(pos);
    mesh.material = mat;
    return mesh;
  }
  function cylinder(name, pos, height, bottom, top, mat, tessellation = 8) {
    const mesh = B.MeshBuilder.CreateCylinder(name, { height, diameterBottom: bottom, diameterTop: top, tessellation }, scene);
    mesh.position.copyFrom(pos);
    mesh.material = mat;
    return mesh;
  }
  for (let i = 0; i < 52; i++) {
    const z = -11 + i * 1.85;
    const bend = Math.sin(z * 0.135) * 2.8;
    const tile = box("Trilha " + i, v(bend, 0.04, z), [7.5, 0.08, 1.88], mats.path, 0.02 * Math.sin(z));
    tile.receiveShadows = true;
  }
  // Rio, pontes decorativas e pedras do vale.
  box("Leito do rio", v(-31, 0.025, 32), [6, 0.06, 137], material("rio", "#236c82", "#0a3857"));
  for (let i = 0; i < 8; i++) {
    const z = -4 + i * 13;
    cylinder("Marco de pedra", v(-24, 0.54, z), 1, 1.2, 0.7, mats.stone, 6);
  }
  let seed = 1148;
  function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = 0; i < (isMobile ? 62 : 118); i++) {
    const z = -22 + random() * 118;
    const side = random() < 0.5 ? -1 : 1;
    const x = side * (11 + random() * 28);
    const scale = 0.75 + random() * 0.95;
    const trunk = cylinder("Tronco", v(x, 1.35 * scale, z), 2.7 * scale, 0.53 * scale, 0.35 * scale, mats.wood, 6);
    const leafMat = random() < 0.42 ? mats.leaf2 : mats.leaf;
    cylinder("Copa baixa", v(x, 3.1 * scale, z), 3.5 * scale, 3.7 * scale, 0, leafMat, 7);
    cylinder("Copa alta", v(x, 4.55 * scale, z), 2.4 * scale, 2.65 * scale, 0, leafMat, 7);
    trunk.isPickable = false;
  }
  for (let i = 0; i < 100; i++) {
    const z = -20 + random() * 118;
    const x = (random() - 0.5) * 85;
    if (Math.abs(x - Math.sin(z * .135) * 2.8) < 6) continue;
    const r = 0.16 + random() * 0.48;
    sphere("Pedra", v(x, r * .42, z), r, random() < .6 ? mats.stone : mats.darkStone, 5);
  }
  function cottage(name, x, z, scale = 1) {
    box(name + " paredes", v(x, 2 * scale, z), [4.6 * scale, 4 * scale, 4.1 * scale], mats.stone);
    const roof = cylinder(name + " telhado", v(x, 4.9 * scale, z), 1.9 * scale, 6.0 * scale, 0, mats.roof, 4);
    roof.rotation.y = Math.PI / 4;
    box(name + " porta", v(x, 1.3 * scale, z - 2.11 * scale), [1.1 * scale, 2.5 * scale, .12], mats.wood);
    box(name + " janela", v(x + 1.1 * scale, 2.5 * scale, z - 2.12 * scale), [.75 * scale, .7 * scale, .12], mats.gold);
  }
  cottage("Casa de Liora", -10, 3, 1.15);
  cottage("Casa do cartógrafo", 12, 7, .9);
  cottage("Biblioteca da vila", 12, -7, 1.1);

  // Castelo do chefe final.
  for (const x of [-11, 11]) {
    box("Muralha do castelo", v(x, 4.2, 79), [4.2, 8.4, 12], mats.darkStone);
    cylinder("Torre", v(x, 8.1, 74), 16.2, 5.3, 5.3, mats.stone, 10);
    cylinder("Topo", v(x, 16.9, 74), 2.8, 6.7, 0, mats.roof, 10);
  }
  box("Portão do castelo", v(0, 5.1, 82), [18, 10.2, 2], mats.darkStone);
  box("Portal luminoso", v(0, 3.3, 80.8), [5.4, 6.4, .15], material("portal", "#297b75", "#13534d"));

  function createPerson(name, x, z, palette, size = 1) {
    const root = new B.TransformNode(name + " raiz", scene);
    root.position = v(x, 0, z);
    const skin = material(name + " pele", palette.skin || "#e0ad81");
    const fabric = material(name + " roupa", palette.fabric || "#28756c");
    const pants = material(name + " calças", palette.pants || "#2b374c");
    const hair = material(name + " cabelo", palette.hair || "#2d2531");
    const leather = material(name + " couro", "#674e3d");
    const torso = box(name + " tronco", v(0, 1.45 * size, 0), [.95 * size, 1.12 * size, .57 * size], fabric);
    torso.parent = root;
    const belt = box(name + " cinto", v(0, 1.02 * size, 0), [1.02 * size, .16 * size, .62 * size], leather);
    belt.parent = root;
    const head = sphere(name + " cabeça", v(0, 2.3 * size, 0), .37 * size, skin, 12);
    head.parent = root;
    const hairCap = sphere(name + " cabelo", v(0, 2.53 * size, -.06 * size), .37 * size, hair, 12);
    hairCap.parent = root;
    const eye = sphere(name + " olhos", v(-.13 * size, 2.33 * size, .33 * size), .045 * size, mats.darkStone, 8);
    eye.parent = root;
    const eye2 = sphere(name + " olhos", v(.13 * size, 2.33 * size, .33 * size), .045 * size, mats.darkStone, 8);
    eye2.parent = root;
    const leftArm = new B.TransformNode(name + " ombro esquerdo", scene);
    leftArm.parent = root; leftArm.position = v(-.64 * size, 1.86 * size, 0);
    const rightArm = new B.TransformNode(name + " ombro direito", scene);
    rightArm.parent = root; rightArm.position = v(.64 * size, 1.86 * size, 0);
    const armA = box(name + " braço esquerdo", v(0, -.37 * size, 0), [.32 * size, .75 * size, .36 * size], fabric);
    armA.parent = leftArm;
    const armB = box(name + " braço direito", v(0, -.37 * size, 0), [.32 * size, .75 * size, .36 * size], fabric);
    armB.parent = rightArm;
    const leftLeg = new B.TransformNode(name + " perna esquerda", scene);
    leftLeg.parent = root; leftLeg.position = v(-.27 * size, .92 * size, 0);
    const rightLeg = new B.TransformNode(name + " perna direita", scene);
    rightLeg.parent = root; rightLeg.position = v(.27 * size, .92 * size, 0);
    const legA = box(name + " canela esquerda", v(0, -.42 * size, 0), [.35 * size, .8 * size, .43 * size], pants);
    legA.parent = leftLeg;
    const legB = box(name + " canela direita", v(0, -.42 * size, 0), [.35 * size, .8 * size, .43 * size], pants);
    legB.parent = rightLeg;
    const shoeA = box(name + " bota esquerda", v(0, -.78 * size, .13 * size), [.4 * size, .22 * size, .65 * size], leather);
    shoeA.parent = leftLeg;
    const shoeB = box(name + " bota direita", v(0, -.78 * size, .13 * size), [.4 * size, .22 * size, .65 * size], leather);
    shoeB.parent = rightLeg;
    if (shadow && name === "Aventureiro") shadow.addShadowCaster(torso, true);
    return { root, torso, leftArm, rightArm, leftLeg, rightLeg, size };
  }
  const player = createPerson("Aventureiro", 0, -3, { fabric: "#2d8e8a", pants: "#25364f", hair: "#2f2735" }, 1);
  const liora = createPerson("Liora", WORLD.liora.x, WORLD.liora.z, { fabric: "#d8b98b", pants: "#754f64", hair: "#e9e3de" }, 1);
  liora.root.rotation.y = Math.PI;
  const guardianMeshes = {};
  for (const e of WORLD.guardians) {
    const guardian = createPerson(e.label, e.x, e.z, { fabric: e.color, pants: "#32415d", hair: "#dae4e5", skin: "#b5d5d2" }, 1.5);
    guardianMeshes[e.id] = guardian;
    cylinder(e.label + " pedestal", v(e.x, .2, e.z), .4, 3.5, 3.7, mats.darkStone, 16);
  }
  const boss = createPerson("Cael", WORLD.boss.x, WORLD.boss.z, { fabric: "#984d57", pants: "#382e46", hair: "#e8dfc9", skin: "#d9b79c" }, 1.83);
  cylinder("Trono do Cael", v(0, .3, WORLD.boss.z), .6, 5, 5, mats.darkStone, 10);
  function floatingGlyph(name, x, z, hex, scale = 1) {
    const mat = material(name + " matéria", hex, hex);
    const mesh = B.MeshBuilder.CreatePolyhedron(name, { type: 1, size: .72 * scale }, scene);
    mesh.position = v(x, 2.0 * scale, z);
    mesh.material = mat;
    const halo = B.MeshBuilder.CreateTorus(name + " aura", { diameter: 2.1 * scale, thickness: .1 * scale, tessellation: 22 }, scene);
    halo.position = v(x, .18, z);
    halo.material = mat;
    return { mesh, halo };
  }
  const crystalMeshes = {};
  for (const c of WORLD.crystals) crystalMeshes[c.id] = floatingGlyph(c.id, c.x, c.z, c.color, .9);
  floatingGlyph("Liora aura", WORLD.liora.x, WORLD.liora.z, "#ffe4a3", .6);
  for (const e of WORLD.guardians) floatingGlyph("Guardiã " + e.id, e.x, e.z, e.color, .65);
  floatingGlyph("Cael aura", WORLD.boss.x, WORLD.boss.z, "#ff9b67", .82);
  const targetMaterial = material("Direção ativa", "#7efce0", "#47f2c1");
  const navMat = material("Pontos da direção", "#79f8d0", "#61ebba");
  const waypoint = B.MeshBuilder.CreateCylinder("Seta do objetivo", { height: 1.4, diameterBottom: 0, diameterTop: .9, tessellation: 5 }, scene);
  waypoint.material = targetMaterial;
  waypoint.rotation.z = Math.PI;
  const targetRing = B.MeshBuilder.CreateTorus("Círculo da missão", { diameter: 3.5, thickness: .12, tessellation: 32 }, scene);
  targetRing.material = targetMaterial;
  const navDots = Array.from({ length: 13 }, (_, i) => {
    const dot = sphere("Passo guia " + i, v(0, -.5, 0), .18, navMat, 8);
    dot.isVisible = false;
    return dot;
  });
  const glow = !isMobile ? new B.GlowLayer("Efeitos luminosos", scene, { blurKernelSize: 40 }) : null;
  if (glow) glow.intensity = .42;

  let elapsed = 0;
  let cameraYaw = 0;
  let runningTime = 0;
  let lastX = 0, lastZ = 0;
  let prevPhase = "";
  function update(state, dt, keys, active) {
    dt = clamp(dt, 0, .05);
    elapsed += dt;
    if (active && !state.battle) {
      if (keys.q) cameraYaw -= dt * 1.7;
      if (keys.r) cameraYaw += dt * 1.7;
      const dir = movementVector(keys, cameraYaw);
      const sprint = Boolean(keys.shift) && (Math.abs(dir.x) + Math.abs(dir.z)) > 0;
      const speed = sprint ? RUN_SPEED : WALK_SPEED;
      const accel = sprint ? 13.5 : 11.5;
      const ease = clamp(dt * accel, 0, 1);
      lastX += (dir.x * speed - lastX) * ease;
      lastZ += (dir.z * speed - lastZ) * ease;
      const nextX = clamp(state.position.x + lastX * dt, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
      const nextZ = clamp(state.position.z + lastZ * dt, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
      state.position.x = nextX;
      state.position.z = nextZ;
      const moveSpeed = Math.hypot(lastX, lastZ);
      if (moveSpeed > .22) {
        player.root.rotation.y = blendAngle(player.root.rotation.y, Math.atan2(lastX, lastZ), clamp(dt * 12, 0, 1));
        runningTime += dt * (sprint ? 14 : 9);
        const stride = Math.sin(runningTime) * (sprint ? .83 : .52) * clamp(moveSpeed / WALK_SPEED, 0, 1);
        player.leftLeg.rotation.x = stride;
        player.rightLeg.rotation.x = -stride;
        player.leftArm.rotation.x = -stride * .86;
        player.rightArm.rotation.x = stride * .86;
        player.torso.position.y = 1.45 + Math.abs(Math.sin(runningTime)) * (sprint ? .13 : .06);
        player.torso.rotation.z = Math.sin(runningTime * .5) * .045;
      } else {
        player.leftLeg.rotation.x *= .86;
        player.rightLeg.rotation.x *= .86;
        player.leftArm.rotation.x *= .86;
        player.rightArm.rotation.x *= .86;
        player.torso.position.y += (1.45 - player.torso.position.y) * clamp(dt * 6, 0, 1);
        player.torso.rotation.z *= .88;
      }
    } else { lastX *= .84; lastZ *= .84; }
    player.root.position.x = state.position.x;
    player.root.position.z = state.position.z;
    const cameraTarget = v(state.position.x - Math.sin(cameraYaw) * 13.8, 8.3, state.position.z - Math.cos(cameraYaw) * 14.6);
    camera.position.copyFrom(B.Vector3.Lerp(camera.position, cameraTarget, clamp(dt * 5.6, 0, 1)));
    camera.setTarget(v(state.position.x, 1.65, state.position.z + .3));
    for (const c of WORLD.crystals) {
      const item = crystalMeshes[c.id];
      const show = !state.crystals.includes(c.id);
      item.mesh.isVisible = show;
      item.halo.isVisible = show;
      item.mesh.position.y = 1.5 + Math.sin(elapsed * 2.1 + c.x) * .24;
      item.mesh.rotation.y = elapsed * 1.15;
    }
    for (const e of WORLD.guardians) {
      const alive = !state.defeated.includes(e.id);
      guardianMeshes[e.id].root.setEnabled(alive);
    }
    boss.root.setEnabled(!state.defeated.includes("cael"));
    liora.leftArm.rotation.x = Math.sin(elapsed) * .15;
    const target = currentTarget(state);
    if (target) {
      waypoint.isVisible = true;
      targetRing.isVisible = true;
      waypoint.position = v(target.x, 4.8 + Math.sin(elapsed * 3) * .35, target.z);
      waypoint.rotation.y += dt * 1.6;
      targetRing.position = v(target.x, .17 + Math.sin(elapsed * 2.5) * .04, target.z);
      targetRing.rotation.z += dt * .3;
      const dist = distance2D(state.position, target);
      navDots.forEach((dot, i) => {
        const t = (i + 1) / (navDots.length + 1);
        const navDist = t * Math.min(dist, 26);
        const frac = dist > 0 ? navDist / dist : 0;
        dot.isVisible = dist > 5 && frac < .98;
        const offset = Math.sin(elapsed * 2 + i) * .1;
        dot.position.set(state.position.x + (target.x - state.position.x) * frac, .17 + offset, state.position.z + (target.z - state.position.z) * frac);
        dot.scaling.setAll(.7 + .2 * Math.sin(elapsed * 2.6 - i * .3));
      });
    } else {
      waypoint.isVisible = false;
      targetRing.isVisible = false;
      navDots.forEach((dot) => dot.isVisible = false);
    }
    if (prevPhase !== state.phase) prevPhase = state.phase;
    scene.render();
  }
  function directionAngle(state) {
    const target = currentTarget(state);
    if (!target) return 0;
    const dx = target.x - state.position.x;
    const dz = target.z - state.position.z;
    return Math.atan2(dx, dz) - cameraYaw - Math.PI / 2;
  }
  const resize = () => engine.resize();
  window.addEventListener("resize", resize, { passive: true });
  canvas.addEventListener("pointerdown", () => {
    if (document.pointerLockElement === canvas) document.exitPointerLock?.();
  });
  return {
    engine, scene, update, directionAngle,
    dispose() { window.removeEventListener("resize", resize); scene.dispose(); engine.dispose(); }
  };
}
