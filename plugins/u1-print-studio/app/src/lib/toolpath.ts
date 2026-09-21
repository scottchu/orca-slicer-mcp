/** Closed nominal-toolpath contract. No source paths, comments or printer URLs. */
export const TOOLPATH_VERSION = 'orca-klipper-1';
export const TOOLPATH_MAX_BYTES = 20_000_000;
export const TOOLPATH_MAX_VERTICES = 500_000;
export const TOOLPATH_MAX_DECODED = 16_000_000;
export const TOOLPATH_MAX_ENCODED = 1_000_000;
export type ToolpathGeometry = {
  version: typeof TOOLPATH_VERSION;
  layers: Array<{ z: number; reported: number | null }>;
  paths: Array<{ layer: number; tool: number; d: number[] }>;
  bounds: Array<[number, number]>;
  vertices: number;
  opaqueMacros: boolean;
};
export type EncodedToolpath = { encoding: 'gzip-delta-1e5-v1'; decodedBytes: number; body: string };
export type ToolpathReason = 'preparing' | 'no_current_job' | 'stale' | 'identity_changed' | 'metadata_unavailable' | 'unsupported_gcode' | 'too_large' | 'timeout' | 'unavailable' | 'layer_mapping_unknown';
export type ProgressToolpath = {
  schemaVersion: 1;
  observationVersion: number;
  connectionEpoch: number | null;
  observedAt: string | null;
  previewId: string | null;
  binding: 'metadata_correlated' | 'uncertain' | 'changed';
  state: 'ready' | 'loading' | 'unavailable' | 'unsupported';
  reason: ToolpathReason | null;
  currentLayerIndex: number | null;
  geometry?: EncodedToolpath;
};
export type DecodedToolpath = Omit<ProgressToolpath, 'geometry'> & { geometry?: ToolpathGeometry };
