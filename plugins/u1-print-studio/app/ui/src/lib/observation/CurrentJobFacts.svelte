<script lang="ts">
  import { currentJobLabels, type CurrentJobValue, type CurrentJobLoadingShapes } from './current-job-value';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  import TextValue from '../ui/TextValue.svelte';
  import ReadingList from '../ui/ReadingList.svelte';
  import ReadingRow from '../ui/ReadingRow.svelte';
  import QuantityValue from '../ui/QuantityValue.svelte';
  import DurationValue from '../ui/DurationValue.svelte';
  let { job, shapes }: { job?: CurrentJobValue; shapes?: CurrentJobLoadingShapes } = $props();
  const labels = $derived.by(() => {
    if (job && shapes !== undefined) throw new Error('Ready job cannot carry loading structure');
    return job ? currentJobLabels(job) : null;
  });
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
    {#snippet value()}{#if labels}<TextValue text={labels.state} />{:else}<TextValue loading shape={shapes?.state} />{/if}{/snippet}
  </InfoPair>
  <Stack>
    {#if labels}<Label text={labels.fileLabel} tone="muted" />{:else}<TextValue loading shape={shapes?.fileLabel ?? 'Reported file'} />{/if}
    {#if labels}<TextValue text={labels.filename} />{:else}<TextValue loading shape={shapes?.filename} />{/if}
  </Stack>
  <ReadingList label="Current job facts">
    <ReadingRow label="Storage">
      {#snippet leading()}<Label text="Storage" tone="muted" />{/snippet}
      {#snippet trailing()}{#if labels}<TextValue text={labels.storage} />{:else}<TextValue loading shape={shapes?.storage} />{/if}{/snippet}
    </ReadingRow>
    {#each quantities as quantity, index (quantity.label)}
      <ReadingRow label={quantity.label}>
        {#snippet leading()}<Label text={quantity.label} tone="muted" />{/snippet}
        {#snippet trailing()}
          {#if quantity.unit === 'seconds'}
            {#if job}<DurationValue seconds={quantity.field?.reported ? quantity.field.value : null} />{:else}<DurationValue loading shape={shapes?.quantities[index]} />{/if}
          {:else}
            {#if job}<QuantityValue unit={quantity.unit} value={quantity.field?.reported ? quantity.field.value : null} />{:else}<QuantityValue unit={quantity.unit} loading shape={shapes?.quantities[index]} />{/if}
          {/if}
        {/snippet}
      </ReadingRow>
    {/each}
  </ReadingList>
</Stack>
