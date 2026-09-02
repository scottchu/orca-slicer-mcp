import { describe, expect, it, vi } from 'vitest';
import { createVideoPlayback, type PlaybackEvents } from './playback';

const setup = (presented = true) => {
  const video = document.createElement('video');
  const callbacks: VideoFrameRequestCallback[] = [];
  const animations: FrameRequestCallback[] = [];
  let paused = true;
  Object.defineProperty(video, 'paused', { get: () => paused });
  const play = vi.spyOn(video, 'play').mockImplementation(async () => { paused = false; });
  if (presented) {
    video.requestVideoFrameCallback = vi.fn((callback) => { callbacks.push(callback); return callbacks.length; });
    video.cancelVideoFrameCallback = vi.fn();
  }
  const clock = { request: vi.fn((callback: FrameRequestCallback) => { animations.push(callback); return animations.length; }), cancel: vi.fn() };
  const events: PlaybackEvents = { frame: vi.fn(), ended: vi.fn() };
  const playback = createVideoPlayback(video, clock);
  const stream = { getTracks: vi.fn() } as unknown as MediaStream;
  return { video, callbacks, animations, play, clock, events, playback, stream, pause: () => { paused = true; } };
};

describe('one persistent video surface playback', () => {
  it('presents advancing evidence and detaches without stopping producer tracks', async () => {
    const app = setup(); const detach = app.playback.attach(app.stream, app.events);
    expect(app.video.srcObject).toBe(app.stream); expect(app.play).toHaveBeenCalledOnce();
    app.callbacks[0](100, { presentedFrames: 2 } as VideoFrameCallbackMetadata);
    expect(app.events.frame).toHaveBeenCalledWith({ kind: 'presented', count: 2, at: 100 });
    detach(); expect(app.video.srcObject).toBeNull(); expect(app.stream.getTracks).not.toHaveBeenCalled();
    app.callbacks[1](200, { presentedFrames: 3 } as VideoFrameCallbackMetadata);
    expect(app.events.frame).toHaveBeenCalledOnce(); expect(app.video.cancelVideoFrameCallback).toHaveBeenCalledWith(2);
  });
  it('fullscreen/PiP pause recovery keeps the same stream and video', async () => {
    const app = setup(); app.playback.attach(app.stream, app.events); await Promise.resolve();
    app.pause(); app.video.dispatchEvent(new Event('webkitendfullscreen')); await Promise.resolve();
    expect(app.video.srcObject).toBe(app.stream); expect(app.play).toHaveBeenCalledTimes(2);
    app.video.dispatchEvent(new Event('leavepictureinpicture'));
    expect(app.play).toHaveBeenCalledTimes(2); expect(app.events.ended).not.toHaveBeenCalled();
    app.playback.dispose();
  });
  it('ignores rejected old playback after a newer source is attached', async () => {
    const app = setup(); let reject!: () => void;
    app.play.mockImplementationOnce(() => new Promise<void>((_resolve, fail) => { reject = () => fail(new Error('old-play')); }));
    const oldDetach = app.playback.attach(app.stream, app.events);
    const next = {} as MediaStream; app.playback.attach(next, app.events); oldDetach(); reject(); await Promise.resolve();
    expect(app.video.srcObject).toBe(next); expect(app.events.ended).not.toHaveBeenCalled(); app.playback.dispose();
  });
  it('reports active playback rejection but emits no invented frame', async () => {
    const app = setup(); app.play.mockRejectedValue(new Error('fixture denied'));
    app.playback.attach(app.stream, app.events); await Promise.resolve();
    expect(app.events.ended).toHaveBeenCalledOnce(); expect(app.events.frame).not.toHaveBeenCalled(); app.playback.dispose();
  });
  it('uses only changing decoded-frame counters when presented callbacks are unavailable', () => {
    const app = setup(false); let count = 0;
    app.video.getVideoPlaybackQuality = () => ({ totalVideoFrames: count, droppedVideoFrames: 0 } as VideoPlaybackQuality);
    app.playback.attach(app.stream, app.events);
    app.animations[0](10); app.animations[1](20); count = 1; app.animations[2](30);
    expect(app.events.frame).toHaveBeenCalledTimes(2);
    expect(app.events.frame).toHaveBeenLastCalledWith({ kind: 'decoded', count: 1, at: 30 });
    app.playback.dispose(); expect(app.clock.cancel).toHaveBeenCalledWith(4);
  });
});
