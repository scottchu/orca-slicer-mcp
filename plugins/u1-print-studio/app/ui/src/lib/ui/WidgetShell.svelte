<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label }: { children: Snippet; label: string } = $props();
</script>

<article class="widget-shell" aria-label={label} data-widget-shell>
  {@render children()}
</article>

<style>
  .widget-shell { position: relative; min-width: 0; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-card); color: var(--u1-ink); background: var(--u1-surface); box-shadow: var(--u1-shadow); }
</style>
