import { describe, expect, it } from 'vitest';
import { assertCurrentJobModule, assertFocusedProductionAggregate, assertLiveObservationBytes, assertLiveObservationModule, assertObservationLabModule, FOCUSED_PRODUCTION_VIEWS } from '../../../scripts/observation-graph-contract';
describe('compiled observation graph boundaries', () => {
  it('Current Job excludes every other emitted domain, fixture schema and lab controls', () => {
    for (const id of ['live/current-job-adapter.ts', 'live/current-job-controller.ts', 'live/LiveCurrentJobRoot.svelte', 'live/controller.ts', 'live/validation.ts', 'observation/CurrentJobFacts.svelte', 'ui/QuantityValue.svelte']) expect(() => assertCurrentJobModule(`/src/lib/${id}`)).not.toThrow();
    for (const id of ['live/fans-adapter.ts', 'live/thermals-controller.ts', 'live/heads-presentation.ts', 'observation/HeadsPanel.svelte', 'observation/types.ts', 'observation/CurrentJobWidget.svelte', 'ui/LabControls.svelte', 'camera/session.ts', 'fixtures/observations.ts']) expect(() => assertCurrentJobModule(`/src/lib/${id}`)).toThrow();
    expect(() => assertObservationLabModule('/src/lib/live/current-job-adapter.ts')).toThrow();
    expect(() => assertObservationLabModule('/src/lib/live/current-job-controller.ts')).toThrow();
  });
  it('enforces production raw byte boundary including invalid input', () => {
    for (const value of [99_999, 100_000]) expect(() => assertLiveObservationBytes(value)).not.toThrow();
    for (const value of [100_001, 0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) expect(() => assertLiveObservationBytes(value)).toThrow();
  });
  it('bounds one through ten focused production artifacts without claiming future closure', () => {
    for (let count = 1; count <= 10; count += 1) {
      expect(() => assertFocusedProductionAggregate(FOCUSED_PRODUCTION_VIEWS.slice(0, count).map((view) => ({ view, bytes: Math.floor(1_550_000 / count) })))).not.toThrow();
    }
    expect(() => assertFocusedProductionAggregate([{ view: 'queue', bytes: 1_550_000 }])).not.toThrow();
    expect(() => assertFocusedProductionAggregate([{ view: 'queue', bytes: 1_550_001 }])).toThrow('aggregate');
    expect(() => assertFocusedProductionAggregate([])).toThrow('inventory');
    const duplicateViews = [...FOCUSED_PRODUCTION_VIEWS, 'queue'] as const;
    expect(() => assertFocusedProductionAggregate(duplicateViews.map((view) => ({ view, bytes: 1 })))).toThrow('inventory');
    expect(() => assertFocusedProductionAggregate([{ view: 'queue', bytes: 1 }, { view: 'queue', bytes: 1 }])).toThrow('inventory');
    expect(() => assertFocusedProductionAggregate([{ view: 'lab' as 'queue', bytes: 1 }])).toThrow('inventory');
    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => assertFocusedProductionAggregate([{ view: 'queue', bytes: value }])).toThrow('inventory');
    }
  });
  it.each(['heads-adapter', 'heads-controller', 'thermals-adapter', 'fans-controller', 'controller', 'observation-controller', 'observation-port', 'host-rpc'])('rejects live %s in lab', (name) => {
    expect(() => assertObservationLabModule(`/src/lib/live/${name}.ts`)).toThrow();
  });
  it('rejects the shared host transport and media imports in lab', () => {
    expect(() => assertObservationLabModule('/src/lib/host/rpc.ts')).toThrow();
    expect(() => assertObservationLabModule('/src/lib/camera/LiveCameraRoot.svelte')).toThrow();
  });
  it.each(['/src/lib/fixtures/observations.ts', '/src/tests/heads.ts', '/src/lib/lab/scenarios.ts', '/src/lib/camera/Camera.svelte', '/src/lib/bed-mesh/chart.ts', '/node_modules/three/build/three.js', '/src/lib/live/heads.test.ts'])('rejects nonproduction graph input %s', (id) => {
    expect(() => assertLiveObservationModule(id)).toThrow();
  });
  it('rejects another focused domain from an exact production graph', () => {
    expect(() => assertLiveObservationModule('/src/lib/live/heads-presentation.ts', 'queue')).toThrow('another observation domain');
    expect(() => assertLiveObservationModule('/src/lib/live/queue-controller.ts', 'heads')).toThrow('another observation domain');
    expect(() => assertLiveObservationModule('/src/lib/live/queue-presentation.ts', 'queue')).not.toThrow();
    expect(() => assertLiveObservationModule('/src/lib/live/controller.ts', 'queue')).not.toThrow();
  });
  it('allows shared presentation and leaves in both entries', () => {
    for (const id of ['/src/lib/live/heads-presentation.ts', '/src/lib/ui/InsetCard.svelte', '/src/lib/observation/HeadCards.svelte']) {
      expect(() => assertObservationLabModule(id)).not.toThrow(); expect(() => assertLiveObservationModule(id)).not.toThrow();
    }
  });
});
