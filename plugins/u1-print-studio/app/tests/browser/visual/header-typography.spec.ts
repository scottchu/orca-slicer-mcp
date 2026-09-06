import { expect, test } from '@playwright/test';
import { scaleRootText } from '../helpers/text-scale';

// One shared Header contract exercised through native, ObservationFrame, Bed and
// compact Camera consumers. These routes use synthetic/static fixture servers.
const surfaces = [
  ...['heads', 'fans', 'thermals', 'queue'].map((view) => ({ route: `/dashboard/${view}`, native: true, compact: false })),
  ...['overview', 'progress', 'heads', 'thermals', 'fans', 'jobs', 'job_history', 'queue', 'bed_mesh'].map((view) => ({ route: `/dashboard/lab/${view}`, native: false, compact: false })),
  { route: '/dashboard/lab/camera', native: false, compact: true },
  { route: '/dashboard/camera', native: false, compact: true },
];

for (const width of [320, 720]) for (const { route, native, compact } of surfaces) {
  test(`shared Header root text hierarchy ${route} ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1500 });
    // Real Camera component, synthetic unavailable result; no media or device read.
    if (route === '/dashboard/camera') await page.route('**/dashboard/tools/call', (request) => request.fulfill({ json: { structuredContent: { schemaVersion: 1, available: false, reason: 'Synthetic unavailable camera' } } }));
    await page.goto(native ? `http://127.0.0.1:${process.env.U1_BROWSER_KIT_PORT ?? '4181'}${route}` : route);
    const frame = page.frames().find((candidate) => candidate.url().endsWith('/dashboard/camera_widget')) ?? page.mainFrame();
    const header = frame.locator('[data-widget-header]');
    await expect(header).toBeVisible();
    const title = header.locator('h1');
    expect(await header.evaluate((element) => element.classList.contains('compact'))).toBe(compact);
    const normal = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(normal).toBeGreaterThan(0);
    const icon = header.locator('.icon-tile');
    const iconBefore = await icon.boundingBox();
    const meta = header.locator('.meta');
    const normalMeta = await meta.count() ? await meta.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) : null;
    const scale = await scaleRootText(frame, 200);
    try {
      await expect(title).toHaveCSS('font-size', `${normal * 2}px`);
      if (normalMeta !== null) {
        await expect(meta).toHaveCSS('font-size', `${normalMeta * 2}px`);
        expect(normal).toBeGreaterThan(normalMeta);
      }
      const iconAfter = await icon.boundingBox();
      expect([iconAfter!.width, iconAfter!.height]).toEqual([iconBefore!.width, iconBefore!.height]);
      expect(await header.evaluate((element) => {
        const range = document.createRange(); range.selectNodeContents(element.querySelector('h1')!);
        return [...range.getClientRects()].every((box) => box.left >= -1 && box.right <= document.documentElement.clientWidth + 1);
      })).toBe(true);
      if (route === '/dashboard/lab/camera' || route === '/dashboard/heads') await header.screenshot({ path: testInfo.outputPath('header-root-200.png') });
    } finally { await scale.evaluate((element) => element.parentNode?.removeChild(element)); }
  });
}
