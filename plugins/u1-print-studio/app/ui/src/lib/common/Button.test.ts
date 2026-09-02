import { cleanup, render } from '@testing-library/svelte';
import { Box } from 'lucide-svelte';
import { afterEach, expect, test, vi } from 'vitest';
import Button from './Button.svelte';

const leases: Array<{ release: () => void }> = [];
afterEach(() => {
  try { for (const lease of leases.splice(0)) lease.release(); }
  finally { cleanup(); vi.restoreAllMocks(); }
});

test('focus leases reject absent ownership and track loss even after focus returns', () => {
  const { component, getByRole } = render(Button, { label: 'Action', icon: Box });
  expect(component.captureFocus()).toBeUndefined();
  const button = getByRole('button'); button.focus();
  const lease = component.captureFocus()!;
  leases.push(lease);
  expect(lease.ownsFocus()).toBe(true);
  button.blur(); button.focus();
  expect(lease.ownsFocus()).toBe(false);
  lease.release();
});

test('window blur invalidates a lease and release removes only its own listeners', () => {
  const { component, getByRole } = render(Button, { label: 'Action', icon: Box });
  const button = getByRole('button'); button.focus();
  const removeWindow = vi.spyOn(window, 'removeEventListener');
  const removeButton = vi.spyOn(button, 'removeEventListener');
  const lease = component.captureFocus()!;
  leases.push(lease);
  window.dispatchEvent(new Event('blur'));
  expect(lease.ownsFocus()).toBe(false);
  lease.release();
  expect(removeButton).toHaveBeenCalledWith('blur', expect.any(Function));
  expect(removeWindow).toHaveBeenCalledWith('blur', expect.any(Function));
});

test('recovery never overrides another target or inactive document; disabled stays native', async () => {
  const { component, getByRole, rerender } = render(Button, { label: 'Action', icon: Box });
  const other = render(Button, { label: 'Other', icon: Box });
  const button = getByRole('button', { name: 'Action' }); button.focus();
  expect(component.canRecoverFocus()).toBe(true);
  other.getByRole('button', { name: 'Other' }).focus();
  expect(component.canRecoverFocus()).toBe(false);
  vi.spyOn(document, 'hasFocus').mockReturnValue(false);
  expect(component.canRecoverFocus()).toBe(false);
  await rerender({ label: 'Action', icon: Box, disabled: true });
  expect(button).toBeDisabled();
});
