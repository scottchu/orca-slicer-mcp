import { describe, expect, it } from 'vitest';
import { adaptThermals } from './thermals-adapter';
import { liveThermalsResult } from '../../../tests/fixtures/live-thermals';
describe('real normalized Thermals adapter', () => {
  it('preserves stable IDs, overshoot, null active, no cavity target and independent receipts', () => {
    const actual = adaptThermals(liveThermalsResult().structuredContent);
    expect(actual.readings.map((row) => row.id)).toEqual(['tool-1', 'tool-2', 'tool-3', 'tool-4', 'heater-bed', 'cavity']);
    expect(actual.readings[0]).toMatchObject({ actualC: 220, targetC: 200, active: true, heaterState: { value: 'ACTIVE' } });
    expect(actual.readings[4].active).toBeNull();
    expect(actual.readings[5]).not.toHaveProperty('target');
    expect(actual.environment.sourceObservedAt).not.toBe(actual.sourceObservedAt);
    expect(actual.environment).toMatchObject({ receivedAt: '2026-09-01T11:59:59.000Z', checkedAt: '2026-09-01T12:00:01.000Z' });
    expect(actual).not.toHaveProperty('fixture');
  });
  it('keeps actual-only, target-only, zero/off and active unknown independent', () => {
    const value = liveThermalsResult().structuredContent;
    value.module.readings[0].actual = { state: 'unknown', value: null };
    value.module.readings[1].target = { state: 'unknown', value: null };
    value.module.readings[2].active = { state: 'unknown', value: null };
    const rows = adaptThermals(value).readings;
    expect(rows[0]).toMatchObject({ actualC: null, targetC: 200 });
    expect(rows[1]).toMatchObject({ actualC: 33, targetC: null });
    expect(rows[2]).toMatchObject({ targetC: 0, active: null });
  });
  it.each([-Number.MAX_VALUE, -1e12, 0, 400, 999, Number.MAX_VALUE])('preserves source-accepted finite status temperature %s', (value) => {
    const input = liveThermalsResult().structuredContent;
    input.module.readings[0].actual.value = value; input.module.readings[4].target!.value = value;
    const rows = adaptThermals(input).readings;
    expect(rows[0].actualC).toBe(value); expect(rows[4].targetC).toBe(value);
  });
  it.each([-273.15, 0, 999])('preserves cavity bound %s', (value) => {
    const input = liveThermalsResult().structuredContent; input.module.readings[5].actual.value = value;
    expect(adaptThermals(input).readings[5].actualC).toBe(value);
  });
  it.each(['unknown', 'unsupported', 'unavailable', 'stale'])('preserves independent %s cavity evidence', (state) => {
    const input = liveThermalsResult().structuredContent;
    input.module.environment.state = state; input.module.environment.reason = 'timeout'; input.module.environment.freshness = 'stale';
    expect(adaptThermals(input)).toMatchObject({ freshness: 'fresh', environment: { state, reason: 'timeout', freshness: 'stale' } });
  });
  it('preserves fresh cavity despite offline status and retained unknown status values', () => {
    const input = liveThermalsResult().structuredContent; input.freshness = 'offline'; input.reachable = false;
    input.module.readings[0].actual.state = 'unknown'; input.module.readings[0].state = 'unknown';
    expect(adaptThermals(input)).toMatchObject({ freshness: 'offline', environment: { freshness: 'fresh' }, readings: [expect.objectContaining({ actualC: 220, actual: { state: 'unknown', value: 220 } }), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.objectContaining({ actualC: 33 })] });
  });
  it.each([NaN, Infinity, -Infinity])('rejects nonfinite status %s', (value) => {
    const input = liveThermalsResult().structuredContent; input.module.readings[0].actual.value = value;
    expect(() => adaptThermals(input)).toThrow();
  });
  it.each([-273.16, 999.01])('rejects out-of-source-bound cavity %s', (value) => {
    const input = liveThermalsResult().structuredContent; input.module.readings[5].actual.value = value;
    expect(() => adaptThermals(input)).toThrow();
  });
  it('rejects wrong view, duplicate IDs, lab fixtures, cavity target and fabricated fields', () => {
    const input = liveThermalsResult().structuredContent;
    expect(() => adaptThermals({ ...input, view: 'fans' })).toThrow();
    expect(() => adaptThermals({ ...input, fixture: true })).toThrow();
    input.module.readings[4].id = 'bed'; expect(() => adaptThermals(input)).toThrow();
    const other = liveThermalsResult().structuredContent; other.module.readings[5].target = { state: 'known', value: 55 };
    expect(() => adaptThermals(other)).toThrow();
  });
});
