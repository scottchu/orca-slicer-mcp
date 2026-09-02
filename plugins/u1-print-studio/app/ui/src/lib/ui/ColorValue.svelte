<script lang="ts">
  import ColorSwatch from './ColorSwatch.svelte';
  let { color, text, loading = false }: { color?: string | null; text?: string; loading?: boolean } = $props();
  const content = $derived.by(() => {
    if (loading && (text !== undefined || color !== undefined)) throw new Error('Loading color cannot carry telemetry');
    if (!loading && text === undefined) throw new Error('Ready color requires text');
    return text;
  });
</script>

<span class="color-value" data-color-value>
  <span class="group">
    <ColorSwatch color={loading ? null : color ?? null} />
    <span class="text" class:loading data-loading-value={loading ? '' : undefined} aria-hidden={loading ? true : undefined}>{content ?? '\u00a0'}</span>
  </span>
</span>

<style>
  .color-value { display: block; container-type: inline-size; min-width: 0; color: var(--u1-muted); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); }
  .group { display: flex; align-items: center; gap: var(--u1-space-1); }
  /* Use the same public maximum as CardGrid, plus the17px swatch/4px gap.
     Loading and every actual hex choose the same layout, without sizing text. */
  @container (width < calc(6.4em + 21px)) {
    .group { flex-direction: column; align-items: flex-start; }
  }
  .text { white-space: nowrap; }
  .loading { width: 9ch; height: 1lh; background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); animation: skeleton-pulse var(--u1-skeleton-duration) ease-in-out infinite alternate; }
  @keyframes skeleton-pulse { to { opacity: .5; } }
  @media (prefers-reduced-motion: reduce) { .loading { animation: none; } }
  @media (forced-colors: active) { .loading { outline: 1px solid CanvasText; } }
</style>
