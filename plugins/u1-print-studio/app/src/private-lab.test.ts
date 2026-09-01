import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const html = readFileSync(
  new URL("../public/svelte-observation-lab.html", import.meta.url),
  "utf8"
);
const bedMeshHtml = readFileSync(new URL('../public/svelte-bed-mesh-lab.html', import.meta.url), 'utf8');
const cameraHtml = readFileSync(new URL('../public/svelte-camera-lab.html', import.meta.url), 'utf8');
const appPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { scripts: Record<string, string> };

describe("private Svelte lab packages", () => {
  test('keeps exactly three final private lab artifacts', () => {
    const labFiles = readdirSync(new URL('../public/', import.meta.url))
      .filter((name) => /^svelte-.+-lab\.html$/.test(name))
      .sort();
    expect(labFiles).toEqual([
      'svelte-bed-mesh-lab.html',
      'svelte-camera-lab.html',
      'svelte-observation-lab.html'
    ]);
    for (const artifact of [html, bedMeshHtml, cameraHtml]) {
      expect(artifact).not.toMatch(/\bimport\s*\(/);
    }
  });

  test("freezes the deterministic light observation artifact", () => {
    expect(Buffer.byteLength(html)).toBeLessThanOrEqual(250_000);
    expect(createHash("sha256").update(html).digest("hex")).toBe(
      "e36bb6b8006335c871dca45be171b858ce77bd1f7f878dd09c27a2c61011559d"
    );
    expect(html).toContain('data-route-bootstrap');
    for (const marker of [
      "Overview", "Print Progress", "Thermals", "Heads & Filaments",
      "Current Job", "Job History", "Print Queue", "Fans & Air", "Bed Mesh",
      "U1 Camera"
    ]) expect(html).toContain(marker);
    expect(html).not.toContain('data-chart-frame=""');
    for (const forbidden of ['WebGLRenderer', 'OrbitControls', 'bed-mesh-fixture']) expect(html).not.toContain(forbidden);
    expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
    expect(html).not.toMatch(/<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
    expect(html).not.toMatch(
      /<(?:img|audio|video|source|iframe)\b[^>]*\bsrc\s*=\s*["'](?!data:)/i
    );
  });

  test('freezes Bed Mesh as an isolated self-contained artifact', () => {
    expect(Buffer.byteLength(bedMeshHtml)).toBeLessThanOrEqual(700_000);
    expect(createHash('sha256').update(bedMeshHtml).digest('hex')).toBe('a236140ff270f2e36e6e6b8fdc32a3fb9fc2d29da75c74b10785b3d271267fbf');
    for (const marker of ['Bed Mesh', '3D surface', '2D grid', 'data-chart-frame=""', 'WebGLRenderer', 'OrbitControls']) expect(bedMeshHtml).toContain(marker);
    for (const forbidden of ['data-camera-media', 'RTCPeerConnection', '/dashboard/tools/call', 'open_printer_camera']) expect(bedMeshHtml).not.toContain(forbidden);
    expect(bedMeshHtml).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
  });

  test('keeps the synthetic Camera in a second bounded private artifact', () => {
    expect(createHash('sha256').update(cameraHtml).digest('hex')).toBe('cd2cf36e01d6ac6f1b06d069b99034cc0d1ced9d3061000aa82d1372809ab8fc');
    expect(Buffer.byteLength(cameraHtml)).toBeLessThanOrEqual(80_000);
    expect(Buffer.byteLength(html) + Buffer.byteLength(bedMeshHtml) + Buffer.byteLength(cameraHtml)).toBeLessThanOrEqual(980_000);
    for (const marker of ['U1 Camera', 'Simulated live', 'Camera state', 'Display capabilities', 'data-camera-media']) expect(cameraHtml).toContain(marker);
    for (const forbidden of ['RTCPeerConnection', '/dashboard/tools/call', 'open_printer_camera', 'WebGLRenderer', '__setCamera']) expect(cameraHtml).not.toContain(forbidden);
    expect(cameraHtml).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
    expect(html).not.toContain('data-camera-media');
    expect(bedMeshHtml).not.toContain('data-camera-media');
  });

  test("selects exact private paths synchronously before body layout", () => {
    const routeSource = readFileSync(new URL("../ui/src/routes/+page.svelte", import.meta.url), "utf8");
    const appShell = readFileSync(new URL("../ui/src/app.html", import.meta.url), "utf8");
    expect(routeSource.indexOf("browser ? viewFromPath(window.location.pathname) : undefined")).toBeLessThan(routeSource.indexOf("onMount(() =>"));
    expect(routeSource).toContain("window.addEventListener('popstate', restore)");
    expect(routeSource).toContain("window.removeEventListener('popstate', restore)");
    expect(routeSource).not.toContain("<svelte:head>");
    expect(routeSource).toContain("browser ? viewFromPath(window.location.pathname) : undefined");
    expect(routeSource).toContain("data-route-bootstrap");
    expect(routeSource).toContain("SSR emits only a neutral zero-size bootstrap marker");
    expect(appShell.indexOf("document.title = titles[route] ?? 'Observation Lab'")).toBeGreaterThan(0);
    expect(appShell.indexOf("document.title = titles[route] ?? 'Observation Lab'")).toBeLessThan(
      appShell.indexOf("%sveltekit.head%")
    );
  });

  test("contains no acquisition path or non-local request primitive", () => {
    const observationSources = readdirSync(new URL("../ui/src/lib/observation/", import.meta.url))
      .filter((name) => name.endsWith(".svelte") || (name.endsWith(".ts") && !name.endsWith(".test.ts")))
      .map((name) => readFileSync(new URL(`../ui/src/lib/observation/${name}`, import.meta.url), "utf8"))
      .join("\n") + readFileSync(new URL("../ui/src/routes/+page.svelte", import.meta.url), "utf8");
    expect(observationSources).not.toMatch(/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/);
    expect(observationSources).not.toMatch(/https?:\/\//);
    expect(html).not.toContain("camera-widget");
    expect(html).not.toContain("/dashboard/tools/call");
    expect(html).not.toContain("__setPercentage");
    expect(html).not.toContain("__percentageClicks");
    expect(html).not.toContain("__setFansState");
    expect(html).not.toContain("Example card");
    expect(html).toContain("data-lab-controls");
    expect(html).toContain("Preview state");
    expect(html).toContain("Reset lab preview");
  });

  test("keeps the generic embed outside production packaging", () => {
    expect(appPackage.scripts["ui:build"]).not.toContain("embed");
    expect(appPackage.scripts["bundle:server"]).not.toContain("embed");
    expect(appPackage.scripts["ui:build:embed"]).toContain("build:embed");
    expect(html).not.toContain("u1-widgets.js");
  });
});
