import { describe, expect, it } from 'vitest';
import { assertLiveObservationBytes, assertLiveObservationModule, assertObservationLabModule } from '../../../scripts/observation-graph-contract';
describe('compiled observation graph boundaries', () => {
  it('enforces production raw byte boundary including invalid input', () => {
    for (const value of [99_999, 100_000]) expect(() => assertLiveObservationBytes(value)).not.toThrow();
    for (const value of [100_001, 0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) expect(() => assertLiveObservationBytes(value)).toThrow();
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
  it('allows shared presentation and leaves in both entries', () => {
    for (const id of ['/src/lib/live/heads-presentation.ts', '/src/lib/ui/InsetCard.svelte', '/src/lib/observation/HeadCards.svelte']) {
      expect(() => assertObservationLabModule(id)).not.toThrow(); expect(() => assertLiveObservationModule(id)).not.toThrow();
    }
  });
});
