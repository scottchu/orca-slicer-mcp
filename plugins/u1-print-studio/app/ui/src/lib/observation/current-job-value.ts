import type { CurrentJobPresentation } from '../live/presentation';

// Presentation facts are independent of either the live transport or lab fixture.
export type CurrentJobValue = Pick<CurrentJobPresentation, 'printState' | 'filename' | 'storageActive' | 'filePositionBytes' | 'fileSizeBytes' | 'printDurationSeconds' | 'totalDurationSeconds' | 'filamentUsedMillimeters'>;
export type CurrentJobLoadingShapes = {
  state: string; fileLabel: string; filename: string; storage: string;
  quantities: readonly [string, string, string, string, string];
};

const fileLabels = {
  printing: 'Current job', paused: 'Paused job', standby: 'Loaded file',
  complete: 'Last reported job', error: 'Last reported job',
  cancelled: 'Last reported job', unknown: 'Reported file'
} as const;

export const currentJobLabels = (job: Pick<CurrentJobValue, 'printState' | 'filename' | 'storageActive'>) => {
  const state = job.printState.reported ? job.printState.value : null;
  return {
    state: state ? state[0].toUpperCase() + state.slice(1) : 'Unknown',
    filename: !job.filename.reported ? 'Unknown' : job.filename.value ?? 'No file reported',
    fileLabel: state ? fileLabels[state] : 'Reported file',
    storage: !job.storageActive.reported ? 'Unknown' : job.storageActive.value ? 'Active' : 'Inactive'
  };
};
