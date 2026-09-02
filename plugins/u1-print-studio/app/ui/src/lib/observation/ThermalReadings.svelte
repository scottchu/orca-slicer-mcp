<script lang="ts">
  import type { ThermalValue } from '../live/presentation';
  import ReadingList from '../common/ReadingList.svelte';
  import ThermalReading from './ThermalReading.svelte';
  let { readings }: { readings: ThermalValue[] } = $props();
</script>
<ReadingList label="Temperature readings">
  {#each readings as reading (reading.id)}<ThermalReading {reading} />{/each}
</ReadingList>
