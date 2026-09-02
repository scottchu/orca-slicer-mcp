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

test('Queue failure keeps zero, one, twenty and unknown short allocations without stale facts', async ({ page }) => {
  let release = (_value: unknown) => {};
  let calls = 0;
  await page.route('**/dashboard/tools/call', async route => {
    calls++;
    const result = await new Promise(resolve => { release = resolve; }); await route.fulfill({ json: result });
  });
  for (const count of [0, 1, 20, -1]) {
    const beforeCalls = calls;
    await page.goto('/dashboard/queue');
    await expect.poll(() => calls).toBe(beforeCalls + 1);
    const frame = page.frames().find(value => value.url().endsWith('/dashboard/queue_widget'))!;
    await expect(frame.locator('[data-widget-shell]')).toBeVisible();
    const ready = liveQueueResult(Math.max(count, 0));
    const module = count === -1 ? { ...ready.structuredContent.module, state: 'unknown', freshness: 'unknown', sourceObservedAt: null, receivedAt: null, checkedAt: null, queueState: null, totalCount: null, reason: 'not_requested', capabilityEvidence: 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: 'Fixture unknown' } } : ready.structuredContent.module;
    release({ structuredContent: { ...ready.structuredContent, module } });
    await expect(frame.locator('[data-loading-value]')).toHaveCount(0);
    const before = await bounds(frame);
    const refresh = frame.getByRole('button', { name: 'Refresh Print Queue' }); await refresh.click();
    await expect.poll(() => calls).toBe(beforeCalls + 2);
    await expect(refresh).toHaveAttribute('aria-disabled', 'true');
    release({ isError: true });
    await expect(frame.locator('[data-footer-status]')).toBeVisible();
    const after = await bounds(frame);
    expect(after.length).toBe(before.length);
    after.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - before[i][j]), `${count}: ${i}/${j}`).toBeLessThanOrEqual(1)));
    await expect(frame.locator('[data-widget-body]')).not.toContainText(/Fixture.*gcode|Queue empty|Print Queue not observed/);
    await expect(frame.locator('[data-widget-body] time')).toHaveCount(0);
  }
});
for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Print Queue source facts, retained refresh, long records ${width} enlarged=${enlarged}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 1400 });
    let release: (result: unknown) => void = () => {};
    const calls: unknown[] = [], errors: string[] = [], outside: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) outside.push(request.url()); });
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
    release({ isError: true }); await expect(frame.getByRole('status')).toHaveText('Could not load Print Queue');
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
    for (const [offset, count] of [1, 100, 101].entries()) {
      const next = liveQueueResult(count, 14 + offset, `2026-09-01T12:00:${14 + offset}.000Z`);
      await notify(next);
      await expect(frame.locator('[data-record]')).toHaveCount(Math.min(count, 100));
      await expect(frame.locator('[data-widget-body]')).toContainText(`${count} ${count === 1 ? 'job' : 'jobs'}`);
      if (count === 101) await expect(frame.locator('[data-widget-body]')).toContainText('Showing 100 of 101 jobs · 1 not shown');
      else await expect(frame.locator('[data-widget-body]')).not.toContainText('not shown');
    }
    const reorder = liveQueueResult(3, 17, '2026-09-01T12:00:17.000Z');
    reorder.structuredContent.module.items.reverse().forEach((item, index) => { item.position = index + 1; });
    await notify(reorder); await expect(frame.locator('[data-record]').first()).toContainText('Fixture 3.gcode');
    for (const [index, state] of ['ready', 'starting', 'paused'].entries()) {
      const next = liveQueueResult(0, 18 + index, `2026-09-01T12:00:${18 + index}.000Z`);
      next.structuredContent.module.queueState = state as 'ready' | 'starting' | 'paused';
      await notify(next); await expect(frame.locator('[data-widget-body]')).toContainText('0 jobs');
      await expect(frame.locator('[data-widget-body]')).toContainText('Queue empty');
    }
    const stale = liveQueueResult(0, 21, '2026-09-01T12:00:21.000Z');
    stale.structuredContent.module.state = 'stale'; stale.structuredContent.module.freshness = 'stale'; stale.structuredContent.module.reason = null; // Successful age-stale receipt.
    await notify(stale); await expect(frame.locator('[data-widget-body]')).toContainText('Last observed queue was empty');
    await expect(frame.locator('[data-observed-meta]')).toContainText('Stale'); await readable(frame, width);
    const unavailable = liveQueueResult(0, 22, '2026-09-01T12:00:22.000Z');
    const unavailableDomain = { ...unavailable.structuredContent.module, state: 'unavailable', freshness: 'unknown', sourceObservedAt: null, receivedAt: null, checkedAt: '2026-09-01T12:00:22.000Z', queueState: null, totalCount: null, reason: 'timeout', capabilityEvidence: 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: unavailable.structuredContent.module.provenance.detail } };
    await notify({ structuredContent: { ...unavailable.structuredContent, module: unavailableDomain } });
    await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', 'Print Queue unavailable');
    await expect(frame.locator('[data-widget-body]')).not.toContainText('Last observed queue was empty');
    await expect(frame.locator('[data-observed-meta]')).not.toContainText('Stale'); await readable(frame, width);
    const unknown = liveQueueResult(0, 23, '2026-09-01T12:00:23.000Z');
    const unknownDomain = { ...unknown.structuredContent.module, state: 'unknown', freshness: 'unknown', sourceObservedAt: null, receivedAt: null, checkedAt: null, queueState: null, totalCount: null, reason: 'not_requested', capabilityEvidence: 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: unknown.structuredContent.module.provenance.detail } };
    await notify({ structuredContent: { ...unknown.structuredContent, module: unknownDomain } });
    await expect(frame.locator('[data-widget-body]')).toHaveText('Print Queue not observed');
    await expect(frame.locator('[data-widget-shell]')).not.toContainText(/0 jobs|Queue empty/); await readable(frame, width);
    expect(calls).toEqual(Array(2).fill({ name: 'refresh_printer_observation', arguments: { view: 'queue' } }));
    expect(errors).toEqual([]); expect(outside).toEqual([]);
    await page.screenshot({ path: test.info().outputPath('live-queue.png'), fullPage: true });
  });
}

test('Queue true initial HTTP failure immediately exposes Retry and preserves newer data over an obsolete RPC', async ({ page }) => {
  let calls = 0, releaseOld: () => void = () => {};
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    if (calls === 1) await route.fulfill({ status: 503, json: { error: 'unavailable' } });
    else if (calls === 3) {
      await new Promise<void>((resolve) => { releaseOld = resolve; });
      await route.fulfill({ json: liveQueueResult(2, 16, '2026-09-01T12:00:16.000Z') });
    } else await route.fulfill({ json: liveQueueResult(3, calls === 2 ? 12 : 17, calls === 2 ? '2026-09-01T12:00:12.000Z' : '2026-09-01T12:00:17.000Z') });
  });
  await page.goto('/dashboard/queue');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/queue_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Could not load Print Queue');
  const refresh = frame.getByRole('button', { name: 'Refresh Print Queue' });
  await expect(refresh).toBeVisible(); await refresh.click();
  await expect(frame.getByRole('status')).toHaveText('Print Queue loaded'); expect(calls).toBe(2);
  await frame.evaluate(() => {
    const before = document.querySelector('[data-widget-shell]');
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    if (document.querySelector('[data-widget-shell]') !== before) throw new Error('BFCache replaced the Queue root');
  });
  expect(calls).toBe(2); await refresh.focus(); await refresh.press('Enter'); await expect.poll(() => calls).toBe(3);
  const newer = liveQueueResult(1, 15, '2026-09-01T12:00:15.000Z');
  newer.structuredContent.module.items[0].filename = 'Newer notification.gcode';
  await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*'), newer);
  await expect(frame.locator('[data-record]').first()).toContainText('Newer notification.gcode');
  const retained = await bounds(frame); releaseOld();
  await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
  await expect(frame.getByRole('status')).toHaveText('Print Queue loaded');
  await expect(frame.locator('[data-record]').first()).toContainText('Newer notification.gcode');
  await expect(refresh).toBeFocused(); expect(await bounds(frame)).toEqual(retained);
  await refresh.press('Enter'); await expect.poll(() => calls).toBe(4);
  await expect(frame.locator('[data-record]').first()).toContainText('Repeated fixture.gcode');
});

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
  const initial = await bounds(frame);
  await expect(frame.locator('[data-record]')).toHaveCount(3);
  await page.clock.fastForward(20_001);
  await expect(frame.getByRole('button', { name: 'Refresh Print Queue' })).toBeVisible();
  await expect(frame.locator('[data-record]')).toHaveCount(3);
  await expect(frame.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
  await expect(frame.getByRole('status')).toHaveCount(1);
  await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
  await expect(frame.locator('[data-record] button,[data-record] a,[data-record] [tabindex],[aria-valuenow],time')).toHaveCount(0);
  expect(await frame.locator('[data-record]').evaluateAll(rows => rows.map(row => {
    const copy = row.cloneNode(true) as Element;
    copy.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
    return copy.textContent!.replace(/\s+/g, ' ').trim();
  }))).toEqual(Array(3).fill('Added Wait at observation'));
  expect(await frame.locator('[data-record] [data-text-skeleton]').evaluateAll(nodes => nodes.every(node =>
    node.getAttribute('aria-hidden') === 'true' && ['0', 'Model filename.gcode', 'Jan 0, 0000, 00:00:00 AM'].includes(node.textContent!)))).toBe(true);
  expect(await frame.locator('[data-loading-value],[data-skeleton]').evaluateAll(nodes => nodes.length > 0 && nodes.every(node =>
    [null, '::before', '::after'].every(pseudo => getComputedStyle(node, pseudo).animationName === 'none')))).toBe(true);
  const failed = await bounds(frame);
  expect(failed.length).toBe(initial.length);
  failed.forEach((region, index) => region.forEach((value, axis) => expect(Math.abs(value - initial[index][axis])).toBeLessThanOrEqual(1)));
  await frame.getByRole('button', { name: 'Refresh Print Queue' }).click();
  await expect(frame.getByRole('status')).toHaveText('Print Queue loaded'); expect(calls).toBe(2);
  const ready = await bounds(frame);
  await frame.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  expect(calls).toBe(2); expect(await bounds(frame)).toEqual(ready);
});
