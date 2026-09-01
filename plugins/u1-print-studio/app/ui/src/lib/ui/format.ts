export function formatDegree(value: number | null, precision: 0 | 1 = 0): { visible: string; accessible: string } {
  if (value === null || !Number.isFinite(value)) return { visible: '—', accessible: 'Temperature unavailable' };
  const rounded = precision === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  const text = Object.is(rounded, -0) ? '0' : rounded.toFixed(precision);
  return { visible: `${text}°`, accessible: `${text} degrees Celsius` };
}

export function formatTimestamp(value: string | null): string | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value) return null;
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(date);
}
