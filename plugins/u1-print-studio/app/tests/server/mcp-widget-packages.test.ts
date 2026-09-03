import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MCP_CAMERA_HTML, MCP_OBSERVATION_HTML } from '../../src/lib/server/app.js';

for (const [name, html, sha256] of [
  ['mcp-observation', MCP_OBSERVATION_HTML, 'ff869c1e351d39d3dfc097995851d9caa222f9d7e776462254f3c6d6c9277d26'],
  ['mcp-camera', MCP_CAMERA_HTML, '87121885969f2f6d386e023939f9585a7a97b630c5bc76710ee7f9f44cf11353'],
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
