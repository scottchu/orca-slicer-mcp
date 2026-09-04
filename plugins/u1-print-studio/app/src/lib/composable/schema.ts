import { z } from 'zod';

export const COMPOSABLE_SPEC_VERSION = 2 as const;

export const presentationFieldSchema = z.enum([
  'head.status',
  'head.temperature',
  'filament.color',
  'head.fanRelation',
]);
export type PresentationField = z.infer<typeof presentationFieldSchema>;

export const subjectSchema = z.object({
  kind: z.literal('toolHead'),
  id: z.literal('T1'),
}).strict();
export type PresentationSubject = z.infer<typeof subjectSchema>;

export const layoutGapSchema = z.enum(['compact', 'regular', 'relaxed']);
export const gridColumnsSchema = z.enum(['one', 'two']);
export const cardDensitySchema = z.enum(['compact', 'comfortable']);
export const titleSizeSchema = z.enum(['medium', 'large']);
export const titleContentSchema = z.enum(['subject', 'compactStatus', 'inspectionGroup', 'material', 'status']);
export type TitleContent = z.infer<typeof titleContentSchema>;
const titleTextByContent = {
  subject: 'Tool head T1',
  compactStatus: 'T1 compact status',
  inspectionGroup: 'T1 inspection group',
  material: 'T1 material',
  status: 'T1 status',
} as const;
export const titleText = (content: TitleContent): typeof titleTextByContent[TitleContent] => titleTextByContent[content];

const softTintSchema = z.object({
  kind: z.literal('softFilamentTint'),
  strength: z.literal('subtle'),
}).strict();

export type HeadTemperatureNode = { type: 'HeadTemperature' };
export type DomainNode =
  | { type: 'HeadStatus' }
  | HeadTemperatureNode
  | { type: 'FilamentColor' }
  | { type: 'FanRelation' }
  | { type: 'PercentageFill'; child: HeadTemperatureNode };
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

const headStatusNodeSchema = z.object({ type: z.literal('HeadStatus') }).strict();
const headTemperatureNodeSchema = z.object({ type: z.literal('HeadTemperature') }).strict();
const filamentColorNodeSchema = z.object({ type: z.literal('FilamentColor') }).strict();
const fanRelationNodeSchema = z.object({ type: z.literal('FanRelation') }).strict();
const percentageFillNodeSchema = z.object({
  type: z.literal('PercentageFill'),
  child: headTemperatureNodeSchema,
}).strict();
const domainNodeSchema = z.discriminatedUnion('type', [
  headStatusNodeSchema,
  headTemperatureNodeSchema,
  filamentColorNodeSchema,
  fanRelationNodeSchema,
  percentageFillNodeSchema,
]);
const stackNodeSchema: z.ZodType<StackNode> = z.object({
  type: z.literal('Stack'),
  gap: layoutGapSchema,
  children: z.array(domainNodeSchema).min(1).max(8),
}).strict();
const gridNodeSchema: z.ZodType<GridNode> = z.object({
  type: z.literal('Grid'),
  columns: gridColumnsSchema,
  gap: layoutGapSchema,
  children: z.array(domainNodeSchema).min(1).max(8),
}).strict();
const titleNodeSchema: z.ZodType<TitleNode> = z.object({
  type: z.literal('Title'),
  content: titleContentSchema,
  size: titleSizeSchema,
}).strict();
const cardNodeSchema: z.ZodType<CardNode> = z.object({
  type: z.literal('Card'),
  density: cardDensitySchema,
  transform: softTintSchema.optional(),
  children: z.tuple([titleNodeSchema, z.union([stackNodeSchema, gridNodeSchema])]),
}).strict();

export const presentationSpecSchema = z.object({
  schemaVersion: z.literal(COMPOSABLE_SPEC_VERSION),
  subject: subjectSchema,
  root: cardNodeSchema,
}).strict().superRefine((spec, context) => {
  const fields = spec.root.children[1].children.map((node): PresentationField => node.type === 'HeadStatus'
    ? 'head.status'
    : node.type === 'HeadTemperature' || node.type === 'PercentageFill'
      ? 'head.temperature'
      : node.type === 'FilamentColor'
        ? 'filament.color'
        : 'head.fanRelation');
  if (new Set(fields).size !== fields.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate presentation field' });
});
export type PresentationSpec = z.infer<typeof presentationSpecSchema>;

/** Parse untrusted JSON data and rebuild a canonical, strict wire object. */
export const canonicalizePresentationSpec = (input: unknown): PresentationSpec =>
  presentationSpecSchema.parse(input);
