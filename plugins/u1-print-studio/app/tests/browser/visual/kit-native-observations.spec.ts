import { expect, test, type Page } from '@playwright/test';
import { liveFansResult } from '../fixtures/live-fans';

test.use({ baseURL: `http://127.0.0.1:${process.env.U1_BROWSER_KIT_PORT ?? '4181'}` });
const views = [
  { view: 'thermals', title: 'Thermals', value: '220', domain: 'environmentReads' },
  { view: 'heads', title: 'Heads & Filaments', value: '#6F4C2F80', domain: 'materialsReads' },
  { view: 'queue', title: 'Print Queue', value: 'First fixture.gcode', domain: 'queueReads' }
] as const;
const navigate = async (page: Page, view: string) => {
  await page.evaluate((view) => {
    document.getElementById('fixture-navigation')?.remove();
    const link = document.createElement('a'); link.href = `/dashboard/${view}`; link.id = 'fixture-navigation'; link.textContent = 'Navigate'; document.body.append(link);
  }, view);
  await page.locator('#fixture-navigation').click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/${view}$`));
};
const doubleText = (page: Page) => page.evaluate(() => {
  const visit = (rule: CSSRule): void => {
    if ('cssRules' in rule) for (const child of (rule as CSSGroupingRule).cssRules) visit(child);
    if (!(rule instanceof CSSStyleRule)) return;
    const size = rule.style.getPropertyValue('font-size');
    if (size) rule.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
    for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
      const value = rule.style.getPropertyValue(token);
      if (value.endsWith('px')) rule.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
    }
  };
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) visit(rule);
});

for (const { view, title, value, domain } of views) {
  test(`${view} JavaScript-disabled page stays an acquisition-free native skeleton`, async ({ browser, baseURL, request }) => {
    await request.post('/__fixture/state', { data: { reset: true } });
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`/dashboard/${view}`);
      await expect(page.getByRole('article', { name: title })).toBeVisible();
      await expect(page.locator('iframe')).toHaveCount(0);
      await expect(page.getByRole('article', { name: title })).toHaveAttribute('aria-busy', 'true');
      expect(await (await request.get('/__fixture/state')).json()).toEqual({ statusReads: 0, environmentReads: 0, materialsReads: 0, queueReads: 0 });
    } finally { await context.close(); }
  });

  for (const [width, enlarged] of [[320, false], [390, false], [720, false], [390, true]] as const) {
    test(`native ${view} error/refresh/recovery geometry ${width} text200=${enlarged}`, async ({ page, request }) => {
      await page.setViewportSize({ width, height: 1400 });
      const errors: string[] = [];
      const selected: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => { if (request.url().endsWith('/dashboard/tools/call')) selected.push(request.postDataJSON().arguments.view); });
      await request.post('/__fixture/state', { data: { reset: true, hold: true } });
      await page.goto(`/dashboard/${view}`);
      const shell = page.getByRole('article', { name: title });
      await expect(shell).toBeVisible();
      if (enlarged) {
        const fontSize = await shell.locator('h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
        await doubleText(page);
        expect(await shell.locator('h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBe(fontSize * 2);
      }
      await expect(page.locator('iframe')).toHaveCount(0);
      await expect.poll(async () => (await (await request.get('/__fixture/state')).json())[domain]).toBe(1);
      const initial = (await shell.boundingBox())!.height;
      await request.post('/__fixture/state', { data: { fail: true } });
      const footer = shell.locator('[data-footer-status]');
      await expect(footer).toBeVisible();
      await expect(shell).not.toContainText(value);
      expect(Math.abs((await shell.boundingBox())!.height - initial)).toBeLessThanOrEqual(1);
      await request.post('/__fixture/state', { data: {} });
      const refresh = page.getByRole('button', { name: `Refresh ${title}`, exact: true });
      await refresh.click();
      await expect(shell).toContainText(value);
      await expect(shell).toHaveAttribute('aria-busy', 'false');
      const ready = (await shell.boundingBox())!.height;
      await request.post('/__fixture/state', { data: { fail: true } });
      await refresh.click();
      await expect(footer).toBeVisible();
      await expect(shell).not.toContainText(value);
      expect(Math.abs((await shell.boundingBox())!.height - ready)).toBeLessThanOrEqual(1);
      await request.post('/__fixture/state', { data: { hold: true } });
      await refresh.click();
      await expect(shell).toHaveAttribute('aria-busy', 'true');
      await expect(shell).not.toContainText(value);
      expect(Math.abs((await shell.boundingBox())!.height - ready)).toBeLessThanOrEqual(1);
      await request.post('/__fixture/state', { data: {} });
      await expect(shell).toContainText(value);
      await expect(footer).toBeHidden();
      expect(selected).toEqual([view, view, view, view]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test('native Heads copies the complete latest hex and keeps rejection local', async ({ page, request }) => {
  await page.addInitScript(() => {
    const state = { values: [] as string[], reject: false };
    Object.assign(window, { clipboardFixture: state });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => { state.values.push(text); if (state.reject) throw new Error('Synthetic clipboard rejection'); } } });
  });
  await request.post('/__fixture/state', { data: { reset: true } });
  await page.goto('/dashboard/heads');
  const copy = page.getByRole('button', { name: 'Copy T3 color #6F4C2F80', exact: true });
  await expect(copy).toBeVisible();
  expect((await copy.boundingBox())!.height).toBe(44);
  const before = (await page.getByRole('article').boundingBox())!.height;
  await copy.focus(); await copy.press('Enter');
  await expect(page.getByRole('status')).toHaveText('#6F4C2F80 copied');
  await page.evaluate(() => { (window as any).clipboardFixture.reject = true; });
  await copy.press('Enter');
  await expect(page.getByRole('status')).toHaveText('#6F4C2F80 copy unavailable');
  await expect(copy).toBeFocused();
  expect((await page.getByRole('article').boundingBox())!.height).toBe(before);
  expect(await page.evaluate(() => (window as any).clipboardFixture.values)).toEqual(['#6F4C2F80', '#6F4C2F80']);
});

test('native Heads rejects wrong-view and malformed HTTP refreshes until valid recovery', async ({ page, request }) => {
  let replacement: 'wrong-view' | 'malformed' | null = null;
  await page.route('**/dashboard/tools/call', async (route) => {
    expect(route.request().postDataJSON().arguments.view).toBe('heads');
    if (!replacement) { await route.continue(); return; }
    await route.fulfill({ json: replacement === 'wrong-view' ? liveFansResult() : { structuredContent: { view: 'heads' } } });
  });
  await request.post('/__fixture/state', { data: { reset: true } });
  await page.goto('/dashboard/heads');
  const shell = page.getByRole('article', { name: 'Heads & Filaments' });
  await expect(shell).toContainText('#6F4C2F80');
  const height = (await shell.boundingBox())!.height;
  for (const kind of ['wrong-view', 'malformed'] as const) {
    replacement = kind;
    await page.getByRole('button', { name: 'Refresh Heads & Filaments' }).click();
    await expect(shell.locator('[data-footer-status]')).toHaveAttribute('aria-label', 'Could not load Heads & Filaments');
    await expect(shell).not.toContainText('#6F4C2F80');
    expect((await shell.boundingBox())!.height).toBe(height);
  }
  replacement = null;
  await request.post('/__fixture/state', { data: {} });
  await page.getByRole('button', { name: 'Refresh Heads & Filaments' }).click();
  await expect(shell).toContainText('#6F4C2F80');
  await expect(shell.locator('[data-footer-status]')).toBeHidden();
});

test('native client navigation disposes the departed HTTP request without duplicate demand', async ({ page, request }) => {
  await page.addInitScript(() => {
    const requests: { view: string; signal: AbortSignal }[] = [];
    Object.assign(window, { observationRequests: requests });
    const original = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/dashboard/tools/call') requests.push({ view: JSON.parse(init!.body as string).arguments.view, signal: init!.signal! });
      return original(input, init);
    }) as typeof window.fetch;
  });
  await request.post('/__fixture/state', { data: { reset: true, hold: true } });
  await page.goto('/dashboard/thermals');
  await expect.poll(async () => (await (await request.get('/__fixture/state')).json()).environmentReads).toBe(1);
  await navigate(page, 'heads');
  await expect.poll(() => page.evaluate(() => (window as any).observationRequests.map((entry: any) => ({ view: entry.view, aborted: entry.signal.aborted })))).toEqual([{ view: 'thermals', aborted: true }, { view: 'heads', aborted: false }]);
  await request.post('/__fixture/state', { data: {} });
  await expect(page.getByRole('article', { name: 'Heads & Filaments' })).toContainText('#6F4C2F80');
  await navigate(page, 'queue');
  await expect(page.getByRole('article', { name: 'Print Queue' })).toContainText('First fixture.gcode');
  await navigate(page, 'fans');
  await expect(page.getByRole('article', { name: 'Fans & Air' })).toContainText('1,200');
  expect(await page.evaluate(() => (window as any).observationRequests.map((entry: any) => entry.view))).toEqual(['thermals', 'heads', 'queue', 'fans']);
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('native history restoration retains a persisted document or makes one fresh mount', async ({ page, request }, testInfo) => {
  let requests = 0;
  page.on('request', (request) => { if (request.url().endsWith('/dashboard/tools/call')) requests++; });
  await page.addInitScript(() => {
    window.addEventListener('pageshow', (event) => {
      const records = JSON.parse(sessionStorage.getItem('native-pageshow') ?? '[]');
      records.push({ path: location.pathname, persisted: event.persisted });
      sessionStorage.setItem('native-pageshow', JSON.stringify(records));
    });
  });
  await request.post('/__fixture/state', { data: { reset: true } });
  await page.goto('/dashboard/heads');
  await expect(page.getByRole('article')).toContainText('#6F4C2F80');
  await page.goto('/dashboard');
  await page.goBack();
  await expect(page.getByRole('article')).toContainText('#6F4C2F80');
  const records = await page.evaluate(() => JSON.parse(sessionStorage.getItem('native-pageshow') ?? '[]')) as { path: string; persisted: boolean }[];
  const restored = records.filter((entry) => entry.path === '/dashboard/heads').at(-1)!;
  testInfo.annotations.push({ type: 'history-restore', description: restored.persisted ? 'actual BFCache restoration observed' : 'browser used a fresh document; no BFCache claim' });
  expect(requests).toBe(restored.persisted ? 1 : 2);
  await request.post('/__fixture/state', { data: {} });
  await page.getByRole('button', { name: 'Refresh Heads & Filaments' }).click();
  await expect(page.getByRole('article')).toHaveAttribute('aria-busy', 'false');
  expect((await (await request.get('/__fixture/state')).json()).materialsReads).toBe(2);
  expect(requests).toBe(restored.persisted ? 2 : 3);
  await testInfo.attach('history-restoration', { body: JSON.stringify({ persisted: restored.persisted, requests, records }), contentType: 'application/json' });
});
