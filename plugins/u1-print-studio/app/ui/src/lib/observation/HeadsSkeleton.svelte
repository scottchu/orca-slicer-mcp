<script lang="ts">
  import HeadCards from './HeadCards.svelte';
  import type { MaterialLoadingShapes } from './heads-loading';
  let { materialShapes }: { materialShapes?: MaterialLoadingShapes } = $props();
</script>
<HeadCards loading {materialShapes} />
