<script lang="ts">
  import { Camera, Video, X } from 'lucide-svelte';
  import Icon from '../ui/Icon.svelte';
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
  const requested = $derived(live || state.phase === 'connecting');
  const label = $derived(live ? 'Live' : state.phase === 'snapshot' ? 'Snapshot' : state.phase === 'fallback' ? 'Snapshot fallback' : state.phase === 'error' ? 'Unavailable' : 'Connecting');
  const time = $derived(live ? state.liveAt : state.snapshot?.observedAt ?? null);
</script>

<WidgetShell label="U1 Camera" busy={loading || state.phase === 'connecting' || state.refreshing}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<Icon name="camera" />{/snippet}
    {#snippet aside()}<MediaStatus {label} {live} {time} fps={state.fps} {loading} />{/snippet}
  </WidgetHeader>
  <WidgetBody>
    <VideoSurface snapshot={state.snapshot?.image ?? null} active={live} {loading} {feedback} {onready} {onfeedback}>
      {#snippet actions()}
        <IconButton label="Refresh snapshot" icon={Camera} busy={state.refreshing || state.phase === 'connecting'} onclick={onrefresh} />
        <IconButton label={requested ? 'Close live camera' : state.phase === 'fallback' ? 'Retry live camera' : 'Go live'} icon={requested ? X : Video} busy={!requested && state.refreshing} disabled={!requested && !state.snapshot} onclick={requested ? onclose : onlive} />
        {#if state.phase === 'fallback'}<IconButton label="Close live camera" icon={X} onclick={onclose} />{/if}
      {/snippet}
    </VideoSurface>
  </WidgetBody>
  <StateAnnouncement text={feedback || (loading ? 'Loading camera' : label)} />
</WidgetShell>
