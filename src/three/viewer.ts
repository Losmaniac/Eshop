import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createRenderer, productShot } from "./scenes";

// Interactive 3D view for the product page. Loaded on demand (dynamic import)
// so three.js never slows down the first page load.

export type Viewer = {
  update: (variantId: string) => void;
  reset: () => void;
  dispose: () => void;
};

export function mountViewer(container: HTMLElement, slug: string, variantId: string): Viewer {
  const renderer = createRenderer();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  let current = variantId;
  let shot = productShot(renderer, slug, current, 1);
  const controls = new OrbitControls(shot.camera, renderer.domElement);
  const wallMounted = slug === "nastenna-dekorace" || slug === "loga-a-napisy";
  let needsRender = true;

  function configure() {
    controls.object = shot.camera;
    controls.target.copy(shot.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    const distance = shot.camera.position.distanceTo(shot.target);
    controls.minDistance = distance * 0.45;
    controls.maxDistance = distance * 1.8;
    if (wallMounted) {
      controls.minAzimuthAngle = -Math.PI / 3;
      controls.maxAzimuthAngle = Math.PI / 3;
      controls.minPolarAngle = Math.PI / 4;
      controls.maxPolarAngle = Math.PI * 0.62;
    } else {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0.15;
      controls.maxPolarAngle = Math.PI / 2 - 0.04;
    }
    controls.update();
    resize();
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    shot.camera.aspect = w / h;
    shot.camera.updateProjectionMatrix();
    needsRender = true;
  }

  function disposeScene(scene: THREE.Scene) {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((m) => m.dispose());
      }
    });
    scene.environment?.dispose();
  }

  controls.addEventListener("change", () => (needsRender = true));
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  configure();

  let frame = 0;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    // damping keeps moving for a moment after the pointer is released
    if (controls.update() || needsRender) {
      renderer.render(shot.scene, shot.camera);
      needsRender = false;
    }
  };
  loop();

  return {
    update(nextVariant) {
      const old = shot.scene;
      const previous = shot.camera.position.clone().sub(shot.target);
      current = nextVariant;
      shot = productShot(renderer, slug, current, shot.camera.aspect);
      // keep the user's viewing angle, scaled to the new model size
      const fresh = shot.camera.position.clone().sub(shot.target);
      shot.camera.position.copy(shot.target).add(previous.normalize().multiplyScalar(fresh.length()));
      configure();
      disposeScene(old);
    },
    reset() {
      const fresh = productShot(renderer, slug, current, shot.camera.aspect);
      shot.camera.position.copy(fresh.camera.position);
      disposeScene(fresh.scene);
      configure();
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      disposeScene(shot.scene);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
