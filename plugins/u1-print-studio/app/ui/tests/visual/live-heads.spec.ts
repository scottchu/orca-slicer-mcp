import { expect, test, type Frame } from '@playwright/test';
import { liveHeadsResult } from '../fixtures/live-heads';
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
const bounds = (frame: Frame) => frame.locator('[data-widget-shell],[data-widget-header],[data-widget-body],[data-widget-footer],.card-grid,[data-inset-card]').evaluateAll((nodes) => nodes.map((node) => {
  const box = node.getBoundingClientRect(); return [box.x + scrollX, box.y + scrollY, box.width, box.height];
}));
const readable = async (frame: Frame, width: number) => {
  expect(await frame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await frame.locator('[data-widget-shell]').evaluate((shell) => {
    const clipped: string[] = [], walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT); let node: Node | null;
    while ((node = walker.nextNode())) {
      const owner = node.parentElement!; if (!node.textContent?.trim() || owner.closest('[aria-hidden="true"]') || getComputedStyle(owner).visibility === 'hidden') continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const box of range.getClientRects()) {
        if (box.right > document.documentElement.clientWidth + 1 || box.left < -1) clipped.push(node.textContent.trim());
        for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
          const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
          if ((['hidden', 'clip'].includes(style.overflowX) && (box.left < clip.left - 1 || box.right > clip.right + 1)) || (['hidden', 'clip'].includes(style.overflowY) && (box.top < clip.top - 1 || box.bottom > clip.bottom + 1))) clipped.push(node.textContent.trim());
        }
      }
    }
    return clipped;
  })).toEqual([]);
};
const materialRows = async (frame: Frame, loading = false) => {
  const rows = await frame.locator('[data-inset-card]').evaluateAll((cards) => cards.map((card) => {
    const icon = card.querySelector<SVGElement>('.lucide-spool')!;
    const row = icon.parentElement!.parentElement!;
    const caption = row.querySelector<HTMLElement>('.caption')!;
    const value = caption.querySelector<HTMLElement>('[data-text-skeleton]') ?? caption;
    const glyph = icon.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    const text = document.createTreeWalker(value, NodeFilter.SHOW_TEXT).nextNode()!;
    const overlaps: string[] = [], spaces: number[] = [];
    const textValue = value.textContent ?? '';
    for (let index = 0; index < textValue.length; index++) {
      const range = document.createRange(); range.setStart(text, index); range.setEnd(text, index + 1);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.left < glyph.right - 0.5 && rect.right > glyph.left + 0.5 && rect.top < glyph.bottom - 0.5 && rect.bottom > glyph.top + 0.5) overlaps.push(textValue[index]);
        if (textValue[index] === ' ' && rect.width) spaces.push(rect.width);
      }
    }
    const context = document.createElement('canvas').getContext('2d')!;
    const css = getComputedStyle(value); context.font = css.font;
    return {
      text: textValue, children: value.childElementCount, loading: value.hasAttribute('data-loading-value'),
      hidden: value.getAttribute('aria-hidden'), width: glyph.width, height: glyph.height,
      iconHidden: icon.getAttribute('aria-hidden'), stroke: icon.getAttribute('stroke-width'),
      fits: glyph.left >= cardBox.left && glyph.right <= cardBox.right, overlaps, spaces,
      naturalSpace: context.measureText(' ').width,
    };
  }));
  expect(rows).toHaveLength(4);
  for (const row of rows) {
    expect(row.width).toBe(20); expect(row.height).toBe(20); expect(row.stroke).toBe('1.8');
    expect(row.iconHidden).toBe('true'); expect(row.fits).toBe(true); expect(row.children).toBe(0);
    expect(row.overlaps).toEqual([]); expect(row.loading).toBe(loading);
    if (loading) { expect(row.hidden).toBe('true'); expect(['Generic PLA', '—']).toContain(row.text); }
    else for (const space of row.spaces) expect(Math.abs(space - row.naturalSpace)).toBeLessThanOrEqual(1);
  }
  return rows;
};
const colorRows = async (frame: Frame) => {
  const rows = await frame.locator('[data-inset-card]').evaluateAll((cards) => cards.map((card) => {
    const footer = card.querySelector<HTMLElement>('.footer')!;
    const color = footer.querySelector<HTMLElement>('[data-color-value]')!;
    const value = color.querySelector<HTMLElement>('.text')!;
    const swatch = color.querySelector<HTMLElement>('.swatch')!;
    const copy = footer.querySelector<HTMLButtonElement>('button');
    const box = footer.getBoundingClientRect(), text = value.getBoundingClientRect();
    const glyph = swatch.getBoundingClientRect(), button = copy?.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(value);
    const lines = [...range.getClientRects()].filter((rect) => rect.width > 0);
    return {
      label: value.textContent, loading: value.hasAttribute('data-loading-value'), lines: lines.length,
      natural: Math.abs(text.width - range.getBoundingClientRect().width),
      contained: text.left >= box.left && text.right <= box.right && text.top >= box.top && text.bottom <= box.bottom,
      overlap: glyph.left < text.right && glyph.right > text.left && glyph.top < text.bottom && glyph.bottom > text.top,
      button: button ? { width: button.width, height: button.height, right: box.right - button.right,
        gap: button.left - text.right, center: button.y + button.height / 2 - (box.y + 9 + (box.height - 9) / 2) } : null,
    };
  }));
  for (const row of rows) {
    expect(row.contained).toBe(true); expect(row.overlap).toBe(false);
    expect(row.lines).toBe(1);
    if (!row.loading) expect(row.natural).toBeLessThanOrEqual(1);
    if (row.button) {
      expect(row.button.width).toBe(44); expect(row.button.height).toBe(44);
      expect(row.button.right).toBeLessThanOrEqual(1);
      expect(row.button.gap).toBeGreaterThanOrEqual(3.5);
      expect(Math.abs(row.button.center)).toBeLessThanOrEqual(1);
    }
  }
  return rows;
};
for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Heads public empty/unknown and per-tool preview templates ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 });
    const queries = ['lab_scenario=empty', 'lab_scenario=unknown', 'lab_scenario=loaded'];
    for (const scenario of ['mixed', 'empty', 'unknown']) for (const tool of ['0', '1', '2', '3']) for (const material of ['empty', 'petg_blue']) queries.push(`lab_scenario=${scenario}&lab_tool=${tool}&lab_material=${material}`);
    for (const query of queries) {
      await page.goto(`/dashboard/lab/heads?${query}`);
      await page.locator('[data-lab-controls]').waitFor();
      if (enlarged) await enlarge(page.mainFrame());
      await materialRows(page.mainFrame()); await readable(page.mainFrame(), width);
      const ready = await bounds(page.mainFrame());
      await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
      await materialRows(page.mainFrame(), true);
      const loading = await bounds(page.mainFrame());
      expect(loading.length).toBe(ready.length);
      for (let row = 0; row < ready.length; row++) for (let axis = 0; axis < 4; axis++) expect(Math.abs(loading[row][axis] - ready[row][axis]), `${query} region ${row}/${axis}`).toBeLessThanOrEqual(1);
      await expect(page.locator('[data-widget-shell] button,time')).toHaveCount(0);
    }
  });
  test(`Heads lab material icon and natural spacing ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 });
    await page.goto('/dashboard/lab/heads');
    await page.locator('[data-lab-controls]').waitFor();
    if (enlarged) await enlarge(page.mainFrame());
    const rows = await materialRows(page.mainFrame());
    expect(rows[0].text).toBe('Generic PLA');
    await colorRows(page.mainFrame());
    await readable(page.mainFrame(), width);
    const ready = await bounds(page.mainFrame());
    await page.screenshot({ path: test.info().outputPath('heads-material-lab.png'), fullPage: true });
    await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
    await materialRows(page.mainFrame(), true);
    await colorRows(page.mainFrame());
    const loading = await bounds(page.mainFrame());
    expect(loading.length).toBe(ready.length);
    for (let row = 0; row < ready.length; row++) for (let axis = 0; axis < 4; axis++) expect(Math.abs(loading[row][axis] - ready[row][axis])).toBeLessThanOrEqual(1);
    await expect(page.locator('[data-widget-shell] button,time')).toHaveCount(0);
    await page.getByLabel('Preview state', { exact: true }).selectOption('ready');
    expect(await bounds(page.mainFrame())).toEqual(ready);
  });
  test(`Heads real iframe loading, retained refresh and readable values ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 });
    let release: (result: unknown) => void = () => {};
    const calls: unknown[] = [], errors: string[] = [], outside: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4179/')) outside.push(request.url()); });
    await page.route('**/dashboard/tools/call', async (route) => {
      calls.push(route.request().postDataJSON()); const result = await new Promise((resolve) => { release = resolve; }); await route.fulfill({ json: result });
    });
    await page.goto('/dashboard/heads'); await expect.poll(() => calls.length).toBe(1);
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/heads_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Loading Heads & Filaments'); if (enlarged) await enlarge(frame);
    await expect(frame.locator('[data-inset-card]')).toHaveCount(4);
    await expect(frame.locator('[data-widget-shell] button,canvas,video,[aria-valuenow],time')).toHaveCount(0);
    await materialRows(frame, true);
    const details = () => frame.locator('[data-inset-card],[data-inset-card] > div,[data-inset-card] .value-slot,[data-inset-card] .degree').evaluateAll((nodes) => nodes.map((node) => ({ text: node.textContent, class: node.className, box: node.getBoundingClientRect().toJSON() })));
    const loading = await bounds(frame), loadingDetails = await details(); release(liveHeadsResult());
    await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
    expect((await materialRows(frame))[0].text).toBe('Generic PLA');
    await colorRows(frame);
    const ready = await bounds(frame); expect(ready.length).toBe(loading.length);
    await page.screenshot({ path: test.info().outputPath('heads-ready.png'), fullPage: true });
    await test.info().attach('slot-geometry', { body: JSON.stringify({ loading: loadingDetails, ready: await details() }, null, 2), contentType: 'application/json' });
    for (let region = 0; region < ready.length; region++) for (let axis = 0; axis < 4; axis++) expect(Math.abs(ready[region][axis] - loading[region][axis]), `region ${region} axis ${axis}: ${JSON.stringify({ loading: loading[region], ready: ready[region] })}`).toBeLessThanOrEqual(1);
    await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText('Active · Heating');
    await expect(frame.getByRole('region', { name: 'Tool 4', exact: true })).toContainText('Empty');
    await expect(frame.getByRole('button', { name: /^Copy T4/ })).toHaveCount(0);
    const receipts = await frame.locator('[data-observed-meta]').allTextContents(); expect(receipts[0]).not.toBe(receipts[1]);
    const refresh = frame.getByRole('button', { name: 'Refresh Heads & Filaments' }); await refresh.focus(); await refresh.press('Enter');
    await expect.poll(() => calls.length).toBe(2); expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    expect(await frame.locator('[data-observed-meta]').allTextContents()).toEqual(receipts);
    release({ isError: true }); await expect(frame.getByRole('status')).toHaveText('Refresh failed · showing previous observation');
    expect(await bounds(frame)).toEqual(ready); await expect(refresh).toBeFocused();
    const next = liveHeadsResult(13, '2026-09-01T12:00:13.000Z');
    next.structuredContent.module.items[0].vendor.value = 'A'.repeat(64); next.structuredContent.module.items[0].materialType.value = 'B'.repeat(64); next.structuredContent.module.items[0].subtype = { state: 'known', value: 'C'.repeat(64) };
    next.structuredContent.module.items[0].material.value = `${'A'.repeat(64)} ${'B'.repeat(64)} ${'C'.repeat(64)}`;
    next.structuredContent.module.items[0].temperature.value = Number.MAX_VALUE; next.structuredContent.module.items[0].target.value = -Number.MAX_VALUE;
    next.structuredContent.module.items[1].headState.value = 'COOLING'; next.structuredContent.module.items[1].reportedPresence.value = false;
    next.structuredContent.module.items[2].reportedPresence = { state: 'unknown', value: null }; next.structuredContent.module.items[2].target = { state: 'unknown', value: null };
    next.structuredContent.module.materials.state = 'stale'; next.structuredContent.module.materials.freshness = 'stale'; next.structuredContent.module.materials.reason = 'timeout';
    await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*'), next);
    await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText(next.structuredContent.module.items[0].material.value!);
    await expect(frame.getByRole('region', { name: 'Tool 2', exact: true })).toContainText('Cooling');
    await expect(frame.getByRole('region', { name: 'Tool 2', exact: true })).toContainText('Generic PLA');
    await expect(frame.getByRole('region', { name: 'Tool 3', exact: true })).toContainText('N/A');
    await expect(frame.locator('[data-observed-meta]').nth(1)).toContainText('Stale'); await expect(frame.locator('[data-observed-meta]').first()).not.toContainText('Stale');
    await readable(frame, width); expect(errors).toEqual([]); expect(outside).toEqual([]);
    expect((await materialRows(frame))[0].text).toHaveLength(194);
    await page.screenshot({ path: test.info().outputPath('heads-long-text.png'), fullPage: true });
    const partial = liveHeadsResult(14, '2026-09-01T12:00:14.000Z');
    partial.structuredContent.module.items[0].materialType = { state: 'unknown', value: null };
    partial.structuredContent.module.items[0].subtype = { state: 'known', value: 'Matte' };
    partial.structuredContent.module.items[0].material = { state: 'unknown', value: null };
    await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, location.origin), partial);
    await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText('Generic Matte');
    expect((await materialRows(frame))[0].text).toBe('Generic Matte');
    await readable(frame, width);
    expect(calls).toEqual(Array(2).fill({ name: 'refresh_printer_observation', arguments: { view: 'heads' } }));
    await page.screenshot({ path: test.info().outputPath('heads-partial-text.png'), fullPage: true });
  });
}

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`Heads coherent color and Copy row worst RGBA ${width} enlarged=${enlarged}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1600 });
    const result = liveHeadsResult();
    const colors = ['#DDDDDDDD', '#CCCCCCCC', '#3487C880'];
    for (const [index, value] of colors.entries()) result.structuredContent.module.items[index].color = { state: 'known', value };
    await page.route('**/dashboard/tools/call', (route) => route.fulfill({ json: result }));
    await page.goto('/dashboard/heads');
    const frame = page.frames().find((item) => item.url().endsWith('/dashboard/heads_widget'))!;
    await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
    if (enlarged) await enlarge(frame);
    const rows = await colorRows(frame);
    expect(rows.slice(0, 3).map((row) => row.label)).toEqual(colors);
    expect(rows[3].button).toBeNull();
    await readable(frame, width);
    const columns = await frame.locator('.card-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width === 320 || (enlarged && width === 390) ? 1 : 2);
    await frame.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { Object.assign(window, { __copiedColor: value }); } } });
    });
    const before = await bounds(frame), copy = frame.getByRole('button', { name: 'Copy T1 color #DDDDDDDD', exact: true });
    await copy.focus(); await copy.press('Enter');
    await expect(frame.getByRole('status')).toHaveText('#DDDDDDDD copied');
    await expect(copy).toBeFocused();
    expect(await frame.evaluate(() => (window as unknown as { __copiedColor: string }).__copiedColor)).toBe('#DDDDDDDD');
    expect(await bounds(frame)).toEqual(before);
    await page.screenshot({ path: test.info().outputPath('heads-color-copy.png'), fullPage: true });
  });
}

for (const enlarged of [false, true]) test(`Heads public hex fits either side of the column boundary enlarged=${enlarged}`, async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 1600 });
  const result = liveHeadsResult();
  for (const [index, value] of ['#DDDDDDDD', '#CCCCCCCC', '#FFFFFF'].entries()) result.structuredContent.module.items[index].color = { state: 'known', value };
  await page.route('**/dashboard/tools/call', (route) => route.fulfill({ json: result }));
  await page.goto('/dashboard/heads');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/heads_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
  if (enlarged) await enlarge(frame);
  const threshold = enlarged ? 567 : 389;
  for (const width of [threshold - 1, threshold]) {
    await page.setViewportSize({ width, height: 1600 });
    await colorRows(frame); await readable(frame, width);
    expect(await frame.locator('.card-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)).toBe(width < threshold ? 1 : 2);
  }
});

test('Heads copy generations, busy focus, rejection and removed-action fallback', async ({ page }) => {
  const next = liveHeadsResult();
  await page.route('**/dashboard/tools/call', (route) => route.fulfill({ json: next }));
  await page.goto('/dashboard/heads');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/heads_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
  await frame.evaluate(() => {
    const pending: { value: string; resolve: () => void; reject: () => void }[] = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (value: string) => new Promise<void>((resolve, reject) => pending.push({ value, resolve, reject: () => reject(new Error('denied')) })) } });
    Object.assign(window, { __headCopies: pending });
  });
  const copy = frame.getByRole('button', { name: 'Copy T1 color #FFFFFFFF', exact: true }); await copy.focus(); await copy.press('Enter'); await copy.press('Enter');
  await expect(copy).toHaveAttribute('aria-disabled', 'true'); await expect(copy).toBeFocused();
  expect(await frame.evaluate(() => (window as unknown as { __headCopies: unknown[] }).__headCopies.length)).toBe(1);
  const before = await bounds(frame);
  await frame.evaluate(() => (window as unknown as { __headCopies: { reject: () => void }[] }).__headCopies[0].reject());
  await expect(frame.getByRole('status')).toHaveText('#FFFFFFFF copy unavailable'); expect(await bounds(frame)).toEqual(before); await expect(copy).toBeFocused();
  await copy.press('Enter'); next.structuredContent.observationVersion += 1; next.structuredContent.receivedAt = '2026-09-01T12:00:13.000Z'; next.structuredContent.module.items[0].reportedPresence.value = false;
  await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*'), next);
  await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toBeFocused();
  await expect(copy).toHaveCount(0); await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText('Empty');
  await frame.evaluate(() => (window as unknown as { __headCopies: { resolve: () => void }[] }).__headCopies[1].resolve());
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
});

test('Heads initial failure retry, BFCache and superseded rejected refresh retain one root', async ({ page }) => {
  let calls = 0, fail: () => void = () => {};
  await page.route('**/dashboard/tools/call', async (route) => {
    calls += 1;
    if (calls === 1) await route.fulfill({ status: 503, json: { error: 'unavailable' } });
    else if (calls === 3) { await new Promise<void>((resolve) => { fail = resolve; }); await route.fulfill({ status: 503, json: { error: 'old request' } }); }
    else await route.fulfill({ json: liveHeadsResult(calls === 2 ? 12 : 16, calls === 2 ? '2026-09-01T12:00:12.000Z' : '2026-09-01T12:00:16.000Z') });
  });
  await page.goto('/dashboard/heads');
  const frame = page.frames().find((item) => item.url().endsWith('/dashboard/heads_widget'))!;
  await expect(frame.getByRole('status')).toHaveText('Could not load Heads & Filaments');
  const refresh = frame.getByRole('button', { name: 'Refresh Heads & Filaments' }); await refresh.click();
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded');
  await frame.evaluate(() => {
    const before = document.querySelector('[data-inset-card]');
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    if (document.querySelector('[data-inset-card]') !== before) throw new Error('BFCache replaced the Heads root');
  });
  expect(calls).toBe(2); await refresh.focus(); await refresh.press('Enter'); await expect.poll(() => calls).toBe(3);
  const next = liveHeadsResult(15, '2026-09-01T12:00:15.000Z'); next.structuredContent.module.items[0].temperature.value = 225;
  await page.evaluate((value) => document.querySelector('iframe')!.contentWindow!.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-result', params: value }, '*'), next);
  await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText('225°');
  const retained = await bounds(frame); fail(); await expect(refresh).not.toHaveAttribute('aria-disabled', 'true');
  await expect(frame.getByRole('status')).toHaveText('Heads & Filaments loaded'); await expect(refresh).toBeFocused(); expect(await bounds(frame)).toEqual(retained);
  await refresh.press('Enter'); await expect.poll(() => calls).toBe(4); await expect(frame.getByRole('region', { name: 'Tool 1', exact: true })).toContainText('220°');
});
