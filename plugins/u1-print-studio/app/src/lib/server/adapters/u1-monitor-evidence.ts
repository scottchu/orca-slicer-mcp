import { safeDisplayFilename } from './moonraker-queue.js';
import { createHash } from 'node:crypto';
import type { MonitorEvidence } from '../application/print-monitor-observation.js';
const object = (v: unknown): Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const number = (v: unknown, max = Number.MAX_SAFE_INTEGER): number | null => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? v : null;
const integer = (v: unknown): number | null => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : null;
const bool = (v: unknown): boolean | null => typeof v === 'boolean' ? v : null;
const toolStates = ['ACTIVE', 'PARKED', 'HEATING', 'COOLING', 'STANDBY', 'IDLE', 'UNKNOWN'] as const;
const printStates = ['standby', 'printing', 'paused', 'complete', 'error', 'cancelled'] as const;

/** Same fixed query, separately retained presence; never export exactJobKey. */
export const normalizeMonitorEvidence = (payload: unknown, receivedAt: string): MonitorEvidence => {
  const result = object(object(payload).result), source = object(result.status);
  const stats = object(source.print_stats), info = object(stats.info), sd = object(source.virtual_sdcard);
  const hooks = object(source.webhooks), bed = object(source.heater_bed), head = object(source.toolhead);
  const displayFilename = safeDisplayFilename(stats.filename);
  const filename = displayFilename !== null ? stats.filename as string : null;
  const rawException = stats.exception;
  const exceptionPresent = rawException !== null && typeof rawException === 'object' && !Array.isArray(rawException) ? Object.keys(rawException).length > 0 : null;
  const controllerState = typeof hooks.state === 'string' && ['ready', 'shutdown', 'error'].includes(hooks.state) ? hooks.state as 'ready' | 'shutdown' | 'error' : 'unknown';
  const state = printStates.includes(stats.state as typeof printStates[number]) ? stats.state as typeof printStates[number] : 'unknown';
  const fileSizeBytes = integer(sd.file_size), position = integer(sd.file_position);
  const filePositionBytes = position !== null && fileSizeBytes !== null && position > fileSizeBytes ? null : position;
  const tools = ['extruder', 'extruder1', 'extruder2', 'extruder3'].map((name, index) => {
    const tool = object(source[name]);
    const toolState = typeof tool.state === 'string' ? tool.state.trim().toUpperCase() : null;
    return { physicalTool: index + 1, temperature: number(tool.temperature, 500), target: number(tool.target, 500),
      state: toolState && toolStates.includes(toolState as typeof toolStates[number]) ? toolState as typeof toolStates[number] : null,
      active: typeof head.extruder === 'string' && ['extruder', 'extruder1', 'extruder2', 'extruder3'].includes(head.extruder) ? head.extruder === name : null };
  });
  const complete = ['print_stats', 'virtual_sdcard', 'heater_bed', 'toolhead', 'webhooks', 'extruder', 'extruder1', 'extruder2', 'extruder3']
    .every(key => Object.keys(object(source[key])).length > 0) && state !== 'unknown';
  return {
    receivedAt, sourceEventTimeSeconds: number(result.eventtime), completeness: complete ? 'complete' : 'partial',
    exactJobKey: filename && displayFilename ? createHash('sha256').update(filename).digest('hex') : null,
    filename: displayFilename, state, displayProgress: number(object(source.display_status).progress, 1), storageProgress: number(sd.progress, 1),
    currentLayer: integer(info.current_layer), totalLayers: integer(info.total_layer), elapsedSeconds: number(stats.print_duration),
    totalDurationSeconds: number(stats.total_duration), storage: { active: bool(sd.is_active), filePositionBytes, fileSizeBytes }, tools,
    bed: { temperature: number(bed.temperature, 200), target: number(bed.target, 200) }, exceptionPresent, controllerState,
    messageCode: controllerState === 'shutdown' || controllerState === 'error' ? 'controller_error' : exceptionPresent === true ? 'printer_exception' : typeof stats.message === 'string' && stats.message.length > 0 ? 'printer_message' : null,
  };
};
