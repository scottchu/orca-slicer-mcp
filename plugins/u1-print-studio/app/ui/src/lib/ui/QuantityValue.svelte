<script lang="ts">
  import { formatQuantity, type QuantityUnit } from './quantity';
  import TextSkeleton from './TextSkeleton.svelte';
  type Props = { unit: QuantityUnit } & ({ value: number | null; loading?: false } | { loading: true; value?: never });
  let { value, unit, loading = false }: Props = $props();
  const formatted = $derived.by(() => {
    if (loading && value !== undefined) throw new Error('Loading quantities cannot carry telemetry');
    return loading ? null : formatQuantity(value ?? null, unit);
  });
</script>

<span class="quantity" role={loading ? undefined : 'img'} aria-label={formatted?.label} data-quantity>
  {#if loading}<TextSkeleton shape="0,000.00" />{:else}{formatted?.text}{/if}
</span>

<style>
  .quantity { min-width: 0; max-width: 100%; font-size: var(--u1-type-label); line-height: var(--u1-line-copy); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; text-align: end; }
</style>
