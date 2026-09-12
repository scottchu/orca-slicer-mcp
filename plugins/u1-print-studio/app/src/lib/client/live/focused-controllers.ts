import { createObservationController, domainAcquisitionFailure } from './controller';
import type { ObservationPort } from './observation-port';
import { adaptProgress } from './progress-adapter';
import { adaptJobs } from './jobs-adapter';
import { adaptHistory } from './history-adapter';
import { adaptOverview } from './overview-adapter';
export const createProgressController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptProgress, 'Print Progress', timeoutMs);
export const createJobsController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptJobs, 'Current Job', timeoutMs, domainAcquisitionFailure);
export const createHistoryController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptHistory, 'Job History', timeoutMs, domainAcquisitionFailure);
// Overview has independent per-tile receipts; stale main status cannot mask
// healthy independent domains. The adapter validates each tile's evidence.
export const createOverviewController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptOverview, 'Overview', timeoutMs, () => null);
