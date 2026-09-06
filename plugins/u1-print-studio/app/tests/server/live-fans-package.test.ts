import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'c7065a26ce6a70613049d4a9be743e550d37ecc0bf533bd4adb2f44493f71dda'],
  ['thermals', 'Thermals', '2f70fd14e4fccdaa43e90b050ee7e6a4aa39c17c5449babf2bfcfe28bfcd58b9'],
  ['heads', 'Heads & Filaments', '247bba97a501394feacec1608083f3006745eaeff7866f64aaebeb35a3caec5a'],
  ['queue', 'Print Queue', 'b3ac47a343d0dc1449b7f508cca30414506acdda3d1358648e0c333f8a6b725d'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([88616, 94684, 98396, 90137, 99885]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(471718);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
