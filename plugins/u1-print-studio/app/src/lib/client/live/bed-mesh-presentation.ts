import type { BedMeshObservation } from '../bed-mesh/types';
import type { Capability, Evidence, Freshness, Provenance } from './presentation';

export type BedMeshPresentation = {
  kind: 'bed_mesh'; version: number; connectionEpoch: number | null;
  sourceObservedAt: string | null; receivedAt: string; freshness: Freshness; reachable: boolean;
  printerState: string; printerStateLabel: string; refreshAfterSeconds: number;
  session: { identity: null; provenance: 'external' | 'unknown'; detail: string };
  state: Evidence; capability: Capability; provenance: Provenance;
  status: 'active' | 'no_active_mesh' | null;
  receipt: { sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; freshness: 'fresh' | 'stale' | 'unknown'; reason: string | null };
  mesh: BedMeshObservation | null;
};
