import { derivePresentationPlan, type SourceGroup } from '../../composable/planner';
import type { PresentationField, PresentationNode, PresentationSpec } from '../../composable/schema';
import type { ComposableViewModel, ResolvedNode, ResolvedValue, ValueEvidenceState } from '../../composable/view-model';

const sourceFor = (field: PresentationField): SourceGroup => field === 'filament.color'
  ? 'materials'
  : field === 'head.fanRelation'
    ? 'environment'
    : 'status';

const placeholderValue = (field: PresentationField, state: Extract<ValueEvidenceState, 'loading' | 'unavailable'>): ResolvedValue => {
  const source = sourceFor(field);
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
    return { type: 'Card', tint: null, transformEvidence, children: node.children.map((child) => placeholderNode(child, state)) };
  }
  if (node.type === 'Table' || node.type === 'Row') return { type: node.type, children: node.children.map((child) => placeholderNode(child, state)) };
  if (node.type === 'Title') return node;
  if (node.type === 'HeadStatus') {
    const value = placeholderValue('head.status', state);
    if (value.kind !== 'text') throw new Error('Invalid status placeholder');
    return { type: 'HeadStatus', value };
  }
  if (node.type === 'HeadTemperature') {
    const value = placeholderValue('head.temperature', state);
    if (value.kind !== 'temperature') throw new Error('Invalid temperature placeholder');
    return { type: 'HeadTemperature', value };
  }
  if (node.type === 'FilamentColor') {
    const value = placeholderValue('filament.color', state);
    if (value.kind !== 'color') throw new Error('Invalid color placeholder');
    return { type: 'FilamentColor', value };
  }
  const value = placeholderValue('head.fanRelation', state);
  if (value.kind !== 'fanRelation') throw new Error('Invalid fan placeholder');
  return { type: 'FanRelation', value };
};

export const createPlaceholderPresentation = (
  spec: PresentationSpec,
  state: Extract<ComposableViewModel['state'], 'loading' | 'error'>,
): ComposableViewModel => {
  const plan = derivePresentationPlan(spec);
  return {
    schemaVersion: 1,
    canonicalSpecSha256: '0'.repeat(64),
    state,
    generatedAt: '1970-01-01T00:00:00.000Z',
    subject: spec.subject,
    dependencies: plan.dependencies,
    sources: plan.dependencies.map(({ source }) => ({ source, state: state === 'loading' ? 'loading' : 'unavailable', observedAt: null, receivedAt: null })),
    root: placeholderNode(spec.root, state === 'loading' ? 'loading' : 'unavailable'),
  };
};
