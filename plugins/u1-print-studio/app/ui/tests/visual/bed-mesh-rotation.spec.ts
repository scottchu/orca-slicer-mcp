import { expect, test, type Page } from '@playwright/test';

const labels = (page: Page) => page.locator('[data-bed-mesh-3d]').evaluate((host) => {
  const frame = host.getBoundingClientRect();
  const labels = [...host.querySelectorAll('[data-axis-label]')].map((node) => {
    const box = node.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(node);
    const glyph = range.getBoundingClientRect();
    return { id: node.getAttribute('data-axis'), x: box.x - frame.x, y: box.y - frame.y, width: box.width, height: box.height, font: Number.parseFloat(getComputedStyle(node).fontSize), clipped: glyph.left < box.left - 0.5 || glyph.right > box.right + 0.5 || glyph.top < box.top - 0.5 || glyph.bottom > box.bottom + 0.5 };
  });
  return { width: frame.width, height: frame.height, labels };
});
const checkLabels = async (page: Page, doubled: boolean) => {
  const result = await labels(page);
  expect(result.labels.length).toBeGreaterThanOrEqual(9);
  for (const label of result.labels) {
    expect(label.font).toBeGreaterThanOrEqual(doubled ? 24 : 12);
    expect(label.clipped, `${label.id} clipped`).toBe(false);
    expect(label.x, `${label.id} left`).toBeGreaterThanOrEqual(0);
    expect(label.y, `${label.id} top`).toBeGreaterThanOrEqual(0);
    expect(label.x + label.width, `${label.id} right`).toBeLessThanOrEqual(result.width + 0.1);
    expect(label.y + label.height, `${label.id} bottom`).toBeLessThanOrEqual(result.height + 0.1);
  }
  for (let a = 0; a < result.labels.length; a++) for (let b = a + 1; b < result.labels.length; b++) {
    const first = result.labels[a], second = result.labels[b];
    const overlap = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x)) * Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    expect(overlap, `${first.id}/${second.id}`).toBeLessThan(0.5);
  }
};
const pixels = async (page: Page) => {
  const image = await page.locator('[data-chart-frame]').screenshot();
  return page.evaluate(async (png) => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, image.width, image.height).data;
    let colored = 0;
    for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 35) colored++;
    return colored / (image.width * image.height);
  }, image.toString('base64'));
};

for (const width of [320, 390, 590, 720]) for (const doubled of [false, true]) {
  test(`projected axes, reactive data and real surface pixels at ${width}, doubled=${doubled}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/__test/bed-mesh');
    await page.locator('[data-axis-label]').first().waitFor({ timeout: 5000 });
    if (doubled) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.waitForTimeout(100);
    const frame = await page.locator('[data-chart-frame]').boundingBox();
    for (const [rows, columns, mode] of [[2, 2, 'zero'], [11, 11, 'flat'], [3, 7, 'negative'], [11, 11, 'rectangle'], [2, 2, 'tiny'], [64, 64, 'tilted']] as const) {
      await page.evaluate(([rows, columns, mode]) => (window as any).meshHarness.set(rows, columns, mode), [rows, columns, mode]);
      await page.waitForTimeout(30);
      await checkLabels(page, doubled);
      expect(await pixels(page), `${mode} colored surface`).toBeGreaterThan(0.025);
      expect(await page.locator('[data-chart-frame]').boundingBox()).toEqual(frame);
    }
    // Quadrants, both sides of boundaries and both supported polar limits.
    for (const azimuth of [0, 0.02, Math.PI / 2 - 0.02, Math.PI / 2 + 0.02, Math.PI, Math.PI * 1.5, Math.PI * 2 - 0.02]) {
      for (const polar of [Math.PI * 18 / 180, Math.PI * 74 / 180]) {
        await page.evaluate(([azimuth, polar]) => (window as any).meshOrbit(azimuth, polar), [azimuth, polar]);
        await page.waitForTimeout(20);
        await checkLabels(page, doubled);
      }
    }
    await page.locator('[data-chart-frame]').screenshot({ path: `test-results/bed-mesh-orbit-${width}-${doubled}.png` });
    const before = await page.evaluate(() => (window as any).meshState());
    await page.evaluate(() => (window as any).meshHarness.set(2, 2, 'negative'));
    await page.waitForTimeout(30);
    const after = await page.evaluate(() => (window as any).meshState());
    expect(after.camera).toEqual(before.camera);
    expect(after.positions).not.toEqual(before.positions);
    expect(after.colors).not.toEqual(before.colors);
    expect(after.disposals).toBeGreaterThan(before.disposals);
    await page.getByRole('button', { name: 'Reset bed mesh view' }).click();
    await checkLabels(page, doubled);
    await page.locator('[data-chart-frame]').screenshot({ path: `test-results/bed-mesh-reset-${width}-${doubled}.png` });
    await page.getByRole('button', { name: 'Show 2D bed mesh' }).click();
    expect(await page.locator('[data-chart-frame]').boundingBox()).toEqual(frame);
    const twoBefore = await page.locator('[data-bed-mesh-2d]').screenshot();
    await page.evaluate(() => (window as any).meshHarness.set(3, 7, 'rectangle'));
    await page.waitForTimeout(30);
    expect((await page.locator('[data-bed-mesh-2d]').screenshot()).equals(twoBefore)).toBe(false);
    expect(await pixels(page)).toBeGreaterThan(0.025);
  });
}
