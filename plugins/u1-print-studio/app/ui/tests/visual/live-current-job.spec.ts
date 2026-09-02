import { expect, test, type Frame } from '@playwright/test';
import { liveCurrentJobResult } from '../fixtures/live-current-job';

const enlarge = (frame: Frame) => frame.evaluate(() => {
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
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],[data-reading-row]').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));
const readable = (frame: Frame) => frame.locator('[data-widget-shell]').evaluate((shell) => {
  const findings: string[] = [], walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT); let node: Node | null;
  while ((node = walker.nextNode())) {
    const owner = node.parentElement!;
    if (!node.textContent?.trim() || owner.closest('[aria-hidden="true"]') || getComputedStyle(owner).visibility === 'hidden') continue;
    const range = document.createRange(); range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1) findings.push(node.textContent);
      for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
        const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
        if ((['hidden', 'clip'].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) || (['hidden', 'clip'].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1))) findings.push(node.textContent);
      }
    }
  }
  return findings;
});

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Current Job closed lab structures retain all fact bounds ${width} enlarged=${enlarged}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 1800 });
    const queries = [
      ...['printing', 'paused', 'standby', 'complete', 'error', 'cancelled', 'unknown'].map((state) => `lab_scenario=${state}`),
      ...['zero', 'unknown', 'extreme'].map((facts) => `lab_facts=${facts}`),
      ...['empty', 'unreported', 'long'].map((filename) => `lab_filename=${filename}`),
      'lab_scenario=complete&lab_facts=extreme&lab_filename=long'
    ];
    for (const query of queries) {
      await page.goto(`/dashboard/lab/jobs?${query}`);
      await page.locator('[data-lab-controls]').waitFor();
      const frame = page.mainFrame();
      if (enlarged) await enlarge(frame);
      expect(await readable(frame), query).toEqual([]);
      const ready = await bounds(frame);
      await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
      const loading = await bounds(frame);
      expect(loading.length).toBe(ready.length);
      for (let row = 0; row < ready.length; row++) for (let axis = 0; axis < 4; axis++) {
        expect(Math.abs(ready[row][axis] - loading[row][axis]), `${query} row${row}/${axis}`).toBeLessThanOrEqual(1);
      }
      await expect(page.locator('[data-widget-shell] button,input,[aria-valuenow]')).toHaveCount(0);
      await page.getByLabel('Preview state', { exact: true }).selectOption('ready');
      expect(await bounds(frame)).toEqual(ready);
    }
  });
  test(`compact32 visual and44 target preserve default action ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    for (const [view, compact] of [['jobs', true], ['fans', false]] as const) {
      await page.goto(`/dashboard/lab/${view}`);
      const frame = page.mainFrame();
      if (enlarged) await enlarge(frame);
      const button = page.getByRole('button', { name: 'Refresh lab fixture' });
      await expect(button).toBeVisible();
      const box = await button.evaluate((node) => {
        const outer = node.getBoundingClientRect(), css = getComputedStyle(node), pseudo = getComputedStyle(node, '::before');
        const borderBox = (size: string, start: string, end: string) => Number.parseFloat(size) + (pseudo.boxSizing === 'border-box' ? 0 : Number.parseFloat(start) + Number.parseFloat(end));
        return { width: outer.width, height: outer.height, color: css.backgroundColor, pseudoWidth: borderBox(pseudo.width, pseudo.borderLeftWidth, pseudo.borderRightWidth), pseudoHeight: borderBox(pseudo.height, pseudo.borderTopWidth, pseudo.borderBottomWidth), compact: node.classList.contains('compact') };
      });
      expect(box.width).toBe(44); expect(box.height).toBe(44); expect(box.compact).toBe(compact);
      if (compact) { expect(box.pseudoWidth).toBe(32); expect(box.pseudoHeight).toBe(32); expect(box.color).toBe('rgba(0, 0, 0, 0)'); }
      else expect(box.color).not.toBe('rgba(0, 0, 0, 0)');
      await button.focus(); await expect(button).toBeFocused();
      expect(await button.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        return document.elementFromPoint(bounds.left + 2, bounds.top + 22) === node;
      })).toBe(true);
      await button.click({ position: { x: 2, y: 22 } });
      await expect(page.getByRole('status')).toHaveText('Lab fixture refreshed');
      await expect(button).toBeFocused();
    }
  });
  test(`Current Job real private iframe states and retained geometry ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 });
    const errors: string[] = [], outside: string[] = [], calls: unknown[] = [];
    let release: (value: unknown) => void = () => {};
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) outside.push(request.url()); });
    await page.route('**/dashboard/tools/call', async (route) => {
      calls.push(route.request().postDataJSON());
      await route.fulfill({ json: await new Promise((resolve) => { release = resolve; }) });
    });
    await page.goto('/dashboard/jobs'); await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/jobs_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Loading Current Job');
    if (enlarged) await enlarge(frame);
    await expect(frame.locator('[data-reading-row]')).toHaveCount(6);
    await expect(frame.locator('[data-widget-shell] button,input,canvas,video,[aria-valuenow]')).toHaveCount(0);
    release(liveCurrentJobResult()); await expect(frame.getByText('model.gcode')).toBeVisible();
    const receipt = await frame.locator('[data-observed-meta]').textContent();
    const ready = await bounds(frame), refresh = frame.getByRole('button', { name: 'Refresh Current Job' });
    await refresh.focus(); await refresh.press('Enter'); await expect.poll(() => calls.length).toBe(2);
    expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    release({ isError: true }); await expect(frame.getByRole('status')).toHaveText('Refresh failed · showing previous observation');
    expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    expect(await frame.locator('[data-observed-meta]').textContent()).toBe(receipt);
    let version = 20;
    for (const [state, fileLabel] of [
      ['printing', 'Current job'], ['paused', 'Paused job'], ['complete', 'Last reported job'],
      ['standby', 'Loaded file'], ['cancelled', 'Last reported job'],
      ['error', 'Last reported job'], ['unknown', 'Reported file']
    ]) {
      const result = liveCurrentJobResult(version++, `2026-09-01T12:01:${String(version).padStart(2, '0')}.000Z`);
      result.structuredContent.module.printState.value = state;
      result.structuredContent.module.filename.value = `${'Long_model_name'.repeat(9)}.gcode`;
      result.structuredContent.module.storageActive.value = false;
      await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, location.origin), result);
      await expect(frame.getByText(state[0].toUpperCase() + state.slice(1), { exact: true })).toBeVisible();
      await expect(frame.getByText(fileLabel, { exact: true })).toBeVisible();
      await expect(frame.getByText('Inactive', { exact: true })).toBeVisible();
      await expect(frame.getByRole('img', { name: '9007199254740991 bytes' })).toBeVisible();
      expect(await readable(frame)).toEqual([]);
      expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await frame.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    await expect(frame.getByRole('heading', { name: 'Current Job' })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('current-job-ready.png'), fullPage: true });
    expect(calls.every((call) => JSON.stringify(call) === JSON.stringify({ name: 'refresh_printer_observation', arguments: { view: 'jobs' } }))).toBe(true);
    expect(errors).toEqual([]); expect(outside).toEqual([]);
    await frame.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
    await expect(frame.locator('[data-widget-shell]')).toHaveCount(0);
  });
}

test('Current Job initial HTTP 503 failure is immediate and retry succeeds', async ({ page }) => {
  let calls = 0;
  await page.route('**/dashboard/tools/call', (route) => ++calls === 1 ? route.fulfill({ status: 503, body: 'unavailable' }) : route.fulfill({ json: liveCurrentJobResult() }));
  await page.goto('/dashboard/jobs');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/jobs_widget'))!;
  await expect(frame.getByRole('button', { name: 'Retry Current Job' })).toBeVisible({ timeout: 3000 });
  await frame.getByRole('button', { name: 'Retry Current Job' }).click();
  await expect(frame.getByText('model.gcode')).toBeVisible();
  expect(calls).toBe(2);
});
