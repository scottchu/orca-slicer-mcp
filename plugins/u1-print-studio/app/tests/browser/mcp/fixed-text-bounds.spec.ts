import { expect, test } from '@playwright/test';
import { doubleSyntheticText } from '../helpers/text-scale';
import { focusedResult, focusedSnapshot } from '../fixtures/live-focused';

for (const view of ['progress', 'jobs'] as const) {
  for (const enlarged of [false, true]) {
    test(`fixed ${view} keeps actual glyphs inside the card at ${enlarged ? '320 computed 200%' : '390 100%'}`, async ({ page, request }) => {
      await page.setViewportSize({ width: enlarged ? 320 : 390, height: 1200 });
      await request.post('/fixture/configure', { data: { reset: true } });
      const source = focusedSnapshot();
      if (view === 'jobs') {
        source.currentJob!.filename.value = `Long printable fixture ${'abcde'.repeat(24)}.gcode`;
        source.currentJob!.filamentUsedMillimeters.value = Number.MAX_SAFE_INTEGER;
      }
      await page.route('**/fixture/call', route => route.fulfill({ json: focusedResult(view, source) }));
      await page.goto(`/host?view=${view}`);
      const frame = page.frameLocator('iframe');
      const body = frame.locator('[data-widget-body]');
      await expect(frame.locator('[data-widget-state-surface="ready"]')).toBeVisible();
      if (enlarged) {
        const inner = await (await page.locator('iframe').elementHandle())!.contentFrame();
        if (!inner) throw new Error('Widget frame unavailable');
        await doubleSyntheticText(inner);
      }
      await expect(body).toContainText(view === 'progress' ? '42' : `${Number.MAX_SAFE_INTEGER} mm`);
      const escaped = await body.evaluate(root => {
        const bounds = root.getBoundingClientRect();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const clipped: string[] = [];
        for (let text = walker.nextNode(); text; text = walker.nextNode()) {
          const parent = text.parentElement;
          if (!text.textContent?.trim() || !parent || parent.closest('[aria-hidden="true"], [inert]') || getComputedStyle(parent).visibility === 'hidden') continue;
          const range = document.createRange(); range.selectNodeContents(text);
          for (const rect of range.getClientRects()) {
            if (rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) clipped.push(text.textContent);
          }
        }
        return clipped;
      });
      expect(escaped).toEqual([]);
    });
  }
}
