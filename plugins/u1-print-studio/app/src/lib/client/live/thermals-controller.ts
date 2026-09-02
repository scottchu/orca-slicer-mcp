import { createObservationController } from './controller';
import { adaptThermals } from './thermals-adapter';
import type { ObservationPort } from './observation-port';
export const createThermalsController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptThermals, 'Thermals', timeoutMs);
