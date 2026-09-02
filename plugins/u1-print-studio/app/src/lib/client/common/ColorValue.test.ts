import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import ColorValue from '../../../components/common/ColorValue.svelte';

afterEach(cleanup);
describe('ColorValue', () => {
  it.each(['#F4B927', '#3487C880', '#DDDDDDDD', '#CCCCCCCC'])('keeps %s whole and naturally sized', (value) => {
    const { container } = render(ColorValue, { color: value, text: value });
    const text = container.querySelector('.text')!;
    expect(text.textContent).toBe(value);
    expect(text.childElementCount).toBe(0);
    expect(text.getAttribute('style')).toBeNull();
    expect(text).not.toHaveAttribute('data-loading-value');
    expect(container.querySelector('.swatch')).toHaveAttribute('aria-hidden', 'true');
  });
  it.each(['N/A', 'Empty'])('retains the honest neutral %s label with no action', (text) => {
    const { container } = render(ColorValue, { color: null, text });
    expect(container.querySelector('.text')).toHaveTextContent(text);
    expect(container.querySelector('button')).toBeNull();
  });
  it('uses an empty public skeleton without telemetry or active semantics', () => {
    const { container } = render(ColorValue, { loading: true });
    expect(container.textContent?.trim()).toBe('');
    expect(container.querySelector('[data-loading-value]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('button,time,[aria-valuenow]')).toBeNull();
  });
  it.each([{ loading: true, text: '#3487C880' }, { loading: true, color: '#3487C880' }, {}])('rejects invalid loading/ready input %s', (props) => {
    expect(() => render(ColorValue, props)).toThrow();
  });
});
