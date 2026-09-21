import { TOOLPATH_VERSION, TOOLPATH_MAX_VERTICES, TOOLPATH_MAX_DECODED, TOOLPATH_MAX_ENCODED, type ToolpathGeometry, type ProgressToolpath } from '../../toolpath.js';
const object = (v: unknown): Record<string, unknown> => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Invalid preview'); return v as Record<string, unknown>; };
const exact = (v: Record<string, unknown>, keys: string[]) => { if (Object.keys(v).some(k => !keys.includes(k))) throw new Error('Invalid preview'); };
const integer = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number => { if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < min || v > max) throw new Error('Invalid preview'); return v; };
const finite = (v: unknown): number => { if (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 10_000) throw new Error('Invalid preview'); return v; };
export const previewEnvelope = (value: unknown, observation: { version: number; connectionEpoch: number | null; sourceObservedAt: string | null }): ProgressToolpath => {
  const v = object(value);
  exact(v, ['schemaVersion', 'observationVersion', 'connectionEpoch', 'observedAt', 'previewId', 'binding', 'state', 'reason', 'currentLayerIndex', 'geometry']);
  if (v.schemaVersion !== 1 || v.observationVersion !== observation.version || v.connectionEpoch !== observation.connectionEpoch || v.observedAt !== observation.sourceObservedAt) throw new Error('Uncorrelated preview');
  if (!['ready', 'loading', 'unavailable', 'unsupported'].includes(String(v.state)) || !['metadata_correlated', 'uncertain', 'changed'].includes(String(v.binding))) throw new Error('Invalid preview');
  if (v.reason !== null && !['preparing', 'no_current_job', 'stale', 'identity_changed', 'metadata_unavailable', 'unsupported_gcode', 'too_large', 'timeout', 'unavailable', 'layer_mapping_unknown'].includes(String(v.reason))) throw new Error('Invalid preview');
  if (v.previewId !== null && (typeof v.previewId !== 'string' || !/^[a-f0-9]{64}$/.test(v.previewId))) throw new Error('Invalid preview');
  if (v.currentLayerIndex !== null) integer(v.currentLayerIndex, 0, 19_999);
  if (v.state === 'ready' ? !v.previewId || v.binding !== 'metadata_correlated' : v.previewId !== null || v.currentLayerIndex !== null || v.geometry !== undefined) throw new Error('Invalid preview');
  return v as unknown as ProgressToolpath;
};

export const decodeToolpath = async (value: unknown, signal: AbortSignal): Promise<ToolpathGeometry> => {
  const v = object(value); exact(v, ['encoding', 'decodedBytes', 'body']);
  if (v.encoding !== 'gzip-delta-1e5-v1' || typeof v.body !== 'string' || v.body.length >= TOOLPATH_MAX_ENCODED || !/^[A-Za-z0-9+/]*={0,2}$/.test(v.body) || typeof DecompressionStream !== 'function') throw new Error('Preview decoding unavailable');
  const expected = integer(v.decodedBytes, 1, TOOLPATH_MAX_DECODED);
  const binary = Uint8Array.from(atob(v.body), c => c.charCodeAt(0));
  const stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  const cancel = () => { void stream.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    while (true) {
      if (signal.aborted) throw new Error('Preview disposed');
      const next = await stream.read(); if (next.done) break;
      size += next.value.byteLength;
      if (size > expected || size > TOOLPATH_MAX_DECODED) throw new Error('Preview exceeds budget');
      chunks.push(next.value);
    }
  } catch (error) { cancel(); throw error; }
  finally { signal.removeEventListener('abort', cancel); stream.releaseLock(); }
  if (size !== expected || signal.aborted) throw new Error('Invalid preview');
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const data = object(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
  exact(data, ['version', 'layers', 'paths', 'bounds', 'vertices', 'opaqueMacros']);
  if (data.version !== TOOLPATH_VERSION || typeof data.opaqueMacros !== 'boolean' || !Array.isArray(data.layers) || !data.layers.length || data.layers.length > 20_000 || !Array.isArray(data.paths) || !data.paths.length || data.paths.length > TOOLPATH_MAX_VERTICES / 2 || !Array.isArray(data.bounds) || data.bounds.length !== 3) throw new Error('Invalid preview');
  const vertices = integer(data.vertices, 2, TOOLPATH_MAX_VERTICES);
  const bounds = data.bounds.map(pair => { if (!Array.isArray(pair) || pair.length !== 2 || finite(pair[0]) > finite(pair[1])) throw new Error('Invalid preview'); return pair as [number, number]; });
  const layers = data.layers.map((layer, index) => { const l = object(layer); exact(l, ['z', 'reported']); if (l.reported !== null && integer(l.reported, 1) !== index + 1) throw new Error('Invalid preview'); return { z: finite(l.z), reported: l.reported as number | null }; });
  let count = 0;
  const paths = data.paths.map(path => {
    const p = object(path); exact(p, ['layer', 'tool', 'd']);
    const layer = integer(p.layer, 0, layers.length - 1), tool = integer(p.tool, 0, 3);
    if (!Array.isArray(p.d) || p.d.length < 6 || p.d.length % 3) throw new Error('Invalid preview');
    count += p.d.length / 3; if (count > vertices) throw new Error('Invalid preview');
    const coordinates = [0, 0, 0];
    for (let i = 0; i < p.d.length; i++) {
      const axis = i % 3, next = coordinates[axis]! + integer(p.d[i], -2_000_000_000, 2_000_000_000);
      if (!Number.isSafeInteger(next) || next / 100_000 < bounds[axis]![0] - .00001 || next / 100_000 > bounds[axis]![1] + .00001) throw new Error('Invalid preview');
      coordinates[axis] = next;
    }
    return { layer, tool, d: p.d as number[] };
  });
  if (count !== vertices) throw new Error('Invalid preview');
  return { version: TOOLPATH_VERSION, layers, paths, bounds, vertices, opaqueMacros: data.opaqueMacros };
};
