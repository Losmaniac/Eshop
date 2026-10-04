import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { czechiaCities, czechiaOutline, logoGlyphs } from "./data";
import { emberMaterial, flameTexture, glowTexture, grillPlateMaterial, metalMaterial, type MetalFinish } from "./materials";

// Geometry of the products. All units are metres. Every part is a flat
// laser-cut sheet, built as an extruded 2D outline, just like the real thing.

type Pt = [number, number];

function shapeFrom(points: Pt[], holes: THREE.Path[] = []): THREE.Shape {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.holes.push(...holes);
  return shape;
}

function circlePath(x: number, y: number, r: number, clockwise = true): THREE.Path {
  const p = new THREE.Path();
  p.absarc(x, y, r, 0, Math.PI * 2, clockwise);
  return p;
}

function extrude(shapes: THREE.Shape | THREE.Shape[], depth: number, curveSegments = 24): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shapes, {
    depth,
    curveSegments,
    bevelEnabled: true,
    bevelThickness: Math.min(0.0006, depth * 0.15),
    bevelSize: 0.0006,
    bevelSegments: 1,
  });
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Seeded pseudo-random numbers so models look the same on every render. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Grill plate -----------------------------------------------------------

export function grillPlate(outerD: number, thickness: number, innerRatio = 0.5): THREE.Mesh {
  const R = outerD / 2;
  const r = R * innerRatio;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, R, 0, Math.PI * 2, false);
  shape.holes.push(circlePath(0, 0, r));
  const geo = extrude(shape, thickness, 160);
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, grillPlateMaterial(R, r));
}

// --- Slot-together fire pit -----------------------------------------------

type PanelOptions = {
  length: number;
  height: number;
  slotsAt: number[];
  slotWidth: number;
  slotsFromTop: boolean;
  legWidth: number;
  archHeight: number;
  pattern: boolean;
  seed: number;
};

function panelShape(o: PanelOptions): THREE.Shape {
  const L = o.length;
  const H = o.height;
  const half = o.slotWidth / 2;
  const slotDepth = H / 2;
  const pts: Pt[] = [];

  // bottom edge, left → right, with the arch between the legs
  pts.push([-L / 2, 0]);
  const bottomSlots = o.slotsFromTop ? [] : [...o.slotsAt].sort((a, b) => a - b);
  const addBottomSlot = (x: number) => {
    pts.push([x - half, 0], [x - half, slotDepth], [x + half, slotDepth], [x + half, 0]);
  };
  const archStart = -L / 2 + o.legWidth;
  const archEnd = L / 2 - o.legWidth;
  for (const x of bottomSlots.filter((s) => s < archStart)) addBottomSlot(x);
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = archStart + (archEnd - archStart) * t;
    const y = Math.sin(Math.PI * t) ** 0.6 * o.archHeight;
    pts.push([x, y]);
  }
  for (const x of bottomSlots.filter((s) => s > archEnd)) addBottomSlot(x);
  pts.push([L / 2, 0]);

  // right edge up, top edge right → left
  pts.push([L / 2, H]);
  const topSlots = o.slotsFromTop ? [...o.slotsAt].sort((a, b) => b - a) : [];
  for (const x of topSlots) {
    pts.push([x + half, H], [x + half, H - slotDepth], [x - half, H - slotDepth], [x - half, H]);
  }
  pts.push([-L / 2, H]);

  const holes: THREE.Path[] = [];
  if (o.pattern) {
    // rising sparks: a regular hex grid of round holes that shrink towards the top
    const inner = Math.abs(o.slotsAt[0]) - 0.07;
    const y0 = o.archHeight + 0.045;
    const y1 = H - 0.05;
    const step = 0.03;
    const rowHeight = step * 0.866;
    for (let row = 0; y0 + row * rowHeight <= y1; row++) {
      const y = y0 + row * rowHeight;
      const t = (y - y0) / (y1 - y0);
      const r = 0.0115 * (1 - t) ** 1.6;
      if (r < 0.0022) break;
      const offset = (row % 2) * step * 0.5;
      for (let x = -inner + offset; x <= inner + 1e-6; x += step) holes.push(circlePath(x, y, r));
    }
  }
  return shapeFrom(pts, holes);
}

export type FirePitOptions = { width: number; height: number; thickness: number; finish: MetalFinish };

export function firePitPanels(o: FirePitOptions) {
  const overhang = 0.045;
  const common = {
    length: o.width + overhang * 2,
    height: o.height,
    slotsAt: [-o.width / 2, o.width / 2],
    slotWidth: o.thickness + 0.002,
    legWidth: overhang + 0.075,
    archHeight: o.height * 0.16,
    pattern: true,
  };
  return {
    front: panelShape({ ...common, slotsFromTop: true, seed: 1 }),
    side: panelShape({ ...common, slotsFromTop: false, seed: 2 }),
    bottom: shapeFrom(
      [
        [-o.width / 2 + 0.006, -o.width / 2 + 0.006],
        [o.width / 2 - 0.006, -o.width / 2 + 0.006],
        [o.width / 2 - 0.006, o.width / 2 - 0.006],
        [-o.width / 2 + 0.006, o.width / 2 - 0.006],
      ],
      // air holes in the ash plate
      Array.from({ length: 25 }, (_, i) => circlePath(((i % 5) - 2) * o.width * 0.16, (Math.floor(i / 5) - 2) * o.width * 0.16, 0.012)),
    ),
  };
}

export function firePit(o: FirePitOptions): THREE.Group {
  const material = metalMaterial(o.finish, 2);
  const panels = firePitPanels(o);
  const group = new THREE.Group();
  const frontGeo = extrude(panels.front, o.thickness);
  frontGeo.translate(0, 0, -o.thickness / 2);
  const sideGeo = extrude(panels.side, o.thickness);
  sideGeo.translate(0, 0, -o.thickness / 2);

  for (const z of [-o.width / 2, o.width / 2]) {
    const m = mesh(frontGeo, material);
    m.position.z = z;
    group.add(m);
  }
  for (const x of [-o.width / 2, o.width / 2]) {
    const m = mesh(sideGeo, material);
    m.rotation.y = Math.PI / 2;
    m.position.x = x;
    group.add(m);
  }
  const bottomGeo = extrude(panels.bottom, o.thickness);
  bottomGeo.rotateX(-Math.PI / 2);
  const bottom = mesh(bottomGeo, material);
  bottom.position.y = o.height * 0.16 + 0.03;
  group.add(bottom);
  group.userData.ashPlateY = bottom.position.y + o.thickness;
  return group;
}

/** The kit as it ships: all parts stacked flat. */
export function firePitFlatPack(o: FirePitOptions): THREE.Group {
  const material = metalMaterial(o.finish, 2);
  const panels = firePitPanels(o);
  const group = new THREE.Group();
  // panels fanned out like a hand of cards, the ash plate beside them
  const parts = [panels.front, panels.front, panels.side, panels.side];
  parts.forEach((shape, i) => {
    const geo = extrude(shape, o.thickness);
    geo.rotateX(-Math.PI / 2);
    const m = mesh(geo, material);
    m.position.set(-0.1 + i * 0.07, i * (o.thickness + 0.001), 0.22 - i * 0.13);
    m.rotation.y = 0.25 - i * 0.07;
    group.add(m);
  });
  const bottomGeo = extrude(panels.bottom, o.thickness);
  bottomGeo.rotateX(-Math.PI / 2);
  const bottom = mesh(bottomGeo, material);
  bottom.position.set(o.width * 1.05, 0, 0.05);
  bottom.rotation.y = -0.15;
  group.add(bottom);
  return group;
}

/** Glowing logs, flames and a warm light, placed on the ash plate. */
export function fire(baseY: number, width: number, intensity = 1): THREE.Group {
  const group = new THREE.Group();
  const embers = emberMaterial();
  const random = rng(7);
  for (let i = 0; i < 5; i++) {
    const log = mesh(new THREE.CylinderGeometry(0.035, 0.04, width * 0.62, 12), embers);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 5) * Math.PI + random() * 0.3;
    log.rotation.x = (random() - 0.5) * 0.3;
    log.position.y = baseY + 0.04 + (i % 2) * 0.05;
    log.castShadow = false;
    group.add(log);
  }
  const flameMats = [0, 1, 2, 3].map(
    (i) =>
      new THREE.SpriteMaterial({
        map: flameTexture(i + 1),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
      }),
  );
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Sprite(flameMats[i % flameMats.length]);
    const h = (0.22 + random() * 0.28) * width * intensity;
    s.scale.set(h * 0.5, h, 1);
    s.position.set((random() - 0.5) * width * 0.3, baseY + 0.05 + h * 0.45, (random() - 0.5) * width * 0.3);
    group.add(s);
  }
  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture("rgba(255,150,60,0.5)", "rgba(255,80,0,0)"),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  core.scale.set(width * 0.8, width * 0.45, 1);
  core.position.y = baseY + 0.1;
  group.add(core);

  const light = new THREE.PointLight(0xff8a3c, 3.2 * intensity, 0, 2);
  light.position.y = baseY + 0.25;
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.002;
  group.add(light);
  return group;
}

// --- Wall art -------------------------------------------------------------

type Segment = { a: Pt; b: Pt; wa: number; wb: number };

function segmentShape({ a, b, wa, wb }: Segment): THREE.Shape {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return shapeFrom([
    [a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2],
    [b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2],
    [b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2],
    [a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2],
  ]);
}

function discShape(x: number, y: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  s.absarc(x, y, r, 0, Math.PI * 2, false);
  return s;
}

/** Tree of life in a ring, in a unit circle (radius 1). */
function treeOfLifeShapes(): THREE.Shape[] {
  const random = rng(42);
  const shapes: THREE.Shape[] = [];
  const ring = discShape(0, 0, 1);
  ring.holes.push(circlePath(0, 0, 0.935));
  shapes.push(ring);

  const limit = 0.955;
  const grow = (from: Pt, angle: number, length: number, width: number, depth: number, sign: 1 | -1) => {
    let to: Pt = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
    const dist = Math.hypot(to[0], to[1]);
    let last = depth === 0;
    if (dist > limit) {
      to = [(to[0] / dist) * limit, (to[1] / dist) * limit];
      last = true;
    }
    const endWidth = Math.max(width * 0.68, 0.012);
    shapes.push(segmentShape({ a: from, b: to, wa: width, wb: endWidth }));
    shapes.push(discShape(to[0], to[1], endWidth / 2));
    if (last) {
      if (dist <= limit) shapes.push(discShape(to[0], to[1], 0.022 + random() * 0.012)); // leaf
      return;
    }
    const spread = 0.38 + random() * 0.22;
    const count = depth > 4 ? 2 : random() < 0.35 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const offset = count === 2 ? (i === 0 ? -spread : spread) : (i - 1) * spread;
      grow(to, angle + offset * sign + (random() - 0.5) * 0.15, length * (0.7 + random() * 0.12), endWidth, depth - 1, sign);
    }
  };
  // trunk
  const base: Pt = [0, -0.62];
  const fork: Pt = [0, -0.12];
  shapes.push(segmentShape({ a: [0, -0.94], b: base, wa: 0.2, wb: 0.13 }));
  shapes.push(segmentShape({ a: base, b: fork, wa: 0.13, wb: 0.09 }));
  // crown
  grow(fork, Math.PI / 2 + 0.55, 0.34, 0.085, 6, 1);
  grow(fork, Math.PI / 2 - 0.55, 0.34, 0.085, 6, -1);
  grow(fork, Math.PI / 2, 0.3, 0.07, 5, 1);
  // roots
  for (const a of [-0.35, -0.9, -2.25, -2.8]) grow(base, a, 0.24, 0.06, 3, a < -1.5 ? -1 : 1);
  return shapes;
}

function mountainShapes(width: number, height: number): THREE.Shape[] {
  const random = rng(5);
  const peaks: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = -width / 2 + width * t;
    const tall = Math.sin(t * Math.PI) * 0.55 + 0.35;
    const y = height * (i % 2 === 0 ? tall * (0.55 + random() * 0.15) : tall * (0.9 + random() * 0.1));
    peaks.push([x, i === 0 || i === n ? height * 0.18 : y]);
  }
  const outline: Pt[] = [[-width / 2, 0], [width / 2, 0], ...peaks.slice().reverse()];
  // inner ridges: thin slits following a lower, smoother ridge line
  const holes: THREE.Path[] = [];
  for (const [drop, gap] of [[0.22, 0.012], [0.42, 0.012]] as const) {
    const top: Pt[] = [];
    const bottom: Pt[] = [];
    for (let i = 1; i < n; i++) {
      const [x, y] = peaks[i];
      const yy = Math.max(height * 0.1, y - height * drop + Math.sin(i * 1.7) * height * 0.03);
      top.push([x, yy]);
      bottom.push([x, yy - gap * (i % 2 === 1 ? 1.6 : 1)]);
    }
    const p = new THREE.Path(top.concat(bottom.reverse()).map(([x, y]) => new THREE.Vector2(x, y)));
    holes.push(p);
  }
  // a few pine trees at the foot
  for (let i = 0; i < 7; i++) {
    const x = -width * 0.38 + i * width * 0.06 + random() * 0.02;
    const h = height * (0.1 + random() * 0.05);
    const w = h * 0.45;
    holes.push(new THREE.Path([new THREE.Vector2(x - w / 2, 0.035), new THREE.Vector2(x + w / 2, 0.035), new THREE.Vector2(x, 0.035 + h)]));
  }
  return [shapeFrom(outline, holes)];
}

function czechiaShapes(width: number): THREE.Shape[] {
  const scale = width / 1; // outline is normalized so that its width is 1
  const pts: Pt[] = czechiaOutline.map(([x, y]) => [x * scale, y * scale]);
  const holes = czechiaCities.map(([, x, y, size]) => circlePath(x * scale, y * scale, width * 0.0115 * (0.6 + size * 0.6)));
  return [shapeFrom(pts, holes)];
}

export type WallArtMotif = "strom" | "mapa" | "hory";

/** Wall panel lying in the XY plane, facing +Z, centred at the origin. */
export function wallArt(motif: WallArtMotif, width: number, thickness: number, finish: MetalFinish = "corten"): THREE.Mesh {
  const height = width * (2 / 3);
  let geo: THREE.BufferGeometry;
  if (motif === "strom") {
    const r = height / 2;
    const parts = treeOfLifeShapes().map((s) => {
      const g = extrude(s, thickness, 32);
      g.scale(r, r, 1);
      return g;
    });
    geo = mergeGeometries(parts.map((g) => g.toNonIndexed()));
  } else if (motif === "hory") {
    geo = extrude(mountainShapes(width, height), thickness, 8);
    geo.translate(0, -height / 2, 0);
  } else {
    geo = extrude(czechiaShapes(width), thickness, 24);
  }
  geo.computeVertexNormals();
  return mesh(geo, metalMaterial(finish, 1.4));
}

// --- Façade lettering -------------------------------------------------------

function glyphShapes(d: string, unitsToMetres: number): THREE.Shape[] {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  return data.paths.flatMap((p) => SVGLoader.createShapes(p)).map((shape) => {
    const pts = shape.getPoints(12).map((v) => new THREE.Vector2(v.x * unitsToMetres, -v.y * unitsToMetres));
    const s = new THREE.Shape(pts);
    s.holes = shape.holes.map(
      (h) => new THREE.Path(h.getPoints(12).map((v) => new THREE.Vector2(v.x * unitsToMetres, -v.y * unitsToMetres))),
    );
    return s;
  });
}

/** Sample company sign: logo word and a smaller line, centred, facing +Z. */
export function facadeSign(capHeight: number, thickness: number, finish: MetalFinish): THREE.Group {
  const group = new THREE.Group();
  const material = metalMaterial(finish, 3);
  const k = capHeight / (logoGlyphs.upm * 0.727); // Inter Tight cap height ≈ 0.727 em
  const logo = extrude(glyphShapes(logoGlyphs.logo.d, k), thickness, 12);
  logo.translate((-logoGlyphs.logo.width * k) / 2, 0, 0);
  group.add(mesh(logo, material));
  const k2 = k * 0.24;
  const sub = extrude(glyphShapes(logoGlyphs.sub.d, k2), thickness * 0.8, 8);
  sub.translate((-logoGlyphs.sub.width * k2) / 2, -capHeight * 0.48, 0);
  group.add(mesh(sub, material));
  // a mark left of the word: circle with a triangle cut out
  const mark = discShape(0, 0, capHeight * 0.55);
  mark.holes.push(
    new THREE.Path([
      new THREE.Vector2(-capHeight * 0.28, -capHeight * 0.22),
      new THREE.Vector2(capHeight * 0.28, -capHeight * 0.22),
      new THREE.Vector2(0, capHeight * 0.3),
    ]),
  );
  const markGeo = extrude(mark, thickness, 64);
  markGeo.translate((-logoGlyphs.logo.width * k) / 2 - capHeight * 0.85, capHeight * 0.5, 0);
  group.add(mesh(markGeo, material));
  group.position.x = capHeight * 0.7;
  return group;
}
