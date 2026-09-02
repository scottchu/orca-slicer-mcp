import { PrinterObservationStore } from '../../src/lib/server/observation-store';
import { normalizeEnvironmentResponse } from '../../src/lib/server/adapters/moonraker-environment';
import { normalizeMaterialResponse } from '../../src/lib/server/adapters/moonraker-materials';
import { normalizeQueueResponse } from '../../src/lib/server/adapters/moonraker-queue';
import type { U1Status } from '../../src/lib/server/u1-status';

export const createKitObservationFixture = () => {
  let now = Date.parse('2026-09-01T12:00:00Z');
  let failure = false;
  let held = false;
  const reads = { statusReads: 0, environmentReads: 0, materialsReads: 0, queueReads: 0 };
  const waiting = new Set<() => void>();
  const acquire = async (domain: keyof typeof reads) => {
    reads[domain]++;
    if (held) await new Promise<void>((resolve) => waiting.add(resolve));
    if (failure) throw new Error('Synthetic acquisition failure');
  };
  const receipt = () => new Date(now).toISOString();
  const observations = new PrinterObservationStore(async () => {
    await acquire('statusReads');
    const status: U1Status = {
      schemaVersion: 1, stateVersion: 1, observedAt: receipt(), reachable: true,
      state: 'standby', stateLabel: 'Ready', progressPercent: null, currentLayer: null,
      totalLayers: null, elapsedSeconds: null, remainingSeconds: null, refreshAfterSeconds: 90,
      filename: null, activePhysicalTool: 1,
      tools: [1, 2, 3, 4].map((physicalTool) => ({ physicalTool, temperature: physicalTool === 1 ? 220 : 33, target: physicalTool === 1 ? 200 : 0, active: physicalTool === 1, state: physicalTool === 1 ? 'ACTIVE' : 'PARKED' })),
      bed: { temperature: 55, target: 55 },
      storage: { active: null, filePosition: null, fileSize: null }, printerMessage: null,
      exception: false, camera: { available: false, service: null, targetFps: null }
    };
    return { status, metadata: {} };
  }, () => new Date(now), undefined, async () => {
    await acquire('materialsReads');
    return normalizeMaterialResponse({ result: { status: { print_task_config: {
      filament_exist: [true, true, true, false], filament_vendor: ['Generic', 'Generic', 'Generic', 'Generic'],
      filament_type: ['PLA', 'PLA', 'PLA', 'PLA'], filament_color_rgba: ['ffffffff', '000000ff', '6f4c2f80', 'ffffffff']
    } } } }, receipt());
  }, async () => {
    await acquire('queueReads');
    return normalizeQueueResponse({ result: { queue_state: 'paused', queued_jobs: [
      { filename: 'First fixture.gcode', time_added: 1700000000, time_in_queue: 5 },
      { filename: 'Second fixture.gcode', time_added: 1700000001, time_in_queue: 4 },
      { filename: 'Third fixture.gcode', time_added: 1700000002, time_in_queue: 3 }
    ] } }, receipt());
  }, async () => {
    await acquire('environmentReads');
    return normalizeEnvironmentResponse({ result: { status: {
      fan: { speed: 0.5, rpm: 1200 }, purifier: { power_detected: true, mode: 2 },
      'temperature_sensor cavity': { temperature: 31.5 }
    } } }, receipt());
  });
  const release = () => { for (const resolve of waiting) resolve(); waiting.clear(); };
  return {
    observations,
    counts: () => ({ ...reads }),
    configure: (value: { fail?: boolean; hold?: boolean; reset?: boolean }) => {
      now += 300_000;
      if (value.reset) for (const domain of Object.keys(reads) as Array<keyof typeof reads>) reads[domain] = 0;
      failure = value.fail ?? false;
      held = value.hold ?? false;
      if (!held) release();
    },
    release
  };
};
