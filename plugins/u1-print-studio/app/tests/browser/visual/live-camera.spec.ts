import { expect, test, type Frame } from '@playwright/test';
import { installCameraPeerFixture } from '../fixtures/live-camera';

const doubleText = (frame: Frame) => frame.evaluate(() => {
  const visit = (item: CSSRule): void => {
    if ('cssRules' in item) for (const child of (item as CSSGroupingRule).cssRules) visit(child);
    if (!(item instanceof CSSStyleRule)) return;
    const size = item.style.getPropertyValue('font-size');
    if (size) item.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});
const geometry = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-media-slot]').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`real Camera host snapshot and persistent media ${width}, enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    const errors: string[] = [], outside: string[] = [], calls: { name: string; arguments: Record<string, unknown> }[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(test.info().project.use.baseURL!).origin) outside.push(request.url()); });
    await page.addInitScript(installCameraPeerFixture);
    const image = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 18; const context = canvas.getContext('2d')!; context.fillStyle = '#edf1f4'; context.fillRect(0, 0, 32, 18); return canvas.toDataURL('image/jpeg'); });
    const payload = { structuredContent: { schemaVersion: 1, available: true, observedAt: '2026-09-01T12:00:00.000Z', mediaType: 'image/jpeg', byteLength: Buffer.from(image.split(',')[1], 'base64').length }, _meta: { cameraFrame: { dataUrl: image }, cameraActivation: { token: 'fixture-activation-capability' } } };
    let release = () => {};
    await page.route('**/dashboard/tools/call', async (route) => {
      const call = route.request().postDataJSON(); calls.push(call);
      if (call.name === 'get_u1_camera_frame') {
        if (calls.length === 1) await new Promise<void>((resolve) => { release = resolve; });
        await route.fulfill({ json: payload });
      } else if (call.name === 'open_u1_camera_stream') await route.fulfill({ json: { structuredContent: { schemaVersion: 2, available: true }, _meta: { cameraStream: { transport: 'mcp-apps-tools', sessionId: 'fixture-session-capability', offer: { type: 'offer', sdp: 'fixture-downstream-offer' }, iceServers: [] } } } });
      else if (call.name === 'answer_u1_camera_stream') await route.fulfill({ json: { structuredContent: { accepted: true } } });
      else if (call.name === 'close_u1_camera_stream') await route.fulfill({ json: { structuredContent: { closed: true } } });
      else throw new Error('Unexpected camera fixture call');
    });
    await page.goto('/dashboard/camera'); await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((candidate) => candidate.url().endsWith('/dashboard/camera_widget'))!;
    if (enlarged) await doubleText(frame);
    await expect(frame.getByRole('radio')).toHaveCount(2); await expect(frame.getByRole('status')).toHaveText('Loading camera');
    const before = await geometry(frame); release();
    await expect(frame.locator('[data-media-status]')).toContainText('Auto');
    await expect(frame.locator('img')).toBeVisible();
    expect(await geometry(frame)).toEqual(before);
    if (!enlarged) {
      const header = await frame.locator('[data-widget-header]').boundingBox(), status = await frame.locator('[data-media-status]').boundingBox(), title = await frame.locator('h1').boundingBox();
      expect(status!.y).toBeLessThan(title!.y + title!.height); expect(status!.x).toBeGreaterThan(title!.x + title!.width - 1); expect(status!.y + status!.height).toBeLessThan(header!.y + header!.height);
    }
    await frame.getByRole('radio', { name: 'Live', exact: true }).click();
    await expect(frame.locator('[data-media-status]')).toContainText('Live');
    await expect(frame.locator('[data-media-fps]')).toContainText('FPS', { timeout: 7000 });
    await frame.evaluate(() => Object.assign(window, { __videoBefore: document.querySelector('video'), __streamBefore: document.querySelector('video')!.srcObject }));
    expect(await geometry(frame)).toEqual(before);
    if (width === 390 && !enlarged) {
      // Actual native fullscreen when supplied by Chromium.
      if (await frame.evaluate(() => document.fullscreenEnabled)) {
        await frame.getByRole('button', { name: 'Fullscreen', exact: true }).click();
        await expect.poll(() => frame.evaluate(() => !!document.fullscreenElement)).toBe(true);
        await frame.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
        await expect.poll(() => frame.evaluate(() => !!document.fullscreenElement)).toBe(false);
      }
    }
    // Exercise the local viewport fallback as required by Safari/mobile.
    if (width === 590 && !enlarged) {
      const pip = frame.getByRole('button', { name: 'Picture in picture', exact: true });
      if (await pip.count()) {
        await pip.click();
        await expect.poll(() => frame.evaluate(() => !!document.pictureInPictureElement || document.querySelector('[data-media-feedback]')?.textContent === 'PiP unavailable')).toBe(true);
        const entered = await frame.evaluate(() => !!document.pictureInPictureElement);
        test.info().annotations.push({ type: 'native-pip', description: entered ? 'Native Chromium entered and exited PiP' : 'Native API rejected; playback retained' });
        if (entered) await frame.getByRole('button', { name: 'Exit picture in picture' }).click();
        expect(await geometry(frame)).toEqual(before);
      }
      // Safari API-contract emulation is not actual Safari/device evidence.
      await frame.evaluate(() => {
        Object.defineProperty(document, 'pictureInPictureEnabled', { value: false, configurable: true });
        const video = document.querySelector('video')! as HTMLVideoElement & { webkitPresentationMode: string; webkitSupportsPresentationMode: () => boolean; webkitSetPresentationMode: (mode: string) => void };
        video.webkitPresentationMode = 'inline'; video.webkitSupportsPresentationMode = () => true;
        video.webkitSetPresentationMode = (mode) => { video.webkitPresentationMode = mode; video.dispatchEvent(new Event('webkitpresentationmodechanged')); };
        video.dispatchEvent(new Event('webkitpresentationmodechanged'));
      });
      await frame.getByRole('button', { name: 'Picture in picture', exact: true }).click();
      await frame.getByRole('button', { name: 'Exit picture in picture' }).click();
      await frame.evaluate(() => {
        Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
        document.querySelector<HTMLElement>('[data-media-surface]')!.requestFullscreen = async () => { throw new Error('Fixture display rejection'); };
      });
      await frame.getByRole('button', { name: 'Fullscreen', exact: true }).click();
      await expect(frame.locator('[data-media-feedback]')).toHaveText('Fullscreen unavailable');
      expect(await geometry(frame)).toEqual(before);
    }
    await frame.evaluate(() => Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true }));
    await frame.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(frame.locator('[data-media-feedback]')).toHaveText('Fullscreen unavailable');
    await expect(frame.getByRole('button', { name: 'Exit fullscreen', exact: true })).toHaveCount(0);
    expect(await geometry(frame)).toEqual(before);
    expect(await frame.evaluate(() => { const probe = window as unknown as { __videoBefore: HTMLVideoElement; __streamBefore: MediaStream }; return document.querySelector('video') === probe.__videoBefore && document.querySelector('video')!.srcObject === probe.__streamBefore && probe.__streamBefore.getVideoTracks()[0].readyState === 'live'; })).toBe(true);
    await expect(frame.getByRole('button', { name: /Refresh snapshot|Retry snapshot/ })).toHaveCount(0);
    expect(await geometry(frame)).toEqual(before);
    await expect(frame.locator('[data-media-status]')).toContainText('Live');
    let closedLeases = 1;
    if ((width === 390 && !enlarged) || (width === 320 && enlarged)) {
      await frame.evaluate(() => { (window as unknown as { __cameraProbe: { paused: boolean } }).__cameraProbe.paused = true; });
      await expect(frame.locator('[data-media-fps]')).toHaveCount(0, { timeout: 4000 });
      await expect(frame.locator('[data-media-status-message]')).toBeVisible({ timeout: 7000 });
      await expect(frame.getByRole('radio', { name: 'Auto', exact: true })).toHaveAttribute('aria-checked', 'true');
      await expect(frame.locator('video')).toHaveAttribute('aria-hidden', 'true');
      await expect(frame.locator('[data-media-status] time')).toHaveCount(0);
      expect(await frame.locator('[data-skeleton]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none'))).toBe(true);
      expect(await geometry(frame)).toEqual(before);
      await frame.evaluate(() => { (window as unknown as { __cameraProbe: { paused: boolean } }).__cameraProbe.paused = false; });
      await frame.getByRole('radio', { name: 'Live', exact: true }).click();
      await expect(frame.locator('[data-media-fps]')).toContainText('FPS');
      await frame.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
      await expect(frame.locator('[data-media-fps]')).toContainText('FPS');
      expect(await frame.evaluate(() => (window as unknown as { __cameraProbe: { opens: number } }).__cameraProbe.opens)).toBe(3);
      closedLeases = 3;
    }
    await frame.getByRole('radio', { name: 'Auto', exact: true }).click();
    await expect(frame.locator('[data-media-status]')).toContainText('Auto');
    await expect.poll(() => calls.filter((call) => call.name === 'close_u1_camera_stream').length).toBe(closedLeases);
    expect(await geometry(frame)).toEqual(before);
    expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const clipped = await frame.locator('[data-widget-shell]').evaluate((shell) => {
      const problems: string[] = [], walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT); let text: Node | null;
      while ((text = walker.nextNode())) {
        const owner = text.parentElement!;
        if (!text.textContent?.trim() || owner.closest('[aria-hidden="true"],[role="status"]') || getComputedStyle(owner).visibility === 'hidden') continue;
        const range = document.createRange(); range.selectNodeContents(text);
        for (const rect of range.getClientRects()) for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
          const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
          if ((['hidden', 'clip'].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) || (['hidden', 'clip'].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1))) problems.push(text.textContent.trim());
        }
      }
      return problems;
    });
    expect(clipped).toEqual([]);
    const body = await frame.locator('body').textContent(); expect(body).not.toMatch(/fixture-(activation|session|downstream)/);
    expect(outside).toEqual([]); expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath('live-camera.png'), fullPage: true });
  });
}

for (const width of [320, 390, 720]) test(`Camera icon overlay unsupported fullscreen preserves roving tab order ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(installCameraPeerFixture);
  const image = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 18; return canvas.toDataURL('image/jpeg'); });
  await page.route('**/dashboard/tools/call', async route => {
    const call = route.request().postDataJSON();
    const json = call.name === 'get_u1_camera_frame' ? { structuredContent: { schemaVersion: 1, available: true, observedAt: '2026-09-01T12:00:00.000Z', mediaType: 'image/jpeg', byteLength: Buffer.from(image.split(',')[1], 'base64').length }, _meta: { cameraFrame: { dataUrl: image }, cameraActivation: { token: 'fixture-activation-capability' } } }
      : call.name === 'open_u1_camera_stream' ? { structuredContent: { schemaVersion: 2, available: true }, _meta: { cameraStream: { transport: 'mcp-apps-tools', sessionId: 'fixture-session-capability', offer: { type: 'offer', sdp: 'fixture-downstream-offer' }, iceServers: [] } } }
      : call.name === 'answer_u1_camera_stream' ? { structuredContent: { accepted: true } } : { structuredContent: { closed: true } };
    await route.fulfill({ json });
  });
  await page.goto('/dashboard/camera');
  const frame = page.frames().find(candidate => candidate.url().endsWith('/dashboard/camera_widget'))!;
  await expect(frame.locator('img')).toBeVisible();
  if (width !== 390) await doubleText(frame);
  await frame.evaluate(() => Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true }));
  for (const mode of ['Auto', 'Live']) {
    const selected = frame.getByRole('radio', { name: mode, exact: true });
    await selected.click(); await expect(selected).toHaveAttribute('aria-checked', 'true');
    if (mode === 'Live') await expect(frame.locator('[data-media-fps]')).toContainText('FPS');
    await expect(frame.getByRole('button', { name: 'Fullscreen', exact: true })).toBeEnabled();
    const placement = await frame.locator('[data-media-actions]').evaluate(actions => {
      const media = actions.closest('[data-media-surface]')!.getBoundingClientRect();
      const controls = [...actions.querySelectorAll<HTMLButtonElement>('button')].map(button => button.getBoundingClientRect());
      const group = actions.querySelector('[role="radiogroup"]')!.getBoundingClientRect();
      return { contained: controls.every(box => box.left >= media.left && box.right <= media.right && box.top >= media.top && box.bottom <= media.bottom), separate: controls.every((a, i) => controls.every((b, j) => i === j || Math.min(a.right, b.right) - Math.max(a.left, b.left) <= 1)), right: media.right - group.right, bottom: media.bottom - group.bottom, width: group.width };
    });
    expect(placement).toEqual({ contained: true, separate: true, right: 10, bottom: 10, width: 88 });
    await page.screenshot({ path: info.outputPath(`camera-${mode.toLowerCase()}-ready.png`), fullPage: true });
    await frame.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(frame.locator('[data-media-feedback]')).toHaveText('Fullscreen unavailable');
    await expect(frame.locator('.local-fullscreen,.host-fullscreen')).toHaveCount(0);
    await expect(frame.getByRole('button', { name: 'Exit fullscreen', exact: true })).toHaveCount(0);
    await selected.focus();
    await selected.press(mode === 'Auto' ? 'ArrowRight' : 'ArrowLeft');
    await expect(frame.getByRole('radio', { name: mode === 'Auto' ? 'Live' : 'Auto', exact: true })).toBeFocused();
  }
  // A dark OS preference still uses this application's explicit light token palette.
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(frame.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.screenshot({ path: info.outputPath('camera-dark-preference.png'), fullPage: true });
});
