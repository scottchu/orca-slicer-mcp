import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'bbc5e689e72d5869f98fa50b3dc387bd0111667eccf7d9b349314d41b9ce4e80'],
  ['thermals', 'Thermals', 'd115295b1b2ebdb05806e26598441899b093bb865123da068f01155091ef61a8'],
  ['heads', 'Heads & Filaments', '1cb539e9e2f4aaf50e13938509e16c6f526548054f4edc90dcaf7589820ff00c'],
  ['queue', 'Print Queue', 'b6b844e274544bab7eedcd0eb824df284f216da98dacefce24677f7cc1c6dd7e'],
]) test(`real ${title} is one deterministic private artifact without lab or acquisition code`, () => {
  const html = readFileSync(new URL(`../../public/svelte-live-${view}.html`, import.meta.url), 'utf8');

  expect(createHash('sha256').update(html).digest('hex')).toBe(hash);
  expect(html.includes(title)).toBe(true);
  expect(html.includes('refresh_printer_observation')).toBe(true);
  expect(html.includes('ui/initialize')).toBe(true);
  expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
  for (const forbidden of ['data-lab-controls', 'lab_scenario', 'Lab fixture', '__test/', 'RTCPeerConnection', 'Three.js', '/dashboard/tools/call', 'test-only metadata']) expect(html).not.toContain(forbidden);
});

test('current focused production inventory retains exact artifact size measurements', () => {
  const entries = (['fans', 'thermals', 'heads', 'queue', 'camera'] as const).map((view) => ({
    view,
    bytes: Buffer.byteLength(readFileSync(new URL(`../../public/svelte-live-${view}.html`, import.meta.url), 'utf8')),
  }));
  expect(entries.map(({ bytes }) => bytes)).toEqual([87681, 93749, 97461, 89202, 97461]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(465554);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
