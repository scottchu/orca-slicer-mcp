<script lang="ts">
  import { Fan } from 'lucide-svelte';
  import type { ResolvedFanRelationValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Metric from '../common/Metric.svelte';
  let { value }: { value: ResolvedFanRelationValue } = $props();
  const display = $derived(value.state === 'known' ? value.primary ?? 'Unknown' : 'Unknown');
</script>

<Reading icon={Fan}><Metric label="Fan relation" {display} state={value.state} /></Reading>
