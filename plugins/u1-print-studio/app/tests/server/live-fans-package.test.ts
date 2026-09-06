import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFocusedProductionInventory } from '../../scripts/observation-graph-contract.js';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', '7e53dbe50cdc34d072c5f8ed30cf5254b6881adca382a70b19c4e6efcecc310c'],
  ['thermals', 'Thermals', '2c16ff4f7e0c7199664096d02320cf649cdf94de5bf019feabc39586cf7dd42c'],
  ['heads', 'Heads & Filaments', 'fa9459aa74bcf1d95d056cd475598b5bef8075e96f9f0f690f80c7b44649d792'],
  ['queue', 'Print Queue', 'c109ab74e5650f42b16c539a0f3c497a391d0dc9bcaaec5ac5ef737c742b5dc1'],
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
