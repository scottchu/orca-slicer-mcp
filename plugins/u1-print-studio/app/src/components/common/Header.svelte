<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, icon, meta, aside, wrapAside = false, compact = false }: { title: string; icon: Snippet; meta?: Snippet; aside?: Snippet; wrapAside?: boolean; compact?: boolean } = $props();
</script>

<header class="widget-header" class:wrap-aside={wrapAside} class:compact data-widget-header>
  <div class="icon-tile" aria-hidden="true">{@render icon()}</div>
  <div class="header-copy">
    <h1>{title}</h1>
    {#if meta}<div class="meta">{@render meta()}</div>{/if}
  </div>
  {#if aside}<div class="aside">{@render aside()}</div>{/if}
</header>

<style>
  .widget-header { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 24px var(--u1-card-x) 18px; }
  .icon-tile { display: grid; place-items: center; width: 52px; height: 52px; border: 1px solid var(--u1-line); border-radius: 14px; background: var(--u1-canvas); }
  .icon-tile :global(svg) { width: 22px; height: 22px; stroke-width: 1.8; }
  .header-copy { min-width: 0; }
  h1 { margin: 0; font-size: var(--u1-type-heading); font-weight: 640; line-height: 1.2; letter-spacing: -0.035em; }
  .meta { margin-top: 5px; color: var(--u1-muted); font-size: var(--u1-type-label); line-height: 1.4; font-variant-numeric: tabular-nums; }
  .aside { min-width: 0; text-align: right; }
  .wrap-aside { display: flex; flex-wrap: wrap; }
  .wrap-aside .icon-tile { flex: 0 0 auto; }
  .wrap-aside .header-copy { flex: 1 1 0; min-width: min-content; }
  .wrap-aside .aside { margin-left: auto; }
  @media (max-width: 420px) {
    .widget-header { grid-template-columns: 44px minmax(0, 1fr) auto; gap: 11px; padding-top: 18px; padding-bottom: 14px; }
    .icon-tile { width: 44px; height: 44px; border-radius: 12px; }
    h1 { font-size: var(--u1-type-heading-mobile); }
  }
  .compact { grid-template-columns: 28px minmax(0, 1fr) auto; gap: 8px; padding: 10px 14px; }
  .compact .icon-tile { width: 28px; height: 28px; border: 0; border-radius: 0; background: transparent; }
  .compact h1 { font-size: var(--u1-type-heading-compact); }
</style>
