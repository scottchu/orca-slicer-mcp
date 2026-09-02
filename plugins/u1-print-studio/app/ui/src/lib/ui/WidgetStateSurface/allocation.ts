// Presentation geometry only: no text, attributes containing readings, DTOs or
// cloned nodes are retained. A changed viewport releases obsolete allocations.
const regions = ['[data-widget-header]', '[data-widget-body]', '[data-widget-footer]', '[data-inset-card]', '[data-record]'];
type Allocation = { selector: string; heights: number[] };
export const createSurfaceAllocation = (root: HTMLElement) => {
  let failed = false;
  let allocated: Allocation[] = [];
  let width = root.getBoundingClientRect().width;
  const owned = new Map<HTMLElement, string>();
  const clear = () => {
    owned.forEach((value, element) => { element.style.minBlockSize = value; });
    owned.clear();
  };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    const next = root.getBoundingClientRect().width;
    if (Math.abs(next - width) > 1) { clear(); allocated = []; width = next; }
  });
  observer?.observe(root);
  return {
    before: (next: boolean) => {
      if (next && !failed) allocated = regions.map((selector) => ({ selector, heights: [...root.querySelectorAll<HTMLElement>(selector)].map((element) => element.getBoundingClientRect().height) }));
      if (!next) { clear(); allocated = []; }
      failed = next;
    },
    after: () => {
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
