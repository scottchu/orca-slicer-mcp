import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertLabSizes, assertSelfContained, normalizeLabHtml } from './private-lab-contract';

const builtPath = path.resolve(import.meta.dir, "../build/index.html");
const packagedPath = path.resolve(import.meta.dir, "../../public/svelte-observation-lab.html");
const built = readFileSync(builtPath, "utf8");
// Vite carries formatting whitespace inside bundled Three.js shader templates.
// Normalize only line-end whitespace so the committed generated artifact also
// satisfies the repository diff gate without changing executable tokens.
const packaged = normalizeLabHtml(built);
const bedMeshPath = path.resolve(import.meta.dir, '../../public/svelte-bed-mesh-lab.html');
const bedMesh = normalizeLabHtml(readFileSync(path.resolve(import.meta.dir, '../build/bed-mesh-lab/index.html'), 'utf8'));
const cameraPath = path.resolve(import.meta.dir, '../../public/svelte-camera-lab.html');
const camera = normalizeLabHtml(readFileSync(path.resolve(import.meta.dir, '../build/camera-lab/index.html'), 'utf8'));

if (!packaged.includes('data-route-bootstrap')) {
  throw new Error("Observation lab neutral SSR bootstrap marker is missing");
}
for (const marker of ["Overview", "Print Progress", "Thermals", "Heads & Filaments", "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh", "U1 Camera"]) {
  if (!packaged.includes(marker)) throw new Error(`Observation lab marker is missing: ${marker}`);
}
assertSelfContained(packaged);
assertSelfContained(bedMesh);
assertSelfContained(camera);
assertLabSizes(Buffer.byteLength(packaged), Buffer.byteLength(bedMesh), Buffer.byteLength(camera));
for (const forbidden of ['data-chart-frame', 'WebGLRenderer', 'OrbitControls', 'bed-mesh-fixture']) {
  if (packaged.includes(forbidden)) throw new Error(`Light observation lab contains Bed Mesh implementation: ${forbidden}`);
}
for (const marker of ['Bed Mesh', '3D surface', '2D grid', 'data-chart-frame']) {
  if (!bedMesh.includes(marker)) throw new Error(`Bed Mesh lab marker is missing: ${marker}`);
}
for (const marker of ['U1 Camera', 'Simulated live', 'Lab preview', 'Camera state', 'Display capabilities']) {
  if (!camera.includes(marker)) throw new Error(`Camera lab marker is missing: ${marker}`);
}
for (const forbidden of ['data-camera-media', 'RTCPeerConnection', '/dashboard/tools/call', 'open_printer_camera']) {
  if (bedMesh.includes(forbidden)) throw new Error(`Bed Mesh lab contains Camera or transport code: ${forbidden}`);
}

if (process.argv.includes("--check")) {
  if (readFileSync(packagedPath, "utf8") !== packaged) {
    throw new Error("Packaged private lab differs from the deterministic SvelteKit build");
  }
  if (readFileSync(bedMeshPath, 'utf8') !== bedMesh) throw new Error('Packaged Bed Mesh lab differs from deterministic Svelte build');
  if (readFileSync(cameraPath, 'utf8') !== camera) throw new Error('Packaged Camera lab differs from deterministic Svelte build');
  console.log("private observation, Bed Mesh and Camera lab packages: current");
} else {
  writeFileSync(packagedPath, packaged);
  writeFileSync(bedMeshPath, bedMesh);
  writeFileSync(cameraPath, camera);
  console.log(`private lab packages: observation ${Buffer.byteLength(packaged)}, Bed Mesh ${Buffer.byteLength(bedMesh)}, Camera ${Buffer.byteLength(camera)}, aggregate ${Buffer.byteLength(packaged) + Buffer.byteLength(bedMesh) + Buffer.byteLength(camera)} bytes`);
}
