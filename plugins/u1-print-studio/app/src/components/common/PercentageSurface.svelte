<script lang="ts">
  import type { Snippet } from 'svelte';
  import PercentageBackground from './PercentageBackground.svelte';
  let { value, max, children }: { value: number | null; max: number | null; children: Snippet } = $props();
</script>

<PercentageBackground {value} {max} surface>{@render children()}</PercentageBackground>
