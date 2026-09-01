import type { Capability, Evidence, Freshness, Provenance } from './presentation';

export type QueueState = 'ready' | 'loading' | 'starting' | 'paused';
export type QueueReason = 'not_requested' | 'unsupported' | 'unauthorized' | 'http_error' | 'timeout' | 'network' | 'malformed' | 'too_large' | 'not_configured';
export type QueueRecord = {
  /** A reported order slot, not a stable job identifier. Duplicate names are valid. */
  position: number;
  filename: string;
  timeAdded: string | null;
  /** Reported wait at receipt, never a running timer or print ETA. */
  timeInQueueSeconds: number | null;
};
export type QueuePresentation = {
  kind: 'queue'; version: number; connectionEpoch: number | null;
  sourceObservedAt: string | null; receivedAt: string; freshness: Freshness;
  reachable: boolean; printerState: string; printerStateLabel: string;
  refreshAfterSeconds: number;
  session: { identity: null; provenance: 'external' | 'unknown'; detail: string };
  state: Evidence; capability: Capability; provenance: Provenance;
  receipt: { sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; freshness: 'fresh' | 'stale' | 'unknown'; reason: QueueReason | null };
  queueState: QueueState | null; totalCount: number | null; truncated: boolean;
  items: QueueRecord[];
};
