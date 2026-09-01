import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const builtPath = path.resolve(import.meta.dir, "../build/index.html");
const packagedPath = path.resolve(import.meta.dir, "../../public/svelte-observation-lab.html");
const built = readFileSync(builtPath, "utf8");
// Vite carries formatting whitespace inside bundled Three.js shader templates.
// Normalize only line-end whitespace so the committed generated artifact also
// satisfies the repository diff gate without changing executable tokens.
const packaged = built
  .replace(/[ \t]+$/gm, "")
  .replace(/^ +(?=\t)/gm, "");

if (!packaged.includes('data-route-bootstrap')) {
  throw new Error("Observation lab neutral SSR bootstrap marker is missing");
}
for (const marker of ["Overview", "Print Progress", "Thermals", "Heads & Filaments", "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh", "Pending lifecycle migration"]) {
  if (!packaged.includes(marker)) throw new Error(`Observation lab marker is missing: ${marker}`);
}
if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i.test(packaged)) {
  throw new Error("Private lab build must be self-contained");
}
if (/<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i.test(packaged)) {
  throw new Error("Private lab build contains a non-inline media dependency");
}
if (Buffer.byteLength(packaged) > 750_000) {
  throw new Error("Private lab build exceeded the 750 KB packaging bound");
}

if (process.argv.includes("--check")) {
  if (readFileSync(packagedPath, "utf8") !== packaged) {
    throw new Error("Packaged private lab differs from the deterministic SvelteKit build");
  }
  console.log("private observation lab package: current");
} else {
  writeFileSync(packagedPath, packaged);
  console.log(`private observation lab package: ${Buffer.byteLength(packaged)} bytes`);
}
