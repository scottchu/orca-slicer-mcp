<script lang="ts">
  import PercentageHarness from './PercentageHarness.svelte';
  let value = $state<number | null>(50);
  let max = $state<number | null>(100);
  let color = $state<string | undefined>();
  let clicks = 0;
  // Test-only state bridge, absent from the packaged private lab.
  Object.assign(window, {
    __setPercentage: (next: { value: number | null; max: number | null; color?: string }) => {
      value = next.value; max = next.max; color = next.color;
    },
    __percentageClicks: () => clicks
  });
</script>

<main><PercentageHarness {value} {max} {color} onclick={() => clicks++} /></main>

<style>
  main { width: calc(100% - 32px); margin: 16px; background: white; }
</style>
