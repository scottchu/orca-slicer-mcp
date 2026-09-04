import { z } from 'zod';
import { canonicalizePresentationSpec, titleText, type PresentationField, type PresentationNode, type PresentationSpec } from '../composable/schema.js';
import { derivePresentationPlan, type SourceGroup } from '../composable/planner.js';
import { canonicalPresentationSha256 } from '../composable/hash.js';
import { composableEnvelopeSchema, type ComposableEnvelope } from '../composable/envelope.js';
import { composableViewModelSchema, type ComposableViewModel, type ResolvedNode, type ResolvedValue, type ValueProvenance } from '../composable/view-model.js';

const timestamp = z.string().datetime({ offset: true });
const statusSourceSchema = z.object({
  observedAt: timestamp,
  receivedAt: timestamp,
  heads: z.array(z.object({
    id: z.literal('T1'),
    status: z.enum(['active', 'idle', 'offline', 'unknown']),
    actualC: z.number().finite().min(-100).max(500).nullable(),
    targetC: z.number().finite().min(0).max(500).nullable(),
  }).strict()).max(1),
}).strict();
const materialsSourceSchema = z.object({
  observedAt: timestamp,
  receivedAt: timestamp,
  heads: z.array(z.object({
    id: z.literal('T1'),
    color: z.string().regex(/^#[0-9A-F]{6}$/u).nullable(),
  }).strict()).max(1),
}).strict();
const environmentSourceSchema = z.object({
  observedAt: timestamp,
  receivedAt: timestamp,
  relations: z.array(z.object({
    headId: z.literal('T1'),
    fanId: z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/u),
    label: z.string().trim().min(1).max(48).refine((value) => !/[<>\u0000-\u001f\u007f]/u.test(value)),
    role: z.enum(['partCooling', 'cavity', 'purifier']),
  }).strict()).max(8),
}).strict();

export type StatusSource = z.infer<typeof statusSourceSchema>;
export type MaterialsSource = z.infer<typeof materialsSourceSchema>;
export type EnvironmentSource = z.infer<typeof environmentSourceSchema>;
export type ComposableReaders = {
  status: () => Promise<unknown>;
  materials: () => Promise<unknown>;
  environment: () => Promise<unknown>;
};

type Acquired = {
  status?: StatusSource;
  materials?: MaterialsSource;
  environment?: EnvironmentSource;
  failures: Set<SourceGroup>;
};

const unavailableProvenance = (source: SourceGroup): ValueProvenance => ({
  source,
  sourceObservedAt: null,
  receivedAt: null,
  detail: 'sourceUnavailable',
});
const provenance = (source: SourceGroup, value: { observedAt: string; receivedAt: string }, detail: string): ValueProvenance => ({
  source,
  sourceObservedAt: value.observedAt,
  receivedAt: value.receivedAt,
  detail,
});
const unknownText = (
  source: SourceGroup,
  acquired: Acquired,
  detail: string,
  evidence?: { observedAt: string; receivedAt: string },
): ResolvedValue => ({
  kind: 'text', state: acquired.failures.has(source) ? 'unavailable' : 'unknown', text: null,
  provenance: acquired.failures.has(source)
    ? unavailableProvenance(source)
    : evidence
      ? provenance(source, evidence, detail)
      : { source, sourceObservedAt: null, receivedAt: null, detail },
});

const resolveField = (field: PresentationField, acquired: Acquired): ResolvedValue => {
  if (field === 'head.status') {
    const source = acquired.status;
    if (!source) return unknownText('status', acquired, 'headNotReported');
    const head = source.heads[0];
    return head ? {
      kind: 'text', state: head.status === 'unknown' ? 'unknown' : 'known',
      text: head.status === 'unknown' ? null : ({ active: 'Active', idle: 'Idle', offline: 'Offline' } as const)[head.status],
      provenance: provenance('status', source, 'printerStatus.heads[T1].status'),
    } : unknownText('status', acquired, 'headNotReported', source);
  }
  if (field === 'head.temperature') {
    const source = acquired.status;
    if (!source) return {
      kind: 'temperature', state: acquired.failures.has('status') ? 'unavailable' : 'unknown', actual: null, target: null, unit: 'celsius',
      provenance: unavailableProvenance('status'),
    };
    const head = source.heads[0];
    const known = !!head && (head.actualC !== null || head.targetC !== null);
    return {
      kind: 'temperature', state: known ? 'known' : 'unknown', actual: head?.actualC ?? null, target: head?.targetC ?? null, unit: 'celsius',
      provenance: provenance('status', source, 'printerStatus.heads[T1].temperature'),
    };
  }
  if (field === 'filament.color') {
    const source = acquired.materials;
    if (!source) return {
      kind: 'color', state: acquired.failures.has('materials') ? 'unavailable' : 'unknown', hex: null,
      provenance: unavailableProvenance('materials'),
    };
    const head = source.heads[0];
    return {
      kind: 'color', state: head?.color ? 'known' : 'unknown', hex: head?.color ?? null,
      provenance: provenance('materials', source, 'printTaskConfig.heads[T1].color'),
    };
  }
  const source = acquired.environment;
  if (!source) return {
    kind: 'fanRelation', state: acquired.failures.has('environment') ? 'unavailable' : 'unknown', primary: null, sourceLabel: null, role: null,
    reason: acquired.failures.has('environment') ? 'sourceUnavailable' : 'notReported', provenance: unavailableProvenance('environment'),
  };
  const relations = source.relations.filter((relation) => relation.headId === 'T1');
  if (relations.length !== 1) return {
    kind: 'fanRelation', state: 'unknown', primary: null, sourceLabel: null, role: null,
    reason: relations.length > 1 ? 'ambiguous' : 'notReported',
    provenance: provenance('environment', source, relations.length > 1 ? 'ambiguousFanRelations' : 'fanRelationNotReported'),
  };
  return {
    kind: 'fanRelation', state: 'known',
    primary: ({ partCooling: 'Part cooling', cavity: 'Cavity', purifier: 'Purifier' } as const)[relations[0].role],
    sourceLabel: relations[0].label, role: relations[0].role, reason: null,
    provenance: provenance('environment', source, `environment.relations[${relations[0].fanId}]`),
  };
};

const resolveNode = (node: PresentationNode, acquired: Acquired): ResolvedNode => {
  if (node.type === 'Card') {
    const color = node.transform ? resolveField('filament.color', acquired) : null;
    if (color && color.kind !== 'color') throw new Error('Invalid card transform resolver');
    const title = resolveNode(node.children[0], acquired);
    const layout = resolveNode(node.children[1], acquired);
    if (title.type !== 'Title' || (layout.type !== 'Stack' && layout.type !== 'Grid')) throw new Error('Invalid card resolver');
    return {
      type: 'Card',
      density: node.density,
      tint: color?.kind === 'color' && color.state === 'known' && color.hex
        ? { kind: 'softTint', color: color.hex, strength: 'subtle' }
        : null,
      transformEvidence: color,
      children: [title, layout],
    };
  }
  if (node.type === 'Stack') {
    return { type: 'Stack', gap: node.gap, children: node.children.map((child) => resolveNode(child, acquired)) } as ResolvedNode;
  }
  if (node.type === 'Grid') {
    return { type: 'Grid', gap: node.gap, columns: node.columns, children: node.children.map((child) => resolveNode(child, acquired)) } as ResolvedNode;
  }
  if (node.type === 'Title') return { type: 'Title', text: titleText(node.content), size: node.size };
  if (node.type === 'PercentageFill') {
    const child = resolveNode(node.child, acquired);
    if (child.type !== 'HeadTemperature') throw new Error('Invalid percentage fill resolver');
    return { type: 'PercentageFill', child };
  }
  if (node.type === 'HeadStatus') {
    const value = resolveField('head.status', acquired);
    if (value.kind !== 'text') throw new Error('Invalid status resolver');
    return { type: 'HeadStatus', value };
  }
  if (node.type === 'HeadTemperature') {
    const value = resolveField('head.temperature', acquired);
    if (value.kind !== 'temperature') throw new Error('Invalid temperature resolver');
    return { type: 'HeadTemperature', value };
  }
  if (node.type === 'FilamentColor') {
    const value = resolveField('filament.color', acquired);
    if (value.kind !== 'color') throw new Error('Invalid color resolver');
    return { type: 'FilamentColor', value };
  }
  const value = resolveField('head.fanRelation', acquired);
  if (value.kind !== 'fanRelation') throw new Error('Invalid fan relation resolver');
  return { type: 'FanRelation', value };
};

const sourceSchemas = { status: statusSourceSchema, materials: materialsSourceSchema, environment: environmentSourceSchema } as const;

export const composeEntityCard = async (
  input: unknown,
  readers: ComposableReaders,
  now: () => Date = () => new Date(),
): Promise<ComposableEnvelope> => {
  const canonicalSpec = canonicalizePresentationSpec(input);
  const canonicalSpecSha256 = canonicalPresentationSha256(canonicalSpec);
  const plan = derivePresentationPlan(canonicalSpec);
  const acquired: Acquired = { failures: new Set() };
  await Promise.all(plan.dependencies.map(async ({ source }) => {
    try {
      const value = sourceSchemas[source].parse(await readers[source]());
      acquired[source] = value as never;
    } catch {
      acquired.failures.add(source);
    }
  }));
  const sources = plan.dependencies.map(({ source }) => {
    const value = acquired[source];
    return value
      ? { source, state: 'available' as const, observedAt: value.observedAt, receivedAt: value.receivedAt }
      : { source, state: 'unavailable' as const, observedAt: null, receivedAt: null };
  });
  const viewModel = composableViewModelSchema.parse({
    schemaVersion: 2,
    canonicalSpecSha256,
    state: acquired.failures.size ? 'error' : 'ready',
    generatedAt: now().toISOString(),
    subject: canonicalSpec.subject,
    dependencies: plan.dependencies,
    sources,
    root: resolveNode(canonicalSpec.root, acquired),
  }) satisfies ComposableViewModel;
  return composableEnvelopeSchema.parse({
    canonicalSpec,
    canonicalSpecSha256,
    viewModel,
  });
};

export const composeEntityCardEnvelope = async (
  input: unknown,
  readers: ComposableReaders,
  now: () => Date = () => new Date(),
): Promise<ComposableEnvelope> => composeEntityCard(input, readers, now);
