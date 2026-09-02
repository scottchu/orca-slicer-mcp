<script lang="ts">
  import TextSkeleton from './TextSkeleton.svelte';
  type Props = { text: string; loading?: false; shape?: never } | { loading: true; text?: never; shape?: string };
  let { text, loading = false, shape }: Props = $props();
  const readyText = $derived.by(() => {
    if (loading && text !== undefined) throw new Error('Loading text cannot carry real values');
    if (!loading && shape !== undefined) throw new Error('Ready text cannot carry loading structure');
    return loading ? null : text;
  });
</script>

<span class="text-value" data-required-text={!loading || undefined}>{#if loading && readyText === null}<TextSkeleton shape={shape ?? 'Reported value'} />{:else}{readyText}{/if}</span>

<style>
  .text-value { min-width: 0; max-width: 100%; color: var(--u1-ink); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
