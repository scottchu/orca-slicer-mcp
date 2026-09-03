import { expect, test } from '@playwright/test';

const views = {
  overview: 'Overview',
  progress: 'Print Progress',
  jobs: 'Current Job',
  job_history: 'Job History',
  bed_mesh: 'Bed Mesh',
};

for (const [view, title] of Object.entries(views)) {
  test(`dashboard current MCP ${view} initializes once, refreshes and fails neutral`, async ({ page, request }) => {
    await request.post('/fixture/configure', { data: { reset: true, bedMesh: true } });
    await page.setViewportSize({ width: 390, height: 1200 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/dashboard/${view}`);
    const frame = page.frameLocator('iframe');
    await expect(frame.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect.poll(async () => (await (await request.get('/fixture/state')).json()).calls).toEqual([
      { name: 'refresh_printer_observation', arguments: { view } },
    ]);
    const state = await (await request.get('/fixture/state')).json();
    expect(state.counts.statusReads).toBe(1);
    if (view === 'bed_mesh') {
      await expect(frame.locator('canvas')).toBeVisible();
      await expect(frame.getByRole('button', { name: 'Show 2D bed mesh' })).toBeEnabled();
    }
    const refresh = frame.getByRole('button', { name: /Refresh observation|Retry loading observation/ });
    await refresh.click();
    await expect.poll(async () => (await (await request.get('/fixture/state')).json()).calls).toEqual([
      { name: 'refresh_printer_observation', arguments: { view } },
      { name: 'refresh_printer_observation', arguments: { view } },
    ]);
    const before = await frame.locator('.instrument').boundingBox();
    if (view === 'bed_mesh') {
      await frame.locator('canvas').evaluate(canvas => {
        canvas.addEventListener('webglcontextlost', () => canvas.setAttribute('data-released', 'true'));
      });
    }
    await page.route('**/dashboard/tools/call', route => route.fulfill({ status: 503, json: { isError: true } }));
    await refresh.click();
    await expect(frame.locator('[data-observation-placeholder]')).toHaveAttribute('data-observation-placeholder', 'error');
    await expect(frame.locator('canvas:visible,time:visible,[aria-valuenow]:visible')).toHaveCount(0);
    if (view === 'bed_mesh') {
      await expect(frame.locator('[data-retained-observation]')).toHaveAttribute('inert', '');
      await expect(frame.locator('[data-retained-observation]')).toHaveAttribute('aria-hidden', 'true');
      await expect(frame.locator('[data-retained-observation] canvas')).toHaveAttribute('data-released', 'true');
    }
    const after = await frame.locator('.instrument:not([data-retained-observation])').boundingBox();
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
    await page.reload();
    await expect(frame.locator('[data-observation-placeholder]')).toHaveAttribute('data-observation-placeholder', 'error', { timeout: 3000 });
    expect(errors).toEqual([]);
  });
}
