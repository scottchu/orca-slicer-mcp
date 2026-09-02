<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import IconGlyph from '../ui/IconGlyph.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/StaticWidgetStateSurface.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import Caption from '../ui/Caption.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import Stack from '../ui/Stack.svelte';
  import TextSegmentedControl from '../ui/TextSegmentedControl.svelte';
  import CameraStatus from './CameraStatus.svelte';
  import CameraMedia from './CameraMedia.svelte';
  import { cameraScenario, cameraCapability, type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from './state';
  import type { CameraMode } from './session';
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
  const modes = [{ value: 'snapshot', label: 'Snapshot' }, { value: 'live', label: 'Live' }, { value: 'auto', label: 'Auto' }] as const;
  const mode = $derived(measurement.mode ?? (selected === 'live' || selected === 'connecting' ? 'live' : selected === 'fallback' ? 'auto' : 'snapshot'));
  const selectMode = (mode: CameraMode) => media.selectMode(mode);
  const failed = $derived(presented === 'error' || !!measurement.unavailable);
  const receive = (value: CameraMeasurement) => { measurement = value; };
  const receiveFeedback = (message: string) => { feedback = message; };
</script>

<WidgetStateSurface phase={failed ? 'error' : presented === 'loading' ? 'loading' : 'ready'}>
<WidgetShell label="U1 Camera" busy={!failed && (presented === 'loading' || presented === 'connecting' || (presented === 'live' && !measurement.playing))}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<IconGlyph icon={Camera} />{/snippet}
    {#snippet meta()}<Caption>Lab fixture</Caption>{/snippet}
    {#snippet aside()}<CameraStatus scenario={failed ? 'loading' : presented} {measurement} />{/snippet}
  </WidgetHeader>
  <WidgetBody><Stack><TextSegmentedControl label="Camera mode" options={modes} value={mode} onchange={selectMode} /><CameraMedia bind:this={media} scenario={selected} capabilityPolicy={policy} onmeasurement={receive} onfeedback={receiveFeedback} /></Stack></WidgetBody>
  <WidgetFooter message={failed ? 'Could not load synthetic camera' : ''}>
    {#snippet actions()}{#if presented === 'loading'}<Skeleton shape="action" />{:else}<IconButton label={failed ? 'Retry synthetic snapshot' : 'Refresh synthetic snapshot'} icon={Camera} onclick={() => media.refresh()} />{/if}{/snippet}
  </WidgetFooter>
  <StateAnnouncement text={failed ? 'Could not load synthetic camera' : feedback || (presented === 'loading' ? 'Loading synthetic camera' : presented === 'live' ? 'Synthetic camera live preview selected' : `Synthetic camera ${presented}`)} />
</WidgetShell>
</WidgetStateSurface>
