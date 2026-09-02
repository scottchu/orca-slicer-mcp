import { afterEach, expect, it, vi } from 'vitest';
import { createSurfaceAllocation } from './allocation';

afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); });

it('releases numeric sizes on width/font changes, recovery and disposal without retaining content', () => {
  let resize = () => {};
  const disconnect = vi.fn(), observe = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  const root = document.createElement('div');
  root.innerHTML = '<div data-widget-body style="min-block-size:2px"><span data-loading-value style="font-size:12px">private prior reading</span></div>';
  document.body.append(root);
  let width = 390;
  root.getBoundingClientRect = () => ({ width }) as DOMRect;
  const body = root.firstElementChild as HTMLElement, value = body.firstElementChild as HTMLElement;
  body.getBoundingClientRect = () => ({ height: 75 }) as DOMRect;
  const allocation = createSurfaceAllocation(root);
  allocation.before(true); value.textContent = ''; allocation.after();
  expect(body.style.minBlockSize).toBe('75px');
  expect(root.textContent).toBe('');
  value.style.fontSize = '24px'; resize();
  expect(body.style.minBlockSize).toBe('2px');
  allocation.before(false); allocation.before(true); allocation.after();
  width = 320; resize();
  expect(body.style.minBlockSize).toBe('2px');
  allocation.before(false); allocation.before(true); allocation.after();
  allocation.before(false);
  expect(body.style.minBlockSize).toBe('2px');
  allocation.before(true); allocation.after(); allocation.dispose();
  expect(body.style.minBlockSize).toBe('2px');
  expect(disconnect).toHaveBeenCalled();
});
