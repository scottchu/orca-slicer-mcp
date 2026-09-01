<script lang="ts">
  import type { ThermalReading as Reading } from './types';
  import ActualTarget from './ActualTarget.svelte';
  import Icon from '../ui/Icon.svelte';
  import Inline from '../ui/Inline.svelte';
  import Name from '../ui/Name.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import PercentageBackground from '../ui/PercentageBackground.svelte';
  let { reading }: { reading: Reading } = $props();
  const labels = { 'tool-1': 'Tool 1', 'tool-2': 'Tool 2', 'tool-3': 'Tool 3', 'tool-4': 'Tool 4', bed: 'Heater bed', cavity: 'Cavity' };
  const name = $derived(labels[reading.id]);
</script>

<PercentageBackground value={reading.actualC} max={reading.targetC}>
  <ReadingRow active={reading.active} label={`${name} · ${reading.active ? 'Active' : 'Idle'}`}>
    {#snippet leading()}<Inline><Icon name={reading.id === 'bed' ? 'bed' : reading.id === 'cavity' ? 'box' : 'thermometer'} /><Name text={name} /></Inline>{/snippet}
    {#snippet trailing()}<ActualTarget actual={reading.actualC} target={reading.targetC} />{/snippet}
  </ReadingRow>
</PercentageBackground>
