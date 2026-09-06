import { expect, test } from '@playwright/test';
import { scaleRootText } from '../helpers/text-scale';

for (const width of [320, 720]) test(`pending observation Header root text ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 1000 });
  // Direct immutable resource without a host delivery exercises ObservationRoot's
  // pending/failure Header. No observation tool or printer reader is invoked.
  await page.goto('/widget');
  const header = page.locator('[data-widget-header]');
  const title = header.getByRole('heading', { name: 'Printer observation' });
  await expect(title).toBeVisible();
  const normal = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const scale = await scaleRootText(page, 200);
  try {
    await expect(title).toHaveCSS('font-size', `${normal * 2}px`);
    expect(await title.evaluate((element) => {
      const range = document.createRange(); range.selectNodeContents(element);
      return [...range.getClientRects()].every((box) => box.left >= -1 && box.right <= document.documentElement.clientWidth + 1);
    })).toBe(true);
    await header.screenshot({ path: info.outputPath('pending-header-root-200.png') });
  } finally { await scale.evaluate((element) => element.parentNode?.removeChild(element)); }
});
