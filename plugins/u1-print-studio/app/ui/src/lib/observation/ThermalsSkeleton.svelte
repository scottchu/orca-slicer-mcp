<script lang="ts">
  import ReadingList from '../ui/ReadingList.svelte';
  import ThermalReading from './ThermalReading.svelte';
</script>

<ReadingList label="Temperature readings">
  {#each ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'bed', 'cavity'] as id (id)}
    <ThermalReading loading id={id as 'tool-1' | 'tool-2' | 'tool-3' | 'tool-4' | 'bed' | 'cavity'} />
  {/each}
</ReadingList>
