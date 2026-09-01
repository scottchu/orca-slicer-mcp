import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertLabBudgets, assertSelfContained, normalizeLabHtml } from './private-lab-contract';

const builtPath = path.resolve(import.meta.dir, "../build/index.html");
const packagedPath = path.resolve(import.meta.dir, "../../public/svelte-observation-lab.html");
const built = readFileSync(builtPath, "utf8");
// Vite carries formatting whitespace inside bundled Three.js shader templates.
// Normalize only line-end whitespace so the committed generated artifact also
// satisfies the repository diff gate without changing executable tokens.
const packaged = normalizeLabHtml(built);
const cameraPath = path.resolve(import.meta.dir, '../../public/svelte-camera-lab.html');
const camera = normalizeLabHtml(readFileSync(path.resolve(import.meta.dir, '../build/camera-lab/index.html'), 'utf8'));

if (!packaged.includes('data-route-bootstrap')) {
  throw new Error("Observation lab neutral SSR bootstrap marker is missing");
}
for (const marker of ["Overview", "Print Progress", "Thermals", "Heads & Filaments", "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh", "U1 Camera"]) {
  if (!packaged.includes(marker)) throw new Error(`Observation lab marker is missing: ${marker}`);
}
assertSelfContained(packaged);
assertSelfContained(camera);
assertLabBudgets(Buffer.byteLength(packaged), Buffer.byteLength(camera));
for (const marker of ['U1 Camera', 'Simulated live', 'Lab preview', 'Camera state', 'Display capabilities']) {
  if (!camera.includes(marker)) throw new Error(`Camera lab marker is missing: ${marker}`);
}

if (process.argv.includes("--check")) {
  if (readFileSync(packagedPath, "utf8") !== packaged) {
    throw new Error("Packaged private lab differs from the deterministic SvelteKit build");
  }
  if (readFileSync(cameraPath, 'utf8') !== camera) throw new Error('Packaged Camera lab differs from deterministic Svelte build');
  console.log("private observation and Camera lab packages: current");
} else {
  writeFileSync(packagedPath, packaged);
  writeFileSync(cameraPath, camera);
  console.log(`private lab packages: observation ${Buffer.byteLength(packaged)}, Camera ${Buffer.byteLength(camera)}, aggregate ${Buffer.byteLength(packaged) + Buffer.byteLength(camera)} bytes`);
}
