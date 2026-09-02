// Presentation geometry only: no text, attributes containing readings, DTOs or
// cloned nodes are retained. Width or typography changes release obsolete sizes.
const regions = ['[data-widget-header]', '[data-widget-body]', '[data-widget-footer]', '[data-inset-card]', '[data-record]'];
type Allocation = { selector: string; heights: number[] };
export const createSurfaceAllocation = (root: HTMLElement) => {
  let failed = false;
  let allocated: Allocation[] = [];
  let width = root.getBoundingClientRect().width;
  const typography = () => [...new Set([...root.querySelectorAll<HTMLElement>('[data-loading-value], [data-widget-header], [data-widget-footer]')].map((element) => getComputedStyle(element).fontSize))].sort().join();
  let font = typography();
  const owned = new Map<HTMLElement, string>();
  const clear = () => {
    owned.forEach((value, element) => { element.style.minBlockSize = value; });
    owned.clear();
  };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    const next = root.getBoundingClientRect().width;
    const nextFont = typography();
    if (Math.abs(next - width) > 1 || nextFont !== font) { clear(); allocated = []; width = next; font = nextFont; }
  });
  observer?.observe(root);
  return {
    before: (next: boolean) => {
      if (next && !failed) allocated = regions.map((selector) => ({ selector, heights: [...root.querySelectorAll<HTMLElement>(selector)].map((element) => element.getBoundingClientRect().height) }));
      if (!next) { clear(); allocated = []; }
      failed = next;
    },
    after: () => {
      font = typography();
      observer?.disconnect();
      observer?.observe(root);
      root.querySelectorAll<HTMLElement>('[data-loading-value]').forEach((element) => observer?.observe(element));
      if (!failed) return;
      for (const { selector, heights } of allocated) root.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
        const height = heights[index];
        if (!Number.isFinite(height) || height <= 0) return;
        if (!owned.has(element)) owned.set(element, element.style.minBlockSize);
        element.style.minBlockSize = `${height}px`;
      });
    },
    dispose: () => { observer?.disconnect(); clear(); allocated = []; }
  };
};
