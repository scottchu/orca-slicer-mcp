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

export function validateBedMeshObservation(value: BedMeshObservation): BedMeshObservation {
  const { matrix, bounds, summary } = value;
  if (value.schema !== 'u1.bed-mesh.presentation.v1' || matrix.length < 2 || matrix.length > 64) throw new Error('Invalid bed mesh presentation');
  const columns = matrix[0]?.length ?? 0;
  if (columns < 2 || columns > 64 || matrix.some((row) => row.length !== columns || row.some((cell) => !Number.isFinite(cell)))) throw new Error('Invalid bed mesh matrix');
  if (![bounds.xMin, bounds.xMax, bounds.yMin, bounds.yMax].every(Number.isFinite) || bounds.xMin >= bounds.xMax || bounds.yMin >= bounds.yMax) throw new Error('Invalid bed mesh bounds');
  if (summary.rows !== matrix.length || summary.columns !== columns || ![summary.minimum, summary.maximum, summary.range].every(Number.isFinite)) throw new Error('Invalid bed mesh summary');
  return value;
}
