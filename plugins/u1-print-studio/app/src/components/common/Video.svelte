<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { Maximize, Minimize, PictureInPicture2 } from 'lucide-svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import { createVideoPlayback, type VideoSurfacePort } from '../../lib/client/media/playback';
  import { createDocumentPresentation, type Presentation, type PresentationFactory, type PresentationState } from '../../lib/client/media/presentation';
  let { label, snapshotLabel, fullscreenLabel, placeholderIcon, snapshot = null, active = false, loading = false, failed = false, feedback = '', status, rounded = true, actions, presentation, onready, onfeedback }: {
    label: string; snapshotLabel: string; fullscreenLabel: string; placeholderIcon?: typeof import('lucide-svelte')['Box'];
    snapshot?: string | null; active?: boolean; loading?: boolean; failed?: boolean; feedback?: string; status?: string; rounded?: boolean; actions?: Snippet;
    presentation?: PresentationFactory;
    onready: (surface: VideoSurfacePort) => (() => void); onfeedback: (message: string) => void;
  } = $props();
  type WebkitVideo = HTMLVideoElement & { webkitPresentationMode?: string; webkitSupportsPresentationMode?: (mode: string) => boolean; webkitSetPresentationMode?: (mode: string) => void };
  let frame: HTMLDivElement;
  let video: HTMLVideoElement;
  let display = $state<PresentationState>({ mode: 'inline', pending: false, surface: 'document' });
  const fullscreen = $derived(display.mode === 'fullscreen');
  const hostedFullscreen = $derived(fullscreen && display.surface === 'host');
  let presenter: Presentation | undefined;
  let fullscreenButton = $state<Button>();
  let pip = $state(false);
  let canPip = $state(false);
  let mounted = false;
  let displayPending = false;
  let returnFocus: HTMLElement | null = null;
  const updateDisplay = () => {
    if (!mounted) return;
    const compatible = video as WebkitVideo;
    pip = document.pictureInPictureElement === video || compatible.webkitPresentationMode === 'picture-in-picture';
    canPip = (document.pictureInPictureEnabled === true && typeof video.requestPictureInPicture === 'function') || compatible.webkitSupportsPresentationMode?.('picture-in-picture') === true;
  };
  const focusBack = () => { if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); };
  const toggleFullscreen = async () => {
    if (display.pending || displayPending || !presenter) return;
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focus = fullscreenButton?.captureFocus();
    const granted = await presenter.toggle();
    const recoverFocus = focus?.ownsFocus();
    focus?.release();
    if (!mounted) return;
    if (!granted) onfeedback('Fullscreen unavailable');
    if (recoverFocus && origin?.isConnected) origin.focus({ preventScroll: true });
  };
  const togglePip = async () => {
    if (displayPending || display.pending) return;
    displayPending = true; returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      const compatible = video as WebkitVideo;
      if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
      else if (compatible.webkitPresentationMode === 'picture-in-picture') compatible.webkitSetPresentationMode?.('inline');
      else if (active && document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') await video.requestPictureInPicture();
      else if (active && compatible.webkitSupportsPresentationMode?.('picture-in-picture')) compatible.webkitSetPresentationMode?.('picture-in-picture');
    } catch { onfeedback('PiP unavailable'); }
    finally { displayPending = false; updateDisplay(); focusBack(); }
  };
  onMount(() => {
    mounted = true; updateDisplay();
    const playback = createVideoPlayback(video, { request: requestAnimationFrame, cancel: cancelAnimationFrame });
    const teardown = onready(playback);
    presenter = presentation?.(frame) ?? createDocumentPresentation(frame, document);
    const unsubscribeDisplay = presenter.subscribe(value => { display = value; });
    video.addEventListener('enterpictureinpicture', updateDisplay);
    video.addEventListener('leavepictureinpicture', updateDisplay);
    video.addEventListener('webkitpresentationmodechanged', updateDisplay);
    video.addEventListener('loadedmetadata', updateDisplay);
    video.addEventListener('playing', updateDisplay);
    return () => {
      mounted = false; unsubscribeDisplay(); presenter?.dispose(); presenter = undefined;
      teardown(); playback.dispose();
      video.removeEventListener('enterpictureinpicture', updateDisplay);
      video.removeEventListener('leavepictureinpicture', updateDisplay);
      video.removeEventListener('webkitpresentationmodechanged', updateDisplay);
      video.removeEventListener('loadedmetadata', updateDisplay);
      video.removeEventListener('playing', updateDisplay);
    };
  });
</script>

<div class="media-slot" data-media-slot>
  <div class="media-surface" class:square={!rounded} class:host-fullscreen={hostedFullscreen} bind:this={frame} data-media-surface aria-label={fullscreen ? fullscreenLabel : undefined}>
    {#if snapshot}<img src={snapshot} class:masked={failed} aria-hidden={failed} alt={failed ? '' : snapshotLabel} />{/if}
    <video bind:this={video} class:visible={active && !failed} class:masked={failed} muted autoplay playsinline aria-hidden={failed} aria-label={failed ? undefined : label}></video>
    {#if loading || failed}<div class="placeholder" aria-hidden="true"><Skeleton shape="fill" /></div>
    {:else if !snapshot && !active}<div class="placeholder" aria-hidden="true">{#if placeholderIcon}<Icon icon={placeholderIcon} size={40} />{/if}</div>{/if}
    <div class="controls" class:with-status={status !== undefined}>
      {#if status}<div class="status" data-media-status-message>{status}</div>{/if}
    <div class="actions" data-media-actions>
      {#if (loading || failed) && status === undefined && !fullscreen}<Skeleton shape="action" /><Skeleton shape="action" />
      {:else}
        {#if active && canPip}<Button label={pip ? 'Exit picture in picture' : 'Picture in picture'} icon={PictureInPicture2} pressed={pip} onclick={() => void togglePip()} />{/if}
        <Button bind:this={fullscreenButton} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} icon={fullscreen ? Minimize : Maximize} pressed={fullscreen} onclick={() => void toggleFullscreen()} />
      {/if}
      {@render actions?.()}
    </div>
    </div>
    {#if feedback}<div class="feedback" data-media-feedback>{feedback}</div>{/if}
  </div>
</div>

<style>
  .media-slot { width: 100%; aspect-ratio: 16 / 9; }
  .media-surface { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: var(--u1-radius-inner); background: var(--u1-soft); }
  img, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  video { opacity: 0; }
  video.visible { opacity: 1; }
  .masked { visibility: hidden; pointer-events: none; }
  .placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: var(--u1-faint); }
  .placeholder :global(.skeleton) { height: 100%; }
  .controls { position: absolute; bottom: 10px; right: 10px; display: flex; align-items: flex-end; gap: 8px; }
  .controls.with-status { left: 10px; }
  .actions { display: flex; flex: 0 0 auto; gap: 8px; margin-left: auto; }
  .status { min-width: 0; max-width: 20em; padding: 5px 7px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; line-height: 1.25; overflow-wrap: anywhere; }
  .square { border-radius: 0; }
  .feedback { position: absolute; bottom: 64px; right: 10px; max-width: calc(100% - 20px); padding: 8px 11px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; pointer-events: none; }
  .media-surface:fullscreen { width: 100vw; height: 100dvh; border-radius: 0; background: var(--u1-soft); }
  .host-fullscreen {
    position: fixed;
    inset: var(--u1-host-inset-top, env(safe-area-inset-top, 0px)) var(--u1-host-inset-right, env(safe-area-inset-right, 0px)) var(--u1-host-inset-bottom, env(safe-area-inset-bottom, 0px)) var(--u1-host-inset-left, env(safe-area-inset-left, 0px));
    width: auto; height: auto; border-radius: 0; z-index: 100;
  }
  @media (max-width: 420px) {
    .with-status .status { position: absolute; left: 0; bottom: 54px; max-width: 100%; box-sizing: border-box; }
  }
</style>
