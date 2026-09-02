import { expect, test, type Page } from '@playwright/test';

const bounds = (page: Page) => page.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-camera-media]').evaluateAll((nodes) => nodes.map((node) => {
  const b = node.getBoundingClientRect(); return [b.x + scrollX, b.y + scrollY, b.width, b.height];
}));
const enlarge = (page: Page) => page.evaluate(() => {
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
    if (!(rule instanceof CSSStyleRule)) return;
    const value = rule.style.getPropertyValue('font-size');
    if (value) rule.style.setProperty('font-size', value.replace(/([\d.]+)(px|vw)/g, (_, number, unit) => `${Number(number) * 2}${unit}`));
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const headerReadability = (page: Page) => page.locator('[data-widget-header]').evaluate((header) => {
  const rects = (element: Element) => {
    const values: DOMRect[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let text: Node | null;
    while ((text = walker.nextNode())) {
      if (!text.textContent?.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(text); values.push(...range.getClientRects());
    }
    return values;
  };
  const title = rects(header.querySelector('h1')!);
  const status = rects(header.querySelector('[data-camera-status]')!);
  const box = header.getBoundingClientRect();
  return {
    contained: [...title, ...status].every(r => r.left >= box.left && r.right <= box.right),
    overlap: title.some(a => status.some(b => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1))
  };
});

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Camera route controls and seven states at ${width}, enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1500 });
    const errors: string[] = []; const nonlocal: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (new URL(request.url()).pathname !== '/dashboard/lab/camera') nonlocal.push(request.url()); });
    await page.goto('/dashboard/lab/camera');
    await expect(page).toHaveTitle('U1 Camera');
    await page.locator('[data-lab-controls]').waitFor();
    if (enlarged) await enlarge(page);
    const baseline = await bounds(page);
    for (const scenario of ['loading', 'connecting', 'snapshot', 'live', 'fallback', 'error', 'unsupported']) {
      await page.getByLabel('Camera state', { exact: true }).selectOption(scenario);
      if (scenario === 'live') await expect(page.locator('[data-camera-fps]')).toContainText(/\d+ FPS/);
      else await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
      expect(await bounds(page)).toEqual(baseline);
      expect(await headerReadability(page)).toEqual({ contained: true, overlap: false });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (scenario === 'loading') await expect(page.getByRole('radio')).toHaveCount(3);
      if (!enlarged && scenario === 'snapshot') expect(await page.locator('[data-camera-status]').evaluate(status => {
        const title = status.closest('header')!.querySelector('h1')!.getBoundingClientRect();
        const box = status.getBoundingClientRect(); return box.left >= title.right && box.top <= title.bottom;
      })).toBe(true);
      await expect(page.getByRole('status')).toHaveCount(1);
    }
    await page.getByLabel('Display capabilities', { exact: true }).selectOption('denied');
    await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Simulated display request failure');
    await page.getByRole('button', { name: 'Reset lab preview' }).click();
    await expect(page.getByLabel('Camera state', { exact: true })).toHaveValue('snapshot');
    await expect(page.getByLabel('Display capabilities', { exact: true })).toHaveValue('native');
    await expect(page).toHaveURL(/\/dashboard\/lab\/camera$/);
    await page.goBack();
    await expect(page.getByLabel('Display capabilities', { exact: true })).toHaveValue('denied');
    expect(errors).toEqual([]); expect(nonlocal).toEqual([]);
    await page.screenshot({ path: `test-results/camera-route-${width}-${enlarged}.png`, fullPage: true });
  });
}

test('Camera rejects ambiguous hostile URL values and has no hidden loading stream', async ({ page }) => {
  await page.goto('/dashboard/lab/camera?lab_scenario=live&lab_scenario=loading&lab_capability=https%3A%2F%2Fevil.invalid');
  await expect(page.getByLabel('Camera state', { exact: true })).toHaveValue('snapshot');
  await expect(page.getByLabel('Display capabilities', { exact: true })).toHaveValue('native');
  await page.getByLabel('Camera state', { exact: true }).selectOption('loading');
  expect(await page.locator('video').evaluate(video => (video as HTMLVideoElement).srcObject)).toBeNull();
  await expect(page.getByRole('radio')).toHaveCount(3);
  await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Loading synthetic camera');
});
