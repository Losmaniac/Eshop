import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { plasterMaterial, woodMaterial, type MetalFinish } from "./materials";
import { facadeSign, fire, firePit, firePitFlatPack, grillPlate, wallArt, type WallArtMotif } from "./models";

// Scenes for product images and the interactive 3D view. The same models
// are used for both, so what the customer rotates is what the photos show.

export type StageKind = "studio" | "night" | "wall" | "facade";

export type Shot = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Point the 3D view orbits around. */
  target: THREE.Vector3;
};

export function createRenderer(canvas?: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  return renderer;
}

function environment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

function keyLight(intensity: number, position: [number, number, number], extent: number): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(...position);
  light.castShadow = true;
  light.shadow.mapSize.set(4096, 4096);
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.01;
  const cam = light.shadow.camera;
  cam.left = cam.bottom = -extent;
  cam.right = cam.top = extent;
  cam.near = 0.1;
  cam.far = 30;
  return light;
}

function stage(kind: StageKind, renderer: THREE.WebGLRenderer, extent = 1.5): THREE.Scene {
  const scene = new THREE.Scene();
  scene.environment = environment(renderer);

  if (kind === "studio") {
    scene.background = new THREE.Color(0xe9e6e1);
    scene.environmentIntensity = 0.85;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    scene.add(keyLight(2.4, [2.5, 5, 3], extent));
    const rim = new THREE.DirectionalLight(0xffffff, 0.8);
    rim.position.set(-4, 3, -3);
    scene.add(rim);
  }

  if (kind === "night") {
    scene.background = new THREE.Color(0x0e0c0b);
    scene.fog = new THREE.Fog(0x0e0c0b, 3, 9);
    scene.environmentIntensity = 0.14;
    const ground = new THREE.Mesh(new THREE.CircleGeometry(12, 64), plasterMaterial([58, 54, 50], 6));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const moon = new THREE.DirectionalLight(0x8fa6c8, 0.7);
    moon.position.set(-3, 5, -2);
    scene.add(moon);
  }

  if (kind === "wall" || kind === "facade") {
    const wallColor: [number, number, number] = kind === "wall" ? [222, 217, 209] : [128, 128, 126];
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), plasterMaterial(wallColor, 3));
    wall.position.y = 4;
    wall.receiveShadow = true;
    scene.add(wall);
    scene.background = new THREE.Color(0x222222);
    scene.environmentIntensity = kind === "wall" ? 0.55 : 0.75;
    if (kind === "wall") {
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), woodMaterial());
      floor.rotation.x = -Math.PI / 2;
      floor.position.z = 3;
      floor.receiveShadow = true;
      scene.add(floor);
    }
    const sun = keyLight(kind === "wall" ? 2.6 : 3.2, kind === "wall" ? [-2.2, 4.5, 2.4] : [2.5, 6, 2.2], 3);
    sun.target.position.set(0, 1.5, 0);
    scene.add(sun, sun.target);
  }
  return scene;
}

function camera(aspect: number, fov: number, position: [number, number, number], target: THREE.Vector3) {
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.05, 50);
  cam.position.set(...position);
  cam.lookAt(target);
  return cam;
}

// --- Product → model mapping ------------------------------------------------

const pitSizes = {
  "600": { width: 0.6, height: 0.4, thickness: 0.004 },
  "800": { width: 0.8, height: 0.5, thickness: 0.005 },
} as const;

function pitFromVariant(variantId: string) {
  const [size, material] = variantId.split("-") as ["600" | "800", "ocel" | "corten"];
  const dims = pitSizes[size] ?? pitSizes["600"];
  return { ...dims, finish: (material === "corten" ? "corten" : "steel") as MetalFinish };
}

function plate(d: number) {
  return grillPlate(d / 1000, d >= 1000 ? 0.008 : 0.006);
}

/** Builds the scene for one product variant (used by the 3D view). */
export function productShot(renderer: THREE.WebGLRenderer, slug: string, variantId: string, aspect: number): Shot {
  if (slug === "grilovaci-plat") {
    const d = Number(variantId) || 800;
    const scene = stage("studio", renderer, (d / 1000) * 1.6);
    const m = plate(d);
    m.position.y = 0.0005;
    scene.add(m);
    const s = d / 1000;
    const target = new THREE.Vector3(0, 0, 0);
    return { scene, target, camera: camera(aspect, 30, [s * 1.1, s * 1.15, s * 1.6], target) };
  }

  if (slug === "skladaci-ohniste" || slug === "set-ohniste-a-plat") {
    const pit = pitFromVariant(variantId);
    const scene = stage("studio", renderer, pit.width * 2.6);
    scene.add(firePit(pit));
    let top = pit.height;
    if (slug === "set-ohniste-a-plat") {
      const p = plate(pit.width === 0.6 ? 800 : 1000);
      p.position.y = pit.height;
      scene.add(p);
      top += 0.01;
    }
    const target = new THREE.Vector3(0, top * 0.45, 0);
    const s = pit.width;
    return { scene, target, camera: camera(aspect, 30, [s * 1.7, s * 1.45, s * 2.3], target) };
  }

  if (slug === "nastenna-dekorace") {
    const [motif, size] = variantId.split("-") as [WallArtMotif, string];
    const width = (Number(size) || 1200) / 1000;
    const scene = stage("wall", renderer);
    const art = wallArt(motif, width, width >= 2 ? 0.003 : 0.002);
    const centreY = 1.45;
    art.position.set(0, centreY, 0.03);
    scene.add(art);
    const target = new THREE.Vector3(0, centreY, 0);
    return { scene, target, camera: camera(aspect, 32, [width * 0.55, centreY - 0.05, width * 1.75], target) };
  }

  // façade lettering
  const scene = stage("facade", renderer);
  const sign = facadeSign(0.32, 0.004, "stainless");
  sign.position.set(0, 2, 0.025);
  scene.add(sign);
  const target = new THREE.Vector3(0, 1.95, 0);
  return { scene, target, camera: camera(aspect, 30, [0.9, 1.75, 3.7], target) };
}

// --- Fixed shots for the product images --------------------------------------

export type ShotId =
  | "hero"
  | "plate-studio"
  | "plate-fire"
  | "pit-corten"
  | "pit-steel"
  | "pit-flatpack"
  | "pit-fire"
  | "set-studio"
  | "wall-strom"
  | "wall-mapa"
  | "wall-hory"
  | "sign-stainless"
  | "sign-corten";

function nightPit(renderer: THREE.WebGLRenderer, aspect: number, withPlate: boolean, wide: boolean): Shot {
  const dims = pitSizes["800"];
  const scene = stage("night", renderer);
  const pit = firePit({ ...dims, finish: "corten" });
  scene.add(pit);
  scene.add(fire(pit.userData.ashPlateY as number, dims.width, withPlate ? 0.8 : 1));
  if (withPlate) {
    const p = plate(1000);
    p.position.y = dims.height;
    scene.add(p);
  }
  const target = new THREE.Vector3(wide ? -0.45 : 0, wide ? 0.3 : 0.2, 0);
  const pos: [number, number, number] = wide ? [1.3, 1.05, 2.15] : [1.15, 1.0, 1.65];
  return { scene, target, camera: camera(aspect, wide ? 34 : 32, pos, target) };
}

export function fixedShot(renderer: THREE.WebGLRenderer, id: ShotId, aspect: number): Shot {
  switch (id) {
    case "hero":
      return nightPit(renderer, aspect, true, true);
    case "plate-fire":
      return nightPit(renderer, aspect, true, false);
    case "pit-fire":
      return nightPit(renderer, aspect, false, false);
    case "plate-studio":
      return productShot(renderer, "grilovaci-plat", "800", aspect);
    case "pit-corten":
      return productShot(renderer, "skladaci-ohniste", "600-corten", aspect);
    case "pit-steel":
      return productShot(renderer, "skladaci-ohniste", "600-ocel", aspect);
    case "set-studio":
      return productShot(renderer, "set-ohniste-a-plat", "600-ocel", aspect);
    case "pit-flatpack": {
      const dims = pitSizes["600"];
      const scene = stage("studio", renderer, 1.2);
      const pack = firePitFlatPack({ ...dims, finish: "corten" });
      pack.position.x = -0.3;
      scene.add(pack);
      const target = new THREE.Vector3(0.05, 0, 0);
      return { scene, target, camera: camera(aspect, 34, [0.45, 1.85, 1.6], target) };
    }
    case "wall-strom":
    case "wall-mapa":
    case "wall-hory": {
      const shot = productShot(renderer, "nastenna-dekorace", `${id.slice(5)}-1600`, aspect);
      addBench(shot.scene, 1.3);
      shot.target.set(0, 1.12, 0);
      shot.camera.position.set(0.8, 1.15, 3.6);
      shot.camera.lookAt(shot.target);
      return shot;
    }
    case "sign-stainless":
      return productShot(renderer, "loga-a-napisy", "", aspect);
    case "sign-corten": {
      const scene = stage("facade", renderer);
      (scene.children.find((c) => c instanceof THREE.Mesh) as THREE.Mesh).material = plasterMaterial([46, 47, 49], 3);
      const sign = facadeSign(0.32, 0.005, "corten");
      sign.position.set(0, 2, 0.025);
      scene.add(sign);
      const target = new THREE.Vector3(0, 1.95, 0);
      return { scene, target, camera: camera(aspect, 30, [-0.45, 1.7, 3.9], target) };
    }
  }
}

/** Adds a simple oak bench under wall art for scale (photos only). */
export function addBench(scene: THREE.Scene, width: number) {
  const wood = woodMaterial();
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.38), wood);
  top.position.set(0, 0.45, 0.25);
  top.castShadow = top.receiveShadow = true;
  scene.add(top);
  for (const x of [-width / 2 + 0.06, width / 2 - 0.06]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.43, 0.34), wood);
    leg.position.set(x, 0.215, 0.25);
    leg.castShadow = true;
    scene.add(leg);
  }
}
