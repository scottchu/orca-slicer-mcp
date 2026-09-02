import { describe, expect, it } from 'vitest';
import { adaptQueue } from './queue-adapter';
import { liveQueueResult } from '../../../../tests/browser/fixtures/live-queue';
import { normalizeQueueResponse } from '../../server/adapters/moonraker-queue';
import { unavailableQueue } from '../../server/application/queue-observation';
import { createObservationPresentation } from '../../server/observation-presentation';
import { PrinterObservationStore } from '../../server/observation-store';
import type { U1Status } from '../../server/u1-status';

const status = (): U1Status => ({
  schemaVersion: 1, stateVersion: 1, observedAt: '2026-09-01T11:00:00.000Z', reachable: true,
  state: 'standby', stateLabel: 'Ready', progressPercent: null, currentLayer: null, totalLayers: null,
  elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 15, filename: null,
  activePhysicalTool: null, tools: [], bed: { temperature: null, target: null },
  storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null, exception: false,
  camera: { available: false, service: null, targetFps: null }
});
describe('normalized Print Queue adapter', () => {
  it.each([0, 1, 100, 101, 1000])('preserves source count %s and explicit first-page omissions', (count) => {
    const actual = adaptQueue(liveQueueResult(count).structuredContent);
    expect(actual.totalCount).toBe(count); expect(actual.items).toHaveLength(Math.min(count, 100)); expect(actual.truncated).toBe(count > 100);
    expect(actual).not.toHaveProperty('fixture');
  });
  it.each(['ready', 'loading', 'starting', 'paused'] as const)('preserves reported queue %s independently of UI loading', (queueState) => {
    const input = liveQueueResult().structuredContent; input.module.queueState = queueState;
    expect(adaptQueue(input)).toMatchObject({ state: 'known', queueState });
  });
  it('preserves all independent envelope and domain receipts, provenance and status', () => {
    const input = liveQueueResult().structuredContent; input.reachable = false; input.freshness = 'offline'; input.printerState = 'error'; input.printerStateLabel = 'Offline';
    const actual = adaptQueue(input);
    expect(actual).toMatchObject({ version: 12, connectionEpoch: 3, reachable: false, freshness: 'offline', receivedAt: input.receivedAt, sourceObservedAt: input.sourceObservedAt, printerState: 'error', printerStateLabel: 'Offline', refreshAfterSeconds: 15, session: input.session });
    expect(actual.receipt).toEqual({ sourceObservedAt: input.module.sourceObservedAt, receivedAt: input.module.receivedAt, checkedAt: input.module.checkedAt, freshness: 'fresh', reason: null });
    expect(actual.receipt.sourceObservedAt).not.toBe(actual.sourceObservedAt); expect(actual.provenance).toEqual(input.module.provenance);
  });
  it('retains duplicate filenames, partial times, zero and positional order without invented IDs', () => {
    const input = liveQueueResult().structuredContent, actual = adaptQueue(input);
    expect(actual.items).toEqual(input.module.items);
    expect(actual.items.slice(0, 2).map((item) => item.filename)).toEqual(['Repeated fixture.gcode', 'Repeated fixture.gcode']);
    expect(actual.items[0].timeInQueueSeconds).toBe(0); expect(actual.items[1].timeInQueueSeconds).toBeNull();
    const reversed = [...input.module.items].reverse().map((item, index) => ({ ...item, position: index + 1 }));
    input.module.items = reversed; expect(adaptQueue(input).items).toEqual(reversed);
  });
  it.each([0, 0.25, 59.9, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE])('preserves source-accepted observed wait %s', (wait) => {
    const input = liveQueueResult(1).structuredContent; input.module.items[0].timeInQueueSeconds = wait;
    expect(adaptQueue(input).items[0].timeInQueueSeconds).toBe(wait);
  });
  it.each(['1970-01-01T00:00:00.000Z', '2026-09-01T11:00:00.125Z', '+275760-09-13T00:00:00.000Z'])('preserves source date bounds %s', (added) => {
    const input = liveQueueResult(1).structuredContent; input.module.items[0].timeAdded = added;
    expect(adaptQueue(input).items[0].timeAdded).toBe(added);
  });
  it('preserves observed stale empty rather than unknown empty', () => {
    const input = liveQueueResult(0).structuredContent; input.module.state = 'stale'; input.module.freshness = 'stale'; input.module.reason = 'timeout'; input.module.checkedAt = '2026-09-01T12:00:20.000Z';
    expect(adaptQueue(input)).toMatchObject({ state: 'stale', totalCount: 0, items: [], receipt: { freshness: 'stale', reason: 'timeout', sourceObservedAt: '2026-09-01T11:59:58.000Z', checkedAt: '2026-09-01T12:00:20.000Z' } });
  });
  it.each(['not_requested', 'unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured'] as const)('accepts exact unobserved producer state %s', (reason) => {
    const input = liveQueueResult().structuredContent, queue = unavailableQueue(reason, '2026-09-01T12:00:20.000Z');
    const module = { ...input.module, ...queue, capabilityEvidence: reason === 'unsupported' ? 'unsupported' : 'unknown', provenance: { source: 'not_observed', sourceObservedAt: null, detail: input.module.provenance.detail } };
    expect(adaptQueue({ ...input, module })).toMatchObject({ state: queue.state, totalCount: null, queueState: null, items: [], receipt: { reason, freshness: 'unknown', sourceObservedAt: null } });
  });
  it('accepts actual producer/store/projection output without hardware and retains failed domain refresh', async () => {
    let now = new Date('2026-09-01T12:00:00.000Z'), failed = false, reads = 0;
    const store = new PrinterObservationStore(async () => ({ status: status(), metadata: {} }), () => now, undefined, undefined, async () => {
      reads += 1;
      return failed ? unavailableQueue('timeout', now.toISOString()) : normalizeQueueResponse({ result: { queue_state: 'loading', queued_jobs: Array.from({ length: 101 }, (_, index) => ({ filename: `/synthetic-path-${index}/重复 é.gcode`, time_added: index === 0 ? 0 : Number.MAX_VALUE, time_in_queue: index === 0 ? Number.MAX_VALUE : null, job_id: 'excluded-synthetic-id' })) } }, now.toISOString());
    });
    const initial = adaptQueue(createObservationPresentation(await store.current({ includeQueue: true }), 'queue'));
    expect(reads).toBe(1); expect(initial).toMatchObject({ queueState: 'loading', totalCount: 101, truncated: true });
    expect(initial.items[0]).toEqual({ position: 1, filename: '重复 é.gcode', timeAdded: '1970-01-01T00:00:00.000Z', timeInQueueSeconds: Number.MAX_VALUE });
    expect(initial.items[1].timeAdded).toBeNull(); expect(JSON.stringify(initial)).not.toMatch(/synthetic-path|excluded-synthetic-id|job_id/);
    now = new Date(now.valueOf() + 15_000); failed = true;
    const retained = adaptQueue(createObservationPresentation(await store.current({ includeQueue: true, refresh: true }), 'queue'));
    expect(reads).toBe(2); expect(retained.items).toEqual(initial.items); expect(retained.receipt.sourceObservedAt).toBe(initial.receipt.sourceObservedAt);
    expect(retained).toMatchObject({ state: 'stale', receipt: { reason: 'timeout', freshness: 'stale', checkedAt: now.toISOString() } });
  });
  it.each(['', '.', '..', '/private/file.gcode', 'https://invalid.test/model', '<script>', 'a\u202Eb', 'password-secret', 'ghp_abcdefghijklmnopq', 'a'.repeat(161)])('rejects unsafe filename %s', (filename) => {
    const input = liveQueueResult(1).structuredContent; input.module.items[0].filename = filename; expect(() => adaptQueue(input)).toThrow();
  });
  it.each([-1, Infinity, NaN])('rejects invalid wait %s', (wait) => {
    const input = liveQueueResult(1).structuredContent; input.module.items[0].timeInQueueSeconds = wait; expect(() => adaptQueue(input)).toThrow();
  });
  it.each(['1969-12-31T23:59:59.999Z', 'not a date', '2026-09-01', '2026-09-01T12:00:00Z'])('rejects noncanonical/out-of-source time %s', (added) => {
    const input = liveQueueResult(1).structuredContent; input.module.items[0].timeAdded = added; expect(() => adaptQueue(input)).toThrow();
  });
  it('rejects wrong view/module, private fields at every boundary, mismatched counts and provenance', () => {
    const input = liveQueueResult(1).structuredContent;
    for (const value of [ { ...input, view: 'fans' }, { ...input, fixture: true }, { ...input, module: { ...input.module, kind: 'fans' } }, { ...input, module: { ...input.module, raw: 'private' } }, { ...input, module: { ...input.module, items: [{ ...input.module.items[0], job_id: 'private' }] } }, { ...input, module: { ...input.module, totalCount: 2 } }, { ...input, module: { ...input.module, totalCount: 1001 } }, { ...input, module: { ...input.module, truncated: true } }, { ...input, module: { ...input.module, items: [{ ...input.module.items[0], position: 2 }] } }, { ...input, module: { ...input.module, provenance: { ...input.module.provenance, sourceObservedAt: input.receivedAt } } } ]) expect(() => adaptQueue(value)).toThrow();
  });
});
