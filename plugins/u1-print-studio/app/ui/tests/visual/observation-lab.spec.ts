import { expect, test, type Page } from '@playwright/test';

const widths = [320, 390, 590, 720] as const;
const views = [
  ['overview', 'Overview'], ['progress', 'Print Progress'], ['thermals', 'Thermals'],
  ['heads', 'Heads & Filaments'], ['jobs', 'Current Job'], ['job_history', 'Job History'],
  ['queue', 'Print Queue'], ['fans', 'Fans & Air']
] as const;

async function geometry(page: Page) {
  return page.locator('[data-widget-shell]').evaluate((shell) => {
    const header = shell.querySelector<HTMLElement>('[data-widget-header]')!;
    const body = shell.querySelector<HTMLElement>('[data-widget-body]')!;
    const footer = shell.querySelector<HTMLElement>('[data-widget-footer]')!;
    const root = getComputedStyle(document.documentElement);
    const headerStyle = getComputedStyle(header);
    const bodyStyle = getComputedStyle(body);
    const footerStyle = getComputedStyle(footer);
    const shellBox = shell.getBoundingClientRect();
    const headerBox = header.getBoundingClientRect();
    const bodyBox = body.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    return {
      shell: { x: shellBox.x, y: shellBox.y, width: shellBox.width, height: shellBox.height },
      header: { x: headerBox.x, y: headerBox.y, width: headerBox.width, height: headerBox.height },
      body: { x: bodyBox.x, y: bodyBox.y, width: bodyBox.width, height: bodyBox.height },
      footer: { x: footerBox.x, y: footerBox.y, width: footerBox.width, height: footerBox.height },
      tokenInset: Number.parseFloat(root.getPropertyValue('--u1-card-x')),
      headerInset: Number.parseFloat(headerStyle.paddingLeft),
      bodyInset: Number.parseFloat(bodyStyle.paddingLeft),
      footerInset: Number.parseFloat(footerStyle.marginLeft)
    };
  });
}

for (const width of widths) {
  test(`observation directory is exhaustive and camera remains pending at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto('/dashboard/lab/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Observation Lab' })).toBeVisible();
    await expect(page.locator('[data-lab-link]')).toHaveCount(9);
    await expect(page.getByText('Pending lifecycle migration')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Camera' })).toHaveCount(0);
    for (const [path, title] of [...views, ['bed_mesh', 'Bed Mesh']] as const) {
      await expect(page.locator(`[data-lab-link="${path}"]`)).toHaveText(title);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/observation-directory-${width}.png`, fullPage: true });
  });

  for (const [view, title] of views) {
    test(`${title} is compact and stable at ${width}px`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const externalRequests: string[] = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.hostname !== '127.0.0.1') externalRequests.push(request.url());
      });
      await page.setViewportSize({ width, height: 1100 });
      await page.goto(`/dashboard/lab/${view}`, { waitUntil: 'networkidle' });
      await expect(page.locator(`[data-private-lab="${view}"]`)).toBeVisible();
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.getByText(/Lab fixture/).first()).toBeVisible();
      await expect(page.locator('[data-widget-shell]')).toHaveCount(1);
      await expect(page.locator('[data-widget-header]')).toHaveCount(1);
      await expect(page.locator('[data-widget-body]')).toHaveCount(1);
      await expect(page.locator('[data-widget-footer]')).toHaveCount(1);
      const refresh = page.getByRole('button', { name: 'Refresh lab fixture' });
      await expect(refresh).toHaveCount(1);
      await expect(refresh).toHaveCSS('width', '44px');
      await expect(refresh).toHaveCSS('height', '44px');
      const before = await geometry(page);
      expect(before.shell.width).toBeGreaterThan(250);
      expect(before.shell.height).toBeLessThan(850);
      expect(before.headerInset).toBe(before.tokenInset);
      expect(before.bodyInset).toBe(before.tokenInset);
      expect(before.footerInset).toBe(before.tokenInset);
      expect(before.body.y).toBeGreaterThanOrEqual(before.header.y + before.header.height - 0.1);
      expect(before.footer.y).toBeGreaterThanOrEqual(before.body.y + before.body.height - 0.1);
      const observedBefore = await page.locator('[data-widget-header] .meta').textContent();
      await refresh.click();
      await expect(page.getByRole('status')).toHaveText('Lab fixture refreshed');
      const after = await geometry(page);
      expect(Math.abs(after.shell.height - before.shell.height)).toBeLessThan(0.1);
      expect(await page.locator('[data-widget-header] .meta').textContent()).toBe(observedBefore);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/${view}-${width}.png`, fullPage: true });
      expect(consoleErrors).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
