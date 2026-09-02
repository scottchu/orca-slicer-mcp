import { afterEach, expect, test, vi } from 'vitest';
import { chartObstacles } from './chart-obstacles';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
test('chart reservations are measured relative to the leaf and cannot see sibling charts', () => {
  document.body.innerHTML = '<div data-chart-frame><span data-chart-obstacle></span><canvas></canvas></div><div data-chart-frame><span data-chart-obstacle></span></div>';
  const host = document.querySelector('canvas')!;
  const obstacle = document.querySelector('[data-chart-obstacle]')!;
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ x: 20, y: 30 } as DOMRect);
  vi.spyOn(obstacle, 'getBoundingClientRect').mockReturnValue({ x: 5, y: 40, width: 60, height: 24 } as DOMRect);
  expect(chartObstacles(host)).toEqual([{ x: -15, y: 10, width: 60, height: 24 }]);
  expect(chartObstacles(document.createElement('canvas'))).toEqual([]);
});
