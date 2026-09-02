<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import IconGlyph from '../ui/IconGlyph.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import Caption from '../ui/Caption.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import CameraStatus from './CameraStatus.svelte';
  import CameraMedia from './CameraMedia.svelte';
  import { cameraScenario, cameraCapability, type CameraScenario, type CameraMeasurement, type CameraCapabilityPolicy } from './state';
  let { scenario = 'snapshot', capabilityPolicy = 'native', onscenario }: {
    scenario?: CameraScenario;
    capabilityPolicy?: CameraCapabilityPolicy;
    onscenario?: (scenario: CameraScenario) => void;
  } = $props();
  const selected = $derived(cameraScenario(scenario));
  const policy = $derived(cameraCapability(capabilityPolicy));
  let measurement = $state<CameraMeasurement>({ fps: null, displayedAt: null, playing: false });
  let feedback = $state('');
  let media: CameraMedia;
  const failed = $derived(selected === 'error' || !!measurement.unavailable);
  const receive = (value: CameraMeasurement) => { measurement = value; };
  const receiveFeedback = (message: string) => { feedback = message; };
</script>

<WidgetStateSurface phase={failed ? 'error' : selected === 'loading' ? 'loading' : 'ready'}>
<WidgetShell label="U1 Camera" busy={!failed && (selected === 'loading' || selected === 'connecting' || (selected === 'live' && !measurement.playing))}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<IconGlyph icon={Camera} />{/snippet}
    {#snippet meta()}<Caption>Lab fixture</Caption>{/snippet}
    {#snippet aside()}<CameraStatus scenario={failed ? 'loading' : selected} {measurement} />{/snippet}
  </WidgetHeader>
  <WidgetBody><CameraMedia bind:this={media} scenario={selected} capabilityPolicy={policy} {onscenario} onmeasurement={receive} onfeedback={receiveFeedback} /></WidgetBody>
  <WidgetFooter message={failed ? 'Could not load synthetic camera' : ''}>
    {#snippet actions()}{#if selected === 'loading'}<Skeleton shape="action" />{:else}<IconButton label={failed ? 'Retry synthetic snapshot' : 'Refresh synthetic snapshot'} icon={Camera} onclick={() => media.refresh()} />{/if}{/snippet}
  </WidgetFooter>
  <StateAnnouncement text={failed ? 'Could not load synthetic camera' : feedback || (selected === 'loading' ? 'Loading synthetic camera' : selected === 'live' ? 'Synthetic camera live preview selected' : `Synthetic camera ${selected}`)} />
</WidgetShell>
</WidgetStateSurface>
