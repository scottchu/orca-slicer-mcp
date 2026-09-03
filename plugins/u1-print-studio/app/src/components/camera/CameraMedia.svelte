<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Camera, Maximize, Minimize, PictureInPicture2 } from 'lucide-svelte';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import { type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from '../../lib/client/camera/state';
  import { createSyntheticCameraSession } from '../../lib/client/camera/synthetic-session';
  import { createDocumentPresentation, type Presentation } from '../../lib/client/media/presentation';
  import type { CameraMode } from '../../lib/client/camera/session';
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
  let displayPending = $state(false);
  let presenter: Presentation | undefined;
  let fullscreenButton = $state<Button>();
  let pip = $state(false);
  let canPip = $state(false);
  let feedback = $state('');
  let unavailable = $state(false);
  let service: ReturnType<typeof createSyntheticCameraSession> | null = null;
  let presented = $state<CameraScenario>('snapshot');
  const failed = $derived(presented === 'error' || unavailable);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const toast = (message: string) => { feedback = message; onfeedback(message); clearTimeout(toastTimer); toastTimer = setTimeout(() => { feedback = ''; onfeedback(''); }, 1800); };
  export const refresh = () => service?.refresh();
  export const selectMode = (mode: CameraMode) => service?.selectMode(mode);
  const updateDisplay = () => {
    pip = document.pictureInPictureElement === video;
    canPip = document.pictureInPictureEnabled === true && typeof video.requestPictureInPicture === 'function';
  };
  const toggleFullscreen = async () => {
    if (!presenter || displayPending) return;
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focus = fullscreenButton?.captureFocus();
    const granted = await presenter.toggle();
    const recoverFocus = focus?.ownsFocus();
    focus?.release();
    if (!mounted) return;
    if (!granted) toast(capabilityPolicy === 'denied' ? 'Simulated display request failure' : 'Fullscreen unavailable');
    if (recoverFocus && origin?.isConnected) origin.focus({ preventScroll: true });
  };
  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
      else if (capabilityPolicy === 'denied') toast('Simulated display request failure');
      else if (canPip && capabilityPolicy === 'native' && playing) await video.requestPictureInPicture();
    } catch { toast('Picture in picture unavailable; preview continues'); }
    updateDisplay();
  };
  onMount(() => {
    service = createSyntheticCameraSession(canvas, video, measurement => { playing = measurement.playing; unavailable = measurement.unavailable ?? false; presented = measurement.scenario ?? scenario; onmeasurement(measurement); }, toast);
    updateDisplay(); mounted = true;
    presenter = createDocumentPresentation(frame, document, () => capabilityPolicy === 'native' && scenario !== 'unsupported');
    const unsubscribeDisplay = presenter.subscribe(value => { fullscreen = value.mode === 'fullscreen'; displayPending = value.pending; });
    const hide = () => service?.pageHide(), show = () => service?.pageShow();
    window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show);
    video.addEventListener('enterpictureinpicture', updateDisplay);
    video.addEventListener('leavepictureinpicture', updateDisplay);
    return () => {
      mounted = false; unsubscribeDisplay(); presenter?.dispose(); presenter = undefined;
      service?.dispose(); service = null;
      window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
      if (toastTimer) clearTimeout(toastTimer);
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

<div class="media-frame" bind:this={frame} data-camera-media data-camera-scenario={presented}>
  <canvas bind:this={canvas} width="640" height="360" class:hidden={failed || !['snapshot', 'live', 'fallback', 'unsupported'].includes(presented)} aria-hidden={failed} aria-label={failed ? undefined : 'Synthetic camera calibration pattern'}></canvas>
  <video bind:this={video} class:visible={!failed && presented === 'live' && playing} muted autoplay playsinline aria-hidden={failed} aria-label={failed ? undefined : 'Synthetic camera video'}></video>
  {#if presented === 'loading' || failed}<div class="loading" aria-hidden="true"><Skeleton shape="fill" /></div>{/if}
  {#if presented === 'connecting'}<div class="placeholder" aria-hidden="true"><Camera size={40} strokeWidth={1.5} /></div>{/if}
  <div class="media-controls">
    {#if failed}<div class="media-status-message">Could not load camera</div>{/if}
  <div class="media-actions" data-camera-actions>
      {#if presented === 'live' && playing && canPip && capabilityPolicy !== 'unsupported'}<Button label={pip ? 'Exit picture in picture' : 'Picture in picture'} icon={PictureInPicture2} pressed={pip} onclick={() => void togglePip()} />{/if}
      <Button bind:this={fullscreenButton} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} icon={fullscreen ? Minimize : Maximize} pressed={fullscreen} onclick={() => void toggleFullscreen()} />
    {@render actions?.()}
  </div>
  </div>
  {#if feedback && !failed}<div class="media-feedback" data-camera-feedback>{feedback}</div>{/if}
</div>

<style>
  .media-frame { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: var(--u1-soft); }
  canvas, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  video { opacity: 0; }
  video.visible { opacity: 1; }
  canvas.hidden { visibility: hidden; }
  .loading, .placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: var(--u1-faint); }
  .loading :global(.skeleton) { height: 100%; }
  .media-controls { position: absolute; bottom: 10px; right: 10px; left: 10px; display: flex; align-items: flex-end; gap: 8px; }
  .media-actions { display: flex; flex: 0 0 auto; gap: 8px; margin-left: auto; }
  .media-status-message { min-width: 0; padding: 5px 7px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; line-height: 1.25; overflow-wrap: anywhere; }
  .media-feedback { position: absolute; bottom: 64px; right: 10px; max-width: calc(100% - 20px); padding: 8px 11px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; pointer-events: none; }
  .media-frame:fullscreen { width: 100vw; height: 100dvh; aspect-ratio: auto; border-radius: 0; background: #edf1f4; }
  @media (max-width: 420px) {
    .media-status-message { position: absolute; left: 0; bottom: 54px; max-width: 100%; box-sizing: border-box; }
  }
</style>
