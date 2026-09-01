export const CAMERA_SCENARIOS = [
  { value: 'loading', label: 'Loading' },
  { value: 'connecting', label: 'Connecting' },
  { value: 'snapshot', label: 'Snapshot' },
  { value: 'live', label: 'Simulated live' },
  { value: 'fallback', label: 'Snapshot fallback' },
  { value: 'error', label: 'Error' },
  { value: 'unsupported', label: 'Unsupported' },
] as const;

export type CameraScenario = typeof CAMERA_SCENARIOS[number]['value'];
export type CameraCapabilityPolicy = 'native' | 'unsupported' | 'denied';
export const CAMERA_CAPABILITIES = [
  { value: 'native', label: 'Native capabilities' },
  { value: 'unsupported', label: 'Display unsupported' },
  { value: 'denied', label: 'Simulated display rejection' },
] as const;
export type CameraMeasurement = { fps: number | null; displayedAt: string | null; playing: boolean; unavailable?: boolean };
export const CAMERA_FIXTURE_TIME = '2026-09-01T12:00:00.000Z';
export const isCameraScenario = (value: unknown): value is CameraScenario => CAMERA_SCENARIOS.some((item) => item.value === value);
export const cameraScenario = (value: unknown): CameraScenario => isCameraScenario(value) ? value : 'error';
export const cameraCapability = (value: unknown): CameraCapabilityPolicy => CAMERA_CAPABILITIES.some((item) => item.value === value) ? value as CameraCapabilityPolicy : 'unsupported';

// Counts come only from presented/decoded video evidence, never drawing ticks.
export const frameRate = (before: number, after: number, elapsed: number): number | null => {
  if (![before, after, elapsed].every(Number.isFinite) || before < 0 || after <= before || elapsed < 1000) return null;
  const fps = Math.round((after - before) * 1000 / elapsed);
  return fps > 0 && fps <= 240 ? fps : null;
};
