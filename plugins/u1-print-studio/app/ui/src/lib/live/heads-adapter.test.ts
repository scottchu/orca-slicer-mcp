import { describe, expect, it } from 'vitest';
import { adaptHeads } from './heads-adapter';
import { headCardValue, headColor, headStateLabel } from './heads-presentation';
import { liveHeadsResult } from '../../../tests/fixtures/live-heads';

describe('lossless real Heads projection', () => {
  it('preserves four physical slots, field states, provenance and independent receipts', () => {
    const result = adaptHeads(liveHeadsResult().structuredContent);
    expect(result.items.map((item) => item.physicalTool)).toEqual([1, 2, 3, 4]);
    expect(result.materials.sourceObservedAt).not.toBe(result.sourceObservedAt);
    expect(result.items[0]).toMatchObject({ active: { state: 'known', value: true }, headState: { state: 'known', value: 'heating' }, target: { state: 'known', value: 220 } });
    expect(result.items[0].materialProvenance.sourceObservedAt).toBe(result.materials.sourceObservedAt);
    expect(result).not.toHaveProperty('fixture');
  });
  it.each([false, null, true])('keeps stale configured material with presence %s but gates color independently', (presence) => {
    const dto = liveHeadsResult().structuredContent, row = dto.module.items[0];
    dto.module.materials.state = 'stale'; dto.module.materials.freshness = 'stale'; dto.module.materials.reason = 'timeout';
    row.reportedPresence = { state: presence === null ? 'unknown' : 'stale', value: presence };
    row.vendor.state = 'stale'; row.materialType.state = 'stale'; row.color.state = 'stale';
    const result = adaptHeads(dto), card = headCardValue(result.items[0]);
    expect(card.material).toBe('Generic PLA'); expect(card.presence).toBe(presence);
    expect(headColor(card.presence, card.color)).toEqual({ label: presence === false ? 'Empty' : presence === true ? '#FFFFFFFF' : 'N/A', color: presence === true ? '#FFFFFFFF' : null, neutral: presence !== true });
    expect(result.materials).toMatchObject({ state: 'stale', freshness: 'stale', reason: 'timeout' });
    expect(result.freshness).toBe('fresh');
  });
  it.each(['ACTIVE', 'PARKED', 'HEATING', 'COOLING', 'STANDBY', 'IDLE', 'UNKNOWN'])('preserves independent state %s', (state) => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].headState.value = state;
    dto.module.items[0].active.value = false;
    const card = headCardValue(adaptHeads(dto).items[0]);
    expect(card.state).toBe(state.toLowerCase());
    expect(headStateLabel(card.active, card.state)).toBe(state[0] + state.slice(1).toLowerCase());
    expect(headStateLabel(true, 'heating')).toBe('Active · Heating');
    expect(headStateLabel(false, null)).toBe('Unknown');
  });
  it.each([0, -999, 9999, Number.MAX_VALUE, -Number.MAX_VALUE, Number.MIN_VALUE])('accepts the existing finite thermal boundary %s', (temperature) => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].temperature.value = temperature;
    expect(adaptHeads(dto).items[0].temperature.value).toBe(temperature);
  });
  it('preserves independently unknown temperature and real zero target', () => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].temperature = { state: 'unknown', value: null }; dto.module.items[0].target.value = 0;
    expect(headCardValue(adaptHeads(dto).items[0])).toMatchObject({ actual: null, target: 0 });
  });
  it('retains all three 64-character labels and partial known metadata', () => {
    const dto = liveHeadsResult().structuredContent, row = dto.module.items[0];
    row.vendor.value = 'V'.repeat(64); row.materialType.value = 'T'.repeat(64); row.subtype = { state: 'known', value: 'S'.repeat(64) };
    row.material.value = `${row.vendor.value} ${row.materialType.value} ${row.subtype.value}`;
    expect(headCardValue(adaptHeads(dto).items[0]).material).toHaveLength(194);
    row.materialType = { state: 'unknown', value: null }; row.material = { state: 'unknown', value: null };
    expect(headCardValue(adaptHeads(dto).items[0]).material).toBe(`${row.vendor.value} ${row.subtype.value}`);
  });
  it.each(['#6f4c2f80', '#FFFFFF00', '#000000', '#FFFFFFFF'])('normalizes and keeps color alpha %s', (color) => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].color.value = color;
    expect(headCardValue(adaptHeads(dto).items[0]).color).toBe(color.toUpperCase());
  });
  it.each(['#FFF', 'url(example)', '#FFFFFF;', ' red'])('rejects invalid color %s', (color) => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].color.value = color;
    expect(() => adaptHeads(dto)).toThrow();
  });
  it('rejects wrong view, extra/private fields, duplicate identities and contradictory field evidence', () => {
    const dto = liveHeadsResult().structuredContent;
    expect(() => adaptHeads({ ...dto, view: 'thermals' })).toThrow();
    expect(() => adaptHeads({ ...dto, fixture: true })).toThrow();
    dto.module.items[1].physicalTool = 1; expect(() => adaptHeads(dto)).toThrow();
    const next = liveHeadsResult().structuredContent; next.module.items[0].active.state = 'unknown'; expect(() => adaptHeads(next)).toThrow();
  });
  it.each(['sk-key', 'Bearer value', 'password', '../PLA', '<b>PLA</b>', 'A'.repeat(65)])('rejects noncanonical/private material %s', (value) => {
    const dto = liveHeadsResult().structuredContent; dto.module.items[0].vendor.value = value;
    expect(() => adaptHeads(dto)).toThrow();
  });
});
