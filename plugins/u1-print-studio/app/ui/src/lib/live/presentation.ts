export const FAN_IDS = ['tool-1-part', 'tool-2-part', 'tool-3-part', 'tool-4-part', 'cavity', 'purifier-exhaust', 'purifier-inner'] as const;
export type Freshness = 'fresh' | 'stale' | 'offline' | 'unknown';
export type Evidence = 'known' | 'unknown' | 'unavailable' | 'unsupported' | 'stale';
export type Capability = 'observed' | 'advertised' | 'unsupported' | 'unknown';
export type FanValue = { id: typeof FAN_IDS[number]; percent: number | null; rpm: number | null };
export type PurifierMode = 'idle' | 'cool_chamber' | 'preheat_chamber' | 'hot_chamber' | null;
export type FansPresentation = {
  kind: 'fans'; version: number; connectionEpoch: number | null;
  sourceObservedAt: string | null; receivedAt: string; freshness: Freshness;
  state: Evidence; capability: Capability;
  receipt: { source: 'moonraker' | 'derived' | 'not_observed'; sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; freshness: 'fresh' | 'stale' | 'unknown'; reason: string | null };
  items: Array<FanValue & { state: 'known' | 'not_reported'; speedReported: boolean; rpmReported: boolean }>;
  purifier: { state: 'known' | 'not_reported'; powerDetected: boolean | null; mode: PurifierMode; capability: Capability };
};
