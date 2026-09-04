import { z } from 'zod';

export const SOURCE_GROUPS = ['environment', 'materials', 'status'] as const;
export const sourceGroupSchema = z.enum(SOURCE_GROUPS);
export type SourceGroup = z.infer<typeof sourceGroupSchema>;

export const PRESENTATION_FIELDS = [
  'head.status',
  'head.temperature',
  'filament.color',
  'head.fanRelation',
] as const;
export const presentationFieldSchema = z.enum(PRESENTATION_FIELDS);
export type PresentationField = z.infer<typeof presentationFieldSchema>;

export type ValueEvidenceState = 'known' | 'unknown' | 'unavailable' | 'loading';
export type ValueProvenance = {
  source: SourceGroup;
  sourceObservedAt: string | null;
  receivedAt: string | null;
  detail: string;
};

const timestamp = z.string().datetime({ offset: true });
export const provenanceSchema = z.object({
  source: sourceGroupSchema,
  sourceObservedAt: timestamp.nullable(),
  receivedAt: timestamp.nullable(),
  detail: z.string().min(1).max(96),
}).strict();
export const valueEvidenceStateSchema = z.enum(['known', 'unknown', 'unavailable', 'loading']);
export const resolvedTextValueSchema = z.object({
  kind: z.literal('text'), state: valueEvidenceStateSchema,
  text: z.enum(['Active', 'Idle', 'Offline']).nullable(), provenance: provenanceSchema,
}).strict();
export const resolvedTemperatureValueSchema = z.object({
  kind: z.literal('temperature'), state: valueEvidenceStateSchema,
  actual: z.number().finite().min(-100).max(500).nullable(),
  target: z.number().finite().min(0).max(500).nullable(),
  unit: z.literal('celsius'), provenance: provenanceSchema,
}).strict();
export const resolvedColorValueSchema = z.object({
  kind: z.literal('color'), state: valueEvidenceStateSchema,
  hex: z.string().regex(/^#[0-9A-F]{6}$/u).nullable(), provenance: provenanceSchema,
}).strict();
export const resolvedFanRelationValueSchema = z.object({
  kind: z.literal('fanRelation'), state: valueEvidenceStateSchema,
  primary: z.enum(['Part cooling', 'Cavity', 'Purifier']).nullable(),
  sourceLabel: z.string().trim().min(1).max(48).refine((value) => !/[<>\u0000-\u001f\u007f]/u.test(value)).nullable(),
  role: z.enum(['partCooling', 'cavity', 'purifier']).nullable(),
  reason: z.enum(['notReported', 'ambiguous', 'sourceUnavailable']).nullable(),
  provenance: provenanceSchema,
}).strict();

export type ResolvedTextValue = z.infer<typeof resolvedTextValueSchema>;
export type ResolvedTemperatureValue = z.infer<typeof resolvedTemperatureValueSchema>;
export type ResolvedColorValue = z.infer<typeof resolvedColorValueSchema>;
export type ResolvedFanRelationValue = z.infer<typeof resolvedFanRelationValueSchema>;
export type ResolvedValue = ResolvedTextValue | ResolvedTemperatureValue | ResolvedColorValue | ResolvedFanRelationValue;

export const validateFanRelation = (value: ResolvedFanRelationValue, context: z.RefinementCtx): void => {
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
