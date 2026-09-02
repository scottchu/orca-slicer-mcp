<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import Icon from '../common/Icon.svelte';
  import Footer from '../common/Footer.svelte';
  import StateSurface from '../common/StateSurface/StaticStateSurface.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import Button from '../common/Button.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import Switch from '../common/Switch.svelte';
  import { cameraModeOptions } from './mode-options';
  import MediaStatus from '../common/MediaStatus.svelte';
  import Video from '../common/Video.svelte';
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
  const label = $derived(live ? 'Live' : state.phase === 'connecting' ? 'Connecting' : state.mode === 'auto' ? 'Auto' : state.phase === 'snapshot' ? 'Snapshot' : state.phase === 'error' ? 'Unavailable' : 'Connecting');
  const time = $derived(live ? state.liveAt : state.snapshot?.observedAt ?? null);
</script>

<StateSurface phase={failed ? 'error' : loading ? 'loading' : 'ready'}>
<Shell label="U1 Camera" busy={!failed && (loading || state.phase === 'connecting' || state.refreshing)}>
  <Header title="U1 Camera" wrapAside>
    {#snippet icon()}<Icon icon={Camera} />{/snippet}
    {#snippet aside()}<MediaStatus {label} {live} {time} fps={state.fps} loading={loading || failed} />{/snippet}
  </Header>
  <Body>
    <Video label="Live printer camera" snapshotLabel="Latest camera snapshot" fullscreenLabel="Fullscreen camera" placeholderIcon={Camera} snapshot={state.snapshot?.image ?? null} active={live} {loading} {failed} feedback={failed ? '' : feedback} {onready} {onfeedback}>
      {#snippet actions()}<Switch label="Camera mode" options={cameraModeOptions} value={state.mode} onchange={onmode} />{/snippet}
    </Video>
  </Body>
  <Footer message={failureMessage}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<Button label={failed ? 'Retry snapshot' : 'Refresh snapshot'} icon={Camera} busy={state.refreshing || state.phase === 'connecting'} onclick={onrefresh} />{/if}{/snippet}
  </Footer>
  <StateAnnouncement text={failureMessage || feedback || (loading ? 'Loading camera' : label)} />
</Shell>
</StateSurface>
