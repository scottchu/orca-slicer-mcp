import { HEAD_IDS } from '../../src/lib/live/heads-presentation';
const field = <T>(value: T | null) => ({ state: value === null ? 'unknown' : 'known', value });
const provenance = (sourceObservedAt: string) => ({ source: 'moonraker', sourceObservedAt, detail: 'Reported fixture values' });
export const liveHeadsResult = (version = 12, receivedAt = '2026-09-01T12:00:12.000Z') => ({
  structuredContent: {
    schemaVersion: 2, view: 'heads', observationVersion: version, sourceObservedAt: '2026-09-01T12:00:00.000Z', receivedAt,
    freshness: 'fresh', connectionEpoch: 3, reachable: true, printerState: 'printing', printerStateLabel: 'Printing', refreshAfterSeconds: 15,
    session: { identity: null, provenance: 'external', detail: 'External print' },
    module: {
      kind: 'heads', state: 'known', capabilityEvidence: 'observed', provenance: provenance('2026-09-01T12:00:00.000Z'),
      materials: { state: 'known', freshness: 'fresh', sourceObservedAt: '2026-09-01T11:59:00.000Z', receivedAt: '2026-09-01T11:59:01.000Z', checkedAt: '2026-09-01T12:00:01.000Z', reason: null as string | null },
      items: HEAD_IDS.map((physicalTool, index) => ({
        physicalTool: physicalTool as number, state: 'known', active: field<boolean>(index === 0), headState: field<string>(index === 0 ? 'HEATING' : 'PARKED'),
        temperature: field<number>(index === 0 ? 220 : 25), target: field<number>(index === 0 ? 220 : 0),
        material: field<string>(index === 3 ? null : 'Generic PLA'), vendor: field<string>(index === 3 ? null : 'Generic'), materialType: field<string>(index === 3 ? null : 'PLA'), subtype: field<string>(null),
        color: field<string>(['#FFFFFFFF', '#000000FF', '#6F4C2F80', '#FFFFFFFF'][index]), reportedPresence: field<boolean>(index !== 3),
        materialProvenance: provenance('2026-09-01T11:59:00.000Z'), provenance: provenance('2026-09-01T12:00:00.000Z'),
      })),
    },
  },
});
