import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '479a83cd01886fe35564f78de5cac14f548bf0ba2b765daf6cc688309372d795'],
  ['thermals', 'Thermals', '92198034ca8ca9ea5141846d3d97dd729874b2be32bf03cfc5df1c2285911a60'],
  ['heads', 'Heads & Filaments', '7a6225f8785c8c426c0d51a8dbad555acbad45f04844a17d8fbfaba0694b4e19'],
  ['queue', 'Print Queue', '31f4af5019d8254baaa69fc49c380bb44277f8c3aa6159a6639f2894fc2c478c'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([87248, 93315, 97028, 88768, 96764]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(463123);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
