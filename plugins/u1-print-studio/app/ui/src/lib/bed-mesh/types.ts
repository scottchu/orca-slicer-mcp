export type BedMeshObservation = {
  schema: 'u1.bed-mesh.presentation.v1';
  sourceObservedAt: string | null;
  freshness: 'fresh' | 'stale' | 'offline' | 'unknown';
  profile: string | null;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  matrix: number[][];
  summary: { minimum: number; maximum: number; range: number; rows: number; columns: number };
  fixture?: boolean;
};

export const BED_MESH_SUMMARY_TOLERANCE_MM = 0.000001;

const freshnessValues = new Set<BedMeshObservation['freshness']>([
  'fresh', 'stale', 'offline', 'unknown'
]);
const isoTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validSourceTime(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== 'string' || value.length > 40 || !isoTime.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function validateBedMeshObservation(value: unknown): BedMeshObservation {
  if (!record(value) || value.schema !== 'u1.bed-mesh.presentation.v1') {
    throw new Error('Invalid bed mesh presentation');
  }
  if (!validSourceTime(value.sourceObservedAt) ||
      typeof value.freshness !== 'string' ||
      !freshnessValues.has(value.freshness as BedMeshObservation['freshness'])) {
    throw new Error('Invalid bed mesh source metadata');
  }
  if (value.profile !== null && (
    typeof value.profile !== 'string' || value.profile.length < 1 ||
    value.profile.length > 80 || value.profile !== value.profile.trim() ||
    /[\u0000-\u001f\u007f]/.test(value.profile)
  )) {
    throw new Error('Invalid bed mesh profile');
  }
  if (value.fixture !== undefined && typeof value.fixture !== 'boolean') {
    throw new Error('Invalid bed mesh fixture marker');
  }
  if (!Array.isArray(value.matrix) || value.matrix.length < 2 || value.matrix.length > 64) {
    throw new Error('Invalid bed mesh matrix');
  }
  const matrix = value.matrix;
  const firstRow = matrix[0];
  const columns = Array.isArray(firstRow) ? firstRow.length : 0;
  if (columns < 2 || columns > 64 || matrix.some((row) =>
    !Array.isArray(row) || row.length !== columns ||
    row.some((cell) => typeof cell !== 'number' || !Number.isFinite(cell)))) {
    throw new Error('Invalid bed mesh matrix');
  }
  if (!record(value.bounds)) throw new Error('Invalid bed mesh bounds');
  const bounds = value.bounds;
  const boundValues = [bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax];
  if (boundValues.some((item) => typeof item !== 'number' || !Number.isFinite(item)) ||
      (bounds.xMin as number) >= (bounds.xMax as number) ||
      (bounds.yMin as number) >= (bounds.yMax as number)) {
    throw new Error('Invalid bed mesh bounds');
  }
  if (!record(value.summary)) throw new Error('Invalid bed mesh summary');
  const summary = value.summary;
  if (summary.rows !== matrix.length || summary.columns !== columns ||
      ![summary.minimum, summary.maximum, summary.range].every((item) =>
        typeof item === 'number' && Number.isFinite(item))) {
    throw new Error('Invalid bed mesh summary');
  }

  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const row of matrix as number[][]) {
    for (const cell of row) {
      minimum = Math.min(minimum, cell);
      maximum = Math.max(maximum, cell);
    }
  }
  const range = maximum - minimum;
  if (Math.abs((summary.minimum as number) - minimum) > BED_MESH_SUMMARY_TOLERANCE_MM ||
      Math.abs((summary.maximum as number) - maximum) > BED_MESH_SUMMARY_TOLERANCE_MM ||
      Math.abs((summary.range as number) - range) > BED_MESH_SUMMARY_TOLERANCE_MM) {
    throw new Error('Invalid bed mesh summary consistency');
  }

  return {
    schema: value.schema,
    sourceObservedAt: value.sourceObservedAt,
    freshness: value.freshness as BedMeshObservation['freshness'],
    profile: value.profile as string | null,
    bounds: bounds as BedMeshObservation['bounds'],
    matrix: matrix as number[][],
    summary: { minimum, maximum, range, rows: matrix.length, columns },
    ...(value.fixture === undefined ? {} : { fixture: value.fixture })
  };
}
