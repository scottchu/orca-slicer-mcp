import { createObservationController } from './controller';
import { resultObservation, type ObservationPort } from './observation-port';
import { adaptProgress } from './progress-adapter';
import { decodeToolpath, previewEnvelope } from './toolpath-decoder';
import type { DecodedToolpath, ToolpathGeometry } from '../../toolpath';
import type { ProgressPresentation } from './focused-presentation';
const object = (v: unknown): Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};

export const createProgressController = (port: ObservationPort, timeoutMs = 20_000) => {
  const abort = new AbortController(), cache = new Map<string, ToolpathGeometry>();
  let known: string | undefined;
  const convert = async (result: unknown) => {
    const raw = resultObservation(result), observation = adaptProgress(raw);
    let preview: DecodedToolpath | null = null;
    try {
      const value = object(object(result)._meta).progressToolpath;
      if (value !== undefined) {
        const envelope = previewEnvelope(value, observation);
        const { geometry: encoded, ...metadata } = envelope;
        let geometry: ToolpathGeometry | undefined;
        if (envelope.state === 'ready' && envelope.previewId) {
          geometry = cache.get(envelope.previewId);
          if (!geometry && encoded) geometry = await decodeToolpath(encoded, abort.signal);
          if (!geometry) throw new Error('Preview cache miss');
          if (envelope.currentLayerIndex !== null && (envelope.currentLayerIndex >= geometry.layers.length || geometry.layers[envelope.currentLayerIndex]!.reported !== observation.fields.currentLayer.value)) throw new Error('Unmapped preview layer');
          cache.set(envelope.previewId, geometry);
          while (cache.size > 2) cache.delete(cache.keys().next().value!);
          known = envelope.previewId;
        }
        preview = { ...metadata, ...(geometry ? { geometry } : {}) };
      }
    } catch { known = undefined; }
    if (abort.signal.aborted) throw new Error('Progress disposed');
    const seconds = object(raw).refreshAfterSeconds;
    return { structuredContent: { ...observation, preview, refreshAfterSeconds: typeof seconds === 'number' ? Math.max(15, Math.min(300, seconds)) : 30 } };
  };
  const wrapped: ObservationPort = {
    start: port.start,
    subscribe: listener => port.subscribe(result => { void convert(result).then(listener).catch(() => { if (!abort.signal.aborted) listener({ isError: true }); }); }),
    refresh: async () => convert(await port.refresh(known)),
    dispose: () => { abort.abort(); cache.clear(); known = undefined; port.dispose(); },
  };
  const small = ({ preview, ...observation }: ProgressPresentation) => ({ ...observation, preview: preview ? { ...preview, geometry: undefined } : preview });
  return createObservationController(wrapped, value => value as ProgressPresentation, 'Print Progress', timeoutMs, undefined,
    (a, b) => JSON.stringify(small(a)) === JSON.stringify(small(b)));
};

/** Only mounted, visible pages own this schedule; no daemon or extra data source. */
export const mountProgressRefresh = (controller: ReturnType<typeof createProgressController>, document: Document = globalThis.document) => {
  let timer: ReturnType<typeof setTimeout> | undefined, disposed = false, suspended = false;
  const clear = () => { if (timer) clearTimeout(timer); timer = undefined; };
  const schedule = () => {
    clear(); const state = controller.getState();
    if (disposed || suspended || document.hidden || state.refreshing) return;
    const seconds = state.observation?.refreshAfterSeconds ?? 30;
    timer = setTimeout(() => { timer = undefined; void controller.refresh(); }, seconds * 1000);
  };
  const hidden = () => { if (document.hidden) clear(); else { void controller.refresh(); schedule(); } };
  const hide = () => { suspended = true; clear(); };
  const show = () => { suspended = false; void controller.refresh(); schedule(); };
  const unsubscribe = controller.subscribe(schedule);
  document.addEventListener('visibilitychange', hidden);
  document.defaultView?.addEventListener('pagehide', hide);
  document.defaultView?.addEventListener('pageshow', show);
  return () => { disposed = true; clear(); unsubscribe(); document.removeEventListener('visibilitychange', hidden); document.defaultView?.removeEventListener('pagehide', hide); document.defaultView?.removeEventListener('pageshow', show); };
};
