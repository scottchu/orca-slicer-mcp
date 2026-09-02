<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateQueue, type QueueObservation } from './types';
  import { loadingObservation, type FailureProps } from './loading';
  import Stack from '../common/Stack.svelte';
  import Caption from '../common/Caption.svelte';
  import QueueSummary from './QueueSummary.svelte';
  import QueueRows from './QueueRows.svelte';
  import QueueSkeleton from './QueueSkeleton.svelte';
  import { queueLoadingShapes } from '../lab/queue-shapes';
  type Props = FailureProps & ({ observation: QueueObservation; loading?: false; refreshing?: boolean; rows?: never } | { loading: true; observation?: never; refreshing?: never; rows?: number });
  let { observation, loading: pending = false, refreshing = false, rows = 3, failure, onretry }: Props = $props();
  const loading = $derived(pending || !!failure);
  const accepted = $derived(loadingObservation(pending, observation, validateQueue));
  const queue = $derived(failure ? null : accepted);
  const structuralRows = $derived(accepted?.items.length ?? rows);
  // Explicit lab-only mapping. No fabricated names or counts enter live data.
  const items = $derived(queue?.items.map((item) => ({ position: item.position, filename: `Queued item ${item.position}`, timeAdded: item.addedAt, timeInQueueSeconds: item.waitingSeconds })) ?? []);
</script>
<ObservationFrame title="Print Queue" iconName="queue" observedAt={queue?.sourceObservedAt ?? null} freshness={queue?.freshness ?? 'unknown'} stateKind={failure ?? (pending ? 'loading' : 'ready')} placeholder={loading} {onretry} {refreshing}>
  <Stack>
    {#if loading}<QueueSummary loading /><QueueSkeleton rows={structuralRows} shapes={queueLoadingShapes(structuralRows)} />
    {:else}<QueueSummary state={queue!.queueState} count={items.length} />
      {#if items.length}<QueueRows {items} />{:else}<Caption>Queue empty</Caption>{/if}
    {/if}
  </Stack>
</ObservationFrame>
