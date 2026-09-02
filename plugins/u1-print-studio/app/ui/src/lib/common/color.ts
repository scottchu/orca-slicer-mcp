export type Color = { hex: string; red: number; green: number; blue: number; alpha: number };

/** Closed RGB/RGBA input; alpha remains evidence, not a theme opacity override. */
export const parseColor = (value: unknown): Color | null => {
  if (typeof value !== 'string' || !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value)) return null;
  const hex = value.toUpperCase();
  return { hex, red: parseInt(hex.slice(1, 3), 16), green: parseInt(hex.slice(3, 5), 16), blue: parseInt(hex.slice(5, 7), 16), alpha: hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1 };
};

export const colorWash = (value: unknown): string | null => {
  const color = parseColor(value);
  return color ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha * .06})` : null;
};
