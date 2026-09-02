import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '2a5d8a9aac878e47646b3fa868343ae25e20509bbd8dd6e891bfad83d2d72d05'],
  ['thermals', 'Thermals', 'c7a031d5081925b4f7a153397a0bcfc8f6ff4581cdfcedb8c91917d46d5b08ca'],
  ['heads', 'Heads & Filaments', 'f902508734871bb7d4392c9eb0a313ce70c1abc4eff2b7dcfd544def79245d9d'],
  ['queue', 'Print Queue', 'a7d82b70a8c64c7542ef94916fd08eaa265ad09a542e36a0a277cfa79af502d1'],
]) test(`real ${title} is one deterministic private artifact without lab or acquisition code`, () => {
  const html = readFileSync(new URL(`../public/svelte-live-${view}.html`, import.meta.url), 'utf8');

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
    bytes: Buffer.byteLength(readFileSync(new URL(`../public/svelte-live-${view}.html`, import.meta.url), 'utf8')),
  }));
  expect(entries.map(({ bytes }) => bytes)).toEqual([87001, 93068, 96783, 88526, 94413]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(459791);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
