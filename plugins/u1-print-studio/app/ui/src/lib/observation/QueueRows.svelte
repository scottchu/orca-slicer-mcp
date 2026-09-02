<script lang="ts">
  import type { QueueRecord } from '../live/queue-presentation';
  import OrderedRecords from '../ui/OrderedRecords.svelte';
  import QueueRow from './QueueRow.svelte';
  let { items }: { items: QueueRecord[] } = $props();
</script>
<OrderedRecords label="Reported print queue order">
  {#each items as item (item.position)}<QueueRow {item} />{/each}
</OrderedRecords>
