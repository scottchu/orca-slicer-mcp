<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Camera, Maximize, Minimize, PictureInPicture2 } from 'lucide-svelte';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import { type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from './state';
  import { createSyntheticCameraSession } from './synthetic-session';
  import type { CameraMode } from './session';
  let { scenario, capabilityPolicy, onmeasurement, onfeedback, actions }: {
    scenario: CameraScenario;
    capabilityPolicy: CameraCapabilityPolicy;
    onmeasurement: (measurement: CameraMeasurement) => void;
    onfeedback: (message: string) => void;
    actions?: Snippet;
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
  let service: ReturnType<typeof createSyntheticCameraSession> | null = null;
  let presented = $state<CameraScenario>('snapshot');
  const failed = $derived(presented === 'error' || unavailable);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => { if (failed && localFullscreen) { localFullscreen = false; fullscreen = false; } });
  const toast = (message: string) => { feedback = message; onfeedback(message); clearTimeout(toastTimer); toastTimer = setTimeout(() => { feedback = ''; onfeedback(''); }, 1800); };
  export const refresh = () => service?.refresh();
  export const selectMode = (mode: CameraMode) => service?.selectMode(mode);
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
    service = createSyntheticCameraSession(canvas, video, measurement => { playing = measurement.playing; unavailable = measurement.unavailable ?? false; presented = measurement.scenario ?? scenario; onmeasurement(measurement); }, toast);
    updateDisplay(); mounted = true;
    const hide = () => service?.pageHide(), show = () => service?.pageShow();
    window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show);
    document.addEventListener('fullscreenchange', updateDisplay);
    document.addEventListener('keydown', keydown);
    video.addEventListener('enterpictureinpicture', updateDisplay);
    video.addEventListener('leavepictureinpicture', updateDisplay);
    return () => {
      service?.dispose(); service = null;
      window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
      if (toastTimer) clearTimeout(toastTimer);
      document.removeEventListener('fullscreenchange', updateDisplay);
      document.removeEventListener('keydown', keydown);
      video.removeEventListener('enterpictureinpicture', updateDisplay);
      video.removeEventListener('leavepictureinpicture', updateDisplay);
    };
  });
  $effect(() => {
    if (!mounted) return;
    const selected = scenario;
    untrack(() => { service?.setScenario(selected); feedback = ''; onfeedback(''); clearTimeout(toastTimer); });
  });
</script>

<div class="media-frame" class:local-fullscreen={localFullscreen} bind:this={frame} data-camera-media data-camera-scenario={presented}>
  <canvas bind:this={canvas} width="640" height="360" class:hidden={failed || !['snapshot', 'live', 'fallback', 'unsupported'].includes(presented)} aria-hidden={failed} aria-label={failed ? undefined : 'Synthetic camera calibration pattern'}></canvas>
  <video bind:this={video} class:visible={!failed && presented === 'live' && playing} muted autoplay playsinline aria-hidden={failed} aria-label={failed ? undefined : 'Synthetic camera video'}></video>
  {#if presented === 'loading' || failed}<div class="loading" aria-hidden="true"><Skeleton shape="fill" /></div>{/if}
  {#if presented === 'connecting'}<div class="placeholder" aria-hidden="true"><Camera size={40} strokeWidth={1.5} /></div>{/if}
  <div class="media-actions" data-camera-actions>
    {#if presented === 'loading' || failed}<Skeleton shape="action" /><Skeleton shape="action" />
    {:else}
      {#if presented === 'live' && playing && canPip && capabilityPolicy !== 'unsupported'}<Button label={pip ? 'Exit picture in picture' : 'Picture in picture'} icon={PictureInPicture2} pressed={pip} onclick={() => void togglePip()} />{/if}
      <Button label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} icon={fullscreen ? Minimize : Maximize} pressed={fullscreen} onclick={() => void toggleFullscreen()} />
    {/if}
    {@render actions?.()}
  </div>
  {#if feedback && !failed}<div class="media-feedback" data-camera-feedback>{feedback}</div>{/if}
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
