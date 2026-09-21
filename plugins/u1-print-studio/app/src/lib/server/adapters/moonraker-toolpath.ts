import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { normalizePrinterBaseUrl } from '../local-config.js';
import { TOOLPATH_MAX_BYTES } from '../../toolpath.js';
export type ArtifactMetadata = { fingerprint: string; size: number };
export type ToolpathReader = {
  metadata: (filename: string, signal: AbortSignal) => Promise<ArtifactMetadata>;
  download: (filename: string, signal: AbortSignal) => Promise<Uint8Array>;
};
const execute = promisify(execFile);
export const exactArtifactPath = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value || value.length > 1024 || /[\\%?#\x00-\x1f\x7f]/.test(value) || value.startsWith('/') || !value.toLowerCase().endsWith('.gcode')) return null;
  if (value.split('/').some(s => !s || s === '.' || s === '..')) return null;
  return value;
};
export const createMoonrakerToolpathReader = (base: () => string | URL): ToolpathReader => {
  const read = async (route: string, maxBytes: number, signal: AbortSignal): Promise<Buffer> => {
    const url = new URL(route, normalizePrinterBaseUrl(String(base())));
    const { stdout } = await execute('curl', ['--disable', '--noproxy', '*', '--silent', '--show-error', '--request', 'GET',
      '--connect-timeout', '3', '--max-time', '10', '--max-filesize', String(maxBytes), '--write-out', '\n%{http_code}', url.toString()],
    { encoding: 'buffer', maxBuffer: maxBytes + 4, timeout: 10_500, signal });
    // Curl never follows redirects; maxBuffer and max-filesize bound received bytes.
    if (stdout.length < 4 || stdout.subarray(-4).toString() !== '\n200' || stdout.length > maxBytes + 4) throw new Error('artifact_unavailable');
    return stdout.subarray(0, -4);
  };
  return {
    metadata: async (name, signal) => {
      const filename = exactArtifactPath(name); if (!filename) throw new Error('artifact_unavailable');
      const raw = await read('/server/files/metadata?filename=' + encodeURIComponent(filename), 512_000, signal);
      const response: unknown = JSON.parse(raw.toString('utf8'));
      const result = response && typeof response === 'object' && 'result' in response ? response.result : null;
      if (!result || typeof result !== 'object' || !('size' in result) || !('modified' in result)) throw new Error('metadata_unavailable');
      const metadata = result as Record<string, unknown>;
      if (metadata.filename !== filename || !Number.isSafeInteger(metadata.size) || (metadata.size as number) <= 0 || (metadata.size as number) > TOOLPATH_MAX_BYTES || typeof metadata.modified !== 'number' || !Number.isFinite(metadata.modified) || metadata.modified < 0) throw new Error('metadata_unavailable');
      const fingerprint = createHash('sha256').update(JSON.stringify([filename, metadata.size, metadata.modified, typeof metadata.uuid === 'string' ? metadata.uuid : null])).digest('hex');
      return { fingerprint, size: metadata.size as number };
    },
    download: async (name, signal) => {
      const filename = exactArtifactPath(name); if (!filename) throw new Error('artifact_unavailable');
      return read('/server/files/gcodes/' + filename.split('/').map(encodeURIComponent).join('/'), TOOLPATH_MAX_BYTES, signal);
    },
  };
};
