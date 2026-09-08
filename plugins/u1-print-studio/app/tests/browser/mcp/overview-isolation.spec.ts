import { expect, test, type Route } from '@playwright/test';

type Scenario = 'known' | 'unavailable' | 'unsupported' | 'unknown' | 'invalid-headline' | 'invalid-envelope' | 'request-error' | 'failed-stale' | 'age-stale';

// Use real fixture projections and the exact packaged resource, replacing only
// the bounded domain result needed to exercise host-delivered partial evidence.
const respond = async (route: Route, scenario: Scenario) => {
  const response = await route.fetch();
  const result = await response.json();
  const data = result.structuredContent;
  const receipt = { state: 'known', freshness: 'fresh', sourceObservedAt: data.sourceObservedAt, reason: null };
  Object.assign(data.module.tiles[3], { state: 'known', printState: 'standby', storageActive: false, receipts: { currentJob: receipt } });
  Object.assign(data.module.tiles[0], { state: 'known', printState: 'printing', percent: 50,
    currentLayer: 2, totalLayers: 4, estimatedRemainingSeconds: 120 });
  const history = data.module.tiles[4];
  Object.assign(history, {
    state: 'known', pageCount: 4,
    statusCounts: { in_progress: 0, completed: 4, cancelled: 0, error: 0, klippy_shutdown: 0, klippy_disconnect: 0, interrupted: 0, unknown: 0 },
    receipts: { jobHistory: receipt },
  });
  if (['unavailable', 'unsupported', 'unknown'].includes(scenario)) {
    Object.assign(history, {
      state: scenario, pageCount: null, statusCounts: null,
      receipts: { jobHistory: { state: scenario, freshness: 'unknown', sourceObservedAt: null,
        reason: scenario === 'unavailable' ? 'malformed' : scenario === 'unsupported' ? 'unsupported' : 'not_requested' } },
    });
  }
  if (scenario === 'failed-stale' || scenario === 'age-stale') {
    history.state = 'stale';
    history.receipts.jobHistory = { ...receipt, state: 'stale', freshness: 'stale', reason: scenario === 'failed-stale' ? 'timeout' : null };
  }
  if (scenario === 'invalid-headline') history.pageCount = -99;
  const available = data.module.tiles.filter((tile: { state: string }) => ['known', 'stale'].includes(tile.state)).length;
  data.module.coverage = available === 8 ? 'complete' : available ? 'partial' : 'none';
  if (scenario === 'invalid-envelope') data.module.tiles.pop();
  if (scenario === 'request-error') result.isError = true;
  result.content = [{ type: 'text', text: JSON.stringify(data) }];
  await route.fulfill({ response, json: result });
};

for (const scenario of ['unavailable', 'unsupported', 'unknown', 'invalid-headline', 'failed-stale'] as const) {
  test(`MCP Overview initial ${scenario} is isolated to its headline`, async ({ page, request }, info) => {
    await request.post('/fixture/configure', { data: { reset: true, bedMesh: true } });
    await page.setViewportSize({ width: 720, height: 1200 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/fixture/call', route => respond(route, scenario));
    await page.goto('/host?view=overview');
    const frame = page.frameLocator('iframe');
    await expect(frame.locator('[data-overview-tile]')).toHaveCount(8);
    await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage partial');
    await expect(frame.locator('[data-overview-tile="thermals"]')).toContainText('T1 220° / 200°');
    await expect(frame.locator('[data-overview-tile="bed_mesh"]')).toContainText('Active mesh');
    await expect(frame.locator('[data-overview-tile] .coverage.complete')).toHaveCount(7);
    const history = frame.locator('[data-overview-tile="job_history"]');
    const label = scenario === 'unsupported' ? 'Unsupported' : scenario === 'unknown' ? 'Not observed' : 'Unavailable';
    await expect(history.locator('.coverage')).toHaveText(label);
    await expect(history).not.toContainText('4 jobs');
    await expect(history).not.toContainText('4 completed');
    if (scenario === 'unavailable') await expect(history).toContainText('Invalid response');
    if (scenario === 'invalid-headline' || scenario === 'failed-stale') await expect(history).toContainText('Data could not be read');
    await expect(frame.getByRole('button', { name: 'Refresh observation', exact: true })).toBeEnabled();
    expect(errors).toEqual([]);
    await page.screenshot({ path: info.outputPath(`overview-${scenario}.png`), fullPage: true });
  });
}

for (const host of ['mcp', 'dashboard']) {
  test(`${host} Overview refresh isolates failed tile, recovers, and masks whole failures`, async ({ page, request }) => {
    await request.post('/fixture/configure', { data: { reset: true, bedMesh: true } });
    let scenario: Scenario = 'known';
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(host === 'mcp' ? '**/fixture/call' : '**/dashboard/tools/call', route => respond(route, scenario));
    await page.goto(host === 'mcp' ? '/host?view=overview' : '/dashboard/overview');
    const frame = page.frameLocator('iframe');
    const history = frame.locator('[data-overview-tile="job_history"]');
    const refresh = frame.getByRole('button', { name: /Refresh observation|Retry loading observation/ });
    await expect(history).toContainText('4 jobs returned');
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage complete');
    scenario = 'unavailable';
    await refresh.click();
    await expect(history.locator('.coverage')).toHaveText('Unavailable');
    await expect(history).not.toContainText('4 jobs');
    await expect(history).not.toContainText('4 completed');
    await expect(history.locator('time')).toHaveCount(0);
    await expect(frame.locator('[data-overview-tile="thermals"]')).toContainText('T1 220° / 200°');
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage partial');
    await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
    scenario = 'known';
    await refresh.click();
    await expect(history).toContainText('4 jobs returned');
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage complete');
    scenario = 'age-stale';
    await refresh.click();
    await expect(history.locator('.coverage')).toHaveText('Stale');
    await expect(history).toContainText('4 jobs returned');
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage complete');
    scenario = 'failed-stale';
    await refresh.click();
    await expect(history.locator('.coverage')).toHaveText('Unavailable');
    await expect(history).not.toContainText('4 jobs');
    await expect(history.locator('time')).toHaveCount(0);
    await expect(frame.locator('[data-overview-tile="thermals"]')).toContainText('T1 220° / 200°');
    await expect(frame.locator('.overview-coverage')).toHaveText('Coverage partial');
    for (const failure of ['request-error', 'invalid-envelope'] as const) {
      scenario = failure;
      await refresh.click();
      await expect(frame.locator('[data-observation-placeholder]')).toBeVisible();
      await expect(frame.locator('[data-overview-tile]')).toHaveCount(0);
      await expect(frame.getByText('4 jobs returned', { exact: true })).toHaveCount(0);
      await expect(frame.locator('time:visible')).toHaveCount(0);
      scenario = 'known';
      await refresh.click();
      await expect(history).toContainText('4 jobs returned');
      await expect(frame.locator('.overview-coverage')).toHaveText('Coverage complete');
    }
    expect(errors).toEqual([]);
  });
}
