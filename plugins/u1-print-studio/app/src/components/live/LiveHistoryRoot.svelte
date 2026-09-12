<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { createHistoryController } from '../../lib/client/live/focused-controllers';
  import JobHistoryWidget from '../observation/HistoryPanel.svelte';
  import DomainReceipt from '../observation/DomainReceipt.svelte';
  let { controller }: { controller: ReturnType<typeof createHistoryController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const failure = $derived(current.failure === 'error' ? 'error' : current.failure ? 'unavailable' : undefined);
  const refresh = () => { void controller.refresh(); };
  onMount(() => {
    const unsubscribe = controller.subscribe(state => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
{#snippet receiptMeta()}<DomainReceipt observedAt={observation?.receipt.sourceObservedAt ?? null} freshness={observation?.receipt.freshness ?? 'unknown'} state={observation?.state ?? 'unknown'} reason={observation?.receipt.reason ?? null} loading={!observation || !!current.failure} />{/snippet}
{#if observation}
  <JobHistoryWidget live={observation} lab={false} {failure} failureMessage={current.feedback} refreshing={current.refreshing} onretry={refresh} meta={receiptMeta} />
{:else}
  <JobHistoryWidget loading lab={false} {failure} failureMessage={current.feedback} onretry={refresh} meta={receiptMeta} />
{/if}

