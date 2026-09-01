import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

test('real Fans is one deterministic private artifact without lab or acquisition code', () => {
  const html = readFileSync(new URL('../public/svelte-live-fans.html', import.meta.url), 'utf8');
  expect(Buffer.byteLength(html)).toBeLessThanOrEqual(100_000);
  expect(createHash('sha256').update(html).digest('hex')).toBe('b28ee10c695bb8d0296fa0d161b9962c578fdecabbd0f18ec1b525d408d23be1');
  expect(html.includes('Fans & Air')).toBe(true);
  expect(html.includes('refresh_printer_observation')).toBe(true);
  expect(html.includes('ui/initialize')).toBe(true);
  expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet/i);
  for (const forbidden of ['data-lab-controls', 'lab_scenario', 'Lab fixture', '__test/', 'RTCPeerConnection', 'Three.js', '/dashboard/tools/call', 'test-only metadata']) expect(html).not.toContain(forbidden);
});
