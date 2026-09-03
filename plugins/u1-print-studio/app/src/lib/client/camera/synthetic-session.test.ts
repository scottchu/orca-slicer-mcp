import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CameraMeasurement } from './state';
import { createSyntheticCameraSession } from './synthetic-session';
const setup = () => {
  const states: CameraMeasurement[] = [];
  const track = { stop: vi.fn() };
  const context = { fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), strokeRect: vi.fn(), fillText: vi.fn() };
  const canvas = { getContext: () => context, captureStream: vi.fn(() => ({ getTracks: () => [track] })) } as unknown as HTMLCanvasElement;
  const video = Object.assign(new EventTarget(), { srcObject: null, paused: true, play: vi.fn(async () => {}), requestVideoFrameCallback: vi.fn(), cancelVideoFrameCallback: vi.fn() }) as unknown as HTMLVideoElement;
  const service = createSyntheticCameraSession(canvas, video, value => states.push(value), vi.fn());
  const frame = (count: number, at: number) => { const callback = vi.mocked(video.requestVideoFrameCallback).mock.calls.at(-1)![0]; callback(at, { presentedFrames: count } as VideoFrameCallbackMetadata); };
  return { service, states, canvas, track, context, video, frame, state: () => states.at(-1)! };
};
describe('local Camera producer service', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); vi.clearAllTimers(); vi.useRealTimers(); });
  it('Auto refreshes actual local receipts; Snapshot/hide/dispose cancel recurring ownership', async () => {
    const app = setup(); app.service.setScenario('snapshot'); const first = app.state().displayedAt;
    expect(app.state()).toMatchObject({ mode: 'auto', scenario: 'snapshot', playing: false, fps: null });
    await vi.advanceTimersByTimeAsync(1500); expect(app.state().displayedAt).not.toBe(first);
    app.service.pageHide(); const count = app.states.length; await vi.advanceTimersByTimeAsync(5000); expect(app.states).toHaveLength(count);
    app.service.pageShow(); expect(app.state().mode).toBe('auto'); app.service.pageHide();
    const single = app.states.length; await vi.advanceTimersByTimeAsync(5000); expect(app.states).toHaveLength(single);
    expect(app.canvas.captureStream).not.toHaveBeenCalled(); app.service.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('requires fresh frames, preserves one stream for duplicate Live, and releases only owned tracks', () => {
    const app = setup(); app.service.selectMode('live');
    expect(app.state()).toMatchObject({ mode: 'live', playing: false, fps: null });
    app.frame(1, 100); expect(app.state().playing).toBe(true);
    app.service.selectMode('live'); expect(app.canvas.captureStream).toHaveBeenCalledTimes(1);
    app.service.selectMode('auto'); expect(app.track.stop).toHaveBeenCalledOnce(); expect(app.video.srcObject).toBeNull();
    app.frame(2, 1001); expect(app.state()).toMatchObject({ mode: 'auto', playing: false });
    app.service.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('first-frame failure automatically selects Auto, masks retained receipt then recovers after a fresh snapshot', async () => {
    const app = setup(); app.service.selectMode('live'); await vi.advanceTimersByTimeAsync(5000);
    expect(app.state()).toMatchObject({ mode: 'auto', unavailable: true, displayedAt: null });
    expect(app.track.stop).toHaveBeenCalledOnce(); await vi.advanceTimersByTimeAsync(1500);
    expect(app.state()).toMatchObject({ mode: 'auto', unavailable: false, playing: false, fps: null });
    expect(app.state().displayedAt).not.toBeNull(); app.service.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('recovers paused local playback without changing mode and ignores failures after disposal', async () => {
    const app = setup(); app.service.selectMode('live'); app.frame(1, 100);
    expect(app.video.play).toHaveBeenCalledOnce(); app.video.dispatchEvent(new Event('pause'));
    expect(app.video.play).toHaveBeenCalledTimes(2); expect(app.state()).toMatchObject({ mode: 'live', playing: true });
    app.service.dispose(); const calls = app.states.length; app.video.dispatchEvent(new Event('ended'));
    app.frame(2, 200); await vi.advanceTimersByTimeAsync(10000);
    expect(app.states).toHaveLength(calls); expect(vi.getTimerCount()).toBe(0);
  });

  it('requires advancing decoded evidence when presented-frame callbacks are unavailable', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
    const app = setup(); Object.defineProperty(app.video, 'requestVideoFrameCallback', { value: undefined });
    let count = 5; app.video.getVideoPlaybackQuality = () => ({ totalVideoFrames: count, droppedVideoFrames: 0 }) as VideoPlaybackQuality;
    app.service.selectMode('live'); frames.at(-1)!(100); frames.at(-1)!(200);
    expect(app.state().playing).toBe(false); count++; frames.at(-1)!(300);
    expect(app.state().playing).toBe(true); app.service.dispose(); expect(vi.getTimerCount()).toBe(0);
  });

});
