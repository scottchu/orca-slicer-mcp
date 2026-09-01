<script lang="ts">
  import { currentJobLabels, type CurrentJobValue } from './current-job-value';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  import TextValue from '../ui/TextValue.svelte';
  import ReadingList from '../ui/ReadingList.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import QuantityValue from '../ui/QuantityValue.svelte';
  let { job }: { job?: CurrentJobValue } = $props();
  const labels = $derived(job ? currentJobLabels(job) : null);
  const quantities = $derived([
    { label: 'File position', unit: 'bytes' as const, field: job?.filePositionBytes },
    { label: 'File size', unit: 'bytes' as const, field: job?.fileSizeBytes },
    { label: 'Print duration', unit: 'seconds' as const, field: job?.printDurationSeconds },
    { label: 'Total duration', unit: 'seconds' as const, field: job?.totalDurationSeconds },
    { label: 'Filament used', unit: 'mm' as const, field: job?.filamentUsedMillimeters }
  ]);
</script>

<Stack>
  <InfoPair>
    {#snippet label()}<Label text="Job state" tone="muted" />{/snippet}
    {#snippet value()}{#if labels}<TextValue text={labels.state} />{:else}<TextValue loading />{/if}{/snippet}
  </InfoPair>
  <Stack>
    <Label text={labels?.fileLabel ?? 'Reported file'} tone="muted" />
    {#if labels}<TextValue text={labels.filename} />{:else}<TextValue loading />{/if}
  </Stack>
  <ReadingList label="Current job facts">
    <ReadingRow label="Storage">
      {#snippet leading()}<Label text="Storage" tone="muted" />{/snippet}
      {#snippet trailing()}{#if labels}<TextValue text={labels.storage} />{:else}<TextValue loading />{/if}{/snippet}
    </ReadingRow>
    {#each quantities as quantity (quantity.label)}
      <ReadingRow label={quantity.label}>
        {#snippet leading()}<Label text={quantity.label} tone="muted" />{/snippet}
        {#snippet trailing()}{#if job}<QuantityValue unit={quantity.unit} value={quantity.field?.reported ? quantity.field.value : null} />{:else}<QuantityValue unit={quantity.unit} loading />{/if}{/snippet}
      </ReadingRow>
    {/each}
  </ReadingList>
</Stack>
