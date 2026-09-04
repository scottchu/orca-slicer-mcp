import { z } from 'zod';
import { canonicalPresentationSha256 } from './hash.js';
import { derivePresentationPlan, type SourceGroup } from './planner.js';
import { presentationSpecSchema, titleText, type PresentationNode, type PresentationSpec } from './schema.js';
import { composableViewModelSchema, type ComposableViewModel, type ResolvedNode } from './view-model.js';

export type ComposableEnvelope = {
  canonicalSpec: PresentationSpec;
  canonicalSpecSha256: string;
  viewModel: ComposableViewModel;
};

const expectedSource = (node: PresentationNode): SourceGroup | null => node.type === 'HeadStatus' || node.type === 'HeadTemperature'
  ? 'status'
  : node.type === 'FilamentColor'
    ? 'materials'
    : node.type === 'FanRelation'
      ? 'environment'
      : null;

const correlateNode = (
  spec: PresentationNode,
  resolved: ResolvedNode,
  sources: Map<SourceGroup, ComposableViewModel['sources'][number]>,
  context: z.RefinementCtx,
): void => {
  if (spec.type !== resolved.type) { context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved topology diverges from specification' }); return; }
  if (spec.type === 'Title' && resolved.type === 'Title' && (titleText(spec.content) !== resolved.text || spec.size !== resolved.size)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved title diverges from specification' });
  if (spec.type === 'Card' && resolved.type === 'Card') {
    if (spec.density !== resolved.density) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved card density diverges from specification' });
    if (!spec.transform && (resolved.tint !== null || resolved.transformEvidence !== null)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card without transform carries tint evidence' });
    if (spec.transform) {
      const source = sources.get('materials');
      const evidence = resolved.transformEvidence;
      if (!source || !evidence) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card transform lacks material evidence' });
      else {
        if (evidence.provenance.source !== 'materials' || evidence.provenance.sourceObservedAt !== source.observedAt || evidence.provenance.receivedAt !== source.receivedAt) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card transform evidence diverges from material receipt' });
        const expectedTint = evidence.state === 'known' && evidence.hex ? { kind: 'softTint', color: evidence.hex, strength: 'subtle' } : null;
        if (JSON.stringify(resolved.tint) !== JSON.stringify(expectedTint)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Card tint diverges from configured filament color' });
      }
    }
  }
  if (spec.type === 'Stack' && resolved.type === 'Stack' && spec.gap !== resolved.gap) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved stack tokens diverge from specification' });
  if (spec.type === 'Grid' && resolved.type === 'Grid' && (spec.gap !== resolved.gap || spec.columns !== resolved.columns)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved grid tokens diverge from specification' });
  if ('children' in spec && 'children' in resolved) {
    if (spec.children.length !== resolved.children.length) { context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved child count diverges from specification' }); return; }
    spec.children.forEach((child, index) => correlateNode(child, resolved.children[index], sources, context));
  }
  if (spec.type === 'PercentageFill' && resolved.type === 'PercentageFill') correlateNode(spec.child, resolved.child, sources, context);
  const sourceName = expectedSource(spec);
  if (!sourceName || !('value' in resolved)) return;
  const source = sources.get(sourceName);
  if (!source) { context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved value lacks source receipt' }); return; }
  if (resolved.value.provenance.source !== sourceName || resolved.value.provenance.sourceObservedAt !== source.observedAt || resolved.value.provenance.receivedAt !== source.receivedAt) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved provenance diverges from source receipt' });
  }
};

export const composableEnvelopeWireSchema = z.object({
  canonicalSpec: presentationSpecSchema,
  canonicalSpecSha256: z.string().regex(/^[0-9a-f]{64}$/u),
  viewModel: composableViewModelSchema,
}).strict();

export const composableEnvelopeSchema: z.ZodType<ComposableEnvelope> = composableEnvelopeWireSchema.superRefine((envelope, context) => {
  const hash = canonicalPresentationSha256(envelope.canonicalSpec);
  if (envelope.canonicalSpecSha256 !== hash || envelope.viewModel.canonicalSpecSha256 !== hash) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Composition hash correlation failed' });
  if (JSON.stringify(envelope.viewModel.subject) !== JSON.stringify(envelope.canonicalSpec.subject)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Composition subject correlation failed' });
  const plan = derivePresentationPlan(envelope.canonicalSpec);
  if (JSON.stringify(envelope.viewModel.dependencies) !== JSON.stringify(plan.dependencies)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Composition plan correlation failed' });
  const sources = new Map(envelope.viewModel.sources.map((source) => [source.source, source]));
  correlateNode(envelope.canonicalSpec.root, envelope.viewModel.root, sources, context);
});

export const isComposableEnvelope = (input: unknown): input is ComposableEnvelope => composableEnvelopeSchema.safeParse(input).success;
