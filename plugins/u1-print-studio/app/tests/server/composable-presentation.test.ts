import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import type { PresentationField } from '../../src/lib/composable/schema.js';
import { composableEnvelopeSchema } from '../../src/lib/composable/envelope.js';
import { t1BalancedCompositionSpec, t1CompactGridSpec, t1EntityCardSpec, t1ExplicitGroupedSummarySpec, t1SmartGroupedSummarySpec } from '../../src/lib/composable/specs.js';
import { composableViewModelSchema, resolvedValueSchema, type ResolvedNode, type ResolvedValue } from '../../src/lib/composable/view-model.js';
import { composeEntityCard, type ComposableReaders } from '../../src/lib/server/composable-presentation.js';

const statusObservedAt = '2026-09-03T16:20:00.000Z';
const statusReceivedAt = '2026-09-03T16:20:00.100Z';
const materialObservedAt = '2026-09-03T16:19:45.000Z';
const materialReceivedAt = '2026-09-03T16:19:45.250Z';
const environmentObservedAt = '2026-09-03T16:19:30.000Z';
const environmentReceivedAt = '2026-09-03T16:19:30.500Z';
const transformOnlySpec = {
  schemaVersion: 2 as const,
  subject: { kind: 'toolHead' as const, id: 'T1' as const },
  root: { type: 'Card' as const, density: 'comfortable' as const, transform: { kind: 'softFilamentTint' as const, strength: 'subtle' as const }, children: [{ type: 'Title' as const, content: 'material' as const, size: 'large' as const }, { type: 'Stack' as const, gap: 'regular' as const, children: [{ type: 'HeadStatus' as const }] }] },
};
const noTransformSpec = {
  schemaVersion: 2 as const,
  subject: { kind: 'toolHead' as const, id: 'T1' as const },
  root: { type: 'Card' as const, density: 'comfortable' as const, children: [{ type: 'Title' as const, content: 'status' as const, size: 'large' as const }, { type: 'Stack' as const, gap: 'regular' as const, children: [{ type: 'HeadStatus' as const }] }] },
};

const readers = (relations: unknown[] = []): ComposableReaders => ({
  status: async () => ({ observedAt: statusObservedAt, receivedAt: statusReceivedAt, heads: [{ id: 'T1', status: 'active', actualC: 214.6, targetC: 220 }] }),
  materials: async () => ({ observedAt: materialObservedAt, receivedAt: materialReceivedAt, heads: [{ id: 'T1', color: '#E89B3C' }] }),
  environment: async () => ({ observedAt: environmentObservedAt, receivedAt: environmentReceivedAt, relations }),
});

const values = (node: ResolvedNode, output = new Map<PresentationField, ResolvedValue>()): Map<PresentationField, ResolvedValue> => {
  if ('value' in node) {
    const field: PresentationField = node.type === 'HeadStatus' ? 'head.status' : node.type === 'HeadTemperature' ? 'head.temperature' : node.type === 'FilamentColor' ? 'filament.color' : 'head.fanRelation';
    output.set(field, node.value);
  }
  if ('children' in node) node.children.forEach((child) => values(child, output));
  return output;
};

describe('entity-bound composition acquisition and provenance', () => {
  test('rejects an invalid specification before any source acquisition', async () => {
    let calls = 0;
    const count = async () => { calls++; return {}; };
    await expect(composeEntityCard({ ...t1EntityCardSpec, css: 'body{}' }, { status: count, materials: count, environment: count })).rejects.toThrow();
    await expect(composeEntityCard({ ...t1EntityCardSpec, schemaVersion: 1 }, { status: count, materials: count, environment: count })).rejects.toThrow();
    await expect(composeEntityCard({ ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [{ type: 'Title', text: 'Tool head T2', size: 'large' }, t1EntityCardSpec.root.children[1]] } }, { status: count, materials: count, environment: count })).rejects.toThrow();
    const stack = t1EntityCardSpec.root.children[1];
    await expect(composeEntityCard({ ...t1EntityCardSpec, root: { ...t1EntityCardSpec.root, children: [t1EntityCardSpec.root.children[0], { ...stack, children: [{ type: 'PercentageFill', child: { type: 'HeadTemperature' } }] }] } }, { status: count, materials: count, environment: count })).rejects.toThrow();
    const balanced = structuredClone(t1BalancedCompositionSpec) as any;
    const inline = balanced.root.children[0];
    const grid = balanced.root.children[1];
    for (const root of [
      { ...balanced.root, children: [{ ...inline, children: [inline.children[1], inline.children[0]] }, grid] },
      { ...balanced.root, children: [inline, { ...grid, children: [...grid.children, { type: 'HeadStatus' }] }] },
      { ...balanced.root, children: [inline, { ...grid, children: [{ type: 'HeadTemperature' }, ...grid.children.slice(1)] }] },
      { ...balanced.root, children: [inline, { ...grid, css: 'display:none' }] },
      { ...balanced.root, children: [inline, { ...grid, componentPath: 'https://example.invalid/evil.js' }] },
    ]) await expect(composeEntityCard({ ...balanced, root }, { status: count, materials: count, environment: count })).rejects.toThrow();
    const smart = structuredClone(t1SmartGroupedSummarySpec) as any;
    await expect(composeEntityCard({ ...smart, root: { ...smart.root, children: [
      { ...smart.root.children[0], children: smart.root.children[0].children.slice(0, 1) },
      smart.root.children[1],
    ] } }, { status: count, materials: count, environment: count })).rejects.toThrow();
    await expect(composeEntityCard({ ...smart, root: { ...smart.root, children: [
      smart.root.children[0],
      { ...smart.root.children[1], children: smart.root.children[1].children.slice(0, 2) },
    ] } }, { status: count, materials: count, environment: count })).rejects.toThrow();
    const explicit = structuredClone(t1ExplicitGroupedSummarySpec) as any;
    const explicitSummary = explicit.root.children[1];
    for (const summary of [
      { ...explicitSummary, children: [] },
      { ...explicitSummary, children: Array.from({ length: 7 }, () => explicitSummary.children[0]) },
      { ...explicitSummary, layout: { ...explicitSummary.layout, css: 'grid-template-columns:repeat(6,1fr)' } },
      { ...explicitSummary, layout: { ...explicitSummary.layout, breakpoint: 390 } },
      { ...explicitSummary, layout: { ...explicitSummary.layout, tracks: 12 } },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 5, children: [{ type: 'HeadTemperature' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, start: 1, children: [{ type: 'HeadTemperature' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, offset: 0, children: [{ type: 'HeadTemperature' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, rowSpan: 2, children: [{ type: 'HeadTemperature' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', overlap: true, children: [{ type: 'Column', colSpan: 6, children: [{ type: 'HeadTemperature' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, children: [{ type: 'HeadTemperature', appearance: 'hero' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, children: [{ type: 'HeadTemperature' }, { type: 'FanRelation' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, children: [{ type: 'Row', children: [{ type: 'Column', colSpan: 6, children: [{ type: 'HeadStatus' }] }] }, ...explicitSummary.children.slice(1)] },
      { ...explicitSummary, html: '<div>escape</div>' },
      { ...explicitSummary, javascript: 'globalThis.location' },
      { ...explicitSummary, componentUrl: 'https://example.invalid/row.js' },
    ]) await expect(composeEntityCard({ ...explicit, root: { ...explicit.root, children: [explicit.root.children[0], summary] } }, { status: count, materials: count, environment: count })).rejects.toThrow();
    expect(calls).toBe(0);
  });

  test('calls each referenced reader exactly once and never calls an unreferenced source', async () => {
    const count = { status: 0, materials: 0, environment: 0 };
    const base = readers();
    const counting: ComposableReaders = {
      status: async () => { count.status++; return base.status(); },
      materials: async () => { count.materials++; return base.materials(); },
      environment: async () => { count.environment++; return base.environment(); },
    };
    await composeEntityCard(t1EntityCardSpec, counting);
    expect(count).toEqual({ status: 1, materials: 1, environment: 1 });
    count.status = 0; count.materials = 0; count.environment = 0;
    await composeEntityCard(t1CompactGridSpec, counting);
    expect(count).toEqual({ status: 1, materials: 1, environment: 0 });
    count.status = 0; count.materials = 0; count.environment = 0;
    await composeEntityCard(t1BalancedCompositionSpec, counting);
    expect(count).toEqual({ status: 1, materials: 1, environment: 1 });
    for (const spec of [t1SmartGroupedSummarySpec, t1ExplicitGroupedSummarySpec]) {
      count.status = 0; count.materials = 0; count.environment = 0;
      await composeEntityCard(spec, counting);
      expect(count).toEqual({ status: 1, materials: 1, environment: 1 });
    }
  });

  test('resolves semantic grouping first and limits override to six-track placement', async () => {
    const [smart, explicit] = await Promise.all([
      composeEntityCard(t1SmartGroupedSummarySpec, readers()),
      composeEntityCard(t1ExplicitGroupedSummarySpec, readers()),
    ]);
    const summary = (result: typeof smart) => {
      const header = result.viewModel.root.children[0];
      const body = result.viewModel.root.children[1];
      if (header.type !== 'Group' || body.type !== 'Group' || body.relation !== 'summary') throw new Error('Expected grouped fixture');
      return { header, body, leaves: body.children.flatMap((row) => row.children.map((column) => column.children[0])) };
    };
    const smartGroups = summary(smart);
    const explicitGroups = summary(explicit);
    expect(smartGroups.header).toMatchObject({ relation: 'identity', layoutSource: 'smart', defaultRule: 'identity-packed-v1', tracks: null, children: [{ type: 'Title' }, { type: 'HeadStatus', appearance: 'headerBadge' }] });
    expect(smartGroups.body).toMatchObject({ layoutSource: 'smart', defaultRule: 'summary-grid6-v1', tracks: 6, rowGap: 'regular', columnGap: 'regular' });
    expect(explicitGroups.body).toMatchObject({ layoutSource: 'explicit', defaultRule: 'summary-grid6-v1', tracks: 6, rowGap: 'regular', columnGap: 'regular' });
    expect(smartGroups.body.children.map((row) => row.children.map((column) => column.colSpan))).toEqual([[6], [3, 3]]);
    expect(explicitGroups.body.children.map((row) => row.children.map((column) => column.colSpan))).toEqual([[6], [3, 3]]);
    expect(smartGroups.leaves.map((leaf) => [leaf.type, leaf.appearance])).toEqual([
      ['HeadTemperature', 'hero'], ['FilamentColor', 'quiet'], ['FanRelation', 'quiet'],
    ]);
    expect(explicitGroups.leaves.map((leaf) => [leaf.type, leaf.appearance])).toEqual(smartGroups.leaves.map((leaf) => [leaf.type, leaf.appearance]));
    expect(values(smart.viewModel.root)).toEqual(values(explicit.viewModel.root));

    const corruptions: Array<(candidate: any) => void> = [
      (candidate) => { candidate.viewModel.root.children[1].layoutSource = 'explicit'; },
      (candidate) => { candidate.viewModel.root.children[1].defaultRule = 'identity-packed-v1'; },
      (candidate) => { candidate.viewModel.root.children[1].children[0].children[0].colSpan = 5; },
      (candidate) => { candidate.viewModel.root.children[1].children[1].children.reverse(); },
      (candidate) => { candidate.viewModel.root.children[1].children[1].children[0].children[0].appearance = 'hero'; },
      (candidate) => { candidate.viewModel.root.children[0].children[1].value.provenance.receivedAt = materialReceivedAt; },
    ];
    for (const corrupt of corruptions) {
      const candidate = structuredClone(smart) as any;
      corrupt(candidate);
      expect(composableEnvelopeSchema.safeParse(candidate).success).toBe(false);
    }
  });

  test('accepts one explicit six-track row, preserves authored order, and acquires each source once', async () => {
    const oneRow = structuredClone(t1ExplicitGroupedSummarySpec) as any;
    oneRow.root.children[1].children = [{
      type: 'Row',
      children: [
        { type: 'Column', colSpan: 2, children: [{ type: 'FanRelation' }] },
        { type: 'Column', colSpan: 2, children: [{ type: 'HeadTemperature' }] },
        { type: 'Column', colSpan: 2, children: [{ type: 'FilamentColor' }] },
      ],
    }];
    const count = { status: 0, materials: 0, environment: 0 };
    const base = readers();
    const result = await composeEntityCard(oneRow, {
      status: async () => { count.status++; return base.status(); },
      materials: async () => { count.materials++; return base.materials(); },
      environment: async () => { count.environment++; return base.environment(); },
    });
    const body = result.viewModel.root.children[1];
    if (body.type !== 'Group' || body.relation !== 'summary') throw new Error('Expected summary group');
    expect(body.children).toHaveLength(1);
    expect(body.children[0].children.map((column) => column.colSpan)).toEqual([2, 2, 2]);
    expect(body.children[0].children.map((column) => column.children[0].type)).toEqual([
      'FanRelation', 'HeadTemperature', 'FilamentColor',
    ]);
    expect(count).toEqual({ status: 1, materials: 1, environment: 1 });
  });

  test('normalizes and correlates the balanced layout and appearance modes', async () => {
    const result = await composeEntityCard(t1BalancedCompositionSpec, readers());
    expect(result.viewModel.root).toMatchObject({
      density: 'compact', tint: null, transformEvidence: null,
      children: [
        { type: 'Inline', gap: 'regular', distribution: 'split', children: [{ type: 'Title' }, { type: 'HeadStatus', appearance: 'headerBadge' }] },
        { type: 'Grid', columns: 'two', gap: 'regular', arrangement: 'lead', children: [
          { type: 'HeadTemperature', appearance: 'hero' },
          { type: 'FilamentColor', appearance: 'quiet' },
          { type: 'FanRelation', appearance: 'quiet' },
        ] },
      ],
    });
    const corruptions: Array<(candidate: any) => void> = [
      (candidate) => { candidate.viewModel.root.children[0].distribution = 'packed'; },
      (candidate) => { candidate.viewModel.root.children[0].children.reverse(); },
      (candidate) => { candidate.viewModel.root.children[1].arrangement = 'uniform'; },
      (candidate) => { candidate.viewModel.root.children[1].children[0].appearance = 'default'; },
      (candidate) => { candidate.viewModel.root.children[1].children[1].appearance = 'default'; },
      (candidate) => { candidate.viewModel.root.children[1].children.reverse(); },
      (candidate) => { candidate.viewModel.root.children[0].children[1].value.provenance.receivedAt = materialReceivedAt; },
    ];
    for (const corrupt of corruptions) {
      const candidate = structuredClone(result) as any;
      corrupt(candidate);
      expect(composableEnvelopeSchema.safeParse(candidate).success).toBe(false);
    }
  });

  test('validates its output and keeps source, receive, and generation times distinct', async () => {
    const result = await composeEntityCard(t1EntityCardSpec, readers(), () => new Date('2026-09-03T16:21:00.000Z'));
    expect(composableViewModelSchema.parse(result.viewModel)).toEqual(result.viewModel);
    const resolved = values(result.viewModel.root);
    expect(resolved.get('head.status')?.provenance).toMatchObject({ source: 'status', sourceObservedAt: statusObservedAt, receivedAt: statusReceivedAt });
    expect(resolved.get('head.temperature')?.provenance).toMatchObject({ source: 'status', sourceObservedAt: statusObservedAt, receivedAt: statusReceivedAt });
    expect(resolved.get('filament.color')?.provenance).toMatchObject({ source: 'materials', sourceObservedAt: materialObservedAt, receivedAt: materialReceivedAt });
    expect(result.viewModel.generatedAt).toBe('2026-09-03T16:21:00.000Z');
    await expect(composeEntityCard(t1EntityCardSpec, readers(), () => new Date(Number.NaN))).rejects.toThrow();
  });

  test('binds the registered temperature leaf to resolved T1 actual/target provenance', async () => {
    const result = await composeEntityCard(t1EntityCardSpec, readers());
    const layout = result.viewModel.root.children[1];
    const temperature = layout.children.find((node) => node.type === 'HeadTemperature');
    expect(temperature).toMatchObject({
      type: 'HeadTemperature',
      value: {
        kind: 'temperature', state: 'known', actual: 214.6, target: 220,
        provenance: { source: 'status', sourceObservedAt: statusObservedAt, receivedAt: statusReceivedAt },
      },
    });
    const divergent = structuredClone(result) as any;
    divergent.viewModel.root.children[1].children.find((node: any) => node.type === 'HeadTemperature').value.provenance.receivedAt = materialReceivedAt;
    expect(composableEnvelopeSchema.safeParse(divergent).success).toBe(false);
  });

  test('hashes canonical semantic structure rather than input object key insertion order', async () => {
    const reordered = { root: t1EntityCardSpec.root, subject: { id: 'T1', kind: 'toolHead' }, schemaVersion: 2 };
    const first = await composeEntityCard(t1EntityCardSpec, readers());
    const second = await composeEntityCard(reordered, readers());
    expect(first.viewModel.canonicalSpecSha256).toBe(second.viewModel.canonicalSpecSha256);
    expect(first.viewModel.canonicalSpecSha256).toBe(createHash('sha256').update(JSON.stringify(first.canonicalSpec)).digest('hex'));
    const changed = structuredClone(t1EntityCardSpec);
    if (changed.root.type !== 'Card') throw new Error('Expected card fixture');
    const header = changed.root.children[0];
    if (header.type !== 'Title') throw new Error('Expected title fixture');
    header.content = 'inspectionGroup';
    expect((await composeEntityCard(changed, readers())).viewModel.canonicalSpecSha256).not.toBe(first.viewModel.canonicalSpecSha256);
  });

  test('preserves unrelated values when one source rejects or is malformed', async () => {
    for (const environment of [async () => { throw new Error('offline'); }, async () => ({ observedAt: environmentObservedAt, receivedAt: environmentReceivedAt, relations: [{ headId: 'T1', fanId: 'part', label: '<unsafe>', role: 'partCooling' }] })]) {
      const result = await composeEntityCard(t1EntityCardSpec, { ...readers(), environment });
      const resolved = values(result.viewModel.root);
      expect(result.viewModel.state).toBe('error');
      expect(resolved.get('head.status')).toMatchObject({ state: 'known', text: 'Active' });
      expect(resolved.get('head.temperature')).toMatchObject({ state: 'known', actual: 214.6, target: 220 });
      expect(resolved.get('filament.color')).toMatchObject({ state: 'known', hex: '#E89B3C' });
      expect(resolved.get('head.fanRelation')).toMatchObject({ state: 'unavailable', primary: null, sourceLabel: null, role: null, reason: 'sourceUnavailable' });
    }
  });

  test('keeps zero, one, multiple, and malformed T1 fan relations truthful', async () => {
    const part = { headId: 'T1', fanId: 'part', label: 'Part cooling fan', role: 'partCooling' };
    const cavity = { headId: 'T1', fanId: 'cavity', label: 'Cavity fan', role: 'cavity' };
    const cases = [
      { relations: [], expected: { state: 'unknown', reason: 'notReported', role: null } },
      { relations: [part], expected: { state: 'known', reason: null, role: 'partCooling', primary: 'Part cooling', sourceLabel: 'Part cooling fan' } },
      { relations: [part, cavity], expected: { state: 'unknown', reason: 'ambiguous', role: null, primary: null, sourceLabel: null } },
      { relations: [{ ...part, role: 'headFan' }], expected: { state: 'unavailable', reason: 'sourceUnavailable', role: null } },
    ];
    for (const item of cases) {
      const result = await composeEntityCard(t1EntityCardSpec, readers(item.relations));
      expect(values(result.viewModel.root).get('head.fanRelation')).toMatchObject(item.expected);
    }
  });

  test('validates canonical spec, plan, source ledger, provenance, and resolved topology as one envelope', async () => {
    const baseline = await composeEntityCard(t1EntityCardSpec, readers());
    expect(composableEnvelopeSchema.parse(baseline)).toEqual(baseline);
    const corruptions: Array<(candidate: any) => void> = [
      (candidate) => { candidate.canonicalSpecSha256 = '1'.repeat(64); },
      (candidate) => { candidate.viewModel.canonicalSpecSha256 = '2'.repeat(64); },
      (candidate) => { candidate.viewModel.dependencies[2].fields = ['head.status']; },
      (candidate) => { candidate.viewModel.sources.splice(1, 1); },
      (candidate) => { candidate.viewModel.sources[2].observedAt = '2026-09-03T16:20:01.000Z'; },
      (candidate) => { values(candidate.viewModel.root).get('head.status')!.provenance.receivedAt = '2026-09-03T16:20:01.000Z'; },
      (candidate) => { values(candidate.viewModel.root).get('head.status')!.provenance.source = 'materials'; },
      (candidate) => { candidate.canonicalSpec.root.children[0].content = 'inspectionGroup'; },
      (candidate) => { candidate.viewModel.root.children[0].text = 'Changed tree'; },
      (candidate) => { candidate.viewModel.root.children[0].text = 'T1 status'; },
    ];
    for (const corrupt of corruptions) {
      const candidate = structuredClone(baseline) as any;
      corrupt(candidate);
      expect(composableEnvelopeSchema.safeParse(candidate).success).toBe(false);
    }
  });

  test('rejects divergent repeated fields and transform/color evidence', async () => {
    const baseline = await composeEntityCard(t1EntityCardSpec, readers());
    const divergentDuplicate = structuredClone(baseline.viewModel) as any;
    const layout = divergentDuplicate.root.children[1];
    const status = structuredClone(layout.children.find((node: any) => node.type === 'HeadStatus'));
    status.value.text = 'Idle';
    layout.children.push(status);
    expect(composableViewModelSchema.safeParse(divergentDuplicate).success).toBe(false);

    const divergentColor = structuredClone(baseline.viewModel) as any;
    divergentColor.root.children[1].children.find((node: any) => node.type === 'FilamentColor').value.hex = '#ABCDEF';
    expect(composableViewModelSchema.safeParse(divergentColor).success).toBe(false);

    const divergentTint = structuredClone(baseline.viewModel) as any;
    divergentTint.root.tint.color = '#000000';
    expect(composableViewModelSchema.safeParse(divergentTint).success).toBe(false);
  });

  test('rejects global error combined with any loading receipt', async () => {
    const failedEnvironment = await composeEntityCard(t1EntityCardSpec, {
      ...readers(),
      environment: async () => { throw new Error('offline'); },
    });
    const mixed = structuredClone(failedEnvironment.viewModel) as any;
    const statusSource = mixed.sources.find((source: any) => source.source === 'status');
    Object.assign(statusSource, { state: 'loading', observedAt: null, receivedAt: null });
    for (const node of mixed.root.children[1].children) {
      const value = node.value;
      if (value?.provenance.source !== 'status') continue;
      value.state = 'loading';
      value.provenance.sourceObservedAt = null;
      value.provenance.receivedAt = null;
      if (value.kind === 'text') value.text = null;
      if (value.kind === 'temperature') { value.actual = null; value.target = null; }
    }
    expect(composableViewModelSchema.safeParse(mixed).success).toBe(false);
  });

  test('rejects render-bound status, temperature, and fan contradictions', async () => {
    const baseline = await composeEntityCard(t1EntityCardSpec, readers([
      { headId: 'T1', fanId: 'part', label: 'Reported hardware label', role: 'partCooling' },
    ]));
    const resolved = values(baseline.viewModel.root);
    const status = structuredClone(resolved.get('head.status')) as any;
    status.text = 'Heating rapidly';
    expect(resolvedValueSchema.safeParse(status).success).toBe(false);
    const temperature = structuredClone(resolved.get('head.temperature')) as any;
    temperature.actual = 10_000;
    expect(resolvedValueSchema.safeParse(temperature).success).toBe(false);
    const fan = structuredClone(resolved.get('head.fanRelation')) as any;
    fan.primary = 'Cavity';
    expect(resolvedValueSchema.safeParse(fan).success).toBe(false);
  });

  test('correlates card tint to provenance-bearing configured color without requiring a color leaf', async () => {
    const calls = { status: 0, materials: 0, environment: 0 };
    const base = readers();
    const result = await composeEntityCard(transformOnlySpec, {
      status: async () => { calls.status++; return base.status(); },
      materials: async () => { calls.materials++; return base.materials(); },
      environment: async () => { calls.environment++; return base.environment(); },
    });
    expect(calls).toEqual({ status: 1, materials: 1, environment: 0 });
    expect(result.viewModel.root).toMatchObject({
      type: 'Card',
      tint: { kind: 'softTint', color: '#E89B3C', strength: 'subtle' },
      transformEvidence: { kind: 'color', state: 'known', hex: '#E89B3C', provenance: { source: 'materials', sourceObservedAt: materialObservedAt, receivedAt: materialReceivedAt } },
    });
    const divergent = structuredClone(result) as any;
    divergent.viewModel.root.tint.color = '#000000';
    expect(composableEnvelopeSchema.safeParse(divergent).success).toBe(false);
    const wrongReceipt = structuredClone(result) as any;
    wrongReceipt.viewModel.root.transformEvidence.provenance.receivedAt = statusReceivedAt;
    expect(composableEnvelopeSchema.safeParse(wrongReceipt).success).toBe(false);

    const noTransform = await composeEntityCard(noTransformSpec, readers());
    const injected = structuredClone(noTransform) as any;
    injected.viewModel.root.tint = result.viewModel.root.type === 'Card' ? result.viewModel.root.tint : null;
    expect(composableEnvelopeSchema.safeParse(injected).success).toBe(false);
  });

  test('keeps transformed card neutral when configured color is unknown or unavailable', async () => {
    const unknown = await composeEntityCard(transformOnlySpec, {
      ...readers(),
      materials: async () => ({ observedAt: materialObservedAt, receivedAt: materialReceivedAt, heads: [{ id: 'T1', color: null }] }),
    });
    expect(unknown.viewModel.root).toMatchObject({ type: 'Card', tint: null, transformEvidence: { state: 'unknown', hex: null } });
    const unavailable = await composeEntityCard(transformOnlySpec, {
      ...readers(),
      materials: async () => { throw new Error('offline'); },
    });
    expect(unavailable.viewModel.root).toMatchObject({ type: 'Card', tint: null, transformEvidence: { state: 'unavailable', hex: null } });
  });
});
