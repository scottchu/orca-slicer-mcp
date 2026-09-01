<script lang="ts">
  let { loading = false, text, size = 'medium', words }: { loading?: boolean; text?: string | number; size?: 'short' | 'medium' | 'long'; words?: readonly number[] } = $props();
  const content = $derived.by(() => {
    if (loading && text !== undefined) throw new Error('Loading values cannot carry telemetry');
    if (!loading && text === undefined) throw new Error('Ready value requires text');
    if (words && (!words.length || words.length > 8 || words.some((width) => !Number.isFinite(width) || width < 1 || width > 32))) throw new Error('Invalid value structure');
    return text;
  });
  const parts = $derived(content === undefined ? [] : String(content).split(' '));
</script>

<span class="value-slot" class:loading class:words={!!words} data-loading-value={loading ? '' : undefined} data-size={size} aria-hidden={loading ? true : undefined}>{#if words}{#each words as width, index}<span style:width={`${width}ch`}>{loading ? '\u00a0' : index === words.length - 1 ? parts.slice(index).join(' ') || '\u00a0' : parts[index] || '\u00a0'}</span>{' '}{/each}{:else}{content ?? '\u00a0'}{/if}</span>

<style>
  .value-slot { display: inline-block; min-width: min(3ch, 100%); max-width: 100%; min-height: 1lh; vertical-align: bottom; font: inherit; line-height: inherit; }
  [data-size='medium'] { min-width: min(6ch, 100%); }
  [data-size='long'] { min-width: min(10ch, 100%); }
  .loading { background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); animation: skeleton-pulse var(--u1-skeleton-duration) ease-in-out infinite alternate; }
  .value-slot.words { display: inline; min-width: 0; }
  .words > span { display: inline-block; max-width: 100%; min-height: 1lh; vertical-align: bottom; }
  .loading.words { background: none; }
  .loading.words > span { background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); }
  @keyframes skeleton-pulse { to { opacity: .5; } }
  @media (prefers-reduced-motion: reduce) { .loading { animation: none; } }
  @media (forced-colors: active) { .loading { outline: 1px solid CanvasText; } }
</style>
