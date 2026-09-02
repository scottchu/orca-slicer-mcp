import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

for (const file of ['camera-widget.html', 'legacy-camera-widget.html']) for (const width of [320, 390, 720]) for (const doubled of [false, true]) {
  test(`${file} acquisition skeleton and footer ${width} text200=${doubled}`, async ({ page }) => {
    const html = readFileSync(new URL(`../../../public/${file}`, import.meta.url), 'utf8');
    await page.setViewportSize({ width, height: 1400 }); await page.clock.install();
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.route('**/__camera-footer-host', route => route.fulfill({ contentType: 'text/html', body: `<style>body{margin:0}iframe{width:100%;height:1300px;border:0}</style><iframe src="/__camera-footer-widget"></iframe><script>window.__success=false;const canvas=document.createElement('canvas');canvas.width=16;canvas.height=9;window.__frame={structuredContent:{available:true,mediaType:'image/jpeg',observedAt:'2026-09-02T12:00:00Z'},_meta:{cameraFrame:{dataUrl:canvas.toDataURL('image/jpeg')}}};addEventListener('message',e=>{if(!e.data.id)return;const result=e.data.method==='ui/initialize'?{}:window.__success?window.__frame:{structuredContent:{available:false,mediaType:'image/jpeg'}};setTimeout(()=>e.source.postMessage({jsonrpc:'2.0',id:e.data.id,result},location.origin),100)})</script>` }));
    await page.route('**/__camera-footer-widget', route => route.fulfill({ contentType: 'text/html', body: html }));
    await page.goto('/__camera-footer-host');
    const frame = page.frames().find(value => value.url().endsWith('/__camera-footer-widget'))!;
    await frame.locator('#camera').waitFor();
    if (doubled) await frame.evaluate(() => {
      const visit = (rule: CSSRule): void => {
        if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
        if (!(rule instanceof CSSStyleRule)) return;
        const value = rule.style.getPropertyValue('font-size');
        if (value) rule.style.setProperty('font-size', value.replace(/([\d.]+)(px|vw)/g, (_, n, unit) => `${Number(n) * 2}${unit}`));
      };
      for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
    });
    const boxes = () => frame.locator('#dashboard,.camera-header,.camera-body,#camera,.camera-footer').evaluateAll(nodes => nodes.map(node => {
      const r = node.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height];
    }));
    const equal = (actual: number[][], expected: number[][]) => actual.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - expected[i][j]), `${i}/${j}`).toBeLessThanOrEqual(1)));
    const loading = await boxes();
    await page.clock.fastForward(101); await page.clock.fastForward(101);
    await expect(frame.locator('#camera-footer-status')).toHaveText('Could not load');
    equal(await boxes(), loading);
    const mask = async () => {
      await expect(frame.locator('#camera')).toHaveAttribute('data-acquisition-failed', 'true');
      await expect(frame.locator('#snapshot')).toHaveAttribute('aria-hidden', 'true');
      const visible = await frame.locator('#camera').evaluate(camera => {
        const skeleton = camera.querySelector('.camera-skeleton');
        const style = getComputedStyle(skeleton ?? camera, skeleton ? undefined : '::after');
        return style.visibility === 'visible' && style.animationName === 'none' && (skeleton ? style.opacity === '1' : style.content === '""');
      });
      expect(visible).toBe(true);
      expect(await frame.locator('#camera-footer-status').evaluate(node => node.parentElement?.contains(document.querySelector('#refresh-snapshot')))).toBe(true);
    };
    await mask();
    await page.evaluate(() => Object.assign(window, { __success: true }));
    await frame.locator('#refresh-snapshot').click();
    await expect(frame.locator('#camera-footer-status')).toHaveText('Could not load');
    await page.clock.fastForward(101);
    await expect(frame.locator('#camera')).toHaveAttribute('data-acquisition-failed', 'false');
    await expect(frame.locator('#camera-footer-status')).toHaveText('');
    const ready = await boxes();
    await page.evaluate(() => Object.assign(window, { __success: false }));
    await frame.locator('#refresh-snapshot').click(); await page.clock.fastForward(101);
    await expect(frame.locator('#camera-footer-status')).toHaveText('Could not load');
    await mask(); equal(await boxes(), ready);
    expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}
