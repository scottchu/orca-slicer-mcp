import type { Snippet } from 'svelte';
import type { ResolvedNode } from '../../composable/view-model';

type ResolvedNodeFor<Type extends ResolvedNode['type']> = Extract<ResolvedNode, { type: Type }>;

/**
 * Independently owned client contracts for the eight registered constructors.
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
  };
  HeadStatus: Pick<ResolvedNodeFor<'HeadStatus'>, 'value'>;
  HeadTemperature: Pick<ResolvedNodeFor<'HeadTemperature'>, 'value'>;
  FilamentColor: Pick<ResolvedNodeFor<'FilamentColor'>, 'value'>;
  FanRelation: Pick<ResolvedNodeFor<'FanRelation'>, 'value'>;
};

export type PresentationAdapterPropsByElement = {
  [Type in keyof PresentationComponentPropsByElement]: Omit<PresentationComponentPropsByElement[Type], 'children'>;
};

export type PresentationRenderContext = {
  subjectLabel: string;
  busy: boolean;
};
