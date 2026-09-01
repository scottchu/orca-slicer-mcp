import type {
  FansObservation, HeadsObservation, JobHistoryObservation, CurrentJobObservation,
  OverviewObservation, ProgressObservation, QueueObservation, ThermalsObservation
} from '../observation/types';

const base = <K extends string>(kind: K) => ({
  schema: 'u1.observation-lab.v1' as const,
  fixture: true as const,
  kind,
  sourceObservedAt: '2026-09-01T12:00:00.000Z',
  freshness: 'fresh' as const
});

export const progressLabFixture: ProgressObservation = {
  ...base('progress'), state: 'printing', percent: 64, currentLayer: 416,
  totalLayers: 650, elapsedSeconds: 11_460, etaSeconds: 6_420
};
export const thermalsLabFixture: ThermalsObservation = {
  ...base('thermals'), readings: [
    { id: 'tool-1', actualC: 220, targetC: 220, active: true },
    { id: 'tool-2', actualC: 44, targetC: 0, active: false },
    { id: 'tool-3', actualC: 33, targetC: 0, active: false },
    { id: 'tool-4', actualC: 33, targetC: 0, active: false },
    { id: 'bed', actualC: 55, targetC: 55, active: true },
    { id: 'cavity', actualC: 33, targetC: null, active: false }
  ]
};
export const headsLabFixture: HeadsObservation = {
  ...base('heads'), items: [
    { physicalTool: 1, active: true, presence: true, material: 'Generic PLA', color: '#F4B927', actualC: 220, targetC: 220 },
    { physicalTool: 2, active: false, presence: true, material: 'Generic PLA', color: '#111111', actualC: 44, targetC: 0 },
    { physicalTool: 3, active: false, presence: true, material: 'Generic PETG', color: '#3487C8', actualC: 33, targetC: 0 },
    { physicalTool: 4, active: false, presence: false, material: null, color: null, actualC: 33, targetC: 0 }
  ]
};
export const currentJobLabFixture: CurrentJobObservation = {
  ...base('jobs'), state: 'printing', storageActive: true, progressPercent: 64,
  elapsedSeconds: 11_460, filamentUsedMm: 18_420
};
export const jobHistoryLabFixture: JobHistoryObservation = {
  ...base('job_history'), items: [
    { position: 1, status: 'completed', endedAt: '2026-09-01T09:42:00.000Z', durationSeconds: 13_260 },
    { position: 2, status: 'completed', endedAt: '2026-08-31T21:15:00.000Z', durationSeconds: 7_980 },
    { position: 3, status: 'cancelled', endedAt: '2026-08-31T16:04:00.000Z', durationSeconds: 1_440 },
    { position: 4, status: 'completed', endedAt: '2026-08-31T12:30:00.000Z', durationSeconds: 18_720 }
  ]
};
export const queueLabFixture: QueueObservation = {
  ...base('queue'), queueState: 'ready', items: [
    { position: 1, addedAt: '2026-09-01T11:45:00.000Z', waitingSeconds: 900 },
    { position: 2, addedAt: '2026-09-01T11:52:00.000Z', waitingSeconds: 480 },
    { position: 3, addedAt: '2026-09-01T11:58:00.000Z', waitingSeconds: 120 }
  ]
};
export const fansLabFixture: FansObservation = {
  ...base('fans'), purifierMode: 'cool_chamber', items: [
    { id: 'tool-1-part', percent: 100, rpm: 9126 },
    { id: 'tool-2-part', percent: 0, rpm: 0 },
    { id: 'tool-3-part', percent: 0, rpm: 0 },
    { id: 'tool-4-part', percent: 0, rpm: 0 },
    { id: 'cavity', percent: 70, rpm: 2372 },
    { id: 'purifier-exhaust', percent: 40, rpm: 1380 },
    { id: 'purifier-inner', percent: 40, rpm: 1215 }
  ]
};
export const overviewLabFixture: OverviewObservation = {
  ...base('overview'),
  progress: { state: 'printing', percent: 64 },
  thermals: { nozzleC: 220, bedC: 55, cavityC: 33 },
  heads: { loaded: 3, activeTool: 1 },
  jobs: { state: 'printing' },
  jobHistory: { returned: 20 },
  queue: { state: 'ready', count: 3 },
  fans: { active: 4 },
  bedMesh: { rangeMm: 0.311 }
};
