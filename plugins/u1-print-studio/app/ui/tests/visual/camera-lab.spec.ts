import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { CameraCapabilityPolicy, CameraScenario } from '../../src/lib/camera/state';

const csp = "default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const url = 'http://127.0.0.1:4181/__test/camera';
const html = readFileSync('test-results/camera-harness.html', 'utf8');

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
    for (const scenario of ['loading', 'connecting', 'snapshot', 'fallback', 'error', 'unsupported'] as const) {
      await select(scenario);
      await expect(page.locator('[data-camera-media]')).toHaveAttribute('data-camera-scenario', scenario);
      expect(await bounds()).toEqual(baseline);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (scenario === 'loading') {
        await expect(page.locator('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
        await expect(page.locator('button')).toHaveCount(0);
        await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        expect(await page.locator('[data-skeleton]').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === 'none'))).toBe(true);
      }
      await page.screenshot({ path: `test-results/camera-${scenario}-${width}.png` });
    }
    await select('live');
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
    await page.getByRole('button', { name: 'Close simulated live' }).click();
    await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
    expect(await page.locator('video').evaluate((video) => (video as HTMLVideoElement).srcObject)).toBeNull();
    await select('live');
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
  await page.addInitScript(() => { Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', { value: undefined }); });
  await page.route(url, (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'content-security-policy': csp }, body: html }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Start simulated live' }).click();
  await expect(page.locator('[data-camera-status]')).toContainText('Video unavailable');
  await expect(page.locator('[data-camera-fps]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Picture in picture', exact: true })).toHaveCount(0);
});
