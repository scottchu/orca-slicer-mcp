<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { createHeadsController } from '../../lib/client/live/heads-controller';
  import { headCardValue } from '../../lib/client/live/heads-presentation';
  import HeadsPanel from '../observation/HeadsPanel.svelte';
  let { controller }: { controller: ReturnType<typeof createHeadsController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  const unavailable = $derived(current.observation?.state === 'unavailable' || current.observation?.state === 'unsupported');
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<HeadsPanel items={unavailable ? undefined : current.observation?.items.map(headCardValue)} observedAt={current.observation?.sourceObservedAt ?? null} freshness={current.observation?.freshness ?? 'unknown'} materials={unavailable ? undefined : current.observation?.materials} phase={current.failure ? 'error' : unavailable ? 'unavailable' : current.phase} refreshing={current.refreshing} copying={current.copying} feedback={current.observation?.state === 'unsupported' ? 'Heads & Filaments endpoint unsupported' : current.feedback} onrefresh={() => { void controller.refresh(); }} oncopy={(id, color) => { void controller.copy(id, color); }} />
