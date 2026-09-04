import { elementRegistry, sourceForPresentationField } from './element-registry.js';
import type { PresentationNode, PresentationSpec } from './schema.js';
import { SOURCE_GROUPS, type PresentationField, type SourceGroup } from './value-contract.js';

export { SOURCE_GROUPS, type SourceGroup } from './value-contract.js';

export type PresentationPlan = {
  subject: PresentationSpec['subject'];
  fields: PresentationField[];
  dependencies: Array<{ source: SourceGroup; fields: PresentationField[] }>;
};

export const derivePresentationPlan = (spec: PresentationSpec): PresentationPlan => {
  const fields = new Set<PresentationField>();
  const visit = (node: PresentationNode): void => {
    const definition = elementRegistry[node.type];
    const field = definition.field;
    if (field) fields.add(field);
    if (node.type === 'Card' && node.transform) fields.add('filament.color');
    if ('children' in node) node.children.forEach(visit);
  };
  visit(spec.root);
  const orderedFields = [...fields].sort();
  return {
    subject: spec.subject,
    fields: orderedFields,
    dependencies: SOURCE_GROUPS.flatMap((source) => {
      const grouped = orderedFields.filter((field) => sourceForPresentationField(field) === source);
      return grouped.length ? [{ source, fields: grouped }] : [];
    }),
  };
};
