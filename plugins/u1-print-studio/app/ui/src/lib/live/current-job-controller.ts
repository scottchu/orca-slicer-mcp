import { createObservationController } from './controller.js';
import { adaptCurrentJob } from './current-job-adapter.js';
import type { ObservationPort } from './observation-port.js';

export const createCurrentJobController = (port: ObservationPort, timeoutMs = 20_000) =>
  createObservationController(port, adaptCurrentJob, 'Current Job', timeoutMs);
