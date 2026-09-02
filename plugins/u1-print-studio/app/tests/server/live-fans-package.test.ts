import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'd3bb6e99ab3db3f53d457e0e3082a5474435b45d94f5339b780de6aa4a59298a'],
  ['thermals', 'Thermals', '43acd079bd91eca36596b3e838a8e75c447d968c7c60039bca2c69904b93594e'],
  ['heads', 'Heads & Filaments', 'f859a74903e64ea0847ee161dd745960f060b4f308524b62f9c0b5722b57c267'],
  ['queue', 'Print Queue', 'e271c8f59370fb36ca0f50a9499e79e242fa2780b5034acd24c0d2040df0c6ec'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([86992, 93059, 96772, 88512, 94546]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(459881);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
