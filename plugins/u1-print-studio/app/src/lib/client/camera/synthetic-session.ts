import type { CameraMode } from './session';
import { frameRate, type CameraScenario, type CameraMeasurement } from './state';

/** Local calibration producer. Owns its stream, observers and timers; no printer I/O. */
export const createSyntheticCameraSession = (canvas: HTMLCanvasElement, video: HTMLVideoElement, changed: (state: CameraMeasurement) => void, feedback: (message: string) => void) => {
  let state: CameraMeasurement = { mode: 'snapshot', scenario: 'snapshot', fps: null, displayedAt: null, playing: false, unavailable: false };
  let disposed = false, hidden = false, epoch = 0;
  let stream: MediaStream | null = null;
  let animation = 0, videoFrame = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fpsTimer: ReturnType<typeof setTimeout> | undefined;
  let detach: (() => void) | null = null;
  let sampleTime = 0, sampleCount = 0, lastCount = 0;
  const publish = (patch: Partial<CameraMeasurement>) => { if (!disposed) { state = { ...state, ...patch }; changed(state); } };
  const draw = (position = 0) => {
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#edf1f4'; ctx.fillRect(0, 0, 640, 360);
    ctx.strokeStyle = '#d1d9e0'; ctx.lineWidth = 1;
    for (let x = 0; x <= 640; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke(); }
    for (let y = 0; y <= 360; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke(); }
    ctx.strokeStyle = '#99a9b6'; ctx.lineWidth = 3; ctx.strokeRect(220, 100, 200, 160);
    ctx.fillStyle = '#eab941'; ctx.fillRect(224, 200 - position * 80, 192, 56);
    ctx.fillStyle = '#5d6b76'; ctx.font = '18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('SYNTHETIC CAMERA', 320, 45);
  };
  const stop = () => {
    epoch++; clearTimeout(timer); clearTimeout(fpsTimer); cancelAnimationFrame(animation); video.cancelVideoFrameCallback?.(videoFrame); detach?.(); detach = null;
    stream?.getTracks().forEach(track => track.stop()); stream = null; sampleTime = sampleCount = lastCount = 0;
  };
  const snapshot = () => {
    if (disposed || hidden) return;
    draw((Math.sin(performance.now() / 1100) + 1) / 2);
    publish({ playing: false, unavailable: false, fps: null, displayedAt: new Date().toISOString() });
    if (state.mode === 'auto') timer = setTimeout(snapshot, 1500);
  };
  const fallback = () => {
    stop(); publish({ mode: 'auto', scenario: 'fallback', playing: false, unavailable: true, fps: null, displayedAt: null });
    feedback('Local video is unavailable'); timer = setTimeout(snapshot, 1500);
  };
  const live = () => {
    const token = epoch;
    if (typeof canvas.captureStream !== 'function') { fallback(); return; }
    try {
      draw(); stream = canvas.captureStream(15);
      timer = setTimeout(() => { if (token === epoch) fallback(); }, 5000);
      const evidence = (at: number, count: number) => {
        if (token !== epoch || !Number.isSafeInteger(count) || count <= lastCount) return;
        lastCount = count;
        clearTimeout(timer); clearTimeout(fpsTimer);
        timer = setTimeout(() => { if (token === epoch) fallback(); }, 5000);
        fpsTimer = setTimeout(() => publish({ fps: null }), 1500);
        let fps = state.fps;
        if (!sampleTime) { sampleTime = at; sampleCount = count; }
        else if (at - sampleTime >= 1000) { fps = frameRate(sampleCount, count, at - sampleTime); sampleTime = at; sampleCount = count; }
        publish({ scenario: 'live', playing: true, unavailable: false, fps, displayedAt: new Date().toISOString() });
      };
      video.srcObject = stream;
      const recover = () => { if (token === epoch && video.paused) void video.play().catch(() => { if (token === epoch) fallback(); }); };
      const ended = () => { if (token === epoch) fallback(); };
      const recoveryEvents = ['pause', 'stalled', 'webkitendfullscreen', 'leavepictureinpicture', 'webkitpresentationmodechanged'];
      recoveryEvents.forEach(name => video.addEventListener(name, recover));
      video.addEventListener('error', ended); video.addEventListener('ended', ended);
      detach = () => { recoveryEvents.forEach(name => video.removeEventListener(name, recover)); video.removeEventListener('error', ended); video.removeEventListener('ended', ended); video.srcObject = null; };
      if (video.requestVideoFrameCallback) {
        const presented: VideoFrameRequestCallback = (at, metadata) => { if (token !== epoch) return; evidence(at, metadata.presentedFrames); if (token === epoch) videoFrame = video.requestVideoFrameCallback(presented); };
        videoFrame = video.requestVideoFrameCallback(presented);
      }
      recover();
      let lastDraw = 0, decodedBaseline: number | null = null;
      const animate = (time: number) => { if (token !== epoch) return; if (time - lastDraw >= 65) { draw((Math.sin(time / 1100) + 1) / 2); lastDraw = time; } if (!video.requestVideoFrameCallback) { const quality = video.getVideoPlaybackQuality?.(); if (quality) { const count = quality.totalVideoFrames - quality.droppedVideoFrames; if (decodedBaseline === null) decodedBaseline = count; else if (count > decodedBaseline) evidence(time, count); } } animation = requestAnimationFrame(animate); };
      animation = requestAnimationFrame(animate);
    } catch { if (token === epoch) fallback(); }
  };
  const setScenario = (scenario: CameraScenario) => {
    if (disposed) return; stop();
    const mode: CameraMode = scenario === 'live' || scenario === 'connecting' ? 'live' : scenario === 'fallback' ? 'auto' : 'snapshot';
    publish({ mode, scenario, playing: false, unavailable: scenario === 'error', fps: null, displayedAt: null });
    if (hidden) return;
    if (scenario === 'live') live();
    else if (scenario === 'fallback' || scenario === 'snapshot' || scenario === 'unsupported') snapshot();
  };
  return {
    setScenario,
    selectMode: (mode: CameraMode) => { if (mode === state.mode && !state.unavailable) return; setScenario(mode === 'live' ? 'live' : mode === 'auto' ? 'fallback' : 'snapshot'); },
    refresh: () => { if (state.unavailable || state.scenario === 'error') setScenario('snapshot'); else if (state.mode !== 'live') { clearTimeout(timer); snapshot(); } feedback('Fixture snapshot refreshed'); },
    pageHide: () => { if (!disposed && !hidden) { hidden = true; stop(); publish({ playing: false, fps: null }); } },
    pageShow: () => { if (!disposed && hidden) { hidden = false; setScenario(state.scenario ?? 'snapshot'); } },
    dispose: () => { if (disposed) return; stop(); disposed = true; },
  };
};
