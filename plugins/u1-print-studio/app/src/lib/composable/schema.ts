import { z } from 'zod';
import {
  cardDensitySchema,
  elementRegistry,
  gridArrangementSchema,
  gridColumnsSchema,
  inlineDistributionSchema,
  inlineGapSchema,
  layoutGapSchema,
  registeredChildrenSchema,
  softTintSchema,
  titleContentSchema,
  titleSizeSchema,
  type TitleContent,
} from './element-registry.js';
import { presentationFieldSchema, type PresentationField } from './value-contract.js';

export { presentationFieldSchema, type PresentationField } from './value-contract.js';
export { cardDensitySchema, gridArrangementSchema, gridColumnsSchema, inlineDistributionSchema, inlineGapSchema, layoutGapSchema, titleContentSchema, titleSizeSchema, type TitleContent } from './element-registry.js';

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

export type HeadStatusNode = { type: 'HeadStatus'; appearance?: 'headerBadge' };
export type HeadTemperatureNode = { type: 'HeadTemperature'; appearance?: 'hero' };
export type DomainNode =
  | HeadStatusNode
  | HeadTemperatureNode
  | { type: 'FilamentColor'; appearance?: 'quiet' }
  | { type: 'FanRelation'; appearance?: 'quiet' };
export type StackNode = { type: 'Stack'; gap: z.infer<typeof layoutGapSchema>; children: DomainNode[] };
export type GridNode = { type: 'Grid'; columns: z.infer<typeof gridColumnsSchema>; gap: z.infer<typeof layoutGapSchema>; arrangement?: z.infer<typeof gridArrangementSchema>; children: DomainNode[] };
export type TitleNode = { type: 'Title'; content: TitleContent; size: z.infer<typeof titleSizeSchema> };
export type InlineNode = {
  type: 'Inline';
  gap: z.infer<typeof inlineGapSchema>;
  distribution: z.infer<typeof inlineDistributionSchema>;
  children: [TitleNode, HeadStatusNode];
};
export type CardNode = {
  type: 'Card';
  density: z.infer<typeof cardDensitySchema>;
  transform?: z.infer<typeof softTintSchema>;
  children: [TitleNode | InlineNode, StackNode | GridNode];
};
export type PresentationNode = CardNode | TitleNode | StackNode | GridNode | InlineNode | DomainNode;

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
const inlineNodeSchema: z.ZodType<InlineNode> = elementRegistry.Inline.specPropsSchema.extend({
  type: z.literal('Inline'),
  children: registeredChildrenSchema(elementRegistry.Inline.children, {
    Title: titleNodeSchema,
    HeadStatus: headStatusNodeSchema,
  }) as z.ZodType<[TitleNode, HeadStatusNode]>,
});
const cardNodeSchema: z.ZodType<CardNode> = elementRegistry.Card.specPropsSchema.extend({
  type: z.literal('Card'),
  children: registeredChildrenSchema(elementRegistry.Card.children, {
    Title: titleNodeSchema,
    Inline: inlineNodeSchema,
    Stack: stackNodeSchema,
    Grid: gridNodeSchema,
  }) as z.ZodType<CardNode['children']>,
});

export const presentationSpecSchema = z.object({
  schemaVersion: z.literal(COMPOSABLE_SPEC_VERSION),
  subject: subjectSchema,
  root: cardNodeSchema,
}).strict().superRefine((spec, context) => {
  const fields: PresentationField[] = [];
  const visit = (node: PresentationNode): void => {
    const field = elementRegistry[node.type].field;
    if (field) fields.push(field);
    if ('children' in node) node.children.forEach(visit);
  };
  visit(spec.root);
  if (new Set(fields).size !== fields.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate presentation field' });
  const header = spec.root.children[0];
  if (header.type === 'Inline' && header.children[1].appearance !== 'headerBadge') {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Inline status requires headerBadge appearance' });
  }
  const body = spec.root.children[1];
  body.children.forEach((node, index) => {
    if (node.type === 'HeadStatus' && node.appearance === 'headerBadge') context.addIssue({ code: z.ZodIssueCode.custom, message: 'headerBadge is valid only in Inline' });
    if (node.type === 'HeadTemperature' && node.appearance === 'hero' && (body.type !== 'Grid' || body.arrangement !== 'lead' || index !== 0)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'hero temperature requires the lead Grid position' });
    if ((node.type === 'FilamentColor' || node.type === 'FanRelation') && node.appearance === 'quiet' && (body.type !== 'Grid' || body.arrangement !== 'lead' || index === 0)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'quiet appearance requires a secondary lead Grid position' });
  });
  if (body.type === 'Grid' && body.arrangement === 'lead') {
    const lead = body.children[0];
    if (lead?.type !== 'HeadTemperature' || lead.appearance !== 'hero') context.addIssue({ code: z.ZodIssueCode.custom, message: 'lead Grid requires a hero temperature first' });
  }
});
export type PresentationSpec = z.infer<typeof presentationSpecSchema>;

/** Parse untrusted JSON data and rebuild a canonical, strict wire object. */
export const canonicalizePresentationSpec = (input: unknown): PresentationSpec =>
  presentationSpecSchema.parse(input);
