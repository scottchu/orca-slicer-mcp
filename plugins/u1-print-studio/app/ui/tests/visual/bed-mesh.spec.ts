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
    await expect(page).toHaveTitle('Bed Mesh');
    await expect(page.locator('html')).toHaveAttribute('data-u1-lab-route', 'bed_mesh');
    await expect(page.locator('.route-panel:visible')).toHaveCount(1);
    const frame = page.locator('[data-chart-frame]');
    const three = page.locator('[data-bed-mesh-3d] canvas');
    await expect(frame).toBeVisible();
    await expect(three).toBeVisible();
    const before = await frame.boundingBox();
    expect(before).not.toBeNull();
    expect(Math.abs(before!.width / before!.height - 4 / 3)).toBeLessThan(0.01);
    const labels = page.locator('[data-axis-label]');
    expect(await labels.count()).toBeGreaterThanOrEqual(9);
    await expect(page.locator('[data-axis="x"]')).toHaveText('X');
    await expect(page.locator('[data-axis="y"]')).toHaveText('Y');
    await expect(page.locator('[data-axis="z"]')).toHaveText('Z');
    await expect(page.locator('[data-axis="z-min"]')).toHaveText('-0.3');
    await expect(page.locator('[data-axis="z-max"]')).toHaveText('0.2');
    const labelMetrics = await labels.evaluateAll((items) => items.map((item) => {
      const style = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      return {
        axis: item.getAttribute('data-axis'),
        fontSize: Number.parseFloat(style.fontSize),
        visible: style.visibility !== 'hidden' && style.display !== 'none' && Number.parseFloat(style.opacity) > 0,
        box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      };
    }));
    for (const label of labelMetrics) {
      expect(label.visible, `${label.axis} label visibility`).toBe(true);
      expect(label.fontSize, `${label.axis} label font size`).toBeGreaterThanOrEqual(12);
      expect(label.box.width, `${label.axis} label width`).toBeGreaterThan(0);
      expect(label.box.height, `${label.axis} label height`).toBeGreaterThan(0);
      expect(label.box.x, `${label.axis} label left`).toBeGreaterThanOrEqual(before!.x - 0.1);
      expect(label.box.y, `${label.axis} label top`).toBeGreaterThanOrEqual(before!.y - 0.1);
      expect(label.box.x + label.box.width, `${label.axis} label right`).toBeLessThanOrEqual(before!.x + before!.width + 0.1);
      expect(label.box.y + label.box.height, `${label.axis} label bottom`).toBeLessThanOrEqual(before!.y + before!.height + 0.1);
    }
    for (let first = 0; first < labelMetrics.length; first += 1) {
      for (let second = first + 1; second < labelMetrics.length; second += 1) {
        const a = labelMetrics[first].box;
        const b = labelMetrics[second].box;
        const overlapWidth = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapHeight = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        expect(overlapWidth * overlapHeight, `${labelMetrics[first].axis}/${labelMetrics[second].axis} label overlap`).toBeLessThan(0.5);
      }
    }
    const surfaceBound = page.locator('[data-surface-projection]');
    await expect(surfaceBound).toHaveAttribute('data-ready', 'true');
    const projected = await surfaceBound.boundingBox();
    expect(projected).not.toBeNull();
    expect(projected!.width / before!.width).toBeGreaterThanOrEqual(0.7);
    expect(projected!.height / before!.height).toBeGreaterThanOrEqual(0.42);
    expect(projected!.x).toBeGreaterThanOrEqual(before!.x - 0.5);
    expect(projected!.y).toBeGreaterThanOrEqual(before!.y - 0.5);
    expect(projected!.x + projected!.width).toBeLessThanOrEqual(before!.x + before!.width + 0.5);
    expect(projected!.y + projected!.height).toBeLessThanOrEqual(before!.y + before!.height + 0.5);
    await expect(page.getByRole('button', { name: 'Show 3D bed mesh' })).toHaveCSS('width', '44px');
    await page.getByRole('button', { name: 'Show 2D bed mesh' }).click();
    await expect(page.locator('[data-bed-mesh-2d]')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toHaveText('2D view');
    const after = await frame.boundingBox();
    expect(after).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(before![key] - after![key])).toBeLessThan(0.1);
    console.log(JSON.stringify({ viewportWidth: width, three: before, two: after, surface: projected, labels: labelMetrics }));
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
