/** Persistent video binding. Producers own tracks; this leaf owns only display. */
export type FrameEvidence = { kind: 'presented' | 'decoded'; count: number; at: number };
export type PlaybackEvents = { frame: (evidence: FrameEvidence) => void; ended: () => void };
export type VideoSurfacePort = { attach: (stream: MediaStream, events: PlaybackEvents) => () => void };
export type FrameClock = { request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void };

export const createVideoPlayback = (video: HTMLVideoElement, clock: FrameClock): VideoSurfacePort & { dispose: () => void } => {
  let detach: (() => void) | null = null;
  let disposed = false;
  const attach: VideoSurfacePort['attach'] = (stream, events) => {
    detach?.();
    if (disposed) return () => {};
    let active = true;
    let frame = 0;
    let animation = 0;
    let recovering = false;
    const current = () => active && video.srcObject === stream;
    const recover = async () => {
      if (!current() || recovering || !video.paused) return;
      recovering = true;
      try { await video.play(); }
      catch { if (current() && video.paused) events.ended(); }
      finally { recovering = false; }
    };
    const failure = () => { if (current()) events.ended(); };
    const resume = () => { void recover(); };
    video.srcObject = stream;
    video.addEventListener('pause', resume);
    video.addEventListener('stalled', resume);
    video.addEventListener('error', failure);
    video.addEventListener('ended', failure);
    video.addEventListener('webkitendfullscreen', resume);
    video.addEventListener('leavepictureinpicture', resume);
    video.addEventListener('webkitpresentationmodechanged', resume);
    if (typeof video.requestVideoFrameCallback === 'function') {
      const presented: VideoFrameRequestCallback = (at, metadata) => {
        if (!current()) return;
        events.frame({ kind: 'presented', count: metadata.presentedFrames, at });
        if (current()) frame = video.requestVideoFrameCallback(presented);
      };
      frame = video.requestVideoFrameCallback(presented);
    } else {
      let last = -1;
      const decoded = (at: number) => {
        if (!current()) return;
        const quality = video.getVideoPlaybackQuality?.();
        const count = quality ? quality.totalVideoFrames - quality.droppedVideoFrames : undefined;
        if (count !== undefined && Number.isSafeInteger(count) && count >= 0 && count !== last) {
          last = count; events.frame({ kind: 'decoded', count, at });
        }
        if (current()) animation = clock.request(decoded);
      };
      animation = clock.request(decoded);
    }
    void recover();
    const release = () => {
      if (!active) return;
      active = false;
      if (frame) video.cancelVideoFrameCallback?.(frame);
      if (animation) clock.cancel(animation);
      video.removeEventListener('pause', resume);
      video.removeEventListener('stalled', resume);
      video.removeEventListener('error', failure);
      video.removeEventListener('ended', failure);
      video.removeEventListener('webkitendfullscreen', resume);
      video.removeEventListener('leavepictureinpicture', resume);
      video.removeEventListener('webkitpresentationmodechanged', resume);
      if (video.srcObject === stream) video.srcObject = null;
      if (detach === release) detach = null;
    };
    detach = release;
    return release;
  };
  return { attach, dispose: () => { disposed = true; detach?.(); } };
};
