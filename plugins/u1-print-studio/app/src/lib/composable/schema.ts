import { z } from 'zod';
import {
  cardDensitySchema,
  columnSpanSchema,
  elementRegistry,
  groupGridLayoutSchema,
  groupLayoutGapSchema,
  groupRelationSchema,
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
export { cardDensitySchema, columnSpanSchema, gridArrangementSchema, gridColumnsSchema, groupGridLayoutSchema, groupLayoutGapSchema, groupRelationSchema, inlineDistributionSchema, inlineGapSchema, layoutGapSchema, titleContentSchema, titleSizeSchema, type TitleContent } from './element-registry.js';

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
export type SummaryDomainNode =
  | { type: 'HeadTemperature'; appearance?: never }
  | { type: 'FilamentColor'; appearance?: never }
  | { type: 'FanRelation'; appearance?: never };
export type ColumnNode = {
  type: 'Column';
  colSpan: z.infer<typeof columnSpanSchema>;
  children: [SummaryDomainNode];
};
export type RowNode = { type: 'Row'; children: ColumnNode[] };
export type IdentityGroupNode = {
  type: 'Group';
  relation: 'identity';
  children: [TitleNode, HeadStatusNode];
};
export type SmartSummaryGroupNode = {
  type: 'Group';
  relation: 'summary';
  children: [SummaryDomainNode, SummaryDomainNode, SummaryDomainNode];
};
export type ExplicitSummaryGroupNode = {
  type: 'Group';
  relation: 'summary';
  layout: z.infer<typeof groupGridLayoutSchema>;
  children: RowNode[];
};
export type GroupNode = IdentityGroupNode | SmartSummaryGroupNode | ExplicitSummaryGroupNode;
export type CardNode = {
  type: 'Card';
  density: z.infer<typeof cardDensitySchema>;
  transform?: z.infer<typeof softTintSchema>;
  children: [TitleNode | InlineNode | IdentityGroupNode, StackNode | GridNode | SmartSummaryGroupNode | ExplicitSummaryGroupNode];
};
export type PresentationNode = CardNode | TitleNode | StackNode | GridNode | InlineNode | GroupNode | RowNode | ColumnNode | DomainNode;

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
const columnNodeSchema: z.ZodType<ColumnNode> = elementRegistry.Column.specPropsSchema.extend({
  type: z.literal('Column'),
  children: registeredChildrenSchema(elementRegistry.Column.children, domainNodeSchemas) as z.ZodType<ColumnNode['children']>,
});
const rowNodeSchema: z.ZodType<RowNode> = elementRegistry.Row.specPropsSchema.extend({
  type: z.literal('Row'),
  children: registeredChildrenSchema(elementRegistry.Row.children, { Column: columnNodeSchema }) as z.ZodType<RowNode['children']>,
});
const groupChildSchemas = {
  Title: titleNodeSchema,
  HeadStatus: headStatusNodeSchema,
  HeadTemperature: headTemperatureNodeSchema,
  FilamentColor: filamentColorNodeSchema,
  FanRelation: fanRelationNodeSchema,
  Row: rowNodeSchema,
};
const identityGroupNodeSchema: z.ZodType<IdentityGroupNode> = elementRegistry.Group.specPropsSchema.omit({ layout: true }).extend({
  type: z.literal('Group'), relation: z.literal('identity'),
  children: registeredChildrenSchema(elementRegistry.Group.childPolicies.identity, groupChildSchemas) as z.ZodType<IdentityGroupNode['children']>,
}).superRefine((group, context) => {
  const children = group.children as Array<TitleNode | DomainNode | RowNode>;
  if (children.length !== 2 || children[0]?.type !== 'Title' || children[1]?.type !== 'HeadStatus') {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Identity group requires Title then HeadStatus' });
  } else if (children[1].appearance !== undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Identity group status appearance is code-owned' });
  }
});
const smartSummaryGroupNodeSchema: z.ZodType<SmartSummaryGroupNode> = elementRegistry.Group.specPropsSchema.omit({ layout: true }).extend({
  type: z.literal('Group'), relation: z.literal('summary'),
  children: registeredChildrenSchema(elementRegistry.Group.childPolicies.smartSummary, groupChildSchemas) as z.ZodType<SmartSummaryGroupNode['children']>,
}).superRefine((group, context) => {
  const children = group.children as Array<SummaryDomainNode | RowNode>;
  if (children.length !== 3 || children.some((child) => child.type === 'Row')) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Smart summary requires three direct readings' });
    return;
  }
  const leaves = children as SummaryDomainNode[];
  const types = leaves.map((leaf) => leaf.type).sort();
  if (JSON.stringify(types) !== JSON.stringify(['FanRelation', 'FilamentColor', 'HeadTemperature'])) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Summary requires temperature, filament color, and fan relation exactly once' });
  }
  if (leaves.some((leaf) => leaf.appearance !== undefined)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Summary reading appearance is code-owned' });
  }
});
const explicitSummaryGroupNodeSchema: z.ZodType<ExplicitSummaryGroupNode> = elementRegistry.Group.specPropsSchema.extend({
  type: z.literal('Group'), relation: z.literal('summary'), layout: groupGridLayoutSchema,
  children: registeredChildrenSchema(elementRegistry.Group.childPolicies.explicitSummary, groupChildSchemas) as z.ZodType<ExplicitSummaryGroupNode['children']>,
}).superRefine((group, context) => {
  const children = group.children as Array<TitleNode | DomainNode | RowNode>;
  if (children.length < 1 || children.length > 6 || children.some((child) => child.type !== 'Row')) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Explicit summary requires one to six rows' });
    return;
  }
  const leaves: SummaryDomainNode[] = [];
  for (const row of children as RowNode[]) {
    const sum = row.children.reduce((total: number, column: ColumnNode) => total + column.colSpan, 0);
    if (sum !== 6) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Every explicit row must fill exactly six tracks' });
    for (const column of row.children) leaves.push(column.children[0]);
  }
  const types = leaves.map((leaf) => leaf.type).sort();
  if (JSON.stringify(types) !== JSON.stringify(['FanRelation', 'FilamentColor', 'HeadTemperature'])) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Summary requires temperature, filament color, and fan relation exactly once' });
  }
  if (leaves.some((leaf) => leaf.appearance !== undefined)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Summary reading appearance is code-owned' });
  }
});
const groupNodeSchema: z.ZodType<GroupNode> = z.union([
  identityGroupNodeSchema,
  smartSummaryGroupNodeSchema,
  explicitSummaryGroupNodeSchema,
]);
const cardNodeSchema: z.ZodType<CardNode> = elementRegistry.Card.specPropsSchema.extend({
  type: z.literal('Card'),
  children: registeredChildrenSchema(elementRegistry.Card.children, {
    Title: titleNodeSchema,
    Inline: inlineNodeSchema,
    Group: groupNodeSchema,
    Stack: stackNodeSchema,
    Grid: gridNodeSchema,
  }) as z.ZodType<CardNode['children']>,
}).superRefine((card, context) => {
  const header = card.children[0];
  const body = card.children[1];
  const usesGroup = header.type === 'Group' || body.type === 'Group';
  if (usesGroup && (header.type !== 'Group' || header.relation !== 'identity' || body.type !== 'Group' || body.relation !== 'summary')) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Grouped cards require identity header and summary body' });
  }
  if (usesGroup && (card.density !== 'compact' || card.transform !== undefined)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Grouped cards require the neutral compact surface' });
  }
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
  if (body.type === 'Group') return;
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
