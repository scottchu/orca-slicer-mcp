import { derivePresentationPlan } from '../../composable/planner';
import { sourceForPresentationField } from '../../composable/element-registry';
import { titleText, type PresentationField, type PresentationNode, type PresentationSpec, type SummaryDomainNode } from '../../composable/schema';
import type { ComposableViewModel, ResolvedNode, ResolvedRowNode, ResolvedValue, ValueEvidenceState } from '../../composable/view-model';

const placeholderValue = (field: PresentationField, state: Extract<ValueEvidenceState, 'loading' | 'unavailable'>): ResolvedValue => {
  const source = sourceForPresentationField(field);
  const provenance = { source, sourceObservedAt: null, receivedAt: null, detail: state === 'loading' ? 'loading' : 'sourceUnavailable' };
  if (field === 'head.temperature') return { kind: 'temperature', state, actual: null, target: null, unit: 'celsius', provenance };
  if (field === 'filament.color') return { kind: 'color', state, hex: null, provenance };
  if (field === 'head.fanRelation') return { kind: 'fanRelation', state, primary: null, sourceLabel: null, role: null, reason: state === 'unavailable' ? 'sourceUnavailable' : null, provenance };
  return { kind: 'text', state, text: null, provenance };
};

const placeholderNode = (node: PresentationNode, state: Extract<ValueEvidenceState, 'loading' | 'unavailable'>): ResolvedNode => {
  if (node.type === 'Card') {
    const transformEvidence = node.transform ? placeholderValue('filament.color', state) : null;
    if (transformEvidence && transformEvidence.kind !== 'color') throw new Error('Invalid transform placeholder');
    const children = node.children.map((child) => placeholderNode(child, state));
    if ((children[0]?.type !== 'Title' && children[0]?.type !== 'Inline' && !(children[0]?.type === 'Group' && children[0].relation === 'identity'))
      || (children[1]?.type !== 'Stack' && children[1]?.type !== 'Grid' && !(children[1]?.type === 'Group' && children[1].relation === 'summary'))) throw new Error('Invalid card placeholder');
    return { type: 'Card', density: node.density, tint: null, transformEvidence, children: [children[0], children[1]] };
  }
  if (node.type === 'Group') {
    if (node.relation === 'identity') {
      const title = placeholderNode(node.children[0], state);
      const value = placeholderValue('head.status', state);
      if (title.type !== 'Title' || value.kind !== 'text') throw new Error('Invalid identity group placeholder');
      return {
        type: 'Group', relation: 'identity', layoutSource: 'smart', defaultRule: 'identity-packed-v1', tracks: null,
        rowGap: 'regular', columnGap: 'regular', children: [title, { type: 'HeadStatus', appearance: 'headerBadge', value }],
      };
    }
    const placeholderSummaryLeaf = (leaf: SummaryDomainNode): Extract<ResolvedNode, { type: 'HeadTemperature' | 'FilamentColor' | 'FanRelation' }> => {
      const resolved = placeholderNode(leaf, state);
      if (resolved.type === 'HeadTemperature') return { ...resolved, appearance: 'hero' };
      if (resolved.type === 'FilamentColor' || resolved.type === 'FanRelation') return { ...resolved, appearance: 'quiet' };
      throw new Error('Invalid summary group placeholder leaf');
    };
    const explicitLayout = 'layout' in node ? node.layout : null;
    const layout = explicitLayout ?? { kind: 'grid' as const, tracks: 6 as const, rowGap: 'regular' as const, columnGap: 'regular' as const };
    const rows: ResolvedRowNode[] = explicitLayout
      ? node.children.map((row): ResolvedRowNode => {
          if (row.type !== 'Row') throw new Error('Invalid explicit summary placeholder row');
          return {
            type: 'Row' as const, columnGap: layout.columnGap, collapse: 'intrinsic' as const,
            children: row.children.map((column) => ({
              type: 'Column' as const, colSpan: column.colSpan, children: [placeholderSummaryLeaf(column.children[0])],
            })),
          };
        })
      : ((): ResolvedRowNode[] => {
          const rank = { HeadTemperature: 0, FilamentColor: 1, FanRelation: 2 } as const;
          const leaves = [...node.children]
            .filter((child): child is SummaryDomainNode => child.type === 'HeadTemperature' || child.type === 'FilamentColor' || child.type === 'FanRelation')
            .sort((left, right) => rank[left.type] - rank[right.type])
            .map(placeholderSummaryLeaf);
          return [
            { type: 'Row' as const, columnGap: layout.columnGap, collapse: 'intrinsic' as const, children: [{ type: 'Column' as const, colSpan: 6 as const, children: [leaves[0]] }] },
            { type: 'Row' as const, columnGap: layout.columnGap, collapse: 'intrinsic' as const, children: [
              { type: 'Column' as const, colSpan: 3 as const, children: [leaves[1]] },
              { type: 'Column' as const, colSpan: 3 as const, children: [leaves[2]] },
            ] },
          ];
        })();
    return {
      type: 'Group', relation: 'summary', layoutSource: explicitLayout ? 'explicit' : 'smart', defaultRule: 'summary-grid6-v1', tracks: 6,
      rowGap: layout.rowGap, columnGap: layout.columnGap, children: rows,
    };
  }
  if (node.type === 'Stack') return { type: 'Stack', gap: node.gap, children: node.children.map((child) => placeholderNode(child, state)) } as ResolvedNode;
  if (node.type === 'Grid') return { type: 'Grid', columns: node.columns, gap: node.gap, arrangement: node.arrangement ?? 'uniform', children: node.children.map((child) => placeholderNode(child, state)) } as ResolvedNode;
  if (node.type === 'Inline') {
    const title = placeholderNode(node.children[0], state);
    const status = placeholderNode(node.children[1], state);
    if (title.type !== 'Title' || status.type !== 'HeadStatus') throw new Error('Invalid inline placeholder');
    return { type: 'Inline', gap: node.gap, distribution: node.distribution, children: [title, status] };
  }
  if (node.type === 'Row' || node.type === 'Column') throw new Error('Rows and columns resolve only inside an explicit summary group');
  if (node.type === 'Title') return { type: 'Title', text: titleText(node.content), size: node.size };
  if (node.type === 'HeadStatus') {
    const value = placeholderValue('head.status', state);
    if (value.kind !== 'text') throw new Error('Invalid status placeholder');
    return { type: 'HeadStatus', appearance: node.appearance ?? 'default', value };
  }
  if (node.type === 'HeadTemperature') {
    const value = placeholderValue('head.temperature', state);
    if (value.kind !== 'temperature') throw new Error('Invalid temperature placeholder');
    return { type: 'HeadTemperature', appearance: node.appearance ?? 'default', value };
  }
  if (node.type === 'FilamentColor') {
    const value = placeholderValue('filament.color', state);
    if (value.kind !== 'color') throw new Error('Invalid color placeholder');
    return { type: 'FilamentColor', appearance: node.appearance ?? 'default', value };
  }
  const value = placeholderValue('head.fanRelation', state);
  if (value.kind !== 'fanRelation') throw new Error('Invalid fan placeholder');
  return { type: 'FanRelation', appearance: node.appearance ?? 'default', value };
};

export const createPlaceholderPresentation = (
  spec: PresentationSpec,
  state: Extract<ComposableViewModel['state'], 'loading' | 'error'>,
): ComposableViewModel => {
  const plan = derivePresentationPlan(spec);
  const root = placeholderNode(spec.root, state === 'loading' ? 'loading' : 'unavailable');
  if (root.type !== 'Card') throw new Error('Invalid presentation root placeholder');
  return {
    schemaVersion: 2,
    canonicalSpecSha256: '0'.repeat(64),
    state,
    generatedAt: '1970-01-01T00:00:00.000Z',
    subject: spec.subject,
    dependencies: plan.dependencies,
    sources: plan.dependencies.map(({ source }) => ({ source, state: state === 'loading' ? 'loading' : 'unavailable', observedAt: null, receivedAt: null })),
    root,
  };
};
