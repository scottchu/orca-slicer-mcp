<script lang="ts">
  import Inline from '../ui/Inline.svelte';
  import ReadingList from '../ui/ReadingList.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
</script>

<ReadingList label="Temperature readings">
  {#each [1, 2, 3, 4, 5, 6] as row (row)}
    <ReadingRow>
      {#snippet leading()}<Inline><Skeleton shape="icon" /><Skeleton shape="text" /></Inline>{/snippet}
      {#snippet trailing()}<Skeleton shape="value" />{/snippet}
    </ReadingRow>
  {/each}
</ReadingList>
