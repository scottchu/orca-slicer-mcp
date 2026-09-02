import { expect, test, type Page } from '@playwright/test';

const enlargedText = async (page: Page) => page.evaluate(() => {
  document.documentElement.style.fontSize = '32px';
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
    if (!(rule instanceof CSSStyleRule)) return;
    const size = rule.style.getPropertyValue('font-size');
    if (size) rule.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
      const value = rule.style.getPropertyValue(token);
      if (value.endsWith('px')) rule.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
    }
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const bounds = async (page: Page) => page.locator('[data-widget-shell],[data-chart-frame],[data-widget-footer],[data-icon-segmented]').evaluateAll((nodes) => nodes.map((node) => {
  const { x, y, width, height } = node.getBoundingClientRect(); return { x: x + scrollX, y: y + scrollY, width, height };
}));

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Bed segmented toggle stable geometry and URL ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1500 });
    await page.goto('/dashboard/lab/bed_mesh');
    await expect(page.locator('[data-surface-projection]')).toHaveAttribute('data-ready', 'true');
    if (enlarged) await enlargedText(page);
    const group = page.getByRole('radiogroup', { name: 'Bed mesh view' });
    const cube = page.getByRole('radio', { name: '3D surface' }), grid = page.getByRole('radio', { name: '2D grid' });
    await expect(group).toHaveCSS('width', '88px'); await expect(group).toHaveCSS('height', '44px');
    for (const radio of [cube, grid]) {
      await expect(radio).toHaveCSS('width', '44px'); await expect(radio).toHaveCSS('height', '44px');
      await expect(radio.locator('svg')).toHaveAttribute('width', '20');
    }
    const track = group.locator('.track'), thumb = group.locator('.thumb');
    await expect(track).toHaveCSS('width', '88px'); await expect(track).toHaveCSS('height', '44px');
    expect(await track.boundingBox()).toEqual(await group.boundingBox());
    await expect(thumb).toHaveCSS('width', '40px'); await expect(thumb).toHaveCSS('height', '40px');
    await expect(thumb).toHaveCSS('transition-property', 'transform'); await expect(thumb).toHaveCSS('transition-duration', '0.18s');
    await page.locator('[data-chart-frame]').evaluate((node) => { Object.assign(window, { originalChartFrame: node }); });
    const before = await bounds(page);
    await cube.focus(); await page.keyboard.press('ArrowRight');
    await expect(grid).toBeFocused(); await expect(grid).toHaveAttribute('aria-checked', 'true');
    await expect(grid).toHaveCSS('outline-width', '3px'); await expect(grid).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('[data-bed-mesh-2d]')).toBeVisible();
    await expect(page.getByLabel('View', { exact: true })).toHaveValue('2d');
    await expect(page).toHaveURL(/mode=2d/);
    await expect(thumb).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 44, 0)');
    expect(await bounds(page)).toEqual(before);
    expect(await page.locator('[data-chart-frame]').evaluate((node) => node === (window as any).originalChartFrame)).toBe(true);
    await page.goBack(); await expect(cube).toHaveAttribute('aria-checked', 'true');
    await page.goForward(); await expect(grid).toHaveAttribute('aria-checked', 'true');
    await page.getByLabel('View', { exact: true }).focus(); await page.getByLabel('View', { exact: true }).selectOption('3d');
    await expect(cube).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByLabel('View', { exact: true })).toBeFocused();
    expect(await bounds(page)).toEqual(before);
    await page.getByLabel('Preview state', { exact: true }).focus(); await page.getByLabel('Preview state', { exact: true }).selectOption('refreshing'); expect(await bounds(page)).toEqual(before);
    await page.getByLabel('Preview state', { exact: true }).selectOption('loading'); expect(await bounds(page)).toEqual(before);
    await expect(page.locator('[data-icon-segmented]')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('[data-icon-segmented] button,[data-icon-segmented] [aria-checked],[data-icon-segmented] .thumb')).toHaveCount(0);
    await page.getByLabel('Preview state', { exact: true }).selectOption('ready'); expect(await bounds(page)).toEqual(before);
    await expect(page.getByLabel('Preview state', { exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Reset lab preview' }).click(); await expect(cube).toHaveAttribute('aria-checked', 'true');
    await page.screenshot({ path: `test-results/bed-icon-toggle-${width}-${enlarged}.png`, fullPage: true });
  });
  test(`segmented native keyboard, disabled/loading and reduced motion ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 }); await page.goto('/__test/icon-segmented');
    if (enlarged) await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
    const cube = page.getByRole('radio', { name: 'Surface' }), grid = page.getByRole('radio', { name: 'Grid' });
    const count = page.getByRole('status', { name: 'Change count' });
    await page.getByRole('button', { name: 'External value' }).focus(); await page.keyboard.press('Tab'); await expect(cube).toBeFocused();
    await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Toggle disabled' })).toBeFocused();
    expect(await grid.evaluate((node) => {
      const box = node.getBoundingClientRect(); return document.elementFromPoint(box.left + 22, box.top + 2) === node;
    })).toBe(true);
    await grid.focus(); await page.keyboard.down('Space'); await page.keyboard.down('Space'); await page.keyboard.up('Space');
    await expect(count).toHaveText('1'); await expect(grid).toHaveAttribute('aria-checked', 'true');
    await cube.focus(); await page.keyboard.press('Enter'); await expect(count).toHaveText('2');
    await page.keyboard.press('ArrowLeft'); await expect(grid).toBeFocused(); await expect(count).toHaveText('3');
    await page.keyboard.press('Home'); await expect(cube).toBeFocused(); await expect(count).toHaveText('4');
    await page.keyboard.press('End'); await expect(grid).toBeFocused(); await expect(count).toHaveText('5');
    await page.keyboard.press('Enter'); await grid.click(); await expect(count).toHaveText('5');
    await page.getByRole('button', { name: 'External value' }).click(); await expect(cube).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('button', { name: 'External value' })).toBeFocused(); await expect(count).toHaveText('5');
    await page.getByRole('button', { name: 'Reverse options' }).click(); await cube.focus(); await page.keyboard.press('Home');
    await expect(grid).toBeFocused(); await expect(grid).toHaveAttribute('aria-checked', 'true'); await expect(count).toHaveText('6');
    const box = await page.locator('[data-icon-segmented]').boundingBox();
    await page.getByRole('button', { name: 'Toggle disabled' }).click(); await expect(cube).toBeDisabled(); await expect(grid).toBeDisabled();
    await page.getByRole('button', { name: 'External value' }).focus(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Toggle disabled' })).toBeFocused();
    await page.getByRole('button', { name: 'Toggle loading' }).click();
    await expect(page.getByRole('radio')).toHaveCount(0); expect(await page.locator('[data-icon-segmented]').boundingBox()).toEqual(box);
    expect(await page.locator('[data-icon-segmented] .track').boundingBox()).toEqual(box);
    await page.getByRole('button', { name: 'Toggle loading' }).click(); await expect(page.getByRole('button', { name: 'Toggle loading' })).toBeFocused();
    await page.getByRole('button', { name: 'Toggle disabled' }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.thumb')).toHaveCSS('transition-duration', '0s');
    await cube.click(); await expect(count).toHaveText('7');
    await expect(page.locator('.thumb')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 44, 0)');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const positions = await page.evaluate(async () => {
      const thumb = document.querySelector('.thumb')!;
      const positions: number[] = [];
      (document.querySelector('[role="radio"][aria-label="Grid"]') as HTMLButtonElement).click();
      const start = performance.now();
      await new Promise<void>((resolve) => {
        const sample = () => {
          positions.push(new DOMMatrix(getComputedStyle(thumb).transform).m41);
          if (performance.now() - start >= 240) resolve(); else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      return positions;
    });
    expect(positions.some((position) => position > 0 && position < 44)).toBe(true);
    expect(positions.at(-1)).toBe(0); await expect(count).toHaveText('8');
  });
}

test('Switch expands from two to three controlled icons with a measured animated thumb', async ({ page }, info) => {
  await page.goto('/__test/icon-segmented');
  const group = page.getByRole('radiogroup', { name: 'Test view' });
  await page.getByRole('radio', { name: 'Grid' }).click();
  await expect(group.locator('.thumb')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 44, 0)');
  await group.screenshot({ path: info.outputPath('switch-two.png') });
  await page.getByRole('button', { name: 'Toggle third option' }).click();
  await expect(group).toHaveCSS('width', '132px');
  await expect(group.locator('.track')).toHaveCSS('height', '44px');
  expect(await group.locator('.track').boundingBox()).toEqual(await group.boundingBox());
  await expect(group.locator('.thumb')).toHaveCSS('height', '40px');
  const sample = await page.evaluate(async () => {
    const group = document.querySelector('[data-icon-segmented]')!;
    const thumb = group.querySelector('.thumb')!;
    (group.querySelector('[aria-label="List"]') as HTMLButtonElement).click();
    return new Promise<number>(resolve => {
      const start = performance.now();
      const sample = () => {
        const x = new DOMMatrix(getComputedStyle(thumb).transform).m41;
        if (x > 44 && x < 88) { thumb.getAnimations().forEach(animation => animation.pause()); resolve(x); }
        else if (performance.now() - start > 1000) resolve(x);
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  });
  expect(sample).toBeGreaterThan(44); expect(sample).toBeLessThan(88);
  await group.screenshot({ path: info.outputPath('switch-three-in-motion.png'), animations: 'allow' });
  await group.locator('.thumb').evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
  await expect(group.locator('.thumb')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 88, 0)');
  await group.screenshot({ path: info.outputPath('switch-three.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('radio', { name: 'Surface' }).click();
  await expect(group.locator('.thumb')).toHaveCSS('transition-duration', '0s');
  await expect(group.locator('.thumb')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});
