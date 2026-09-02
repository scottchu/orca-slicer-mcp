<script lang="ts">
  import type { FanReading as Reading } from '../../lib/client/observation/types';
  import { fanNames } from '../../lib/client/observation/fan-labels';
  import PercentageBackground from '../common/PercentageBackground.svelte';
  import ReadingRow from '../common/ReadingRow.svelte';
  import Inline from '../common/Inline.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from '../../lib/client/observation/icons';
  import Name from '../common/Name.svelte';
  import MetricValue from '../common/MetricValue.svelte';
  let { reading }: { reading: Reading } = $props();
  const name = $derived(fanNames[reading.id]);
</script>
<PercentageBackground value={reading.percent} max={100}>
  <ReadingRow label={name}>
    {#snippet leading()}<Inline><Icon icon={observationIcons.fan} /><Name text={name} /></Inline>{/snippet}
    {#snippet trailing()}<Inline shrink={false} align="baseline" gap="tight"><MetricValue value={reading.percent} unit="%" /><MetricValue value={reading.rpm} unit="RPM" tone="muted" /></Inline>{/snippet}
  </ReadingRow>
</PercentageBackground>
