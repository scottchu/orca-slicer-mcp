import { describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { canonicalPresentationSha256, sha256Hex } from '../../composable/hash';
import { derivePresentationPlan } from '../../composable/planner';
import { canonicalizePresentationSpec } from '../../composable/schema';
import { t1EntityCardSpec, t1LeafSpec } from '../../composable/specs';

describe('closed entity-bound presentation schema', () => {
  test('canonicalizes the fixed T1 contract and rejects every tested escape hatch', () => {
    expect(canonicalizePresentationSpec(t1EntityCardSpec)).toEqual(t1EntityCardSpec);
    const wire = JSON.stringify(t1EntityCardSpec);
    expect(wire).not.toMatch(/"type":"(?:Icon|Metric|Badge|Swatch)"/u);
    for (const type of ['HeadStatus', 'HeadTemperature', 'FilamentColor', 'FanRelation']) expect(wire).toContain(`"type":"${type}"`);
    const adversaries: unknown[] = [
      { ...t1EntityCardSpec, html: '<b>unsafe</b>' },
      { ...t1EntityCardSpec, subject: { kind: 'toolHead', id: 'T2' } },
      { ...t1EntityCardSpec, root: { type: 'Html', html: '<b>unsafe</b>' } },
      { ...t1EntityCardSpec, root: { type: 'Title', text: '<script>' } },
      { ...t1EntityCardSpec, root: { type: 'Metric', label: 'Status', value: { field: 'head.status', expression: 'globalThis' } } },
      { ...t1EntityCardSpec, root: { type: 'FanRelation', icon: 'thermometer' } },
      { ...t1EntityCardSpec, root: { type: 'HeadTemperature', label: 'Fan relation' } },
      { ...t1EntityCardSpec, root: { type: 'Metric', label: 'Temperature', value: { field: 'head.fanRelation' } } },
      { ...t1EntityCardSpec, root: { type: 'Card', class: 'escape', children: [{ type: 'Title', text: 'T1' }] } },
      { ...t1EntityCardSpec, root: { type: 'Card', transform: { kind: 'softTint', source: { field: 'head.status' }, strength: 'subtle' }, children: [{ type: 'Title', text: 'T1' }] } },
      { ...t1EntityCardSpec, root: { type: 'Table', children: [] } },
    ];
    for (const input of adversaries) expect(() => canonicalizePresentationSpec(input)).toThrow();
    const tooDeep = { type: 'Card', children: [{ type: 'Table', children: [{ type: 'Row', children: [{ type: 'Card', children: [{ type: 'Table', children: [{ type: 'Row', children: [{ type: 'Title', text: 'too deep' }] }] }] }] }] }] };
    const tooLarge = { type: 'Card', children: Array.from({ length: 24 }, (_, index) => ({ type: 'Table', children: [{ type: 'Title', text: `Node ${index}` }] })) };
    for (const root of [tooDeep, tooLarge]) expect(() => canonicalizePresentationSpec({ schemaVersion: 1, subject: { kind: 'toolHead', id: 'T1' }, root })).toThrow();
  });

  test('deduplicates fields into one sorted dependency per referenced source', () => {
    expect(derivePresentationPlan(t1EntityCardSpec)).toEqual({
      subject: { kind: 'toolHead', id: 'T1' },
      fields: ['filament.color', 'head.fanRelation', 'head.status', 'head.temperature'],
      dependencies: [
        { source: 'environment', fields: ['head.fanRelation'] },
        { source: 'materials', fields: ['filament.color'] },
        { source: 'status', fields: ['head.status', 'head.temperature'] },
      ],
    });
    expect(derivePresentationPlan(t1LeafSpec).dependencies).toEqual([
      { source: 'materials', fields: ['filament.color'] },
      { source: 'status', fields: ['head.temperature'] },
    ]);
  });

  test('matches the standard SHA-256 digest for canonical JSON and Unicode input', () => {
    for (const input of ['', 'abc', JSON.stringify(t1EntityCardSpec), 'T1 filament 色']) {
      expect(sha256Hex(input)).toBe(createHash('sha256').update(input).digest('hex'));
    }
    expect(canonicalPresentationSha256(t1EntityCardSpec)).toBe(createHash('sha256').update(JSON.stringify(t1EntityCardSpec)).digest('hex'));
  });
});
