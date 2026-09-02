<script lang="ts">
  import { formatDegree } from './format';
  let { value, loading = false, precision = 0, emphasis = 'primary', context }: { value?: number | null; loading?: boolean; precision?: 0 | 1; emphasis?: 'primary' | 'secondary'; context?: 'Actual' | 'Target' } = $props();
  const degree = $derived.by(() => {
    if (loading && value !== undefined) throw new Error('Loading degree cannot carry a value');
    if (!loading && value === undefined) throw new Error('Ready degree requires a value');
    return loading ? null : formatDegree(value!, precision);
  });
</script>

<span class="degree" class:secondary={emphasis === 'secondary'} class:loading role={loading ? undefined : 'img'} aria-hidden={loading ? true : undefined} aria-label={degree ? context ? `${context}: ${degree.accessible}` : degree.accessible : undefined} data-required-text={loading ? undefined : ''} data-skeleton={loading ? 'degree' : undefined}>{degree?.visible ?? '\u00a0'}</span>

<style>
  .degree { display: inline-block; min-width: 4ch; min-height: 1lh; text-align: right; color: var(--u1-ink); font-size: var(--u1-type-value); font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); white-space: nowrap; }
  .secondary { color: var(--u1-muted); font-size: var(--u1-type-label); font-weight: normal; }
  .loading { background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); }
  @media (forced-colors: active) { .loading { outline: 1px solid CanvasText; } }
</style>
