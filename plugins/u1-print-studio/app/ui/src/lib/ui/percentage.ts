/** Decorative fill only; the child content owns the actual measurement. */
export const percentageFill = (value: number | null, max: number | null): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 ||
      typeof max !== 'number' || !Number.isFinite(max) || max <= 0) return null;
  // Compare first so even very small positive denominators cannot overflow.
  return value >= max ? 100 : (value / max) * 100;
};

/** Undefined selects the theme accent; invalid overrides render no fill. */
export const percentageColor = (color: string | undefined): string | null | undefined => {
  if (color === undefined) return undefined;
  return typeof color === 'string' && color.length === 7 && /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null;
};
