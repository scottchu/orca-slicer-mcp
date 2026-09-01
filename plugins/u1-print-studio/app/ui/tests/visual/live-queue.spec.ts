import { expect, test, type Frame } from '@playwright/test';
import { liveQueueResult } from '../fixtures/live-queue';

const doubleText = (frame: Frame) => frame.evaluate(() => {
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
    if (!(rule instanceof CSSStyleRule)) return;
    const size = rule.style.getPropertyValue('font-size');
    if (size) rule.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
      const value = rule.style.getPropertyValue(token);
      if (value.endsWith('px')) rule.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
    }
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-record]').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));
const readable = async (frame: Frame, width: number) => {
  expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const clipped = await frame.locator('[data-widget-shell]').evaluate((shell) => {
    const problems: string[] = [], walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT); let node: Node | null;
    while ((node = walker.nextNode())) {
      const owner = node.parentElement!;
      if (!node.textContent?.trim() || owner.closest('[aria-hidden="true"]') || getComputedStyle(owner).visibility === 'hidden') continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const box of range.getClientRects()) for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
        const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
        if ((['hidden', 'clip'].includes(style.overflowX) && (box.left < clip.left - 1 || box.right > clip.right + 1)) || (['hidden', 'clip'].includes(style.overflowY) && (box.top < clip.top - 1 || box.bottom > clip.bottom + 1))) problems.push(node.textContent.trim());
      }
    }
    return problems;
  });
  expect(clipped).toEqual([]);
};
for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Print Queue source facts, retained refresh, long records ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    let release: (result: unknown) => void = () => {};
    const calls: unknown[] = [], errors: string[] = [], outside: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) outside.push(request.url()); });
    await page.route('**/dashboard/tools/call', async (route) => {
      calls.push(route.request().postDataJSON()); const result = await new Promise((resolve) => { release = resolve; });
      await route.fulfill({ json: result });
    });
    await page.goto('/dashboard/queue'); await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/queue_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Loading Print Queue'); if (enlarged) await doubleText(frame);
    await expect(frame.locator('[data-record]')).toHaveCount(3);
    await expect(frame.locator('[data-widget-shell] button,canvas,[aria-valuenow]')).toHaveCount(0);
    await expect(frame.locator('[data-widget-shell]')).not.toContainText(/0 jobs|Queue empty|Repeated fixture|11:59/);
    const initial = liveQueueResult(); initial.structuredContent.module.queueState = 'loading'; release(initial);
    await expect(frame.getByRole('status')).toHaveText('Print Queue loaded');
    await expect(frame.getByRole('list', { name: 'Reported print queue order' })).toBeVisible();
    await expect(frame.locator('[data-record]')).toHaveCount(3);
    await expect(frame.locator('[data-record]').nth(0)).toContainText('Repeated fixture.gcode');
    await expect(frame.locator('[data-record]').nth(1)).toContainText('Repeated fixture.gcode');
    await expect(frame.getByRole('img', { name: '0 seconds', exact: true })).toBeVisible();
    await expect(frame.getByRole('img', { name: 'Duration not reported', exact: true })).toBeVisible();
    await expect(frame.locator('[data-widget-body]')).toContainText('Loading'); // Reported machine queue state, not a skeleton.
    await expect(frame.locator('[data-loading-value]')).toHaveCount(0);
    await readable(frame, width);
    await page.screenshot({ path: test.info().outputPath('ready-queue.png'), fullPage: true });
    const ready = await bounds(frame), receipt = await frame.locator('[data-observed-meta]').textContent();
    const refresh = frame.getByRole('button', { name: 'Refresh Print Queue' }); await refresh.focus(); await refresh.press('Enter');
    await expect.poll(() => calls.length).toBe(2); expect(await bounds(frame)).toEqual(ready);
    expect(await frame.locator('[data-observed-meta]').textContent()).toBe(receipt); await expect(refresh).toBeFocused();
    release({ isError: true }); await expect(frame.getByRole('status')).toHaveText('Refresh failed · showing previous observation');
    expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    const notify = (value: unknown) => page.evaluate((value) => {
      document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*');
    }, value);
    const long = liveQueueResult(1000, 13, '2026-09-01T12:00:13.000Z');
    long.structuredContent.module.items[0].filename = 'M'.repeat(154) + '.gcode';
    long.structuredContent.module.items[1].filename = '模型'.repeat(77) + '.gcode';
    long.structuredContent.module.items[0].timeAdded = '+275760-09-13T00:00:00.000Z';
    long.structuredContent.module.items[0].timeInQueueSeconds = Number.MAX_VALUE;
    long.structuredContent.module.items[2].timeAdded = '1970-01-01T00:00:00.000Z';
    long.structuredContent.module.items[2].timeInQueueSeconds = Number.MIN_VALUE;
    await notify(long); await expect(frame.locator('[data-record]')).toHaveCount(100);
    await expect(frame.locator('[data-widget-body]')).toContainText('Showing 100 of 1000 jobs · 900 not shown');
    await expect(frame.locator('[data-record]').first()).toContainText(long.structuredContent.module.items[0].filename);
    await expect(frame.locator('[data-record]').nth(1)).toContainText(long.structuredContent.module.items[1].filename);
    await readable(frame, width);
    await page.screenshot({ path: test.info().outputPath('long-queue.png') });
    const reorder = liveQueueResult(3, 14, '2026-09-01T12:00:14.000Z');
    reorder.structuredContent.module.items.reverse().forEach((item, index) => { item.position = index + 1; });
    await notify(reorder); await expect(frame.locator('[data-record]').first()).toContainText('Fixture 3.gcode');
    for (const [index, state] of ['ready', 'starting', 'paused'].entries()) {
      const next = liveQueueResult(0, 15 + index, `2026-09-01T12:00:${15 + index}.000Z`);
      next.structuredContent.module.queueState = state as 'ready' | 'starting' | 'paused';
      await notify(next); await expect(frame.locator('[data-widget-body]')).toContainText('0 jobs');
      await expect(frame.locator('[data-widget-body]')).toContainText('Queue empty');
    }
    const stale = liveQueueResult(0, 18, '2026-09-01T12:00:18.000Z');
    stale.structuredContent.module.state = 'stale'; stale.structuredContent.module.freshness = 'stale'; stale.structuredContent.module.reason = 'timeout';
    await notify(stale); await expect(frame.locator('[data-widget-body]')).toContainText('Last observed queue was empty');
    await expect(frame.locator('[data-observed-meta]')).toContainText('Stale'); await readable(frame, width);
    const unknown = liveQueueResult(0, 19, '2026-09-01T12:00:19.000Z');
    const domain = { ...unknown.structuredContent.module, state: 'unavailable', freshness: 'unknown', sourceObservedAt: null, receivedAt: null, queueState: null, totalCount: null, reason: 'timeout', capabilityEvidence: 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: unknown.structuredContent.module.provenance.detail } };
    await notify({ structuredContent: { ...unknown.structuredContent, module: domain } });
    await expect(frame.locator('[data-widget-body]')).toHaveText('Print Queue unavailable');
    await expect(frame.locator('[data-widget-shell]')).not.toContainText(/0 jobs|Queue empty/); await readable(frame, width);
    expect(calls).toEqual(Array(2).fill({ name: 'refresh_printer_observation', arguments: { view: 'queue' } }));
    expect(errors).toEqual([]); expect(outside).toEqual([]);
    await page.screenshot({ path: test.info().outputPath('live-queue.png'), fullPage: true });
  });
}

test('Queue initial wrong-view failure is bounded, retry and BFCache preserve one bridge', async ({ page }) => {
  await page.clock.install();
  let calls = 0;
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1; const value = liveQueueResult();
    await route.fulfill({ json: calls === 1 ? { structuredContent: { ...value.structuredContent, view: 'fans' } } : value });
  });
  await page.goto('/dashboard/queue'); const frame = page.frames().find((item) => item.url().endsWith('/dashboard/queue_widget'))!;
  await expect.poll(() => calls).toBe(1);
  await expect(frame.getByRole('status')).toHaveText('Loading Print Queue');
  await page.clock.fastForward(20_001);
  await expect(frame.getByRole('button', { name: 'Refresh Print Queue' })).toBeVisible();
  await expect(frame.locator('[data-record]')).toHaveCount(0);
  await frame.getByRole('button', { name: 'Refresh Print Queue' }).click();
  await expect(frame.getByRole('status')).toHaveText('Print Queue loaded'); expect(calls).toBe(2);
  const ready = await bounds(frame);
  await frame.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  expect(calls).toBe(2); expect(await bounds(frame)).toEqual(ready);
});
