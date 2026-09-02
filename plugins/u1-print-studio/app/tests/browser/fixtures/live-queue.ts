import type { QueueObservation } from '../../../src/lib/server/application/queue-observation';
import { liveFansResult } from './live-fans';

export const liveQueueResult = (count = 3, version = 12, receivedAt = '2026-09-01T12:00:12.000Z') => {
  const queue: QueueObservation = {
    state: 'known', freshness: 'fresh', sourceObservedAt: '2026-09-01T11:59:58.000Z', receivedAt: '2026-09-01T11:59:58.000Z', checkedAt: '2026-09-01T11:59:58.000Z',
    queueState: 'paused', totalCount: count, truncated: count > 100, reason: null,
    items: Array.from({ length: Math.min(count, 100) }, (_, index) => ({ position: index + 1, filename: index < 2 ? 'Repeated fixture.gcode' : `Fixture ${index + 1}.gcode`, timeAdded: index % 2 ? null : '2026-09-01T11:58:00.000Z', timeInQueueSeconds: index % 2 ? null : index * 2.5 }))
  };
  return { structuredContent: { ...liveFansResult(version, receivedAt).structuredContent, view: 'queue', module: {
    ...queue, kind: 'queue', capabilityEvidence: 'observed', provenance: { source: 'moonraker', sourceObservedAt: queue.sourceObservedAt, detail: 'Server receipt of reported queue order and waiting times, not print start acknowledgement or a print ETA' }
  } } };
};
