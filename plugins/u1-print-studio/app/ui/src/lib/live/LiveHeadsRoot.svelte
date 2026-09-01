<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { createHeadsController } from './heads-controller';
  import { headCardValue } from './heads-presentation';
  import HeadsPanel from '../observation/HeadsPanel.svelte';
  let { controller }: { controller: ReturnType<typeof createHeadsController> } = $props();
  let current = $state(untrack(() => controller.getState()));
  onMount(() => {
    const unsubscribe = controller.subscribe((state) => { current = state; }); controller.start();
    return () => { unsubscribe(); controller.dispose(); };
  });
</script>
<HeadsPanel items={current.observation?.items.map(headCardValue)} observedAt={current.observation?.sourceObservedAt ?? null} freshness={current.observation?.freshness ?? 'unknown'} materials={current.observation?.materials} phase={current.phase} refreshing={current.refreshing} copying={current.copying} feedback={current.feedback} onrefresh={() => { void controller.refresh(); }} oncopy={(id, color) => { void controller.copy(id, color); }} />
