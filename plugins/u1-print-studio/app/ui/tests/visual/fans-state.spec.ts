import { expect, test } from '@playwright/test';

for (const width of [320, 390, 590, 720]) {
  test(`Fans shared gradient and progressive rows at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = []; const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) external.push(request.url()); });
    await page.goto('/__test/fans');
    const set = async (kind: string, edge = false) => page.evaluate(({ kind, edge }) => (window as unknown as { __setFansState: (kind: string, edge: boolean) => void }).__setFansState(kind, edge), { kind, edge });
    const geometry = async () => page.locator('[data-widget-shell],[role="list"],[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => {
      const { x, y, width, height } = node.getBoundingClientRect(); return { x: x + scrollX, y: y + scrollY, width, height };
    }));
    for (const enlarged of [false, true]) {
      if (enlarged) await page.addStyleTag({ content: '.name{font-size:28px!important}.metric-value,.label,.info-pair .value{font-size:26px!important}' });
      await set('loading');
      await expect(page.getByRole('status')).toHaveText('Loading Fans & Air');
      await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
      await expect(page.locator('[data-reading-row]')).toHaveCount(7);
      await expect(page.locator('button,input,a,[tabindex],[data-percentage-background]')).toHaveCount(0);
      await expect(page.locator('[data-widget-shell]')).not.toContainText(/N\/A|RPM|%|Observed|9,126/);
      const loading = await geometry();
      await page.screenshot({ path: `test-results/fans-loading-${width}-${enlarged}.png`, fullPage: true });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      expect(await page.locator('[data-skeleton]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
      await set('ready');
      await expect(page.getByRole('status')).toHaveText('Fans & Air loaded');
      const ready = await geometry();
      expect(ready).toEqual(loading);
      for (const mode of ['idle', 'cool_chamber', 'preheat_chamber', 'hot_chamber', null]) {
        await page.evaluate((mode) => (window as unknown as { __setFansState: (kind: string, edge: boolean, mode: string | null) => void }).__setFansState('ready', false, mode), mode);
        expect(await geometry()).toEqual(loading);
      }
      expect(await page.getByRole('list').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
      expect(await page.locator('[data-percentage-background]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-percentage-fill')))).toEqual(['100', '0', '0', '0', '70', '40', '40']);
      if (!enlarged) {
        const box = (await page.getByRole('listitem', { name: 'Cavity' }).boundingBox())!;
        const image = await page.screenshot();
        const pixels = await page.evaluate(async ({ png, box }) => {
          const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
          const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0);
          return [.2, .9].map((x) => Array.from(ctx.getImageData(Math.round(box.x + box.width * x), Math.round(box.y + box.height - 5), 1, 1).data));
        }, { png: image.toString('base64'), box });
        expect(pixels[0][0]).toBeGreaterThan(pixels[0][2]);
        expect(pixels[1]).toEqual([255, 255, 255, 255]);
      }
      const readability = await page.locator('[data-reading-row]').evaluateAll((rows) => rows.every((row) => {
        const outer = row.getBoundingClientRect();
        const boxes = [...row.querySelectorAll('[data-required-text]')].map((item) => item.getBoundingClientRect());
        return boxes.every((box) => box.left >= outer.left && box.right <= outer.right + .1 && box.top >= outer.top && box.bottom <= outer.bottom + .1) && boxes.every((box, index) => boxes.slice(index + 1).every((other) => box.right <= other.left + .1 || other.right <= box.left + .1 || box.bottom <= other.top + .1 || other.bottom <= box.top + .1));
      }));
      expect(readability).toBe(true);
      expect(await page.locator('[data-metric-unit]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).fontSize === '13px' || getComputedStyle(node).fontSize === '26px'))).toBe(true);
      expect(await page.locator('[data-reading-row] svg').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
      const observed = await page.locator('[data-observed-meta]').textContent();
      await page.getByRole('button').click();
      expect(await geometry()).toEqual(ready);
      await set('refreshing');
      await expect(page.getByRole('button')).toBeDisabled();
      await expect(page.getByRole('status')).toHaveText('Refreshing Fans & Air');
      expect(await page.locator('[data-observed-meta]').textContent()).toBe(observed);
      expect(await geometry()).toEqual(ready);
      await set('ready', true);
      await expect(page.getByRole('listitem', { name: 'Tool 1' })).toContainText('N/A');
      await expect(page.getByRole('listitem', { name: 'Tool 2' })).toContainText('0%');
      await expect(page.getByRole('listitem', { name: 'Tool 3' })).toContainText('100,000 RPM');
      expect(await page.locator('[data-metric-unit]').evaluateAll((nodes) => nodes.every((node) => {
        const outer = node.getBoundingClientRect(); const row = node.closest('[data-reading-row]')!.getBoundingClientRect();
        const range = document.createRange(); range.selectNodeContents(node); const text = range.getBoundingClientRect();
        return text.left >= outer.left - .1 && text.right <= outer.right + .1 && text.left >= row.left && text.right <= row.right + .1;
      }))).toBe(true);
      expect(await page.locator('[data-percentage-background]').evaluateAll((nodes) => nodes.slice(0, 3).map((node) => node.getAttribute('data-percentage-fill')))).toEqual(['0', '0', '33.3']);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/fans-ready-${width}-${enlarged}.png`, fullPage: true });
    }
    for (const kind of ['error', 'unavailable']) {
      await set(kind);
      await expect(page.locator('[data-percentage-background]')).toHaveCount(0);
      await expect(page.getByRole('status')).toHaveCount(1);
      const action = (await page.getByRole('button').boundingBox())!;
      expect(action.width).toBe(44); expect(action.height).toBe(44);
    }
    expect(errors).toEqual([]); expect(external).toEqual([]);
  });
}
