import type { ObservationView } from '../observation-presentation.js';
import { observationPayload } from '../observation-payload.js';
import type { PrinterObservationStore } from '../observation-store.js';

/** One acquisition policy for every inbound observation adapter. */
export const observationDemand = (view: ObservationView) => ({
  refresh: true,
  interactiveProgress: view === 'progress',
  includeBedMesh: view === 'bed_mesh' || view === 'overview',
  includeMaterials: view === 'heads' || view === 'overview',
  includeQueue: view === 'queue' || view === 'overview',
  includeEnvironment: view === 'thermals' || view === 'fans' || view === 'overview',
  includeCurrentJob: view === 'jobs' || view === 'overview',
  includeJobHistory: view === 'job_history' || view === 'overview',
});

export const observePrinter = async (observations: PrinterObservationStore, view: ObservationView, knownToolpathId?: string) => {
  const snapshot = await observations.current(observationDemand(view));
  const result = observationPayload(snapshot, view);
  if (view !== 'progress') return result;
  if (['printing', 'paused'].includes(snapshot.status.state)) result.structuredContent.refreshAfterSeconds = 15;
  return { ...result, _meta: { progressToolpath: await observations.progressToolpath(snapshot, knownToolpathId) } };
};
