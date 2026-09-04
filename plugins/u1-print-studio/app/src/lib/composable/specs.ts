import type { PresentationSpec } from './schema.js';

export const t1EntityCardSpec: PresentationSpec = {
  schemaVersion: 2,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    density: 'comfortable',
    transform: { kind: 'softFilamentTint', strength: 'subtle' },
    children: [
      { type: 'Title', content: 'subject', size: 'large' },
      {
        type: 'Stack',
        gap: 'regular',
        children: [
          { type: 'HeadStatus' },
          { type: 'HeadTemperature' },
          { type: 'FilamentColor' },
          { type: 'FanRelation' },
        ],
      },
    ],
  },
};

export const t1CompactGridSpec: PresentationSpec = {
  schemaVersion: 2,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    density: 'compact',
    children: [
      { type: 'Title', content: 'compactStatus', size: 'medium' },
      {
        type: 'Grid',
        columns: 'two',
        gap: 'compact',
        children: [
          { type: 'HeadStatus' },
          { type: 'FilamentColor' },
        ],
      },
    ],
  },
};

export const t1LargerCompositionSpec: PresentationSpec = {
  schemaVersion: 2,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    density: 'comfortable',
    transform: { kind: 'softFilamentTint', strength: 'subtle' },
    children: [
      { type: 'Title', content: 'inspectionGroup', size: 'large' },
      {
        type: 'Grid',
        columns: 'two',
        gap: 'relaxed',
        children: [
          { type: 'HeadStatus' },
          { type: 'HeadTemperature' },
          { type: 'FilamentColor' },
          { type: 'FanRelation' },
        ],
      },
    ],
  },
};

export const t1BalancedCompositionSpec: PresentationSpec = {
  schemaVersion: 2,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    density: 'compact',
    children: [
      {
        type: 'Inline',
        gap: 'regular',
        distribution: 'split',
        children: [
          { type: 'Title', content: 'subject', size: 'large' },
          { type: 'HeadStatus', appearance: 'headerBadge' },
        ],
      },
      {
        type: 'Grid',
        columns: 'two',
        gap: 'regular',
        arrangement: 'lead',
        children: [
          { type: 'HeadTemperature', appearance: 'hero' },
          { type: 'FilamentColor', appearance: 'quiet' },
          { type: 'FanRelation', appearance: 'quiet' },
        ],
      },
    ],
  },
};
