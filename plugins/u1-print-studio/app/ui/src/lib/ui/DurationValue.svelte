<script lang="ts">
  import LoadingValue from './LoadingValue.svelte';
  import TextSkeleton from './TextSkeleton.svelte';
  import { formatDurationValue } from './duration';
  type State = { seconds: number | null; loading?: false; shape?: never } | { loading: true; seconds?: never; shape?: string };
  let { seconds, loading = false, shape }: State = $props();
  const value = $derived.by(() => {
    if (loading && seconds !== undefined) throw new Error('Loading duration cannot carry telemetry');
    if (!loading && shape !== undefined) throw new Error('Ready duration cannot carry loading structure');
    return loading ? null : formatDurationValue(seconds ?? null);
  });
</script>
<span class="duration" role={loading ? undefined : 'img'} aria-label={value?.accessible} aria-hidden={loading || undefined} data-required-text={!loading || undefined}>{#if loading}{#if shape !== undefined}<TextSkeleton {shape} />{:else}<LoadingValue loading size="medium" />{/if}{:else}{value?.visible}{/if}</span>
<style>
  .duration { font-variant-numeric: tabular-nums; font-size: var(--u1-type-label); color: var(--u1-muted); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
