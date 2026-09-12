import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '045406518f2ef1c2e23bbb2e954c34c4c179d06f6c5649a350dfd9cc9f3f528b'],
  ['thermals', 'Thermals', '330896db8327d766052f66f3daf3fb4a00022beec9b4ac5cfd0ce4f27e9d1658'],
  ['heads', 'Heads & Filaments', 'b74e1cb8b9750dcb47cfb901cd0da673036ec4e34b2fe233f3329658857afc05'],
  ['queue', 'Print Queue', 'a1858663df6f97200d956bc146d591f04f205669d14d2b7692fc0545e5e8b5e5'],
  ['progress', 'Print Progress', '4acad1be4350618cdfa900e993c2bc4e198a7484b6ee3f17659cca5d7212a3a4'],
  ['jobs', 'Current Job', 'a2a39f8628e40394b7c1d99d214783c6f8d11a18ec67119c6585e3bba2398b5a'],
  ['job_history', 'Job History', '08eb659f5bda1d2a14a14e58d1c8e0c0c25e57cc2509a76ee23f2f1c330f1746'],
  ['overview', 'Overview', 'ead65b392a9820c9efee6213225c8fa25dedebe21b0433da474594457bef9ced'],
  ['bed_mesh', 'Bed Mesh', '5b255499505463e8dfdbc5b1b608ed1b0f519fd91f3c684cd03d4b0112eebeac'],
]) test(`real ${title} is one deterministic private artifact with the closed host bridge`, () => {
  const html = readFileSync(new URL(`../../public/svelte-live-${view}.html`, import.meta.url), 'utf8');

  expect(createHash('sha256').update(html).digest('hex')).toBe(hash);
  expect(html.includes(title)).toBe(true);
  expect(html.includes('refresh_printer_observation')).toBe(true);
  expect(html.includes('ui/initialize')).toBe(true);
  expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
  for (const forbidden of ['data-lab-controls', 'lab_scenario', 'Lab fixture', '__test/', 'RTCPeerConnection', '/dashboard/tools/call', 'test-only metadata']) expect(html).not.toContain(forbidden);
  if (view === 'bed_mesh') {
    for (const marker of ['3D surface', '2D grid', 'WebGLRenderer', 'OrbitControls']) expect(html).toContain(marker);
  } else expect(html).not.toContain('Three.js');
});

test('current focused production inventory retains exact artifact size measurements', () => {
  const entries = (['fans', 'thermals', 'heads', 'queue', 'progress', 'jobs', 'job_history', 'overview', 'bed_mesh', 'camera'] as const).map((view) => ({
    view,
    bytes: Buffer.byteLength(readFileSync(new URL(`../../public/svelte-live-${view}.html`, import.meta.url), 'utf8')),
  }));
  expect(entries.map(({ bytes }) => bytes)).toEqual([88864, 94932, 98644, 90384, 83307, 88644, 86889, 96932, 652480, 100096]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(1481172);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
