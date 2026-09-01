<script lang="ts">
  import { fanNames, fanIds } from './fan-labels';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  import Skeleton from '../ui/Skeleton.svelte';
  import ReadingList from '../ui/ReadingList.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import Inline from '../ui/Inline.svelte';
  import Icon from '../ui/Icon.svelte';
  import Name from '../ui/Name.svelte';
  import MetricValue from '../ui/MetricValue.svelte';
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
        {#snippet leading()}<Inline><Icon name="fan" /><Name text={fanNames[id]} /></Inline>{/snippet}
        {#snippet trailing()}<Inline shrink={false} align="baseline" gap="tight"><MetricValue loading unit="%" /><MetricValue loading unit="RPM" tone="muted" /></Inline>{/snippet}
      </ReadingRow>
    {/each}
  </ReadingList>
</Stack>
