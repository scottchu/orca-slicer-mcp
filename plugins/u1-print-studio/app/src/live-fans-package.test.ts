import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'c1b1d04d8a51effdd1df08bca01a4e19fde47646721195469888a5ae4868f01a'],
  ['thermals', 'Thermals', 'a73f5d6833379a204f45fbca5afe2a8ece98aa24cffdde443e0172bc6453d85f'],
  ['heads', 'Heads & Filaments', '63d9b108c8f94c96b5574ec8200f692147aa692b0472703ab51a72b98d67d6a3'],
  ['queue', 'Print Queue', 'e20108ffec78a961f79401d9f41a462aaddad5bad57bc0c6a2b896e9125c5215'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([88_086, 88_662, 96_660, 89_172, 90_900]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(453_480);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
