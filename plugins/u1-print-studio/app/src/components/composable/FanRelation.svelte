<script lang="ts">
  import { Fan } from 'lucide-svelte';
  import type { ResolvedFanRelationValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Metric from '../common/Metric.svelte';
  let { value, appearance = 'default', density = 'regular' }: { value: ResolvedFanRelationValue; density?: 'regular' | 'compact'; appearance?: 'default' | 'quiet' } = $props();
  const display = $derived(value.state === 'known' ? value.primary ?? 'Unknown' : 'Unknown');
</script>

<Reading {density} icon={Fan} appearance={appearance === 'quiet' ? 'quiet' : 'default'}><Metric {density} label="Fan relation" {display} state={value.state} reserveLines={2} appearance={appearance === 'quiet' ? 'quiet' : 'default'} /></Reading>
