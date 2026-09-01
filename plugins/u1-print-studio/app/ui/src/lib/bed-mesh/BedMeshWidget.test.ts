import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, test, vi } from 'vitest';
import { bedMeshLabFixture } from '../fixtures/bed-mesh';
import BedMeshWidget from './BedMeshWidget.svelte';

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
});
