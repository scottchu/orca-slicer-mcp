<script lang="ts">
  let { loading = false, text, size = 'medium' }: { loading?: boolean; text?: string | number; size?: 'short' | 'medium' | 'long' } = $props();
  const content = $derived.by(() => {
    if (loading && text !== undefined) throw new Error('Loading values cannot carry telemetry');
    if (!loading && text === undefined) throw new Error('Ready value requires text');
    return text;
  });
</script>

<span class="value-slot" class:loading data-loading-value={loading ? '' : undefined} data-size={size} aria-hidden={loading ? true : undefined}>{#if !loading}{content}{/if}</span>

<style>
  .value-slot { display: inline-block; min-width: min(3ch, 100%); max-width: 100%; min-height: 1lh; vertical-align: bottom; font: inherit; line-height: inherit; }
  [data-size='medium'] { min-width: min(6ch, 100%); }
  [data-size='long'] { min-width: min(10ch, 100%); }
  .loading { background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); animation: skeleton-pulse var(--u1-skeleton-duration) ease-in-out infinite alternate; }
  @keyframes skeleton-pulse { to { opacity: .5; } }
  @media (prefers-reduced-motion: reduce) { .loading { animation: none; } }
  @media (forced-colors: active) { .loading { outline: 1px solid CanvasText; } }
</style>
