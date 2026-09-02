<script lang="ts">
  import type { Snippet } from 'svelte';
  let { leading, children }: { leading: Snippet; children: Snippet } = $props();
</script>
<li class="record" data-record><span class="leading">{@render leading()}</span><div class="content">{@render children()}</div></li>
<style>
  .record { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: var(--u1-space-3); min-width: 0; padding: var(--u1-space-3); border-bottom: 1px solid var(--u1-line); }
  .record:last-child { border-bottom: 0; }
  .leading { display: inline-flex; align-items: center; min-height: calc(var(--u1-type-name) * var(--u1-line-copy)); }
  .content { display: flex; flex-direction: column; gap: var(--u1-space-1); min-width: 0; overflow-wrap: anywhere; }
</style>
