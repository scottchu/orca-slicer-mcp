<script lang="ts">
  import { Camera, Video, X } from 'lucide-svelte';
  import IconGlyph from '../ui/IconGlyph.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import MediaStatus from '../media/MediaStatus.svelte';
  import VideoSurface from '../media/VideoSurface.svelte';
  import type { VideoSurfacePort } from '../media/playback';
  import type { CameraSessionState } from './session';
  let { state, feedback, onready, onfeedback, onrefresh, onlive, onclose }: {
    state: CameraSessionState; feedback: string;
    onready: (surface: VideoSurfacePort) => (() => void); onfeedback: (message: string) => void;
    onrefresh: () => void; onlive: () => void; onclose: () => void;
  } = $props();
  const live = $derived(state.phase === 'live');
  const loading = $derived(state.phase === 'loading');
  const failed = $derived(state.phase === 'error' || !!state.failure);
  const failureMessage = $derived(failed ? 'Could not load camera' : '');
  const requested = $derived(live || state.phase === 'connecting');
  const label = $derived(live ? 'Live' : state.phase === 'snapshot' ? 'Snapshot' : state.phase === 'fallback' ? 'Snapshot fallback' : state.phase === 'error' ? 'Unavailable' : 'Connecting');
  const time = $derived(live ? state.liveAt : state.snapshot?.observedAt ?? null);
</script>

<WidgetStateSurface phase={failed ? 'error' : loading ? 'loading' : 'ready'}>
<WidgetShell label="U1 Camera" busy={loading || state.phase === 'connecting' || state.refreshing}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<IconGlyph icon={Camera} />{/snippet}
    {#snippet aside()}<MediaStatus {label} {live} {time} fps={state.fps} loading={loading || failed} />{/snippet}
  </WidgetHeader>
  <WidgetBody>
    <VideoSurface snapshot={state.snapshot?.image ?? null} active={live} {loading} {failed} feedback={failed ? '' : feedback} {onready} {onfeedback}>
      {#snippet actions()}
        <IconButton label={requested ? 'Close live camera' : state.phase === 'fallback' ? 'Retry live camera' : 'Go live'} icon={requested ? X : Video} busy={!requested && state.refreshing} disabled={!requested && !state.snapshot} onclick={requested ? onclose : onlive} />
        {#if state.phase === 'fallback'}<IconButton label="Close live camera" icon={X} onclick={onclose} />{/if}
      {/snippet}
    </VideoSurface>
  </WidgetBody>
  <WidgetFooter message={failureMessage}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<IconButton label={failed ? 'Retry snapshot' : 'Refresh snapshot'} icon={Camera} busy={state.refreshing || state.phase === 'connecting'} onclick={onrefresh} />{/if}{/snippet}
  </WidgetFooter>
  <StateAnnouncement text={failureMessage || feedback || (loading ? 'Loading camera' : label)} />
</WidgetShell>
</WidgetStateSurface>
