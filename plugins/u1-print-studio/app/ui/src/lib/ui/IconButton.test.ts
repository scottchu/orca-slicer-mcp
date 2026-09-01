import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RefreshCw } from 'lucide-svelte';
import IconButton from './IconButton.svelte';
import Skeleton from './Skeleton.svelte';
afterEach(cleanup);
describe('opt-in compact icon action', () => {
  it.each([false, true])('preserves focus, name, pressed, disabled and busy semantics compact=%s', async (compact) => {
    const onclick = vi.fn();
    const { rerender } = render(IconButton, { label: 'Refresh', icon: RefreshCw, onclick, compact, pressed: true });
    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button.classList.contains('compact')).toBe(compact);
    expect(button).toHaveAttribute('aria-pressed', 'true'); button.focus();
    await fireEvent.click(button); expect(onclick).toHaveBeenCalledOnce();
    await rerender({ label: 'Refresh', icon: RefreshCw, onclick, compact, busy: true });
    expect(button).toHaveFocus(); expect(button).toHaveAttribute('aria-disabled', 'true');
    await fireEvent.click(button); expect(onclick).toHaveBeenCalledOnce();
    await rerender({ label: 'Refresh', icon: RefreshCw, onclick, compact, disabled: true });
    await fireEvent.click(button); expect(onclick).toHaveBeenCalledOnce();
  });
  it('keeps default consumers unchanged and compact skeleton inert', () => {
    const { container, unmount } = render(IconButton, { label: 'Refresh', icon: RefreshCw });
    expect(container.querySelector('.compact')).toBeNull(); unmount();
    const skeleton = render(Skeleton, { shape: 'action', compact: true });
    expect(skeleton.container.querySelector('[data-skeleton="action"]')).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.container.textContent).toBe(''); expect(screen.queryByRole('button')).toBeNull();
  });
});
