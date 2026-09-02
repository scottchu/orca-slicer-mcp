import { expect, test, type Frame } from '@playwright/test';
import { liveFansResult } from '../fixtures/live-fans';

const doubleText = (frame: Frame) => frame.evaluate(() => {
  const visit = (item: CSSRule): void => {
    if ('cssRules' in item) for (const child of (item as CSSGroupingRule).cssRules) visit(child);
    if (!(item instanceof CSSStyleRule)) return;
    const size = item.style.getPropertyValue('font-size');
    if (size) item.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
      const value = item.style.getPropertyValue(token);
      if (value.endsWith('px')) item.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
    }
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-reading-list],[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect(); return [rect.x + scrollX, rect.y + scrollY, rect.width, rect.height];
}));

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`real Fans host contract/loading/retained refresh at ${width}, enlarged=${enlarged}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 1600 });
    const errors: string[] = [], outside: string[] = [], calls: unknown[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) outside.push(request.url()); });
    let release: (value: unknown) => void = () => {};
    await page.route('**/dashboard/tools/call', async (route) => {
      calls.push(route.request().postDataJSON());
      const result = await new Promise((resolve) => { release = resolve; });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) });
    });
    await page.goto('/dashboard/fans');
    await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/fans_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Loading Fans & Air');
    if (enlarged) await doubleText(frame);
    await expect(frame.locator('[data-widget-shell] button,canvas,[data-percentage-background],[aria-valuenow]')).toHaveCount(0);
    await expect(frame.locator('[data-reading-row]')).toHaveCount(7);
    const loading = await bounds(frame);
    const maximum = liveFansResult();
    maximum.structuredContent.module.items.forEach((row) => { row.speedFraction = 1; row.rpm = 1_000_000; });
    release(maximum);
    await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
    await expect(frame.getByRole('listitem', { name: 'Tool 1' })).toContainText('1,000,000 RPM');
    const ready = await bounds(frame);
    expect(ready.length).toBe(loading.length);
    for (let row = 0; row < ready.length; row++) for (let axis = 0; axis < 4; axis++) expect(Math.abs(ready[row][axis] - loading[row][axis])).toBeLessThanOrEqual(1);
    const observed = await frame.locator('[data-observed-meta]').textContent();
    const domainTime = await frame.evaluate(() => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date('2026-09-01T11:59:58.000Z')));
    expect(observed).toContain(domainTime);
    const refresh = frame.getByRole('button', { name: 'Refresh Fans & Air' });
    await refresh.focus(); await refresh.press('Enter');
    await expect.poll(() => calls.length).toBe(2);
    await expect(frame.getByRole('status')).toHaveText('Refreshing Fans & Air');
    expect(await bounds(frame)).toEqual(ready);
    expect(await frame.locator('[data-observed-meta]').textContent()).toBe(observed);
    await expect(refresh).toBeFocused();
    release({ isError: true });
    await expect(frame.getByRole('status')).toHaveText('Could not load Fans & Air');
    expect(await bounds(frame)).toEqual(ready);
    await expect(refresh).toBeFocused();
    await refresh.press('Enter'); await expect.poll(() => calls.length).toBe(3);
    const recovered = liveFansResult(1, '2026-09-01T12:05:00.000Z');
    recovered.structuredContent.module.items[0].speedFraction = .333;
    recovered.structuredContent.module.items[1].rpmReported = false;
    recovered.structuredContent.module.items[1].rpm = null;
    release(recovered);
    await expect(frame.getByRole('listitem', { name: 'Tool 1' })).toContainText('33%');
    await expect(frame.getByRole('listitem', { name: 'Tool 2' })).toContainText('N/A');
    expect(Number(await frame.locator('[data-percentage-background]').first().getAttribute('data-percentage-fill'))).toBeCloseTo(33.3);
    const clipped = await frame.locator('[data-widget-shell]').evaluate((shell) => {
      const problems: string[] = [], walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT);
      let text: Node | null;
      while ((text = walker.nextNode())) {
        const owner = text.parentElement!;
        if (!text.textContent?.trim() || owner.closest('[aria-hidden="true"]') || getComputedStyle(owner).visibility === 'hidden') continue;
        const range = document.createRange(); range.selectNodeContents(text);
        for (const rect of range.getClientRects()) for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
          const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
          if ((['hidden', 'clip'].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) || (['hidden', 'clip'].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1))) problems.push(text.textContent.trim());
        }
      }
      return problems;
    });
    expect(clipped).toEqual([]);
    expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(calls).toEqual(Array(3).fill({ name: 'refresh_printer_observation', arguments: { view: 'fans' } }));
    expect(outside).toEqual([]); expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath('live-fans.png'), fullPage: true });
  });
}

test('persisted page lifecycle retains one live Fans root and bridge', async ({ page }) => {
  let calls = 0;
  await page.route('**/dashboard/tools/call', async (route) => { calls += 1; await route.fulfill({ json: liveFansResult(calls) }); });
  await page.goto('/dashboard/fans');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/fans_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
  const before = await bounds(frame);
  await frame.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  expect(await bounds(frame)).toEqual(before); expect(calls).toBe(1);
  await frame.getByRole('button', { name: 'Refresh Fans & Air' }).click();
  await expect.poll(() => calls).toBe(2);
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
  await expect(frame.locator('[data-widget-shell]')).toHaveCount(1);
  await page.goto('/dashboard/'); await page.goBack();
  const restored = page.frames().find((item) => item.url().endsWith('/dashboard/fans_widget'))!;
  await expect(restored.getByRole('status')).toHaveText('Fans & Air loaded');
  await expect(restored.locator('[data-widget-shell]')).toHaveCount(1);
  const beforeRefresh = calls;
  await restored.getByRole('button', { name: 'Refresh Fans & Air' }).click();
  await expect.poll(() => calls).toBe(beforeRefresh + 1);
});

test('initial host failure offers an in-widget retry and restores real data', async ({ page }) => {
  let calls = 0;
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    await route.fulfill(calls === 1 ? { status: 503, json: { error: 'unavailable' } } : { json: liveFansResult() });
  });
  await page.goto('/dashboard/fans');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/fans_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Could not load Fans & Air');
  await expect(frame.locator('[data-percentage-background]')).toHaveCount(0);
  await frame.getByRole('button', { name: 'Refresh Fans & Air' }).click();
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded'); expect(calls).toBe(2);
});

test('a superseded rejected RPC clears busy without replacing newer values or losing refresh focus', async ({ page }) => {
  let calls = 0, rejectPending = () => {};
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    if (calls === 2) {
      await new Promise<void>((resolve) => { rejectPending = resolve; });
      await route.fulfill({ status: 503, json: { error: 'unavailable' } });
    } else await route.fulfill({ json: calls === 1 ? liveFansResult() : liveFansResult(16, '2026-09-01T12:00:16.000Z') });
  });
  await page.goto('/dashboard/fans');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/fans_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
  const refresh = frame.getByRole('button', { name: 'Refresh Fans & Air' });
  await refresh.focus(); await refresh.press('Enter'); await expect.poll(() => calls).toBe(2);
  const newer = liveFansResult(15, '2026-09-01T12:00:15.000Z'); newer.structuredContent.module.items[0].speedFraction = .75;
  await page.evaluate((result) => {
    document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: result }, location.origin);
  }, newer);
  await expect(frame.getByRole('listitem', { name: 'Tool 1' })).toContainText('75%');
  await expect(refresh).toHaveAttribute('aria-disabled', 'true');
  const retained = await bounds(frame), time = await frame.locator('[data-observed-meta]').textContent();
  rejectPending();
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
  await expect(refresh).toBeEnabled(); await expect(refresh).toBeFocused();
  await expect(frame.getByRole('listitem', { name: 'Tool 1' })).toContainText('75%');
  expect(await bounds(frame)).toEqual(retained); expect(await frame.locator('[data-observed-meta]').textContent()).toBe(time);
  await refresh.press('Enter'); await expect.poll(() => calls).toBe(3);
  await expect(frame.getByRole('listitem', { name: 'Tool 1' })).toContainText('100%');
  await expect(frame.getByRole('status')).toHaveText('Fans & Air loaded');
});
