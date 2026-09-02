// Shared chart leaves can reserve measured text without sacrificing a complete
// vertical column of plotting area. Coordinates are relative to the plot leaf.
export const chartObstacles = (host: HTMLElement) => {
  const origin = host.getBoundingClientRect();
  return [...(host.closest('[data-chart-frame]')?.querySelectorAll('[data-chart-obstacle]') ?? [])].map((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.x - origin.x, y: box.y - origin.y, width: box.width, height: box.height };
  });
};
