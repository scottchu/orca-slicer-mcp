<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateQueue, type QueueObservation } from './types';
  import { loadingObservation } from './loading';
  import Stack from '../ui/Stack.svelte';
  import Caption from '../ui/Caption.svelte';
  import QueueSummary from './QueueSummary.svelte';
  import QueueRows from './QueueRows.svelte';
  import QueueSkeleton from './QueueSkeleton.svelte';
  type Props = { observation: QueueObservation; loading?: false; refreshing?: boolean; rows?: never } | { loading: true; observation?: never; refreshing?: never; rows?: number };
  let { observation, loading = false, refreshing = false, rows = 3 }: Props = $props();
  const queue = $derived(loadingObservation(loading, observation, validateQueue));
  // Explicit lab-only mapping. No fabricated names or counts enter live data.
  const items = $derived(queue?.items.map((item) => ({ position: item.position, filename: `Queued item ${item.position}`, timeAdded: item.addedAt, timeInQueueSeconds: item.waitingSeconds })) ?? []);
</script>
<ObservationFrame title="Print Queue" iconName="queue" observedAt={queue?.sourceObservedAt ?? null} freshness={queue?.freshness ?? 'unknown'} stateKind={loading ? 'loading' : 'ready'} {refreshing}>
  <Stack>
    {#if loading}<QueueSummary loading /><QueueSkeleton {rows} />
    {:else}<QueueSummary state={queue!.queueState} count={items.length} />
      {#if items.length}<QueueRows {items} />{:else}<Caption>Queue empty</Caption>{/if}
    {/if}
  </Stack>
</ObservationFrame>
