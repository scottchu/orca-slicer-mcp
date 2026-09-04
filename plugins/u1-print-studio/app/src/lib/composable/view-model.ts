import { z } from 'zod';
import type { PresentationField, PresentationSubject } from './schema.js';
import type { SourceGroup } from './planner.js';

export type ValueEvidenceState = 'known' | 'unknown' | 'unavailable' | 'loading';
export type ValueProvenance = {
  source: SourceGroup;
  sourceObservedAt: string | null;
  receivedAt: string | null;
  detail: string;
};
export type ResolvedValue =
  | { kind: 'text'; state: ValueEvidenceState; text: 'Active' | 'Idle' | 'Offline' | null; provenance: ValueProvenance }
  | { kind: 'temperature'; state: ValueEvidenceState; actual: number | null; target: number | null; unit: 'celsius'; provenance: ValueProvenance }
  | { kind: 'color'; state: ValueEvidenceState; hex: string | null; provenance: ValueProvenance }
  | { kind: 'fanRelation'; state: ValueEvidenceState; primary: 'Part cooling' | 'Cavity' | 'Purifier' | null; sourceLabel: string | null; role: 'partCooling' | 'cavity' | 'purifier' | null; reason: 'notReported' | 'ambiguous' | 'sourceUnavailable' | null; provenance: ValueProvenance };
export type ResolvedTextValue = Extract<ResolvedValue, { kind: 'text' }>;
export type ResolvedTemperatureValue = Extract<ResolvedValue, { kind: 'temperature' }>;
export type ResolvedColorValue = Extract<ResolvedValue, { kind: 'color' }>;
export type ResolvedFanRelationValue = Extract<ResolvedValue, { kind: 'fanRelation' }>;

export type ResolvedDomainNode =
  | { type: 'HeadStatus'; value: ResolvedTextValue }
  | { type: 'HeadTemperature'; value: ResolvedTemperatureValue }
  | { type: 'FilamentColor'; value: ResolvedColorValue }
  | { type: 'FanRelation'; value: ResolvedFanRelationValue }
  | { type: 'PercentageFill'; child: { type: 'HeadTemperature'; value: ResolvedTemperatureValue } };
export type ResolvedTitleNode = { type: 'Title'; text: string; size: 'medium' | 'large' };
export type ResolvedStackNode = { type: 'Stack'; gap: 'compact' | 'regular' | 'relaxed'; children: ResolvedDomainNode[] };
export type ResolvedGridNode = { type: 'Grid'; columns: 'one' | 'two'; gap: 'compact' | 'regular' | 'relaxed'; children: ResolvedDomainNode[] };
export type ResolvedCardNode = {
  type: 'Card';
  density: 'compact' | 'comfortable';
  tint: { kind: 'softTint'; color: string; strength: 'subtle' } | null;
  transformEvidence: ResolvedColorValue | null;
  children: [ResolvedTitleNode, ResolvedStackNode | ResolvedGridNode];
};
export type ResolvedNode = ResolvedCardNode | ResolvedTitleNode | ResolvedStackNode | ResolvedGridNode | ResolvedDomainNode;

export type ComposableViewModel = {
  schemaVersion: 2;
  canonicalSpecSha256: string;
  state: 'ready' | 'error' | 'loading';
  generatedAt: string;
  subject: PresentationSubject;
  dependencies: Array<{ source: SourceGroup; fields: PresentationField[] }>;
  sources: Array<{
    source: SourceGroup;
    state: 'available' | 'unavailable' | 'loading';
    observedAt: string | null;
    receivedAt: string | null;
  }>;
  root: ResolvedCardNode;
};

const timestamp = z.string().datetime({ offset: true });
const provenanceSchema = z.object({
  source: z.enum(['environment', 'materials', 'status']),
  sourceObservedAt: timestamp.nullable(),
  receivedAt: timestamp.nullable(),
  detail: z.string().min(1).max(96),
}).strict();
const stateSchema = z.enum(['known', 'unknown', 'unavailable', 'loading']);
const resolvedTextValueSchema = z.object({ kind: z.literal('text'), state: stateSchema, text: z.enum(['Active', 'Idle', 'Offline']).nullable(), provenance: provenanceSchema }).strict();
const resolvedTemperatureValueSchema = z.object({ kind: z.literal('temperature'), state: stateSchema, actual: z.number().finite().min(-100).max(500).nullable(), target: z.number().finite().min(0).max(500).nullable(), unit: z.literal('celsius'), provenance: provenanceSchema }).strict();
const resolvedColorValueSchema = z.object({ kind: z.literal('color'), state: stateSchema, hex: z.string().regex(/^#[0-9A-F]{6}$/u).nullable(), provenance: provenanceSchema }).strict();
const resolvedFanRelationValueSchema = z.object({
    kind: z.literal('fanRelation'), state: stateSchema,
    primary: z.enum(['Part cooling', 'Cavity', 'Purifier']).nullable(),
    sourceLabel: z.string().trim().min(1).max(48).refine((value) => !/[<>\u0000-\u001f\u007f]/u.test(value)).nullable(),
    role: z.enum(['partCooling', 'cavity', 'purifier']).nullable(),
    reason: z.enum(['notReported', 'ambiguous', 'sourceUnavailable']).nullable(), provenance: provenanceSchema,
  }).strict();
const validateFanRelation = (value: z.infer<typeof resolvedFanRelationValueSchema>, context: z.RefinementCtx): void => {
    const expectedPrimary = value.role === 'partCooling' ? 'Part cooling' : value.role === 'cavity' ? 'Cavity' : value.role === 'purifier' ? 'Purifier' : null;
    const known = value.primary !== null && value.sourceLabel !== null && value.role !== null && value.reason === null && value.primary === expectedPrimary;
    if ((value.state === 'known') !== known) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Fan relation does not match evidence state' });
    if (value.state !== 'known' && (value.primary !== null || value.sourceLabel !== null || value.role !== null)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Non-known fan relation carries identity' });
    if (value.state === 'unknown' && !['notReported', 'ambiguous'].includes(value.reason ?? '')) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Unknown fan relation lacks bounded reason' });
    if (value.state === 'unavailable' && value.reason !== 'sourceUnavailable') context.addIssue({ code: z.ZodIssueCode.custom, message: 'Unavailable fan relation lacks bounded reason' });
    if (value.state === 'loading' && value.reason !== null) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Loading fan relation carries a reason' });
  };
export const resolvedValueSchema = z.discriminatedUnion('kind', [
  resolvedTextValueSchema,
  resolvedTemperatureValueSchema,
  resolvedColorValueSchema,
  resolvedFanRelationValueSchema,
]).superRefine((value, context) => { if (value.kind === 'fanRelation') validateFanRelation(value, context); });
const resolvedHeadStatusNodeSchema = z.object({ type: z.literal('HeadStatus'), value: resolvedTextValueSchema }).strict();
const resolvedHeadTemperatureNodeSchema = z.object({ type: z.literal('HeadTemperature'), value: resolvedTemperatureValueSchema }).strict();
const resolvedFilamentColorNodeSchema = z.object({ type: z.literal('FilamentColor'), value: resolvedColorValueSchema }).strict();
const resolvedFanRelationNodeSchema = z.object({ type: z.literal('FanRelation'), value: resolvedFanRelationValueSchema }).strict();
const resolvedPercentageFillNodeSchema = z.object({ type: z.literal('PercentageFill'), child: resolvedHeadTemperatureNodeSchema }).strict();
const resolvedDomainNodeSchema: z.ZodType<ResolvedDomainNode> = z.discriminatedUnion('type', [
  resolvedHeadStatusNodeSchema,
  resolvedHeadTemperatureNodeSchema,
  resolvedFilamentColorNodeSchema,
  resolvedFanRelationNodeSchema,
  resolvedPercentageFillNodeSchema,
]);
const resolvedTitleNodeSchema: z.ZodType<ResolvedTitleNode> = z.object({
  type: z.literal('Title'), text: z.enum(['Tool head T1', 'T1 compact status', 'T1 inspection group', 'T1 material', 'T1 status']), size: z.enum(['medium', 'large']),
}).strict();
const resolvedStackNodeSchema: z.ZodType<ResolvedStackNode> = z.object({
  type: z.literal('Stack'), gap: z.enum(['compact', 'regular', 'relaxed']), children: z.array(resolvedDomainNodeSchema).min(1).max(8),
}).strict();
const resolvedGridNodeSchema: z.ZodType<ResolvedGridNode> = z.object({
  type: z.literal('Grid'), columns: z.enum(['one', 'two']), gap: z.enum(['compact', 'regular', 'relaxed']), children: z.array(resolvedDomainNodeSchema).min(1).max(8),
}).strict();
const resolvedCardNodeSchema: z.ZodType<ResolvedCardNode> = z.object({
  type: z.literal('Card'),
  density: z.enum(['compact', 'comfortable']),
  tint: z.object({ kind: z.literal('softTint'), color: z.string().regex(/^#[0-9A-F]{6}$/u), strength: z.literal('subtle') }).strict().nullable(),
  transformEvidence: resolvedColorValueSchema.nullable(),
  children: z.tuple([resolvedTitleNodeSchema, z.union([resolvedStackNodeSchema, resolvedGridNodeSchema])]),
}).strict();
const sourceSchema = z.object({
  source: z.enum(['environment', 'materials', 'status']),
  state: z.enum(['available', 'unavailable', 'loading']),
  observedAt: timestamp.nullable(),
  receivedAt: timestamp.nullable(),
}).strict();

export const composableViewModelSchema: z.ZodType<ComposableViewModel> = z.object({
  schemaVersion: z.literal(2),
  canonicalSpecSha256: z.string().regex(/^[0-9a-f]{64}$/u),
  state: z.enum(['ready', 'error', 'loading']),
  generatedAt: timestamp,
  subject: z.object({ kind: z.literal('toolHead'), id: z.literal('T1') }).strict(),
  dependencies: z.array(z.object({
    source: z.enum(['environment', 'materials', 'status']),
    fields: z.array(z.enum(['head.status', 'head.temperature', 'filament.color', 'head.fanRelation'])).min(1).max(4),
  }).strict()).min(1).max(3),
  sources: z.array(sourceSchema).min(1).max(3),
  root: resolvedCardNodeSchema,
}).strict().superRefine((model, context) => {
  const dependencySources = model.dependencies.map(({ source }) => source);
  const sourceNames = model.sources.map(({ source }) => source);
  if (new Set(dependencySources).size !== dependencySources.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate dependency source' });
  if (new Set(sourceNames).size !== sourceNames.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate acquired source' });
  if (JSON.stringify(dependencySources) !== JSON.stringify(sourceNames)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Sources do not match dependency plan' });
  const sourceState = new Map(model.sources.map((source) => [source.source, source.state]));
  const expectedState = model.state === 'ready' ? 'available' : model.state === 'loading' ? 'loading' : null;
  if (expectedState && model.sources.some((source) => source.state !== expectedState)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Presentation state does not match sources' });
  if (model.state === 'error' && !model.sources.some((source) => source.state === 'unavailable')) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Error presentation has no unavailable source' });
  if (model.state === 'error' && model.sources.some((source) => source.state === 'loading')) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Error presentation cannot carry loading sources' });
  for (const source of model.sources) {
    if ((source.observedAt === null) !== (source.receivedAt === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Source timestamps are incomplete' });
    const timed = source.observedAt !== null && source.receivedAt !== null;
    if ((source.state === 'available') !== timed) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Source timestamps do not match availability' });
  }
  const validateValue = (value: ResolvedValue, expectedSource: SourceGroup): void => {
    if (value.provenance.source !== expectedSource) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Value provenance does not match field' });
    const expectedValueState = sourceState.get(expectedSource);
    if ((expectedValueState === 'available' && !['known', 'unknown'].includes(value.state)) || (expectedValueState === 'unavailable' && value.state !== 'unavailable') || (expectedValueState === 'loading' && value.state !== 'loading')) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Value state does not match source state' });
    }
    const timed = value.provenance.sourceObservedAt !== null && value.provenance.receivedAt !== null;
    if ((value.provenance.sourceObservedAt === null) !== (value.provenance.receivedAt === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Value timestamps are incomplete' });
    if (['known', 'unknown'].includes(value.state) !== timed) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Value timestamps do not match evidence state' });
    if (value.kind === 'text' && ((value.state === 'known') !== (value.text !== null))) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Text value does not match evidence state' });
    if (value.kind === 'temperature' && ((value.state === 'known') !== (value.actual !== null || value.target !== null))) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Temperature value does not match evidence state' });
    if (value.kind === 'color' && ((value.state === 'known') !== (value.hex !== null))) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Color value does not match evidence state' });
    if (value.kind === 'fanRelation') {
      validateFanRelation(value, context);
    }
  };
  const resolvedFields = new Map<PresentationField, ResolvedValue>();
  const visit = (node: ResolvedNode): void => {
    if ('children' in node) node.children.forEach(visit);
    if (node.type === 'PercentageFill') visit(node.child);
    if (node.type === 'Card' && node.transformEvidence) validateValue(node.transformEvidence, 'materials');
    if (!('value' in node)) return;
    const field: PresentationField = node.type === 'HeadStatus' ? 'head.status' : node.type === 'HeadTemperature' ? 'head.temperature' : node.type === 'FilamentColor' ? 'filament.color' : 'head.fanRelation';
    const expectedSource: SourceGroup = field === 'filament.color' ? 'materials' : field === 'head.fanRelation' ? 'environment' : 'status';
    validateValue(node.value, expectedSource);
    const prior = resolvedFields.get(field);
    if (prior && JSON.stringify(prior) !== JSON.stringify(node.value)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Repeated field values diverge' });
    else if (!prior) resolvedFields.set(field, node.value);
  };
  visit(model.root);
  const transformEvidence = model.root.transformEvidence;
  const visibleColor = resolvedFields.get('filament.color');
  const expectedTint = transformEvidence?.state === 'known' && transformEvidence.hex
    ? { kind: 'softTint', color: transformEvidence.hex, strength: 'subtle' }
    : null;
  if (JSON.stringify(model.root.tint) !== JSON.stringify(expectedTint)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card tint diverges from transform evidence' });
  if (transformEvidence && visibleColor && JSON.stringify(transformEvidence) !== JSON.stringify(visibleColor)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card transform evidence diverges from visible filament color' });
});

// The client needs a strict envelope check before any node reaches the renderer.
export const isComposableViewModel = (input: unknown): input is ComposableViewModel =>
  composableViewModelSchema.safeParse(input).success;
