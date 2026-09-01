import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, test, vi } from 'vitest';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import BedMeshWidget from './BedMeshWidget.svelte';
import { BED_MESH_SUMMARY_TOLERANCE_MM, validateBedMeshObservation } from './types';

vi.mock('./BedMesh3D.svelte', () => ({ default: () => ({}) }));

describe('Bed Mesh Svelte candidate', () => {
  test('uses shared anatomy and swaps only chart content', async () => {
    const { container, getByRole } = render(BedMeshWidget, { observation: bedMeshLabFixture });
    expect(container.querySelector('[data-widget-shell]')).toBeTruthy();
    expect(container.querySelectorAll('[data-chart-frame]')).toHaveLength(1);
    expect(container).toHaveTextContent('Reported probe grid · 11 × 11 · Lab fixture');
    expect(container).not.toHaveTextContent('Height exaggerated');
    expect(container).not.toHaveTextContent('Drag');
    expect(container).not.toHaveTextContent('Surface connects');
    await fireEvent.click(getByRole('button', { name: 'Show 2D bed mesh' }));
    expect(getByRole('button', { name: 'Show 2D bed mesh' })).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('[data-chart-frame]')).toBeTruthy();
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('2D view');
  });

  test('rejects malformed bridge-injected values', () => {
    const malformed = structuredClone(bedMeshLabFixture);
    malformed.matrix[0].pop();
    expect(() => render(BedMeshWidget, { observation: malformed })).toThrow('Invalid bed mesh matrix');
  });

  test('rejects invalid source metadata and summaries that disagree with the matrix', () => {
    for (const mutate of [
      (value: any) => { value.freshness = 'current'; },
      (value: any) => { value.sourceObservedAt = 'yesterday'; },
      (value: any) => { value.sourceObservedAt = '2026-09-01T12:00:00Z'; },
      (value: any) => { value.sourceObservedAt = '2026-02-30T12:00:00.000Z'; },
      (value: any) => { value.profile = '  padded'; },
      (value: any) => { value.matrix[2][3] = Number.NaN; },
      (value: any) => { value.summary.minimum -= BED_MESH_SUMMARY_TOLERANCE_MM * 2; },
      (value: any) => { value.summary.maximum += BED_MESH_SUMMARY_TOLERANCE_MM * 2; },
      (value: any) => { value.summary.range += BED_MESH_SUMMARY_TOLERANCE_MM * 2; }
    ]) {
      const malformed: any = structuredClone(bedMeshLabFixture);
      mutate(malformed);
      expect(() => validateBedMeshObservation(malformed)).toThrow();
    }
  });

  test('normalizes within-tolerance summary values to the exact finite matrix result', () => {
    const approximate = structuredClone(bedMeshLabFixture);
    approximate.summary.minimum += BED_MESH_SUMMARY_TOLERANCE_MM / 2;
    approximate.summary.maximum -= BED_MESH_SUMMARY_TOLERANCE_MM / 2;
    approximate.summary.range += BED_MESH_SUMMARY_TOLERANCE_MM / 2;
    const validated = validateBedMeshObservation(approximate);
    expect(validated.summary).toEqual(bedMeshLabFixture.summary);
    expect(validated).not.toBe(approximate);
  });
});
