import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { t1SmartGroupedSummarySpec as spec } from '../../../src/lib/composable/specs';
import { composeEntityCardEnvelope, type ComposableReaders } from '../../../src/lib/server/composable-presentation';
import { scaleRootText } from '../helpers/text-scale';

const html = readFileSync(new URL('../../../public/mcp-composable-lab-v2.html', import.meta.url), 'utf8');
const resourceUri = 'ui://u1-print-studio/experiments/composable-lab-v2-r5.html';
const readers = (actualC: number, targetC: number): ComposableReaders => ({
  status: async () => ({ observedAt: '2026-09-03T16:20:00.000Z', receivedAt: '2026-09-03T16:20:00.100Z', heads: [{ id: 'T1', status: 'active', actualC, targetC }] }),
  materials: async () => ({ observedAt: '2026-09-03T16:19:45.000Z', receivedAt: '2026-09-03T16:19:45.250Z', heads: [{ id: 'T1', color: '#E89B3C' }] }),
  environment: async () => ({ observedAt: '2026-09-03T16:19:30.000Z', receivedAt: '2026-09-03T16:19:30.500Z', relations: [{ headId: 'T1', fanId: 'part', label: 'Reported part fan', role: 'partCooling' }] }),
});

for (const scale of [100, 200] as const) {
  test(`private MCP valid decimal readings keep fresh error and ready slots at ${scale}%`, async ({ page }) => {
    const unavailable = async () => { throw new Error('Synthetic unavailable'); };
    const errorEnvelope = await composeEntityCardEnvelope(spec, { status: unavailable, materials: unavailable, environment: unavailable });
    // Reuse the maintained synthetic MCP host; intercept only its private resource/data endpoints.
    await page.route('**/fixture/tools', route => route.fulfill({ json: { tools: [{ name: 'compose_u1_entity_card_v2', _meta: { ui: { resourceUri } } }] } }));
    await page.route('**/fixture/resource?*', route => route.fulfill({ json: { contents: [{ uri: resourceUri, mimeType: 'text/html;profile=mcp-app', text: html }] } }));
    await page.route('**/fixture/call', route => route.fulfill({ json: { structuredContent: errorEnvelope } }));
    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto('/host?tool=compose_u1_entity_card_v2&delivery=manual');
    await page.waitForFunction(() => (window as any).__mcpHost?.state.ready === true);
    const frame = page.frames().find(candidate => candidate !== page.mainFrame())!;
    await scaleRootText(frame, scale);
    const send = async (envelope: unknown) => page.evaluate(({ spec, envelope }) => {
      (window as any).__mcpHost.sendInput({ spec });
      (window as any).__mcpHost.sendResult({ structuredContent: envelope });
    }, { spec, envelope });
    await send(errorEnvelope);
    const card = frame.getByRole('article', { name: 'Tool head T1' });
    await expect(card.locator('[data-skeleton-static]')).toHaveCount(4);
    await expect(card.locator('.current')).toHaveCount(0);
    const copy = card.locator('[data-domain-reading] > .content').first();
    const width = await copy.evaluate(node => node.getBoundingClientRect().width);
    await page.setViewportSize({ width: 400 + 241 * scale / 100 - width, height: 900 });
    expect(await copy.evaluate(node => node.getBoundingClientRect().width)).toBe(241 * scale / 100);
    const errorHeight = (await card.boundingBox())!.height;
    for (const [actual, target] of [[499.99, 499.99], [-99.99, 499.99], [499.999999, 499.999999], [-99.999999, 499.999999], [500, 500]]) {
      const envelope = await composeEntityCardEnvelope(spec, readers(actual, target));
      await send(envelope);
      await expect(card).toContainText(actual + '° / ' + target + '°');
      expect(Math.abs((await card.boundingBox())!.height - errorHeight)).toBeLessThanOrEqual(1);
      expect(await card.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await send(errorEnvelope);
      await expect(card.locator('.current')).toHaveCount(0);
      expect(Math.abs((await card.boundingBox())!.height - errorHeight)).toBeLessThanOrEqual(1);
    }
  });
}
