import type { Snippet } from 'svelte';
import type { ResolvedNode } from '../../composable/view-model';

type ResolvedNodeFor<Type extends ResolvedNode['type']> = Extract<ResolvedNode, { type: Type }>;

/**
 * Independently owned client contracts for the registered constructors.
 * Component implementations must conform to these props at build time.
 */
export type PresentationComponentPropsByElement = {
  Card: {
    children: Snippet;
    label: string;
    busy?: boolean;
    tint?: string | null;
    density?: ResolvedNodeFor<'Card'>['density'];
  };
  Title: {
    text: ResolvedNodeFor<'Title'>['text'];
    size?: ResolvedNodeFor<'Title'>['size'];
    inset?: boolean;
  };
  Stack: {
    children: Snippet;
    gap?: ResolvedNodeFor<'Stack'>['gap'];
    inset?: boolean;
    composed?: boolean;
  };
  Grid: {
    children: Snippet;
    columns?: ResolvedNodeFor<'Grid'>['columns'];
    gap?: ResolvedNodeFor<'Grid'>['gap'];
    inset?: boolean;
    arrangement?: ResolvedNodeFor<'Grid'>['arrangement'];
  };
  Inline: {
    children: Snippet;
    align?: 'center' | 'baseline';
    gap?: 'normal' | 'tight' | ResolvedNodeFor<'Inline'>['gap'];
    shrink?: boolean;
    label?: string;
    distribution?: ResolvedNodeFor<'Inline'>['distribution'];
    inset?: boolean;
    composed?: boolean;
  };
  Group: {
    children: Snippet;
    relation: ResolvedNodeFor<'Group'>['relation'];
    label: string;
    rowGap?: ResolvedNodeFor<'Group'>['rowGap'];
    inset?: boolean;
  };
  Row: {
    children: Snippet;
    columnGap?: ResolvedNodeFor<'Row'>['columnGap'];
    collapse?: ResolvedNodeFor<'Row'>['collapse'];
  };
  Column: {
    children: Snippet;
    colSpan: ResolvedNodeFor<'Column'>['colSpan'];
  };
  HeadStatus: { density?: 'regular' | 'compact'; value: ResolvedNodeFor<'HeadStatus'>['value']; appearance?: ResolvedNodeFor<'HeadStatus'>['appearance'] };
  HeadTemperature: { density?: 'regular' | 'compact'; value: ResolvedNodeFor<'HeadTemperature'>['value']; appearance?: ResolvedNodeFor<'HeadTemperature'>['appearance'] };
  FilamentColor: { density?: 'regular' | 'compact'; value: ResolvedNodeFor<'FilamentColor'>['value']; appearance?: ResolvedNodeFor<'FilamentColor'>['appearance'] };
  FanRelation: { density?: 'regular' | 'compact'; value: ResolvedNodeFor<'FanRelation'>['value']; appearance?: ResolvedNodeFor<'FanRelation'>['appearance'] };
};

export type PresentationAdapterPropsByElement = {
  [Type in keyof PresentationComponentPropsByElement]: Omit<PresentationComponentPropsByElement[Type], 'children'>;
};

export type PresentationRenderContext = {
  subjectLabel: string;
  busy: boolean;
  group?: 'identity' | 'summary';
  density?: 'regular' | 'compact';
};
