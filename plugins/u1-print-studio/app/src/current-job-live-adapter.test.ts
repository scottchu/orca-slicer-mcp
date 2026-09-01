import { describe, expect, test } from 'bun:test';
import { normalizeCurrentJobResponse } from './adapters/moonraker-jobs.js';
import { createObservationPresentation } from './observation-presentation.js';
import type { ObservationSnapshot } from './observation-store.js';
import type { U1Status } from './u1-status.js';
import { adaptCurrentJob } from '../ui/src/lib/live/current-job-adapter.js';

const observedAt = '2026-09-01T12:00:00.000Z';
const status: U1Status = {
  schemaVersion: 1, stateVersion: 1, observedAt, reachable: true, state: 'printing', stateLabel: 'Printing',
  progressPercent: null, currentLayer: null, totalLayers: null, elapsedSeconds: null, remainingSeconds: null,
  refreshAfterSeconds: 15, filename: 'main-status-must-not-leak.gcode', activePhysicalTool: null, tools: [],
  bed: { temperature: null, target: null }, storage: { active: null, filePosition: null, fileSize: null },
  printerMessage: null, exception: false, camera: { available: false, service: 'unavailable', targetFps: null },
};
const snapshot = (currentJob: ReturnType<typeof normalizeCurrentJobResponse>): ObservationSnapshot => ({
  schemaVersion: 1, observationVersion: 4, sourceObservedAt: observedAt, receivedAt: '2026-09-01T12:00:01.000Z',
  freshness: 'fresh', connectionEpoch: 2, session: { identity: null, provenance: 'external', detail: 'External print' },
  capabilityEvidence: { progress: 'unknown', thermals: 'unknown', cavity: 'unknown', heads: 'unknown', materials: 'unknown', jobs: 'observed', history: 'unknown', queue: 'unknown', fans: 'unknown', purifier: 'unknown', bedMesh: 'unknown' },
  status, metadata: {}, currentJob,
});
const raw = (state: string, filename: unknown = 'folder/model.gcode') => ({ result: { status: {
  print_stats: { state, filename, total_duration: 12.5, print_duration: 0, filament_used: 0 },
  virtual_sdcard: { is_active: false, file_position: 0, file_size: Number.MAX_SAFE_INTEGER },
} } });

describe('Current Job live adapter against the actual normalizer and projection', () => {
  for (const state of ['standby', 'printing', 'paused', 'complete', 'error', 'cancelled', 'future_state'] as const) {
    test(`accepts actual normalized producer state ${state}`, () => {
      const normalized = normalizeCurrentJobResponse(raw(state), observedAt);
      const projected = createObservationPresentation(snapshot(normalized), 'jobs');
      const adapted = adaptCurrentJob(projected);
      const expected = state === 'future_state' ? 'unknown' as const : state;
      expect(adapted.printState).toEqual({ reported: true, value: expected });
      expect(adapted.filename).toEqual({ reported: true, value: 'model.gcode' });
      expect(adapted.storageActive).toEqual({ reported: true, value: false });
      expect(adapted.filePositionBytes).toEqual({ reported: true, value: 0 });
      expect(adapted.fileSizeBytes).toEqual({ reported: true, value: Number.MAX_SAFE_INTEGER });
      expect(adapted.totalDurationSeconds).toEqual({ reported: true, value: 12.5 });
      expect(adapted).not.toHaveProperty('progressPercent');
      expect(JSON.stringify(adapted)).not.toContain('main-status-must-not-leak');
    });
  }

  test('preserves actual reported-null filename separately from unreported fields', () => {
    const empty = adaptCurrentJob(createObservationPresentation(snapshot(normalizeCurrentJobResponse(raw('standby', ''), observedAt)), 'jobs'));
    expect(empty.filename).toEqual({ reported: true, value: null });
    const partial = normalizeCurrentJobResponse({ result: { status: { print_stats: {}, virtual_sdcard: {} } } }, observedAt);
    const adapted = adaptCurrentJob(createObservationPresentation(snapshot(partial), 'jobs'));
    expect(adapted.filename).toEqual({ reported: false, value: null });
    expect(adapted.storageActive).toEqual({ reported: false, value: null });
    expect(adapted.printDurationSeconds).toEqual({ reported: false, value: null });
  });

  test('accepts the actual producer Unicode code-point truncation boundary', () => {
    const source = '\u{10400}'.repeat(161);
    const normalized = normalizeCurrentJobResponse(raw('standby', source), observedAt);
    const adapted = adaptCurrentJob(createObservationPresentation(snapshot(normalized), 'jobs'));
    expect(Array.from(adapted.filename.value ?? '')).toHaveLength(160);
    expect(adapted.filename.reported).toBe(true);
  });
});
