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
      await expect(frame.getByRole('radio', { name: '2D grid' })).toBeEnabled();
    }
    const refresh = frame.getByRole('button', { name: /Refresh|Retry/i });
    await refresh.click();
    await expect.poll(async () => (await (await request.get('/fixture/state')).json()).calls).toEqual([
      { name: 'refresh_printer_observation', arguments: { view } },
      { name: 'refresh_printer_observation', arguments: { view } },
    ]);
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'ready');
    const before = await frame.locator('[data-widget-shell]').boundingBox();
        const previousTimes = (await frame.locator('[data-widget-shell]').innerText()).match(/\b\d{1,2}:\d{2}:\d{2}\b/g) ?? [];
        if (view === 'progress' || view === 'overview') expect(previousTimes.length).toBeGreaterThan(0);
    const retainedCanvas = view === 'bed_mesh' ? await frame.locator('canvas').elementHandle() : null;
    await page.route('**/dashboard/tools/call', route => route.fulfill({ status: 503, json: { isError: true } }));
    await refresh.click();
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'error');
    await expect(frame.locator('canvas:visible,time:visible,[aria-valuenow]:visible')).toHaveCount(0);
        for (const timestamp of previousTimes) await expect(frame.locator('[data-widget-shell]')).not.toContainText(timestamp);
        await expect(frame.locator('[data-widget-header]')).not.toContainText(/Observed|fresh|stale|\b\d{1,2}:\d{2}/i);
    if (view === 'bed_mesh') {
      expect(await retainedCanvas!.evaluate(node => node === document.querySelector('canvas'))).toBe(true);
      await expect(frame.locator('[data-retained-layer]')).toHaveAttribute('inert', '');
      await expect(frame.locator('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
    }
    const after = await frame.locator('[data-widget-shell]').boundingBox();
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
    await page.reload();
    await expect(frame.locator('[data-widget-state-surface]')).toHaveAttribute('data-widget-state-surface', 'error', { timeout: 3000 });
    expect(errors).toEqual([]);
  });
}
