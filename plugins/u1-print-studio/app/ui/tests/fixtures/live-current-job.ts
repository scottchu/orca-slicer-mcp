export const currentJobField = <T>(reported: boolean, value: T | null) => ({ reported, value });

export const liveCurrentJobResult = (version = 12, receivedAt = '2026-09-01T12:00:12.000Z') => ({
  structuredContent: {
    schemaVersion: 2, view: 'jobs', observationVersion: version,
    sourceObservedAt: '2026-09-01T12:00:00.000Z', receivedAt, freshness: 'fresh', connectionEpoch: 3,
    reachable: true, printerState: 'printing', printerStateLabel: 'Printing', refreshAfterSeconds: 15,
    session: { identity: null, provenance: 'external', detail: 'External print' },
    module: {
      kind: 'jobs', state: 'known', freshness: 'fresh', sourceObservedAt: '2026-09-01T11:59:58.000Z',
      receivedAt: '2026-09-01T11:59:59.000Z', checkedAt: '2026-09-01T12:00:01.000Z',
      printState: currentJobField(true, 'printing'), filename: currentJobField(true, 'model.gcode'),
      storageActive: currentJobField(true, true), filePositionBytes: currentJobField(true, 0),
      fileSizeBytes: currentJobField(true, Number.MAX_SAFE_INTEGER), totalDurationSeconds: currentJobField(true, 12.5),
      printDurationSeconds: currentJobField(true, 0), filamentUsedMillimeters: currentJobField(true, 0), reason: null as string | null,
      capabilityEvidence: 'observed',
      provenance: { source: 'moonraker', sourceObservedAt: '2026-09-01T11:59:58.000Z', detail: 'Fixed Current Job projection' },
    },
  },
});
