import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MCP_CAMERA_HTML, MCP_OBSERVATION_HTML } from '../../src/lib/server/app.js';

for (const [name, html, sha256] of [
  ['mcp-observation', MCP_OBSERVATION_HTML, '2838485ed47250f1c8dbc413227743981c7e2a2f5ea22b9c8acb8791b094edc4'],
  ['mcp-camera', MCP_CAMERA_HTML, 'bcdd91b6646989639fa68c52536705ebf8b92b7a4dc15f8ae2d2e2b3c7134fe2'],
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
