import type { BedMeshObservation } from '../../../src/lib/server/application/bed-mesh-observation';
import { liveFansResult } from './live-fans';
export const liveBedMeshResult = (version = 12, receivedAt = '2026-09-01T12:00:12.000Z', override: Partial<BedMeshObservation> = {}) => {
  const mesh: BedMeshObservation = {
    state: 'known', freshness: 'fresh', status: 'active', sourceObservedAt: '2026-09-01T11:59:58.000Z', receivedAt: '2026-09-01T11:59:58.000Z', checkedAt: '2026-09-01T11:59:58.000Z',
    matrix: [[-0.2, 0], [0.1, 0.3]], bounds: { xMin: 10, xMax: 300, yMin: 20, yMax: 290 },
    summary: { rows: 2, columns: 2, min: -0.2, max: 0.3, range: 0.5 }, reason: null, ...override,
  };
  return { structuredContent: { ...liveFansResult(version, receivedAt).structuredContent, view: 'bed_mesh', module: {
    ...mesh, kind: 'bed_mesh', capabilityEvidence: mesh.sourceObservedAt !== null ? 'observed' : mesh.state === 'unsupported' ? 'unsupported' : 'unknown',
    provenance: { source: mesh.sourceObservedAt !== null ? 'moonraker' : 'not_observed', sourceObservedAt: mesh.sourceObservedAt, detail: 'Server receipt of reported probe grid, not calibration time' },
  } } };
};
