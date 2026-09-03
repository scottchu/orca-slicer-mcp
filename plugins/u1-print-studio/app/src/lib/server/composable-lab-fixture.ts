import type { ComposableViewModel, ResolvedNode, ResolvedValue } from '../composable/view-model.js';
import { t1EntityCardSpec, t1LargerCompositionSpec, t1LeafSpec } from '../composable/specs.js';
import { composeEntityCard, type ComposableReaders } from './composable-presentation.js';

const sourceTime = {
  status: { observedAt: '2026-09-03T16:20:00.000Z', receivedAt: '2026-09-03T16:20:00.250Z' },
  materials: { observedAt: '2026-09-03T16:19:45.000Z', receivedAt: '2026-09-03T16:19:45.300Z' },
  environment: { observedAt: '2026-09-03T16:19:30.000Z', receivedAt: '2026-09-03T16:19:30.400Z' },
} as const;
const generatedAt = () => new Date('2026-09-03T16:20:00.500Z');
export const COMPOSABLE_LAB_SCENARIOS = ['unknown', 'ambiguous', 'known', 'loading', 'partial', 'error'] as const;
export const COMPOSABLE_LAB_VARIANTS = ['card', 'leaves', 'larger'] as const;

const readers = (scenario: 'unknown' | 'ambiguous' | 'known' | 'partial' | 'error'): ComposableReaders => {
  if (scenario === 'error') {
    const fail = async (): Promise<never> => { throw new Error('synthetic acquisition failure'); };
    return { status: fail, materials: fail, environment: fail };
  }
  const failEnvironment = async (): Promise<never> => { throw new Error('synthetic environment failure'); };
  return {
    status: async () => ({ ...sourceTime.status, heads: [{ id: 'T1', status: 'active', actualC: 214.6, targetC: 220 }] }),
    materials: async () => ({ ...sourceTime.materials, heads: [{ id: 'T1', color: '#E89B3C' }] }),
    environment: scenario === 'partial' ? failEnvironment : async () => ({
      ...sourceTime.environment,
      relations: scenario === 'known'
        ? [{ headId: 'T1', fanId: 'part', label: 'Part cooling fan', role: 'partCooling' }]
        : scenario === 'ambiguous'
          ? [
              { headId: 'T1', fanId: 'part-a', label: 'Part fan A', role: 'partCooling' },
              { headId: 'T1', fanId: 'part-b', label: 'Part fan B', role: 'partCooling' },
            ]
          : [],
    }),
  };
};

const loadingValue = (value: ResolvedValue): ResolvedValue => {
  const provenance = { ...value.provenance, sourceObservedAt: null, receivedAt: null, detail: 'loading' };
  if (value.kind === 'text') return { ...value, state: 'loading', text: null, provenance };
  if (value.kind === 'temperature') return { ...value, state: 'loading', actual: null, target: null, provenance };
  if (value.kind === 'color') return { ...value, state: 'loading', hex: null, provenance };
  return { ...value, state: 'loading', primary: null, sourceLabel: null, role: null, reason: null, provenance };
};
const loadingNode = (node: ResolvedNode): ResolvedNode => {
  if (node.type === 'Card') {
    const transformEvidence = node.transformEvidence ? loadingValue(node.transformEvidence) : null;
    if (transformEvidence && transformEvidence.kind !== 'color') throw new Error('Invalid transform loading evidence');
    return { ...node, tint: null, transformEvidence, children: node.children.map(loadingNode) };
  }
  if (node.type === 'Table' || node.type === 'Row') return { ...node, children: node.children.map(loadingNode) };
  if (node.type === 'Title') return node;
  const value = loadingValue(node.value);
  if (node.type === 'HeadStatus' && value.kind === 'text') return { ...node, value };
  if (node.type === 'HeadTemperature' && value.kind === 'temperature') return { ...node, value };
  if (node.type === 'FilamentColor' && value.kind === 'color') return { ...node, value };
  if (node.type === 'FanRelation' && value.kind === 'fanRelation') return { ...node, value };
  throw new Error('Invalid composable loading node');
};
const asLoading = (viewModel: ComposableViewModel): ComposableViewModel => ({
  ...viewModel,
  state: 'loading',
  sources: viewModel.sources.map((source) => ({ ...source, state: 'loading', observedAt: null, receivedAt: null })),
  root: loadingNode(viewModel.root),
});

export const createComposableLabData = async () => {
  const specs = { card: t1EntityCardSpec, leaves: t1LeafSpec, larger: t1LargerCompositionSpec } as const;
  const output: Record<string, Record<string, { canonicalSpec: unknown; viewModel: ComposableViewModel }>> = {};
  for (const scenario of COMPOSABLE_LAB_SCENARIOS) {
    output[scenario] = {};
    for (const [variant, spec] of Object.entries(specs)) {
      const result = await composeEntityCard(spec, readers(scenario === 'loading' ? 'unknown' : scenario), generatedAt);
      output[scenario][variant] = {
        canonicalSpec: result.canonicalSpec,
        viewModel: scenario === 'loading' ? asLoading(result.viewModel) : result.viewModel,
      };
    }
  }
  return output;
};
