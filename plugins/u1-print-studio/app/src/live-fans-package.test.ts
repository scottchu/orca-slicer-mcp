import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'c743a74eb4bdfcbf685f19d81e098634edd58cd8fa8f5946b98e7ba7b0657dd9'],
  ['thermals', 'Thermals', 'a61b1f573d2eb35b2072d922ab1006a7edf7fbca10a31b7d23a694ded7b2316b'],
  ['heads', 'Heads & Filaments', '9af894315db44cccefc00aeea04361b5d2df88278e1bf3495b6c038554dca9f8'],
  ['queue', 'Print Queue', 'f7d1f007c18a2353ecd53cd57a689246e790fc6ee223a44e8b8293cc3cc89df9'],
  ['jobs', 'Current Job', 'f936326129c06979274d4cf40f19e37fc61db9443472080e71be18d867da579c'],
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
  const entries = (['fans', 'thermals', 'heads', 'queue', 'camera', 'jobs'] as const).map((view) => ({
    view,
    bytes: Buffer.byteLength(readFileSync(new URL(`../public/svelte-live-${view}.html`, import.meta.url), 'utf8')),
  }));
  expect(entries.map(({ bytes }) => bytes)).toEqual([87632, 88208, 93611, 88716, 90804, 88398]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(537369);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
