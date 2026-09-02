<script lang="ts">
  import TextSkeleton from './TextSkeleton.svelte';
  type State = { text: string; loading?: false; characters?: never; numeric?: boolean } | { loading: true; text?: never; characters?: number; numeric?: boolean };
  let { text, loading = false, characters = 1, numeric = false }: State = $props();
  const template = $derived.by(() => {
    if (!Number.isInteger(characters) || characters < 1 || characters > 8) throw new Error('Invalid label structure');
    return '0'.repeat(characters);
  });
</script>

<span class="box-label" class:numeric aria-hidden={loading || undefined}>{#if loading}<TextSkeleton shape={template} />{:else}{text}{/if}</span>

<style>
  .box-label { display: inline-flex; align-items: center; padding: var(--u1-space-1) var(--u1-space-2); border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); font-size: var(--u1-type-label); background: var(--u1-soft); }
  .numeric { font-variant-numeric: tabular-nums; }
</style>
