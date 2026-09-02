import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '64f457273462b8440342343264f6192e3b9d83c11049faa52295a796b430e14f'],
  ['thermals', 'Thermals', '971307a7da0399f7cd6f6edf7a0a2940fe0972cd62200349f47919d9195f27b7'],
  ['heads', 'Heads & Filaments', '0bb5b4a97eaa9efe02daa008fe43551545f2f4451e5d9f7eb527d6cacf4f5713'],
  ['queue', 'Print Queue', '982c55a74bc1f777295ef4cf111880ef8cfbd6aa8a076ad46f26a3da532d4613'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([87_209, 87_785, 94_264, 88_295, 90_381]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(447_934);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
