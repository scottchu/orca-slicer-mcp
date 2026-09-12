import { expect, test } from '@playwright/test';

const camera = async (page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext, mode: string) => {
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 18;
    return canvas.toDataURL('image/jpeg');
  });
  await request.post('/fixture/configure', { data: { reset: true, image } });
  await page.goto(`/host?tool=open_printer_camera&presentation=${mode}`);
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('img')).toBeVisible();
  return frame;
};

test('actual Camera resource honors host grant/Exit, safe area, sizing and pending focus ownership', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const frame = await camera(page, request, 'pending');
  const video = await frame.locator('video').elementHandle();
  const initial = await page.locator('iframe').boundingBox();
  const button = frame.getByRole('button', { name: 'Fullscreen', exact: true });
  await button.click();
  await frame.getByRole('radio', { name: 'Auto', exact: true }).focus();
  await expect.poll(() => page.evaluate(() => (window as any).__mcpHost.state.displayRequests.length)).toBe(1);
  await page.evaluate(() => (window as any).__mcpHost.resolveDisplay('fullscreen'));
  await expect(frame.getByRole('button', { name: 'Exit fullscreen', exact: true })).toBeVisible();
  await expect(frame.getByRole('radio', { name: 'Auto', exact: true })).toBeFocused();
  const surface = frame.locator('[data-media-surface]');
  await expect(surface).toHaveClass(/host-fullscreen/);
  expect((await surface.boundingBox())!.height).toBeGreaterThan(initial!.height);
  const sizes = await page.evaluate(() => (window as any).__mcpHost.state.sizes.length);
  await page.evaluate(() => (window as any).__mcpHost.sendContext({ safeArea: { insets: { bottom: 20, top: 8 } } }));
  await expect(surface).toHaveCSS('bottom', '20px');
  expect(await page.evaluate(() => (window as any).__mcpHost.state.sizes.length)).toBe(sizes);
  await page.evaluate(() => (window as any).__mcpHost.sendContext({ displayMode: 'inline' }));
  await expect(surface).not.toHaveClass(/host-fullscreen/);
  await expect.poll(() => page.evaluate(() => (window as any).__mcpHost.state.sizes.length)).toBe(sizes + 1);
  expect(await video!.evaluate(node => node === document.querySelector('video'))).toBe(true);
  await expect(frame.getByRole('radio', { name: 'Auto', exact: true })).toBeFocused();
  const calls = await (await request.get('/fixture/state')).json();
  expect(calls.calls.every((call: { name: string }) => ['open_printer_camera', 'get_u1_camera_frame'].includes(call.name))).toBe(true);
});

for (const width of [320, 390, 1024]) {
  for (const enlarged of [false, true]) {
    test(`fixed native body padding and neutral geometry ${width} ${enlarged ? '200%' : '100%'}`, async ({ page, request }, info) => {
      await page.setViewportSize({ width, height: 1200 });
      for (const view of ['overview', 'progress', 'thermals', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh']) {
        await page.unroute('**/fixture/call');
        await request.post('/fixture/configure', { data: { reset: true, bedMesh: true } });
        await page.goto(`/host?view=${view}`);
        const frame = page.frameLocator('iframe');
        await expect(frame.locator('[data-widget-shell]')).toHaveCount(1);
        const body = frame.locator('[data-widget-body]');
        if (enlarged) await body.evaluate(node => {
          const elements = [node, ...node.querySelectorAll('*')];
          const sizes = elements.map(element => Number.parseFloat(getComputedStyle(element).fontSize));
          elements.forEach((element, index) => { (element as HTMLElement).style.fontSize = `${sizes[index] * 2}px`; });
        });
        const insets = await body.evaluate(node => {
          const style = getComputedStyle(node);
          return { left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), expectedX: parseFloat(style.getPropertyValue('--u1-card-x')), expectedBottom: 18 };
        });
        expect(insets.expectedX).toBeGreaterThan(0);
        expect(insets.left).toBe(insets.expectedX);
        expect(insets.right).toBe(insets.expectedX);
        expect(insets.bottom).toBe(insets.expectedBottom);
        const before = await frame.locator('[data-widget-shell]').boundingBox();
        const previousTimes = (await frame.locator('[data-widget-shell]').innerText()).match(/\b\d{1,2}:\d{2}:\d{2}\b/g) ?? [];
        if (view === 'progress' || view === 'overview') expect(previousTimes.length).toBeGreaterThan(0);
        if (view === 'progress' && width === 390 && !enlarged) {
          await page.screenshot({ path: info.outputPath('progress-padding-current.png'), fullPage: true });
        }
        await page.route('**/fixture/call', route => route.fulfill({ json: { isError: true } }));
        await frame.getByRole('button', { name: /Refresh|Retry/i }).click();
        await expect(frame.locator('[data-widget-state-surface="error"]')).toBeVisible();
        await expect(frame.locator('canvas:visible,time:visible,[aria-valuenow]:visible')).toHaveCount(0);
        for (const timestamp of previousTimes) await expect(frame.locator('[data-widget-shell]')).not.toContainText(timestamp);
        await expect(frame.locator('[data-widget-header]')).not.toContainText(/Observed|fresh|stale|\b\d{1,2}:\d{2}/i);
        const after = await frame.locator('[data-widget-shell]').boundingBox();
        expect(Math.abs(after!.height - before!.height), view).toBeLessThanOrEqual(1);
      }
    });
  }
}
