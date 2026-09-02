<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createThermalsController } from './thermals-controller';
  import { titleCase } from '../observation/format';
  import ThermalReadings from '../observation/ThermalReadings.svelte';
  import ThermalsSkeleton from '../observation/ThermalsSkeleton.svelte';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import ObservedMeta from '../ui/ObservedMeta.svelte';
  import Caption from '../ui/Caption.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import FeedbackOverlay from '../ui/FeedbackOverlay.svelte';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  let { controller }: { controller: ReturnType<typeof createThermalsController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const unavailable = $derived(!!observation && (observation.state === 'unavailable' || observation.state === 'unsupported'));
  const placeholder = $derived(!observation || unavailable);
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
<WidgetStateSurface phase={unavailable ? 'unavailable' : current.phase}>
<WidgetShell label="Thermals" busy={loading || current.refreshing}>
  <WidgetHeader title="Thermals">
    {#snippet icon()}<Icon name="thermals" />{/snippet}
    {#snippet meta()}<Caption>Tools & bed · <ObservedMeta observedAt={observation?.sourceObservedAt ?? null} freshness={observation?.freshness ?? 'unknown'} loading={placeholder} groupedTime /></Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>
      <Stack>
        <InfoPair>
          {#snippet label()}<Label text="Cavity" tone="muted" />{/snippet}
          {#snippet value()}<Caption><ObservedMeta observedAt={environment?.sourceObservedAt ?? null} freshness={environment?.freshness ?? 'unknown'} loading={placeholder} groupedTime />{#if !placeholder}{#if environment && environment.state !== 'known' && environment.state !== 'stale'} · {titleCase(environment.state)}{:else if observation?.readings[5].reportedState === 'not_reported'} · Not reported{/if}{#if environment?.reason} · {titleCase(environment.reason)}{/if}{/if}</Caption>{/snippet}
        </InfoPair>
        {#if observation && !placeholder}<ThermalReadings readings={observation.readings} />{:else}<ThermalsSkeleton />{/if}
      </Stack>
  </WidgetBody>
  <WidgetFooter>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<IconButton label="Refresh Thermals" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={notice} announce={false} />
</WidgetShell>
</WidgetStateSurface>
