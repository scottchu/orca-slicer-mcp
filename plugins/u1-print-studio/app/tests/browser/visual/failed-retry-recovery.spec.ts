import { expect, test, type Frame } from '@playwright/test';
import { liveFansResult } from '../fixtures/live-fans';
import { liveThermalsResult } from '../fixtures/live-thermals';
import { liveHeadsResult } from '../fixtures/live-heads';
import { liveQueueResult } from '../fixtures/live-queue';

const factories = { fans: liveFansResult, thermals: liveThermalsResult, heads: liveHeadsResult, queue: () => liveQueueResult() };
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer]').evaluateAll(nodes => nodes.map(node => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));

for (const view of Object.keys(factories) as (keyof typeof factories)[]) test(`${view} recovers a failed Retry only after its duplicate successful RPC`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1500 });
  const receipt = factories[view]();
  let calls = 0, release = () => {};
  await page.route('**/dashboard/tools/call', async route => {
    calls++;
    if (calls === 3) await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill(calls === 2 ? { status: 503, json: { error: 'Synthetic acquisition failure' } } : { json: receipt });
  });
  try {
    await page.goto(`/dashboard/${view}`);
    const frame = page.frames().find(frame => frame.url().endsWith(`/dashboard/${view}_widget`))!;
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'ready');
    const original = await bounds(frame);
    const content = await frame.locator('[data-widget-body]').textContent();
    const refresh = frame.locator('[data-widget-footer] button');
    await refresh.click();
    await expect(frame.locator('[data-footer-status]')).toBeVisible();
    await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
    await refresh.focus(); await refresh.press('Enter');
    await expect.poll(() => calls).toBe(3);
    await expect(frame.locator('[data-footer-status]')).toBeVisible();
    await page.evaluate(result => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: result }, location.origin), receipt);
    await frame.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    await expect(frame.locator('[data-footer-status]')).toBeVisible();
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'error');
    expect(await frame.locator('[data-widget-body]').textContent()).not.toBe(content);
    release();
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'ready');
    await expect(frame.locator('[data-footer-status]')).toBeHidden();
    await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
    await expect(refresh).toBeFocused();
    expect(await frame.locator('[data-widget-body]').textContent()).toBe(content);
    const recovered = await bounds(frame);
    recovered.forEach((row, index) => row.forEach((value, axis) => expect(Math.abs(value - original[index][axis])).toBeLessThanOrEqual(1)));
    expect(calls).toBe(3);
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
});
