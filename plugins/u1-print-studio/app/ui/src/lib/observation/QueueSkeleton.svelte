<script lang="ts">
  import OrderedRecords from '../ui/OrderedRecords.svelte';
  import QueueRow from './QueueRow.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import Caption from '../ui/Caption.svelte';
  import { structureCount } from './loading';
  let { rows = 3 }: { rows?: number } = $props();
  const count = $derived(structureCount(rows, 100));
</script>
{#if count}<OrderedRecords label="Loading print queue">
  {#each Array.from({ length: count }) as _}<QueueRow loading />{/each}
</OrderedRecords>{:else}<Caption><LoadingValue loading size="long" /></Caption>{/if}
