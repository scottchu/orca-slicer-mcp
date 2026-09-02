import { expect, test, type Page } from '@playwright/test';

const enlarge = (page: Page) => page.evaluate(() => {
  document.documentElement.style.fontSize = '200%';
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
    const visit = (item: CSSRule): void => {
      if ('cssRules' in item) for (const child of (item as CSSGroupingRule).cssRules) visit(child);
      if (!(item instanceof CSSStyleRule)) return;
      const size = item.style.getPropertyValue('font-size');
      if (size) item.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    }; visit(rule);
  }
});
const geometry = (page: Page) => page.locator('[data-widget-shell],[data-chart-frame],[data-height-legend],.chart-content').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height };
}));
const inspect = async (page: Page, enlarged: boolean) => {
  // ResizeObserver and Svelte label updates settle after the changed layout.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const result = await page.locator('[data-chart-frame]').evaluate((frame) => {
    const chart = frame.getBoundingClientRect(); const legend = frame.querySelector('[data-height-legend]')!; const legendBox = legend.getBoundingClientRect(); const content = frame.querySelector('.chart-content')!.getBoundingClientRect();
    const text = [...legend.querySelectorAll('.legend-title,.endpoint')].map((node) => {
      const box = node.getBoundingClientRect(), range = document.createRange(); range.selectNodeContents(node); const glyph = range.getBoundingClientRect();
      return { text: node.textContent, font: Number.parseFloat(getComputedStyle(node).fontSize), box: box.toJSON(), glyph: glyph.toJSON() };
    });
    const labels = [...frame.querySelectorAll('[data-axis-label]')].map((node) => ({ text: node.textContent, box: node.getBoundingClientRect().toJSON() }));
    return { chart: chart.toJSON(), legend: legendBox.toJSON(), content: content.toJSON(), text, labels };
  });
  expect(result.chart.width / result.chart.height).toBeCloseTo(4 / 3, 2);
  expect(result.legend.x).toBeGreaterThanOrEqual(result.chart.x); expect(result.legend.x - result.chart.x).toBeLessThanOrEqual(6);
  expect(result.content.x - result.chart.x).toBeLessThanOrEqual(16); expect(result.legend.top).toBeGreaterThanOrEqual(result.chart.top); expect(result.legend.bottom).toBeLessThanOrEqual(result.chart.bottom);
  for (const value of result.text) {
    expect(value.font).toBeGreaterThanOrEqual(enlarged ? 24 : 12);
    if (!value.text?.trim()) continue;
    expect(value.glyph.left, value.text!).toBeGreaterThanOrEqual(result.legend.left - 1); expect(value.glyph.right, value.text!).toBeLessThanOrEqual(result.legend.right + 1);
    expect(value.glyph.top).toBeGreaterThanOrEqual(result.chart.top); expect(value.glyph.bottom).toBeLessThanOrEqual(result.chart.bottom);
  }
  expect(result.text).toHaveLength(1); expect(result.text[0].text).toBe('Z (mm)');
  for (const label of result.labels) {
    expect(label.box.left, label.text!).toBeGreaterThanOrEqual(result.content.left - 1); expect(label.box.right, label.text!).toBeLessThanOrEqual(result.content.right + 1);
    expect(label.box.top).toBeGreaterThanOrEqual(result.content.top - 1); expect(label.box.bottom).toBeLessThanOrEqual(result.content.bottom + 1);
    for (const value of result.text) {
      const overlap = Math.max(0, Math.min(label.box.right, value.box.right) - Math.max(label.box.left, value.box.left)) * Math.max(0, Math.min(label.box.bottom, value.box.bottom) - Math.max(label.box.top, value.box.top));
      expect(overlap, `${label.text}/${value.text}`).toBe(0);
    }
  }
};

const gradientSamples = async (page: Page) => {
  const png = (await page.locator('[data-height-legend] .gradient').screenshot()).toString('base64');
  return page.evaluate(async (png) => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    return [4, Math.floor(image.height / 2), image.height - 5].map((y) => [...context.getImageData(Math.floor(image.width / 2), y, 1, 1).data].slice(0, 3));
  }, png);
};
const closeColor = (actual: number[], expected: number[]) => actual.forEach((channel, index) => expect(Math.abs(channel - expected[index])).toBeLessThanOrEqual(12));

const clearSurfaceBehindLegend = async (page: Page) => {
  const canvas = page.locator('[data-chart-frame] canvas');
  const bounds = (await canvas.boundingBox())!;
  const text = await page.locator('[data-chart-obstacle]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  // Hide only the legend paint for this probe; the reserved DOM boxes and
  // projection remain unchanged. The screenshot then reveals any covered mesh.
  await page.locator('[data-height-legend]').evaluate((node) => (node as HTMLElement).style.visibility = 'hidden');
  const png = (await canvas.screenshot()).toString('base64');
  await page.locator('[data-height-legend]').evaluate((node) => (node as HTMLElement).style.removeProperty('visibility'));
  const covered = await page.evaluate(async ({ png, bounds, text }) => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const probe = document.createElement('canvas'); probe.width = image.width; probe.height = image.height;
    const context = probe.getContext('2d')!; context.drawImage(image, 0, 0); const rgba = context.getImageData(0, 0, image.width, image.height).data;
    const sx = image.width / bounds.width, sy = image.height / bounds.height;
    let covered = 0;
    for (const box of text) for (let y = Math.max(0, Math.ceil((box.top - bounds.y) * sy)); y < Math.min(image.height, Math.floor((box.bottom - bounds.y) * sy)); y++) {
      for (let x = Math.max(0, Math.ceil((box.left - bounds.x) * sx)); x < Math.min(image.width, Math.floor((box.right - bounds.x) * sx)); x++) {
        const i = (y * image.width + x) * 4;
        if (Math.max(rgba[i], rgba[i + 1], rgba[i + 2]) - Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) > 35) covered++;
      }
    }
    return covered;
  }, { png, bounds, text });
  expect(covered, 'mesh pixels must not hide behind legend text at 1x').toBe(0);
};

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) test(`left in-chart Z legend preserves modes, state and fit ${width} enlarged=${enlarged}`, async ({ page }) => {
  test.setTimeout(45_000); await page.setViewportSize({ width, height: 1500 }); const calls: string[] = [], errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message)); page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) calls.push(request.url()); });
  await page.addInitScript(() => { Object.defineProperty(window, 'fetch', { value: () => { throw new Error('Legend lab must not fetch'); }, configurable: true }); });
  await page.goto('/dashboard/lab/bed_mesh'); await expect(page.locator('[data-bed-mesh-3d] canvas')).toBeVisible(); if (enlarged) await enlarge(page);
  await expect(page.locator('[data-height-legend]')).toHaveAttribute('data-orientation', 'vertical'); await expect(page.locator('.legend-bar,.legend-values')).toHaveCount(0);
  await expect(page.locator('[data-height-legend] .endpoint,[data-height-legend] [title]')).toHaveCount(0);
  await expect(page.locator('[data-height-legend] .gradient')).toHaveCSS('width', '6px');
  await inspect(page, enlarged); const before = await geometry(page);
  await page.screenshot({ path: test.info().outputPath('vertical-legend-3d.png'), fullPage: true });
  for (const scenario of ['flat', 'tilted', 'warped']) {
    await page.getByLabel('Scenario', { exact: true }).selectOption(scenario); await inspect(page, enlarged); await clearSurfaceBehindLegend(page); expect(await geometry(page)).toEqual(before);
    const colors = await gradientSamples(page);
    if (scenario === 'flat') {
      colors.forEach((color) => closeColor(color, [69, 209, 111]));
      await expect(page.locator('[data-chart-frame]')).toHaveAccessibleDescription('Z height in millimetres; top 0, bottom 0');
    } else { closeColor(colors[0], [230, 164, 59]); closeColor(colors[2], [67, 97, 197]); }
  }
  await page.getByRole('button', { name: 'Show 2D bed mesh' }).click(); await expect(page.locator('[data-bed-mesh-2d]')).toBeVisible(); await inspect(page, enlarged); await clearSurfaceBehindLegend(page); expect(await geometry(page)).toEqual(before);
  await page.screenshot({ path: test.info().outputPath('vertical-legend-2d.png'), fullPage: true });
  await page.getByLabel('Preview state', { exact: true }).selectOption('refreshing'); expect(await geometry(page)).toEqual(before);
  await page.getByLabel('Preview state', { exact: true }).selectOption('loading'); await expect(page.locator('canvas,[data-widget-shell] button')).toHaveCount(0); const loading = await geometry(page);
  expect(loading.length).toBe(before.length); for (let index = 0; index < before.length; index++) for (const field of ['x','y','width','height'] as const) expect(Math.abs(loading[index][field] - before[index][field])).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-height-legend] [data-skeleton],.endpoint')).toHaveCount(0); await inspect(page, enlarged);
  (await gradientSamples(page)).forEach((color) => closeColor(color, [231, 233, 236]));
  await expect(page.locator('[data-chart-frame]')).toHaveAccessibleDescription('Z height in millimetres; range unavailable');
  await page.getByLabel('Preview state', { exact: true }).selectOption('ready'); await page.getByRole('button', { name: 'Show 3D bed mesh' }).click(); await inspect(page, enlarged); expect(await geometry(page)).toEqual(before);
  const normal = (await page.locator('[data-surface-projection]').boundingBox())!;
  await page.locator('[data-bed-mesh-3d] canvas').hover(); await page.mouse.wheel(0, -600); await expect.poll(async () => (await page.locator('[data-surface-projection]').boundingBox())!.width).toBeGreaterThan(normal.width * 1.2);
  expect(await geometry(page)).toEqual(before); await page.getByRole('button', { name: 'Reset bed mesh view' }).click(); await inspect(page, enlarged);
  await page.setViewportSize({ width: width + 20, height: 1500 }); await inspect(page, enlarged); await page.setViewportSize({ width, height: 1500 }); await inspect(page, enlarged);
  expect(await geometry(page)).toEqual(before); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width); expect(calls).toEqual([]); expect(errors).toEqual([]);
});
