<script lang="ts">
  import { Thermometer } from 'lucide-svelte';
  import type { ResolvedTemperatureValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Metric from '../common/Metric.svelte';
  let { value, appearance = 'default', density = 'regular' }: { value: ResolvedTemperatureValue; density?: 'regular' | 'compact'; appearance?: 'default' | 'hero' } = $props();
  const display = $derived(value.state === 'known'
    ? `${value.actual === null ? '—' : `${value.actual}°`} / ${value.target === null ? '—' : `${value.target}°`}\u00a0C`
    : 'Unknown');
</script>

<Reading {density} icon={Thermometer} appearance={appearance === 'hero' ? 'hero' : 'default'}>
  <Metric {density} label="Actual / target" {display} state={value.state} reserveLines={2} wrap="words" appearance={appearance === 'hero' ? 'hero' : 'default'} />
</Reading>
