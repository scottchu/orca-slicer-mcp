import { doubleSyntheticText } from '../helpers/text-scale';
import { expect, test, type Page } from '@playwright/test';

const views = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh'] as const;
const bounds = (page: Page) => page.locator('[data-widget-shell], [data-widget-header], [data-widget-body], [data-widget-footer], [data-chart-frame], [data-reading-list], [data-record], .overview-grid, .card-grid, .observation-list').evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
}));
const doubleText = doubleSyntheticText;

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`known empty structures preserve loading geometry at ${width}, enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    for (const view of ['job_history', 'queue']) {
      await page.goto(`/dashboard/lab/${view}?lab_scenario=empty`, { waitUntil: 'networkidle' });
      if (enlarged) await doubleText(page);
      await expect(page.getByLabel('Scenario', { exact: true })).toHaveValue('empty');
      const ready = await bounds(page);
      await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
      await expect(page.locator('[data-widget-shell] .observation-row')).toHaveCount(0);
      const loading = await bounds(page);
      expect(loading.length).toBe(ready.length);
      for (let index = 0; index < ready.length; index++) for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(loading[index][key] - ready[index][key]), `${view} empty ${key}`).toBeLessThanOrEqual(1);
      }
      await page.getByLabel('Preview state', { exact: true }).selectOption('ready');
      expect(await bounds(page)).toEqual(ready);
    }
  });
  test(`all observation states share major geometry at ${width}, enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const view of views) {
      await page.goto(`/dashboard/lab/${view}`, { waitUntil: 'networkidle' });
      if (enlarged) await doubleText(page);
      const ready = await bounds(page);
      expect.soft(await page.evaluate(() => document.documentElement.scrollWidth), `${view} ready overflow`).toBeLessThanOrEqual(width);
      const before = await page.locator('[data-widget-header]').textContent();
      await page.getByLabel('Preview state', { exact: true }).selectOption('refreshing');
      await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
      expect.soft(await page.locator('[data-widget-header]').textContent(), `${view} refresh timestamp`).toBe(before);
      expect.soft(await bounds(page), `${view} refreshing geometry`).toEqual(ready);
      await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
      await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
      await expect(page.locator('[data-widget-shell] button, [data-widget-shell] canvas, [data-widget-shell] [aria-valuenow]')).toHaveCount(0);
      const loading = await bounds(page);
      expect.soft(await page.evaluate(() => document.documentElement.scrollWidth), `${view} loading overflow`).toBeLessThanOrEqual(width);
      expect.soft(loading.length, `${view} major regions`).toBe(ready.length);
      for (let index = 0; index < Math.min(loading.length, ready.length); index++) for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect.soft(Math.abs(loading[index][key] - ready[index][key]), `${view} ${width} ${enlarged} region${index}.${key} loading ${loading[index][key]} ready ${ready[index][key]}`).toBeLessThanOrEqual(1);
      }
      await page.screenshot({ path: `test-results/lab-${view}-loading-${width}-${enlarged}.png`, fullPage: true });
      for (const phase of ['error', 'unavailable']) {
        await page.getByLabel('Preview state', { exact: true }).selectOption(phase);
        if (view === 'bed_mesh') {
          await expect(page.getByRole('status')).toHaveCount(1);
          await expect(page.locator('[data-widget-shell] canvas')).toHaveCount(0);
          await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
          await expect(page.locator('[data-widget-state-surface] [aria-live="polite"]')).toHaveCount(1);
          expect(await bounds(page)).toEqual(loading);
        } else {
          await expect(page.getByRole('status')).toHaveCount(1);
          await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
          await expect(page.locator('[data-widget-shell] canvas,[data-widget-shell] video,[data-widget-shell] [aria-valuenow]')).toHaveCount(0);
          await expect(page.locator('[data-footer-status]')).toBeVisible();
          await expect(page.locator('.widget-feedback')).toHaveCount(0);
          expect(await page.locator('[data-widget-shell] [data-loading-value]').count()).toBeGreaterThan(0);
          expect(await page.locator('[data-widget-shell] [data-loading-value],[data-widget-shell] [data-skeleton]').evaluateAll(nodes => nodes.every(node =>
            [null, '::before', '::after'].every(pseudo => getComputedStyle(node, pseudo).animationName === 'none')))).toBe(true);
          const failed = await bounds(page);
          expect(failed.length).toBe(loading.length);
          failed.forEach((region, index) => {
            for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(region[key] - loading[index][key]), `${view} ${phase} region${index}.${key}`).toBeLessThanOrEqual(1);
          });
        }
      }
      expect.soft(await page.evaluate(() => document.documentElement.scrollWidth), `${view} overflow`).toBeLessThanOrEqual(width);
    }
    expect(errors).toEqual([]);
  });
}
