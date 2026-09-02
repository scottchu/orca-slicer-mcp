<script lang="ts">
  import LoadingValue from './LoadingValue.svelte';
  import { formatDurationValue } from '../../lib/client/common/duration';
  type State = { seconds: number | null; loading?: false } | { loading: true; seconds?: never };
  let { seconds, loading = false }: State = $props();
  const value = $derived(loading ? null : formatDurationValue(seconds ?? null));
</script>
<span class="duration" role={loading ? undefined : 'img'} aria-label={value?.accessible} aria-hidden={loading || undefined} data-required-text={!loading || undefined}>{#if loading}<LoadingValue loading size="medium" />{:else}{value?.visible}{/if}</span>
<style>
  .duration { font-variant-numeric: tabular-nums; font-size: var(--u1-type-label); color: var(--u1-muted); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
