import { z } from 'zod';
import {
  cardDensitySchema,
  elementRegistry,
  gridColumnsSchema,
  layoutGapSchema,
  registeredChildrenSchema,
  softTintSchema,
  titleContentSchema,
  titleSizeSchema,
  type TitleContent,
} from './element-registry.js';
import { presentationFieldSchema, type PresentationField } from './value-contract.js';

export { presentationFieldSchema, type PresentationField } from './value-contract.js';
export { cardDensitySchema, gridColumnsSchema, layoutGapSchema, titleContentSchema, titleSizeSchema, type TitleContent } from './element-registry.js';

export const COMPOSABLE_SPEC_VERSION = 2 as const;

export const subjectSchema = z.object({
  kind: z.literal('toolHead'),
  id: z.literal('T1'),
}).strict();
export type PresentationSubject = z.infer<typeof subjectSchema>;

const titleTextByContent = {
  subject: 'Tool head T1',
  compactStatus: 'T1 compact status',
  inspectionGroup: 'T1 inspection group',
  material: 'T1 material',
  status: 'T1 status',
} as const;
export const titleText = (content: TitleContent): typeof titleTextByContent[TitleContent] => titleTextByContent[content];

export type HeadTemperatureNode = { type: 'HeadTemperature' };
export type DomainNode =
  | { type: 'HeadStatus' }
  | HeadTemperatureNode
  | { type: 'FilamentColor' }
  | { type: 'FanRelation' };
export type StackNode = { type: 'Stack'; gap: z.infer<typeof layoutGapSchema>; children: DomainNode[] };
export type GridNode = { type: 'Grid'; columns: z.infer<typeof gridColumnsSchema>; gap: z.infer<typeof layoutGapSchema>; children: DomainNode[] };
export type TitleNode = { type: 'Title'; content: TitleContent; size: z.infer<typeof titleSizeSchema> };
export type CardNode = {
  type: 'Card';
  density: z.infer<typeof cardDensitySchema>;
  transform?: z.infer<typeof softTintSchema>;
  children: [TitleNode, StackNode | GridNode];
};
export type PresentationNode = CardNode | TitleNode | StackNode | GridNode | DomainNode;

const headStatusNodeSchema = elementRegistry.HeadStatus.specPropsSchema.extend({ type: z.literal('HeadStatus') });
const headTemperatureNodeSchema = elementRegistry.HeadTemperature.specPropsSchema.extend({ type: z.literal('HeadTemperature') });
const filamentColorNodeSchema = elementRegistry.FilamentColor.specPropsSchema.extend({ type: z.literal('FilamentColor') });
const fanRelationNodeSchema = elementRegistry.FanRelation.specPropsSchema.extend({ type: z.literal('FanRelation') });
const domainNodeSchemas = {
  HeadStatus: headStatusNodeSchema,
  HeadTemperature: headTemperatureNodeSchema,
  FilamentColor: filamentColorNodeSchema,
  FanRelation: fanRelationNodeSchema,
};
const stackNodeSchema: z.ZodType<StackNode> = elementRegistry.Stack.specPropsSchema.extend({
  type: z.literal('Stack'),
  children: registeredChildrenSchema(elementRegistry.Stack.children, domainNodeSchemas) as z.ZodType<DomainNode[]>,
});
const gridNodeSchema: z.ZodType<GridNode> = elementRegistry.Grid.specPropsSchema.extend({
  type: z.literal('Grid'),
  children: registeredChildrenSchema(elementRegistry.Grid.children, domainNodeSchemas) as z.ZodType<DomainNode[]>,
});
const titleNodeSchema: z.ZodType<TitleNode> = elementRegistry.Title.specPropsSchema.extend({
  type: z.literal('Title'),
});
const cardNodeSchema: z.ZodType<CardNode> = elementRegistry.Card.specPropsSchema.extend({
  type: z.literal('Card'),
  children: registeredChildrenSchema(elementRegistry.Card.children, {
    Title: titleNodeSchema,
    Stack: stackNodeSchema,
    Grid: gridNodeSchema,
  }) as z.ZodType<[TitleNode, StackNode | GridNode]>,
});

export const presentationSpecSchema = z.object({
  schemaVersion: z.literal(COMPOSABLE_SPEC_VERSION),
  subject: subjectSchema,
  root: cardNodeSchema,
}).strict().superRefine((spec, context) => {
  const fields = spec.root.children[1].children.map((node): PresentationField => elementRegistry[node.type].field);
  if (new Set(fields).size !== fields.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate presentation field' });
});
export type PresentationSpec = z.infer<typeof presentationSpecSchema>;

/** Parse untrusted JSON data and rebuild a canonical, strict wire object. */
export const canonicalizePresentationSpec = (input: unknown): PresentationSpec =>
  presentationSpecSchema.parse(input);
