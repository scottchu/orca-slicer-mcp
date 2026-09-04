import { z } from 'zod';
import {
  resolvedColorValueSchema,
  resolvedFanRelationValueSchema,
  resolvedTemperatureValueSchema,
  resolvedTextValueSchema,
  type PresentationField,
  type SourceGroup,
} from './value-contract.js';

export const PRESENTATION_ELEMENT_TYPES = [
  'Card', 'Title', 'Stack', 'Grid',
  'HeadStatus', 'HeadTemperature', 'FilamentColor', 'FanRelation',
] as const;
export type PresentationElementType = (typeof PRESENTATION_ELEMENT_TYPES)[number];
export type PresentationElementRole = 'root' | 'title' | 'layout' | 'domain';

export const layoutGapSchema = z.enum(['compact', 'regular', 'relaxed']);
export const gridColumnsSchema = z.enum(['one', 'two']);
export const cardDensitySchema = z.enum(['compact', 'comfortable']);
export const titleSizeSchema = z.enum(['medium', 'large']);
export const titleContentSchema = z.enum(['subject', 'compactStatus', 'inspectionGroup', 'material', 'status']);
export type TitleContent = z.infer<typeof titleContentSchema>;
export const softTintSchema = z.object({
  kind: z.literal('softFilamentTint'),
  strength: z.literal('subtle'),
}).strict();
export const resolvedSoftTintSchema = z.object({
  kind: z.literal('softTint'),
  color: z.string().regex(/^#[0-9A-F]{6}$/u),
  strength: z.literal('subtle'),
}).strict();

const none = { kind: 'none' } as const;
const domainChildren = { kind: 'array', allowed: ['HeadStatus', 'HeadTemperature', 'FilamentColor', 'FanRelation'], min: 1, max: 8 } as const;
export type ChildPolicy =
  | { kind: 'none' }
  | { kind: 'array'; allowed: readonly PresentationElementType[]; min: number; max: number }
  | { kind: 'tuple'; positions: readonly (readonly PresentationElementType[])[] };

type ElementDefinition = {
  type: PresentationElementType;
  role: PresentationElementRole;
  field: PresentationField | null;
  source: SourceGroup | null;
  specPropsSchema: z.AnyZodObject;
  resolvedPropsSchema: z.AnyZodObject;
  children: ChildPolicy;
};

/**
 * Closed build-time vocabulary. This module has no Svelte, I/O, reader, or
 * registration side effects; untrusted JSON can select only these definitions.
 */
export const elementRegistry = {
  Card: {
    type: 'Card', role: 'root', field: null, source: null,
    specPropsSchema: z.object({ density: cardDensitySchema, transform: softTintSchema.optional() }).strict(),
    resolvedPropsSchema: z.object({
      density: cardDensitySchema,
      tint: resolvedSoftTintSchema.nullable(),
      transformEvidence: resolvedColorValueSchema.nullable(),
    }).strict(),
    children: { kind: 'tuple', positions: [['Title'], ['Stack', 'Grid']] },
  },
  Title: {
    type: 'Title', role: 'title', field: null, source: null,
    specPropsSchema: z.object({ content: titleContentSchema, size: titleSizeSchema }).strict(),
    resolvedPropsSchema: z.object({
      text: z.enum(['Tool head T1', 'T1 compact status', 'T1 inspection group', 'T1 material', 'T1 status']),
      size: titleSizeSchema,
    }).strict(),
    children: none,
  },
  Stack: {
    type: 'Stack', role: 'layout', field: null, source: null,
    specPropsSchema: z.object({ gap: layoutGapSchema }).strict(),
    resolvedPropsSchema: z.object({ gap: layoutGapSchema }).strict(),
    children: domainChildren,
  },
  Grid: {
    type: 'Grid', role: 'layout', field: null, source: null,
    specPropsSchema: z.object({ columns: gridColumnsSchema, gap: layoutGapSchema }).strict(),
    resolvedPropsSchema: z.object({ columns: gridColumnsSchema, gap: layoutGapSchema }).strict(),
    children: domainChildren,
  },
  HeadStatus: {
    type: 'HeadStatus', role: 'domain', field: 'head.status', source: 'status',
    specPropsSchema: z.object({}).strict(),
    resolvedPropsSchema: z.object({ value: resolvedTextValueSchema }).strict(),
    children: none,
  },
  HeadTemperature: {
    type: 'HeadTemperature', role: 'domain', field: 'head.temperature', source: 'status',
    specPropsSchema: z.object({}).strict(),
    resolvedPropsSchema: z.object({ value: resolvedTemperatureValueSchema }).strict(),
    children: none,
  },
  FilamentColor: {
    type: 'FilamentColor', role: 'domain', field: 'filament.color', source: 'materials',
    specPropsSchema: z.object({}).strict(),
    resolvedPropsSchema: z.object({ value: resolvedColorValueSchema }).strict(),
    children: none,
  },
  FanRelation: {
    type: 'FanRelation', role: 'domain', field: 'head.fanRelation', source: 'environment',
    specPropsSchema: z.object({}).strict(),
    resolvedPropsSchema: z.object({ value: resolvedFanRelationValueSchema }).strict(),
    children: none,
  },
} as const satisfies Record<PresentationElementType, ElementDefinition>;

export const registeredElementTypes = (): PresentationElementType[] => Object.keys(elementRegistry) as PresentationElementType[];

const unionForRegisteredTypes = (
  allowed: readonly PresentationElementType[],
  schemas: Partial<Record<PresentationElementType, z.ZodTypeAny>>,
): z.ZodTypeAny => {
  const selected = allowed.map((type) => {
    const schema = schemas[type];
    if (!schema) throw new Error(`Missing registered child schema for ${type}`);
    return schema;
  });
  if (selected.length === 1) return selected[0];
  if (selected.length < 1) throw new Error('Registered child policy must allow at least one type');
  return z.union(selected as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
};

/** Build the accepted child structure directly from one registered policy. */
export const registeredChildrenSchema = (
  policy: ChildPolicy,
  schemas: Partial<Record<PresentationElementType, z.ZodTypeAny>>,
): z.ZodTypeAny => {
  if (policy.kind === 'none') throw new Error('Leaf elements cannot accept children');
  if (policy.kind === 'array') {
    return z.array(unionForRegisteredTypes(policy.allowed, schemas)).min(policy.min).max(policy.max);
  }
  return z.tuple(policy.positions.map((allowed) => unionForRegisteredTypes(allowed, schemas)) as [z.ZodTypeAny, ...z.ZodTypeAny[]]);
};

export const sourceForPresentationField = (field: PresentationField): SourceGroup => {
  const sources = Object.values(elementRegistry)
    .filter((definition) => definition.field === field)
    .map((definition) => definition.source)
    .filter((source): source is SourceGroup => source !== null);
  if (sources.length !== 1) throw new Error(`Presentation field ${field} must have exactly one registered source`);
  return sources[0];
};
