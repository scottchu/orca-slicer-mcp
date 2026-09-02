<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import IconGlyph from '../ui/IconGlyph.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/StaticWidgetStateSurface.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import Stack from '../ui/Stack.svelte';
  import TextSegmentedControl from '../ui/TextSegmentedControl.svelte';
  import MediaStatus from '../media/MediaStatus.svelte';
  import VideoSurface from '../media/VideoSurface.svelte';
  import type { VideoSurfacePort } from '../media/playback';
  import type { CameraMode, CameraSessionState } from './session';
  let { state, feedback, onready, onfeedback, onrefresh, onmode }: {
    state: CameraSessionState; feedback: string;
    onready: (surface: VideoSurfacePort) => (() => void); onfeedback: (message: string) => void;
    onrefresh: () => void; onmode: (mode: CameraMode) => void;
  } = $props();
  const live = $derived(state.phase === 'live');
  const loading = $derived(state.phase === 'loading');
  const failed = $derived(state.phase === 'error' || !!state.failure);
  const failureMessage = $derived(failed ? 'Could not load camera' : '');
  const modes = [{ value: 'snapshot', label: 'Snapshot' }, { value: 'live', label: 'Live' }, { value: 'auto', label: 'Auto' }] as const;
  const label = $derived(live ? 'Live' : state.phase === 'connecting' ? 'Connecting' : state.mode === 'auto' ? 'Auto' : state.phase === 'snapshot' ? 'Snapshot' : state.phase === 'error' ? 'Unavailable' : 'Connecting');
  const time = $derived(live ? state.liveAt : state.snapshot?.observedAt ?? null);
</script>

<WidgetStateSurface phase={failed ? 'error' : loading ? 'loading' : 'ready'}>
<WidgetShell label="U1 Camera" busy={!failed && (loading || state.phase === 'connecting' || state.refreshing)}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<IconGlyph icon={Camera} />{/snippet}
    {#snippet aside()}<MediaStatus {label} {live} {time} fps={state.fps} loading={loading || failed} />{/snippet}
  </WidgetHeader>
  <WidgetBody>
    <Stack>
      <TextSegmentedControl label="Camera mode" options={modes} value={state.mode} onchange={onmode} />
      <VideoSurface snapshot={state.snapshot?.image ?? null} active={live} {loading} {failed} feedback={failed ? '' : feedback} {onready} {onfeedback} />
    </Stack>
  </WidgetBody>
  <WidgetFooter message={failureMessage}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<IconButton label={failed ? 'Retry snapshot' : 'Refresh snapshot'} icon={Camera} busy={state.refreshing || state.phase === 'connecting'} onclick={onrefresh} />{/if}{/snippet}
  </WidgetFooter>
  <StateAnnouncement text={failureMessage || feedback || (loading ? 'Loading camera' : label)} />
</WidgetShell>
</WidgetStateSurface>
