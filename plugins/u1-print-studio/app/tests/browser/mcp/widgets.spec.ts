import { expect, test, type Frame } from '@playwright/test';
import { installCameraPeerFixture } from '../fixtures/live-camera';

const frameOf = async (page: import('@playwright/test').Page) => {
  await expect
    .poll(() =>
      page
        .frames()
        .find((frame) => frame.url() === 'about:srcdoc')
        ?.url(),
    )
    .toBe('about:srcdoc');
  return page.frames().find((frame) => frame.url() === 'about:srcdoc')!;
};
const bounds = (frame: Frame) =>
  frame
    .locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer]')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return [box.x + scrollX, box.y + scrollY, box.width, box.height];
      }),
    );
const enlarge = (frame: Frame) =>
  frame.evaluate(() => {
    const visit = (rule: CSSRule): void => {
      if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
      if (!(rule instanceof CSSStyleRule)) return;
      const size = rule.style.getPropertyValue('font-size');
      if (size)
        rule.style.setProperty(
          'font-size',
          size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`),
        );
    };
    for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
  });

for (const width of [320, 390, 590, 720])
  for (const doubled of [false, true])
    test(`MCP Heads actual resource Refresh Copy ${width} enlarged=${doubled}`, async ({
      page,
      request,
    }) => {
      await request.post('/fixture/configure', { data: { reset: true } });
      await page.setViewportSize({ width, height: 1200 });
      const errors: string[] = [],
        childRequests: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (request.frame().parentFrame()) childRequests.push(request.url());
      });
      await page.goto('/host?view=heads');
      const frame = await frameOf(page);
      await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
      if (doubled) await enlarge(frame);
      expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await expect(frame.locator('[data-inset-card]')).toHaveCount(4);
      const copy = frame.getByRole('button', { name: 'Copy T1 color #FFFFFFFF', exact: true });
      await frame.evaluate(() =>
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: async (value: string) => {
              Object.assign(window, { copied: value });
            },
          },
        }),
      );
      await copy.focus();
      await copy.press('Enter');
      await expect(frame.getByRole('status')).toHaveText('#FFFFFFFF copied');
      expect(await frame.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(
        '#FFFFFFFF',
      );
      const refresh = frame.getByRole('button', { name: 'Refresh Heads & Filaments' });
      const before = await bounds(frame);
      await request.post('/fixture/configure', { data: { fail: true } });
      await refresh.click();
      await expect(frame.getByRole('status')).toContainText('Heads & Filaments');
      await expect(frame.locator('[data-footer-status]')).toBeVisible();
      expect(await bounds(frame)).toEqual(before);
      await expect(frame.getByRole('button', { name: /^Copy T/ })).toHaveCount(0);
      await expect(frame.getByText('#FFFFFFFF', { exact: true })).toHaveCount(0);
      await request.post('/fixture/configure', { data: {} });
      await refresh.click();
      await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
      await expect(copy).toBeVisible();
      expect(await page.evaluate(() => (window as any).__mcpHost.state.uri)).toBe(
        'ui://u1-print-studio/observation-v17.html',
      );
      const messages = await page.evaluate(() => (window as any).__mcpHost.state.messages);
      expect(messages.filter((message: any) => message.method === 'ui/initialize')).toHaveLength(1);
      expect(
        messages
          .filter((message: any) => message.method === 'tools/call')
          .map((message: any) => message.params),
      ).toEqual(
        Array(2).fill({ name: 'refresh_printer_observation', arguments: { view: 'heads' } }),
      );
      await expect
        .poll(() => page.evaluate(() => (window as any).__mcpHost.state.sizes.length))
        .toBeGreaterThan(0);
      expect(errors).toEqual([]);
      expect(childRequests).toEqual([]);
      await page.screenshot({ path: test.info().outputPath('heads.png'), fullPage: true });
    });

for (const width of [320, 390, 590, 720])
  for (const doubled of [false, true])
    test(`MCP Camera actual resource Switch fallback ${width} enlarged=${doubled}`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.addInitScript(installCameraPeerFixture);
      const image = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 18;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#edf1f4';
        context.fillRect(0, 0, 32, 18);
        return canvas.toDataURL('image/jpeg');
      });
      await request.post('/fixture/configure', { data: { reset: true, image, failLive: true } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/host?tool=open_printer_camera');
      const frame = await frameOf(page);
      await expect(frame.locator('[data-media-status]')).toContainText('Auto');
      if (doubled) await enlarge(frame);
      await expect(frame.getByRole('radio')).toHaveCount(2);
      await expect(frame.getByRole('radio', { name: 'Auto', exact: true })).toBeChecked();
      expect((await (await request.get('/fixture/state')).json()).calls).toEqual([
        { name: 'open_printer_camera', arguments: {} },
      ]);
      expect(
        await frame.getByRole('radiogroup').evaluate((node) => node.getBoundingClientRect().height),
      ).toBe(44);
      await frame.getByRole('radio', { name: 'Live', exact: true }).click();
      await expect(frame.getByRole('radio', { name: 'Auto', exact: true })).toBeChecked();
      await expect(frame.locator('[data-media-status]')).toContainText('Auto');
      const state = await (await request.get('/fixture/state')).json();
      expect(
        state.calls.some((call: { name: string }) => call.name === 'open_u1_camera_stream'),
      ).toBe(true);
      await expect(frame.locator('[data-media-status-message]')).toHaveText('Live request failed');
      await expect(frame.locator('[data-widget-footer]')).toHaveCount(0);
      await expect(frame.getByRole('button', { name: /refresh|retry/i })).toHaveCount(0);
      const shell = await frame.locator('[data-widget-shell]').boundingBox();
      const media = await frame.locator('[data-media-slot]').boundingBox();
      expect(Math.abs(media!.x - shell!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(media!.width - shell!.width)).toBeLessThanOrEqual(2);
      const status = await frame.locator('[data-media-status-message]').boundingBox();
      const actions = await frame.locator('[data-media-actions]').boundingBox();
      expect(status!.x + status!.width <= actions!.x || status!.y + status!.height <= actions!.y).toBe(true);
      await expect(frame.locator('img')).toHaveAttribute('aria-hidden', 'false');
      await expect(frame.locator('[data-media-feedback]')).toHaveCount(0);
      expect(await page.evaluate(() => (window as any).__mcpHost.state.uri)).toBe(
        'ui://u1-print-studio/camera-v13.html',
      );
      await expect
        .poll(() => page.evaluate(() => (window as any).__mcpHost.state.sizes.length))
        .toBeGreaterThan(0);
      const autoBounds = await bounds(frame);
      await request.post('/fixture/configure', { data: { failLive: false } });
      await frame.getByRole('radio', { name: 'Live', exact: true }).click();
      await expect(frame.locator('[data-media-fps]')).toContainText('FPS');
      expect(await bounds(frame)).toEqual(autoBounds);
      expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await frame.getByRole('radio', { name: 'Auto', exact: true }).click();
      await expect(frame.locator('[data-media-status]')).toContainText('Auto');
      expect(await bounds(frame)).toEqual(autoBounds);
      expect(errors).toEqual([]);
      await page.screenshot({ path: test.info().outputPath('camera.png'), fullPage: true });
    });

test('MCP Camera initial error stays neutral until quiet Auto recovery', async ({ page, request }) => {
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 18;
    return canvas.toDataURL('image/jpeg');
  });
  await request.post('/fixture/configure', { data: { image, reset: true, failCamera: true } });
  await page.goto('/host?tool=open_printer_camera');
  const frame = await frameOf(page);
  await expect(frame.getByRole('status')).toHaveText('Could not load camera');
  await expect(frame.locator('img')).toHaveCount(0);
  expect((await (await request.get('/fixture/state')).json()).calls).toEqual([
    { name: 'open_printer_camera', arguments: {} },
  ]);
  await request.post('/fixture/configure', { data: {} });
  await expect(frame.locator('[data-media-status]')).toContainText('Auto');
  expect((await (await request.get('/fixture/state')).json()).calls.at(-1)).toEqual({
    name: 'get_u1_camera_frame',
    arguments: {},
  });
});

test('MCP synthetic Live owns one lease and releases it on nonpersisted pagehide', async ({
  page,
  request,
}) => {
  await page.addInitScript(installCameraPeerFixture);
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 18;
    return canvas.toDataURL('image/jpeg');
  });
  await request.post('/fixture/configure', { data: { image, reset: true, failLive: false } });
  await page.goto('/host?tool=open_printer_camera');
  const frame = await frameOf(page);
  await expect(frame.locator('[data-media-status]')).toContainText('Auto');
  await frame.getByRole('radio', { name: 'Live', exact: true }).click();
  await expect(frame.locator('[data-media-status]')).toContainText('Live');
  expect(await frame.evaluate(() => (window as any).__cameraProbe.opens)).toBe(1);
  await frame.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })),
  );
  await expect
    .poll(
      async () =>
        (await (await request.get('/fixture/state')).json()).calls.filter(
          (call: { name: string }) => call.name === 'close_u1_camera_stream',
        ).length,
    )
    .toBe(1);
  expect(
    await frame.evaluate(() =>
      (window as any).__cameraProbe.tracks.every(
        (track: MediaStreamTrack) => track.readyState === 'ended',
      ),
    ),
  ).toBe(true);
  await expect(frame.locator('[data-widget-shell]')).toHaveCount(0);
});

for (const [view, title] of Object.entries({
  overview: 'Overview',
  progress: 'Print Progress',
  thermals: 'Thermals',
  jobs: 'Current Job',
  job_history: 'Job History',
  queue: 'Print Queue',
  fans: 'Fans & Air',
  bed_mesh: 'Bed Mesh',
}))
  test(`MCP retained ${view} renderer and Refresh`, async ({ page, request }) => {
    await request.post('/fixture/configure', { data: { reset: true } });
    await page.setViewportSize({ width: 390, height: 1200 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/host?view=${view}`);
    const frame = await frameOf(page);
    await expect(frame.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(frame.locator('.instrument')).toHaveCount(1);
    const refresh = frame.getByRole('button', {
      name: /Refresh observation|Retry loading observation/,
    });
    await expect(refresh).toBeEnabled();
    await refresh.click();
    await expect
      .poll(async () => (await (await request.get('/fixture/state')).json()).calls.length)
      .toBe(2);
    expect((await (await request.get('/fixture/state')).json()).calls[1]).toEqual({
      name: 'refresh_printer_observation',
      arguments: { view },
    });
    expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    expect(errors).toEqual([]);
  });

for (const delivery of ['result-first', 'compatibility'])
  test(`MCP Heads ${delivery} replay does not acquire again`, async ({ page, request }) => {
    await request.post('/fixture/configure', { data: { reset: true } });
    await page.goto(`/host?view=heads&delivery=${delivery}`);
    const frame = await frameOf(page);
    await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
    expect((await (await request.get('/fixture/state')).json()).calls).toEqual([
      { name: 'observe_printer', arguments: { view: 'heads' } },
    ]);
    expect(await page.evaluate(() => (window as any).__mcpHost.state.calls)).toEqual([]);
  });

test('MCP canonical input rejects another view and contradictory late input retires pending Copy', async ({
  page,
  request,
}) => {
  await request.post('/fixture/configure', { data: { reset: true } });
  await page.goto('/host?view=heads&delivery=manual');
  const frame = await frameOf(page);
  await expect.poll(() => page.evaluate(() => (window as any).__mcpHost.state.ready)).toBe(true);
  await page.evaluate(() => {
    const host = (window as any).__mcpHost;
    host.sendInput();
    const wrong = structuredClone(host.state.result);
    wrong.structuredContent.view = 'queue';
    wrong.structuredContent.module.kind = 'queue';
    host.sendResult(wrong);
  });
  await expect(frame.getByRole('status')).toHaveText('Loading Heads & Filaments');
  await page.evaluate(() => (window as any).__mcpHost.sendResult());
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
  await frame.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve) => Object.assign(window, { finishCopy: resolve })),
      },
    }),
  );
  await frame.getByRole('button', { name: 'Copy T1 color #FFFFFFFF', exact: true }).click();
  await page.evaluate(() => (window as any).__mcpHost.sendInput({ view: 'queue' }));
  await expect(frame.getByRole('status')).toHaveText(
    'Could not load. Reopen this card to try again.',
  );
  await expect(frame.getByRole('heading', { name: 'Heads & Filaments', exact: true })).toHaveCount(
    0,
  );
  await frame.evaluate(() => (window as any).finishCopy());
  await page.evaluate(() => (window as any).__mcpHost.sendResult());
  await expect(frame.getByRole('status')).toHaveText(
    'Could not load. Reopen this card to try again.',
  );
  await expect(frame.getByText('#FFFFFFFF', { exact: true })).toHaveCount(0);
});

test('MCP legacy failed Refresh cannot render a retained successful DTO', async ({
  page,
  request,
}) => {
  await request.post('/fixture/configure', { data: { reset: true } });
  await page.goto('/host?view=thermals');
  const frame = await frameOf(page);
  await expect(frame.getByRole('heading', { name: 'Thermals', exact: true })).toBeVisible();
  const result = await page.evaluate(() => (window as any).__mcpHost.state.result);
  await page.route('**/fixture/call', (route) =>
    route.fulfill({ json: { isError: true, ...result } }),
  );
  await frame.getByRole('button', { name: 'Refresh observation', exact: true }).click();
  await expect(frame.locator('[data-observation-placeholder="error"]')).toBeVisible();
  await expect(frame.locator('.refresh-error')).toHaveText('Could not load');
  await expect(frame.getByText('220°', { exact: true })).toHaveCount(0);
});

for (const retry of [false, true])
  test(`MCP height waits for initialization, follows resize and safe area retry=${retry}`, async ({
    page,
    request,
  }) => {
    await request.post('/fixture/configure', { data: { reset: true } });
    await page.setViewportSize({ width: 720, height: 900 });
    await page.goto(`/host?view=heads&init-delay=150${retry ? '&fail-init=1' : ''}`);
    const frame = await frameOf(page);
    if (retry) {
      await expect(frame.getByRole('status')).toHaveText('Could not load Heads & Filaments');
      await frame.getByRole('button', { name: 'Refresh Heads & Filaments' }).click();
    }
    await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
    await expect
      .poll(() => page.evaluate(() => (window as any).__mcpHost.state.sizes.length))
      .toBeGreaterThan(0);
    const messages = await page.evaluate(() => (window as any).__mcpHost.state.messages);
    expect(
      messages.findIndex((message: any) => message.method === 'ui/notifications/size-changed'),
    ).toBeGreaterThan(
      messages.findIndex((message: any) => message.method === 'ui/notifications/initialized'),
    );
    await page.evaluate(() =>
      (window as any).__mcpHost.sendContext({
        safeArea: { insets: { bottom: 24 } },
        displayMode: 'fullscreen',
      }),
    );
    await expect(frame.locator('#widget-root')).toHaveCSS('padding-bottom', '24px');
    await page.setViewportSize({ width: 320, height: 900 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__mcpHost.state.sizes.at(-1).width))
      .toBe(320);
    await page.evaluate(() => (window as any).__mcpHost.sendContext({ safeArea: { bottom: 0 } }));
    await expect(frame.locator('#widget-root')).toHaveCSS('padding-bottom', '0px');
    await expect
      .poll(async () => ({
        allocated: await page
          .locator('iframe')
          .evaluate((node) => node.getBoundingClientRect().height),
        required: await frame
          .locator('#widget-root')
          .evaluate((node) => Math.ceil(node.getBoundingClientRect().bottom + scrollY)),
      }))
      .toEqual(
        expect.objectContaining({
          allocated: await frame
            .locator('#widget-root')
            .evaluate((node) => Math.ceil(node.getBoundingClientRect().bottom + scrollY)),
        }),
      );
  });
