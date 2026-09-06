import type { ObservationView } from '../observation-presentation.js';
import { observationPayload } from '../observation-payload.js';
import type { PrinterObservationStore } from '../observation-store.js';

/** One acquisition policy for every inbound observation adapter. */
export const observationDemand = (view: ObservationView) => ({
  refresh: true,
  includeBedMesh: view === 'bed_mesh' || view === 'overview',
  includeMaterials: view === 'heads' || view === 'overview',
  includeQueue: view === 'queue' || view === 'overview',
  includeEnvironment: view === 'thermals' || view === 'fans' || view === 'overview',
  includeCurrentJob: view === 'jobs' || view === 'overview',
  includeJobHistory: view === 'job_history' || view === 'overview',
});

export const observePrinter = async (observations: PrinterObservationStore, view: ObservationView) =>
  observationPayload(await observations.current(observationDemand(view)), view);
