import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MCP_CAMERA_HTML, MCP_OBSERVATION_HTML } from '../../src/lib/server/app.js';

for (const [name, html, sha256] of [
  ['mcp-observation', MCP_OBSERVATION_HTML, 'df98a40784c7798a7f62f908dc999aac3b2c7be3b63567a5a9337e8c90581928'],
  ['mcp-camera', MCP_CAMERA_HTML, '5e894febd57368a6ff19f7d2696654c9cad0ff641fbe0f1c70d88a5feb2d0875'],
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
