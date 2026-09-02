<script lang="ts">
  import type { ThermalValue as Reading } from '../live/presentation';
  import ActualTarget from './ActualTarget.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from './icons';
  import Inline from '../common/Inline.svelte';
  import Name from '../common/Name.svelte';
  import ReadingRow from '../common/ReadingRow.svelte';
  import PercentageBackground from '../common/PercentageBackground.svelte';
  type Props = { reading: Reading; loading?: false; id?: never } | { reading?: never; loading: true; id: Reading['id'] };
  let { reading, loading = false, id }: Props = $props();
  const labels = { 'tool-1': 'Tool 1', 'tool-2': 'Tool 2', 'tool-3': 'Tool 3', 'tool-4': 'Tool 4', bed: 'Heater bed', 'heater-bed': 'Heater bed', cavity: 'Cavity' };
  const channel = $derived(reading?.id ?? id!);
  const name = $derived(labels[channel]);
</script>

<PercentageBackground value={reading?.actualC ?? null} max={reading?.targetC ?? null}>
  <ReadingRow active={reading?.active === true} label={reading ? `${name}${reading.active === null ? '' : reading.active ? ' · Active' : ' · Inactive'}` : name}>
    {#snippet leading()}<Inline><Icon icon={observationIcons[channel === 'bed' || channel === 'heater-bed' ? 'bed' : channel === 'cavity' ? 'box' : 'thermometer']} /><Name text={name} /></Inline>{/snippet}
    {#snippet trailing()}<ActualTarget actual={reading?.actualC} target={reading?.targetC} {loading} />{/snippet}
  </ReadingRow>
</PercentageBackground>
