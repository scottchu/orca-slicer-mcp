<script lang="ts">
  import LoadingValue from './LoadingValue.svelte';
  type Props = { text: string; loading?: false } | { loading: true; text?: never };
  let { text, loading = false }: Props = $props();
</script>

<span class="text-value" data-required-text><LoadingValue {loading} text={text} words={loading ? [16] : undefined} /></span>

<style>
  .text-value { min-width: 0; max-width: 100%; color: var(--u1-ink); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); overflow-wrap: anywhere; }
</style>
