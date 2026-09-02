<script lang="ts">
  import { HEAD_IDS, type HeadCardValue, type HeadId } from '../live/heads-presentation';
  import CardGrid from '../ui/CardGrid.svelte';
  import HeadCard from './HeadCard.svelte';
  import { checkedMaterialShapes, type MaterialLoadingShapes } from './heads-loading';
  type Props = { items?: HeadCardValue[]; copying?: HeadId | null; oncopy?: (id: HeadId, color: string) => void } & ({ loading: true; materialShapes?: MaterialLoadingShapes } | { loading?: false; materialShapes?: never });
  let { items, loading = false, materialShapes, copying = null, oncopy }: Props = $props();
  const shapes = $derived(checkedMaterialShapes(loading, materialShapes));
  $effect.pre(() => { checkedMaterialShapes(loading, materialShapes); });
</script>
<CardGrid minimum="color-action">
  {#each HEAD_IDS as physicalTool, index (physicalTool)}
    {#if loading}<HeadCard {physicalTool} loading materialShape={shapes?.[index]} />
    {:else}<HeadCard {physicalTool} reading={items?.[index]} copying={copying === physicalTool} {oncopy} />{/if}
  {/each}
</CardGrid>
