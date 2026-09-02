import { describe, expect, it } from 'vitest';
import { bedMeshFields, bedMeshSelectionSearch, defaultBedMeshSelection, readBedMeshSelection, setBedMeshSelection } from './lab-controller';
import { readSelection } from '../lab/controller';

describe('Shared closed retained-error selection', () => {
  it('round-trips Bed and all light-widget retained-error phases', () => {
    const selected = setBedMeshSelection(defaultBedMeshSelection(), 'phase', 'retained-error');
    expect(readBedMeshSelection(bedMeshSelectionSearch(selected))).toEqual(selected);
    expect(bedMeshFields(selected).find((field) => field.key === 'mode')?.disabled).toBe(false);
    for (const view of ['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans'] as const) expect(readSelection(view, '?lab_phase=retained-error').phase).toBe('retained-error');
  });
  it('rejects duplicate/hostile phases and preserves ready defaults', () => {
    for (const query of ['?lab_phase=retained-error&lab_phase=error', '?lab_phase=unsupported', '?lab_phase=<script>']) expect(readBedMeshSelection(query)).toEqual(defaultBedMeshSelection());
    expect(defaultBedMeshSelection().phase).toBe('ready');
  });
});
