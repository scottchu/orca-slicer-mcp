import { createObservationController, domainAcquisitionFailure } from './controller';
import { adaptBedMesh } from './bed-mesh-adapter';
import type { ObservationPort } from './observation-port';
export const createBedMeshController = (port: ObservationPort, timeoutMs = 20_000) => createObservationController(port, adaptBedMesh, 'Bed Mesh', timeoutMs,
  observation => observation.receipt.reason === 'not_reported' ? 'unsupported' : domainAcquisitionFailure(observation));
