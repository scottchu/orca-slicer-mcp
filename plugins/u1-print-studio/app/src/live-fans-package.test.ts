import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'af6a8ad6b892966099c399231384383a5a4abd499e677443ebe231e9ff156b61'],
  ['thermals', 'Thermals', '99aa65a13ba86acd07bc596f69e491c7319417eff5a6e06ebe5c5fbc917f6621'],
  ['heads', 'Heads & Filaments', 'c778ae8d951260464277d9873de6f9f3c12a6355db96ba316ff41766294f21f4'],
  ['queue', 'Print Queue', 'ccaaca3ecf881d087f4f0188613055f64cb9c7184521c08d1cb4367098342c27'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([86_747, 87_323, 92_726, 87_831, 89_919]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(444_546);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
