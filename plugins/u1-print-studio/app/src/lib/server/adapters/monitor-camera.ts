import { readU1CameraJpeg, stripJpegMetadata, type U1CameraJpeg } from '../u1-status.js';
import { MonitorCameraError } from '../application/observe-print-monitor.js';
import { MONITOR_CAMERA_MAX_BYTES } from '../application/print-monitor-observation.js';

/** Structural JPEG validation supplements the existing metadata sanitizer.
 * Decoding/pixel interpretation belongs to the receiving image consumer. */
export const sanitizeMonitorCamera = (frame: U1CameraJpeg): U1CameraJpeg => {
  if (frame.bytes.length > 4 * 1024 * 1024) throw new MonitorCameraError('too_large');
  let bytes: Buffer;
  try { bytes = stripJpegMetadata(frame.bytes); } catch { throw new MonitorCameraError('invalid_image'); }
  if (bytes.length > MONITOR_CAMERA_MAX_BYTES) throw new MonitorCameraError('too_large');
  if (!Number.isFinite(Date.parse(frame.observedAt))) throw new MonitorCameraError('invalid_image');
  let sof = false, tables = false, scan = false;
  for (let offset = 2; offset + 4 <= bytes.length;) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1], length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xd9) break;
    if (length < 2 || offset + 2 + length > bytes.length) throw new MonitorCameraError('invalid_image');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 11) throw new MonitorCameraError('invalid_image');
      const height = bytes.readUInt16BE(offset + 5), width = bytes.readUInt16BE(offset + 7), channels = bytes[offset + 9];
      if (!width || !height || width * height > 16_777_216 || ![1, 3].includes(channels) || length !== 8 + 3 * channels) throw new MonitorCameraError('invalid_image');
      sof = true;
    }
    if (marker === 0xdb) tables = true;
    if (marker === 0xda) { scan = length >= 6 && offset + 2 + length < bytes.length - 2; break; }
    offset += 2 + length;
  }
  if (!sof || !tables || !scan) throw new MonitorCameraError('invalid_image');
  return { bytes, observedAt: frame.observedAt };
};
export const readMonitorCamera = async (signal: AbortSignal) => sanitizeMonitorCamera(await readU1CameraJpeg(signal));
