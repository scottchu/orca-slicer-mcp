<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, colSpan }: { children: Snippet; colSpan: 1 | 2 | 3 | 4 | 5 | 6 } = $props();
</script>

<div
  class="column"
  class:span-1={colSpan === 1}
  class:span-2={colSpan === 2}
  class:span-3={colSpan === 3}
  class:span-4={colSpan === 4}
  class:span-5={colSpan === 5}
  class:span-6={colSpan === 6}
  data-col-span={colSpan}
  data-node-kind="Column"
>{@render children()}</div>

<style>
  .column { min-width: 0; }
  .span-1 { grid-column: span 1; }
  .span-2 { grid-column: span 2; }
  .span-3 { grid-column: span 3; }
  .span-4 { grid-column: span 4; }
  .span-5 { grid-column: span 5; }
  .span-6 { grid-column: span 6; }
  @container (max-width: 20rem) {
    .column { grid-column: 1 / -1; }
  }
</style>
