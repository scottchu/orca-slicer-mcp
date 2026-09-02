import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { CameraCapabilityPolicy, CameraScenario } from '../../../src/lib/client/camera/state';

const csp = "default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const url = 'http://127.0.0.1:4181/__test/camera';
const html = readFileSync('test-results/camera-harness.html', 'utf8');

for (const width of [320, 720]) test(`packaged Camera Lab switch matches Button height through loading at ${width}`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/dashboard/lab/camera');
  const modes = page.getByRole('radiogroup', { name: 'Camera mode' });
  const track = modes.locator('.track');
  const fullscreen = page.getByRole('button', { name: 'Fullscreen', exact: true });
  await expect(modes).toHaveCSS('width', '132px');
  await expect(track).toHaveCSS('height', '44px');
  expect((await track.boundingBox())!.height).toBe((await fullscreen.boundingBox())!.height);
  const before = await page.locator('[data-widget-shell],[data-camera-media],[data-icon-segmented]').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
  }));
  for (const scenario of ['loading', 'snapshot']) {
    await page.getByLabel('Camera state', { exact: true }).selectOption(scenario);
    expect(await page.locator('[data-widget-shell],[data-camera-media],[data-icon-segmented]').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
    }))).toEqual(before);
    expect(await track.boundingBox()).toEqual(await modes.boundingBox());
  }
  await page.screenshot({ path: info.outputPath('camera-lab-switch-height.png'), fullPage: true });
});

for (const width of [320, 390, 590, 720]) {
  test(`synthetic camera states and retained local media at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = []; const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.url() !== url) external.push(request.url()); });
    await page.route(url, (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
    await page.goto(url);
    const select = async (scenario: CameraScenario, policy: CameraCapabilityPolicy = 'native') => page.evaluate(({ scenario, policy }) => (window as unknown as { __setCamera: (scenario: CameraScenario, policy: CameraCapabilityPolicy) => void }).__setCamera(scenario, policy), { scenario, policy });
    const bounds = async () => page.locator('[data-widget-shell],[data-camera-media]').evaluateAll((nodes) => nodes.map((node) => {
      const { x, y, width, height } = node.getBoundingClientRect(); return { x: x + scrollX, y: y + scrollY, width, height };
    }));
    const baseline = await bounds();
    const modes = page.getByRole('radiogroup', { name: 'Camera mode' });
    const modeBounds = await modes.boundingBox();
    await expect(modes).toHaveCSS('width', '132px');
    await expect(modes.locator('.track')).toHaveCSS('height', '44px');
    expect(await modes.locator('.track').boundingBox()).toEqual(modeBounds);
    await expect(modes.locator('.thumb')).toHaveCSS('height', '40px');
    for (const scenario of ['loading', 'connecting', 'snapshot', 'fallback', 'error', 'unsupported'] as const) {
      await select(scenario);
      await expect(page.locator('[data-camera-media]')).toHaveAttribute('data-camera-scenario', scenario);
      expect(await bounds()).toEqual(baseline);
      expect(await modes.boundingBox()).toEqual(modeBounds);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (scenario === 'loading') {
        await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
        await expect(page.getByRole('radio')).toHaveCount(3);
        await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        expect(await page.locator('[data-skeleton]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
      }
      await page.screenshot({ path: `test-results/camera-${scenario}-${width}.png` });
    }
    await select('live');
    expect((await modes.locator('.track').boundingBox())!.height).toBe((await page.getByRole('button', { name: 'Fullscreen', exact: true }).boundingBox())!.height);
    await expect(page.locator('[data-camera-status]')).toContainText('Simulated live', { timeout: 5000 });
    await expect(page.locator('[data-camera-fps]')).toContainText(/\d+ FPS/, { timeout: 5000 });
    expect(await bounds()).toEqual(baseline);
    const statusPlacement = await page.locator('[data-camera-status]').evaluate((status) => {
      const header = status.closest('header')!; const title = header.querySelector('h1')!;
      const statusBounds = status.getBoundingClientRect(); const titleBounds = title.getBoundingClientRect();
      return statusBounds.left >= titleBounds.right && statusBounds.top <= titleBounds.bottom;
    });
    expect(statusPlacement).toBe(true);
    expect(await page.locator('[data-camera-actions] button').evaluateAll((nodes) => nodes.every((node) => {
      const box = node.getBoundingClientRect(); return box.width === 44 && box.height === 44;
    }))).toBe(true);
    await page.evaluate(() => {
      const video = document.querySelector('video')!;
      (window as unknown as { __identity: unknown }).__identity = { video, stream: video.srcObject, track: (video.srcObject as MediaStream).getVideoTracks()[0] };
    });
    const retained = async () => page.evaluate(() => {
      const prior = (window as unknown as { __identity: { video: HTMLVideoElement; stream: MediaStream; track: MediaStreamTrack } }).__identity;
      return document.querySelector('video') === prior.video && prior.video.srcObject === prior.stream && prior.track.readyState === 'live';
    });
    await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Exit fullscreen', exact: true })).toBeVisible();
    expect(await retained()).toBe(true);
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Fullscreen', exact: true })).toBeVisible();
    expect(await retained()).toBe(true);
    expect(await bounds()).toEqual(baseline);
    const pipButton = page.getByRole('button', { name: 'Picture in picture', exact: true });
    if (await pipButton.count()) {
      await pipButton.click();
      await expect.poll(() => page.evaluate(() => document.pictureInPictureElement !== null || document.querySelector('[data-camera-feedback]')?.textContent?.includes('unavailable') === true)).toBe(true);
      if (await page.evaluate(() => document.pictureInPictureElement !== null)) {
        await page.getByRole('button', { name: 'Exit picture in picture', exact: true }).click();
        await expect.poll(() => page.evaluate(() => document.pictureInPictureElement === null)).toBe(true);
      } else await expect(page.locator('[data-camera-feedback]')).toContainText('unavailable');
      expect(await retained()).toBe(true);
    }
    await page.getByRole('button', { name: 'Refresh synthetic snapshot' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Fixture snapshot refreshed' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(1);
    expect(await bounds()).toEqual(baseline);
    expect(await retained()).toBe(true);
    await select('live', 'denied');
    await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Simulated display request failure' })).toBeVisible();
    expect(await retained()).toBe(true);
    await select('live', 'unsupported');
    await expect(page.getByRole('button', { name: 'Picture in picture', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
    await expect(page.locator('.local-fullscreen')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.local-fullscreen')).toHaveCount(0);
    expect(await retained()).toBe(true);
    await page.getByRole('radio', { name: 'Snapshot', exact: true }).click();
    await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
    expect(await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject)).toBeNull();
    await page.getByRole('radio', { name: 'Live', exact: true }).click();
    await expect(page.locator('[data-camera-fps]')).toContainText(/\d+ FPS/);
    await page.evaluate(() => {
      (window as unknown as { __lastStream: MediaStream; __hideCamera: () => void }).__lastStream = document.querySelector('video')!.srcObject as MediaStream;
      (window as unknown as { __hideCamera: () => void }).__hideCamera();
    });
    await expect(page.locator('video')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __lastStream: MediaStream }).__lastStream.getTracks().every((track) => track.readyState === 'ended'))).toBe(true);
    expect(errors).toEqual([]); expect(external).toEqual([]);
  });
}

test('synthetic media is unavailable without capture support and does not invent FPS', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', { value: undefined }); });
  await page.route(url, (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
  await page.goto(url);
  await page.getByRole('radio', { name: 'Live', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Auto', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('radio', { name: 'Live', exact: true })).toBeFocused();
  await expect(page.locator('[data-footer-status]')).toBeVisible();
  await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Picture in picture', exact: true })).toHaveCount(0);
  await page.clock.fastForward(1600);
  await expect(page.locator('[data-camera-status]')).toContainText('Auto');
  const first = await page.locator('[data-camera-status] time').getAttribute('datetime');
  await page.clock.fastForward(1600);
  await expect(page.locator('[data-camera-status] time')).not.toHaveAttribute('datetime', first!);
  await page.getByRole('radio', { name: 'Snapshot', exact: true }).click();
  const stopped = await page.locator('[data-camera-status] time').getAttribute('datetime');
  await page.clock.fastForward(4000);
  await expect(page.locator('[data-camera-status] time')).toHaveAttribute('datetime', stopped!);
});

test('stalled synthetic video clears measured FPS, freezes time and terminates truthfully', async ({ page }) => {
  await page.route(url, (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
  await page.goto(url);
  await page.getByRole('radio', { name: 'Live', exact: true }).click();
  await expect(page.locator('[data-camera-fps]')).toContainText(/\d+ FPS/);
  await page.locator('video').evaluate(video => {
    // Block presentation after a successful start, including automatic resume.
    (video as HTMLVideoElement).play = () => Promise.resolve();
    (video as HTMLVideoElement).pause();
  });
  await expect(page.locator('[data-camera-fps]')).toHaveCount(0, { timeout: 2500 });
  const frozen = await page.locator('[data-camera-status] time').getAttribute('datetime');
  await expect(page.locator('[data-footer-status]')).toBeVisible({ timeout: 6500 });
  expect(frozen).not.toBeNull();
  expect(await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject)).toBeNull();
});

test('a missing first presented frame has a five-second startup deadline', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLVideoElement.prototype.requestVideoFrameCallback = () => 1;
    HTMLVideoElement.prototype.cancelVideoFrameCallback = () => {};
  });
  await page.route(url, (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
  await page.goto(url);
  await page.getByRole('radio', { name: 'Live', exact: true }).click();
  await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
  await expect(page.locator('[data-footer-status]')).toBeVisible({ timeout: 6500 });
  await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'false');
  expect(await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject)).toBeNull();
});

test('failed local fullscreen leaves footer retry reachable without replacing mounted media', async ({ page }) => {
  await page.route(url, route => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
  await page.goto(url);
  await page.evaluate(() => (window as unknown as { __setCamera: (scenario: CameraScenario, policy: CameraCapabilityPolicy) => void }).__setCamera('snapshot', 'unsupported'));
  const video = await page.locator('video').elementHandle();
  await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
  await expect(page.locator('.local-fullscreen')).toHaveCount(1);
  await page.evaluate(() => (window as unknown as { __setCamera: (scenario: CameraScenario, policy: CameraCapabilityPolicy) => void }).__setCamera('error', 'unsupported'));
  await expect(page.locator('.local-fullscreen')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry synthetic snapshot' })).toBeVisible();
  await expect(page.locator('[data-footer-status]')).toBeVisible();
  expect(await video!.evaluate(node => node === document.querySelector('video'))).toBe(true);
});
