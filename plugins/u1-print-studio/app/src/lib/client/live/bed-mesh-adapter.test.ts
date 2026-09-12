import { describe, expect, it } from 'vitest';
import { adaptBedMesh } from './bed-mesh-adapter';
import { liveBedMeshResult } from '../../../../tests/browser/fixtures/live-bed-mesh';
import { normalizeBedMeshResponse } from '../../server/adapters/moonraker-bed-mesh';
import { unavailableBedMesh } from '../../server/application/bed-mesh-observation';

describe('real Bed Mesh public projection adapter', () => {
  it('preserves probe order, XY bounds, exact values and independent receipt without a fixture marker', () => {
    const input = liveBedMeshResult().structuredContent, actual = adaptBedMesh(input);
    expect(actual.mesh).toMatchObject({ matrix: input.module.matrix, bounds: input.module.bounds, summary: { minimum: -0.2, maximum: 0.3, range: 0.5, rows: 2, columns: 2 } });
    expect(actual.mesh).not.toHaveProperty('fixture');
    expect(actual.receipt.sourceObservedAt).toBe(input.module.sourceObservedAt);
    expect(actual.receipt.sourceObservedAt).not.toBe(actual.sourceObservedAt);
    expect(actual.provenance).toEqual(input.module.provenance);
  });
  it.each([0, 1_000_000, -1_000_000])('accepts producer-bound flat grid %s without confusing it with no active mesh', value => {
    const mesh = normalizeBedMeshResponse({ result: { status: { bed_mesh: { profile_name: 'Reported profile', mesh_min: [-1_000_000, -1_000_000], mesh_max: [1_000_000, 1_000_000], probed_matrix: Array.from({ length: 64 }, () => Array(64).fill(value)) } } } }, '2026-09-01T11:59:58.000Z');
    const actual = adaptBedMesh(liveBedMeshResult(12, undefined, mesh).structuredContent);
    expect(actual).toMatchObject({ status: 'active', mesh: { profile: 'Reported profile', summary: { minimum: value, maximum: value, range: 0, rows: 64, columns: 64 } } });
  });
  it('preserves the exact producer no-active sentinel as an observed state without any generated surface', () => {
    const mesh = normalizeBedMeshResponse({ result: { status: { bed_mesh: { profile_name: '', mesh_min: [0, 0], mesh_max: [0, 0], probed_matrix: [[]] } } } }, '2026-09-01T11:59:58.000Z');
    expect(adaptBedMesh(liveBedMeshResult(12, undefined, mesh).structuredContent)).toMatchObject({ state: 'known', status: 'no_active_mesh', mesh: null, receipt: { freshness: 'fresh' } });
  });
  it('accepts the producer maximum height span and eighty Unicode profile code points', () => {
    const profile = '𐐀'.repeat(80);
    const mesh = normalizeBedMeshResponse({ result: { status: { bed_mesh: { profile_name: profile,
      mesh_min: [-1_000_000, -1_000_000], mesh_max: [1_000_000, 1_000_000],
      probed_matrix: [[-1_000_000, 1_000_000], [0, 0]],
    } } } }, '2026-09-01T11:59:58.000Z');
    expect(profile.length).toBe(160);
    expect(adaptBedMesh(liveBedMeshResult(12, undefined, mesh).structuredContent).mesh).toMatchObject({
      profile, summary: { minimum: -1_000_000, maximum: 1_000_000, range: 2_000_000 },
    });
  });
  it.each(['. ', ' .. ', ' ', '../../private'])('omits unsafe optional producer profile %j without suppressing the valid mesh', profile => {
    const mesh = normalizeBedMeshResponse({ result: { status: { bed_mesh: { profile_name: profile,
      mesh_min: [0, 0], mesh_max: [100, 100], probed_matrix: [[0, 0.1], [0.2, 0.3]],
    } } } }, '2026-09-01T11:59:58.000Z');
    expect(mesh.status).toBe('active');
    expect(mesh).not.toHaveProperty('profile');
    expect(adaptBedMesh(liveBedMeshResult(12, undefined, mesh).structuredContent).mesh).toMatchObject({
      profile: null, matrix: [[0, 0.1], [0.2, 0.3]], summary: { minimum: 0, maximum: 0.3, range: 0.3 },
    });
  });
  it.each(['not_requested', 'not_reported', 'unsupported', 'timeout', 'malformed'] as const)('preserves unobserved producer %s', reason => {
    const source = unavailableBedMesh(reason, '2026-09-01T12:00:20.000Z');
    expect(adaptBedMesh(liveBedMeshResult(12, undefined, source).structuredContent)).toMatchObject({ state: source.state, status: null, mesh: null, receipt: { reason, sourceObservedAt: null, checkedAt: source.checkedAt } });
  });
  it('retains a failed stale grid receipt independently from fresh main status', () => {
    const actual = adaptBedMesh(liveBedMeshResult(12, undefined, { state: 'stale', freshness: 'stale', reason: 'timeout', checkedAt: '2026-09-01T12:00:20.000Z' }).structuredContent);
    expect(actual).toMatchObject({ freshness: 'fresh', state: 'stale', receipt: { freshness: 'stale', reason: 'timeout', sourceObservedAt: '2026-09-01T11:59:58.000Z' } });
  });
  it('rejects private fields, fixture claims, invalid grids, incompatible provenance and fabricated summary', () => {
    const base = liveBedMeshResult().structuredContent, module = base.module;
    for (const patch of [
      { fixture: true }, { raw: 'private' }, { kind: 'fans' }, { status: 'no_active_mesh' }, { matrix: [[0]] }, { matrix: [[0, 0], [0]] },
      { matrix: [[0, NaN], [0, 0]] }, { matrix: [[0, 1_000_001], [0, 0]] }, { bounds: { ...module.bounds, xMax: 10 } },
      { summary: { ...module.summary, min: -20 } }, { provenance: { ...module.provenance, sourceObservedAt: base.receivedAt } },
      { profile: '../../private' }, { state: 'unknown' }, { sourceObservedAt: null },
    ]) expect(() => adaptBedMesh({ ...base, module: { ...module, ...patch } })).toThrow();
  });
});
