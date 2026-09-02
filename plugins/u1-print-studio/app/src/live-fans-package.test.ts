import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionAggregate } from '../ui/scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'cfa7ab4789984b72dcdf42a53cd58fda5598a4ec34fd9fc0b38b70f8c1eb7d78'],
  ['thermals', 'Thermals', '68b47b17043204d78d6f64f3473f96c8b7a8a258ff1a9fb6a8cccbbbce573e56'],
  ['heads', 'Heads & Filaments', 'c6db57c40afd39cdeabcac9696ed116eb26879e779e9848bc9e97b812fa146bc'],
  ['queue', 'Print Queue', 'be2d8a5ea256629eef1d85e185b63eb567d1738f2c4be408e4d3a5c029e13d8d'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([88_956, 89_569, 98_938, 90_071, 90_900]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(458_434);
  expect(() => assertFocusedProductionAggregate(entries)).not.toThrow();
});
