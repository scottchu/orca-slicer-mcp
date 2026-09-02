<script lang="ts">
  import TextSkeleton from './TextSkeleton.svelte';
  type State = { text: string; loading?: false; shape?: never; numeric?: boolean } | { loading: true; text?: never; shape?: string; numeric?: boolean };
  let { text, loading = false, shape, numeric = false }: State = $props();
  const state = $derived.by(() => {
    if (loading && text !== undefined || !loading && shape !== undefined) throw new Error('Invalid name state');
    return { text, template: shape ?? 'Model filename.gcode' };
  });
</script>

<span class="name" class:numeric data-required-text={loading ? undefined : ''}>{#if loading}<TextSkeleton shape={state.template} />{:else}{state.text}{/if}</span>

<style>
  .name { min-width: 0; color: var(--u1-ink); font-size: var(--u1-type-name); font-weight: var(--u1-weight-name); line-height: var(--u1-line-copy); }
  .numeric { font-variant-numeric: tabular-nums; }
</style>
