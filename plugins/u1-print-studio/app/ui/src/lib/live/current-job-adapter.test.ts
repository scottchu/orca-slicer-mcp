import { describe, expect, it } from 'vitest';
import { adaptCurrentJob } from './current-job-adapter.js';
import { CURRENT_JOB_STATES } from './presentation.js';
import { resultObservation } from './observation-port.js';
import { currentJobField, liveCurrentJobResult } from '../../../tests/fixtures/live-current-job.js';

describe('real normalized Current Job adapter', () => {
  it('preserves envelope ordering, independent receipt and every reported metric without progress', () => {
    const result = adaptCurrentJob(resultObservation(liveCurrentJobResult()));
    expect(result).toMatchObject({
      kind: 'jobs', version: 12, connectionEpoch: 3, reachable: true,
      state: 'known', freshness: 'fresh', capability: 'observed',
      sourceObservedAt: '2026-09-01T12:00:00.000Z', receivedAt: '2026-09-01T12:00:12.000Z',
      provenance: { source: 'moonraker', sourceObservedAt: '2026-09-01T11:59:58.000Z', detail: 'Fixed Current Job projection' },
      receipt: {
        sourceObservedAt: '2026-09-01T11:59:58.000Z', receivedAt: '2026-09-01T11:59:59.000Z',
        checkedAt: '2026-09-01T12:00:01.000Z', freshness: 'fresh', reason: null,
      },
      filePositionBytes: { reported: true, value: 0 }, fileSizeBytes: { reported: true, value: Number.MAX_SAFE_INTEGER },
      printDurationSeconds: { reported: true, value: 0 }, totalDurationSeconds: { reported: true, value: 12.5 },
      filamentUsedMillimeters: { reported: true, value: 0 },
    });
    expect(result).not.toHaveProperty('progressPercent');
    expect(result).not.toHaveProperty('fixture');
  });

  it.each(CURRENT_JOB_STATES)('preserves normalized state %s', (state) => {
    const input = liveCurrentJobResult().structuredContent;
    input.module.printState = currentJobField(true, state);
    expect(adaptCurrentJob(input).printState).toEqual({ reported: true, value: state });
  });

  it('distinguishes reported-null filename, unreported filename, storage false and unknown storage', () => {
    const reportedNull = liveCurrentJobResult().structuredContent;
    reportedNull.module.filename = currentJobField<string>(true, null);
    reportedNull.module.storageActive = currentJobField(true, false);
    expect(adaptCurrentJob(reportedNull)).toMatchObject({ filename: { reported: true, value: null }, storageActive: { reported: true, value: false } });
    const unreported = liveCurrentJobResult().structuredContent;
    unreported.module.filename = currentJobField<string>(false, null);
    unreported.module.storageActive = currentJobField<boolean>(false, null);
    expect(adaptCurrentJob(unreported)).toMatchObject({ filename: { reported: false, value: null }, storageActive: { reported: false, value: null } });
  });

  it('preserves independently unreported partial metrics and stale retained data', () => {
    const input = liveCurrentJobResult().structuredContent;
    input.module.state = 'stale'; input.module.freshness = 'stale'; input.module.reason = 'timeout';
    input.module.filePositionBytes = currentJobField<number>(false, null);
    input.module.filamentUsedMillimeters = currentJobField<number>(false, null);
    expect(adaptCurrentJob(input)).toMatchObject({
      state: 'stale', receipt: { freshness: 'stale', reason: 'timeout' },
      filePositionBytes: { reported: false, value: null }, filamentUsedMillimeters: { reported: false, value: null },
      filename: { reported: true, value: 'model.gcode' },
    });
  });

  it.each([NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1, 1.25])('rejects invalid byte counts %s', (value) => {
    const input = liveCurrentJobResult().structuredContent;
    input.module.filePositionBytes = currentJobField(true, value);
    expect(() => adaptCurrentJob(input)).toThrow();
  });

  it.each([NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1])('rejects invalid duration/filament values %s', (value) => {
    const input = liveCurrentJobResult().structuredContent;
    input.module.printDurationSeconds = currentJobField(true, value);
    expect(() => adaptCurrentJob(input)).toThrow();
  });

  it.each(['../private.gcode', 'https:secret', 'access token abcdefghijklmnop', 'sk-proj-abcdefgh', '<model>.gcode', 'A'.repeat(161)])('rejects unsafe or noncanonical filenames %s', (filename) => {
    const input = liveCurrentJobResult().structuredContent;
    input.module.filename = currentJobField(true, filename);
    expect(() => adaptCurrentJob(input)).toThrow();
  });

  it('uses the producer Unicode code-point bound rather than rejecting valid supplementary letters', () => {
    const input = liveCurrentJobResult().structuredContent;
    const filename = '\u{10400}'.repeat(160);
    input.module.filename = currentJobField(true, filename);
    expect(adaptCurrentJob(input).filename).toEqual({ reported: true, value: filename });
  });

  it('rejects lab/wrong-view/private fields and contradictory reported values', () => {
    const input = liveCurrentJobResult().structuredContent;
    expect(() => adaptCurrentJob({ ...input, view: 'job_history' })).toThrow();
    expect(() => adaptCurrentJob({ ...input, fixture: true })).toThrow();
    const privateField = liveCurrentJobResult().structuredContent;
    Object.assign(privateField.module, { rawPath: '/private/model.gcode' });
    expect(() => adaptCurrentJob(privateField)).toThrow();
    const contradictory = liveCurrentJobResult().structuredContent;
    contradictory.module.filename = currentJobField(false, 'model.gcode');
    expect(() => adaptCurrentJob(contradictory)).toThrow();
  });
});
