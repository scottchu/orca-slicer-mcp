import { expect, test, type Page } from '@playwright/test';

const extent = async (page: Page) => (await page.locator('[data-surface-projection]').boundingBox())!;
const zoom = (page: Page) => page.evaluate(() => (window as any).meshState().zoom as number);
const wheel = async (page: Page, delta: number) => {
  await page.locator('[data-bed-mesh-3d] canvas').hover();
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(80);
};
const coloredPixels = async (page: Page) => {
  await page.locator('[data-height-legend]').evaluateAll((nodes) => nodes.forEach((node) => (node as HTMLElement).style.visibility = 'hidden'));
  const png = await page.locator('[data-chart-frame]').screenshot();
  await page.locator('[data-height-legend]').evaluateAll((nodes) => nodes.forEach((node) => (node as HTMLElement).style.removeProperty('visibility')));
  return page.evaluate(async (data) => {
    const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) if (Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) - Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) > 35) count++;
    return count;
  }, png.toString('base64'));
};

for (const width of [320, 590]) for (const doubled of [false, true]) {
  test(`wheel zoom is independent of fit at ${width}, doubled=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/__test/bed-mesh');
    await page.locator('[data-axis-label]').first().waitFor();
    if (doubled) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.waitForTimeout(100);
    await page.evaluate(() => Object.assign(window, {
      heldMeshCanvas: document.querySelector('[data-bed-mesh-3d] canvas'),
      heldMeshControls: (window as any).meshControls()
    }));
    const initial = await extent(page);
    const frame = await page.locator('[data-chart-frame]').boundingBox();
    const initialPixels = await coloredPixels(page);
    await wheel(page, -600);
    expect((await extent(page)).width / initial.width).toBeGreaterThan(1.2);
    expect((await coloredPixels(page)) / initialPixels).toBeGreaterThan(1.2);
    expect(await page.locator('[data-chart-frame]').boundingBox()).toEqual(frame);
    await page.locator('[data-chart-frame]').screenshot({ path: `test-results/bed-mesh-zoom-${width}-${doubled}.png` });
    await wheel(page, 600);
    expect(await zoom(page)).toBeCloseTo(1, 8);
    expect((await extent(page)).width).toBeCloseTo(initial.width, 1);

    await wheel(page, 100_000);
    expect(await zoom(page)).toBe(0.75);
    expect((await extent(page)).width).toBeLessThan(initial.width * 0.8);
    await wheel(page, -100_000);
    expect(await zoom(page)).toBe(3.5);
    expect((await extent(page)).width).toBeGreaterThan(initial.width * 3.4);
    await wheel(page, -600);
    expect(await zoom(page)).toBe(3.5);

    await page.evaluate(() => (window as any).meshOrbit(2.1, 0.8));
    const orbit = await page.evaluate(() => (window as any).meshState().camera);
    await page.evaluate(() => (window as any).meshHarness.set(3, 7, 'rectangle'));
    await page.setViewportSize({ width: width + 30, height: 1400 });
    await page.waitForTimeout(100);
    expect(await zoom(page)).toBe(3.5);
    expect(await page.evaluate(() => (window as any).meshState().camera)).toEqual(orbit);
    expect(await page.evaluate(() => (window as any).heldMeshCanvas === document.querySelector('[data-bed-mesh-3d] canvas') && (window as any).heldMeshControls === (window as any).meshControls())).toBe(true);
    await page.getByRole('button', { name: 'Reset bed mesh view' }).click();
    expect(await zoom(page)).toBe(1);
    const resetOrbit = await page.evaluate(() => (window as any).meshState().camera);
    expect(resetOrbit[0]).toBeCloseTo(0.92);
    expect(resetOrbit[1]).toBeCloseTo(0.78);
    expect(resetOrbit[2]).toBeCloseTo(1.04);
  });
}

test('packaged chart responds to actual wheel and reset', async ({ page }) => {
  await page.setViewportSize({ width: 590, height: 1400 });
  await page.goto('/dashboard/lab/bed_mesh');
  await page.locator('[data-axis-label]').first().waitFor();
  const before = await extent(page);
  await wheel(page, -600);
  expect((await extent(page)).width / before.width).toBeGreaterThan(1.2);
  await page.getByRole('button', { name: 'Reset bed mesh view' }).click();
  expect((await extent(page)).width).toBeCloseTo(before.width, 1);
});

test('two-finger browser touch pinch enlarges and restores the same canvas', async ({ page, context }) => {
  await page.setViewportSize({ width: 590, height: 1400 });
  await page.goto('/__test/bed-mesh');
  await page.locator('[data-axis-label]').first().waitFor();
  await page.evaluate(() => Object.assign(window, { pinchCanvas: document.querySelector('[data-bed-mesh-3d] canvas'), pinchControls: (window as any).meshControls() }));
  const before = await extent(page);
  const frame = (await page.locator('[data-chart-frame]').boundingBox())!;
  const client = await context.newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', gap = 0) => client.send('Input.dispatchTouchEvent', {
    type, touchPoints: type === 'touchEnd' ? [] : [-1, 1].map((direction, id) => ({ x: frame.x + frame.width / 2 + direction * gap, y: frame.y + frame.height / 2, id }))
  });
  await touch('touchStart', 40);
  await touch('touchMove', 64);
  await page.waitForTimeout(80);
  expect((await extent(page)).width / before.width).toBeGreaterThan(1.4);
  await touch('touchMove', 40);
  await touch('touchEnd');
  await page.waitForTimeout(80);
  expect(await zoom(page)).toBeCloseTo(1, 6);
  expect((await extent(page)).width).toBeCloseTo(before.width, 1);
  expect(await page.evaluate(() => (window as any).pinchCanvas === document.querySelector('[data-bed-mesh-3d] canvas') && (window as any).pinchControls === (window as any).meshControls())).toBe(true);
  await client.detach();
});
