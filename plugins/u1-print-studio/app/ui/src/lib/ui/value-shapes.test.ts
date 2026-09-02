import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import TextValue from './TextValue.svelte';
import QuantityValue from './QuantityValue.svelte';
import DurationValue from './DurationValue.svelte';

afterEach(cleanup);
describe('public value loading shapes', () => {
  it('renders supplied public structure inertly in the same typography owner', () => {
    const text = render(TextValue, { loading: true, shape: 'Reported file' });
    expect(text.container.querySelector('[data-text-skeleton]')).toHaveTextContent('Reported file');
    expect(text.container.querySelector('[data-text-skeleton]')).toHaveAttribute('aria-hidden', 'true');
    text.unmount();
    const quantity = render(QuantityValue, { unit: 'bytes', loading: true, shape: '0,000,000 B' });
    expect(quantity.container.querySelector('[data-text-skeleton]')).toHaveTextContent('0,000,000 B');
    expect(quantity.container.querySelector('[role="img"],[aria-label],button')).toBeNull();
    quantity.unmount();
    const duration = render(DurationValue, { loading: true, shape: '0h 00m' });
    expect(duration.container.querySelector('[data-text-skeleton]')).toHaveTextContent('0h 00m');
    expect(duration.container.querySelector('[role="img"],[aria-label],button')).toBeNull();
  });
  it('keeps default duration skeleton unchanged when no shape is requested', () => {
    const result = render(DurationValue, { loading: true });
    expect(result.container.querySelector('[data-text-skeleton]')).toBeNull();
    expect(result.container.querySelector('[data-loading-value]')).not.toBeNull();
  });
  it('rejects ready structure and loading telemetry at runtime', () => {
    expect(() => render(TextValue, { text: 'Ready', shape: 'Template' } as never)).toThrow();
    expect(() => render(QuantityValue, { unit: 'bytes', value: 0, shape: '000' } as never)).toThrow();
    expect(() => render(DurationValue, { seconds: 0, shape: '0s' } as never)).toThrow();
    expect(() => render(DurationValue, { seconds: 0, loading: true } as never)).toThrow();
  });
});
