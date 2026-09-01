import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

for (const [view, title, hash] of [
  ['fans', 'Fans & Air', 'c062b493c1dc26b013f23521a7c1d734702f83deffd0cfafe782e0509eb995d2'],
  ['thermals', 'Thermals', 'a691d0a6110a5432dbf5b2d26a114779caad93e1db5955d618ff7d5a7057f5ee'],
  ['heads', 'Heads & Filaments', '3f3e04123d74ff410a4a90792d32da32ee8e98757c91dd8149ea13ff2838e752'],
  ['jobs', 'Current Job', 'e87ad9b5c8a3d27f3b62d01801f314425b3cfa148a2c6cef604892fccf833a0a'],
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
