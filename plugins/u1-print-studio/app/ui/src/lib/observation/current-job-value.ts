import type { CurrentJobPresentation } from '../live/presentation';

// Presentation facts are independent of either the live transport or lab fixture.
export type CurrentJobValue = Pick<CurrentJobPresentation, 'printState' | 'filename' | 'storageActive' | 'filePositionBytes' | 'fileSizeBytes' | 'printDurationSeconds' | 'totalDurationSeconds' | 'filamentUsedMillimeters'>;

export const currentJobLabels = (job: CurrentJobValue) => {
  const state = job.printState.reported ? job.printState.value : null;
  return {
    state: state ? state[0].toUpperCase() + state.slice(1) : 'Unknown',
    filename: !job.filename.reported ? 'Unknown' : job.filename.value ?? 'No file reported',
    fileLabel: state === 'printing' || state === 'paused' ? 'Printing file' : 'Reported file',
    storage: !job.storageActive.reported ? 'Unknown' : job.storageActive.value ? 'Active' : 'Inactive'
  };
};
