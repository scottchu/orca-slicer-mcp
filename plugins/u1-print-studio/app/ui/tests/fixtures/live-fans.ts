import { FAN_IDS } from '../../src/lib/live/presentation';
export const liveFansResult = (version = 12, receivedAt = '2026-09-01T12:00:12.000Z') => ({
  structuredContent: {
    schemaVersion: 2, view: 'fans', observationVersion: version, sourceObservedAt: '2026-09-01T12:00:00.000Z', receivedAt,
    freshness: 'fresh', connectionEpoch: 3, reachable: true, printerState: 'printing', printerStateLabel: 'Printing', refreshAfterSeconds: 15,
    session: { identity: null, provenance: 'external', detail: 'External print' },
    module: {
      kind: 'fans', state: 'known', freshness: 'fresh', capabilityEvidence: 'observed',
      provenance: { source: 'moonraker', sourceObservedAt: '2026-09-01T11:59:58.000Z', detail: 'Reported environment' },
      receivedAt: '2026-09-01T11:59:59.000Z', checkedAt: '2026-09-01T12:00:01.000Z', reason: null as string | null,
      items: FAN_IDS.map((id, index) => ({ id, label: id, group: index < 4 ? 'part_cooling' : 'air_handling', state: 'known', speedReported: true, speedFraction: index === 0 ? 1 : 0, rpmReported: true, rpm: index === 0 ? 1_000_000 as number | null : 0 as number | null })),
      purifier: { state: 'known', powerDetected: true as boolean | null, mode: 'preheat_chamber' as string | null, capabilityEvidence: 'observed' }
    }
  }, _meta: { private: 'test-only metadata' }
});
