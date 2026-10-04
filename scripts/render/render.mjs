// Renders the product images from the 3D models into public/images/products.
// Usage: node scripts/render/render.mjs [shot-id ...]
// Needs Chromium (Playwright) and ImageMagick (`convert`) for WebP output.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium } from "@playwright/test";

const shots = {
  hero: [1920, 1080],
  "plate-studio": [1600, 1200],
  "plate-fire": [1600, 1200],
  "pit-corten": [1600, 1200],
  "pit-steel": [1600, 1200],
  "pit-flatpack": [1600, 1200],
  "pit-fire": [1600, 1200],
  "set-studio": [1600, 1200],
  "wall-strom": [1600, 1200],
  "wall-mapa": [1600, 1200],
  "wall-hory": [1600, 1200],
  "sign-stainless": [1600, 1200],
  "sign-corten": [1600, 1200],
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(shots);
const out = join(process.cwd(), "public/images/products");
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "render-"));

const bundle = await build({
  entryPoints: [join(process.cwd(), "scripts/render/entry.ts")],
  bundle: true,
  write: false,
  format: "iife",
  minify: false,
});

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("console", (m) => m.type() === "error" && console.error("[browser]", m.text()));
await page.setContent("<!doctype html><html><body></body></html>");
await page.addScriptTag({ content: bundle.outputFiles[0].text });

const SUPERSAMPLE = 2;
for (const id of wanted) {
  const [w, h] = shots[id];
  const started = Date.now();
  const dataUrl = await page.evaluate(([id, w, h]) => window.renderShot(id, w, h), [id, w * SUPERSAMPLE, h * SUPERSAMPLE]);
  const png = join(tmp, `${id}.png`);
  writeFileSync(png, Buffer.from(dataUrl.split(",")[1], "base64"));
  execFileSync("convert", [png, "-filter", "Lanczos", "-resize", `${w}x${h}`, "-quality", "80", join(out, `${id}.webp`)]);
  console.log(`${id}: ${((Date.now() - started) / 1000).toFixed(1)} s`);
}
await browser.close();
