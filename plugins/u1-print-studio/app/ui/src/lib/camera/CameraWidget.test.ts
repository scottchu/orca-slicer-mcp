import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, expect, it, vi } from 'vitest';
import CameraWidget from './CameraWidget.svelte';
import type { CameraSessionState } from './session';

const dispose = vi.hoisted(() => vi.fn());
vi.mock('../media/playback', () => ({ createVideoPlayback: () => ({ dispose }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('keeps three service-controlled icon modes inside failed media and preserves focus on automatic fallback', async () => {
  const state: CameraSessionState = { mode: 'live', phase: 'connecting', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null };
  const onmode = vi.fn(), teardown = vi.fn();
  const props = { state, feedback: '', onmode, onready: () => teardown, onfeedback: vi.fn(), onrefresh: vi.fn() };
  const view = render(CameraWidget, props);
  const radios = view.getAllByRole('radio');
  expect(radios.map(node => node.getAttribute('aria-label'))).toEqual(['Snapshot', 'Live', 'Auto']);
  expect(radios.map(node => node.textContent?.trim())).toEqual(['', '', '']);
  for (const radio of radios) expect(radio).toHaveAttribute('title', radio.getAttribute('aria-label'));
  expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  expect(radios[0].closest('[data-media-surface]')).not.toBeNull();
  radios[1].focus();
  await view.rerender({ ...props, state: { ...state, mode: 'auto', phase: 'fallback', failure: 'live' } });
  expect(view.getAllByRole('radio')).toEqual(radios);
  expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  expect(document.activeElement).toBe(radios[1]);
  expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('Could not load');
  expect(view.container.querySelector('video')).toHaveAttribute('aria-hidden', 'true');
  await fireEvent.click(radios[0]); expect(onmode).toHaveBeenCalledWith('snapshot');
  expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  view.unmount(); expect(teardown).toHaveBeenCalledOnce(); expect(dispose).toHaveBeenCalledOnce();
});
