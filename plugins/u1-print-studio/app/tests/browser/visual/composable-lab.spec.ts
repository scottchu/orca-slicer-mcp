import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const selectScenario = async (page: Page, scenario: string) => {
  await page.getByLabel('Evidence scenario').selectOption(scenario);
  await expect(page.locator('[data-value-state]').first()).toHaveAttribute('data-value-state', scenario === 'loading' ? 'loading' : scenario === 'error' ? 'unavailable' : 'known');
};

for (const width of [320, 720]) {
  test(`private composition lab is stable and reviewable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    const errors: string[] = [];
    const nonlocal: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4183') nonlocal.push(request.url()); });
    const response = await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    expect((await response?.allHeaders())?.['content-security-policy']).toContain("default-src 'none'");
    await expect(page).toHaveTitle('Composable UI experiment');
    await expect(page.getByRole('heading', { name: 'Entity-bound composition lab' })).toBeVisible();
    const card = page.getByRole('article', { name: 'Tool head T1' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Unknown');
    await expect(page.getByText('Synthetic, read-only software evidence.')).toBeVisible();

    await selectScenario(page, 'ambiguous');
    await expect(card.getByText('Unknown')).toBeVisible();
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab/composition-ambiguous-720px.png', fullPage: true });

    await selectScenario(page, 'loading');
    const loading = await card.boundingBox();
    await expect(card.locator('[data-skeleton]')).toHaveCount(4);
    await expect(card).toHaveAttribute('aria-busy', 'true');
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab/composition-loading-720px.png', fullPage: true });
    await selectScenario(page, 'partial');
    await expect(card).toContainText('Active');
    await expect(card).toContainText('#E89B3C');
    await expect(card.locator('[data-skeleton]')).toHaveCount(1);
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab/composition-partial-720px.png', fullPage: true });
    await selectScenario(page, 'error');
    const failed = await card.boundingBox();
    await expect(card.locator('[data-skeleton]')).toHaveCount(4);
    await expect(card).toHaveAttribute('aria-busy', 'false');
    expect(Math.abs((loading?.height ?? 0) - (failed?.height ?? 0))).toBeLessThanOrEqual(1);
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab/composition-error-720px.png', fullPage: true });

    await selectScenario(page, 'known');
    await expect(card).toContainText('Part cooling');
    await expect(card).not.toContainText('Part cooling fan');
    await expect(card).toContainText('Actual / target');
    await expect(card).toContainText('Configured filament color');
    await expect(page.locator('pre').first()).toContainText('"schemaVersion": 1');
    await expect(page.locator('pre').first()).not.toContainText('<script>');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:20:00.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:19:45.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:19:30.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('resolvedTree');
    expect(errors).toEqual([]);
    expect(nonlocal).toEqual([]);
    expect((await page.request.get('/dashboard/composition')).status()).toBe(404);
    expect(await (await page.request.get('/dashboard')).text()).not.toContain('/dashboard/lab/composition');
    await page.screenshot({ path: `test-results/composable-lab/composition-known-${width}px.png`, fullPage: true });
  });

  test(`all composition shapes preserve state geometry and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    const stage = page.getByRole('region', { name: 'Rendered composition' });
    for (const variant of ['card', 'leaves', 'larger']) {
      await page.getByLabel('Composition shape').selectOption(variant);
      const heights: number[] = [];
      let expectedTopology: string[] | null = null;
      for (const scenario of ['known', 'loading', 'error', 'partial']) {
        await selectScenario(page, scenario);
        const renderer = stage.locator(':scope > div').first();
        const box = await renderer.boundingBox();
        if (!box) throw new Error('Missing rendered composition');
        heights.push(box.height);
        const topology = await renderer.locator('[data-node-kind], [data-domain-reading], [data-presentation-status]').evaluateAll((nodes) => nodes.map((node) => node.hasAttribute('data-domain-reading') ? 'DomainReading' : node.hasAttribute('data-presentation-status') ? 'StatusLine' : node.getAttribute('data-node-kind') ?? ''));
        if (expectedTopology === null) expectedTopology = topology;
        else expect(topology).toEqual(expectedTopology);
        if (scenario === 'loading') expect(await renderer.locator('[data-skeleton]:not([data-skeleton-static])').count()).toBeGreaterThan(0);
        if (scenario === 'error') {
          expect(await renderer.locator('[data-skeleton-static]').count()).toBeGreaterThan(0);
          expect(await renderer.locator('[data-skeleton]:not([data-skeleton-static])').count()).toBe(0);
          expect(await renderer.locator('[data-skeleton-static]').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
        }
      }
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    }

    await page.getByLabel('Composition shape').selectOption('card');
    await selectScenario(page, 'known');
    await expect(stage.locator('[role="row"]')).toHaveCount(0);
    await expect(stage.locator('[role="cell"]')).toHaveCount(0);
    for (const reading of await stage.locator('[data-domain-reading]').all()) {
      const children = reading.locator(':scope > *');
      expect(await children.count()).toBe(2);
      const icon = await children.nth(0).boundingBox();
      const content = await children.nth(1).boundingBox();
      expect((icon?.x ?? 0) + (icon?.width ?? 0)).toBeLessThanOrEqual((content?.x ?? 0) + 1);
    }

    const metric = stage.locator('[data-node-kind="Metric"] .value').first();
    const baseSize = Number.parseFloat(await metric.evaluate((element) => getComputedStyle(element).fontSize));
    await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
    const scaledSize = Number.parseFloat(await metric.evaluate((element) => getComputedStyle(element).fontSize));
    expect(scaledSize).toBeGreaterThanOrEqual(baseSize * 1.99);

    const select = page.getByLabel('Evidence scenario');
    await select.focus();
    const focus = await select.evaluate((element) => ({ color: getComputedStyle(element).outlineColor, width: getComputedStyle(element).outlineWidth }));
    expect(focus.width).toBe('3px');
    const channels = focus.color.match(/\d+/gu)?.slice(0, 3).map(Number) ?? [];
    const luminance = (channel: number) => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
    const relative = .2126 * luminance(channels[0]) + .7152 * luminance(channels[1]) + .0722 * luminance(channels[2]);
    expect(1.05 / (relative + .05)).toBeGreaterThanOrEqual(3);
  });
}
