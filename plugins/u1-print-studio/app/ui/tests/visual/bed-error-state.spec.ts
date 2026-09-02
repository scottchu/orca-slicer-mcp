import { expect, test, type Page } from '@playwright/test';

const regions = '[data-widget-shell], [data-widget-header], [data-widget-body], [data-widget-footer], [data-chart-frame]';
const bounds = (page: Page) => page.locator(regions).evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
}));
const doubleText = (page: Page) => page.evaluate(() => {
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
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
    visit(rule);
  }
});
const selectPhase = (page: Page, phase: string) => page.getByLabel('Preview state', { exact: true }).selectOption(phase);
const countWebGL = (page: Page) => page.addInitScript(() => {
  const state = window as unknown as { testWebGLRequests: number };
  state.testWebGLRequests = 0;
  HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
    apply: (target, receiver, args) => {
      if (String(args[0]).includes('webgl')) state.testWebGLRequests += 1;
      return Reflect.apply(target, receiver, args);
    }
  });
});
const webGLCount = (page: Page) => page.evaluate(() => (window as unknown as { testWebGLRequests: number }).testWebGLRequests);

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Bed initial failure preserves frame and retry focus at ${width}, enlarged=${enlarged}`, async ({ page }) => {
    const requests: string[] = [];
    const errors: string[] = [];
    page.on('request', (request) => { if (!['document', 'image'].includes(request.resourceType())) requests.push(request.url()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await countWebGL(page);
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/dashboard/lab/bed_mesh?lab_phase=loading', { waitUntil: 'networkidle' });
    if (enlarged) await doubleText(page);
    await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
    const original = await bounds(page);
    const frame = await page.locator('[data-chart-frame]').elementHandle();
    const header = await page.locator('[data-widget-header]').elementHandle();
    for (const phase of ['error', 'unavailable', 'error']) {
      await selectPhase(page, phase);
      await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
      await expect(page.locator('[data-widget-shell] canvas')).toHaveCount(0);
      await expect(page.getByRole('status')).toHaveCount(0);
      await expect(page.locator('[data-chart-frame] [aria-live]')).toHaveText(phase === 'error' ? 'Could not load bed mesh' : 'Bed mesh unavailable');
      expect(await bounds(page)).toEqual(original);
      expect(await frame!.evaluate((node) => node === document.querySelector('[data-chart-frame]'))).toBe(true);
      expect(await header!.evaluate((node) => node === document.querySelector('[data-widget-header]'))).toBe(true);
      expect(await page.locator('[data-skeleton], [data-loading-value], [data-loading-value] span').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
      await expect(page.getByRole('button', { name: 'Retry bed mesh', exact: true })).toHaveCount(phase === 'error' ? 1 : 0);
    }
    await page.screenshot({ path: `test-results/bed-error-${width}-${enlarged}.png`, fullPage: true });
    expect(await webGLCount(page)).toBe(0);
    const retry = page.getByRole('button', { name: 'Retry bed mesh', exact: true });
    await expect(retry).toHaveCSS('width', '44px');
    await expect(retry).toHaveCSS('height', '44px');
    const button = await retry.elementHandle();
    await page.clock.install();
    await retry.click();
    await expect(retry).toHaveAttribute('aria-disabled', 'true');
    await expect(retry).toBeFocused();
    expect(await bounds(page)).toEqual(original);
    await page.clock.fastForward(301);
    await expect(page.locator('[data-bed-mesh-3d] canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset bed mesh view', exact: true })).toBeFocused();
    expect(await button!.evaluate((node) => node === document.querySelector('[data-widget-footer] button[aria-label="Reset bed mesh view"]'))).toBe(true);
    const ready = await bounds(page);
    for (let index = 0; index < original.length; index++) for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(ready[index][key] - original[index][key]), `ready region ${index}.${key}`).toBeLessThanOrEqual(1);
    }
    expect(new URL(page.url()).searchParams.get('lab_phase')).toBe('ready');
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const mode of ['3d', '2d']) {
  test(`Bed retained ${mode} failure keeps renderer, receipt and cancels pending retry`, async ({ page }) => {
    await countWebGL(page);
    await page.goto(`/dashboard/lab/bed_mesh?lab_mode=${mode}`, { waitUntil: 'networkidle' });
    const renderer = await page.locator(`[data-bed-mesh-${mode}]`).elementHandle();
    const canvas = await page.locator(mode === '2d' ? 'canvas[data-bed-mesh-2d]' : '[data-bed-mesh-3d] canvas').elementHandle();
    const receipt = await page.locator('[data-widget-header]').textContent();
    const original = await bounds(page);
    const contexts = await webGLCount(page);
    await selectPhase(page, 'retained-error');
    await expect(page.locator('[data-chart-frame] [aria-live]')).toHaveText('Refresh failed');
    expect(await renderer!.evaluate((node) => node.isConnected)).toBe(true);
    if (canvas) expect(await canvas.evaluate((node) => node.isConnected)).toBe(true);
    expect(await page.locator('[data-widget-header]').textContent()).toBe(receipt);
    expect(await bounds(page)).toEqual(original);
    expect(await webGLCount(page)).toBe(contexts);
    await page.clock.install();
    await page.getByRole('button', { name: 'Retry bed mesh', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Retry bed mesh', exact: true })).toBeFocused();
    expect(await renderer!.evaluate((node) => node.isConnected)).toBe(true);
    await page.clock.fastForward(301);
    expect(await renderer!.evaluate((node) => node.isConnected)).toBe(true);
    expect(await page.locator('[data-widget-header]').textContent()).toBe(receipt);
    expect(await webGLCount(page)).toBe(contexts);
    await selectPhase(page, 'retained-error');
    await page.getByRole('button', { name: 'Retry bed mesh', exact: true }).click();
    await selectPhase(page, 'unavailable');
    await page.clock.fastForward(400);
    await expect(page.getByLabel('Preview state', { exact: true })).toHaveValue('unavailable');
    await expect(page.locator('[data-chart-frame] [aria-live]')).toHaveText('Bed mesh unavailable');
  });
}
