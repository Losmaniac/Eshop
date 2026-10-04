// Browser entry for scripts/render/render.mjs: renders one fixed shot.
import { createRenderer, fixedShot, type ShotId } from "../../src/three/scenes";

declare global {
  interface Window {
    renderShot: (id: ShotId, width: number, height: number) => string;
  }
}

window.renderShot = (id, width, height) => {
  const renderer = createRenderer();
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  const shot = fixedShot(renderer, id, width / height);
  renderer.render(shot.scene, shot.camera);
  const url = renderer.domElement.toDataURL("image/png");
  renderer.dispose();
  return url;
};
