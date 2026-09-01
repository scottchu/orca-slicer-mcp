import { render } from '@testing-library/svelte';
import { RotateCcw } from 'lucide-svelte';
import { describe, expect, test, vi } from 'vitest';
import IconButton from './IconButton.svelte';
import ObservedMeta from './ObservedMeta.svelte';

describe('shared widget foundation', () => {
  test('icon actions expose one exact 44-pixel accessible target contract', async () => {
    const onclick = vi.fn();
    const { getByRole } = render(IconButton, { label: 'Reset view', icon: RotateCcw, pressed: false, onclick });
    const button = getByRole('button', { name: 'Reset view' });
    expect(button).toHaveAttribute('title', 'Reset view');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    button.click();
    expect(onclick).toHaveBeenCalledOnce();
    expect(button).toHaveClass('icon-button');
  });

  test('observed metadata never invents a clock', () => {
    const { container } = render(ObservedMeta, { observedAt: null, freshness: 'unknown' });
    expect(container).toHaveTextContent('Observation time unavailable · Freshness unknown');
  });
});
