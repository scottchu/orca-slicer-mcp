<script lang="ts">
  import type { Snippet } from 'svelte';
  let { leading, actions }: { leading?: Snippet; actions: Snippet } = $props();
</script>

<footer class="widget-footer" data-widget-footer>
  <div class="leading">{#if leading}{@render leading()}{/if}</div>
  <div class="actions">{@render actions()}</div>
</footer>

<style>
  .widget-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 var(--u1-card-x); padding: 12px 0 18px; border-top: 1px solid var(--u1-line); }
  .leading { min-width: 0; }
  .actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
</style>
