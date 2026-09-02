import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '6a221801e3a7daae58af0313974acbc34c41812a9b8a5e3ddc2e0e41bc905011'],
  ['thermals', 'Thermals', '5d85f13212674a0d29aed6c94fe2d977536384372187f5ad48cb03e3f8f78831'],
  ['heads', 'Heads & Filaments', '8d6a8a372d148d0d91ace56a8fdc3050ff0f48f6c4315549d05fcd0eddb0ccf4'],
  ['queue', 'Print Queue', 'c78bc07aa89af871728013512ab15fe9b6096a8fed0ab749a12d44592096f385'],
]) test(`real ${title} is one deterministic private artifact without lab or acquisition code`, () => {
  const html = readFileSync(new URL(`../public/svelte-live-${view}.html`, import.meta.url), 'utf8');
  expect(Buffer.byteLength(html)).toBeLessThanOrEqual(100_000);
  expect(createHash('sha256').update(html).digest('hex')).toBe(hash);
  expect(html.includes(title)).toBe(true);
  expect(html.includes('refresh_printer_observation')).toBe(true);
  expect(html.includes('ui/initialize')).toBe(true);
  expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
  for (const forbidden of ['data-lab-controls', 'lab_scenario', 'Lab fixture', '__test/', 'RTCPeerConnection', 'Three.js', '/dashboard/tools/call', 'test-only metadata']) expect(html).not.toContain(forbidden);
});

test('current focused production inventory remains within the forward ten-widget aggregate', () => {
  const entries = (['fans', 'thermals', 'heads', 'queue', 'camera'] as const).map((view) => ({
    view,
    bytes: Buffer.byteLength(readFileSync(new URL(`../public/svelte-live-${view}.html`, import.meta.url), 'utf8')),
  }));
  expect(entries.map(({ bytes }) => bytes)).toEqual([88_929, 89_542, 98_911, 90_044, 90_900]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(458_326);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
