import { describe, expect, it, vi } from 'vitest';
import { focusedResult, focusedSnapshot } from '../../../../tests/browser/fixtures/live-focused';
import { unavailableBedMesh } from '../../server/application/bed-mesh-observation';
import { createObservationPresentation } from '../../server/observation-presentation';
import { adaptProgress } from './progress-adapter';
import { adaptJobs } from './jobs-adapter';
import { adaptHistory } from './history-adapter';
import { adaptOverview } from './overview-adapter';
import { createJobsController, createHistoryController, createOverviewController } from './focused-controllers';

describe('fixed live adapters preserve accepted source evidence', () => {
  it('keeps nullable Progress fields independent and accepts a status basename containing punctuation', () => {
    const source = focusedSnapshot();
    source.status = { ...source.status, filename: 'part,rev1.gcode', progressPercent: null, currentLayer: 2_000_000, totalLayers: 3_000_000, elapsedSeconds: 0, remainingSeconds: null };
    const result = adaptProgress(createObservationPresentation(source, 'progress'));
    expect(result.fields.percent.value).toBeNull();
    expect(result.fields.elapsedSeconds.value).toBe(0);
    expect(result.fields.currentLayer.value).toBe(2_000_000);
    expect(result.fields.filename.value).toBe('part,rev1.gcode');
    expect(result.fields.estimatedRemainingSeconds.value).toBeNull();
    const overview = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(overview.tiles[0]).toMatchObject({ valid: true, state: 'known' });
    expect(overview.tiles[0].secondary).toContain('Layer 2000000 / 3000000');
  });
  it('preserves large finite ETA and independently reported layer values in both projections', () => {
    const source = focusedSnapshot();
    source.status = { ...source.status, currentLayer: 3_000_000, totalLayers: 2_000_000, remainingSeconds: 1e30 };
    const progress = adaptProgress(createObservationPresentation(source, 'progress'));
    expect(progress.fields.estimatedRemainingSeconds.value).toBe(1e30);
    expect(progress.fields.currentLayer.value).toBe(3_000_000);
    const overview = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(overview.tiles[0]).toMatchObject({ valid: true, state: 'known', primary: '42%' });
    expect(overview.tiles[0].secondary).toContain('Layer 3000000 / 2000000');
  });
  it('preserves reported null separately from missing and keeps safe token-like basenames', () => {
    const source = focusedSnapshot();
    source.currentJob!.filename.value = 'github_pat_fixture.gcode';
    source.currentJob!.storageActive = { reported: true, value: null };
    source.currentJob!.filePositionBytes = { reported: false, value: null };
    const result = adaptJobs(createObservationPresentation(source, 'jobs'));
    expect(result.filename.value).toBe('github_pat_fixture.gcode');
    expect(result.storageActive).toEqual({ reported: true, value: null });
    expect(result.filePositionBytes).toEqual({ reported: false, value: null });
    expect(result).not.toHaveProperty('progressPercent');
    source.currentJob!.filename.value = 'github_pat_' + 'A'.repeat(32);
    expect(() => adaptJobs(createObservationPresentation(source, 'jobs'))).toThrow();
  });
  it('keeps in-progress History nullable values and every displayed source field', () => {
    const source = focusedSnapshot();
    source.jobHistory!.items[0] = { ...source.jobHistory!.items[0], filename: 'github_pat_fixture.gcode', status: 'in_progress', endTime: null, printDurationSeconds: null, totalDurationSeconds: 0, filamentUsedMillimeters: 25 };
    const result = adaptHistory(createObservationPresentation(source, 'job_history'));
    expect(result.items[0]).toMatchObject({ status: 'in_progress', endTime: null, printDurationSeconds: null, totalDurationSeconds: 0, filamentUsedMillimeters: 25 });
    expect(result.pageCount).toBe(1);
  });
  it('keeps finite tool temperatures and the independent cavity bounds', () => {
    const source = focusedSnapshot();
    source.status.tools[0].temperature = 1e30;
    const result = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(result.tiles[1].valid).toBe(true);
    expect(result.tiles[1].primary).toContain('1e+30');
    const raw = createObservationPresentation(source, 'overview');
    if (raw.module.kind !== 'overview') throw new Error('Wrong fixture');
    raw.module.tiles[1].cavityActualC = 1000;
    expect(adaptOverview(raw).tiles[1].valid).toBe(false);
  });
  it('does not treat active tool identity as a temperature reading', () => {
    const source = focusedSnapshot();
    source.status.tools[0].temperature = null;
    source.status.tools[0].target = null;
    source.status.bed = { temperature: null, target: null };
    const result = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(result.tiles[1]).toMatchObject({ valid: true, state: 'unknown' });
  });
  it('accepts joined194-character material labels and missing Bed Mesh object evidence', () => {
    const source = focusedSnapshot();
    const timestamp = source.receivedAt;
    source.materials = { state: 'known', freshness: 'fresh', sourceObservedAt: timestamp, receivedAt: timestamp, checkedAt: timestamp, reason: null, items: [{ physicalTool: 2, vendor: 'A'.repeat(64), type: 'B'.repeat(64), subtype: 'C'.repeat(64), color: '#FFFFFF', reportedPresence: true }] };
    source.bedMesh = unavailableBedMesh('not_reported', timestamp);
    const result = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(result.tiles[2].valid).toBe(true);
    expect(result.tiles[2].primary).toContain('A'.repeat(64));
    expect(result.tiles[7]).toMatchObject({ valid: true, state: 'unsupported' });
    expect(result.tiles[7].receipts[0].value.reason).toBe('not_reported');
  });
  it('quarantines malformed History while healthy Overview values remain, and rejects failed envelopes', () => {
    const raw = focusedResult('overview').structuredContent;
    if (raw.module.kind !== 'overview') throw new Error('Wrong fixture');
    raw.module.tiles[4].pageCount = 999;
    const result = adaptOverview(raw);
    expect(result.tiles[4]).toMatchObject({ valid: false, state: 'unavailable' });
    expect(result.tiles[0]).toMatchObject({ valid: true, primary: '42%' });
  });
  it('masks retained not-reported materials without discarding independent Overview tiles', () => {
    const source = focusedSnapshot();
    source.materials = { state: 'stale', freshness: 'stale', sourceObservedAt: source.receivedAt, receivedAt: source.receivedAt, checkedAt: source.receivedAt, reason: 'not_reported', items: [{ physicalTool: 2, vendor: 'Fixture', type: 'PLA', subtype: null, color: '#FFFFFF', reportedPresence: true }] };
    const result = adaptOverview(createObservationPresentation(source, 'overview'));
    expect(result.tiles[2]).toMatchObject({ valid: false, primary: 'Data could not be read' });
    expect(result.tiles[0]).toMatchObject({ valid: true, primary: '42%' });
  });
  it.each([['jobs', createJobsController], ['job_history', createHistoryController], ['overview', createOverviewController]] as const)('keeps independently accepted %s when main status is offline', (view, create) => {
    const result = focusedResult(view, { freshness: 'offline', sourceObservedAt: null });
    const port = { start: vi.fn(async () => {}), refresh: vi.fn(async () => result), subscribe: (listener: (value: unknown) => void) => { listener(result); return () => {}; }, dispose: vi.fn() };
    const controller = create(port);
    try { expect(controller.getState().failure).toBeNull(); expect(controller.getState().observation).not.toBeNull(); }
    finally { controller.dispose(); }
  });
});
