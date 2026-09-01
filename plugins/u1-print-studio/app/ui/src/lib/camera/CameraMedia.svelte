<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { Camera, Maximize, Minimize, PictureInPicture2, Video, X } from 'lucide-svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import { frameRate, type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from './state';
  let { scenario, capabilityPolicy, onscenario, onmeasurement, onfeedback }: {
    scenario: CameraScenario;
    capabilityPolicy: CameraCapabilityPolicy;
    onscenario?: (scenario: CameraScenario) => void;
    onmeasurement: (measurement: CameraMeasurement) => void;
    onfeedback: (message: string) => void;
  } = $props();
  let frame: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let video: HTMLVideoElement;
  let mounted = $state(false);
  let playing = $state(false);
  let fullscreen = $state(false);
  let localFullscreen = $state(false);
  let pip = $state(false);
  let canPip = $state(false);
  let feedback = $state('');
  let unavailable = $state(false);
  let stream: MediaStream | null = null;
  let animation = 0;
  let videoFrame = 0;
  let epoch = 0;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let startTimer: ReturnType<typeof setTimeout> | undefined;
  let evidenceTimer: ReturnType<typeof setTimeout> | undefined;
  let stallTimer: ReturnType<typeof setTimeout> | undefined;
  let sampleTime = 0;
  let sampleCount = 0;
  let measuredFps: number | null = null;
  let shownAt: string | null = null;

  const notify = () => onmeasurement({ fps: measuredFps, displayedAt: shownAt, playing, unavailable });
  const toast = (message: string) => {
    feedback = message; onfeedback(message);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { feedback = ''; onfeedback(''); }, 1800);
  };
  // A local calibration pattern, not a printer photograph or recorded stream.
  const draw = (position = 0) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#edf1f4'; ctx.fillRect(0, 0, 640, 360);
    ctx.strokeStyle = '#d1d9e0'; ctx.lineWidth = 1;
    for (let x = 0; x <= 640; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke(); }
    for (let y = 0; y <= 360; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke(); }
    ctx.strokeStyle = '#99a9b6'; ctx.lineWidth = 3; ctx.strokeRect(220, 100, 200, 160);
    ctx.fillStyle = '#eab941'; ctx.fillRect(224, 200 - position * 80, 192, 56);
    ctx.fillStyle = '#5d6b76'; ctx.font = '18px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('SYNTHETIC CAMERA', 320, 45);
  };
  const evidence = (time: number, count: number) => {
    if (!Number.isFinite(count) || count <= 0) return;
    if (startTimer) clearTimeout(startTimer);
    if (evidenceTimer) clearTimeout(evidenceTimer);
    if (stallTimer) clearTimeout(stallTimer);
    const current = epoch;
    evidenceTimer = setTimeout(() => {
      if (current !== epoch) return;
      measuredFps = null; sampleTime = 0; sampleCount = 0; notify();
    }, 1500);
    stallTimer = setTimeout(() => {
      if (current !== epoch) return;
      stop(); unavailable = true; notify(); toast('Local video stopped');
    }, 5000);
    playing = true;
    shownAt = new Date().toISOString();
    if (!sampleTime || count < sampleCount) { sampleTime = time; sampleCount = count; measuredFps = null; }
    else if (time - sampleTime >= 1000) {
      measuredFps = frameRate(sampleCount, count, time - sampleTime);
      sampleTime = time; sampleCount = count;
    }
    notify();
  };
  const stop = () => {
    epoch += 1;
    if (startTimer) clearTimeout(startTimer);
    if (evidenceTimer) clearTimeout(evidenceTimer);
    if (stallTimer) clearTimeout(stallTimer);
    cancelAnimationFrame(animation);
    if (videoFrame && video?.cancelVideoFrameCallback) video.cancelVideoFrameCallback(videoFrame);
    videoFrame = 0;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    if (video) video.srcObject = null;
    playing = false; measuredFps = null; shownAt = null;
    sampleTime = 0; sampleCount = 0;
    notify();
  };
  const start = async () => {
    if (stream) return;
    const current = ++epoch;
    unavailable = false;
    if (typeof canvas.captureStream !== 'function') {
      unavailable = true; notify(); return;
    }
    try {
      stream = canvas.captureStream(15);
      video.srcObject = stream;
      startTimer = setTimeout(() => {
        if (current !== epoch || playing) return;
        stop(); unavailable = true; notify(); toast('Local video is unavailable');
      }, 5000);
      let lastDraw = 0;
      let lastCount = 0;
      const animate = (time: number) => {
        if (current !== epoch) return;
        if (time - lastDraw >= 65) { draw((Math.sin(time / 1100) + 1) / 2); lastDraw = time; }
        if (!video.requestVideoFrameCallback) {
          const count = video.getVideoPlaybackQuality?.().totalVideoFrames;
          if (count !== undefined && count > lastCount) { evidence(time, count); lastCount = count; }
        }
        animation = requestAnimationFrame(animate);
      };
      if (video.requestVideoFrameCallback) {
        const presented: VideoFrameRequestCallback = (time, metadata) => {
          if (current !== epoch) return;
          evidence(time, metadata.presentedFrames);
          videoFrame = video.requestVideoFrameCallback(presented);
        };
        videoFrame = video.requestVideoFrameCallback(presented);
      }
      animation = requestAnimationFrame(animate);
      await video.play();
    } catch {
      if (current !== epoch) return;
      stop(); unavailable = true; notify(); toast('Local video is unavailable');
    }
  };
  const updateDisplay = () => {
    fullscreen = document.fullscreenElement === frame || localFullscreen;
    pip = document.pictureInPictureElement === video;
    canPip = document.pictureInPictureEnabled === true && typeof video.requestPictureInPicture === 'function';
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === frame) await document.exitFullscreen();
      else if (localFullscreen) localFullscreen = false;
      else if (capabilityPolicy === 'denied') toast('Simulated display request failure');
      else if (document.fullscreenEnabled && typeof frame.requestFullscreen === 'function' && capabilityPolicy !== 'unsupported' && scenario !== 'unsupported') await frame.requestFullscreen();
      else localFullscreen = true;
    } catch { toast('Fullscreen unavailable; preview continues'); }
    updateDisplay();
  };
  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
      else if (capabilityPolicy === 'denied') toast('Simulated display request failure');
      else if (canPip && capabilityPolicy === 'native' && playing) await video.requestPictureInPicture();
    } catch { toast('Picture in picture unavailable; preview continues'); }
    updateDisplay();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && localFullscreen) { localFullscreen = false; updateDisplay(); }
  };
  onMount(() => {
    draw(); updateDisplay(); mounted = true;
    document.addEventListener('fullscreenchange', updateDisplay);
    document.addEventListener('keydown', keydown);
    video.addEventListener('enterpictureinpicture', updateDisplay);
    video.addEventListener('leavepictureinpicture', updateDisplay);
    return () => {
      stop();
      if (toastTimer) clearTimeout(toastTimer);
      document.removeEventListener('fullscreenchange', updateDisplay);
      document.removeEventListener('keydown', keydown);
      video.removeEventListener('enterpictureinpicture', updateDisplay);
      video.removeEventListener('leavepictureinpicture', updateDisplay);
    };
  });
  $effect(() => {
    if (!mounted) return;
    const retained = scenario === 'fallback';
    const active = scenario === 'live';
    untrack(() => {
      if (active) void start();
      else { stop(); unavailable = active; if (!retained) draw(); notify(); }
      feedback = '';
      onfeedback('');
      if (toastTimer) clearTimeout(toastTimer);
    });
  });
</script>

<div class="media-frame" class:local-fullscreen={localFullscreen} bind:this={frame} data-camera-media data-camera-scenario={scenario}>
  <canvas bind:this={canvas} width="640" height="360" class:hidden={!['snapshot', 'live', 'fallback', 'unsupported'].includes(scenario)} aria-label="Synthetic camera calibration pattern"></canvas>
  <video bind:this={video} class:visible={scenario === 'live' && playing} muted autoplay playsinline aria-label="Synthetic camera video"></video>
  {#if scenario === 'loading'}<div class="loading" aria-hidden="true"><Skeleton shape="fill" /></div>{/if}
  {#if scenario === 'connecting' || scenario === 'error'}<div class="placeholder" aria-hidden="true"><Camera size={40} strokeWidth={1.5} /></div>{/if}
  <div class="media-actions" data-camera-actions>
    {#if scenario === 'loading'}<Skeleton shape="action" /><Skeleton shape="action" /><Skeleton shape="action" />
    {:else}
      {#if scenario === 'live' && playing && canPip && capabilityPolicy !== 'unsupported'}<IconButton label={pip ? 'Exit picture in picture' : 'Picture in picture'} icon={PictureInPicture2} pressed={pip} onclick={() => void togglePip()} />{/if}
      <IconButton label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} icon={fullscreen ? Minimize : Maximize} pressed={fullscreen} onclick={() => void toggleFullscreen()} />
      <IconButton label="Refresh synthetic snapshot" icon={Camera} onclick={() => toast('Fixture snapshot refreshed')} />
      <IconButton label={scenario === 'live' ? 'Close simulated live' : 'Start simulated live'} icon={scenario === 'live' ? X : Video} onclick={() => onscenario?.(scenario === 'live' ? 'snapshot' : 'live')} disabled={!onscenario} />
    {/if}
  </div>
  {#if feedback}<div class="media-feedback" data-camera-feedback>{feedback}</div>{/if}
</div>

<style>
  .media-frame { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--u1-radius-inner); background: var(--u1-soft); }
  canvas, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  video { opacity: 0; }
  video.visible { opacity: 1; }
  canvas.hidden { visibility: hidden; }
  .loading, .placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: var(--u1-faint); }
  .loading :global(.skeleton) { height: 100%; }
  .media-actions { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px; }
  .media-feedback { position: absolute; bottom: 64px; right: 10px; max-width: calc(100% - 20px); padding: 8px 11px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; pointer-events: none; }
  .media-frame:fullscreen, .local-fullscreen { width: 100vw; height: 100dvh; aspect-ratio: auto; border-radius: 0; background: #edf1f4; }
  .local-fullscreen { position: fixed; inset: 0; z-index: 100; }
</style>
