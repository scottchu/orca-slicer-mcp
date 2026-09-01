<script lang="ts">
  import Icon from '../ui/Icon.svelte';
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
  const receive = (value: CameraMeasurement) => { measurement = value; };
  const receiveFeedback = (message: string) => { feedback = message; };
</script>

<WidgetShell label="U1 Camera" busy={selected === 'loading' || selected === 'connecting' || (selected === 'live' && !measurement.playing && !measurement.unavailable)}>
  <WidgetHeader title="U1 Camera" wrapAside>
    {#snippet icon()}<Icon name="camera" />{/snippet}
    {#snippet meta()}<Caption>Lab fixture</Caption>{/snippet}
    {#snippet aside()}<CameraStatus scenario={selected} {measurement} />{/snippet}
  </WidgetHeader>
  <WidgetBody><CameraMedia scenario={selected} capabilityPolicy={policy} {onscenario} onmeasurement={receive} onfeedback={receiveFeedback} /></WidgetBody>
  <StateAnnouncement text={feedback || (selected === 'loading' ? 'Loading synthetic camera' : selected === 'live' ? 'Synthetic camera live preview selected' : `Synthetic camera ${selected}`)} />
</WidgetShell>
