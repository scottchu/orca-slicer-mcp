import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MCP_CAMERA_HTML, MCP_OBSERVATION_HTML } from '../../src/lib/server/app.js';

for (const [name, html, sha256] of [
  ['mcp-observation', MCP_OBSERVATION_HTML, '1a6c3c727a6d02cae654a0876f3f1fb73add9df08b8ee6c477d4ebee92310b18'],
  ['mcp-camera', MCP_CAMERA_HTML, 'c983e7b0e4f7da8c7b913e6b45516df87fb1ca176fc157159bf8167fc42871b7'],
]) {
  test(`${name} is the registered, closed production artifact`, () => {
    expect(html).toBe(readFileSync(new URL(`../../public/${name}.html`, import.meta.url), 'utf8'));
    expect((html.match(/<script>/g) ?? []).length).toBe(1);
    expect((html.match(/<style>/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(/<(?:iframe|link)\b|<script\b[^>]*\bsrc\s*=/i);
    expect(html).toContain('ui/initialize');
    expect(html).toContain('ui/notifications/size-changed');
    expect(html).not.toContain('/dashboard/tools/call');
    expect(html).not.toContain('SYNTHETIC CAMERA');
    expect(html).not.toContain('Lab fixture');
    expect(createHash('sha256').update(html).digest('hex')).toBe(sha256);
  });
}
