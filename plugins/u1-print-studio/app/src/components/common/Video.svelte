<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { Maximize, Minimize, PictureInPicture2 } from 'lucide-svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import { createVideoPlayback, type VideoSurfacePort } from '../../lib/client/media/playback';
  let { label, snapshotLabel, fullscreenLabel, placeholderIcon, snapshot = null, active = false, loading = false, failed = false, feedback = '', actions, onready, onfeedback }: {
    label: string; snapshotLabel: string; fullscreenLabel: string; placeholderIcon?: typeof import('lucide-svelte')['Box'];
    snapshot?: string | null; active?: boolean; loading?: boolean; failed?: boolean; feedback?: string; actions?: Snippet;
    onready: (surface: VideoSurfacePort) => (() => void); onfeedback: (message: string) => void;
  } = $props();
  type WebkitVideo = HTMLVideoElement & { webkitPresentationMode?: string; webkitSupportsPresentationMode?: (mode: string) => boolean; webkitSetPresentationMode?: (mode: string) => void };
  let frame: HTMLDivElement;
  let video: HTMLVideoElement;
  let localFullscreen = $state(false);
  let fullscreen = $state(false);
  let pip = $state(false);
  let canPip = $state(false);
  let mounted = false;
  let displayPending = false;
  let returnFocus: HTMLElement | null = null;
  $effect(() => {
    // A failed acquisition masks in-frame actions. Leave the local viewport
    // presentation so its still-available footer Retry remains reachable.
    if (failed && localFullscreen) { localFullscreen = false; fullscreen = false; }
  });
  const updateDisplay = () => {
    if (!mounted) return;
    fullscreen = document.fullscreenElement === frame || localFullscreen;
    const compatible = video as WebkitVideo;
    pip = document.pictureInPictureElement === video || compatible.webkitPresentationMode === 'picture-in-picture';
    canPip = (document.pictureInPictureEnabled === true && typeof video.requestPictureInPicture === 'function') || compatible.webkitSupportsPresentationMode?.('picture-in-picture') === true;
  };
  const focusBack = () => { if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); };
  const toggleFullscreen = async () => {
    if (displayPending) return;
    displayPending = true; returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      if (document.fullscreenElement === frame) await document.exitFullscreen();
      else if (localFullscreen) localFullscreen = false;
      else if (document.fullscreenEnabled && typeof frame.requestFullscreen === 'function') await frame.requestFullscreen();
      else localFullscreen = true;
    } catch { onfeedback('Fullscreen unavailable'); }
    finally { displayPending = false; updateDisplay(); focusBack(); }
  };
  const togglePip = async () => {
    if (displayPending) return;
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
  const keydown = (event: KeyboardEvent) => {
    if (!localFullscreen) return;
    if (event.key === 'Escape') { event.preventDefault(); localFullscreen = false; updateDisplay(); focusBack(); }
    if (event.key !== 'Tab') return;
    const controls = [...frame.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter(button => button.tabIndex >= 0);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  onMount(() => {
    mounted = true; updateDisplay();
    const playback = createVideoPlayback(video, { request: requestAnimationFrame, cancel: cancelAnimationFrame });
    const teardown = onready(playback);
    document.addEventListener('fullscreenchange', updateDisplay);
    document.addEventListener('keydown', keydown);
    video.addEventListener('enterpictureinpicture', updateDisplay);
    video.addEventListener('leavepictureinpicture', updateDisplay);
    video.addEventListener('webkitpresentationmodechanged', updateDisplay);
    video.addEventListener('loadedmetadata', updateDisplay);
    video.addEventListener('playing', updateDisplay);
    return () => {
      mounted = false; teardown(); playback.dispose();
      document.removeEventListener('fullscreenchange', updateDisplay);
      document.removeEventListener('keydown', keydown);
      video.removeEventListener('enterpictureinpicture', updateDisplay);
      video.removeEventListener('leavepictureinpicture', updateDisplay);
      video.removeEventListener('webkitpresentationmodechanged', updateDisplay);
      video.removeEventListener('loadedmetadata', updateDisplay);
      video.removeEventListener('playing', updateDisplay);
    };
  });
</script>

<div class="media-slot" data-media-slot>
  <div class="media-surface" class:local-fullscreen={localFullscreen} bind:this={frame} data-media-surface role={localFullscreen ? 'dialog' : undefined} aria-modal={localFullscreen ? true : undefined} aria-label={localFullscreen ? fullscreenLabel : undefined}>
    {#if snapshot}<img src={snapshot} class:masked={failed} aria-hidden={failed} alt={failed ? '' : snapshotLabel} />{/if}
    <video bind:this={video} class:visible={active && !failed} class:masked={failed} muted autoplay playsinline aria-hidden={failed} aria-label={failed ? undefined : label}></video>
    {#if loading || failed}<div class="placeholder" aria-hidden="true"><Skeleton shape="fill" /></div>
    {:else if !snapshot && !active}<div class="placeholder" aria-hidden="true">{#if placeholderIcon}<Icon icon={placeholderIcon} size={40} />{/if}</div>{/if}
    <div class="actions" data-media-actions>
      {#if loading || failed}<Skeleton shape="action" /><Skeleton shape="action" />
      {:else}
        {#if active && canPip}<Button label={pip ? 'Exit picture in picture' : 'Picture in picture'} icon={PictureInPicture2} pressed={pip} onclick={() => void togglePip()} />{/if}
        <Button label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} icon={fullscreen ? Minimize : Maximize} pressed={fullscreen} onclick={() => void toggleFullscreen()} />
      {/if}
      {@render actions?.()}
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
  .actions { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px; }
  .feedback { position: absolute; bottom: 64px; right: 10px; max-width: calc(100% - 20px); padding: 8px 11px; border-radius: var(--u1-radius-control); background: rgb(28 30 32 / 86%); color: white; font-size: 12px; pointer-events: none; }
  .media-surface:fullscreen, .local-fullscreen { width: 100vw; height: 100dvh; border-radius: 0; background: var(--u1-soft); }
  .local-fullscreen { position: fixed; inset: 0; z-index: 100; }
</style>
