import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import TextSkeleton from '../../../components/common/TextSkeleton.svelte';
import Name from '../../../components/common/Name.svelte';
import DateTimeValue from '../../../components/common/DateTimeValue.svelte';
import { queueLoadingShapes } from '../lab/queue-shapes';
afterEach(cleanup);

it('preserves public template glyphs and spaces as inert, noninteractive structure', () => {
  const { container } = render(TextSkeleton, { shape: 'Public model 00 · example' });
  const node = container.querySelector('[data-text-skeleton]')!;
  expect(node.textContent).toBe('Public model 00 · example');
  expect(node).toHaveAttribute('aria-hidden', 'true');
  expect(node).not.toHaveAttribute('title');
  expect(container.querySelector('button,input,a,[tabindex]')).toBeNull();
});
it.each(['', 'x'.repeat(321), 'line\nbreak', 'tab\there', '\u007f'])('rejects unsafe or unbounded structure %s', (shape) => {
  expect(() => render(TextSkeleton, { shape })).toThrow('Invalid text structure');
});
it('bounds by codepoints and renders markup-like text without interpretation', () => {
  const { container } = render(TextSkeleton, { shape: '🧩'.repeat(320) });
  expect([...container.textContent!]).toHaveLength(320); cleanup();
  const next = render(TextSkeleton, { shape: '<img src=x>' }); expect(next.container.querySelector('img')).toBeNull();
});
it('closed lab shapes use masked synthetic layout metadata, never a real receipt', () => {
  const shapes = queueLoadingShapes(10);
  expect(shapes).toHaveLength(10); expect(shapes[0].name).toBe('Queued item 0'); expect(shapes[9].name).toBe('Queued item 00');
  for (const shape of shapes) expect(shape.date).not.toMatch(/[1-9]/);
  expect(() => queueLoadingShapes(101)).toThrow();
});
it('ready name and date variants reject loading shapes', () => {
  expect(() => render(Name, { text: 'ready', shape: 'bad' } as never)).toThrow('Invalid name state');
  expect(() => render(DateTimeValue, { value: null, shape: 'bad' } as never)).toThrow('Invalid date state');
});
