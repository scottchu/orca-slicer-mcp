<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { colorWash } from './color';
  let { label, header, children, footer, color = null, neutral = false, active = false, actionAvailable = false }: { label: string; header: Snippet; children: Snippet; footer: Snippet; color?: string | null; neutral?: boolean; active?: boolean; actionAvailable?: boolean } = $props();
  let element: HTMLElement;
  const wash = $derived(colorWash(color));
  $effect.pre(() => {
    if (actionAvailable || !element) return;
    const focused = document.activeElement;
    if (focused && focused !== element && element.contains(focused)) void tick().then(() => {
      if (element?.isConnected && !element.contains(focused) && document.activeElement === document.body) element.focus();
    });
  });
</script>
<section bind:this={element} class="inset-card" class:neutral class:active style:background-color={neutral ? undefined : wash ?? undefined} aria-label={label} tabindex="-1" data-inset-card>
  <div class="header">{@render header()}</div>
  <div class="body">{@render children()}</div>
  <div class="footer">{@render footer()}</div>
</section>
<style>
  .inset-card { min-width: 0; display: flex; flex-direction: column; gap: var(--u1-space-3); padding: var(--u1-space-3); border: 1px solid var(--u1-line); border-bottom-width: 3px; border-radius: var(--u1-radius-inner); background: var(--u1-surface); overflow-wrap: anywhere; }
  .neutral { background: var(--u1-soft); }
  .active { border-bottom-color: var(--u1-accent); }
  .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--u1-space-2); min-width: 0; }
  .body { min-width: 0; flex: 1; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--u1-space-1); min-width: 0; min-height: var(--u1-action-size); border-top: 1px solid var(--u1-line); padding-top: var(--u1-space-2); }
  .inset-card:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
</style>
