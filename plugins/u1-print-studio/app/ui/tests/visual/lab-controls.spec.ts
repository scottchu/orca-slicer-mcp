import { expect, test } from '@playwright/test';

const views = ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh'] as const;
for (const width of [320, 390, 590, 720]) {
  test(`visible lab controls and closed local persistence at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).hostname !== '127.0.0.1') requests.push(request.url()); });
    for (const view of views) {
      await page.goto(`/dashboard/lab/${view}`, { waitUntil: 'networkidle' });
      const controls = page.locator('[data-lab-controls]');
      await expect(controls).toBeVisible();
      expect(await controls.evaluate((dock) => dock.closest('[data-widget-shell]'))).toBeNull();
      const bounds = await page.locator('[data-widget-shell]').boundingBox();
      const dock = await controls.boundingBox();
      expect(dock!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
      await page.getByLabel('Freshness', { exact: true }).selectOption('stale');
      await expect(page).toHaveURL(/lab_freshness=stale/);
      await page.reload({ waitUntil: 'networkidle' });
      await expect(page.getByLabel('Freshness', { exact: true })).toHaveValue('stale');
      await page.getByLabel('Freshness', { exact: true }).selectOption('offline');
      await page.goBack();
      await expect(page.getByLabel('Freshness', { exact: true })).toHaveValue('stale');
      await page.goForward();
      await expect(page.getByLabel('Freshness', { exact: true })).toHaveValue('offline');
      await page.getByRole('button', { name: 'Reset lab preview' }).click();
      await expect(page).toHaveURL(new RegExp(`/dashboard/lab/${view}$`));
      await expect(page.getByLabel('Freshness', { exact: true })).toHaveValue('fresh');
      await page.getByLabel('Preview state', { exact: true }).focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(page.getByLabel('Preview state', { exact: true })).toHaveValue('loading');
      await expect(page.getByLabel('Freshness', { exact: true })).toBeDisabled();
      await expect(page.getByLabel('Scenario', { exact: true })).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
}
