import { liveFansResult } from './live-fans';
import { THERMAL_IDS } from '../../src/lib/live/presentation';
type InputField<T> = { state: string; value: T | null };
type InputRow = { id: string; label: string; state: string; capabilityEvidence: string; actual: InputField<number>; target?: InputField<number>; active?: InputField<boolean>; heaterState?: InputField<string>; reportedState?: string; provenance: { source: string; sourceObservedAt: string; detail: string } };
export const liveThermalsResult = (version = 12, receivedAt = '2026-09-01T12:00:12.000Z') => ({
  structuredContent: {
    ...liveFansResult(version, receivedAt).structuredContent, view: 'thermals',
    module: {
      kind: 'thermals', state: 'known', capabilityEvidence: 'observed',
      provenance: { source: 'moonraker', sourceObservedAt: '2026-09-01T12:00:00.000Z', detail: 'Cached thermal observation' },
      environment: { state: 'known', freshness: 'fresh', sourceObservedAt: '2026-09-01T11:59:58.000Z', receivedAt: '2026-09-01T11:59:59.000Z', checkedAt: '2026-09-01T12:00:01.000Z', reason: null as string | null },
      readings: THERMAL_IDS.map((id, index): InputRow => ({
        id: id as string, label: index < 4 ? `Tool ${index + 1}` : index === 4 ? 'Heater bed' : 'Cavity', state: 'known', capabilityEvidence: 'observed',
        actual: { state: 'known', value: (index === 0 ? 220 : index === 4 ? 55 : 33) as number | null },
        ...(index === 5 ? { reportedState: 'known' } : { target: { state: 'known', value: (index === 0 ? 200 : index === 4 ? 55 : 0) as number | null }, active: { state: index === 4 ? 'unknown' : 'known', value: (index === 4 ? null : index === 0) as boolean | null }, heaterState: { state: index === 4 ? 'unknown' : 'known', value: (index === 4 ? null : index === 0 ? 'ACTIVE' : 'PARKED') as string | null } }),
        provenance: { source: 'moonraker', sourceObservedAt: index === 5 ? '2026-09-01T11:59:58.000Z' : '2026-09-01T12:00:00.000Z', detail: 'Reported temperature' }
      }))
    }
  }
});
