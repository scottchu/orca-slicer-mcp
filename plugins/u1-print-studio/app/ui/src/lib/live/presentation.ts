export const FAN_IDS = ['tool-1-part', 'tool-2-part', 'tool-3-part', 'tool-4-part', 'cavity', 'purifier-exhaust', 'purifier-inner'] as const;
export type Freshness = 'fresh' | 'stale' | 'offline' | 'unknown';
export type Evidence = 'known' | 'unknown' | 'unavailable' | 'unsupported' | 'stale';
export type Capability = 'observed' | 'advertised' | 'unsupported' | 'unknown';
export const THERMAL_IDS = ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'heater-bed', 'cavity'] as const;
export type ThermalValue = { id: typeof THERMAL_IDS[number] | 'bed'; actualC: number | null; targetC: number | null; active: boolean | null };
export type ThermalField<T> = { state: Evidence; value: T | null };
export type Provenance = { source: 'moonraker' | 'derived' | 'not_observed'; sourceObservedAt: string | null; detail: string };
export type ThermalsPresentation = {
  kind: 'thermals'; version: number; connectionEpoch: number | null;
  sourceObservedAt: string | null; receivedAt: string; freshness: Freshness;
  reachable: boolean; state: Evidence; capability: Capability; provenance: Provenance;
  environment: { state: Evidence; freshness: 'fresh' | 'stale' | 'unknown'; sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; reason: string | null };
  readings: Array<ThermalValue & {
    id: typeof THERMAL_IDS[number]; state: Evidence; capability: Capability;
    actual: ThermalField<number>; target?: ThermalField<number>;
    activeField?: ThermalField<boolean>; heaterState?: ThermalField<string>;
    reportedState?: 'known' | 'not_reported'; provenance: Provenance;
  }>;
};
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
export const CURRENT_JOB_STATES = ['standby', 'printing', 'paused', 'complete', 'error', 'cancelled', 'unknown'] as const;
export type CurrentJobState = typeof CURRENT_JOB_STATES[number];
export type ReportedValue<T> = { reported: boolean; value: T | null };
export type CurrentJobPresentation = {
  kind: 'jobs'; version: number; connectionEpoch: number | null;
  sourceObservedAt: string | null; receivedAt: string; freshness: Freshness; reachable: boolean;
  state: Evidence; capability: Capability; provenance: Provenance;
  receipt: { sourceObservedAt: string | null; receivedAt: string | null; checkedAt: string | null; freshness: 'fresh' | 'stale' | 'unknown'; reason: string | null };
  printState: ReportedValue<CurrentJobState>; filename: ReportedValue<string>;
  storageActive: ReportedValue<boolean>; filePositionBytes: ReportedValue<number>;
  fileSizeBytes: ReportedValue<number>; totalDurationSeconds: ReportedValue<number>;
  printDurationSeconds: ReportedValue<number>; filamentUsedMillimeters: ReportedValue<number>;
};
