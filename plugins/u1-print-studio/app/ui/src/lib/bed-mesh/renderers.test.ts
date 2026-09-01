import { render as mountComponent } from '@testing-library/svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { tick } from 'svelte';
import { BufferGeometry, Mesh, type Scene, type Camera } from 'three';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import BedMesh3D from './BedMesh3D.svelte';
import BedMesh2D from './BedMesh2D.svelte';

const probes = vi.hoisted(() => ({ renders: [] as { scene: Scene; camera: Camera }[], disposed: vi.fn(), lost: vi.fn() }));
vi.mock('three', async (load) => {
  const actual = await load<typeof import('three')>();
  return { ...actual, WebGLRenderer: class {
    domElement = document.createElement('canvas');
    setPixelRatio = () => {};
    setClearColor = () => {};
    setSize = () => {};
    render = (scene: Scene, camera: Camera) => { probes.renders.push({ scene, camera }); };
    dispose = probes.disposed;
    forceContextLoss = probes.lost;
  } };
});

afterEach(() => { vi.restoreAllMocks(); probes.renders.length = 0; });
describe('persistent reactive mesh leaves', () => {
  test('3D updates exact buffers, colors and grid without resetting orbit; disposes replacements and final resources', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 450, width: 600, height: 450, toJSON: () => ({}) });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ font: '600 12px sans-serif', fontSize: '12px' } as CSSStyleDeclaration);
    const dispose = vi.spyOn(BufferGeometry.prototype, 'dispose');
    const app = mountComponent(BedMesh3D, { observation: bedMeshLabFixture });
    await tick();
    const { scene, camera } = probes.renders.at(-1)!;
    const surface = scene.children.find((item) => item instanceof Mesh) as Mesh;
    const oldGeometry = surface.geometry;
    const oldColors = [...oldGeometry.getAttribute('color').array];
    const canvas = app.container.querySelector('canvas');
    // Changing camera orientation here exercises the persistent instance, not a
    // test-only route/prop in the shipped renderer.
    camera.position.set(-1, 1, -1);
    camera.lookAt(0, 0, 0);
    const position = camera.position.clone();
    const next = structuredClone(bedMeshLabFixture);
    next.matrix = [[0, 0.1], [0.2, 0.3]];
    next.bounds = { xMin: -20, xMax: 300, yMin: 10, yMax: 170 };
    next.summary = { minimum: 0, maximum: 0.3, range: 0.3, rows: 2, columns: 2 };
    const beforeCalls = dispose.mock.calls.length;
    await app.rerender({ observation: next });
    expect(app.container.querySelector('canvas')).toBe(canvas);
    expect(probes.renders.at(-1)!.camera).toBe(camera);
    expect(camera.position).toEqual(position);
    expect(surface.geometry).not.toBe(oldGeometry);
    expect(surface.geometry.getAttribute('position').count).toBe(4);
    expect(surface.geometry.index?.count).toBe(6);
    expect([...surface.geometry.getAttribute('color').array]).not.toEqual(oldColors);
    expect(dispose.mock.calls.length).toBeGreaterThan(beforeCalls);
    expect(app.container.querySelector('[data-axis="x-min"]')).toHaveTextContent('-20');
    await app.rerender({ observation: next, resetKey: 1 });
    expect(camera.position.x).toBeCloseTo(0.92);
    const beforeUnmount = dispose.mock.calls.length;
    app.unmount();
    expect(dispose.mock.calls.length).toBe(beforeUnmount + 3);
    expect(probes.disposed).toHaveBeenCalled();
    expect(probes.lost).toHaveBeenCalled();
    expect(app.container.querySelector('canvas')).toBeNull();
  });
  test('2D redraws changed props without a resize/remount and respects rectangular bounds', async () => {
    const fillRect = vi.fn();
    const context = new Proxy({ fillRect }, { get: (object, key) => key in object ? object[key as keyof typeof object] : () => undefined, set: () => true });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 600, height: 450 } as DOMRect);
    const app = mountComponent(BedMesh2D, { observation: bedMeshLabFixture });
    await tick();
    const canvas = app.container.querySelector('canvas');
    fillRect.mockClear();
    const next = { ...bedMeshLabFixture, bounds: { xMin: -20, xMax: 300, yMin: 10, yMax: 170 } };
    await app.rerender({ observation: next });
    expect(fillRect).toHaveBeenCalledTimes(121);
    const first = fillRect.mock.calls[0];
    expect((first[2] - 0.5) / (first[3] - 0.5)).toBeCloseTo(2);
    expect(app.container.querySelector('canvas')).toBe(canvas);
    app.unmount();
  });
});
