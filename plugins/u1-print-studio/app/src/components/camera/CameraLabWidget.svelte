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
  import CameraStatus from './CameraStatus.svelte';
  import CameraMedia from './CameraMedia.svelte';
  import { cameraScenario, cameraCapability, type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from '../../lib/client/camera/state';
  import type { CameraMode } from '../../lib/client/camera/session';
  let { scenario = 'snapshot', capabilityPolicy = 'native' }: {
    scenario?: CameraScenario;
    capabilityPolicy?: CameraCapabilityPolicy;
  } = $props();
  const selected = $derived(cameraScenario(scenario));
  const policy = $derived(cameraCapability(capabilityPolicy));
  let measurement = $state<CameraMeasurement>({ fps: null, displayedAt: null, playing: false });
  let feedback = $state('');
  let media: CameraMedia;
  const presented = $derived(measurement.scenario ?? selected);
  const mode = $derived(measurement.mode ?? (selected === 'live' || selected === 'connecting' ? 'live' : 'auto'));
  const selectMode = (mode: CameraMode) => media.selectMode(mode);
  const failed = $derived(presented === 'error' || !!measurement.unavailable);
  const receive = (value: CameraMeasurement) => { measurement = value; };
  const receiveFeedback = (message: string) => { feedback = message; };
</script>

<StateSurface phase={failed ? 'error' : presented === 'loading' ? 'loading' : 'ready'}>
<Shell label="U1 Camera" busy={!failed && (presented === 'loading' || presented === 'connecting' || (presented === 'live' && !measurement.playing))}>
  <Header title="U1 Camera" compact wrapAside>
    {#snippet icon()}<Icon icon={Camera} />{/snippet}
    {#snippet aside()}<CameraStatus scenario={failed ? 'loading' : presented} {measurement} />{/snippet}
  </Header>
  <Body flush>
    <CameraMedia bind:this={media} scenario={selected} capabilityPolicy={policy} onmeasurement={receive} onfeedback={receiveFeedback}>
      {#snippet actions()}<Switch label="Camera mode" options={cameraModeOptions} value={mode} onchange={selectMode} />{/snippet}
    </CameraMedia>
  </Body>
  <StateAnnouncement text={failed ? 'Could not load synthetic camera' : feedback || (presented === 'loading' ? 'Loading synthetic camera' : presented === 'live' ? 'Synthetic camera live preview selected' : `Synthetic camera ${presented}`)} />
</Shell>
</StateSurface>
