import { createHash } from 'node:crypto';
import { TOOLPATH_VERSION, type ProgressToolpath, type EncodedToolpath, type ToolpathGeometry } from '../../toolpath.js';
import type { ToolpathReader, ArtifactMetadata } from '../adapters/moonraker-toolpath.js';
import { compileToolpath, ToolpathError } from './compile-toolpath.js';
export type ToolpathContext = {
  filename: string | null; observationVersion: number; connectionEpoch: number | null; observedAt: string | null;
  receipt: string; fresh: boolean; state: string; layer: number | null; totalLayers: number | null; elapsed: number | null;
};
type Cached = { id: string; encoded: EncodedToolpath; geometry: ToolpathGeometry };
type Artifact = { fingerprint: string; receipt?: string; value?: Cached; reason?: ProgressToolpath['reason'] };

/** Bounded lazy compilation; the normal status receipt owns metadata cadence. */
export const createProgressToolpathService = (reader?: ToolpathReader) => {
  const compiled = new Map<string, Cached>();
  let artifact: Artifact | null = null;
  let flight: { key: string; abort: AbortController } | null = null;
  let metadata: { key: string; abort: AbortController; result: Promise<ArtifactMetadata> } | null = null;
  let lastContext: ToolpathContext | null = null, disposed = false, generation = 0;
  const identity = (c: ToolpathContext) => JSON.stringify([c.filename, c.connectionEpoch]);
  const reset = () => { generation++; flight?.abort.abort(); metadata?.abort.abort(); flight = null; metadata = null; artifact = null; };
  const current = async (context: ToolpathContext, valid: () => boolean, known?: string): Promise<ProgressToolpath> => {
    const envelope: ProgressToolpath = { schemaVersion: 1, observationVersion: context.observationVersion, connectionEpoch: context.connectionEpoch,
      observedAt: context.observedAt, previewId: null, binding: 'uncertain', state: 'unavailable', reason: 'unavailable', currentLayerIndex: null };
    if (disposed) return envelope;
    const changed = lastContext && (identity(lastContext) !== identity(context) || (context.elapsed !== null && lastContext.elapsed !== null && context.elapsed < lastContext.elapsed) || (context.layer !== null && lastContext.layer !== null && context.layer < lastContext.layer));
    if (changed || !context.filename || context.state === 'standby') reset();
    lastContext = context;
    if (!context.filename || !['printing', 'paused', 'complete', 'error', 'cancelled'].includes(context.state)) return { ...envelope, reason: 'no_current_job' };
    if (!context.fresh) {
      const value = artifact?.value;
      return value ? { ...envelope, state: 'ready', previewId: value.id, binding: 'metadata_correlated', reason: 'stale', ...(known === value.id ? {} : { geometry: value.encoded }) } : { ...envelope, reason: 'stale' };
    }
    if (!reader) return envelope;
    const key = JSON.stringify([identity(context), context.receipt]);
    const version = generation;
    if (!metadata || metadata.key !== key) {
      metadata?.abort.abort();
      const abort = new AbortController(), deadline = setTimeout(() => abort.abort(), 3500);
      metadata = { key, abort, result: reader.metadata(context.filename, abort.signal).finally(() => clearTimeout(deadline)) };
    }
    let before: ArtifactMetadata;
    try { before = await metadata.result; }
    catch { return { ...envelope, reason: 'metadata_unavailable' }; }
    if (disposed || generation !== version || !valid()) return { ...envelope, binding: 'changed', reason: 'identity_changed' };
    if (artifact && artifact.fingerprint !== before.fingerprint) { flight?.abort.abort(); flight = null; artifact = null; }
    if (artifact?.reason && !['unsupported_gcode', 'too_large'].includes(artifact.reason) && artifact.receipt !== context.receipt) artifact = null;
    if (!artifact && !flight) {
      const abort = new AbortController(); flight = { key: before.fingerprint, abort };
      const expires = performance.now() + 20_000;
      const deadline = setTimeout(() => abort.abort(), 20_000);
      // Initial numbers return immediately; only a later fresh observation may
      // attach this bounded job's compiled geometry. No background polling.
      void (async () => {
        const bytes = await reader.download(context.filename!, abort.signal);
        const after = await reader.metadata(context.filename!, abort.signal);
        if (after.fingerprint !== before.fingerprint || bytes.byteLength !== before.size) throw new Error('identity_changed');
        if (abort.signal.aborted) throw new Error('timeout');
        const hash = createHash('sha256').update(bytes).digest('hex');
        let value = compiled.get(hash);
        if (!value) {
          const output = compileToolpath(bytes, expires);
          value = { id: createHash('sha256').update(TOOLPATH_VERSION + ':' + hash).digest('hex'), ...output };
          compiled.set(hash, value);
          while (compiled.size > 2) compiled.delete(compiled.keys().next().value!);
        }
        if (!abort.signal.aborted && generation === version) artifact = { fingerprint: before.fingerprint, value };
      })().catch((error: unknown) => {
        if (generation === version && !disposed && flight?.abort === abort) artifact = { fingerprint: before.fingerprint, receipt: context.receipt,
          reason: abort.signal.aborted ? 'timeout' : error instanceof ToolpathError ? error.reason : error instanceof Error && error.message === 'identity_changed' ? 'identity_changed' : 'metadata_unavailable' };
      }).finally(() => { clearTimeout(deadline); if (flight?.abort === abort) flight = null; });
    }
    if (!artifact) return { ...envelope, state: 'loading', reason: 'preparing' };
    if (!artifact.value) return { ...envelope, state: artifact.reason === 'unsupported_gcode' ? 'unsupported' : 'unavailable', reason: artifact.reason ?? 'unavailable' };
    const value = artifact.value;
    const layer = context.layer !== null && context.layer > 0 && context.totalLayers === value.geometry.layers.length
      ? value.geometry.layers.findIndex(l => l.reported === context.layer) : -1;
    return { ...envelope, state: 'ready', binding: 'metadata_correlated', reason: layer >= 0 ? null : 'layer_mapping_unknown', previewId: value.id,
      currentLayerIndex: layer >= 0 ? layer : null, ...(known === value.id ? {} : { geometry: value.encoded }) };
  };
  return { current, invalidate: reset, dispose: () => { disposed = true; reset(); compiled.clear(); } };
};
