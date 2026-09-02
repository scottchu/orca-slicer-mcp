import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, expect, it, vi } from 'vitest';
import TextSegmentedControl from './TextSegmentedControl.svelte';

afterEach(cleanup);
const options = [{ value: 'snapshot', label: 'Snapshot' }, { value: 'live', label: 'Live' }, { value: 'auto', label: 'Auto' }];

it('uses one tab stop and supports arrows, Home, End, Enter and Space', async () => {
  const onchange = vi.fn();
  const view = render(TextSegmentedControl, { label: 'Camera mode', options, value: 'snapshot', onchange });
  const [snapshot, live, auto] = view.getAllByRole('radio');
  expect(view.getAllByRole('radio').map(node => node.tabIndex)).toEqual([0, -1, -1]);
  snapshot.focus();
  for (const [key, index] of [['ArrowRight', 1], ['ArrowLeft', 2], ['End', 2], ['Home', 0], ['ArrowDown', 1], ['ArrowUp', 2]] as const) {
    await fireEvent.keyDown(snapshot, { key });
    expect(document.activeElement).toBe([snapshot, live, auto][index]);
    if (index) expect(onchange).toHaveBeenLastCalledWith(options[index].value);
  }
  await fireEvent.keyDown(auto, { key: ' ' }); expect(onchange).toHaveBeenLastCalledWith('auto');
  await fireEvent.keyDown(live, { key: 'Enter' }); expect(onchange).toHaveBeenLastCalledWith('live');
});

it('updates the actual selected mode without moving focus or remounting controls', async () => {
  const onchange = vi.fn();
  const view = render(TextSegmentedControl, { label: 'Camera mode', options, value: 'live', onchange });
  const radios = view.getAllByRole('radio'); radios[1].focus();
  await view.rerender({ label: 'Camera mode', options, value: 'auto', onchange });
  expect(view.getAllByRole('radio')).toEqual(radios);
  expect(document.activeElement).toBe(radios[1]);
  expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  expect(onchange).not.toHaveBeenCalled();
});
