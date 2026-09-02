import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '88d658852e88b48fb6a08c5e114698531668a6bddd8c32bd82774994d03c3870'],
  ['thermals', 'Thermals', '02f7dd436cdcc4fdea0c39164a4170d23944c52a4fd2da446e99b646a7d2e774'],
  ['heads', 'Heads & Filaments', 'aba510d7989647f0f0a3f303b23c8c505a06d56f04fe6b09189859bfeb7c274a'],
  ['queue', 'Print Queue', '1afc55419fffe775d1ab945491e1874fe62ef836861307e2f39eefc2e2a91584'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([91362, 91973, 96944, 92936, 89770]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(462985);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
