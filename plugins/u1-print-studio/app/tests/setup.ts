import '@testing-library/jest-dom/vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverStub, configurable: true });
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => new Proxy({ measureText: () => ({ width: 0 }) }, { get: (target, property) => property in target ? target[property as keyof typeof target] : () => undefined, set: () => true })
});
