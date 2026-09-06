import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MCP_CAMERA_HTML, MCP_OBSERVATION_HTML } from '../../src/lib/server/app.js';

for (const [name, html, sha256] of [
  ['mcp-observation', MCP_OBSERVATION_HTML, '1808af7d9002e80f7ced44392d06a288dc8e8fe4e877cd8cc8d341db3dceb93a'],
  ['mcp-camera', MCP_CAMERA_HTML, 'd90d64a961efbab4e7a318ddb222b887f3dce3cffc0ba1c874ea796e097bbe0e'],
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
