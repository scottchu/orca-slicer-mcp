<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { colorWash } from '../../lib/client/common/color';
  let { label, header, children, footer, actions, color = null, neutral = false, active = false, actionAvailable = false, headerLines = 1, footerLayout = 'wrap' }: { label: string; header: Snippet; children: Snippet; footer: Snippet; actions?: Snippet; color?: string | null; neutral?: boolean; active?: boolean; actionAvailable?: boolean; headerLines?: 1 | 2; footerLayout?: 'wrap' | 'action-column' | 'content' } = $props();
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
  <div class="header" class:two-lines={headerLines === 2}>{@render header()}</div>
  <div class="body">{@render children()}</div>
  <div class="footer" class:action-column={footerLayout === 'action-column'} class:content={footerLayout === 'content'}>{@render footer()}{#if actions}<div class="actions">{@render actions()}</div>{/if}</div>
</section>
<style>
  .inset-card { min-width: 0; display: flex; flex-direction: column; gap: var(--u1-space-3); padding: var(--u1-space-3); border: 1px solid var(--u1-line); border-bottom-width: 3px; border-radius: var(--u1-radius-inner); background: var(--u1-surface); overflow-wrap: anywhere; }
  .neutral { background: var(--u1-soft); }
  .active { border-bottom-color: var(--u1-accent); }
  .header { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: var(--u1-space-2); min-width: 0; }
  .header :global(> :last-child) { text-align: right; }
  .two-lines { min-height: calc(var(--u1-type-label) * var(--u1-line-copy) * 2); }
  .body { min-width: 0; flex: 1; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--u1-space-1); min-width: 0; min-height: calc(var(--u1-action-size) + var(--u1-space-2) + 1px); border-top: 1px solid var(--u1-line); padding-top: var(--u1-space-2); }
  .actions { flex: 0 0 var(--u1-action-size); width: var(--u1-action-size); height: var(--u1-action-size); }
  .action-column { display: grid; grid-template-columns: minmax(0, 1fr) var(--u1-action-size); }
  .content { display: grid; grid-template-columns: minmax(0, 1fr); }
  .inset-card:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
</style>
