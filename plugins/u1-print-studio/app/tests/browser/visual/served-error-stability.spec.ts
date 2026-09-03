import { expect, test, type Frame } from '@playwright/test';
import { liveHeadsResult } from '../fixtures/live-heads';
import { liveFansResult } from '../fixtures/live-fans';
import { liveThermalsResult } from '../fixtures/live-thermals';
import { liveQueueResult } from '../fixtures/live-queue';

const factories = { heads: liveHeadsResult, fans: liveFansResult, thermals: liveThermalsResult, queue: () => liveQueueResult() };
const geometry = (frame: Frame, legacy = false) => frame.locator(legacy ? '.instrument,.instrument-header,.u1-body,.instrument-footer' : '[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer]').evaluateAll(nodes => nodes.map(node => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));
const equal = (actual: number[][], expected: number[][]) => {
  expect(actual.length).toBe(expected.length);
  actual.forEach((row, index) => row.forEach((value, axis) => expect(Math.abs(value - expected[index][axis]), `region${index}/${axis}`).toBeLessThanOrEqual(1)));
};
const enlarge = (frame: Frame) => frame.evaluate(() => {
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
    if (!(rule instanceof CSSStyleRule)) return;
    const size = rule.style.getPropertyValue('font-size');
    if (size) rule.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
      const value = rule.style.getPropertyValue(token); if (value.endsWith('px')) rule.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
    }
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const notify = (frame: Frame, result: unknown) => frame.parentFrame()!.evaluate(value => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, location.origin), result);
const unavailable = (view: keyof typeof factories, state: 'unavailable' | 'unsupported', epoch = 3) => {
  const result = factories[view]();
  const module = { ...result.structuredContent.module, state } as Record<string, unknown>;
  if (view === 'queue') Object.assign(module, { freshness: 'unknown', sourceObservedAt: null, receivedAt: null, checkedAt: null, queueState: null, totalCount: null, items: [], truncated: false, reason: state === 'unsupported' ? 'unsupported' : 'network', capabilityEvidence: state === 'unsupported' ? 'unsupported' : 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: 'Fixture unavailable' } });
  return { structuredContent: { ...result.structuredContent, observationVersion: 50, receivedAt: '2026-09-02T12:00:00.000Z', connectionEpoch: epoch, module } };
};

for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`four served Svelte error frames ${width} text200=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 }); await page.clock.install();
    for (const view of Object.keys(factories) as (keyof typeof factories)[]) {
      let release = (_value: unknown) => {}, calls = 0;
      await page.route('**/dashboard/tools/call', async route => { calls++; const result = await new Promise(resolve => { release = resolve; }); await route.fulfill({ json: result }); });
      await page.goto(`/dashboard/${view}`); await expect.poll(() => calls).toBe(1);
      const frame = page.frames().find(value => value.url().endsWith(`/dashboard/${view}_widget`))!;
      if (doubled) await enlarge(frame);
      const loading = await geometry(frame);
      release({ isError: true });
      await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
      await page.clock.fastForward(21000);
      await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
      equal(await geometry(frame), loading);
      await expect(frame.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
      await expect(frame.getByRole('status')).toHaveCount(1);
      expect(await frame.locator('[data-skeleton],[data-loading-value],[data-loading-value] span').evaluateAll(nodes => nodes.length > 0 && nodes.every(node => getComputedStyle(node).animationName === 'none'))).toBe(true);
      const refresh = frame.locator('[data-widget-footer] button');
      await refresh.focus(); await refresh.press('Enter'); await expect.poll(() => calls).toBe(2);
      release(unavailable(view, 'unsupported'));
      await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', /endpoint unsupported/);
      equal(await geometry(frame), loading);
      await refresh.press('Enter'); await expect.poll(() => calls).toBe(3); release({ structuredContent: { ...factories[view]().structuredContent, receivedAt: '2026-09-02T12:00:01.000Z', observationVersion: 51 } });
      await expect(frame.locator('[data-footer-status]')).toBeHidden();
      const ready = await geometry(frame), receipts = await frame.locator('[data-observed-meta]').allTextContents(), content = await frame.locator('[data-widget-body]').textContent();
      await refresh.press('Enter'); await expect.poll(() => calls).toBe(4); release({ isError: true });
      await expect(frame.locator('[data-footer-status]')).toContainText('Could not load');
      equal(await geometry(frame), ready); await expect(refresh).toBeFocused();
      expect(await frame.locator('[data-observed-meta]').allTextContents()).not.toEqual(receipts);
      const failed = unavailable(view, 'unavailable'); failed.structuredContent.receivedAt = '2026-09-02T12:00:02.000Z';
      await notify(frame, failed); await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', /unavailable/);
      await page.clock.fastForward(6000);
      await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', /unavailable/);
      equal(await geometry(frame), ready); expect(await frame.locator('[data-widget-body]').textContent()).not.toBe(content);
      expect(await frame.locator('[data-observed-meta]').allTextContents()).not.toEqual(receipts);
      for (let attempt = 0; attempt < 2; attempt++) {
        await refresh.press('Enter'); await expect.poll(() => calls).toBe(5 + attempt);
        await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', /unavailable/);
        release(failed);
        await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
        await expect(frame.locator('[data-footer-status]')).toHaveAttribute('aria-label', /unavailable/);
        equal(await geometry(frame), ready); await expect(refresh).toBeFocused();
        expect(await frame.locator('[data-observed-meta]').allTextContents()).not.toEqual(receipts);
      }
      expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.unroute('**/dashboard/tools/call');
    }
  });
}
