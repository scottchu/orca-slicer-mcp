import type { Frame, Page } from '@playwright/test';

type Surface = Page | Frame;

/** Root text preference only: rem text and rem layout follow the root size.
 * This is deliberately distinct from browser zoom and legacy CSS rewriting. */
export const scaleRootText = async (surface: Surface, percent: 100 | 200) => {
  const baseline = await surface.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
  return surface.addStyleTag({ content: `html { font-size: ${baseline * percent / 100}px !important; }` });
};

/** Synthetic text-only stress mode for mixed legacy px and shared rem text.
 * Doubles rem once through the root, px/vw declarations once through the CSSOM,
 * and legacy px typography tokens once. It does not simulate browser zoom. */
export const doubleSyntheticText = (surface: Surface) => surface.evaluate(() => {
  const baseline = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
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
  document.documentElement.style.setProperty('font-size', `${baseline * 2}px`, 'important');
});
