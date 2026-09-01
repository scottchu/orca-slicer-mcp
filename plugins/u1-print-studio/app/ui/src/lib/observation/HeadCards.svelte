<script lang="ts">
  import { HEAD_IDS, type HeadCardValue, type HeadId } from '../live/heads-presentation';
  import CardGrid from '../ui/CardGrid.svelte';
  import HeadCard from './HeadCard.svelte';
  let { items, loading = false, copying = null, oncopy }: { items?: HeadCardValue[]; loading?: boolean; copying?: HeadId | null; oncopy?: (id: HeadId, color: string) => void } = $props();
</script>
<CardGrid>
  {#each HEAD_IDS as physicalTool, index (physicalTool)}
    <HeadCard {physicalTool} reading={loading ? undefined : items?.[index]} {loading} copying={copying === physicalTool} {oncopy} />
  {/each}
</CardGrid>
