<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createFansController } from './controller';
  import { titleCase } from '../observation/format';
  import FanReadings from '../observation/FanReadings.svelte';
  import FansSkeleton from '../observation/FansSkeleton.svelte';
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
  let { controller }: { controller: ReturnType<typeof createFansController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const unavailable = $derived(!!observation && (observation.state === 'unavailable' || observation.state === 'unsupported'));
  const placeholder = $derived(!observation || unavailable || !!current.failure);
  const notice = $derived(current.feedback || (unavailable ? 'Fans & Air ' + (observation?.state === 'unsupported' ? 'endpoint unsupported' : 'unavailable') : ''));
  const announcement = $derived(current.phase === 'loading' ? 'Loading Fans & Air' : current.refreshing ? 'Refreshing Fans & Air' : notice || 'Fans & Air loaded');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; });
    controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<StateAnnouncement text={announcement} />
<WidgetStateSurface phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase}>
<WidgetShell label="Fans & Air" busy={current.phase === 'loading' || current.refreshing}>
  <WidgetHeader title="Fans & Air">
    {#snippet icon()}<Icon name="fan" />{/snippet}
    {#snippet meta()}<Caption><ObservedMeta observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} loading={placeholder} />{#if !placeholder && observation && observation.state !== 'known' && observation.state !== 'stale'} · {titleCase(observation.state)}{/if}</Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>
    {#if observation && !placeholder}
      <Stack>
        <InfoPair reserve="label">
          {#snippet label()}<Label text="Purifier" tone="muted" />{/snippet}
          {#snippet value()}<Label text={observation.purifier.mode === null ? 'N/A' : titleCase(observation.purifier.mode)} />{/snippet}
        </InfoPair>
        <InfoPair reserve="label">
          {#snippet label()}<Label text="Power" tone="muted" />{/snippet}
          {#snippet value()}<Label text={observation.purifier.powerDetected === null ? 'N/A' : observation.purifier.powerDetected ? 'Detected' : 'Not detected'} />{/snippet}
        </InfoPair>
        <FanReadings items={observation.items} />
      </Stack>
    {:else}<FansSkeleton includePower />{/if}
  </WidgetBody>
  <WidgetFooter message={current.failure || unavailable ? notice : ''}>
    {#snippet actions()}{#if current.phase === 'loading'}<Skeleton shape="action" />{:else}<IconButton label="Refresh Fans & Air" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={current.failure || unavailable ? '' : notice} announce={false} />
</WidgetShell>
</WidgetStateSurface>
