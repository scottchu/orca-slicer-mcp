import type { BedMeshObservation } from '../bed-mesh/types';

const rows = 11;
const columns = 11;
const matrix = Array.from({ length: rows }, (_, row) =>
  Array.from({ length: columns }, (_, column) => {
    const x = column / (columns - 1);
    const y = row / (rows - 1);
    return Number((-0.12 + 0.14 * x + 0.09 * y + 0.075 * Math.sin(x * Math.PI * 1.5) - 0.055 * Math.cos(y * Math.PI * 2) + 0.035 * Math.sin((x + y) * Math.PI * 3)).toFixed(5));
  })
);
const values = matrix.flat();
const minimum = Math.min(...values);
const maximum = Math.max(...values);

export const bedMeshLabFixture: BedMeshObservation = {
  schema: 'u1.bed-mesh.presentation.v1',
  sourceObservedAt: '2026-09-01T12:00:00.000Z',
  freshness: 'fresh',
  profile: 'Lab fixture',
  bounds: { xMin: 3, xMax: 267, yMin: 3, yMax: 267 },
  matrix,
  summary: { minimum, maximum, range: maximum - minimum, rows, columns },
  fixture: true
};
