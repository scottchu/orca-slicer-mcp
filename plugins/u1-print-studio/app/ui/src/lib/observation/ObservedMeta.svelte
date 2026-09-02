<script lang="ts">
  import LoadingValue from '../common/LoadingValue.svelte';
  let { observedAt, freshness = 'fresh', loading = false, groupedTime = false }: { observedAt: string | null; freshness?: 'fresh' | 'stale' | 'offline' | 'unknown'; loading?: boolean; groupedTime?: boolean } = $props();
  const time = $derived(!loading && observedAt ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(observedAt)) : null);
  const suffix = $derived(freshness === 'fresh' ? '' : freshness === 'unknown' ? ' · Freshness unknown' : ` · ${freshness[0].toUpperCase()}${freshness.slice(1)}`);
</script>

<span data-observed-meta><LoadingValue {loading} text={loading ? undefined : time ? `Observed ${time}${suffix}` : `Observation time unavailable${suffix}`} words={loading || (time && freshness === 'fresh') ? groupedTime ? [8, 12] : [8, 9, 3] : undefined} /></span>
