import { expect, test, type Page } from '@playwright/test';

const cases = [
  ['overview', 'lab_scenario=standby'], ['overview', 'lab_scenario=complete'],
  ['progress', 'lab_scenario=printing&lab_percent=0'], ['progress', 'lab_scenario=printing&lab_percent=100'],
  ['progress', 'lab_scenario=complete'], ['progress', 'lab_scenario=standby'],
  ['heads', 'lab_scenario=loaded'], ['heads', 'lab_scenario=empty'], ['heads', 'lab_scenario=unknown'],
  ['jobs', 'lab_scenario=complete'], ['jobs', 'lab_scenario=standby'],
  ['queue', 'lab_count=10'], ['job_history', 'lab_count=20'], ['job_history', 'lab_scenario=mixed_outcomes'],
  ['fans', 'lab_rpm=100000&lab_percent=33.3&lab_mode=preheat_chamber'], ['fans', 'lab_mode=hot_chamber'], ['fans', 'lab_mode=unknown'],
  ['thermals', 'lab_actual=300&lab_target=0'], ['thermals', 'lab_scenario=unknown_targets'],
  ['bed_mesh', 'lab_scenario=flat'], ['bed_mesh', 'lab_scenario=tilted']
] as const;
const doubleText = (page: Page) => page.evaluate(() => {
  for (const sheet of document.styleSheets) for (const rule of sheet.cssRules) {
    const visit = (item: CSSRule): void => {
      if ('cssRules' in item) for (const child of (item as CSSGroupingRule).cssRules) visit(child);
      if (!(item instanceof CSSStyleRule)) return;
      const size = item.style.getPropertyValue('font-size');
      if (size) item.style.setProperty('font-size', size.replace(/([\d.]+)(px|vw)/g, (_, value, unit) => `${Number(value) * 2}${unit}`));
      for (const token of ['--u1-type-label', '--u1-type-name', '--u1-type-value']) {
        const value = item.style.getPropertyValue(token);
        if (value.endsWith('px')) item.style.setProperty(token, `${Number.parseFloat(value) * 2}px`);
      }
    };
    visit(rule);
  }
});
const clippedText = (page: Page) => page.locator('[data-widget-shell]').evaluate((shell) => {
  const findings: string[] = [];
  const walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT);
  let text: Node | null;
  while ((text = walker.nextNode())) {
    if (!text.textContent?.trim()) continue;
    const owner = text.parentElement!;
    if (owner.closest('[aria-hidden="true"]') || getComputedStyle(owner).visibility === 'hidden') continue;
    const range = document.createRange(); range.selectNodeContents(text);
    for (const rect of range.getClientRects()) for (let parent: HTMLElement | null = owner; parent && parent !== shell.parentElement; parent = parent.parentElement) {
      const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
      if ((['hidden', 'clip'].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) ||
          (['hidden', 'clip'].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1))) {
        findings.push(`${text.textContent.trim()} clipped by ${parent.className}`); break;
      }
    }
  }
  return findings;
});
const bounds = (page: Page) => page.locator('[data-widget-shell], [data-widget-header], [data-widget-body], [data-widget-footer], [data-chart-frame], [data-reading-list], .overview-grid, .head-grid, .observation-list').evaluateAll((nodes) => nodes.map((node) => {
  const rect = node.getBoundingClientRect();
  return [rect.x + scrollX, rect.y + scrollY, rect.width, rect.height];
}));

for (const width of [320, 390, 590, 720]) for (const enlarged of [false, true]) {
  test(`closed presets retain every visible glyph at ${width}, enlarged=${enlarged}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 1800 });
    for (const [view, query] of cases) {
      await page.goto(`/dashboard/lab/${view}?${query}`);
      await page.locator('[data-lab-controls]').waitFor();
      if (enlarged) await doubleText(page);
      expect.soft(await clippedText(page), `${view} ${query}`).toEqual([]);
      const ready = await bounds(page);
      await page.getByLabel('Preview state', { exact: true }).selectOption('loading');
      const loading = await bounds(page);
      expect.soft(loading.length).toBe(ready.length);
      for (let index = 0; index < ready.length; index++) for (let axis = 0; axis < 4; axis++) {
        expect.soft(Math.abs(ready[index][axis] - (loading[index]?.[axis] ?? Infinity)), `${view} ${query} region ${index}/${axis}`).toBeLessThanOrEqual(1);
      }
      await expect(page.locator('[data-widget-shell] button, [data-widget-shell] canvas, [data-widget-shell] [aria-valuenow]')).toHaveCount(0);
    }
  });
}
