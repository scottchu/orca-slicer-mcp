import { expect, test } from '@playwright/test';

for (const width of [320, 390, 590, 720]) {
  test(`Thermals progressive states retain geometry at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) external.push(request.url()); });
    await page.goto('/__test/thermals');
    const shell = page.locator('[data-widget-shell]');
    await expect(shell).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('status')).toHaveText('Loading Thermals');
    await expect(page.locator('[data-reading-row]')).toHaveCount(6);
    await expect(page.locator('button,input,a,[tabindex]')).toHaveCount(0);
    await expect(shell).not.toContainText(/Observed|°|220|Active|Idle/);
    const loading = await shell.boundingBox();
    const header = await page.locator('[data-widget-header]').boundingBox();
    const rows = await page.locator('[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
    await page.screenshot({ path: `test-results/thermals-loading-${width}.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await page.locator('[data-skeleton]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await page.locator('[data-skeleton]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).outlineStyle !== 'none'))).toBe(true);
    await page.emulateMedia({ forcedColors: 'none' });
    const setState = async (kind: string) => { await page.evaluate((value) => (window as unknown as { __setThermalsState: (kind: string) => void }).__setThermalsState(value), kind); };
    await setState('ready');
    await expect(page.getByRole('status')).toHaveText('Thermals loaded');
    await expect(shell).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('[data-skeleton]')).toHaveCount(0);
    const ready = (await shell.boundingBox())!;
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(ready[key] - loading![key])).toBeLessThan(.1);
    expect(await page.locator('[data-widget-header]').boundingBox()).toEqual(header);
    const readyRows = await page.locator('[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
    expect(readyRows).toEqual(rows);
    expect(readyRows.every((row) => row.height <= 64)).toBe(true);
    const observed = await page.locator('[data-observed-meta]').textContent();
    await page.getByRole('button').click();
    await setState('refreshing');
    await expect(page.getByRole('status')).toHaveText('Refreshing Thermals');
    await expect(page.getByRole('button')).toBeDisabled();
    expect(await page.locator('[data-observed-meta]').textContent()).toBe(observed);
    expect(await shell.boundingBox()).toEqual(ready);
    for (const kind of ['error', 'unavailable']) {
      await setState(kind);
      await expect(page.getByRole('status')).toHaveCount(1);
      await expect(shell).not.toContainText('220°');
      const action = (await page.getByRole('button').boundingBox())!;
      expect(action.width).toBe(44); expect(action.height).toBe(44);
      await page.screenshot({ path: `test-results/thermals-${kind}-${width}.png`, fullPage: true });
    }
    await setState('ready');
    await page.addStyleTag({ content: '.name { font-size: 28px !important; } .degree { font-size:40px !important; } .degree.secondary { font-size:26px !important; }' });
    const readability = await page.locator('[data-reading-row]').evaluateAll((rows) => rows.map((row) => {
      const outer = row.getBoundingClientRect();
      const texts = [...row.querySelectorAll('[data-required-text]')].map((item) => item.getBoundingClientRect());
      const contained = texts.every((box) => box.left >= outer.left - .1 && box.right <= outer.right + .1 && box.top >= outer.top - .1 && box.bottom <= outer.bottom + .1 && box.width > 0 && box.height > 0);
      const nonoverlap = texts.every((box, index) => texts.slice(index + 1).every((other) => box.right <= other.left + .1 || other.right <= box.left + .1 || box.bottom <= other.top + .1 || other.bottom <= box.top + .1));
      return { contained, nonoverlap, height: outer.height };
    }));
    expect(readability.every(({ contained, nonoverlap, height }) => contained && nonoverlap && height > 49)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]); expect(external).toEqual([]);
  });
}
