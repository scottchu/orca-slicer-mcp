<script lang="ts">
  import type { Snippet } from 'svelte';
  // undefined preserves the default; an empty message reserves public status
  // geometry without hiding an observation or a private error as a template.
  let { leading, actions, message, visibleMessage = 'Could not load' }: { leading?: Snippet; actions: Snippet; message?: string; visibleMessage?: string } = $props();
</script>

<footer class="widget-footer" data-widget-footer>
  <div class="leading">{#if leading}{@render leading()}{/if}</div>
  <div class="actions">
    {#if message !== undefined}<span class="status" data-footer-status aria-label={message || undefined} title={message || undefined} aria-hidden={!message} class:quiet={!message}>{visibleMessage}</span>{/if}
    {@render actions()}
  </div>
</footer>

<style>
  .widget-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 var(--u1-card-x); padding: 12px 0 18px; border-top: 1px solid var(--u1-line); }
  .leading { min-width: 0; }
  .actions { display: flex; align-items: center; gap: 8px; margin-left: auto; min-width: 0; max-width: 100%; }
  .status { flex: 0 1 auto; width: max-content; min-width: 0; min-height: 2.4em; display: grid; align-content: center; color: var(--u1-muted); font-size: 12px; line-height: 1.2; text-align: right; }
  .quiet { visibility: hidden; }
</style>
