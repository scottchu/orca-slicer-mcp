import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '070654727ed4dbe3c8b507987c431a29a937474947c952d60dc79688ea7e74b9'],
  ['thermals', 'Thermals', '3a4cf32c0bc1482537914fd60baf1c8b450d5d4e8521dd37634f8eed2d8743a1'],
  ['heads', 'Heads & Filaments', 'e958485823017fa9764853270dc2d673d8dbc850239b261f6b2e7e5f51ca86a1'],
  ['queue', 'Print Queue', '882571bfea0b075dd3a7542344d1e4bc8388e9ce2a0a4fa95334b984908e3768'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([88152, 94220, 97932, 89673, 99421]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(469398);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
