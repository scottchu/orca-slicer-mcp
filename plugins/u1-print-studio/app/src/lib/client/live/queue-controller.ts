import { createObservationController } from './controller';
import { adaptQueue } from './queue-adapter';
import type { ObservationPort } from './observation-port';
export const createQueueController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptQueue, 'Print Queue', timeoutMs);
