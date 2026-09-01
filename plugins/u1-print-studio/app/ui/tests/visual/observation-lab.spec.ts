import { expect, test, type Page } from '@playwright/test';

const widths = [320, 390, 590, 720] as const;
const views = [
  ['overview', 'Overview'], ['progress', 'Print Progress'], ['thermals', 'Thermals'],
  ['heads', 'Heads & Filaments'], ['jobs', 'Current Job'], ['job_history', 'Job History'],
  ['queue', 'Print Queue'], ['fans', 'Fans & Air']
] as const;

declare global {
  interface Window {
    __u1TitleSequence?: string[];
  }
}

async function observeParsedTitles(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    window.__u1TitleSequence = [];
    const recordTitle = () => {
      const title = document.title;
      if (title && window.__u1TitleSequence?.at(-1) !== title) {
        window.__u1TitleSequence?.push(title);
      }
    };
    new MutationObserver(recordTitle).observe(document, {
      subtree: true,
      childList: true,
      characterData: true
    });
    recordTitle();
  });
}

for (const [path, title] of [
  ['', 'Observation Lab'],
  ...views,
  ['bed_mesh', 'Bed Mesh']
] as const) {
  test(`${title} is the only non-empty title observed during initial parsing`, async ({ page }) => {
    await observeParsedTitles(page);
    await page.goto(`/dashboard/lab/${path}`, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(title);
    expect(await page.evaluate(() => window.__u1TitleSequence)).toEqual([title]);
  });
}

async function geometry(page: Page, view: string) {
  return page.locator(`[data-route-panel="${view}"] [data-widget-shell]`).evaluate((shell) => {
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
    await page.addInitScript(() => {
      (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts.push((entry as PerformanceEntry & { value: number }).value);
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.setViewportSize({ width, height: 1100 });
    await page.goto('/dashboard/lab/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Observation Lab');
    await expect(page.locator('html')).toHaveAttribute('data-u1-lab-route', 'directory');
    await expect(page.locator('.route-panel:visible')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Observation Lab' })).toBeVisible();
    await expect(page.locator('[data-lab-link]')).toHaveCount(9);
    await expect(page.getByText('Pending lifecycle migration')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Camera' })).toHaveCount(0);
    for (const [path, title] of [...views, ['bed_mesh', 'Bed Mesh']] as const) {
      await expect(page.locator(`[data-lab-link="${path}"]`)).toHaveText(title);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts)).toEqual([]);
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
      await page.addInitScript(() => {
        (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
              (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts.push((entry as PerformanceEntry & { value: number }).value);
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.setViewportSize({ width, height: 1100 });
      await page.goto(`/dashboard/lab/${view}`, { waitUntil: 'networkidle' });
      const panel = page.locator(`[data-route-panel="${view}"]`);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('html')).toHaveAttribute('data-u1-lab-route', view);
      await expect(page.locator('.route-panel:visible')).toHaveCount(1);
      await expect(panel.locator(`[data-private-lab="${view}"]`)).toBeVisible();
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.getByText(/Lab fixture/).first()).toBeVisible();
      await expect(panel.locator('[data-widget-shell]')).toHaveCount(1);
      await expect(panel.locator('[data-widget-header]')).toHaveCount(1);
      await expect(panel.locator('[data-widget-body]')).toHaveCount(1);
      await expect(panel.locator('[data-widget-footer]')).toHaveCount(1);
      const refresh = page.getByRole('button', { name: 'Refresh lab fixture' });
      await expect(refresh).toHaveCount(1);
      await expect(refresh).toHaveCSS('width', '44px');
      await expect(refresh).toHaveCSS('height', '44px');
      const before = await geometry(page, view);
      expect(before.shell.width).toBeGreaterThan(250);
      expect(before.shell.height).toBeLessThan(850);
      expect(before.headerInset).toBe(before.tokenInset);
      expect(before.bodyInset).toBe(before.tokenInset);
      expect(before.footerInset).toBe(before.tokenInset);
      expect(before.body.y).toBeGreaterThanOrEqual(before.header.y + before.header.height - 0.1);
      expect(before.footer.y).toBeGreaterThanOrEqual(before.body.y + before.body.height - 0.1);
      const observedBefore = await panel.locator('[data-widget-header] .meta').textContent();
      await refresh.click();
      await expect(page.getByRole('status')).toHaveText('Lab fixture refreshed');
      const after = await geometry(page, view);
      expect(Math.abs(after.shell.height - before.shell.height)).toBeLessThan(0.1);
      expect(await panel.locator('[data-widget-header] .meta').textContent()).toBe(observedBefore);
      if (view === 'overview') {
        const columns = await panel.locator('.overview-grid').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(width === 320 ? 1 : 2);
      }
      if (view === 'heads') {
        const columns = await panel.locator('.head-grid').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(2);
        const reservedHeights = await panel.locator('[data-head-material]').evaluateAll((items) => items.map((item) => getComputedStyle(item).minHeight));
        expect(reservedHeights).toEqual(['0px', '0px', '0px', '0px']);
        await expect(panel.locator('[data-copy-color]')).toHaveCount(3);
        for (const copy of await panel.locator('[data-copy-color]').all()) {
          await expect(copy).toHaveCSS('height', '44px');
        }
        const wash = await panel.getByLabel('Tool 3').evaluate((card) => {
          const color = getComputedStyle(card).getPropertyValue('--head-color').trim();
          const probe = document.createElement('div');
          probe.style.background = `color-mix(in srgb, ${color} 6%, white)`;
          document.body.append(probe);
          const expected = getComputedStyle(probe).backgroundColor;
          probe.style.background = 'color-mix(in srgb, #3487C8 6%, white)';
          const opaque = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return { color, actual: getComputedStyle(card).backgroundColor, expected, opaque };
        });
        expect(wash.color).toBe('#3487C880');
        expect(wash.actual).toBe(wash.expected);
        expect(wash.actual).not.toBe(wash.opaque);
        const activeSemantics = await panel.getByLabel('Tool 1').evaluate((card) => {
          const element = card as HTMLElement;
          const originalColor = element.style.getPropertyValue('--head-color');
          const before = getComputedStyle(element);
          const borderBefore = before.borderBottomColor;
          const washBefore = before.backgroundColor;
          element.style.setProperty('--head-color', '#7B4DFFFF');
          const changed = getComputedStyle(element);
          const borderAfter = changed.borderBottomColor;
          const washAfter = changed.backgroundColor;
          const probe = document.createElement('div');
          probe.style.color = 'var(--u1-accent)';
          document.body.append(probe);
          const semanticAccent = getComputedStyle(probe).color;
          probe.remove();
          element.style.setProperty('--head-color', originalColor);
          return { borderBefore, borderAfter, washBefore, washAfter, semanticAccent };
        });
        expect(activeSemantics.borderBefore).toBe(activeSemantics.semanticAccent);
        expect(activeSemantics.borderAfter).toBe(activeSemantics.semanticAccent);
        expect(activeSemantics.washAfter).not.toBe(activeSemantics.washBefore);
        const shellHeightBeforeCopy = (await panel.locator('[data-widget-shell]').boundingBox())!.height;
        await panel.getByRole('button', { name: 'Copy T3 color #3487C880' }).click();
        await expect(panel.getByRole('status')).toHaveText(/#3487C880 (?:copied|copy unavailable)/i);
        await expect(panel.getByRole('status')).toHaveCount(1);
        await refresh.click();
        await expect(panel.getByRole('status')).toHaveText('Lab fixture refreshed');
        await expect(panel.getByRole('status')).toHaveCount(1);
        await panel.getByRole('button', { name: 'Copy T3 color #3487C880' }).click();
        await expect(panel.getByRole('status')).toHaveText(/#3487C880 (?:copied|copy unavailable)/i);
        await expect(panel.getByRole('status')).toHaveCount(1);
        const shellHeightAfterCopy = (await panel.locator('[data-widget-shell]').boundingBox())!.height;
        expect(Math.abs(shellHeightAfterCopy - shellHeightBeforeCopy)).toBeLessThan(0.1);
      }
      if (view === 'thermals') {
        for (const label of ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Heater bed', 'Cavity']) await expect(panel.getByText(label)).toBeVisible();
      }
      const clipped = await panel.locator('[data-required-text]').evaluateAll((items) => items.filter((item) => {
        const element = item as HTMLElement;
        return element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
      }).map((item) => item.textContent));
      expect(clipped).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => (window as unknown as { __u1LayoutShifts: number[] }).__u1LayoutShifts)).toEqual([]);
      await page.screenshot({ path: `test-results/${view}-${width}.png`, fullPage: true });
      expect(consoleErrors).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
