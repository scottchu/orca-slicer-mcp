import { describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { canonicalPresentationSha256, sha256Hex } from '../../composable/hash';
import { derivePresentationPlan } from '../../composable/planner';
import { canonicalizePresentationSpec } from '../../composable/schema';
import { t1CompactGridSpec, t1EntityCardSpec } from '../../composable/specs';

describe('closed entity-bound presentation schema v2', () => {
  test('accepts only fixed T1 Card, Title, Stack/Grid, domain leaves, and the typed temperature fill', () => {
    expect(canonicalizePresentationSpec(t1EntityCardSpec)).toEqual(t1EntityCardSpec);
    const wire = JSON.stringify(t1EntityCardSpec);
    for (const type of ['Card', 'Title', 'Stack', 'HeadStatus', 'HeadTemperature', 'FilamentColor', 'FanRelation', 'PercentageFill']) expect(wire).toContain(`"type":"${type}"`);
    expect(wire).not.toMatch(/"type":"(?:Table|Row|Icon|Metric|Badge|Swatch|DataTable)"/u);

    const stack = t1EntityCardSpec.root.children[1];
    if (stack.type !== 'Stack') throw new Error('Expected stack fixture');
    const fill = stack.children.find((node) => node.type === 'PercentageFill');
    if (!fill || fill.type !== 'PercentageFill') throw new Error('Expected percentage fixture');
    const adversaries: unknown[] = [
      { ...t1EntityCardSpec, schemaVersion: 1 },
      { ...t1EntityCardSpec, subject: { kind: 'toolHead', id: 'T2' } },
      { ...t1EntityCardSpec, root: { type: 'Table', children: [] } },
      { ...t1EntityCardSpec, root: { type: 'Row', children: [] } },
      { ...t1EntityCardSpec, root: { type: 'DataTable', rows: [] } },
      { ...t1EntityCardSpec, root: { type: 'Title', content: 'subject', size: 'large' } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, class: 'escape' } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, density: 'spacious' } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, transform: { kind: 'softFilamentTint', strength: 20, color: '#ff0000' } } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [{ type: 'Title', text: 'Tool head T2', size: 'large' }, stack] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [{ type: 'Title', content: 'arbitraryClaim', size: 'large' }, stack] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [{ type: 'Title', content: 'subject', size: 'huge' }, stack] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, gap: '12px' }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { type: 'Grid', columns: 3, gap: 'regular', children: stack.children }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ ...fill, child: { type: 'FanRelation' } }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ ...fill, value: 72, max: 100, color: '#ff0000' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadTemperature', label: 'Fan relation', expression: 'globalThis' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadStatus' }, { type: 'HeadStatus' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadTemperature' }, { type: 'PercentageFill', child: { type: 'HeadTemperature' } }] }] } },
    ];
    for (const input of adversaries) expect(() => canonicalizePresentationSpec(input)).toThrow();
  });

  test('deduplicates the wrapped temperature with one sorted dependency per referenced source', () => {
    expect(derivePresentationPlan(t1EntityCardSpec)).toEqual({
      subject: { kind: 'toolHead', id: 'T1' },
      fields: ['filament.color', 'head.fanRelation', 'head.status', 'head.temperature'],
      dependencies: [
        { source: 'environment', fields: ['head.fanRelation'] },
        { source: 'materials', fields: ['filament.color'] },
        { source: 'status', fields: ['head.status', 'head.temperature'] },
      ],
    });
    expect(derivePresentationPlan(t1CompactGridSpec).dependencies).toEqual([
      { source: 'materials', fields: ['filament.color'] },
      { source: 'status', fields: ['head.status'] },
    ]);
  });

  test('matches the standard SHA-256 digest for canonical v2 JSON and Unicode input', () => {
    for (const input of ['', 'abc', JSON.stringify(t1EntityCardSpec), 'T1 filament 色']) {
      expect(sha256Hex(input)).toBe(createHash('sha256').update(input).digest('hex'));
    }
    expect(canonicalPresentationSha256(t1EntityCardSpec)).toBe(createHash('sha256').update(JSON.stringify(t1EntityCardSpec)).digest('hex'));
  });
});
