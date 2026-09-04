import { describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { canonicalPresentationSha256, sha256Hex } from '../../composable/hash';
import { derivePresentationPlan } from '../../composable/planner';
import { canonicalizePresentationSpec } from '../../composable/schema';
import {
  elementRegistry,
  PRESENTATION_ELEMENT_TYPES,
  registeredChildrenSchema,
  registeredElementTypes,
  sourceForPresentationField,
} from '../../composable/element-registry';
import { t1BalancedCompositionSpec, t1CompactGridSpec, t1EntityCardSpec, t1LargerCompositionSpec } from '../../composable/specs';

describe('closed entity-bound presentation schema v2', () => {
  test('accepts only the nine build-time registered common and domain elements', () => {
    expect(canonicalizePresentationSpec(t1EntityCardSpec)).toEqual(t1EntityCardSpec);
    expect(canonicalizePresentationSpec(t1BalancedCompositionSpec)).toEqual(t1BalancedCompositionSpec);
    expect(registeredElementTypes()).toEqual(PRESENTATION_ELEMENT_TYPES);
    expect(Object.keys(elementRegistry)).toEqual(PRESENTATION_ELEMENT_TYPES);
    const wire = JSON.stringify([t1EntityCardSpec, t1BalancedCompositionSpec]);
    for (const type of PRESENTATION_ELEMENT_TYPES) expect(wire).toContain(`"type":"${type}"`);
    expect(wire).not.toMatch(/"type":"(?:PercentageFill|Table|Row|Icon|Metric|Badge|Swatch|DataTable)"/u);

    const stack = t1EntityCardSpec.root.children[1];
    if (stack.type !== 'Stack') throw new Error('Expected stack fixture');
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
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'PercentageFill', child: { type: 'HeadTemperature' } }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadTemperature', value: 72, max: 100, color: '#ff0000' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadTemperature', label: 'Fan relation', expression: 'globalThis' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadStatus' }, { type: 'HeadStatus' }] }] } },
      { ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'HeadTemperature' }, { type: 'HeadTemperature' }] }] } },
    ];
    for (const input of adversaries) expect(() => canonicalizePresentationSpec(input)).toThrow();
  });

  test('accepts only the correlated balanced header, lead, and appearance grammar', () => {
    const balanced = structuredClone(t1BalancedCompositionSpec) as any;
    const inline = balanced.root.children[0];
    const grid = balanced.root.children[1];
    const adversaries = [
      { ...balanced, root: { ...balanced.root, children: [[inline.children[1], inline.children[0]], grid] } },
      { ...balanced, root: { ...balanced.root, children: [inline.children[1], grid] } },
      { ...balanced, root: { ...balanced.root, children: [inline, inline] } },
      { ...balanced, root: { ...balanced.root, children: [{ ...inline, gap: '12px' }, grid] } },
      { ...balanced, root: { ...balanced.root, children: [{ ...inline, distribution: 'around' }, grid] } },
      { ...balanced, root: { ...balanced.root, children: [{ ...inline, children: [inline.children[0], { type: 'HeadStatus' }] }, grid] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, arrangement: 'masonry' }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, children: [{ type: 'HeadTemperature' }, ...grid.children.slice(1)] }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, children: [{ type: 'FilamentColor', appearance: 'quiet' }, ...grid.children.slice(1)] }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, children: [...grid.children, { type: 'HeadStatus', appearance: 'headerBadge' }] }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, children: [...grid.children, { type: 'Inline', gap: 'regular', distribution: 'split', children: inline.children }] }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, css: 'grid-column: 1 / -1' }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, componentPath: 'https://example.invalid/component.js' }] } },
      { ...balanced, root: { ...balanced.root, children: [inline, { ...grid, children: [...grid.children, { type: 'HeadStatus' }] }] } },
    ];
    for (const [index, input] of adversaries.entries()) expect(() => canonicalizePresentationSpec(input), `balanced adversary ${index}`).toThrow();
  });

  test('keeps all three A canonical specs stable while adding the B hash separately', () => {
    expect(canonicalPresentationSha256(t1EntityCardSpec)).toBe('7e9df2367d983587946dc5d5e708bb13d2b7172045390d5cbd8fe6e60c577a92');
    expect(canonicalPresentationSha256(t1CompactGridSpec)).toBe('7bdc296385bd91f5d172c73b771b5f955b3d6204a747a83a5e5205091b685b1a');
    expect(canonicalPresentationSha256(t1LargerCompositionSpec)).toBe('cd278ddf6c468f48dbfa437a36063b7c0bfd4408835ec58a6cc786322f53b243');
    expect(canonicalPresentationSha256(t1BalancedCompositionSpec)).toBe('dfbf87e36102bfa21a97e266e0d1258c4b61399eb874886abffd637a1259ac56');
  });

  test('deduplicates registered fields with one sorted dependency per referenced source', () => {
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
    expect(sourceForPresentationField('head.status')).toBe('status');
    expect(sourceForPresentationField('head.temperature')).toBe('status');
    expect(sourceForPresentationField('filament.color')).toBe('materials');
    expect(sourceForPresentationField('head.fanRelation')).toBe('environment');
  });

  test('constructs array and tuple child schemas from registered policies', () => {
    const schemas = {
      HeadStatus: z.object({ type: z.literal('HeadStatus') }).strict(),
      HeadTemperature: z.object({ type: z.literal('HeadTemperature') }).strict(),
    };
    const pair = registeredChildrenSchema(
      { kind: 'array', allowed: ['HeadStatus'], min: 2, max: 2 },
      schemas,
    );
    expect(pair.parse([{ type: 'HeadStatus' }, { type: 'HeadStatus' }])).toHaveLength(2);
    expect(() => pair.parse([{ type: 'HeadStatus' }])).toThrow();
    expect(() => pair.parse([{ type: 'HeadStatus' }, { type: 'HeadStatus' }, { type: 'HeadStatus' }])).toThrow();

    const tuple = registeredChildrenSchema(
      { kind: 'tuple', positions: [['HeadStatus'], ['HeadTemperature']] },
      schemas,
    );
    expect(tuple.parse([{ type: 'HeadStatus' }, { type: 'HeadTemperature' }])).toHaveLength(2);
    expect(() => tuple.parse([{ type: 'HeadTemperature' }, { type: 'HeadStatus' }])).toThrow();

    for (const file of ['schema.ts', 'view-model.ts']) {
      const source = readFileSync(resolve(process.cwd(), `src/lib/composable/${file}`), 'utf8');
      expect(source).toContain('registeredChildrenSchema(elementRegistry.Stack.children');
      expect(source).toContain('registeredChildrenSchema(elementRegistry.Grid.children');
      expect(source).toContain('registeredChildrenSchema(elementRegistry.Inline.children');
      expect(source).toContain('registeredChildrenSchema(elementRegistry.Card.children');
      expect(source).not.toMatch(/\.min\(1\)\.max\(8\)|z\.tuple\(/u);
      if (file === 'schema.ts') {
        expect(source).toContain("as z.ZodType<CardNode['children']>");
        expect(source).toContain('children: [TitleNode | InlineNode, StackNode | GridNode]');
      } else {
        expect(source).toContain("as z.ZodType<ResolvedCardNode['children']>");
        expect(source).toContain('children: [ResolvedTitleNode | ResolvedInlineNode, ResolvedStackNode | ResolvedGridNode]');
      }
    }
  });

  test('matches the standard SHA-256 digest for canonical v2 JSON and Unicode input', () => {
    for (const input of ['', 'abc', JSON.stringify(t1EntityCardSpec), 'T1 filament 色']) {
      expect(sha256Hex(input)).toBe(createHash('sha256').update(input).digest('hex'));
    }
    expect(canonicalPresentationSha256(t1EntityCardSpec)).toBe(createHash('sha256').update(JSON.stringify(t1EntityCardSpec)).digest('hex'));
  });
});
