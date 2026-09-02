import { expect, test, type Frame } from '@playwright/test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../../public/widget.html', import.meta.url), 'utf8');
const notify = (frame: Frame, result: unknown) => frame.parentFrame()!.evaluate(value => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, location.origin), result);
const boxes = (frame: Frame) => frame.locator('.instrument:not([data-retained-observation]),.instrument:not([data-retained-observation])>.u1-header,.instrument:not([data-retained-observation])>.u1-body,.instrument:not([data-retained-observation])>.u1-footer').evaluateAll(nodes => nodes.map(node => {
  const r = node.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height];
}));
const equal = (actual: number[][], expected: number[][]) => actual.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - expected[i][j]), `${i}/${j}`).toBeLessThanOrEqual(1)));
const result = (rows: number, unknown = false) => ({ structuredContent: {
  view: 'queue', connectionEpoch: 3, sourceObservedAt: '2026-09-02T12:00:00Z', freshness: 'fresh',
  module: { kind: 'queue', state: unknown ? 'unknown' : 'known', queueState: 'ready', totalCount: rows, truncated: false,
    sourceObservedAt: '2026-09-02T12:00:00Z', freshness: 'fresh',
    items: Array.from({ length: rows }, (_, i) => ({ position: i + 1, filename: `private-fixture-${i}.gcode`, timeAdded: null, timeInQueueSeconds: null })) }
} });

for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`legacy short allocations and retry ${width} text200=${doubled}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1800 });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.route('**/__allocation-host', route => route.fulfill({ contentType: 'text/html', body: `<style>body{margin:0}iframe{width:100%;height:1700px;border:0}</style><iframe src="/__allocation-widget?view=queue"></iframe><script>addEventListener('message',e=>{if(e.data.method==='ui/initialize')e.source.postMessage({jsonrpc:'2.0',id:e.data.id,result:{}},location.origin)})</script>` }));
    await page.route('**/__allocation-widget?*', route => route.fulfill({ contentType: 'text/html', body: html }));
    await page.goto('/__allocation-host');
    const frame = page.frames().find(frame => frame.url().includes('/__allocation-widget'))!;
    await frame.locator('.instrument').waitFor();
    if (doubled) await frame.evaluate(() => {
      const visit = (rule: CSSRule): void => {
        if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
        if (!(rule instanceof CSSStyleRule)) return;
        for (const property of ['font-size', '--u1-size-title', '--u1-size-meta', '--u1-size-body']) {
          const value = rule.style.getPropertyValue(property);
          if (value) rule.style.setProperty(property, value.replace(/([\d.]+)(px|vw)/g, (_, n, unit) => `${Number(n) * 2}${unit}`));
        }
      };
      for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
    });
    for (const [rows, unknown] of [[0, false], [1, false], [20, false], [0, true]] as const) {
      await notify(frame, result(rows, unknown));
      await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
      const ready = await boxes(frame);
      await notify(frame, { structuredContent: { view: 'queue', connectionEpoch: 3, module: { kind: 'queue', state: 'unavailable' } } });
      await expect(frame.locator('.refresh-error')).toHaveText('Could not load');
      equal(await boxes(frame), ready);
      await expect(frame.locator('time,[title*="private-fixture"],[aria-label*="private-fixture"]')).toHaveCount(0);
      await expect(frame.locator('.u1-body')).not.toContainText('private-fixture');
      expect(await frame.locator('.neutral-allocation').evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
      await frame.getByRole('button', { name: 'Retry loading observation' }).click();
      await expect(frame.locator('.refresh-error')).toHaveText('Could not load');
      equal(await boxes(frame), ready);
      // A fresh accepted host result also exercises recovery while a prior
      // refresh is pending; no extra acquisition is invented by the renderer.
      await notify(frame, result(rows, unknown));
      await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
    }
    const fail = async () => {
      await notify(frame, { structuredContent: { view: 'queue', connectionEpoch: 3, module: { kind: 'queue', state: 'unavailable' } } });
      await expect(frame.locator('.neutral-allocation')).toHaveCount(1);
    };
    await fail();
    await page.setViewportSize({ width: width === 720 ? 390 : 720, height: 1800 });
    await expect(frame.locator('.neutral-allocation')).toHaveCount(0);
    await expect(frame.locator('.refresh-error')).toHaveText('Could not load');
    await notify(frame, result(1));
    await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
    await fail();
    await frame.locator('.u1-title').evaluate(node => { (node as HTMLElement).style.fontSize = `${Number.parseFloat(getComputedStyle(node).fontSize) * 2}px`; });
    await expect(frame.locator('.neutral-allocation')).toHaveCount(0);
    await notify(frame, result(1));
    await expect(frame.locator('[data-observation-placeholder]')).toHaveCount(0);
    expect(await frame.locator('.u1-body').evaluate(node => (node as HTMLElement).style.height)).toBe('');
    expect(errors).toEqual([]);
  });
}
