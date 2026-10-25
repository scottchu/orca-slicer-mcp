<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createThermalsController } from '../../lib/client/live/thermals-controller';
  import ThermalReadings from '../observation/ThermalReadings.svelte';
  import ThermalsSkeleton from '../observation/ThermalsSkeleton.svelte';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import ObservedMeta from '../observation/ObservedMeta.svelte';
  import DomainReceipt from '../observation/DomainReceipt.svelte';
  import Caption from '../common/Caption.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from '../../lib/client/observation/icons';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import FeedbackOverlay from '../common/FeedbackOverlay.svelte';
  import Stack from '../common/Stack.svelte';
  import InfoPair from '../common/InfoPair.svelte';
  import Label from '../common/Label.svelte';
  let { controller }: { controller: ReturnType<typeof createThermalsController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const unavailable = $derived(!!observation && (observation.state === 'unavailable' || observation.state === 'unsupported'));
  const placeholder = $derived(!observation || unavailable || !!current.failure);
  const notice = $derived(current.feedback || (unavailable ? 'Thermals ' + (observation?.state === 'unsupported' ? 'endpoint unsupported' : 'unavailable') : ''));
  const loading = $derived(current.phase === 'loading');
  const environment = $derived(observation?.environment);
  const announcement = $derived(loading ? 'Loading Thermals' : current.refreshing ? 'Refreshing Thermals' : notice || 'Thermals loaded');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; });
    controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<StateAnnouncement text={announcement} />
<StateSurface phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase}>
<Shell label="Thermals" busy={loading || current.refreshing}>
  <Header title="Thermals">
    {#snippet icon()}<Icon icon={observationIcons.thermals} />{/snippet}
    {#snippet meta()}<Caption>Tools & bed · <ObservedMeta observedAt={observation?.sourceObservedAt ?? null} freshness={observation?.freshness ?? 'unknown'} loading={placeholder} groupedTime /></Caption>{/snippet}
  </Header>
  <Body>
      <Stack>
        <InfoPair>
          {#snippet label()}<Label text="Cavity" tone="muted" />{/snippet}
          {#snippet value()}<DomainReceipt observedAt={environment?.sourceObservedAt ?? null} freshness={environment?.freshness ?? 'unknown'} state={environment?.state} reason={environment?.reason} loading={placeholder} includeNotRequestedReason fallbackState={observation?.readings[5].reportedState === 'not_reported' ? 'not_reported' : undefined} />{/snippet}
        </InfoPair>
        {#if observation && !placeholder}<ThermalReadings readings={observation.readings} />{:else}<ThermalsSkeleton />{/if}
      </Stack>
  </Body>
  <Footer message={current.failure || unavailable ? notice : ''}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<Button label="Refresh Thermals" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </Footer>
  <FeedbackOverlay message={current.failure || unavailable ? '' : notice} announce={false} />
</Shell>
</StateSurface>
