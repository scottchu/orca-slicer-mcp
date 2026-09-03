import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, expect, it, vi } from 'vitest';
import CameraWidget from '../../../components/camera/CameraWidget.svelte';
import type { CameraSessionState } from './session';
import type { VideoSurfacePort } from '../media/playback';

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('keeps two service-controlled icon modes inside failed media and preserves focus on automatic fallback', async () => {
  const state: CameraSessionState = { mode: 'live', phase: 'connecting', snapshot: null, liveAt: null, fps: null, refreshing: false, feedback: null };
  const onmode = vi.fn(), teardown = vi.fn();
  let dispose: ReturnType<typeof vi.spyOn> | undefined;
  const onready = (surface: VideoSurfacePort) => {
    dispose = vi.spyOn(surface as VideoSurfacePort & { dispose: () => void }, 'dispose');
    return teardown;
  };
  const props = { state, feedback: '', onmode, onready, onfeedback: vi.fn() };
  const view = render(CameraWidget, props);
  const radios = view.getAllByRole('radio');
  expect(radios.map(node => node.getAttribute('aria-label'))).toEqual(['Auto', 'Live']);
  expect(radios.map(node => node.textContent?.trim())).toEqual(['', '']);
  for (const radio of radios) expect(radio).toHaveAttribute('title', radio.getAttribute('aria-label'));
  expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  expect(radios[0].closest('[data-media-surface]')).not.toBeNull();
  radios[1].focus();
  await view.rerender({ ...props, state: { ...state, mode: 'auto', phase: 'fallback', failure: 'live' } });
  expect(view.getAllByRole('radio')).toEqual(radios);
  expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  expect(document.activeElement).toBe(radios[1]);
  expect(view.container.querySelector('[data-media-status-message]')).toHaveTextContent('Could not load');
  expect(view.container.querySelector('video')).toHaveAttribute('aria-hidden', 'true');
  await fireEvent.click(radios[1]); expect(onmode).toHaveBeenCalledWith('live');
  expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  view.unmount(); expect(teardown).toHaveBeenCalledOnce(); expect(dispose).toHaveBeenCalledOnce();
});

it('retains safe Live failure on Auto media, prioritizes snapshot failure and has no footer', async () => {
  const failure = { stage: 'first-frame', outcome: 'timeout', elapsedMs: 8000, connectionState: 'connecting', hadFrame: false } as const;
  const state: CameraSessionState = { mode: 'auto', phase: 'snapshot', snapshot: { image: 'data:image/png;base64,fixture', observedAt: '2026-09-03T12:00:00Z' }, liveAt: null, fps: null, refreshing: false, feedback: null, lastLiveFailure: failure };
  const props = { state, feedback: '', onmode: vi.fn(), onready: () => vi.fn(), onfeedback: vi.fn() };
  const view = render(CameraWidget, props);
  expect(view.container.querySelector('[data-media-status-message]')).toHaveTextContent('Connection timed out');
  expect(view.container.querySelector('img')).toHaveAttribute('aria-hidden', 'false');
  expect(view.container.querySelector('[data-widget-footer]')).toBeNull();
  expect(view.queryByRole('button', { name: /refresh|retry/i })).toBeNull();
  expect(view.container.textContent).not.toMatch(/8000|first-frame|hadFrame/);
  await view.rerender({ ...props, state: { ...state, phase: 'error', failure: 'snapshot' } });
  expect(view.container.querySelector('[data-media-status-message]')).toHaveTextContent('Could not load camera');
  expect(view.container.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
});
