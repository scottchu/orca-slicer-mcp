export const LAB_VIEWS = [
  'overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history',
  'queue', 'fans', 'bed_mesh'
] as const;
export type LabView = (typeof LAB_VIEWS)[number];
export type LabFreshness = 'fresh' | 'stale' | 'offline' | 'unknown';
type LabBase<K extends Exclude<LabView, 'bed_mesh'>> = {
  schema: 'u1.observation-lab.v1';
  fixture: true;
  kind: K;
  sourceObservedAt: string;
  freshness: LabFreshness;
};

export type ProgressObservation = LabBase<'progress'> & {
  state: 'printing' | 'paused' | 'complete' | 'standby';
  percent: number;
  currentLayer: number;
  totalLayers: number;
  elapsedSeconds: number;
  etaSeconds: number;
};
export type ThermalReading = {
  id: 'tool-1' | 'tool-2' | 'tool-3' | 'tool-4' | 'bed' | 'cavity';
  actualC: number;
  targetC: number | null;
  active: boolean;
};
export type ThermalsObservation = LabBase<'thermals'> & { readings: ThermalReading[] };
export type HeadReading = {
  physicalTool: 1 | 2 | 3 | 4;
  active: boolean;
  headState: 'active' | 'parked' | 'heating' | 'cooling' | 'standby' | 'idle' | 'unknown';
  presence: boolean | null;
  material: string | null;
  color: string | null;
  actualC: number;
  targetC: number;
};
export type HeadsObservation = LabBase<'heads'> & { items: HeadReading[] };
export type CurrentJobObservation = LabBase<'jobs'> & {
  state: 'printing' | 'paused' | 'complete' | 'standby';
  storageActive: boolean;
  progressPercent: number;
  elapsedSeconds: number;
  filamentUsedMm: number;
};
export type HistoryItem = {
  position: number;
  status: 'completed' | 'cancelled' | 'error' | 'interrupted';
  endedAt: string;
  durationSeconds: number;
};
export type JobHistoryObservation = LabBase<'job_history'> & { items: HistoryItem[] };
export type QueueItem = { position: number; addedAt: string; waitingSeconds: number };
export type QueueObservation = LabBase<'queue'> & {
  queueState: 'ready' | 'loading' | 'starting' | 'paused';
  items: QueueItem[];
};
export type FanReading = {
  id: 'tool-1-part' | 'tool-2-part' | 'tool-3-part' | 'tool-4-part' |
    'cavity' | 'purifier-exhaust' | 'purifier-inner';
  percent: number | null;
  rpm: number | null;
};
export type FansObservation = LabBase<'fans'> & {
  items: FanReading[];
  purifierMode: 'idle' | 'cool_chamber' | 'preheat_chamber' | 'hot_chamber' | null;
};
export type OverviewObservation = LabBase<'overview'> & {
  progress: { state: ProgressObservation['state']; percent: number };
  thermals: { nozzleC: number; bedC: number; cavityC: number };
  heads: { loaded: number; activeTool: 1 | 2 | 3 | 4 | null };
  jobs: { state: CurrentJobObservation['state'] };
  jobHistory: { returned: number };
  queue: { state: QueueObservation['queueState']; count: number };
  fans: { active: number };
  bedMesh: { rangeMm: number };
};

type RecordValue = Record<string, unknown>;
const isoTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const safeMaterial = /^[\p{L}\p{N} _+().-]{1,64}$/u;
const hexColor = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/i;
const freshness = new Set<LabFreshness>(['fresh', 'stale', 'offline', 'unknown']);

function record(value: unknown, message = 'Invalid lab observation'): RecordValue {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(message);
  return value as RecordValue;
}
function exact(value: RecordValue, keys: string[], message = 'Invalid lab observation'): void {
  if (Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new Error(message);
}
function canonicalTime(value: unknown): string {
  if (typeof value !== 'string' || !isoTime.test(value)) throw new Error('Invalid lab observation time');
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) throw new Error('Invalid lab observation time');
  return value;
}
function finite(value: unknown, minimum: number, maximum: number, message = 'Invalid lab number'): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) throw new Error(message);
  return value;
}
function integer(value: unknown, minimum: number, maximum: number, message = 'Invalid lab integer'): number {
  const number = finite(value, minimum, maximum, message);
  if (!Number.isInteger(number)) throw new Error(message);
  return number;
}
function oneOf<T extends string>(value: unknown, values: readonly T[], message: string): T {
  if (typeof value !== 'string' || !values.includes(value as T)) throw new Error(message);
  return value as T;
}
function base<K extends Exclude<LabView, 'bed_mesh'>>(value: unknown, kind: K): RecordValue & LabBase<K> {
  const item = record(value);
  if (item.schema !== 'u1.observation-lab.v1' || item.fixture !== true || item.kind !== kind ||
      typeof item.freshness !== 'string' || !freshness.has(item.freshness as LabFreshness)) {
    throw new Error('Invalid lab observation envelope');
  }
  canonicalTime(item.sourceObservedAt);
  return item as RecordValue & LabBase<K>;
}
const baseKeys = ['schema', 'fixture', 'kind', 'sourceObservedAt', 'freshness'];

export function validateProgress(value: unknown): ProgressObservation {
  const item = base(value, 'progress');
  exact(item, [...baseKeys, 'state', 'percent', 'currentLayer', 'totalLayers', 'elapsedSeconds', 'etaSeconds']);
  const result = {
    ...item,
    state: oneOf(item.state, ['printing', 'paused', 'complete', 'standby'], 'Invalid progress state'),
    percent: finite(item.percent, 0, 100),
    currentLayer: integer(item.currentLayer, 0, 1_000_000),
    totalLayers: integer(item.totalLayers, 1, 1_000_000),
    elapsedSeconds: integer(item.elapsedSeconds, 0, 31_536_000),
    etaSeconds: integer(item.etaSeconds, 0, 31_536_000)
  } as ProgressObservation;
  if (result.currentLayer > result.totalLayers) throw new Error('Invalid progress layers');
  return result;
}

export function validateThermals(value: unknown): ThermalsObservation {
  const item = base(value, 'thermals');
  exact(item, [...baseKeys, 'readings']);
  if (!Array.isArray(item.readings) || item.readings.length !== 6) throw new Error('Invalid thermal readings');
  const ids = ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'bed', 'cavity'] as const;
  const readings = item.readings.map((reading, index) => {
    const row = record(reading, 'Invalid thermal reading');
    exact(row, ['id', 'actualC', 'targetC', 'active'], 'Invalid thermal reading');
    if (row.id !== ids[index] || typeof row.active !== 'boolean') throw new Error('Invalid thermal reading');
    if (row.targetC !== null) finite(row.targetC, 0, 400, 'Invalid thermal target');
    return { id: ids[index], actualC: finite(row.actualC, -20, 400), targetC: row.targetC as number | null, active: row.active };
  });
  return { ...item, readings } as ThermalsObservation;
}

function material(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !safeMaterial.test(value) || !value.trim()) throw new Error('Invalid material label');
  const normalized = value.trim();
  if (normalized === '.' || normalized === '..') throw new Error('Invalid material label');
  return normalized;
}
export function validateHeads(value: unknown): HeadsObservation {
  const item = base(value, 'heads');
  exact(item, [...baseKeys, 'items']);
  if (!Array.isArray(item.items) || item.items.length !== 4) throw new Error('Invalid head items');
  const items = item.items.map((head, index) => {
    const row = record(head, 'Invalid head item');
    exact(row, ['physicalTool', 'active', 'headState', 'presence', 'material', 'color', 'actualC', 'targetC'], 'Invalid head item');
    if (row.physicalTool !== index + 1 || typeof row.active !== 'boolean' ||
        (row.presence !== null && typeof row.presence !== 'boolean') ||
        (row.color !== null && (typeof row.color !== 'string' || !hexColor.test(row.color)))) throw new Error('Invalid head item');
    const normalizedMaterial = material(row.material);
    const normalizedColor = typeof row.color === 'string' ? row.color.toUpperCase() : null;
    return { physicalTool: (index + 1) as 1 | 2 | 3 | 4, active: row.active, headState: oneOf(row.headState, ['active', 'parked', 'heating', 'cooling', 'standby', 'idle', 'unknown'], 'Invalid head state'), presence: row.presence as boolean | null,
      material: normalizedMaterial, color: normalizedColor,
      actualC: finite(row.actualC, -20, 400), targetC: finite(row.targetC, 0, 400) };
  });
  if (items.filter((head) => head.active).length > 1) throw new Error('Invalid active heads');
  return { ...item, items } as HeadsObservation;
}

export function validateCurrentJob(value: unknown): CurrentJobObservation {
  const item = base(value, 'jobs');
  exact(item, [...baseKeys, 'state', 'storageActive', 'progressPercent', 'elapsedSeconds', 'filamentUsedMm']);
  if (typeof item.storageActive !== 'boolean') throw new Error('Invalid current job storage');
  return { ...item,
    state: oneOf(item.state, ['printing', 'paused', 'complete', 'standby'], 'Invalid current job state'),
    storageActive: item.storageActive, progressPercent: finite(item.progressPercent, 0, 100),
    elapsedSeconds: integer(item.elapsedSeconds, 0, 31_536_000), filamentUsedMm: finite(item.filamentUsedMm, 0, 100_000_000)
  } as CurrentJobObservation;
}

export function validateJobHistory(value: unknown): JobHistoryObservation {
  const item = base(value, 'job_history');
  exact(item, [...baseKeys, 'items']);
  if (!Array.isArray(item.items) || item.items.length > 20) throw new Error('Invalid history items');
  const items = item.items.map((history, index) => {
    const row = record(history, 'Invalid history item');
    exact(row, ['position', 'status', 'endedAt', 'durationSeconds'], 'Invalid history item');
    if (row.position !== index + 1) throw new Error('Invalid history position');
    return { position: index + 1,
      status: oneOf(row.status, ['completed', 'cancelled', 'error', 'interrupted'], 'Invalid history status'),
      endedAt: canonicalTime(row.endedAt), durationSeconds: integer(row.durationSeconds, 0, 31_536_000) };
  });
  return { ...item, items } as JobHistoryObservation;
}

export function validateQueue(value: unknown): QueueObservation {
  const item = base(value, 'queue');
  exact(item, [...baseKeys, 'queueState', 'items']);
  if (!Array.isArray(item.items) || item.items.length > 100) throw new Error('Invalid queue items');
  const items = item.items.map((queue, index) => {
    const row = record(queue, 'Invalid queue item');
    exact(row, ['position', 'addedAt', 'waitingSeconds'], 'Invalid queue item');
    if (row.position !== index + 1) throw new Error('Invalid queue position');
    return { position: index + 1, addedAt: canonicalTime(row.addedAt), waitingSeconds: integer(row.waitingSeconds, 0, 31_536_000) };
  });
  return { ...item, queueState: oneOf(item.queueState, ['ready', 'loading', 'starting', 'paused'], 'Invalid queue state'), items } as QueueObservation;
}

export function validateFans(value: unknown): FansObservation {
  const item = base(value, 'fans');
  exact(item, [...baseKeys, 'items', 'purifierMode']);
  if (!Array.isArray(item.items) || item.items.length !== 7) throw new Error('Invalid fan items');
  const ids: FanReading['id'][] = ['tool-1-part', 'tool-2-part', 'tool-3-part', 'tool-4-part', 'cavity', 'purifier-exhaust', 'purifier-inner'];
  const items = item.items.map((fan, index) => {
    const row = record(fan, 'Invalid fan item');
    exact(row, ['id', 'percent', 'rpm'], 'Invalid fan item');
    if (row.id !== ids[index]) throw new Error('Invalid fan item');
    return { id: ids[index], percent: row.percent === null ? null : finite(row.percent, 0, 100), rpm: row.rpm === null ? null : integer(row.rpm, 0, 100_000) };
  });
  return { ...item, items, purifierMode: item.purifierMode === null ? null : oneOf(item.purifierMode,
    ['idle', 'cool_chamber', 'preheat_chamber', 'hot_chamber'], 'Invalid purifier mode') } as FansObservation;
}

export function validateOverview(value: unknown): OverviewObservation {
  const item = base(value, 'overview');
  exact(item, [...baseKeys, 'progress', 'thermals', 'heads', 'jobs', 'jobHistory', 'queue', 'fans', 'bedMesh']);
  const progress = record(item.progress); exact(progress, ['state', 'percent']);
  const thermals = record(item.thermals); exact(thermals, ['nozzleC', 'bedC', 'cavityC']);
  const heads = record(item.heads); exact(heads, ['loaded', 'activeTool']);
  const jobs = record(item.jobs); exact(jobs, ['state']);
  const history = record(item.jobHistory); exact(history, ['returned']);
  const queue = record(item.queue); exact(queue, ['state', 'count']);
  const fans = record(item.fans); exact(fans, ['active']);
  const bedMesh = record(item.bedMesh); exact(bedMesh, ['rangeMm']);
  const activeTool = heads.activeTool === null ? null : integer(heads.activeTool, 1, 4);
  return { ...item,
    progress: { state: oneOf(progress.state, ['printing', 'paused', 'complete', 'standby'], 'Invalid overview progress'), percent: finite(progress.percent, 0, 100) },
    thermals: { nozzleC: finite(thermals.nozzleC, -20, 400), bedC: finite(thermals.bedC, -20, 150), cavityC: finite(thermals.cavityC, -20, 100) },
    heads: { loaded: integer(heads.loaded, 0, 4), activeTool: activeTool as 1 | 2 | 3 | 4 | null },
    jobs: { state: oneOf(jobs.state, ['printing', 'paused', 'complete', 'standby'], 'Invalid overview job') },
    jobHistory: { returned: integer(history.returned, 0, 20) },
    queue: { state: oneOf(queue.state, ['ready', 'loading', 'starting', 'paused'], 'Invalid overview queue'), count: integer(queue.count, 0, 100) },
    fans: { active: integer(fans.active, 0, 7) }, bedMesh: { rangeMm: finite(bedMesh.rangeMm, 0, 20) }
  } as OverviewObservation;
}
