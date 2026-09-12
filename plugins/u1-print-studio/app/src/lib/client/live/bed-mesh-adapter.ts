import { validateBedMeshObservation } from '../bed-mesh/types';
import type { BedMeshPresentation } from './bed-mesh-presentation';
import { record, exact, choice, number, time, capability, evidence, reason, provenance, observationEnvelope, string } from './validation';

/** Validates the public operations projection, never raw firmware or fixtures. */
export const adaptBedMesh = (value: unknown): BedMeshPresentation => {
  const { envelope, ...base } = observationEnvelope(value, 'bed_mesh');
  const module = record(envelope.module);
  exact(module, ['kind', 'state', 'freshness', 'status', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'matrix', 'bounds', 'summary', 'reason', 'capabilityEvidence', 'provenance', ...(Object.hasOwn(module, 'profile') ? ['profile'] : [])]);
  if (module.kind !== 'bed_mesh') throw new Error('Wrong module');
  const state = evidence(module.state), moduleCapability = capability(module.capabilityEvidence), moduleProvenance = provenance(module.provenance);
  const receipt: BedMeshPresentation['receipt'] = {
    sourceObservedAt: time(module.sourceObservedAt), receivedAt: time(module.receivedAt), checkedAt: time(module.checkedAt),
    freshness: choice(module.freshness, ['fresh', 'stale', 'unknown']), reason: module.reason === 'not_reported' ? 'not_reported' : reason(module.reason),
  };
  const status = module.status === null ? null : choice(module.status, ['active', 'no_active_mesh'] as const);
  const observed = state === 'known' || state === 'stale';
  if (observed) {
    if (status === null || receipt.sourceObservedAt === null || receipt.receivedAt === null || receipt.checkedAt === null ||
        receipt.freshness !== (state === 'known' ? 'fresh' : 'stale') || moduleCapability !== 'observed' || moduleProvenance.source !== 'moonraker') throw new Error('Invalid observed bed mesh');
  } else if (status !== null || receipt.sourceObservedAt !== null || receipt.receivedAt !== null || receipt.freshness !== 'unknown' ||
      moduleCapability !== (state === 'unsupported' ? 'unsupported' : 'unknown') || moduleProvenance.source !== 'not_observed') throw new Error('Invalid unobserved bed mesh');
  if (moduleProvenance.sourceObservedAt !== receipt.sourceObservedAt) throw new Error('Invalid mesh provenance');
  let mesh: BedMeshPresentation['mesh'] = null;
  if (status === 'active') {
    const bounds = record(module.bounds), summary = record(module.summary);
    exact(bounds, ['xMin', 'xMax', 'yMin', 'yMax']); exact(summary, ['rows', 'columns', 'min', 'max', 'range']);
    for (const value of Object.values(bounds)) number(value, 1_000_000, -1_000_000);
    if (!Array.isArray(module.matrix) || module.matrix.length < 2 || module.matrix.length > 64) throw new Error('Invalid mesh rows');
    const matrix = module.matrix.map(row => {
      if (!Array.isArray(row) || row.length < 2 || row.length > 64) throw new Error('Invalid mesh columns');
      return row.map(cell => number(cell, 1_000_000, -1_000_000));
    });
    mesh = validateBedMeshObservation({ schema: 'u1.bed-mesh.presentation.v1', sourceObservedAt: receipt.sourceObservedAt,
      freshness: receipt.freshness, profile: module.profile ?? null, matrix, bounds: { ...bounds },
      summary: { rows: summary.rows, columns: summary.columns, minimum: summary.min, maximum: summary.max, range: summary.range } });
  } else if (module.matrix !== null || module.bounds !== null || module.summary !== null || Object.hasOwn(module, 'profile')) throw new Error('Unexpected inactive mesh data');
  const session = record(envelope.session);
  return { ...base, kind: 'bed_mesh', printerState: string(envelope.printerState), printerStateLabel: string(envelope.printerStateLabel), refreshAfterSeconds: number(envelope.refreshAfterSeconds, 3600),
    session: { identity: null, provenance: choice(session.provenance, ['external', 'unknown']), detail: string(session.detail) },
    state, capability: moduleCapability, provenance: moduleProvenance, receipt, status, mesh };
};
