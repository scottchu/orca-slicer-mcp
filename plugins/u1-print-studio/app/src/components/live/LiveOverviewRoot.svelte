<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { createOverviewController } from '../../lib/client/live/focused-controllers';
  import OverviewWidget from '../observation/OverviewPanel.svelte';

  let { controller }: { controller: ReturnType<typeof createOverviewController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const observation = $derived(current.observation);
  const failure = $derived(current.failure === 'error' ? 'error' : current.failure ? 'unavailable' : undefined);
  const refresh = () => { void controller.refresh(); };
  onMount(() => {
    const unsubscribe = controller.subscribe(state => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>

{#if observation}
  <OverviewWidget live={observation} lab={false} {failure} failureMessage={current.feedback} refreshing={current.refreshing} onretry={refresh} />
{:else}
  <OverviewWidget loading lab={false} {failure} failureMessage={current.feedback} onretry={refresh} />
{/if}

