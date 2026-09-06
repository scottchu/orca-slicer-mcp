import { doubleSyntheticText } from '../helpers/text-scale';
import { expect, test, type Page } from '@playwright/test';

const views = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans'] as const;
const bounds = (page: Page) => page.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer]').evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect(); return [rect.x + scrollX, rect.y + scrollY, rect.width, rect.height];
}));
const equalBounds = (actual: number[][], expected: number[][]) => {
  expect(actual.length).toBe(expected.length);
  actual.forEach((row, index) => row.forEach((value, axis) => expect(Math.abs(value - expected[index][axis]), `region ${index}/${axis}`).toBeLessThanOrEqual(1)));
};
const enlarge = doubleSyntheticText;

for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`all light Lab errors keep entire anatomy ${width} text200=${doubled}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1600 });
    for (const view of views) {
      await page.goto(`/dashboard/lab/${view}?lab_phase=loading`);
      const control = page.getByLabel('Preview state', { exact: true });
      await control.waitFor();
      if (doubled) await enlarge(page);
      const loading = await bounds(page);
      for (const phase of ['error', 'unavailable', 'error']) {
        await control.selectOption(phase);
        await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
        await expect(page.getByRole('status')).toHaveCount(1);
        await expect(page.locator('[data-footer-status]')).toBeVisible();
        await expect(page.locator('[data-widget-shell] canvas, [data-widget-shell] video')).toHaveCount(0);
        expect(await page.locator('[data-skeleton], [data-loading-value], [data-loading-value] span').evaluateAll((nodes) => nodes.length > 0 && nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
        equalBounds(await bounds(page), loading);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        if (view === 'heads' && phase === 'error') await page.screenshot({ path: `test-results/heads-quiet-inline-initial-error-${width}-${doubled}.png`, fullPage: true });
      }
      await page.getByRole('button', { name: 'Retry lab fixture', exact: true }).click();
      await expect(control).toHaveValue('ready');
      const ready = await bounds(page);
      if (view === 'heads') {
        await page.screenshot({ path: `test-results/heads-quiet-inline-ready-${width}-${doubled}.png`, fullPage: true });
        const geometry = await page.locator('.card-grid').evaluate((grid) => ({
          columns: getComputedStyle(grid).gridTemplateColumns,
          cards: [...grid.querySelectorAll('[data-inset-card]')].map((card) => {
            const rect = card.getBoundingClientRect(); return { width: rect.width, height: rect.height };
          })
        }));
        await testInfo.attach('heads-ready-geometry', { body: JSON.stringify(geometry), contentType: 'application/json' });
        console.log(`Heads ${width} text200=${doubled}: ${JSON.stringify(geometry)}`);
      }
      const receipt = await page.locator('[data-observed-meta]').allTextContents();
      const content = await page.locator('[data-widget-body]').textContent();
      await control.selectOption('retained-error');
      equalBounds(await bounds(page), ready);
      expect(await page.locator('[data-observed-meta]').allTextContents()).not.toEqual(receipt);
      expect(await page.locator('[data-widget-body]').textContent()).not.toBe(content);
      await expect(page.locator('[data-footer-status]')).toContainText('Could not load');
      await expect(page.locator('.widget-feedback')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^Copy / })).toHaveCount(0);
      if (view === 'heads') {
        const rows = await page.locator('[data-inset-card] .footer').evaluateAll((footers) => footers.map((footer) => {
          const swatch = footer.querySelector('.swatch')!.getBoundingClientRect();
          const text = footer.querySelector('.text')!.getBoundingClientRect();
          const button = footer.querySelector('button');
          return { center: Math.abs(swatch.y + swatch.height / 2 - text.y - text.height / 2), button: button ? { width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, border: getComputedStyle(button).borderWidth, glyph: button.querySelector('svg')?.getAttribute('width') } : null };
        }));
        for (const row of rows) {
          expect(row.center).toBeLessThanOrEqual(1);
          if (row.button) {
            expect(row.button.width).toBeGreaterThanOrEqual(44);
            expect(row.button).toMatchObject({ height: 44, border: '0px', glyph: '16' });
          }
        }
        await page.screenshot({ path: `test-results/heads-quiet-inline-${width}-${doubled}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}
