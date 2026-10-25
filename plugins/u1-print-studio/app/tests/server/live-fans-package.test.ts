import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '8276bf4d596e2dc8cae22191799780a015ce73a7b8f7c0b877f48f68c3984e2d'],
  ['thermals', 'Thermals', 'bd714ed65af2ba561b8dbca13f6f39190d7d2a5a54796bd621cc36f9d21a632f'],
  ['heads', 'Heads & Filaments', 'b4dce56daae40e35a13ada2aacc7feee58a058b1ae632a02799ed01834edd2eb'],
  ['queue', 'Print Queue', 'c5fad6b4c21360986ebbf14692b6b6adcda6e8842d6247e35f79f9dccd81f67d'],
  ['progress', 'Print Progress', '9febe6d639b14e30b5cf6b344f9092ccb3eac4f976c17dc0d7bce1a1e9ea47ed'],
  ['jobs', 'Current Job', 'fe77647027ed7a0fc9742d175d173295832753fb5b71d0e6a5af880a8ca1c3bb'],
  ['job_history', 'Job History', '91be7daacec093696cde83f393b24cc9efa1a6720d97635c2836b30822f85692'],
  ['overview', 'Overview', '3471b1ca32aae9a3a97d65c1e550dcd8a482e0a3a985cd7f702b69e99a48c6b1'],
  ['bed_mesh', 'Bed Mesh', '00abd88fc8faa2bf73eb38c787d2b3d0ce60ab13487338a588a71000bbf5e593'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([89442,95369,99042,90591,108006,88851,87096,96947,652691,100096]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(1508131);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
