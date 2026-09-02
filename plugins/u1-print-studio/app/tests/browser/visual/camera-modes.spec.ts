import { expect, test, type Frame } from '@playwright/test';

const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-media-slot],[data-icon-segmented]').evaluateAll(nodes => nodes.map(node => {
  const r = node.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height];
}));
const equal = (a: number[][], b: number[][]) => a.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - b[i][j]), `${i}/${j}`).toBeLessThanOrEqual(1)));
const enlarge = (frame: Frame) => frame.evaluate(() => {
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) [...(rule as CSSGroupingRule).cssRules].forEach(visit);
    if (!(rule instanceof CSSStyleRule)) return;
    const value = rule.style.getPropertyValue('font-size');
    if (value) rule.style.setProperty('font-size', value.replace(/([\d.]+)(px|vw)/g, (_, n, unit) => `${Number(n) * 2}${unit}`));
  };
  for (const sheet of document.styleSheets) [...sheet.cssRules].forEach(visit);
});

for (const width of [320, 390, 720]) for (const doubled of [false, true]) test(`Camera fixed modes and actual automatic fallback ${width} text200=${doubled}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 1400 }); await page.clock.install();
  const image = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 9; return canvas.toDataURL('image/jpeg'); });
  let frames = 0, opens = 0, rejectFrames = false;
  await page.route('**/dashboard/tools/call', async route => {
    const call = route.request().postDataJSON();
    if (call.name === 'get_u1_camera_frame') {
      frames++;
      await route.fulfill({ json: rejectFrames ? { structuredContent: { available: false } } : { structuredContent: { schemaVersion: 1, available: true, mediaType: 'image/jpeg', byteLength: Buffer.from(image.split(',')[1], 'base64').length, observedAt: `2026-09-02T12:00:${String(frames).padStart(2, '0')}.000Z` }, _meta: { cameraFrame: { dataUrl: image }, cameraActivation: { token: 'fixture-activation' } } } });
    } else if (call.name === 'open_u1_camera_stream') { opens++; await route.fulfill({ json: { structuredContent: { available: false } } }); }
    else if (call.name === 'close_u1_camera_stream') await route.fulfill({ json: { structuredContent: { closed: true } } });
    else throw new Error('Unexpected Camera mode fixture call');
  });
  await page.goto('/dashboard/camera');
  const frame = page.frames().find(value => value.url().endsWith('/dashboard/camera_widget'))!;
  await expect(frame.locator('img')).toBeVisible();
  if (doubled) await enlarge(frame);
  const modes = frame.getByRole('radiogroup', { name: 'Camera mode' });
  const fullscreen = frame.getByRole('button', { name: 'Fullscreen', exact: true });
  const track = modes.locator('.track');
  await expect(modes).toHaveCSS('width', '132px');
  await expect(track).toHaveCSS('height', '44px');
  expect(await track.boundingBox()).toEqual(await modes.boundingBox());
  expect((await track.boundingBox())!.height).toBe((await fullscreen.boundingBox())!.height);
  await expect(modes.locator('.thumb')).toHaveCSS('height', '40px');
  expect(await modes.getByRole('radio').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')))).toEqual(['Snapshot', 'Live', 'Auto']);
  await expect(modes.getByRole('radio')).toHaveText(['', '', '']);
  const original = await bounds(frame);
  await page.screenshot({ path: info.outputPath('camera-snapshot.png'), fullPage: true });
  const live = modes.getByRole('radio', { name: 'Live', exact: true });
  await live.focus(); await live.press('Enter');
  await expect.poll(() => opens).toBe(1);
  await expect(modes.getByRole('radio', { name: 'Auto', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(live).toBeFocused();
  await expect(frame.locator('[data-footer-status]')).toBeVisible();
  await expect(frame.locator('img')).toBeHidden();
  await expect(frame.locator('[data-media-fps]')).toHaveCount(0);
  equal(await bounds(frame), original);
  const hitTargets = await modes.getByRole('radio').evaluateAll(nodes => nodes.map(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, insideMedia: !!node.closest('[data-media-surface]') })));
  hitTargets.forEach(box => { expect(box.width).toBe(44); expect(box.height).toBe(44); expect(box.insideMedia).toBe(true); });
  await expect(modes).toHaveCSS('width', '132px');
  const first = frames; await page.clock.fastForward(1600); await expect.poll(() => frames).toBeGreaterThan(first);
  await expect(frame.locator('img')).toBeVisible();
  await expect(frame.locator('[data-media-status]')).toContainText('Auto');
  const time = await frame.locator('[data-media-status] time').getAttribute('datetime');
  const second = frames; await page.clock.fastForward(1600); await expect.poll(() => frames).toBeGreaterThan(second);
  await expect(frame.locator('[data-media-status] time')).not.toHaveAttribute('datetime', time!);
  equal(await bounds(frame), original);
  rejectFrames = true;
  await frame.getByRole('button', { name: 'Refresh snapshot' }).click();
  await expect(frame.locator('[data-footer-status]')).toBeVisible(); equal(await bounds(frame), original);
  const beforeStop = frames;
  await modes.getByRole('radio', { name: 'Snapshot', exact: true }).click();
  await expect(modes.getByRole('radio', { name: 'Snapshot', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect.poll(() => frames).toBe(beforeStop + 1);
  const stopped = frames; await page.clock.fastForward(4000); expect(frames).toBe(stopped);
  expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.screenshot({ path: info.outputPath('camera-fixed-modes.png'), fullPage: true });
});
