import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'ecbebc4554a793d28ce3e1997bf4a6b7bd4a3a13979847b2c35fe4c64f31726d'],
  ['thermals', 'Thermals', '41933ec1a3649c1d90419f6385820944b09fb0a59f9668f56b6a80ea3c6417ba'],
  ['heads', 'Heads & Filaments', 'ddf531806391a5ab1a66400956f57d2d92d25765d7ff20ca8ec98a1e96f238a0'],
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
