import { describe, expect, test } from 'vitest';
import { OrthographicCamera, Vector3 } from 'three';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import { cageLines, meshDisplay, projectedAxes, selectSides, type Point } from './display';

describe('reported mesh display geometry', () => {
  for (const [name, rows, columns, sample] of [
    ['flat zero', 2, 2, () => 0], ['flat nonzero', 11, 11, () => 0.35],
    ['negative', 3, 7, (r: number, c: number) => -1 - r * 0.1 - c * 0.01],
    ['tilted', 11, 11, (r: number, c: number) => (r - c) * 0.05],
    ['tiny', 2, 2, (r: number, c: number) => 0.3 + (r + c) * 1e-8],
    ['dense', 64, 64, (r: number, c: number) => Math.sin(r) * Math.cos(c)]
  ] as const) {
    test(`${name}: nondegenerate cage, reversible mm and exact samples/topology`, () => {
      const matrix = Array.from({ length: rows }, (_, r) => Array.from({ length: columns }, (_, c) => sample(r, c)));
      const minimum = Math.min(...matrix.flat());
      const maximum = Math.max(...matrix.flat());
      const observation = { ...bedMeshLabFixture, matrix, bounds: { xMin: -20, xMax: 300, yMin: 10, yMax: 170 }, summary: { rows, columns, minimum, maximum, range: maximum - minimum } };
      const before = structuredClone(observation);
      const display = meshDisplay(observation);
      expect(display.high).toBeGreaterThan(maximum);
      expect(display.low).toBeLessThan(minimum);
      expect(display.halfX / display.halfY).toBe(2);
      expect(display.positions).toHaveLength(rows * columns * 3);
      expect(display.indices).toHaveLength((rows - 1) * (columns - 1) * 6);
      matrix.flat().forEach((value, index) => expect(display.value(display.positions[index * 3 + 1])).toBeCloseTo(value, 12));
      expect(observation).toEqual(before);
      for (const x of [-1, 1]) for (const y of [-1, 1]) {
        const lines = cageLines(display, { x, y, z: 0 });
        expect(lines.every(Number.isFinite)).toBe(true);
        const vertical = [];
        for (let i = 0; i < lines.length; i += 6) if (lines[i] === lines[i + 3] && lines[i + 2] === lines[i + 5] && lines[i + 1] !== lines[i + 4]) vertical.push(lines.slice(i, i + 6));
        expect(vertical.length).toBe(14);
      }
    });
  }
  test('quadrant hysteresis holds near the boundary, then changes coherently', () => {
    expect(selectSides(-0.01, 1, { x: 1, y: 1, z: 0 })).toEqual({ x: 1, y: 1, z: 0 });
    expect(selectSides(-0.1, -1, { x: 1, y: 1, z: 0 })).toEqual({ x: -1, y: -1, z: 0 });
  });
  test('axes remain true visible perimeter edges with actual bound values across orbits', () => {
    const display = meshDisplay(bedMeshLabFixture);
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
    for (const angle of [0, 0.01, Math.PI / 4, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 1.99]) {
      camera.position.set(Math.sin(angle), 0.8, Math.cos(angle));
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      const project = (p: Point) => { const value = new Vector3(...p).project(camera); return { x: value.x * 200, y: -value.y * 150 }; };
      const sides = selectSides(camera.position.x, camera.position.z);
      const { axes } = projectedAxes(display, bedMeshLabFixture, sides, project);
      expect(axes[0].a[2]).toBe(sides.y * display.halfY);
      expect(axes[1].a[0]).toBe(sides.x * display.halfX);
      expect(axes[2].a[0]).toBe(axes[2].b[0]);
      expect(axes[2].a[2]).toBe(axes[2].b[2]);
      expect(axes[2].min).toBe(display.low);
      expect(axes[2].max).toBe(display.high);
      const opposite = projectedAxes(display, bedMeshLabFixture, sides, project, 'right');
      expect(opposite.axes.slice(0, 2)).toEqual(axes.slice(0, 2));
      expect(opposite.axes[2].a[0]).toBe(opposite.axes[2].b[0]);
      expect(opposite.axes[2].a[2]).toBe(opposite.axes[2].b[2]);
      expect(project(opposite.axes[2].a).x).toBeGreaterThanOrEqual(project(axes[2].a).x - 8);
      expect(opposite.axes[2].min).toBe(display.low);
      expect(opposite.axes[2].max).toBe(display.high);
    }
  });
});
