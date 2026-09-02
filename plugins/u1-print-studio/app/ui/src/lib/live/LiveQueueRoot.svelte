<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';
  import type { createQueueController } from './queue-controller';
  import Shell from '../common/Shell.svelte';
  import Header from '../common/Header.svelte';
  import Body from '../common/Body.svelte';
  import Footer from '../common/Footer.svelte';
  import StateAnnouncement from '../common/StateAnnouncement.svelte';
  import StateSurface from '../common/StateSurface/StateSurface.svelte';
  import Caption from '../common/Caption.svelte';
  import LoadingValue from '../common/LoadingValue.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from '../observation/icons';
  import Button from '../common/Button.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import FeedbackOverlay from '../common/FeedbackOverlay.svelte';
  import Stack from '../common/Stack.svelte';
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
<StateSurface phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase}>
<Shell label="Print Queue" busy={loading || current.refreshing}>
  <Header title="Print Queue">
    {#snippet icon()}<Icon icon={observationIcons.queue} />{/snippet}
    {#snippet meta()}<DomainReceipt observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} state={observation?.state ?? 'unknown'} reason={observation?.receipt.reason ?? null} loading={placeholder} />{/snippet}
  </Header>
  <Body>
    <Stack>
      {#if placeholder}{#if observation?.state === 'unknown'}<Caption><LoadingValue loading /></Caption>{:else}<QueueSummary loading /><QueueSkeleton rows={observed ? observation!.items.length : 3} compact={observed && !!current.failure} />{/if}
      {:else if observed && observation}
        <QueueSummary state={observation.queueState} count={observation.totalCount} />
        {#if observation.items.length}<QueueRows items={observation.items} />
        {:else}<Caption>{observation.state === 'stale' ? 'Last observed queue was empty' : 'Queue empty'}</Caption>{/if}
        {#if observation.truncated}<Caption>Showing {observation.items.length} of {observation.totalCount} jobs · {observation.totalCount! - observation.items.length} not shown</Caption>{/if}
      {:else if observation}<Caption>{observation.state === 'unsupported' ? 'Print Queue endpoint unsupported' : observation.state === 'unknown' ? 'Print Queue not observed' : 'Print Queue unavailable'}</Caption>
      {/if}
    </Stack>
  </Body>
  <Footer message={current.failure || unavailable ? notice : ''}>
    {#snippet actions()}{#if loading}<Skeleton shape="action" />{:else}<Button label="Refresh Print Queue" icon={RefreshCw} onclick={() => { void controller.refresh(); }} busy={current.refreshing} />{/if}{/snippet}
  </Footer>
  <FeedbackOverlay message={current.failure || unavailable ? '' : notice} announce={false} />
</Shell>
</StateSurface>
