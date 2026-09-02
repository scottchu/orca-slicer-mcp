<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, children }: { label: string; children: Snippet } = $props();
</script>
<ol aria-label={label} class="records">{@render children()}</ol>
<style>
  .records { display: grid; list-style: none; margin: 0; padding: 0; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); min-width: 0; }
</style>
