import { describe, expect, it } from 'vitest';
import { adaptFans } from './fans-adapter';
import { resultObservation } from './observation-port';
import { liveFansResult } from '../../../../tests/browser/fixtures/live-fans';

describe('real normalized Fans adapter', () => {
  it('preserves seven channels, real RPM bound, zero and separate receipts', () => {
    const input = liveFansResult(), result = adaptFans(resultObservation(input));
    expect(result.items).toHaveLength(7);
    expect(result.items[0]).toMatchObject({ percent: 100, rpm: 1_000_000 });
    expect(result.items[1]).toMatchObject({ percent: 0, rpm: 0 });
    expect(result.sourceObservedAt).not.toBe(result.receipt.sourceObservedAt);
    expect(result.receipt).toMatchObject({ sourceObservedAt: '2026-09-01T11:59:58.000Z', receivedAt: '2026-09-01T11:59:59.000Z', checkedAt: '2026-09-01T12:00:01.000Z' });
    expect(result.purifier).toMatchObject({ powerDetected: true, mode: 'preheat_chamber' });
    expect(result).not.toHaveProperty('fixture'); expect(result).not.toHaveProperty('_meta');
  });
  it('keeps reported null RPM independent of speed and unreported RPM', () => {
    const input = liveFansResult().structuredContent;
    input.module.items[0].rpm = null;
    input.module.items[1].rpmReported = false; input.module.items[1].rpm = null;
    expect(adaptFans(input).items[0]).toMatchObject({ percent: 100, rpm: null, rpmReported: true });
    expect(adaptFans(input).items[1]).toMatchObject({ percent: 0, rpm: null, rpmReported: false });
  });
  it.each(['unknown', 'unsupported', 'unavailable', 'stale'])('preserves %s and reason without inventing readings', (state) => {
    const input = liveFansResult().structuredContent;
    input.module.state = state; input.module.reason = 'timeout'; input.module.freshness = 'stale';
    expect(adaptFans(input)).toMatchObject({ state, receipt: { reason: 'timeout', freshness: 'stale' } });
  });
  it.each([NaN, Infinity, -1, 1_000_001])('rejects malformed RPM %s', (rpm) => {
    const input = liveFansResult().structuredContent; input.module.items[0].rpm = rpm;
    expect(() => adaptFans(input)).toThrow();
  });
  it('rejects wrong view, duplicate/missing IDs, false report with value and lab envelope', () => {
    const input = liveFansResult().structuredContent;
    expect(() => adaptFans({ ...input, view: 'thermals' })).toThrow();
    expect(() => adaptFans({ ...input, fixture: true })).toThrow();
    input.module.items[1].id = input.module.items[0].id;
    expect(() => adaptFans(input)).toThrow();
    const next = liveFansResult().structuredContent; next.module.items[0].rpmReported = false;
    expect(() => adaptFans(next)).toThrow();
  });
  it('preserves unknown purifier power/mode and rejects private result errors', () => {
    const input = liveFansResult(); input.structuredContent.module.purifier = { state: 'not_reported', mode: null, powerDetected: null, capabilityEvidence: 'unknown' };
    expect(adaptFans(resultObservation(input)).purifier).toMatchObject({ state: 'not_reported', powerDetected: null, mode: null });
    expect(() => resultObservation({ ...input, isError: true })).toThrow();
  });
});
