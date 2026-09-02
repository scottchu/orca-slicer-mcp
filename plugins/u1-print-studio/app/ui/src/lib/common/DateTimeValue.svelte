<script lang="ts">
  import TextSkeleton from './TextSkeleton.svelte';
  import { formatDateTime, neutralDateTimeShape } from './date-time';
  type State = { value: string | null; loading?: false; shape?: never } | { loading: true; value?: never; shape?: string };
  let { value, loading = false, shape }: State = $props();
  const template = $derived.by(() => {
    if (loading && value !== undefined || !loading && shape !== undefined) throw new Error('Invalid date state');
    return shape ?? neutralDateTimeShape();
  });
  const valid = $derived.by(() => {
    if (loading && value !== undefined || !loading && shape !== undefined) throw new Error('Invalid date state');
    return !loading && value !== null && value !== undefined && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
  });
  const text = $derived(valid ? formatDateTime(value!) : '—');
</script>
<span class="date-time" aria-hidden={loading || undefined} data-required-text={!loading || undefined}>{#if loading}<TextSkeleton shape={template} />{:else if valid}<time datetime={value} title={value}>{text}</time>{:else}{text}{/if}</span>
<style>
  .date-time { font-variant-numeric: tabular-nums; font-size: var(--u1-type-label); color: var(--u1-muted); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
