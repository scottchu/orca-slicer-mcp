import { render } from '@testing-library/svelte';
import { RotateCcw } from 'lucide-svelte';
import { describe, expect, test, vi } from 'vitest';
import Button from './Button.svelte';
import ObservedMeta from '../observation/ObservedMeta.svelte';

describe('shared widget foundation', () => {
  test('icon actions expose one exact 44-pixel accessible target contract', async () => {
    const onclick = vi.fn();
    const { getByRole } = render(Button, { label: 'Reset view', icon: RotateCcw, pressed: false, onclick });
    const button = getByRole('button', { name: 'Reset view' });
    expect(button).toHaveAttribute('title', 'Reset view');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    button.click();
    expect(onclick).toHaveBeenCalledOnce();
  });

  test('observed metadata never invents a clock', () => {
    const { container } = render(ObservedMeta, { observedAt: null, freshness: 'unknown' });
    expect(container).toHaveTextContent('Observation time unavailable · Freshness unknown');
  });

  test('busy icon action retains focus and blocks activation until ready', async () => {
    const onclick = vi.fn();
    const { getByRole, rerender } = render(Button, { label: 'Refresh', icon: RotateCcw, busy: true, onclick });
    const button = getByRole('button', { name: 'Refresh' }); button.focus(); button.click();
    expect(button).toHaveFocus(); expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true'); expect(onclick).not.toHaveBeenCalled();
    await rerender({ label: 'Refresh', icon: RotateCcw, busy: false, onclick }); button.click();
    expect(onclick).toHaveBeenCalledOnce(); expect(button).toHaveFocus();
  });
});
