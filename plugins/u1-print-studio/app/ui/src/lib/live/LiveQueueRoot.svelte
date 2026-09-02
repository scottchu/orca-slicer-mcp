<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createQueueController } from './queue-controller';
  import WidgetShell from '../ui/WidgetShell.svelte';
  import WidgetHeader from '../ui/WidgetHeader.svelte';
  import WidgetBody from '../ui/WidgetBody.svelte';
  import WidgetFooter from '../ui/WidgetFooter.svelte';
  import StateAnnouncement from '../ui/StateAnnouncement.svelte';
  import WidgetStateSurface from '../ui/WidgetStateSurface/WidgetStateSurface.svelte';
  import Caption from '../ui/Caption.svelte';
  import Icon from '../ui/Icon.svelte';
  import IconButton from '../ui/IconButton.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import FeedbackOverlay from '../ui/FeedbackOverlay.svelte';
  import Stack from '../ui/Stack.svelte';
  import DomainReceipt from '../observation/DomainReceipt.svelte';
  import QueueSummary from '../observation/QueueSummary.svelte';
  import QueueRows from '../observation/QueueRows.svelte';
  import QueueSkeleton from '../observation/QueueSkeleton.svelte';
  let { controller }: { controller: ReturnType<typeof createQueueController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const unavailable = $derived(!!observation && (observation.state === 'unavailable' || observation.state === 'unsupported'));
  const placeholder = $derived(!observation || unavailable || !!current.failure);
  const notice = $derived(current.feedback || (unavailable ? 'Print Queue ' + (observation?.state === 'unsupported' ? 'endpoint unsupported' : 'unavailable') : ''));
  const loading = $derived(current.phase === 'loading');
  const observed = $derived(observation?.state === 'known' || observation?.state === 'stale');
  const announcement = $derived(loading ? 'Loading Print Queue' : current.refreshing ? 'Refreshing Print Queue' : notice || 'Print Queue loaded');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<StateAnnouncement text={announcement} />
<WidgetStateSurface phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase}>
<WidgetShell label="Print Queue" busy={loading || current.refreshing}>
  <WidgetHeader title="Print Queue">
    {#snippet icon()}<Icon name="queue" />{/snippet}
    {#snippet meta()}<DomainReceipt observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} state={observation?.state ?? 'unknown'} reason={observation?.receipt.reason ?? null} loading={placeholder} />{/snippet}
  </WidgetHeader>
  <WidgetBody>
    <Stack>
      {#if placeholder}<QueueSummary loading /><QueueSkeleton rows={observed ? observation!.items.length : 3} />
      {:else if observed && observation}
        <QueueSummary state={observation.queueState} count={observation.totalCount} />
        {#if observation.items.length}<QueueRows items={observation.items} />
        {:else}<Caption>{observation.state === 'stale' ? 'Last observed queue was empty' : 'Queue empty'}</Caption>{/if}
        {#if observation.truncated}<Caption>Showing {observation.items.length} of {observation.totalCount} jobs · {observation.totalCount! - observation.items.length} not shown</Caption>{/if}
      {:else if observation}<Caption>{observation.state === 'unsupported' ? 'Print Queue endpoint unsupported' : observation.state === 'unknown' ? 'Print Queue not observed' : 'Print Queue unavailable'}</Caption>
      {/if}
    </Stack>
  </WidgetBody>
  <WidgetFooter message={current.failure || unavailable ? notice : ''}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<IconButton label="Refresh Print Queue" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </WidgetFooter>
  <FeedbackOverlay message={current.failure || unavailable ? '' : notice} announce={false} />
</WidgetShell>
</WidgetStateSurface>
