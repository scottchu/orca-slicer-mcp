<script lang="ts">
  import type { ThermalReading as Reading } from './types';
  import ActualTarget from './ActualTarget.svelte';
  import Icon from '../ui/Icon.svelte';
  import Inline from '../ui/Inline.svelte';
  import Name from '../ui/Name.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import PercentageBackground from '../ui/PercentageBackground.svelte';
  type Props = { reading: Reading; loading?: false; id?: never } | { reading?: never; loading: true; id: Reading['id'] };
  let { reading, loading = false, id }: Props = $props();
  const labels = { 'tool-1': 'Tool 1', 'tool-2': 'Tool 2', 'tool-3': 'Tool 3', 'tool-4': 'Tool 4', bed: 'Heater bed', cavity: 'Cavity' };
  const channel = $derived(reading?.id ?? id!);
  const name = $derived(labels[channel]);
</script>

<PercentageBackground value={reading?.actualC ?? null} max={reading?.targetC ?? null}>
  <ReadingRow active={reading?.active ?? false} label={reading ? `${name} · ${reading.active ? 'Active' : 'Idle'}` : name}>
    {#snippet leading()}<Inline><Icon name={channel === 'bed' ? 'bed' : channel === 'cavity' ? 'box' : 'thermometer'} /><Name text={name} /></Inline>{/snippet}
    {#snippet trailing()}<ActualTarget actual={reading?.actualC} target={reading?.targetC} {loading} />{/snippet}
  </ReadingRow>
</PercentageBackground>
