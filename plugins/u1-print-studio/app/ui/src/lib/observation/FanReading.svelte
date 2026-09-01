<script lang="ts">
  import type { FanReading as Reading } from './types';
  import { fanNames } from './fan-labels';
  import PercentageBackground from '../ui/PercentageBackground.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import Inline from '../ui/Inline.svelte';
  import Icon from '../ui/Icon.svelte';
  import Name from '../ui/Name.svelte';
  import MetricValue from '../ui/MetricValue.svelte';
  let { reading }: { reading: Reading } = $props();
  const name = $derived(fanNames[reading.id]);
</script>
<PercentageBackground value={reading.percent} max={100}>
  <ReadingRow label={name}>
    {#snippet leading()}<Inline><Icon name="fan" /><Name text={name} /></Inline>{/snippet}
    {#snippet trailing()}<Inline shrink={false} align="baseline" gap="tight"><MetricValue value={reading.percent} unit="%" /><MetricValue value={reading.rpm} unit="RPM" tone="muted" /></Inline>{/snippet}
  </ReadingRow>
</PercentageBackground>
