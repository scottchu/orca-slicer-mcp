import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '00a8e3a0b2b57ac9af195792ff70d1e87cf1be560e961c6d8b0558b0bf1d82c1'],
  ['thermals', 'Thermals', 'b224ae16792cec19cac9ada7e32b4fd542df23f35e29bb2774191c410eb19ad4'],
  ['heads', 'Heads & Filaments', 'e355ae7eb13198aaa7fbcc07d1d746a155235508b55729c36f97d2fb7332c2f1'],
  ['queue', 'Print Queue', '532f672a725d53ea249aada15b9c48d7c12dd094bf863dc2268ee8b6772a2791'],
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
  expect(entries.map(({ bytes }) => bytes)).toEqual([87151, 93218, 96931, 88671, 96605]);
  expect(entries.reduce((total, { bytes }) => total + bytes, 0)).toBe(462576);
  expect(() => assertFocusedProductionInventory(entries)).not.toThrow();
});
