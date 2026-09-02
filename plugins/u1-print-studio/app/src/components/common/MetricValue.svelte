<script lang="ts">
  import { formatMetric } from '../../lib/client/common/metric';
  import Skeleton from './Skeleton.svelte';
  type ValueState = { value: number | null; loading?: false } | { loading: true; value?: never };
  let { value, loading = false, unit, tone = 'default' }: ValueState & {
    unit: '%' | 'RPM'; tone?: 'default' | 'muted';
  } = $props();
  const formatted = $derived(loading ? null : formatMetric(value ?? null, unit));
</script>
<span class="metric-value" class:muted={tone === 'muted'} role={loading ? undefined : 'img'} aria-hidden={loading ? true : undefined} aria-label={formatted?.accessible} data-metric-unit={unit} data-required-text={!loading || undefined}>{#if loading}<Skeleton shape="fill" />{:else}{formatted?.visible}{/if}</span>
<style>
  .metric-value { display: inline-flex; align-items: center; justify-content: flex-end; flex: none; color: var(--u1-ink); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); height: 1lh; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
  [data-metric-unit='%'] { min-width: 5ch; }
  [data-metric-unit='RPM'] { min-width: 11ch; }
  .muted { color: var(--u1-muted); }
</style>
