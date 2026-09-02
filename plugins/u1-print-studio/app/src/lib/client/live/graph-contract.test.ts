import { describe, expect, it } from 'vitest';
import { assertFocusedProductionInventory, assertLiveObservationBytes, assertLiveObservationModule, assertObservationLabModule, assertWidgetClientModule, FOCUSED_PRODUCTION_VIEWS } from '../../../../scripts/observation-graph-contract';
describe('compiled observation graph boundaries', () => {
  it.each(['/src/lib/server/runtime.ts', '/src/routes/dashboard/fans/+page.svelte', '/src/routes/dashboard/tools/call/+server.ts', '/src/entrypoints/server.ts', '/src/entrypoints/stdio-main.ts', '/src/entrypoints/cli.ts', '/.svelte-kit/output/server/index.js'])('rejects application-only input %s from every widget graph', (id) => {
    for (const assertion of [assertWidgetClientModule, assertObservationLabModule, assertLiveObservationModule]) {
      expect(() => assertion(id)).toThrow('server or application route');
    }
  });
  it('accepts measured artifact sizes while rejecting invalid byte counts', () => {
    for (const value of [99_999, 100_000, 100_001, 2_000_000]) expect(() => assertLiveObservationBytes(value)).not.toThrow();
    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) expect(() => assertLiveObservationBytes(value)).toThrow();
  });
  it('validates the focused artifact inventory without a byte ceiling', () => {
    for (let count = 1; count <= 10; count += 1) {
      expect(() => assertFocusedProductionInventory(FOCUSED_PRODUCTION_VIEWS.slice(0, count).map((view) => ({ view, bytes: Math.floor(1_550_000 / count) })))).not.toThrow();
    }
    expect(() => assertFocusedProductionInventory([{ view: 'queue', bytes: 1_550_000 }])).not.toThrow();
    expect(() => assertFocusedProductionInventory([{ view: 'queue', bytes: 1_550_001 }])).not.toThrow();
    expect(() => assertFocusedProductionInventory([])).toThrow('inventory');
    const duplicateViews = [...FOCUSED_PRODUCTION_VIEWS, 'queue'] as const;
    expect(() => assertFocusedProductionInventory(duplicateViews.map((view) => ({ view, bytes: 1 })))).toThrow('inventory');
    expect(() => assertFocusedProductionInventory([{ view: 'queue', bytes: 1 }, { view: 'queue', bytes: 1 }])).toThrow('inventory');
    expect(() => assertFocusedProductionInventory([{ view: 'lab' as 'queue', bytes: 1 }])).toThrow('inventory');
    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => assertFocusedProductionInventory([{ view: 'queue', bytes: value }])).toThrow('inventory');
    }
  });
  it.each(['heads-adapter', 'heads-controller', 'thermals-adapter', 'fans-controller', 'controller', 'observation-controller', 'observation-port', 'host-rpc'])('rejects live %s in lab', (name) => {
    expect(() => assertObservationLabModule(`/src/lib/client/live/${name}.ts`)).toThrow();
  });
  it('rejects the shared host transport and media imports in lab', () => {
    expect(() => assertObservationLabModule('/src/lib/client/host/rpc.ts')).toThrow();
    expect(() => assertObservationLabModule('/src/components/camera/LiveCameraRoot.svelte')).toThrow();
  });
  it.each(['/src/lib/client/fixtures/observations.ts', '/src/tests/heads.ts', '/src/lib/client/lab/scenarios.ts', '/src/components/camera/Camera.svelte', '/src/lib/client/bed-mesh/chart.ts', '/node_modules/three/build/three.js', '/src/lib/client/live/heads.test.ts'])('rejects nonproduction graph input %s', (id) => {
    expect(() => assertLiveObservationModule(id)).toThrow();
  });
  it('rejects another focused domain from an exact production graph', () => {
    expect(() => assertLiveObservationModule('/src/lib/client/live/heads-presentation.ts', 'queue')).toThrow('another observation domain');
    expect(() => assertLiveObservationModule('/src/lib/client/live/queue-controller.ts', 'heads')).toThrow('another observation domain');
    expect(() => assertLiveObservationModule('/src/lib/client/live/queue-presentation.ts', 'queue')).not.toThrow();
    expect(() => assertLiveObservationModule('/src/lib/client/live/controller.ts', 'queue')).not.toThrow();
  });
  it('allows shared presentation and leaves in both entries', () => {
    for (const id of ['/src/lib/client/live/heads-presentation.ts', '/src/components/common/InsetCard.svelte', '/src/components/observation/HeadCards.svelte']) {
      expect(() => assertObservationLabModule(id)).not.toThrow(); expect(() => assertLiveObservationModule(id)).not.toThrow();
    }
  });
});
