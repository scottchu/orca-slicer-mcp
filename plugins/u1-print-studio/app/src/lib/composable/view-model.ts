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

export type ResolvedNode =
  | { type: 'Card'; tint: { kind: 'softTint'; color: string; strength: 'subtle' } | null; transformEvidence: ResolvedColorValue | null; children: ResolvedNode[] }
  | { type: 'Title'; text: string }
  | { type: 'Table'; children: ResolvedNode[] }
  | { type: 'Row'; children: ResolvedNode[] }
  | { type: 'HeadStatus'; value: ResolvedTextValue }
  | { type: 'HeadTemperature'; value: ResolvedTemperatureValue }
  | { type: 'FilamentColor'; value: ResolvedColorValue }
  | { type: 'FanRelation'; value: ResolvedFanRelationValue };

export type ComposableViewModel = {
  schemaVersion: 1;
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
  root: ResolvedNode;
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
const resolvedNodeSchema: z.ZodType<ResolvedNode> = z.lazy(() => z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Card'),
    tint: z.object({ kind: z.literal('softTint'), color: z.string().regex(/^#[0-9A-F]{6}$/u), strength: z.literal('subtle') }).strict().nullable(),
    transformEvidence: resolvedColorValueSchema.nullable(),
    children: z.array(resolvedNodeSchema).min(1).max(24),
  }).strict(),
  z.object({ type: z.literal('Title'), text: z.string().min(1).max(80) }).strict(),
  z.object({ type: z.literal('Table'), children: z.array(resolvedNodeSchema).min(1).max(12) }).strict(),
  z.object({ type: z.literal('Row'), children: z.array(resolvedNodeSchema).min(1).max(6) }).strict(),
  z.object({ type: z.literal('HeadStatus'), value: resolvedTextValueSchema }).strict(),
  z.object({ type: z.literal('HeadTemperature'), value: resolvedTemperatureValueSchema }).strict(),
  z.object({ type: z.literal('FilamentColor'), value: resolvedColorValueSchema }).strict(),
  z.object({ type: z.literal('FanRelation'), value: resolvedFanRelationValueSchema }).strict(),
]));
const sourceSchema = z.object({
  source: z.enum(['environment', 'materials', 'status']),
  state: z.enum(['available', 'unavailable', 'loading']),
  observedAt: timestamp.nullable(),
  receivedAt: timestamp.nullable(),
}).strict();

export const composableViewModelSchema: z.ZodType<ComposableViewModel> = z.object({
  schemaVersion: z.literal(1),
  canonicalSpecSha256: z.string().regex(/^[0-9a-f]{64}$/u),
  state: z.enum(['ready', 'error', 'loading']),
  generatedAt: timestamp,
  subject: z.object({ kind: z.literal('toolHead'), id: z.literal('T1') }).strict(),
  dependencies: z.array(z.object({
    source: z.enum(['environment', 'materials', 'status']),
    fields: z.array(z.enum(['head.status', 'head.temperature', 'filament.color', 'head.fanRelation'])).min(1).max(4),
  }).strict()).min(1).max(3),
  sources: z.array(sourceSchema).min(1).max(3),
  root: resolvedNodeSchema,
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
  const visit = (node: ResolvedNode): void => {
    if ('children' in node) node.children.forEach(visit);
    if (node.type === 'Card' && node.transformEvidence) validateValue(node.transformEvidence, 'materials');
    if (!('value' in node)) return;
    const field: PresentationField = node.type === 'HeadStatus' ? 'head.status' : node.type === 'HeadTemperature' ? 'head.temperature' : node.type === 'FilamentColor' ? 'filament.color' : 'head.fanRelation';
    const expectedSource: SourceGroup = field === 'filament.color' ? 'materials' : field === 'head.fanRelation' ? 'environment' : 'status';
    validateValue(node.value, expectedSource);
  };
  visit(model.root);
});

// The client needs a strict envelope check before any node reaches the renderer.
export const isComposableViewModel = (input: unknown): input is ComposableViewModel =>
  composableViewModelSchema.safeParse(input).success;
