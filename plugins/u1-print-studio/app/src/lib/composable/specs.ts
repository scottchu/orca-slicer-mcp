import type { PresentationSpec } from './schema.js';

export const t1EntityCardSpec: PresentationSpec = {
  schemaVersion: 1,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    transform: { kind: 'softFilamentTint', strength: 'subtle' },
    children: [
      { type: 'Title', text: 'Tool head T1' },
      {
        type: 'Table',
        children: [
          { type: 'Row', children: [{ type: 'HeadStatus' }] },
          { type: 'Row', children: [{ type: 'HeadTemperature' }] },
          { type: 'Row', children: [{ type: 'FilamentColor' }] },
          { type: 'Row', children: [{ type: 'FanRelation' }] },
        ],
      },
    ],
  },
};

export const t1LeafSpec: PresentationSpec = {
  schemaVersion: 1,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Row',
    children: [
      { type: 'HeadTemperature' },
      { type: 'FilamentColor' },
    ],
  },
};

export const t1LargerCompositionSpec: PresentationSpec = {
  schemaVersion: 1,
  subject: { kind: 'toolHead', id: 'T1' },
  root: {
    type: 'Card',
    transform: { kind: 'softFilamentTint', strength: 'subtle' },
    children: [
      { type: 'Title', text: 'T1 inspection group' },
      { type: 'Table', children: [
        { type: 'Row', children: [
          { type: 'HeadStatus' },
          { type: 'HeadTemperature' },
        ] },
        { type: 'Row', children: [
          { type: 'FilamentColor' },
          { type: 'FanRelation' },
        ] },
      ] },
    ],
  },
};
