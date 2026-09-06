import { doubleSyntheticText } from '../helpers/text-scale';
import { expect, test, type Page } from '@playwright/test';

const enlarge = doubleSyntheticText;
const geometry = (page: Page) => page.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-inset-card]').evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect(); return [rect.x + scrollX, rect.y + scrollY, rect.width, rect.height];
}));

for (const doubled of [false, true]) test(`Heads balanced Copy and footer error preview 390 text200=${doubled}`, async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 1500 });
  await page.goto('/dashboard/lab/heads?lab_phase=ready');
  const control = page.getByLabel('Preview state', { exact: true });
  await control.waitFor();
  if (doubled) await enlarge(page);
  const copy = page.getByRole('button', { name: /^Copy T1 color/ });
  await copy.hover();
  const measurements = await copy.evaluate((button) => {
    const rect = button.getBoundingClientRect(), swatch = button.querySelector('.swatch')!.getBoundingClientRect(), glyph = button.querySelector('svg')!.getBoundingClientRect();
    const card = button.closest('[data-inset-card]')!.getBoundingClientRect();
    const text = button.querySelector('.text')!.getBoundingClientRect();
    return { left: swatch.left - rect.left, right: rect.right - glyph.right, height: rect.height, width: rect.width, glyph: glyph.width, inside: rect.left >= card.left && rect.right <= card.right, inline: Math.abs(swatch.y + swatch.height / 2 - text.y - text.height / 2), columns: getComputedStyle(button.closest('.card-grid')!).gridTemplateColumns.split(' ').length };
  });
  expect(measurements).toMatchObject({ left: 8, right: 8, height: 44, glyph: 16, inside: true, columns: doubled ? 1 : 2 });
  expect(measurements.inline).toBeLessThanOrEqual(1);
  await page.screenshot({ path: info.outputPath('heads-hover.png'), fullPage: true });
  const ready = await geometry(page);
  await control.selectOption('retained-error');
  await expect(page.locator('[data-footer-status]')).toBeVisible();
  await expect(page.locator('.widget-feedback')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Copy / })).toHaveCount(0);
  await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
  expect(await page.locator('[data-skeleton],[data-loading-value]').evaluateAll((nodes) => nodes.length > 0 && nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
  const failed = await geometry(page);
  expect(failed.length).toBe(ready.length);
  failed.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - ready[i][j]), `region${i}/${j}`).toBeLessThanOrEqual(1)));
  const footer = await page.locator('[data-widget-footer]').evaluate((node) => {
    const status = node.querySelector('[data-footer-status]')!.getBoundingClientRect(), action = node.querySelector('button')!.getBoundingClientRect();
    return { gap: action.left - status.right, vertical: status.bottom <= action.bottom + 10 && status.top >= action.top - 10 };
  });
  expect(footer.gap).toBe(8); expect(footer.vertical).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: info.outputPath('heads-error.png'), fullPage: true });
  await info.attach('geometry', { body: JSON.stringify({ measurements, ready, failed, footer }), contentType: 'application/json' });
});

for (const [view, counts] of [['job_history', [0, 1, 20]], ['queue', [0, 1, 10]]] as const) {
  for (const width of [320, 390, 720]) for (const doubled of [false, true]) test(`${view} short/long failure allocations ${width} text200=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1500 });
    for (const count of counts) {
      await page.goto(`/dashboard/lab/${view}?lab_count=${count}`);
      const control = page.getByLabel('Preview state', { exact: true }); await control.waitFor();
      if (doubled) await enlarge(page);
      const ready = await geometry(page);
      await control.selectOption('retained-error');
      const failed = await geometry(page);
      failed.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - ready[i][j]), `${count}: region${i}/${j}`).toBeLessThanOrEqual(1)));
      await expect(page.locator('[data-widget-body] time')).toHaveCount(0);
      await expect(page.locator('[data-footer-status]')).toBeVisible();
      await control.selectOption('ready');
      const recovered = await geometry(page);
      recovered.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - ready[i][j])).toBeLessThanOrEqual(1)));
      expect(await page.locator('[data-widget-body]').evaluate(node => (node as HTMLElement).style.minBlockSize)).toBe('');
    }
  });
}

test('failed allocation follows font-only and width resize and releases on recovery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1500 });
  await page.goto('/dashboard/lab/heads');
  const control = page.getByLabel('Preview state', { exact: true }); await control.waitFor();
  await control.selectOption('retained-error');
  const allocation = () => page.locator('[data-widget-body]').evaluate(node => (node as HTMLElement).style.minBlockSize);
  await expect.poll(allocation).not.toBe('');
  await enlarge(page);
  await expect.poll(allocation).toBe('');
  await control.selectOption('ready'); await control.selectOption('retained-error');
  await expect.poll(allocation).not.toBe('');
  await page.setViewportSize({ width: 720, height: 1500 });
  await expect.poll(allocation).toBe('');
  await expect(page.getByRole('button', { name: /^Copy / })).toHaveCount(0);
  await control.selectOption('ready');
  await expect(page.getByRole('button', { name: /^Copy T1 / })).toBeVisible();
});
