import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { Copy } from 'lucide-svelte';
import { afterEach, expect, it, vi } from 'vitest';
import Button from '../../../components/common/Button.svelte';

afterEach(cleanup);
it('uses a small decorative glyph with a semantic keyboard button and busy guard', async () => {
  const onclick = vi.fn();
  const view = render(Button, { label: 'Copy color', icon: Copy, variant: 'quiet', onclick });
  const button = screen.getByRole('button', { name: 'Copy color' });
  expect(button.querySelector('svg')).toHaveAttribute('width', '16');
  expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  await fireEvent.click(button);
  expect(onclick).toHaveBeenCalledTimes(1);
  button.focus();
  await view.rerender({ label: 'Copy color', icon: Copy, variant: 'quiet', onclick, busy: true });
  await fireEvent.click(button);
  expect(onclick).toHaveBeenCalledTimes(1);
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute('aria-disabled', 'true');
});
