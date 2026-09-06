import { doubleSyntheticText } from '../helpers/text-scale';
import { expect, test, type Frame } from '@playwright/test';
import { liveThermalsResult } from '../fixtures/live-thermals';
const doubleText = doubleSyntheticText;
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-reading-list],[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));
const visibleText = async (frame: Frame, width: number) => {
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
  test(`real Thermals loading, receipts, refresh and extremes ${width} enlarged=${enlarged}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 1600 });
    let release: (result: unknown) => void = () => {};
    const calls: unknown[] = [], errors: string[] = [], outside: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) outside.push(request.url()); });
    await page.route('**/dashboard/tools/call', async (route) => {
      calls.push(route.request().postDataJSON()); const result = await new Promise((resolve) => { release = resolve; });
      await route.fulfill({ json: result });
    });
    await page.goto('/dashboard/thermals'); await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/thermals_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Loading Thermals'); if (enlarged) await doubleText(frame);
    await expect(frame.locator('[data-reading-row]')).toHaveCount(6);
    await expect(frame.locator('[data-widget-shell] button,canvas,[aria-valuenow]')).toHaveCount(0);
    expect(await frame.locator('[data-percentage-fill]').evaluateAll((rows) => rows.every((row) => row.getAttribute('data-percentage-fill') === '0'))).toBe(true);
    const loading = await bounds(frame); release(liveThermalsResult());
    await expect(frame.getByRole('status')).toHaveText('Thermals loaded');
    const ready = await bounds(frame); expect(ready.length).toBe(loading.length);
    for (let row = 0; row < ready.length; row++) for (let axis = 0; axis < 4; axis++) expect(Math.abs(ready[row][axis] - loading[row][axis]), `region ${row} axis ${axis}`).toBeLessThanOrEqual(1);
    await expect(frame.getByRole('listitem', { name: 'Tool 1 · Active', exact: true })).toContainText('220°');
    await expect(frame.getByRole('listitem', { name: 'Heater bed', exact: true })).toContainText('55°');
    expect(await frame.locator('[data-percentage-fill]').first().getAttribute('data-percentage-fill')).toBe('100');
    const beforeTime = await frame.locator('[data-observed-meta]').allTextContents(); expect(beforeTime[0]).not.toBe(beforeTime[1]);
    const refresh = frame.getByRole('button', { name: 'Refresh Thermals' }); await refresh.focus(); await refresh.press('Enter');
    await expect.poll(() => calls.length).toBe(2); expect(await bounds(frame)).toEqual(ready);
    expect(await frame.locator('[data-observed-meta]').allTextContents()).toEqual(beforeTime); await expect(refresh).toBeFocused();
    release({ isError: true }); await expect(frame.getByRole('status')).toHaveText('Could not load Thermals');
    expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    const notify = (value: unknown) => page.evaluate((value) => {
      document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*');
    }, value);
    for (const [index, values] of [[-273.15, 0], [999, 100], [-Number.MAX_VALUE, Number.MAX_VALUE], [Number.MAX_VALUE, -Number.MAX_VALUE]] .entries()) {
      const next = liveThermalsResult(13 + index, `2026-09-01T12:00:${13 + index}.000Z`);
      next.structuredContent.module.readings[0].actual.value = values[0]; next.structuredContent.module.readings[0].target!.value = values[1];
      next.structuredContent.module.readings[4].actual.value = values[0]; next.structuredContent.module.readings[4].target!.value = values[1];
      await notify(next); await expect(frame.getByRole('status')).toHaveText('Thermals loaded');
      const accessibleActual = Math.abs(values[0]) >= 1_000_000 ? String(values[0]) : String(Math.round(values[0]));
      await expect(frame.getByRole('img', { name: `Actual: ${accessibleActual} degrees Celsius`, exact: true }).first()).toBeVisible();
      await visibleText(frame, width);
      if (index === 3) await page.screenshot({ path: test.info().outputPath('extreme-thermals.png'), fullPage: true });
    }
    const mixed = liveThermalsResult(1, '2026-09-01T12:01:00.000Z');
    mixed.structuredContent.module.readings[0].actual = { state: 'unknown', value: null };
    mixed.structuredContent.module.readings[1].target = { state: 'unknown', value: null };
    mixed.structuredContent.module.readings[1].active = { state: 'unknown', value: null };
    mixed.structuredContent.module.environment.freshness = 'stale'; mixed.structuredContent.module.environment.state = 'stale'; mixed.structuredContent.module.environment.reason = null;
    await notify(mixed); await expect(frame.locator('[data-observed-meta]').nth(1)).toContainText('Stale');
    await expect(frame.locator('[data-observed-meta]').first()).not.toContainText('Stale');
    await expect(frame.getByRole('listitem', { name: 'Tool 2', exact: true })).toContainText('—');
    await visibleText(frame, width);
    const beforeTimeout = await bounds(frame);
    const timeout = structuredClone(mixed);
    timeout.structuredContent.receivedAt = '2026-09-01T12:01:30.000Z';
    timeout.structuredContent.module.environment.reason = 'timeout';
    await notify(timeout);
    await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
    await expect(frame.getByRole('status')).toHaveText('Could not load Thermals');
    await expect(frame.locator('[data-reading-row] [role="img"],[data-observed-meta] time')).toHaveCount(0);
    expect(await frame.locator('[data-skeleton],[data-loading-value] span').evaluateAll(nodes => nodes.length > 0 && nodes.every(node => getComputedStyle(node).animationName === 'none'))).toBe(true);
    expect(await bounds(frame)).toEqual(beforeTimeout);
    mixed.structuredContent.receivedAt = '2026-09-01T12:02:00.000Z'; mixed.structuredContent.freshness = 'stale';
    mixed.structuredContent.module.environment.freshness = 'fresh'; mixed.structuredContent.module.environment.state = 'known'; mixed.structuredContent.module.environment.reason = null;
    await notify(mixed); await expect(frame.locator('[data-observed-meta]').first()).toContainText('Stale');
    await expect(frame.locator('[data-footer-status]')).toBeHidden();
    await expect(frame.locator('[data-observed-meta]').nth(1)).not.toContainText('Stale'); await visibleText(frame, width);
    const beforeOffline = await bounds(frame);
    mixed.structuredContent.receivedAt = '2026-09-01T12:03:00.000Z'; mixed.structuredContent.freshness = 'offline';
    await notify(mixed);
    await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
    await expect(frame.locator('[data-observed-meta] time')).toHaveCount(0);
    expect(await bounds(frame)).toEqual(beforeOffline);
    mixed.structuredContent.receivedAt = '2026-09-01T12:04:00.000Z'; mixed.structuredContent.freshness = 'fresh';
    await notify(mixed);
    await expect(frame.locator('[data-footer-status]')).toBeHidden();
    await expect(frame.getByRole('status')).toHaveText('Thermals loaded');
    expect(calls).toEqual(Array(2).fill({ name: 'refresh_printer_observation', arguments: { view: 'thermals' } }));
    expect(errors).toEqual([]); expect(outside).toEqual([]);
    await page.screenshot({ path: test.info().outputPath('live-thermals.png'), fullPage: true });
  });
}

test('Thermals initial failure offers an in-widget retry', async ({ page }) => {
  let calls = 0;
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    await route.fulfill(calls === 1 ? { status: 503, json: { error: 'unavailable' } } : { json: liveThermalsResult() });
  });
  await page.goto('/dashboard/thermals');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/thermals_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Could not load Thermals');
  await frame.getByRole('button', { name: 'Refresh Thermals' }).click();
  await expect(frame.getByRole('status')).toHaveText('Thermals loaded');
  expect(calls).toBe(2);
});

test('Thermals superseded rejection settles, retries and survives BFCache without another bridge', async ({ page }) => {
  let calls = 0, fail: () => void = () => {};
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    if (calls === 2) { await new Promise<void>((resolve) => { fail = resolve; }); await route.fulfill({ status: 503, json: { error: 'unavailable' } }); }
    else await route.fulfill({ json: liveThermalsResult(calls === 1 ? 12 : 16, calls === 1 ? '2026-09-01T12:00:12.000Z' : '2026-09-01T12:00:16.000Z') });
  });
  await page.goto('/dashboard/thermals'); const frame = page.frames().find((item) => item.url().endsWith('/dashboard/thermals_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Thermals loaded');
  await frame.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  expect(calls).toBe(1);
  const refresh = frame.getByRole('button', { name: 'Refresh Thermals' }); await refresh.focus(); await refresh.press('Enter');
  await expect.poll(() => calls).toBe(2);
  const next = liveThermalsResult(15, '2026-09-01T12:00:15.000Z'); next.structuredContent.module.readings[0].actual.value = 225;
  await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*'), next);
  await expect(frame.getByRole('listitem', { name: 'Tool 1 · Active' })).toContainText('225°');
  const retained = await bounds(frame); fail(); await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
  await expect(frame.getByRole('status')).toHaveText('Thermals loaded'); await expect(refresh).toBeFocused(); expect(await bounds(frame)).toEqual(retained);
  await refresh.press('Enter'); await expect.poll(() => calls).toBe(3); await expect(frame.getByRole('listitem', { name: 'Tool 1 · Active' })).toContainText('220°');
});
