import { validateBedMeshObservation, type BedMeshObservation } from '../bed-mesh/types';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import { bedMeshSelectionSearch, readBedMeshSelection, type BedMeshLabSelection } from '../bed-mesh/lab-controller';
import type { WidgetState } from '../ui/state';

export const resolveBedMeshFixture = (selection: BedMeshLabSelection): BedMeshObservation => {
  const canonical = readBedMeshSelection(bedMeshSelectionSearch(selection));
  const matrix = bedMeshLabFixture.matrix.map((row, y) => row.map((value, x) =>
    canonical.scenario === 'flat' ? 0 : canonical.scenario === 'tilted' ? Number(((x + y) / 100 - 0.1).toFixed(4)) : value));
  const minimum = Math.min(...matrix.flat());
  const maximum = Math.max(...matrix.flat());
  return validateBedMeshObservation({ ...bedMeshLabFixture, freshness: canonical.freshness, matrix,
    summary: { ...bedMeshLabFixture.summary, minimum, maximum, range: maximum - minimum } });
};

export const previewBedMeshState = (selection: BedMeshLabSelection): WidgetState<BedMeshObservation> =>
  selection.phase === 'ready' || selection.phase === 'refreshing'
    ? { kind: 'ready', observation: resolveBedMeshFixture(selection), refreshing: selection.phase === 'refreshing' }
    : { kind: selection.phase };
