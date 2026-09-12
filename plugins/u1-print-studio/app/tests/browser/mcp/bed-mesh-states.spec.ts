import { expect, test } from '@playwright/test';
import { liveBedMeshResult } from '../fixtures/live-bed-mesh';
import { unavailableBedMesh } from '../../../src/lib/server/application/bed-mesh-observation';
import { doubleSyntheticText } from '../helpers/text-scale';

type Scenario = 'ready' | 'error' | 'unknown' | 'no-active' | 'stale-no-active' | 'unsupported' | 'not-reported' | 'retained-not-reported';

for (const { width, scale } of [{ width: 390, scale: 100 }, { width: 320, scale: 200 }] as const) {
  test(`MCP Bed visible successful states and retry focus ${width} text=${scale}`, async ({ page, request }) => {
    await request.post('/fixture/configure', { data: { reset: true, bedMesh: true } });
    await page.setViewportSize({ width, height: 1200 });
    let scenario: Scenario = 'ready', version = 100;
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/fixture/call', route => {
      const at = new Date(Date.parse('2026-09-01T12:00:00Z') + ++version * 1000).toISOString();
      const override = scenario === 'unknown' ? unavailableBedMesh('not_requested', at)
        : scenario === 'unsupported' ? unavailableBedMesh('unsupported', at)
        : scenario === 'not-reported' ? unavailableBedMesh('not_reported', at)
        : scenario === 'retained-not-reported' ? { state: 'stale' as const, freshness: 'stale' as const, reason: 'not_reported' as const, checkedAt: at }
        : scenario === 'no-active' || scenario === 'stale-no-active' ? {
          status: 'no_active_mesh' as const, matrix: null, bounds: null, summary: null,
          ...(scenario === 'stale-no-active' ? { state: 'stale' as const, freshness: 'stale' as const } : {}),
        } : { profile: 'Reported profile ' + 'x'.repeat(60) };
      return route.fulfill({ json: scenario === 'error' ? { isError: true, content: [{ type: 'text', text: 'Synthetic acquisition failed' }] }
        : liveBedMeshResult(version, at, override) });
    });
    await page.goto('/host?view=bed_mesh');
    const frame = page.frameLocator('iframe');
    await expect(frame.getByRole('radio', { name: '2D grid' })).toBeVisible();
    const child = page.frames().find(candidate => candidate.url() === 'about:srcdoc')!;
    if (scale === 200) await doubleSyntheticText(child);
    await frame.getByRole('radio', { name: '2D grid' }).click();
    await expect(frame.locator('.mesh-kicker')).toContainText('Reported profile ' + 'x'.repeat(60));
    expect(await frame.locator('.summary').innerText()).toMatch(/MINIMUM\s+-0\.200\s+mm\s+MAXIMUM\s+0\.300\s+mm\s+RANGE\s+0\.500\s+mm/);
    // Check rendered glyph bounds, not merely page overflow or element boxes.
    expect(await frame.locator('.summary > div').evaluateAll(items => items.flatMap(item => {
      const allocation = item.getBoundingClientRect();
      return [...item.querySelectorAll('dt, dd')].flatMap(label => {
        const range = document.createRange(); range.selectNodeContents(label);
        return [...range.getClientRects()].filter(box => box.width > 0 && box.height > 0)
          .filter(box => box.left < allocation.left - 1 || box.right > allocation.right + 1)
          .map(box => ({ text: label.textContent, left: box.left, right: box.right, allocation: [allocation.left, allocation.right] }));
      });
    }))).toEqual([]);
    const geometry = () => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-chart-frame]').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
    }));
    const ready = await geometry();
    scenario = 'error';
    await frame.getByRole('button', { name: 'Refresh Bed Mesh' }).click();
    await expect(frame.locator('[data-footer-status]')).toHaveText('Could not load');
    expect(await frame.locator('.mesh-kicker').innerText()).not.toContain('Reported profile');
    expect(await geometry()).toEqual(ready);
    await expect(frame.locator('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
    scenario = 'ready';
    const retry = frame.getByRole('button', { name: 'Retry bed mesh' });
    await retry.focus(); await retry.press('Enter');
    await expect(frame.getByRole('radio', { name: '2D grid' })).toBeFocused();

    for (const [next, label] of [
      ['unknown', 'Not observed'], ['no-active', 'No active mesh'], ['stale-no-active', 'No active mesh'],
      ['unsupported', 'Endpoint unsupported'], ['not-reported', 'Object not reported'], ['retained-not-reported', 'Object not reported'],
    ] as const) {
      scenario = next;
      await frame.getByRole('button', { name: 'Refresh Bed Mesh' }).click();
      const status = frame.locator('[data-footer-status]');
      await expect(status).toBeVisible();
      await expect.poll(() => status.innerText()).toBe(label);
      // innerText deliberately excludes hidden live announcements and title/aria labels.
      expect(await frame.locator('[data-widget-shell]').innerText()).not.toContain('Could not load');
      if (next === 'stale-no-active') expect(await frame.locator('[data-observed-meta]').innerText()).toContain('Stale');
      if (next === 'retained-not-reported') {
        await expect(frame.locator('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
        expect(await frame.locator('[data-retained-layer]').evaluate(node => (node as HTMLElement).inert)).toBe(true);
      }
      expect(await child.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const statusBounds = await status.boundingBox();
      const refreshBounds = await frame.getByRole('button', { name: 'Refresh Bed Mesh' }).boundingBox();
      expect(statusBounds!.x + statusBounds!.width).toBeLessThanOrEqual(refreshBounds!.x);
    }
    expect(errors).toEqual([]);
  });
}
