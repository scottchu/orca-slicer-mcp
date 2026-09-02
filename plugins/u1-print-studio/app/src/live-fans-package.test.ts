import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '92cfac305cb11dfb13611a3e910fc2f0fde73687c152194375e42f8d19f32729'],
  ['thermals', 'Thermals', 'c9790e916c9511603ea5357cf60362292ecfeba07d1db48432ed154215db692d'],
  ['heads', 'Heads & Filaments', 'efe4f19e22b6faa9ed4298fc254da7fb554c115ea6abb349b78076489a12c1aa'],
  ['queue', 'Print Queue', '8598f26cdba8d2a4279d178a7b68733bca5caa03cb0af0403271efc031a54363'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([91348, 91959, 96930, 92922, 89770]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(462929);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
