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
  import StatePanel from '../ui/StatePanel.svelte';
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
  const announcement = $derived(current.phase === 'loading' ? 'Loading Fans & Air' : current.refreshing ? 'Refreshing Fans & Air' : current.feedback || 'Fans & Air loaded');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; });
    controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<StateAnnouncement text={announcement} />
<WidgetShell label="Fans & Air" busy={current.phase === 'loading' || current.refreshing}>
  <WidgetHeader title="Fans & Air">
    {#snippet icon()}<Icon name="fan" />{/snippet}
    {#snippet meta()}<Caption><ObservedMeta observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} loading={current.phase === 'loading'} />{#if observation && observation.state !== 'known' && observation.state !== 'stale'} · {titleCase(observation.state)}{/if}</Caption>{/snippet}
  </WidgetHeader>
  <WidgetBody>
    {#if observation}
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
    {:else if current.phase === 'loading'}<FansSkeleton includePower />
    {:else}<StatePanel title="Fans & Air" reason="error" />{/if}
  </WidgetBody>
  <WidgetFooter>
    {#snippet actions()}{#if current.phase === 'loading'}<Skeleton shape="action" />{:else}<IconButton label="Refresh Fans & Air" icon={RefreshCw} onclick={() => { void controller.refresh(); }} disabled={current.refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={current.feedback} announce={false} />
</WidgetShell>
