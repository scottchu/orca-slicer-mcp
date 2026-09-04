<script lang="ts">
  import { Thermometer } from 'lucide-svelte';
  import type { ResolvedTemperatureValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Metric from '../common/Metric.svelte';
  import PercentageSurface from '../common/PercentageSurface.svelte';
  let { value, percentage = false }: { value: ResolvedTemperatureValue; percentage?: boolean } = $props();
  const display = $derived(value.state === 'known'
    ? `${value.actual === null ? '—' : `${value.actual}°`} / ${value.target === null ? '—' : `${value.target}°`}\u00a0C`
    : 'Unknown');
  const fillValue = $derived(value.state === 'known' ? value.actual : null);
  const fillMaximum = $derived(value.state === 'known' ? value.target : null);
</script>

<Reading icon={Thermometer} contentInset={percentage ? 'child' : 'reading'}>
  {#if percentage}
    <PercentageSurface value={fillValue} max={fillMaximum}><Metric label="Actual / target" {display} state={value.state} reserveLines={2} wrap="words" /></PercentageSurface>
  {:else}
    <Metric label="Actual / target" {display} state={value.state} reserveLines={2} wrap="words" />
  {/if}
</Reading>
