import type { Capability, Evidence, Freshness } from './presentation';
import { parseColor } from '../ui/color';

export const HEAD_IDS = [1, 2, 3, 4] as const;
export type HeadId = typeof HEAD_IDS[number];
export type HeadState = 'active' | 'parked' | 'heating' | 'cooling' | 'standby' | 'idle' | 'unknown';
export type HeadField<T> = { state: Evidence; value: T | null };
export type HeadProvenance = { source: 'moonraker' | 'derived' | 'not_observed'; sourceObservedAt: string | null; detail: string };
export type HeadValue = {
  physicalTool: HeadId; state: Evidence; active: HeadField<boolean>; headState: HeadField<HeadState>;
  temperature: HeadField<number>; target: HeadField<number>; material: HeadField<string>; color: HeadField<string>;
  vendor: HeadField<string>; materialType: HeadField<string>; subtype: HeadField<string>; reportedPresence: HeadField<boolean>;
  materialProvenance: HeadProvenance; provenance: HeadProvenance;
};
export type HeadsPresentation = {
  kind: 'heads'; version: number; connectionEpoch: number | null; sourceObservedAt: string | null; receivedAt: string; freshness: Freshness;
  state: Evidence; capability: Capability; provenance: HeadProvenance;
  materials: { state: Evidence; freshness: 'fresh' | 'stale' | 'unknown'; sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; reason: string | null };
  items: HeadValue[];
};

export type HeadCardValue = { physicalTool: HeadId; active: boolean | null; state: HeadState | null; material: string | null; presence: boolean | null; color: string | null; actual: number | null; target: number | null };
const accepted = <T>(field: HeadField<T>): T | null => field.state === 'known' || field.state === 'stale' ? field.value : null;
export const headCardValue = (head: HeadValue): HeadCardValue => ({
  physicalTool: head.physicalTool, active: accepted(head.active), state: accepted(head.headState),
  material: [accepted(head.vendor), accepted(head.materialType), accepted(head.subtype)].filter(Boolean).join(' ') || accepted(head.material),
  presence: accepted(head.reportedPresence), color: accepted(head.color), actual: accepted(head.temperature), target: accepted(head.target),
});

export const headColor = (presence: boolean | null, value: string | null): { label: string; color: string | null; neutral: boolean } => {
  const color = presence === true ? parseColor(value) : null;
  return { label: presence === false ? 'Empty' : color?.hex ?? 'N/A', color: color?.hex ?? null, neutral: !color };
};

export const headStateLabel = (active: boolean | null, state: HeadState | null): string => {
  const label = state ? state[0].toUpperCase() + state.slice(1) : 'Unknown';
  return active === true ? state === 'active' || state === null || state === 'unknown' ? 'Active' : `Active · ${label}` : label;
};
