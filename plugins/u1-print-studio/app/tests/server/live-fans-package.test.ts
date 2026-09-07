import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '33eacd3e40f71fe660304ba3ee013b752ac874cf409d1249b66f02f352f87685'],
  ['thermals', 'Thermals', 'dab5ffdccb8bc349c50fb30777a8766394201f08bada3b5a68aef0e4e027cc9a'],
  ['heads', 'Heads & Filaments', '989f1fd41d58dcf0fad0ac3de6b43e12d7631715f50a823bbfe2e6951691f813'],
  ['queue', 'Print Queue', '8b7fafae4620e623f5cff76b076d8aa705270dfc0dc7c96366200ee99629d284'],
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
