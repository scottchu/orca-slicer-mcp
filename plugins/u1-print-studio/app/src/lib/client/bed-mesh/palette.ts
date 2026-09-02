export const meshPalette = ['#4361c5', '#3e95d1', '#38c6c7', '#45d16f', '#9fd83e', '#efd43a', '#e6a43b'];

export function meshColor(value: number, minimum: number, range: number): string {
  const ratio = range > 0 ? Math.max(0, Math.min(1, (value - minimum) / range)) : 0.5;
  const scaled = ratio * (meshPalette.length - 1);
  const index = Math.min(meshPalette.length - 2, Math.floor(scaled));
  const part = scaled - index;
  const from = meshPalette[index];
  const to = meshPalette[index + 1];
  const channel = (offset: number) => Math.round(parseInt(from.slice(offset, offset + 2), 16) * (1 - part) + parseInt(to.slice(offset, offset + 2), 16) * part);
  return `rgb(${channel(1)}, ${channel(3)}, ${channel(5)})`;
}
