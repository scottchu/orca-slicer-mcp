import { scaleRootText } from '../helpers/text-scale';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const selectScenario = async (page: Page, scenario: string) => {
  await page.getByLabel('Evidence scenario').selectOption(scenario);
  await expect(page.locator('[data-value-state]').first()).toHaveAttribute('data-value-state', scenario === 'loading' ? 'loading' : scenario === 'error' ? 'unavailable' : 'known');
};

const assertReadingAnatomy = async (stage: Locator) => {
  const labelOffsets = await stage.locator('[data-domain-reading]').evaluateAll((readings) => readings.map((reading) => {
    const label = reading.querySelector('.label');
    if (!label) return null;
    return label.getBoundingClientRect().x - reading.getBoundingClientRect().x;
  }).filter((offset): offset is number => offset !== null));
  expect(Math.max(...labelOffsets) - Math.min(...labelOffsets)).toBeLessThanOrEqual(1);
  const centerDeltas = await stage.locator('[data-domain-reading]').evaluateAll((readings) => readings.map((reading) => {
    const icon = reading.children[0]?.getBoundingClientRect();
    const label = reading.querySelector('.label')?.getBoundingClientRect();
    const value = reading.querySelector('.current, [data-skeleton]')?.getBoundingClientRect();
    if (!icon || !label || !value) return Number.POSITIVE_INFINITY;
    const visibleCenter = (Math.min(label.top, value.top) + Math.max(label.bottom, value.bottom)) / 2;
    return Math.abs(visibleCenter - (icon.top + icon.height / 2));
  }));
  expect(Math.max(...centerDeltas)).toBeLessThanOrEqual(1);
};

const assertGroupedLayoutGeometry = async (card: Locator, width: 320 | 390 | 720, textPercent: 100 | 200) => {
  // Exact dimensions belong to this T1 regression, not every future widget.
  const dimensions = await card.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      groupGap: Number.parseFloat(style.getPropertyValue('--u1-group-gap')),
      iconTrack: Number.parseFloat(style.getPropertyValue('--u1-reading-icon-track')),
      iconGap: Number.parseFloat(style.getPropertyValue('--u1-reading-icon-gap')),
      copyGap: Number.parseFloat(style.getPropertyValue('--u1-reading-copy-gap-compact')),
    };
  });
  expect(dimensions).toEqual({ groupGap: 20, iconTrack: 32, iconGap: 8, copyGap: 4 });
  expect(await card.locator('[data-domain-reading]').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).minHeight))).toEqual(['104px', '64px', '64px']);
  const summary = card.locator('[data-group-relation="summary"]');
  const rows = summary.locator(':scope > [data-node-kind="Row"]');
  const heroReading = rows.nth(0).locator('[data-domain-reading]');
  const supportColumns = rows.nth(1).locator(':scope > [data-node-kind="Column"]');
  const supportReadings = supportColumns.locator(':scope > [data-domain-reading]');
  const [heroIconX, heroContentX, supportIconXs, supportContentXs, rowBoxes, columnBoxes, readingBoxes, readingAnatomy] = await Promise.all([
    heroReading.locator(':scope > .icon-frame').evaluate((element) => element.getBoundingClientRect().x),
    heroReading.locator(':scope > .content').evaluate((element) => element.getBoundingClientRect().x),
    supportReadings.locator(':scope > .icon-frame').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x)),
    supportReadings.locator(':scope > .content').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x)),
    rows.evaluateAll((nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    })),
    supportColumns.evaluateAll((nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    })),
    supportReadings.evaluateAll((nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    })),
    card.locator('[data-domain-reading]').evaluateAll((nodes) => nodes.map((node) => {
      const reading = node.getBoundingClientRect();
      const iconFrame = node.querySelector(':scope > .icon-frame')?.getBoundingClientRect();
      const glyph = node.querySelector(':scope > .icon-frame svg')?.getBoundingClientRect();
      const content = node.querySelector(':scope > .content')?.getBoundingClientRect();
      const label = node.querySelector(':scope > .content .label')?.getBoundingClientRect();
      const value = node.querySelector(':scope > .content .value-frame')?.getBoundingClientRect();
      if (!iconFrame || !glyph || !content || !label || !value) return null;
      return {
        contentOffset: content.x - reading.x,
        frameOffset: iconFrame.x - reading.x,
        frameWidth: iconFrame.width,
        glyphWidth: glyph.width,
        glyphToCopy: content.x - (glyph.x + glyph.width),
        labelToValue: value.y - (label.y + label.height),
      };
    })),
  ]);
  expect(Math.abs(supportIconXs[0] - heroIconX)).toBeLessThanOrEqual(1);
  expect(Math.abs(supportContentXs[0] - heroContentX)).toBeLessThanOrEqual(1);
  expect(columnBoxes).toHaveLength(2);
  expect(readingBoxes).toHaveLength(2);
  expect(rowBoxes).toHaveLength(2);
  expect(Math.abs(rowBoxes[1].y - (rowBoxes[0].y + rowBoxes[0].height) - dimensions.groupGap)).toBeLessThanOrEqual(1);
  if (readingAnatomy.some((anatomy) => anatomy === null)) throw new Error('Missing grouped reading anatomy');
  expect(readingAnatomy).toHaveLength(3);
  for (const anatomy of readingAnatomy as Array<{ contentOffset: number; frameOffset: number; frameWidth: number; glyphWidth: number; glyphToCopy: number; labelToValue: number }>) {
    expect(Math.abs(anatomy.contentOffset - (dimensions.iconTrack + dimensions.iconGap))).toBeLessThanOrEqual(1);
    expect(Math.abs(anatomy.frameOffset)).toBeLessThanOrEqual(1);
    expect(Math.abs(anatomy.frameWidth - dimensions.iconTrack)).toBeLessThanOrEqual(1);
    expect(anatomy.labelToValue).toBeGreaterThanOrEqual(dimensions.copyGap - 2);
    expect(anatomy.labelToValue).toBeLessThanOrEqual(dimensions.copyGap);
  }
  const anatomy = readingAnatomy as Array<{ glyphWidth: number; glyphToCopy: number }>;
  expect(anatomy.map((item) => item.glyphWidth)).toEqual([32, 24, 24]);
  expect(anatomy.map((item) => Math.round(item.glyphToCopy))).toEqual(anatomy.map((item) => dimensions.iconGap + (dimensions.iconTrack - item.glyphWidth) / 2));
  expect(Math.max(...anatomy.map((item) => item.glyphToCopy))).toBeLessThan(dimensions.groupGap);

  const stacked = width === 320 || textPercent === 200;
  if (stacked) {
    expect(Math.abs(columnBoxes[0].y - columnBoxes[1].y)).toBeGreaterThan(1);
    expect(Math.abs(readingBoxes[0].y - readingBoxes[1].y)).toBeGreaterThan(1);
    for (let index = 0; index < 2; index += 1) {
      expect(Math.abs(columnBoxes[index].height - readingBoxes[index].height)).toBeLessThanOrEqual(1);
    }
    expect(Math.abs(readingBoxes[1].y - (readingBoxes[0].y + readingBoxes[0].height) - dimensions.groupGap)).toBeLessThanOrEqual(1);
    return;
  }

  expect(Math.abs(columnBoxes[0].y - columnBoxes[1].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(columnBoxes[0].height - columnBoxes[1].height)).toBeLessThanOrEqual(1);
  expect(Math.abs(readingBoxes[0].y - readingBoxes[1].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(readingBoxes[0].height - readingBoxes[1].height)).toBeLessThanOrEqual(1);
  expect(Math.abs(columnBoxes[0].width - columnBoxes[1].width)).toBeLessThanOrEqual(1);
  expect(Math.abs(columnBoxes[1].x - (columnBoxes[0].x + columnBoxes[0].width) - dimensions.groupGap)).toBeLessThanOrEqual(1);

  if (width === 390 && textPercent === 100) {
    const centers = await supportReadings.evaluateAll((nodes) => nodes.map((node) => {
      const icon = node.querySelector(':scope > .icon-frame')?.getBoundingClientRect();
      const content = node.querySelector(':scope > .content')?.getBoundingClientRect();
      if (!icon || !content) return null;
      return {
        icon: icon.y + icon.height / 2,
        content: content.y + content.height / 2,
      };
    }));
    if (centers.some((center) => center === null)) throw new Error('Missing direct support reading anatomy');
    const [first, second] = centers as Array<{ icon: number; content: number }>;
    expect(Math.abs(first.icon - second.icon)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.content - second.content)).toBeLessThanOrEqual(1);
  }
};

const readTextLineGeometry = async (reading: Locator) => reading.evaluate((node) => {
  const geometry = (selector: string) => {
    const element = node.querySelector(selector);
    if (!element) return null;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const fragments: DOMRect[] = [];
    let textNode = walker.nextNode();
    while (textNode) {
      if (textNode.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        fragments.push(...Array.from(range.getClientRects()));
      }
      textNode = walker.nextNode();
    }
    const lines = fragments.reduce<Array<{ top: number; bottom: number }>>((result, fragment) => {
      const line = result.find((candidate) => Math.abs(candidate.top - fragment.top) <= 1);
      if (line) line.bottom = Math.max(line.bottom, fragment.bottom);
      else result.push({ top: fragment.top, bottom: fragment.bottom });
      return result;
    }, []).sort((left, right) => left.top - right.top);
    return { lineCount: lines.length, firstBaselineProxy: lines[0]?.bottom ?? 0, lastBaselineProxy: lines[lines.length - 1]?.bottom ?? 0 };
  };
  return { label: geometry('.label'), value: geometry('.current') };
});

for (const width of [320, 390, 720] as const) {
  test(`private composition lab is stable and reviewable at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 1200 });
    const errors: string[] = [];
    const nonlocal: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) nonlocal.push(request.url()); });
    const response = await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    expect((await response?.allHeaders())?.['content-security-policy']).toContain("default-src 'none'");
    await expect(page).toHaveTitle('Composable UI experiment');
    await expect(page.getByRole('heading', { name: 'Entity-bound composition lab v2' })).toBeVisible();
    const card = page.getByRole('article', { name: 'Tool head T1' });
    await expect(card).toBeVisible();
    await expect(page.getByLabel('Composition shape')).toHaveValue('smart');
    await expect(card.locator('[data-group-relation="identity"]')).toHaveCount(1);
    await expect(card.locator('[data-group-relation="summary"]')).toHaveCount(1);
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
    await expect(card).toContainText('Configured color');
    await expect(card.locator('[data-node-kind="Swatch"] .label')).toHaveAccessibleName('Configured filament color');
    await page.getByLabel('Composition shape').selectOption('card');
    await expect(card).toContainText('Configured filament color');
    await expect(card.locator('[data-node-kind="Swatch"] .label')).not.toHaveAttribute('aria-label');
    await expect(page.locator('pre').first()).toContainText('"schemaVersion": 2');
    await expect(page.locator('pre').first()).toContainText('"type": "Stack"');
    await expect(page.locator('pre').first()).toContainText('"type": "HeadTemperature"');
    await expect(page.locator('pre').first()).not.toContainText('"type": "PercentageFill"');
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
      for (const variant of ['smart', 'explicit', 'card', 'compact', 'larger', 'balanced']) {
        await page.getByLabel('Composition shape').selectOption(variant);
        const heights: number[] = [];
        let expectedTopology: string[] | null = null;
        for (const scenario of ['known', 'unknown', 'ambiguous', 'loading', 'error', 'partial']) {
          await selectScenario(page, scenario);
          const renderer = stage.locator(':scope > div').first();
          const box = await renderer.boundingBox();
          if (!box) throw new Error('Missing rendered composition');
          heights.push(box.height);
          const topology = await renderer.locator('[data-node-kind], [data-domain-reading], [data-presentation-status]').evaluateAll((nodes) => nodes.map((node) => node.hasAttribute('data-domain-reading') ? 'DomainReading' : node.hasAttribute('data-presentation-status') ? 'StatusLine' : node.getAttribute('data-node-kind') ?? ''));
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
          await assertReadingAnatomy(renderer);
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
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    await assertReadingAnatomy(stage);
    const defaultReadingAnatomy = await stage.locator('[data-reading-appearance="default"]').first().evaluate((node) => {
      const iconFrame = node.querySelector(':scope > .icon-frame');
      const content = node.querySelector(':scope > .content');
      if (!iconFrame || !content) return null;
      return {
        gridColumns: getComputedStyle(node).gridTemplateColumns,
        gap: getComputedStyle(node).columnGap,
        iconWidth: iconFrame.getBoundingClientRect().width,
        contentPaddingLeft: getComputedStyle(content).paddingLeft,
      };
    });
    expect(defaultReadingAnatomy).not.toBeNull();
    expect(defaultReadingAnatomy?.gap).toBe('12px');
    expect(defaultReadingAnatomy?.iconWidth).toBe(44);
    expect(defaultReadingAnatomy?.contentPaddingLeft).toBe('12px');
    expect(defaultReadingAnatomy?.gridColumns.startsWith('44px ')).toBe(true);
    for (const reading of await stage.locator('[data-domain-reading]').all()) {
      const children = reading.locator(':scope > *');
      expect(await children.count()).toBe(2);
      const icon = await children.nth(0).boundingBox();
      const content = await children.nth(1).boundingBox();
      expect((icon?.x ?? 0) + (icon?.width ?? 0)).toBeLessThanOrEqual((content?.x ?? 0) + 1);
    }

    const metric = stage.locator('[data-node-kind="Metric"] .value').first();
    const baseSize = Number.parseFloat(await metric.evaluate((element) => getComputedStyle(element).fontSize));
    const textScale = await scaleRootText(page, 200);
    await assertStateGeometry(200);
    await page.getByLabel('Composition shape').selectOption('larger');
    await selectScenario(page, 'known');
    await assertReadingAnatomy(stage);
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
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    await selectScenario(page, 'error');
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    await selectScenario(page, 'partial');
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    await selectScenario(page, 'ambiguous');
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await selectScenario(page, 'known');
    await expect(stage.locator('[data-percentage-background]')).toHaveCount(0);
    expect(await stage.locator('article').evaluate((element) => getComputedStyle(element).borderStyle)).toBe('solid');
  });

  test(`balanced hierarchy preserves its closed responsive contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1500 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    await page.getByLabel('Composition shape').selectOption('balanced');
    const stage = page.getByRole('region', { name: 'Rendered composition' });
    const card = stage.getByRole('article', { name: 'Tool head T1' });
    const heights: number[] = [];
    let topology: string[] | null = null;
    for (const scenario of ['known', 'unknown', 'ambiguous', 'loading', 'error', 'partial']) {
      await selectScenario(page, scenario);
      const box = await card.boundingBox();
      if (!box) throw new Error('Missing balanced card');
      heights.push(box.height);
      const current = await card.locator('[data-node-kind]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-node-kind') ?? ''));
      if (topology === null) topology = current;
      else expect(current).toEqual(topology);
    }
    expect(topology).toEqual(['Inline', 'Title', 'Badge', 'Grid', 'Metric', 'Swatch', 'Metric']);
    expect(Math.max(...heights) - Math.min(...heights), `balanced 100% heights: ${heights.join(', ')}`).toBeLessThanOrEqual(1);

    await selectScenario(page, 'known');
    const inline = card.locator('[data-node-kind="Inline"]');
    const title = inline.locator('[data-node-kind="Title"]');
    const badge = inline.locator('[data-node-kind="Badge"]');
    const [titleBox, badgeBox] = await Promise.all([title.boundingBox(), badge.boundingBox()]);
    if (!titleBox || !badgeBox) throw new Error('Missing balanced header geometry');
    expect(Math.abs((titleBox.y + titleBox.height / 2) - (badgeBox.y + badgeBox.height / 2))).toBeLessThanOrEqual(1);
    expect(badgeBox.x - (titleBox.x + titleBox.width)).toBeGreaterThanOrEqual(8);
    expect(await inline.locator('[data-domain-reading], svg').count()).toBe(0);
    expect(await card.evaluate((element) => ({ tint: element.classList.contains('tinted'), background: getComputedStyle(element).backgroundImage }))).toEqual({ tint: false, background: 'none' });
    await expect(card.locator('[data-node-kind="Table"], [data-node-kind="Row"], [data-percentage-background]')).toHaveCount(0);
    await expect(card.locator('[data-reading-appearance="hero"]')).toHaveCount(1);
    await expect(card.locator('[data-reading-appearance="quiet"]')).toHaveCount(2);
    const heroSize = Number.parseFloat(await card.locator('[data-reading-appearance="hero"] [data-node-kind="Metric"] .value').evaluate((element) => getComputedStyle(element).fontSize));
    const secondarySize = Number.parseFloat(await card.locator('[data-reading-appearance="quiet"] .value').first().evaluate((element) => getComputedStyle(element).fontSize));
    expect(heroSize / secondarySize).toBeGreaterThanOrEqual(1.3);
    const secondary = await card.locator('[data-reading-appearance="quiet"]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
    if (width === 320) expect(Math.abs(secondary[0] - secondary[1])).toBeGreaterThan(1);
    else expect(Math.abs(secondary[0] - secondary[1])).toBeLessThanOrEqual(1);
    expect(await stage.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

    const temperatureValue = card.locator('[data-node-kind="Metric"] .current').filter({ hasText: '214.6°' });
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

    const textScale = await scaleRootText(page, 200);
    const scaledHeights: number[] = [];
    for (const scenario of ['known', 'unknown', 'ambiguous', 'loading', 'error', 'partial']) {
      await selectScenario(page, scenario);
      const box = await card.boundingBox();
      if (!box) throw new Error('Missing scaled balanced card');
      scaledHeights.push(box.height);
    }
    expect(Math.max(...scaledHeights) - Math.min(...scaledHeights), `balanced 200% heights: ${scaledHeights.join(', ')}`).toBeLessThanOrEqual(1);
    await selectScenario(page, 'known');
    const [scaledTitle, scaledBadge] = await Promise.all([title.boundingBox(), badge.boundingBox()]);
    if (!scaledTitle || !scaledBadge) throw new Error('Missing scaled balanced header geometry');
    if (scaledBadge.y > scaledTitle.y + 1) expect(Math.abs(scaledBadge.x - scaledTitle.x)).toBeLessThanOrEqual(1);
    const scaledSecondary = await card.locator('[data-reading-appearance="quiet"]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
    if (width === 390 || width === 320) expect(Math.abs(scaledSecondary[0] - scaledSecondary[1])).toBeGreaterThan(1);
    expect(await stage.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: 'test-results/composable-lab-v2/composition-balanced-known-390px-200-percent.png', fullPage: true });
    await textScale.evaluate((element) => element.parentNode?.removeChild(element));

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await selectScenario(page, 'loading');
    expect(await card.locator('[data-skeleton]').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
    await selectScenario(page, 'error');
    expect(await card.locator('[data-skeleton-static]').count()).toBe(4);
    expect(await card.locator('[data-skeleton]:not([data-skeleton-static])').count()).toBe(0);
    expect(errors).toEqual([]);
    if (width === 390) {
      await selectScenario(page, 'known');
      await page.evaluate(() => scrollTo(0, 0));
      await card.screenshot({ path: 'test-results/composable-lab-v2/composition-balanced-card-known-390px.png' });
      await page.screenshot({ path: 'test-results/composable-lab-v2/composition-balanced-known-390px.png', fullPage: true });
    }
  });

  test(`smart grouping and explicit six-track override preserve semantic and geometry parity at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1500 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/dashboard/lab/composition', { waitUntil: 'networkidle' });
    const stage = page.getByRole('region', { name: 'Rendered composition' });
    const card = stage.getByRole('article', { name: 'Tool head T1' });
    const geometry: Record<string, Array<{ x: number; y: number; width: number; height: number }>> = {};
    for (const variant of ['smart', 'explicit']) {
      await page.getByLabel('Composition shape').selectOption(variant);
      await selectScenario(page, 'known');
      await expect(card.locator('[data-group-relation="identity"]')).toHaveCount(1);
      await expect(card.locator('[data-group-relation="summary"]')).toHaveCount(1);
      await expect(card.locator('[data-node-kind="Row"]')).toHaveCount(2);
      await expect(card.locator('[data-node-kind="Column"]')).toHaveCount(3);
      expect(await card.locator('[data-node-kind="Column"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-col-span')))).toEqual(['6', '3', '3']);
      const readings = card.locator('[data-domain-reading]');
      expect(await readings.evaluateAll((nodes) => nodes.map((node) => {
        const visible = node.cloneNode(true) as HTMLElement;
        return visible.textContent?.replace(/\s+/gu, ' ').trim();
      }))).toEqual([
        'Actual / target 214.6° / 220° C',
        'Configured color #E89B3C',
        'Fan relation Part cooling',
      ]);
      const filamentLabel = card.locator('[data-node-kind="Swatch"] .label');
      await expect(filamentLabel).toHaveAccessibleName('Configured filament color');
      await expect(filamentLabel).toHaveText('Configured color');
      expect(await filamentLabel.evaluate((element) => {
        const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
        return Math.ceil(element.getBoundingClientRect().height / lineHeight);
      })).toBeLessThanOrEqual(2);
      const identity = card.locator('[data-group-relation="identity"]');
      const title = identity.locator('[data-node-kind="Title"]');
      const badge = identity.locator('[data-node-kind="Badge"]');
      const [titleBox, badgeBox] = await Promise.all([title.boundingBox(), badge.boundingBox()]);
      if (!titleBox || !badgeBox) throw new Error('Missing grouped identity geometry');
      expect(badgeBox.x - (titleBox.x + titleBox.width)).toBeGreaterThanOrEqual(11);
      expect(badgeBox.x - (titleBox.x + titleBox.width)).toBeLessThanOrEqual(13);
      if (width === 390) expect(Math.abs((titleBox.y + titleBox.height / 2) - (badgeBox.y + badgeBox.height / 2))).toBeLessThanOrEqual(1);
      expect(await card.evaluate((element) => ({ tint: element.classList.contains('tinted'), background: getComputedStyle(element).backgroundImage }))).toEqual({ tint: false, background: 'none' });
      await expect(card.locator('[data-node-kind="Table"], [data-percentage-background]')).toHaveCount(0);
      geometry[variant] = await card.locator('[data-node-kind="Row"], [data-node-kind="Column"], [data-domain-reading]').evaluateAll((nodes) => nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }));
      const secondaryY = await card.locator('[data-reading-appearance="quiet"]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
      if (width === 320) expect(Math.abs(secondaryY[0] - secondaryY[1])).toBeGreaterThan(1);
      else expect(Math.abs(secondaryY[0] - secondaryY[1])).toBeLessThanOrEqual(1);
      await assertGroupedLayoutGeometry(card, width, 100);
      if (width === 720) {
        await selectScenario(page, 'unknown');
        const supportReadings = card.locator('[data-group-relation="summary"] > [data-node-kind="Row"]').nth(1).locator('[data-domain-reading]');
        const [filamentLines, fanLines] = await Promise.all([
          readTextLineGeometry(supportReadings.nth(0)),
          readTextLineGeometry(supportReadings.nth(1)),
        ]);
        if (!filamentLines.label || !filamentLines.value || !fanLines.label || !fanLines.value) throw new Error('Missing support reading line geometry');
        expect([filamentLines.label.lineCount, filamentLines.value.lineCount, fanLines.label.lineCount, fanLines.value.lineCount]).toEqual([1, 1, 1, 1]);
        expect(Math.abs(filamentLines.label.firstBaselineProxy - fanLines.label.firstBaselineProxy)).toBeLessThanOrEqual(1);
        expect(Math.abs(filamentLines.value.lastBaselineProxy - fanLines.value.lastBaselineProxy)).toBeLessThanOrEqual(1);
        await selectScenario(page, 'known');
      }
      await page.screenshot({ path: `test-results/composable-lab-v2/composition-${variant}-known-${width}px.png`, fullPage: true });
      if (width === 390) await card.screenshot({ path: `test-results/composable-lab-v2/composition-${variant}-card-known-390px.png` });
    }
    expect(geometry.explicit).toEqual(geometry.smart);

    const textScale = await scaleRootText(page, 200);
    for (const variant of ['smart', 'explicit']) {
      await page.getByLabel('Composition shape').selectOption(variant);
      await selectScenario(page, 'known');
      const secondaryY = await card.locator('[data-reading-appearance="quiet"]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
      if (width === 320 || width === 390) expect(Math.abs(secondaryY[0] - secondaryY[1])).toBeGreaterThan(1);
      await assertGroupedLayoutGeometry(card, width, 200);
      expect(await stage.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      if (width === 390) await page.screenshot({ path: `test-results/composable-lab-v2/composition-${variant}-known-390px-200-percent.png`, fullPage: true });
    }
    await textScale.evaluate((element) => element.parentNode?.removeChild(element));

    await page.getByLabel('Composition shape').selectOption('smart');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    if (width === 390) {
      const stableBounds: Array<{ scenario: string; card: { width: number; height: number }; support: { width: number; height: number } }> = [];
      for (const scenario of ['unknown', 'known', 'ambiguous', 'partial', 'loading', 'error']) {
        await selectScenario(page, scenario);
        const [cardBox, supportBox] = await Promise.all([
          card.boundingBox(),
          card.locator('[data-group-relation="summary"] > [data-node-kind="Row"]').nth(1).boundingBox(),
        ]);
        if (!cardBox || !supportBox) throw new Error(`Missing ${scenario} grouped bounds`);
        stableBounds.push({
          scenario,
          card: { width: cardBox.width, height: cardBox.height },
          support: { width: supportBox.width, height: supportBox.height },
        });
        await assertGroupedLayoutGeometry(card, 390, 100);
        if (['unknown', 'known', 'loading', 'error'].includes(scenario)) {
          await page.screenshot({ path: `test-results/composable-lab-v2/composition-smart-${scenario}-390px.png`, fullPage: true });
        }
      }
      for (const part of ['card', 'support'] as const) {
        const widths = stableBounds.map((bounds) => bounds[part].width);
        const heights = stableBounds.map((bounds) => bounds[part].height);
        expect(Math.max(...widths) - Math.min(...widths), `${part} state widths: ${JSON.stringify(stableBounds)}`).toBeLessThanOrEqual(1);
        expect(Math.max(...heights) - Math.min(...heights), `${part} state heights: ${JSON.stringify(stableBounds)}`).toBeLessThanOrEqual(1);
      }
    } else {
      await selectScenario(page, 'loading');
    }
    expect(await card.locator('[data-skeleton]').first().evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
    await selectScenario(page, 'error');
    expect(await card.locator('[data-skeleton-static]').count()).toBe(4);
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await selectScenario(page, 'known');
    expect(await card.evaluate((element) => getComputedStyle(element).borderStyle)).toBe('solid');
    expect(errors).toEqual([]);
  });
}
