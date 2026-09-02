<script lang="ts">
  import type { FanValue } from '../../lib/client/live/presentation';
  import ReadingList from '../common/ReadingList.svelte';
  import FanReading from './FanReading.svelte';
  let { items }: { items: readonly FanValue[] } = $props();
</script>
<ReadingList label="Fan readings" columns="single">
  {#each items as reading (reading.id)}<FanReading {reading} />{/each}
</ReadingList>
