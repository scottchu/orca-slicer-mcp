import { expect, test } from '@playwright/test';

const widths = [320, 390, 590, 720] as const;
const route = '/dashboard/lab/bed_mesh/';

for (const width of widths) {
  test(`Bed Mesh preserves 4:3 chart geometry at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const externalRequests: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== '127.0.0.1') externalRequests.push(request.url());
    });
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(route, { waitUntil: 'networkidle' });
    const frame = page.locator('[data-chart-frame]');
    const three = page.locator('[data-bed-mesh-3d] canvas');
    await expect(frame).toBeVisible();
    await expect(three).toBeVisible();
    const before = await frame.boundingBox();
    expect(before).not.toBeNull();
    expect(Math.abs(before!.width / before!.height - 4 / 3)).toBeLessThan(0.01);
    await expect(page.getByRole('button', { name: 'Show 3D bed mesh' })).toHaveCSS('width', '44px');
    await page.getByRole('button', { name: 'Show 2D bed mesh' }).click();
    await expect(page.locator('[data-bed-mesh-2d]')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toHaveText('2D view');
    const after = await frame.boundingBox();
    expect(after).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(before![key] - after![key])).toBeLessThan(0.1);
    console.log(JSON.stringify({ viewportWidth: width, three: before, two: after }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/bed-mesh-${width}-2d.png`, fullPage: true });
    await page.getByRole('button', { name: 'Show 3D bed mesh' }).click();
    await expect(three).toBeVisible();
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `test-results/bed-mesh-${width}-3d.png`, fullPage: true });
    expect(consoleErrors).toEqual([]);
    expect(externalRequests).toEqual([]);
  });
}
