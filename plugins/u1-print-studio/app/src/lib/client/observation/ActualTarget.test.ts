import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';
import ActualTarget from '../../../components/observation/ActualTarget.svelte';
afterEach(cleanup);
test('compact is explicitly opt-in and preserves independent actual/target semantics', () => {
  const first = render(ActualTarget, { props: { actual: 220, target: 0 } });
  expect(first.container.querySelector('.degree')).not.toHaveClass('secondary');
  cleanup();
  const compact = render(ActualTarget, { props: { actual: 220, target: null, compact: true } });
  expect(compact.container.querySelectorAll('.degree.secondary')).toHaveLength(2);
  expect(screen.getByRole('img', { name: 'Actual: 220 degrees Celsius' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Target: Temperature unavailable' })).toBeInTheDocument();
});
test('compact loading has no phantom values', () => {
  const { container } = render(ActualTarget, { loading: true, compact: true });
  expect(container.querySelectorAll('[data-skeleton="degree"]')).toHaveLength(2);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
