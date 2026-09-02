<script lang="ts">
  import { formatQuantity, type QuantityUnit } from './quantity';
  import TextSkeleton from './TextSkeleton.svelte';
  type Props = { unit: QuantityUnit } & ({ value: number | null; loading?: false; shape?: never } | { loading: true; value?: never; shape?: string });
  let { value, unit, loading = false, shape }: Props = $props();
  const formatted = $derived.by(() => {
    if (loading && value !== undefined) throw new Error('Loading quantities cannot carry telemetry');
    if (!loading && shape !== undefined) throw new Error('Ready quantities cannot carry loading structure');
    return loading ? null : formatQuantity(value ?? null, unit);
  });
</script>

<span class="quantity" role={loading ? undefined : 'img'} aria-label={formatted?.label} data-quantity>
  {#if loading}<TextSkeleton shape={shape ?? '0,000.00'} />{:else}{formatted?.text}{/if}
</span>

<style>
  .quantity { min-width: 0; max-width: 100%; font-size: var(--u1-type-label); line-height: var(--u1-line-copy); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; text-align: end; }
</style>
