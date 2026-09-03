import { z } from 'zod';

export const COMPOSABLE_SPEC_VERSION = 1 as const;

const safeLabel = z.string().trim().min(1).max(80).refine(
  (value) => !/[<>\u0000-\u001f\u007f]/u.test(value),
  'Labels cannot contain markup or control characters',
);

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

const softTintSchema = z.object({
  kind: z.literal('softFilamentTint'),
  strength: z.literal('subtle'),
}).strict();

export type PresentationNode =
  | { type: 'Card'; transform?: z.infer<typeof softTintSchema>; children: PresentationNode[] }
  | { type: 'Title'; text: string }
  | { type: 'Table'; children: PresentationNode[] }
  | { type: 'Row'; children: PresentationNode[] }
  | { type: 'HeadStatus' }
  | { type: 'HeadTemperature' }
  | { type: 'FilamentColor' }
  | { type: 'FanRelation' };

const nodeSchema: z.ZodType<PresentationNode> = z.lazy(() => z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Card'),
    transform: softTintSchema.optional(),
    children: z.array(nodeSchema).min(1).max(24),
  }).strict(),
  z.object({ type: z.literal('Title'), text: safeLabel }).strict(),
  z.object({ type: z.literal('Table'), children: z.array(nodeSchema).min(1).max(12) }).strict(),
  z.object({ type: z.literal('Row'), children: z.array(nodeSchema).min(1).max(6) }).strict(),
  z.object({ type: z.literal('HeadStatus') }).strict(),
  z.object({ type: z.literal('HeadTemperature') }).strict(),
  z.object({ type: z.literal('FilamentColor') }).strict(),
  z.object({ type: z.literal('FanRelation') }).strict(),
]));

export const presentationSpecSchema = z.object({
  schemaVersion: z.literal(COMPOSABLE_SPEC_VERSION),
  subject: subjectSchema,
  root: nodeSchema,
}).strict().superRefine((spec, context) => {
  let nodes = 0;
  const visit = (node: PresentationNode, depth: number): void => {
    nodes += 1;
    if (depth > 6) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Composition depth exceeds 6' });
    if ('children' in node) node.children.forEach((child) => visit(child, depth + 1));
  };
  visit(spec.root, 1);
  if (nodes > 48) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Composition exceeds 48 nodes' });
});
export type PresentationSpec = z.infer<typeof presentationSpecSchema>;

/** Parse untrusted JSON data and rebuild a canonical, strict wire object. */
export const canonicalizePresentationSpec = (input: unknown): PresentationSpec =>
  presentationSpecSchema.parse(input);
