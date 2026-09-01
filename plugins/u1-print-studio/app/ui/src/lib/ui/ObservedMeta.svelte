<script lang="ts">
  let { observedAt, freshness = 'fresh' }: { observedAt: string | null; freshness?: 'fresh' | 'stale' | 'offline' | 'unknown' } = $props();
  const time = $derived(observedAt ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(observedAt)) : null);
  const suffix = $derived(freshness === 'fresh' ? '' : freshness === 'unknown' ? ' · Freshness unknown' : ` · ${freshness[0].toUpperCase()}${freshness.slice(1)}`);
</script>

<span data-observed-meta>{time ? `Observed ${time}${suffix}` : `Observation time unavailable${suffix}`}</span>
