import type { PresentationField, PresentationNode, PresentationSpec } from './schema.js';

export const SOURCE_GROUPS = ['environment', 'materials', 'status'] as const;
export type SourceGroup = (typeof SOURCE_GROUPS)[number];

const fieldSource: Record<PresentationField, SourceGroup> = {
  'head.status': 'status',
  'head.temperature': 'status',
  'filament.color': 'materials',
  'head.fanRelation': 'environment',
};
const nodeField: Partial<Record<PresentationNode['type'], PresentationField>> = {
  HeadStatus: 'head.status',
  HeadTemperature: 'head.temperature',
  FilamentColor: 'filament.color',
  FanRelation: 'head.fanRelation',
};

export type PresentationPlan = {
  subject: PresentationSpec['subject'];
  fields: PresentationField[];
  dependencies: Array<{ source: SourceGroup; fields: PresentationField[] }>;
};

export const derivePresentationPlan = (spec: PresentationSpec): PresentationPlan => {
  const fields = new Set<PresentationField>();
  const visit = (node: PresentationNode): void => {
    const field = nodeField[node.type];
    if (field) fields.add(field);
    if (node.type === 'Card' && node.transform) fields.add('filament.color');
    if ('children' in node) node.children.forEach(visit);
    if (node.type === 'PercentageFill') visit(node.child);
  };
  visit(spec.root);
  const orderedFields = [...fields].sort();
  return {
    subject: spec.subject,
    fields: orderedFields,
    dependencies: SOURCE_GROUPS.flatMap((source) => {
      const grouped = orderedFields.filter((field) => fieldSource[field] === source);
      return grouped.length ? [{ source, fields: grouped }] : [];
    }),
  };
};
