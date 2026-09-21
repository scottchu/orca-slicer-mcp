import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'fbaf288f9459cd66fd47314bd784a42d448aea28ae676848626b5d1d8d67705b'],
  ['thermals', 'Thermals', 'a8b412efb4a54490881ee594114c6e82e624c883df00ccdd03d87251a492d890'],
  ['heads', 'Heads & Filaments', '368cc460cb49b3b480c4e5223a10489c9a7e89ac7e0ecfef363c0d87f7b1b31d'],
  ['queue', 'Print Queue', 'b211ebfa6c03dd54b8c340767841461d5756f7398663bf162cf2e5f1d059e60a'],
  ['progress', 'Print Progress', '6c9f1ecda84618a6b6411ebff88b58453e3160fdb528d67ac30980b04b55d95a'],
  ['jobs', 'Current Job', 'da7dd12f7dce1066a8bb4e7f0b43d3a4217521ae323282567851c0890ce6e6e9'],
  ['job_history', 'Job History', '5417554e126ce9db06e5262dd6e633548d54b2ea6121e27eb926c170c3772bb0'],
  ['overview', 'Overview', '3471b1ca32aae9a3a97d65c1e550dcd8a482e0a3a985cd7f702b69e99a48c6b1'],
  ['bed_mesh', 'Bed Mesh', 'af3639c59af641061ec294198e61b754be2ec771d57f8d12ebc1d1fa5e6dac3f'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([88879, 94947, 98659, 90399, 99325, 88659, 86904, 96947, 652495, 100096]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(1497310);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
