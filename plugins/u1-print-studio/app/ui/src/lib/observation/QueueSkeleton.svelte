<script lang="ts">
  import OrderedRecords from '../ui/OrderedRecords.svelte';
  import QueueRow from './QueueRow.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import Caption from '../ui/Caption.svelte';
  import { structureCount } from './loading';
  let { rows = 3, shapes, compact = false }: { rows?: number; shapes?: readonly { name: string; date: string }[]; compact?: boolean } = $props();
  const count = $derived(structureCount(rows, 100));
  const structure = $derived.by(() => {
    if (shapes !== undefined && shapes.length !== count) throw new Error('Invalid queue structure');
    return shapes;
  });
</script>
{#if count}<OrderedRecords label="Loading print queue">
  {#each Array.from({ length: count }) as _, index}<QueueRow loading {compact} positionCharacters={String(index + 1).length} nameShape={compact ? '0' : structure?.[index].name} dateShape={compact ? '0' : structure?.[index].date} />{/each}
</OrderedRecords>{:else}<Caption><LoadingValue loading size="long" /></Caption>{/if}
