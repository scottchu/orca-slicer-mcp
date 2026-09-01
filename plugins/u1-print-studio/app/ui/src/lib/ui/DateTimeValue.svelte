<script lang="ts">
  import LoadingValue from './LoadingValue.svelte';
  type State = { value: string | null; loading?: false } | { loading: true; value?: never };
  let { value, loading = false }: State = $props();
  const valid = $derived(!loading && value !== null && value !== undefined && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
  const text = $derived(valid ? new Date(value!).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—');
</script>
<span class="date-time" aria-hidden={loading || undefined} data-required-text={!loading || undefined}>{#if loading}<LoadingValue loading words={[8, 5, 12]} size="long" />{:else if valid}<time datetime={value} title={value}>{text}</time>{:else}{text}{/if}</span>
<style>
  .date-time { font-variant-numeric: tabular-nums; font-size: var(--u1-type-label); color: var(--u1-muted); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
