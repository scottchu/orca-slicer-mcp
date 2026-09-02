import type { LabSelection } from './controller';
import { resolveObservationFixture } from './observation-fixtures';
import { currentJobLabels, type CurrentJobLoadingShapes } from '../observation/current-job-value';
import { formatQuantity } from '../ui/quantity';
import { formatDurationValue } from '../ui/duration';

// Closed synthetic layout only; excluded from every production client graph.
export const currentJobLoadingShapes = (selection: LabSelection<'jobs'>): CurrentJobLoadingShapes => {
  const fixture = resolveObservationFixture(selection);
  const labels = currentJobLabels({
    printState: { reported: true, value: fixture.state },
    filename: { reported: fixture.filenameReported, value: fixture.filename },
    storageActive: { reported: fixture.storageActive !== null, value: fixture.storageActive }
  });
  const numericShape = (text: string) => text.replace(/\p{N}/gu, '0');
  return { ...labels, quantities: [
    numericShape(formatQuantity(fixture.filePositionBytes, 'bytes').text),
    numericShape(formatQuantity(fixture.fileSizeBytes, 'bytes').text),
    numericShape(formatDurationValue(fixture.printDurationSeconds).visible),
    numericShape(formatDurationValue(fixture.totalDurationSeconds).visible),
    numericShape(formatQuantity(fixture.filamentUsedMillimeters, 'mm').text)
  ] };
};
