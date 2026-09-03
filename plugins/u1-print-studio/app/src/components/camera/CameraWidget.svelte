<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import Icon from '../common/Icon.svelte';
  import StateSurface from '../common/StateSurface/StaticStateSurface.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import Switch from '../common/Switch.svelte';
  import { cameraModeOptions } from '../../lib/client/camera/mode-options';
  import MediaStatus from '../common/MediaStatus.svelte';
  import Video from '../common/Video.svelte';
  import type { PresentationFactory } from '../../lib/client/media/presentation';
  import type { VideoSurfacePort } from '../../lib/client/media/playback';
  import type { CameraMode, CameraSessionState } from '../../lib/client/camera/session';
  import { cameraLiveFailureMessage } from '../../lib/client/camera/failure';
  let { state, feedback, presentation, onready, onfeedback, onmode }: {
    state: CameraSessionState; feedback: string; presentation?: PresentationFactory;
    onready: (surface: VideoSurfacePort) => (() => void); onfeedback: (message: string) => void;
    onmode: (mode: CameraMode) => void;
  } = $props();
  const live = $derived(state.phase === 'live');
  const loading = $derived(state.phase === 'loading');
  const failed = $derived(state.phase === 'error' || !!state.failure);
  const failureMessage = $derived(state.failure === 'snapshot' || state.phase === 'error'
    ? 'Could not load camera'
    : state.lastLiveFailure
      ? cameraLiveFailureMessage(state.lastLiveFailure)
      : failed ? 'Could not load camera' : '');
  const label = $derived(live ? 'Live' : state.phase === 'connecting' ? 'Connecting' : state.mode === 'auto' ? 'Auto' : state.phase === 'snapshot' ? 'Snapshot' : state.phase === 'error' ? 'Unavailable' : 'Connecting');
  const time = $derived(live ? state.liveAt : state.snapshot?.observedAt ?? null);
</script>

<StateSurface phase={failed ? 'error' : loading ? 'loading' : 'ready'}>
<Shell label="U1 Camera" busy={!failed && (loading || state.phase === 'connecting' || state.refreshing)}>
  <Header title="U1 Camera" compact wrapAside>
    {#snippet icon()}<Icon icon={Camera} />{/snippet}
    {#snippet aside()}<MediaStatus compact {label} {live} {time} fps={state.fps} loading={loading || failed} />{/snippet}
  </Header>
  <Body flush>
    <Video rounded={false} status={failureMessage} label="Live printer camera" snapshotLabel="Latest camera snapshot" fullscreenLabel="Fullscreen camera" placeholderIcon={Camera} snapshot={state.snapshot?.image ?? null} active={live} {loading} {failed} feedback={failed ? '' : feedback} {presentation} {onready} {onfeedback}>
      {#snippet actions()}<Switch label="Camera mode" options={cameraModeOptions} value={state.mode} onchange={onmode} />{/snippet}
    </Video>
  </Body>
  <StateAnnouncement text={failureMessage || feedback || (loading ? 'Loading camera' : label)} />
</Shell>
</StateSurface>
