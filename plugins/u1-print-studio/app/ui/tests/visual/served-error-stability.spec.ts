import { expect, test, type Frame } from '@playwright/test';
import { readFileSync } from 'node:fs';
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

const legacyHtml = readFileSync(new URL('../../../public/widget.html', import.meta.url), 'utf8');
const combinedHtml = readFileSync(new URL('../../../public/legacy-widget.html', import.meta.url), 'utf8');
for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`nine legacy observation aliases static error anatomy ${width} text200=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 }); await page.clock.install();
    await page.route('**/__legacy-host*', route => route.fulfill({ contentType: 'text/html', body: `<iframe style="width:100%;height:1400px;border:0" src="/widget?view=${new URL(route.request().url()).searchParams.get('view')}"></iframe><style>body{margin:0}</style><script>addEventListener('message',e=>{if(e.data.method==='ui/initialize')e.source.postMessage({jsonrpc:'2.0',id:e.data.id,result:{}},location.origin)})</script>` }));
    await page.route('**/widget?*', route => route.fulfill({ contentType: 'text/html', body: legacyHtml }));
    for (const view of ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh']) {
      await page.goto(`/__legacy-host?view=${view}`);
      const frame = page.frames().find(value => value.url().includes('/widget?'))!;
      await expect(frame.locator('[data-observation-placeholder]')).toHaveAttribute('aria-busy', 'true');
      if (doubled) await enlarge(frame);
      const loading = await geometry(frame, true);
      await page.clock.fastForward(15001);
      await expect(frame.locator('[data-observation-placeholder]')).toHaveAttribute('data-observation-placeholder', 'error');
      equal(await geometry(frame, true), loading);
      for (const state of ['unavailable', 'unsupported']) {
        await notify(frame, { structuredContent: { view, module: { kind: view, state } } });
        await expect(frame.locator('[data-observation-placeholder]')).toHaveAttribute('aria-busy', 'false');
        equal(await geometry(frame, true), loading);
        await expect(frame.locator('canvas,video,time,[aria-valuenow]')).toHaveCount(0);
        expect(await frame.locator('.neutral-value').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none'))).toBe(true);
      }
      await page.clock.fastForward(21000);
      await expect(frame.getByRole('status')).toHaveAttribute('aria-label', /unsupported/);
      expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}

for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`combined status aliases retain neutral errors ${width} text200=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1800 }); await page.clock.install();
    await page.addInitScript(() => { Object.assign(window, { openai: { widgetState: { autoRefresh: false } } }); });
    await page.route('**/__combined-host', route => route.fulfill({ contentType: 'text/html', body: `<iframe style="width:100%;height:1700px;border:0" src="/__combined-widget"></iframe><style>body{margin:0}</style><script>addEventListener('message',e=>{if(!e.data.id)return;const result=e.data.method==='ui/initialize'?{}:e.data.params?.name==='get_u1_camera_frame'?window.__cameraResult:null;setTimeout(()=>e.source.postMessage({jsonrpc:'2.0',id:e.data.id,...(result?{result}:{error:{message:'Synthetic failure'}})},location.origin),e.data.method==='ui/initialize'?0:2000)})</script>` }));
    await page.route('**/__combined-widget', route => route.fulfill({ contentType: 'text/html', body: combinedHtml }));
    await page.goto('/__combined-host');
    const frame = page.frames().find(value => value.url().endsWith('/__combined-widget'))!;
    await frame.locator('#dashboard').waitFor(); if (doubled) await enlarge(frame);
    const boxes = () => frame.locator('#dashboard,#status-row,#progress-section,.metric,#freshness,.footer').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
    }));
    const loading = await boxes();
    await page.clock.fastForward(1);
    await frame.locator('#refresh').click();
    await page.clock.fastForward(2001);
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    await expect(frame.locator('#notice')).toHaveAttribute('aria-label', 'Refresh failed');
    equal(await boxes(), loading);
    await expect(frame.locator('#dashboard')).toHaveAttribute('aria-busy', 'false');
    expect(await frame.locator('#status-row,#progress-section,.metric,#freshness').evaluateAll(nodes => nodes.every(node => node.getAttribute('aria-hidden') === 'true'))).toBe(true);
    await expect(frame.locator('[aria-valuenow]')).toHaveCount(0);
    expect(await frame.locator('.skeleton-target').evaluateAll(nodes => nodes.every(node => getComputedStyle(node, '::after').animationName === 'none'))).toBe(true);
    await page.clock.fastForward(21000); equal(await boxes(), loading);
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    await expect(frame.locator('#notice')).toHaveAttribute('aria-label', 'Refresh failed');
    await frame.locator('#refresh').click();
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    await expect(frame.locator('#dashboard')).toHaveAttribute('data-status-failed', 'true');
    await expect(frame.locator('#dashboard')).toHaveAttribute('aria-busy', 'false');
    expect(await frame.locator('.skeleton-target').evaluateAll(nodes => nodes.every(node => getComputedStyle(node, '::after').animationName === 'none'))).toBe(true);
    equal(await boxes(), loading);
    await page.clock.fastForward(2001);
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    const readyStatus = { structuredContent: { reachable: true, state: 'printing', stateLabel: 'Printing', progressPercent: 64, currentLayer: 416, totalLayers: 650, filename: 'Public fixture.gcode', activePhysicalTool: 1, tools: [{ physicalTool: 1, active: true, temperature: 220, target: 220, state: 'active' }], bed: { temperature: 55, target: 55 }, elapsedSeconds: 1000, remainingSeconds: 2000, observedAt: '2026-09-02T12:00:00.000Z', refreshAfterSeconds: 30, camera: { available: true } } };
    await notify(frame, readyStatus);
    const image = await frame.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 9; return canvas.toDataURL('image/jpeg'); });
    const cameraResult = { structuredContent: { available: true, mediaType: 'image/jpeg', observedAt: '2026-09-02T12:00:00Z' }, _meta: { cameraFrame: { dataUrl: image } } };
    await page.evaluate(result => Object.assign(window, { __cameraResult: result }), cameraResult);
    await notify(frame, cameraResult);
    await expect(frame.locator('#camera')).toHaveClass(/has-snapshot/);
    await expect(frame.locator('#notice')).toBeHidden();
    const ready = await boxes();
    await notify(frame, { structuredContent: { reachable: false } });
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    equal(await boxes(), ready);
    await expect(frame.locator('#observed')).toHaveText('');
    await expect(frame.locator('#filename')).toHaveText('');
    await expect(frame.locator('#filename')).not.toHaveAttribute('title');
    await notify(frame, readyStatus);
    await expect(frame.locator('#notice')).toBeHidden();
    await expect(frame.locator('#filename')).toHaveText('Public fixture.gcode');
    equal(await boxes(), ready);
    await notify(frame, { structuredContent: { reachable: false } });
    await frame.locator('#observed').evaluate(node => { (node as HTMLElement).style.fontSize = `${Number.parseFloat(getComputedStyle(node).fontSize) * 0.75}px`; });
    await expect.poll(() => frame.locator('#freshness').evaluate(node => (node as HTMLElement).style.width)).toBe('');
    await notify(frame, readyStatus);
    await expect(frame.locator('#notice')).toBeHidden();
    await notify(frame, { structuredContent: { reachable: false } });
    const resized = width === 720 ? 320 : 720;
    await page.setViewportSize({ width: resized, height: 1800 });
    await expect.poll(() => frame.locator('#freshness').evaluate(node => (node as HTMLElement).style.width)).toBe('');
    await expect(frame.locator('#notice')).toHaveText('Could not load');
    expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(resized);
  });
}
