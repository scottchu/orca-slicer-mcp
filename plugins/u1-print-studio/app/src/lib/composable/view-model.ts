import { z } from 'zod';
import { elementRegistry, registeredChildrenSchema } from './element-registry.js';
import type { PresentationSubject } from './schema.js';
import {
  presentationFieldSchema,
  resolvedColorValueSchema,
  resolvedFanRelationValueSchema,
  resolvedTemperatureValueSchema,
  resolvedTextValueSchema,
  resolvedValueSchema,
  sourceGroupSchema,
  validateFanRelation,
  type PresentationField,
  type ResolvedColorValue,
  type ResolvedFanRelationValue,
  type ResolvedTemperatureValue,
  type ResolvedTextValue,
  type ResolvedValue,
  type SourceGroup,
  type ValueEvidenceState,
  type ValueProvenance,
} from './value-contract.js';

export {
  resolvedValueSchema,
  type ResolvedColorValue,
  type ResolvedFanRelationValue,
  type ResolvedTemperatureValue,
  type ResolvedTextValue,
  type ResolvedValue,
  type ValueEvidenceState,
  type ValueProvenance,
} from './value-contract.js';

export type ResolvedDomainNode =
  | { type: 'HeadStatus'; value: ResolvedTextValue }
  | { type: 'HeadTemperature'; value: ResolvedTemperatureValue }
  | { type: 'FilamentColor'; value: ResolvedColorValue }
  | { type: 'FanRelation'; value: ResolvedFanRelationValue };
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
const resolvedHeadStatusNodeSchema = elementRegistry.HeadStatus.resolvedPropsSchema.extend({ type: z.literal('HeadStatus') });
const resolvedHeadTemperatureNodeSchema = elementRegistry.HeadTemperature.resolvedPropsSchema.extend({ type: z.literal('HeadTemperature') });
const resolvedFilamentColorNodeSchema = elementRegistry.FilamentColor.resolvedPropsSchema.extend({ type: z.literal('FilamentColor') });
const resolvedFanRelationNodeSchema = elementRegistry.FanRelation.resolvedPropsSchema.extend({ type: z.literal('FanRelation') });
const resolvedDomainNodeSchemas = {
  HeadStatus: resolvedHeadStatusNodeSchema,
  HeadTemperature: resolvedHeadTemperatureNodeSchema,
  FilamentColor: resolvedFilamentColorNodeSchema,
  FanRelation: resolvedFanRelationNodeSchema,
};
const resolvedTitleNodeSchema: z.ZodType<ResolvedTitleNode> = elementRegistry.Title.resolvedPropsSchema.extend({
  type: z.literal('Title'),
});
const resolvedStackNodeSchema: z.ZodType<ResolvedStackNode> = elementRegistry.Stack.resolvedPropsSchema.extend({
  type: z.literal('Stack'),
  children: registeredChildrenSchema(elementRegistry.Stack.children, resolvedDomainNodeSchemas) as z.ZodType<ResolvedDomainNode[]>,
});
const resolvedGridNodeSchema: z.ZodType<ResolvedGridNode> = elementRegistry.Grid.resolvedPropsSchema.extend({
  type: z.literal('Grid'),
  children: registeredChildrenSchema(elementRegistry.Grid.children, resolvedDomainNodeSchemas) as z.ZodType<ResolvedDomainNode[]>,
});
const resolvedCardNodeSchema: z.ZodType<ResolvedCardNode> = elementRegistry.Card.resolvedPropsSchema.extend({
  type: z.literal('Card'),
  children: registeredChildrenSchema(elementRegistry.Card.children, {
    Title: resolvedTitleNodeSchema,
    Stack: resolvedStackNodeSchema,
    Grid: resolvedGridNodeSchema,
  }) as z.ZodType<[ResolvedTitleNode, ResolvedStackNode | ResolvedGridNode]>,
});
const sourceSchema = z.object({
  source: sourceGroupSchema,
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
    source: sourceGroupSchema,
    fields: z.array(presentationFieldSchema).min(1).max(4),
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
    if (node.type === 'Card' && node.transformEvidence) validateValue(node.transformEvidence, 'materials');
    if (!('value' in node)) return;
    const definition = elementRegistry[node.type];
    const field = definition.field;
    const expectedSource = definition.source;
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
