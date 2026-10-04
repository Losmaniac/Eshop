import * as THREE from "three";

// Procedural, tileable textures for the metals and surfaces. Generated in the
// browser at runtime, so no texture files are needed.

export type MetalFinish = "corten" | "steel" | "blackSteel" | "stainless";

function hash(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Tileable value noise, period in lattice cells. */
function valueNoise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const wrap = (n: number) => ((n % period) + period) % period;
  const a = hash(wrap(xi), wrap(yi), seed);
  const b = hash(wrap(xi + 1), wrap(yi), seed);
  const c = hash(wrap(xi), wrap(yi + 1), seed);
  const d = hash(wrap(xi + 1), wrap(yi + 1), seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, basePeriod: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, basePeriod * freq, seed + o * 17);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

type Rgb = [number, number, number];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function ramp(stops: [number, Rgb][], t: number): Rgb {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      return mix(c0, c1, (t - t0) / (t1 - t0));
    }
  }
  return stops[stops.length - 1][1];
}

type PixelFn = (u: number, v: number) => { color: Rgb; rough: number; height: number };

const cache = new Map<string, { map: THREE.Texture; roughnessMap: THREE.Texture; bumpMap: THREE.Texture }>();

function makeTextures(key: string, size: number, fn: PixelFn) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvases = [0, 1, 2].map(() => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return c;
  });
  const ctxs = canvases.map((c) => c.getContext("2d")!);
  const images = ctxs.map((ctx) => ctx.createImageData(size, size));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const { color, rough, height } = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      images[0].data.set([color[0], color[1], color[2], 255], i);
      const r = Math.max(0, Math.min(255, rough * 255));
      images[1].data.set([r, r, r, 255], i);
      const h = Math.max(0, Math.min(255, height * 255));
      images[2].data.set([h, h, h, 255], i);
    }
  }
  images.forEach((img, i) => ctxs[i].putImageData(img, 0, 0));
  const [map, roughnessMap, bumpMap] = canvases.map((c) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  });
  map.colorSpace = THREE.SRGBColorSpace;
  const result = { map, roughnessMap, bumpMap };
  cache.set(key, result);
  return result;
}

function cortenTextures() {
  return makeTextures("corten", 512, (u, v) => {
    const n = fbm(u * 12, v * 12, 12, 6, 3);
    const mid = fbm(u * 40, v * 40, 40, 3, 9);
    const fine = valueNoise(u * 256, v * 256, 256, 5);
    const t = Math.min(1, Math.max(0, 0.55 + (n - 0.5) * 0.5 + (mid - 0.5) * 0.7 + (fine - 0.5) * 0.4));
    const color = ramp(
      [
        [0, [58, 28, 17]],
        [0.4, [96, 44, 22]],
        [0.65, [122, 56, 27]],
        [0.85, [146, 72, 36]],
        [1, [160, 86, 48]],
      ],
      t,
    );
    return { color, rough: 0.78 + fine * 0.18, height: mid * 0.5 + fine * 0.5 };
  });
}

function steelTextures(black: boolean) {
  return makeTextures(black ? "blackSteel" : "steel", 512, (u, v) => {
    const n = fbm(u * 6, v * 6, 6, 5, black ? 21 : 11);
    const mid = fbm(u * 32, v * 32, 32, 3, 31);
    const streak = valueNoise(u * 3, v * 160, 160, 33);
    const fine = valueNoise(u * 220, v * 220, 220, 2);
    const base: Rgb = black ? [34, 35, 38] : [58, 60, 64];
    const light: Rgb = black ? [58, 60, 66] : [88, 91, 96];
    const t = 0.4 + (n - 0.5) * 0.35 + (mid - 0.5) * 0.45 + (streak - 0.5) * 0.25;
    let color = mix(base, light, Math.min(1, Math.max(0, t)));
    // mill scale: faint bluish-grey flakes
    if (mid > 0.66) color = mix(color, black ? [50, 56, 66] : [76, 84, 96], (mid - 0.66) * 1.5);
    color = mix(color, [0, 0, 0], (fine - 0.5) * 0.1);
    return { color, rough: (black ? 0.42 : 0.48) + mid * 0.2 + fine * 0.08, height: mid * 0.5 + fine * 0.5 };
  });
}

function stainlessTextures() {
  return makeTextures("stainless", 512, (u, v) => {
    // brushed: long streaks along u
    const streak = valueNoise(u * 4, v * 400, 400, 41) * 0.6 + valueNoise(u * 2, v * 900, 900, 43) * 0.4;
    const c = 196 + (streak - 0.5) * 30;
    return { color: [c, c + 2, c + 5], rough: 0.22 + streak * 0.18, height: streak };
  });
}

/** Physically based metal material. `repeat` is texture tiles per metre. */
export function metalMaterial(finish: MetalFinish, repeat = 1.5): THREE.MeshStandardMaterial {
  const tex =
    finish === "corten"
      ? cortenTextures()
      : finish === "stainless"
        ? stainlessTextures()
        : steelTextures(finish === "blackSteel");
  const clone = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(repeat, repeat);
    c.needsUpdate = true;
    return c;
  };
  return new THREE.MeshStandardMaterial({
    map: clone(tex.map),
    roughnessMap: clone(tex.roughnessMap),
    bumpMap: clone(tex.bumpMap),
    bumpScale: finish === "corten" ? 0.8 : finish === "stainless" ? 0.15 : 0.5,
    roughness: 1,
    metalness: finish === "corten" ? 0.35 : finish === "stainless" ? 1 : 0.85,
    envMapIntensity: finish === "stainless" ? 1.2 : 1,
  });
}

/** Black steel with heat tint around the centre opening, for the grill plate. */
export function grillPlateMaterial(outerR: number, innerR: number): THREE.MeshStandardMaterial {
  const size = 1024;
  const key = `plate-${outerR}-${innerR}`;
  const tex = makeTextures(key, size, (u, v) => {
    const x = (u - 0.5) * 2 * outerR;
    const y = (v - 0.5) * 2 * outerR;
    const r = Math.hypot(x, y);
    const t = Math.min(1, Math.max(0, (r - innerR) / (outerR - innerR)));
    const n = fbm(u * 10, v * 10, 10, 5, 77);
    const fine = valueNoise(u * 400, v * 400, 400, 78);
    // oiled, seasoned zone near the fire is darker and slightly bronze
    const seasoned: Rgb = [24, 20, 17];
    const bronze: Rgb = [52, 40, 30];
    const raw: Rgb = [58, 60, 64];
    let color = t < 0.35 ? mix(seasoned, bronze, t / 0.35) : mix(bronze, raw, Math.min(1, (t - 0.35) / 0.4));
    color = mix(color, [90, 92, 96], Math.max(0, n - 0.55) * 0.8);
    color = mix(color, [0, 0, 0], (fine - 0.5) * 0.15);
    const rough = t < 0.5 ? 0.28 + t * 0.4 : 0.48 + n * 0.2;
    return { color, rough, height: n * 0.6 + fine * 0.4 };
  });
  // Extrude UVs are in metres; map the [-R, R] square onto the texture.
  const prep = (t: THREE.Texture) => {
    const c = t.clone();
    c.wrapS = c.wrapT = THREE.ClampToEdgeWrapping;
    c.repeat.set(1 / (2 * outerR), 1 / (2 * outerR));
    c.offset.set(0.5, 0.5);
    c.needsUpdate = true;
    return c;
  };
  return new THREE.MeshStandardMaterial({
    map: prep(tex.map),
    roughnessMap: prep(tex.roughnessMap),
    bumpMap: prep(tex.bumpMap),
    bumpScale: 0.4,
    roughness: 1,
    metalness: 0.8,
  });
}

export function plasterMaterial(color: Rgb = [214, 209, 201], repeat = 1): THREE.MeshStandardMaterial {
  const key = `plaster-${color.join(",")}`;
  const tex = makeTextures(key, 512, (u, v) => {
    const n = fbm(u * 16, v * 16, 16, 5, 51);
    const fine = valueNoise(u * 300, v * 300, 300, 52);
    const c = mix(color, [color[0] * 0.92, color[1] * 0.92, color[2] * 0.92], n * 0.6 + fine * 0.2);
    return { color: c, rough: 0.9, height: n * 0.4 + fine * 0.6 };
  });
  const clone = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(repeat, repeat);
    c.needsUpdate = true;
    return c;
  };
  return new THREE.MeshStandardMaterial({ map: clone(tex.map), bumpMap: clone(tex.bumpMap), bumpScale: 0.6, roughness: 0.92 });
}

export function woodMaterial(): THREE.MeshStandardMaterial {
  const tex = makeTextures("oak", 512, (u, v) => {
    const grain = fbm(u * 3, v * 40, 40, 4, 61);
    const rings = Math.sin((u * 30 + grain * 6) * Math.PI) * 0.5 + 0.5;
    const c = mix([150, 112, 76], [118, 84, 54], rings * 0.6 + grain * 0.4);
    return { color: c, rough: 0.7, height: rings };
  });
  return new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bumpMap, bumpScale: 0.3, roughness: 0.65 });
}

/** Radial gradient sprite texture for flames and glow. */
export function glowTexture(inner: string, outer: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Glowing embers with dark cracks, for logs in the fire. */
export function emberMaterial(): THREE.MeshStandardMaterial {
  const tex = makeTextures("embers", 256, (u, v) => {
    const n = fbm(u * 6, v * 6, 6, 5, 91);
    const cracks = Math.abs(valueNoise(u * 14, v * 14, 14, 92) - 0.5) < 0.06 ? 1 : 0;
    const glow = Math.max(0, n - 0.45) * 2.2 + cracks * 0.8;
    const c = mix([20, 14, 10], [255, 120, 30], Math.min(1, glow));
    return { color: c, rough: 0.9, height: n };
  });
  return new THREE.MeshStandardMaterial({
    color: 0x1a120c,
    roughness: 0.95,
    emissive: 0xffffff,
    emissiveMap: tex.map,
    emissiveIntensity: 2.2,
  });
}

/** Soft teardrop flame for additive sprites. */
export function flameTexture(seed: number): THREE.Texture {
  const w = 128;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(5px)";
  const lean = (hash(seed, 1, 3) - 0.5) * 30;
  const draw = (scale: number, color: string) => {
    const bw = w * 0.36 * scale;
    const top = h * (1 - 0.9 * scale);
    ctx.beginPath();
    ctx.moveTo(w / 2, h - 8);
    ctx.bezierCurveTo(w / 2 - bw * 1.3, h - 20, w / 2 - bw * 0.9, h * 0.45, w / 2 + lean, top);
    ctx.bezierCurveTo(w / 2 + bw * 0.9, h * 0.45, w / 2 + bw * 1.3, h - 20, w / 2, h - 8);
    ctx.fillStyle = color;
    ctx.fill();
  };
  draw(1, "rgba(255,80,10,0.55)");
  draw(0.75, "rgba(255,150,40,0.75)");
  draw(0.45, "rgba(255,225,150,0.9)");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
