import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const selectScenario = async (page: Page, scenario: string) => {
  await page.getByLabel('Evidence scenario').selectOption(scenario);
  await expect(page.locator('[data-value-state]').first()).toHaveAttribute('data-value-state', scenario === 'loading' ? 'loading' : scenario === 'error' ? 'unavailable' : 'known');
};

const assertPercentageAnatomy = async (stage: Locator) => {
  const percentage = stage.locator('[data-percentage-background]');
  const temperatureReading = percentage.locator('xpath=ancestor::*[@data-domain-reading]');
  const temperatureChildren = temperatureReading.locator(':scope > *');
  expect(await temperatureChildren.count()).toBe(2);
  expect(await percentage.evaluate((element) => element.parentElement === element.closest('[data-domain-reading]')?.children[1])).toBe(true);
  const percentageBox = await percentage.boundingBox();
  const temperatureIconBox = await temperatureChildren.nth(0).boundingBox();
  const temperatureContentBox = await temperatureChildren.nth(1).boundingBox();
  const temperatureLabelBox = await percentage.locator('[data-node-kind="Metric"] .label').boundingBox();
  const temperatureReadingBox = await temperatureReading.boundingBox();
  expect(Math.abs((percentageBox?.x ?? 0) - (temperatureContentBox?.x ?? 0))).toBeLessThanOrEqual(1);
  expect(Math.abs((percentageBox?.width ?? 0) - (temperatureContentBox?.width ?? 0))).toBeLessThanOrEqual(1);
  expect((percentageBox?.x ?? 0) - ((temperatureIconBox?.x ?? 0) + (temperatureIconBox?.width ?? 0))).toBeGreaterThanOrEqual(8);
  expect(Math.abs((temperatureLabelBox?.x ?? 0) - (percentageBox?.x ?? 0) - 12)).toBeLessThanOrEqual(1);
  expect((percentageBox?.y ?? 0) - (temperatureReadingBox?.y ?? 0)).toBeGreaterThanOrEqual(7);
  expect((temperatureReadingBox?.y ?? 0) + (temperatureReadingBox?.height ?? 0) - ((percentageBox?.y ?? 0) + (percentageBox?.height ?? 0))).toBeGreaterThanOrEqual(7);
  expect((percentageBox?.x ?? 0) + (percentageBox?.width ?? 0)).toBeLessThanOrEqual((temperatureReadingBox?.x ?? 0) + (temperatureReadingBox?.width ?? 0) + 1);
  const labelOffsets = await stage.locator('[data-domain-reading]').evaluateAll((readings) => readings.map((reading) => {
    const label = reading.querySelector('.label');
    if (!label) return null;
    return label.getBoundingClientRect().x - reading.getBoundingClientRect().x;
  }).filter((offset): offset is number => offset !== null));
  expect(Math.max(...labelOffsets) - Math.min(...labelOffsets)).toBeLessThanOrEqual(1);
};

for (const width of [320, 390, 720]) {
  test(`private composition lab is stable and reviewable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    const errors: string[] = [];
    const nonlocal: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4184') nonlocal.push(request.url()); });
    const response = await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    expect((await response?.allHeaders())?.['content-security-policy']).toContain("default-src 'none'");
    await expect(page).toHaveTitle('Composable UI experiment');
    await expect(page.getByRole('heading', { name: 'Entity-bound composition lab v2' })).toBeVisible();
    const card = page.getByRole('article', { name: 'Tool head T1' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Unknown');
    await expect(page.getByText('Synthetic, read-only software evidence.')).toBeVisible();

    await selectScenario(page, 'ambiguous');
    await expect(card.getByText('Unknown')).toBeVisible();
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab-v2/composition-ambiguous-720px.png', fullPage: true });

    await selectScenario(page, 'loading');
    const loading = await card.boundingBox();
    await expect(card.locator('[data-skeleton]')).toHaveCount(4);
    await expect(card).toHaveAttribute('aria-busy', 'true');
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab-v2/composition-loading-720px.png', fullPage: true });
    await selectScenario(page, 'partial');
    await expect(card).toContainText('Active');
    await expect(card).toContainText('#E89B3C');
    await expect(card.locator('[data-skeleton]')).toHaveCount(1);
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab-v2/composition-partial-720px.png', fullPage: true });
    await selectScenario(page, 'error');
    const failed = await card.boundingBox();
    await expect(card.locator('[data-skeleton]')).toHaveCount(4);
    await expect(card).toHaveAttribute('aria-busy', 'false');
    expect(Math.abs((loading?.height ?? 0) - (failed?.height ?? 0))).toBeLessThanOrEqual(1);
    if (width === 720) await page.screenshot({ path: 'test-results/composable-lab-v2/composition-error-720px.png', fullPage: true });

    await selectScenario(page, 'known');
    await expect(card).toContainText('Part cooling');
    await expect(card).not.toContainText('Part cooling fan');
    await expect(card).toContainText('Actual / target');
    await expect(card).toContainText('Configured filament color');
    await expect(page.locator('pre').first()).toContainText('"schemaVersion": 2');
    await expect(page.locator('pre').first()).toContainText('"type": "Stack"');
    await expect(page.locator('pre').first()).toContainText('"type": "PercentageFill"');
    await expect(page.locator('pre').first()).not.toContainText('"type": "Table"');
    await expect(page.locator('pre').first()).not.toContainText('"type": "Row"');
    await expect(page.locator('pre').first()).not.toContainText('<script>');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:20:00.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:19:45.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('2026-09-03T16:19:30.000Z');
    await expect(page.locator('pre').nth(1)).toContainText('resolvedTree');
    expect(errors).toEqual([]);
    expect(nonlocal).toEqual([]);
    expect((await page.request.get('/dashboard/composition')).status()).toBe(404);
    expect(await (await page.request.get('/dashboard')).text()).not.toContain('/dashboard/lab/composition');
    await page.screenshot({ path: `test-results/composable-lab-v2/composition-known-${width}px.png`, fullPage: true });
  });

  test(`all composition shapes preserve state geometry and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    const stage = page.getByRole('region', { name: 'Rendered composition' });
    const assertStateGeometry = async (textPercent: 100 | 200) => {
      for (const variant of ['card', 'compact', 'larger']) {
        await page.getByLabel('Composition shape').selectOption(variant);
        const heights: number[] = [];
        let expectedTopology: string[] | null = null;
        for (const scenario of ['known', 'loading', 'error', 'partial', 'ambiguous']) {
          await selectScenario(page, scenario);
          const renderer = stage.locator(':scope > div').first();
          const box = await renderer.boundingBox();
          if (!box) throw new Error('Missing rendered composition');
          heights.push(box.height);
          const topology = await renderer.locator('[data-node-kind], [data-percentage-background], [data-domain-reading], [data-presentation-status]').evaluateAll((nodes) => nodes.map((node) => node.hasAttribute('data-percentage-background') ? 'PercentageFill' : node.hasAttribute('data-domain-reading') ? 'DomainReading' : node.hasAttribute('data-presentation-status') ? 'StatusLine' : node.getAttribute('data-node-kind') ?? ''));
          if (expectedTopology === null) expectedTopology = topology;
          else expect(topology).toEqual(expectedTopology);
          if (scenario === 'loading') {
            const animated = renderer.locator('[data-skeleton]:not([data-skeleton-static])');
            expect(await animated.count()).toBeGreaterThan(0);
            expect(await animated.evaluateAll((nodes) => nodes.every((node) => {
              const box = node.getBoundingClientRect();
              return box.width > 0 && box.height > 0;
            }))).toBe(true);
          }
          if (scenario === 'error') {
            expect(await renderer.locator('[data-skeleton-static]').count()).toBeGreaterThan(0);
            expect(await renderer.locator('[data-skeleton]:not([data-skeleton-static])').count()).toBe(0);
            expect(await renderer.locator('[data-skeleton-static]').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
          }
          if (width === 720 && textPercent === 200 && variant === 'larger') {
            await page.screenshot({ path: `test-results/composable-lab-v2/composition-larger-${scenario}-720px-200-percent.png`, fullPage: true });
          }
        }
        expect(Math.max(...heights) - Math.min(...heights), `${variant} at ${textPercent}% text: ${heights.join(', ')}`).toBeLessThanOrEqual(1);
      }
    };
    await assertStateGeometry(100);

    await page.getByLabel('Composition shape').selectOption('card');
    await selectScenario(page, 'known');
    await expect(stage.locator('[role="row"]')).toHaveCount(0);
    await expect(stage.locator('[role="cell"]')).toHaveCount(0);
    await expect(stage.locator('[data-node-kind="Table"], [data-node-kind="Row"]')).toHaveCount(0);
    expect(await stage.locator('article').evaluate((element) => getComputedStyle(element).borderStyle)).toBe('solid');
    expect(await stage.locator('[data-node-kind="Title"]').evaluate((element) => getComputedStyle(element).borderBottomWidth)).toBe('0px');
    for (const selector of ['[data-node-kind="Stack"]', '[data-domain-reading]']) {
      expect(await stage.locator(selector).first().evaluate((element) => [getComputedStyle(element).borderTopWidth, getComputedStyle(element).borderBottomWidth])).toEqual(['0px', '0px']);
    }
    expect(Number(await stage.locator('[data-percentage-background]').getAttribute('data-percentage-fill'))).toBeGreaterThan(0);
    await assertPercentageAnatomy(stage);
    for (const reading of await stage.locator('[data-domain-reading]').all()) {
      const children = reading.locator(':scope > *');
      expect(await children.count()).toBe(2);
      const icon = await children.nth(0).boundingBox();
      const content = await children.nth(1).boundingBox();
      expect((icon?.x ?? 0) + (icon?.width ?? 0)).toBeLessThanOrEqual((content?.x ?? 0) + 1);
    }

    const metric = stage.locator('[data-node-kind="Metric"] .value').first();
    const baseSize = Number.parseFloat(await metric.evaluate((element) => getComputedStyle(element).fontSize));
    const textScale = await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
    await assertStateGeometry(200);
    await page.getByLabel('Composition shape').selectOption('larger');
    await selectScenario(page, 'known');
    await assertPercentageAnatomy(stage);
    const scaledSize = Number.parseFloat(await metric.evaluate((element) => getComputedStyle(element).fontSize));
    expect(scaledSize).toBeGreaterThanOrEqual(baseSize * 1.99);
    expect(await stage.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const temperatureValue = stage.locator('[data-node-kind="Metric"] .current').filter({ hasText: '214.6°' });
    expect(await temperatureValue.evaluate((element) => {
      const text = element.textContent ?? '';
      const start = text.lastIndexOf('220°');
      const node = element.firstChild;
      if (!(node instanceof Text) || start < 0) return false;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, text.length);
      return range.getClientRects().length === 1 && text.endsWith('220°\u00a0C');
    })).toBe(true);
    const pageHeadingSize = Number.parseFloat(await page.getByRole('heading', { level: 1 }).evaluate((element) => getComputedStyle(element).fontSize));
    const cardHeadingSize = Number.parseFloat(await stage.getByRole('heading', { level: 2 }).evaluate((element) => getComputedStyle(element).fontSize));
    expect(pageHeadingSize).toBeGreaterThan(cardHeadingSize);
    await page.getByLabel('Composition shape').selectOption('card');
    await selectScenario(page, 'known');
    await page.screenshot({ path: `test-results/composable-lab-v2/composition-known-${width}px-200-percent.png`, fullPage: true });
    await textScale.evaluate((element) => element.parentNode?.removeChild(element));

    const select = page.getByLabel('Evidence scenario');
    await select.focus();
    const focus = await select.evaluate((element) => ({ color: getComputedStyle(element).outlineColor, width: getComputedStyle(element).outlineWidth }));
    expect(focus.width).toBe('3px');
    const channels = focus.color.match(/\d+/gu)?.slice(0, 3).map(Number) ?? [];
    const luminance = (channel: number) => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
    const relative = .2126 * luminance(channels[0]) + .7152 * luminance(channels[1]) + .0722 * luminance(channels[2]);
    expect(1.05 / (relative + .05)).toBeGreaterThanOrEqual(3);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await selectScenario(page, 'loading');
    expect(await stage.locator('[data-skeleton]').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
    expect(await stage.locator('[data-percentage-background]').evaluate((element) => getComputedStyle(element).backgroundImage)).toBe('none');
    await selectScenario(page, 'error');
    expect(await stage.locator('[data-percentage-background]').evaluate((element) => getComputedStyle(element).backgroundImage)).toBe('none');
    await selectScenario(page, 'partial');
    expect(Number(await stage.locator('[data-percentage-background]').getAttribute('data-percentage-fill'))).toBeGreaterThan(0);
    await selectScenario(page, 'ambiguous');
    expect(Number(await stage.locator('[data-percentage-background]').getAttribute('data-percentage-fill'))).toBeGreaterThan(0);
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await selectScenario(page, 'known');
    expect(await stage.locator('[data-percentage-background]').evaluate((element) => getComputedStyle(element).backgroundImage)).toBe('none');
    expect(await stage.locator('article').evaluate((element) => getComputedStyle(element).borderStyle)).toBe('solid');
  });
}
