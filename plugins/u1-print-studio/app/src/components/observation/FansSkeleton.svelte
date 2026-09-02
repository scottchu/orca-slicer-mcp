<script lang="ts">
  import { fanNames, fanIds } from '../../lib/client/observation/fan-labels';
  import Stack from '../common/Stack.svelte';
  import InfoPair from '../common/InfoPair.svelte';
  import Label from '../common/Label.svelte';
  import Skeleton from '../common/Skeleton.svelte';
  import ReadingList from '../common/ReadingList.svelte';
  import ReadingRow from '../common/ReadingRow.svelte';
  import Inline from '../common/Inline.svelte';
  import Icon from '../common/Icon.svelte';
  import { observationIcons } from '../../lib/client/observation/icons';
  import Name from '../common/Name.svelte';
  import MetricValue from '../common/MetricValue.svelte';
  let { includePower = false }: { includePower?: boolean } = $props();
</script>
<Stack>
  <InfoPair reserve="label">
    {#snippet label()}<Label text="Purifier" tone="muted" />{/snippet}
    {#snippet value()}<Skeleton shape="text" />{/snippet}
  </InfoPair>
  {#if includePower}
    <InfoPair reserve="label">
      {#snippet label()}<Label text="Power" tone="muted" />{/snippet}
      {#snippet value()}<Skeleton shape="text" />{/snippet}
    </InfoPair>
  {/if}
  <ReadingList label="Fan readings" columns="single">
    {#each fanIds as id (id)}
      <ReadingRow label={fanNames[id]}>
        {#snippet leading()}<Inline><Icon icon={observationIcons.fan} /><Name text={fanNames[id]} /></Inline>{/snippet}
        {#snippet trailing()}<Inline shrink={false} align="baseline" gap="tight"><MetricValue loading unit="%" /><MetricValue loading unit="RPM" tone="muted" /></Inline>{/snippet}
      </ReadingRow>
    {/each}
  </ReadingList>
</Stack>
