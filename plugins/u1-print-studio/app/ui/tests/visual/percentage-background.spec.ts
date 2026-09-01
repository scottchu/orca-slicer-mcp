import { expect, test } from '@playwright/test';

for (const width of [320, 390, 590, 720]) {
  test(`PercentageBackground paints bounded decorative fill and preserves children at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) external.push(request.url()); });
    await page.goto('/__test/percentage');
    const background = page.locator('[data-percentage-background]');
    const original = (await background.boundingBox())!;
    expect(await background.evaluate((node) => {
      const css = getComputedStyle(node);
      return [css.padding, css.margin, css.borderWidth, css.overflow, css.animationName, css.transitionDuration];
    })).toEqual(['0px', '0px', '0px', 'visible', 'none', '0s']);
    for (const [value, max, fill] of [[0, 100, 0], [25, 100, 25], [100, 200, 50], [200, 200, 100], [220, 200, 100], [44, 0, 0], [null, 100, 0]] as const) {
      await page.evaluate(({ value, max }) => (window as unknown as { __setPercentage: (next: unknown) => void }).__setPercentage({ value, max }), { value, max });
      await expect(background).toHaveAttribute('data-percentage-fill', String(fill));
      const box = (await background.boundingBox())!;
      expect({ x: box.x, y: box.y, width: box.width }).toEqual({ x: original.x, y: original.y, width: original.width });
      expect(box).toEqual(await page.getByRole('region', { name: 'Example card' }).boundingBox());
      expect(await background.evaluate((node) => getComputedStyle(node).backgroundImage === 'none')).toBe(fill === 0);
      await expect(page.getByRole('region', { name: 'Example card' })).toContainText(`Actual ${value ?? 'unknown'} / Target ${max}`);
    }
    await page.evaluate(() => (window as unknown as { __setPercentage: (next: unknown) => void }).__setPercentage({ value: 50, max: 100, color: '#0055aa' }));
    await expect(background).toHaveAttribute('data-percentage-fill', '50');
    const screenshot = await page.screenshot();
    const samples = await page.evaluate(async ({ png, box }) => {
      const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const context = canvas.getContext('2d')!; context.drawImage(img, 0, 0);
      return [.2, .8].map((fraction) => Array.from(context.getImageData(Math.round(box.x + box.width * fraction), Math.round(box.y + box.height - 8), 1, 1).data));
    }, { png: screenshot.toString('base64'), box: original });
    expect(samples[0][2]).toBeGreaterThan(samples[0][0]);
    expect(samples[0][0]).toBeLessThan(250);
    expect(samples[1]).toEqual([255, 255, 255, 255]);
    await page.getByRole('button', { name: 'Example action' }).click();
    await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Example action' })).toBeFocused();
    expect(await page.getByRole('button').evaluate((node) => getComputedStyle(node).outlineWidth)).toBe('3px');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => (window as unknown as { __percentageClicks: () => number }).__percentageClicks())).toBe(2);
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await background.evaluate((node) => getComputedStyle(node).backgroundImage)).toBe('none');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' });
    expect(await background.evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/percentage-background-${width}.png`, fullPage: true });
    expect(errors).toEqual([]); expect(external).toEqual([]);
  });
  test(`Thermals percentage wrappers preserve list seams at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/dashboard/lab/thermals');
    await expect(page.locator('[data-percentage-background]')).toHaveCount(6);
    expect(await page.locator('[data-percentage-background]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-percentage-fill')))).toEqual(['100', '0', '0', '0', '100', '0']);
    const seams = async () => page.locator('[data-reading-row]').evaluateAll((rows) => rows.map((row) => {
      const box = row.getBoundingClientRect(); const cell = row.parentElement!.getBoundingClientRect();
      const css = getComputedStyle(row);
      return { bottom: css.borderBottomWidth, right: css.borderRightWidth, fillsCell: Math.abs(box.height - cell.height) < .1 };
    }));
    expect((await seams()).map(({ bottom }) => bottom)).toEqual(width >= 590 ? ['1px', '1px', '1px', '1px', '0px', '0px'] : ['1px', '1px', '1px', '1px', '1px', '0px']);
    expect((await seams()).map(({ right }) => right)).toEqual(width >= 590 ? ['1px', '0px', '1px', '0px', '1px', '0px'] : Array(6).fill('0px'));
    await page.addStyleTag({ content: '.name {font-size:28px!important} .degree {font-size:40px!important} .degree.secondary {font-size:26px!important}' });
    expect((await seams()).every(({ fillsCell }) => fillsCell)).toBe(true);
    await page.screenshot({ path: `test-results/percentage-thermals-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
