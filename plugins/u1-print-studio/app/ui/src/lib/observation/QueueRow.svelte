<script lang="ts">
  import type { QueueRecord } from '../live/queue-presentation';
  import Record from '../ui/Record.svelte';
  import BoxLabel from '../ui/BoxLabel.svelte';
  import Name from '../ui/Name.svelte';
  import Caption from '../ui/Caption.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import DateTimeValue from '../ui/DateTimeValue.svelte';
  import DurationValue from '../ui/DurationValue.svelte';
  type State = { item: QueueRecord; loading?: false } | { loading: true; item?: never };
  let { item, loading = false }: State = $props();
</script>
<Record>
  {#snippet leading()}{#if loading}<LoadingValue loading size="short" />{:else}<BoxLabel text={String(item!.position)} />{/if}{/snippet}
  {#if loading}<LoadingValue loading words={[7, 5, 2]} size="long" />{:else}<Name text={item!.filename} />{/if}
  <Caption>Added {#if loading}<DateTimeValue loading />{:else}<DateTimeValue value={item!.timeAdded} />{/if}</Caption>
  <Caption>Wait at observation {#if loading}<DurationValue loading />{:else}<DurationValue seconds={item!.timeInQueueSeconds} />{/if}</Caption>
</Record>
