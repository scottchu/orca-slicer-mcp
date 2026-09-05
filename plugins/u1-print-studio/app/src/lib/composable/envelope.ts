import { z } from 'zod';
import { canonicalPresentationSha256 } from './hash.js';
import { derivePresentationPlan, type SourceGroup } from './planner.js';
import { elementRegistry } from './element-registry.js';
import { presentationSpecSchema, titleText, type PresentationNode, type PresentationSpec } from './schema.js';
import { composableViewModelSchema, type ComposableViewModel, type ResolvedNode } from './view-model.js';

export type ComposableEnvelope = {
  canonicalSpec: PresentationSpec;
  canonicalSpecSha256: string;
  viewModel: ComposableViewModel;
};

const expectedSource = (node: PresentationNode): SourceGroup | null => elementRegistry[node.type].source;

const correlateNode = (
  spec: PresentationNode,
  resolved: ResolvedNode,
  sources: Map<SourceGroup, ComposableViewModel['sources'][number]>,
  context: z.RefinementCtx,
  groupedAppearance?: 'headerBadge' | 'hero' | 'quiet',
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
  if (spec.type === 'Grid' && resolved.type === 'Grid' && (spec.gap !== resolved.gap || spec.columns !== resolved.columns || (spec.arrangement ?? 'uniform') !== resolved.arrangement)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved grid tokens diverge from specification' });
  if (spec.type === 'Inline' && resolved.type === 'Inline' && (spec.gap !== resolved.gap || spec.distribution !== resolved.distribution)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved inline tokens diverge from specification' });
  if (spec.type === 'Group' && resolved.type === 'Group') {
    if (spec.relation !== resolved.relation) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved group relation diverges from specification' });
    if (spec.relation === 'identity' && resolved.relation === 'identity') {
      if (resolved.layoutSource !== 'smart' || resolved.defaultRule !== 'identity-packed-v1' || resolved.tracks !== null || resolved.rowGap !== 'regular' || resolved.columnGap !== 'regular') {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved identity policy diverges' });
      }
      correlateNode(spec.children[0], resolved.children[0], sources, context);
      correlateNode(spec.children[1], resolved.children[1], sources, context, 'headerBadge');
      return;
    }
    if (spec.relation === 'summary' && resolved.relation === 'summary') {
      const explicitLayout = 'layout' in spec ? spec.layout : null;
      const expectedSource = explicitLayout ? 'explicit' : 'smart';
      const expectedRowGap = explicitLayout?.rowGap ?? 'regular';
      const expectedColumnGap = explicitLayout?.columnGap ?? 'regular';
      if (resolved.layoutSource !== expectedSource || resolved.defaultRule !== 'summary-grid6-v1' || resolved.tracks !== 6 || resolved.rowGap !== expectedRowGap || resolved.columnGap !== expectedColumnGap) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved summary policy diverges' });
      }
      const resolvedSpans = resolved.children.map((row) => row.children.map((column) => column.colSpan));
      const expectedSpans = explicitLayout
        ? spec.children.map((row) => row.type === 'Row' ? row.children.map((column) => column.colSpan) : [])
        : [[6], [3, 3]];
      if (JSON.stringify(resolvedSpans) !== JSON.stringify(expectedSpans)
        || resolved.children.some((row) => row.columnGap !== expectedColumnGap || row.collapse !== 'intrinsic')) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved summary rows diverge from placement policy' });
      }
      const resolvedLeaves = resolved.children.flatMap((row) => row.children.map((column) => column.children[0]));
      const specLeaves = explicitLayout
        ? spec.children.flatMap((row) => row.type === 'Row' ? row.children.map((column) => column.children[0]) : [])
        : [...spec.children].sort((left, right) => {
            const rank = { HeadTemperature: 0, FilamentColor: 1, FanRelation: 2 } as const;
            return rank[left.type as keyof typeof rank] - rank[right.type as keyof typeof rank];
          });
      if (specLeaves.length !== resolvedLeaves.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved summary member count diverges' });
      specLeaves.forEach((leaf, index) => correlateNode(leaf, resolvedLeaves[index], sources, context, leaf.type === 'HeadTemperature' ? 'hero' : 'quiet'));
      return;
    }
  }
  if (spec.type === 'HeadStatus' && resolved.type === 'HeadStatus' && (groupedAppearance ?? spec.appearance ?? 'default') !== resolved.appearance) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved status appearance diverges from specification' });
  if (spec.type === 'HeadTemperature' && resolved.type === 'HeadTemperature' && (groupedAppearance ?? spec.appearance ?? 'default') !== resolved.appearance) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved temperature appearance diverges from specification' });
  if (spec.type === 'FilamentColor' && resolved.type === 'FilamentColor' && (groupedAppearance ?? spec.appearance ?? 'default') !== resolved.appearance) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved filament appearance diverges from specification' });
  if (spec.type === 'FanRelation' && resolved.type === 'FanRelation' && (groupedAppearance ?? spec.appearance ?? 'default') !== resolved.appearance) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved fan appearance diverges from specification' });
  if ('children' in spec && 'children' in resolved) {
    if (spec.children.length !== resolved.children.length) { context.addIssue({ code: z.ZodIssueCode.custom, message: 'Resolved child count diverges from specification' }); return; }
    spec.children.forEach((child, index) => correlateNode(child, resolved.children[index], sources, context));
  }
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
