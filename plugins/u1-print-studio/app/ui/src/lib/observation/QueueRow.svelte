<script lang="ts">
  import type { QueueRecord } from '../live/queue-presentation';
  import Record from '../ui/Record.svelte';
  import BoxLabel from '../ui/BoxLabel.svelte';
  import Name from '../ui/Name.svelte';
  import Caption from '../ui/Caption.svelte';
  import DateTimeValue from '../ui/DateTimeValue.svelte';
  import DurationValue from '../ui/DurationValue.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  type State = { item: QueueRecord; loading?: false; positionCharacters?: never; nameShape?: never; dateShape?: never; compact?: never } | { loading: true; item?: never; positionCharacters?: number; nameShape?: string; dateShape?: string; compact?: boolean };
  let { item, loading = false, positionCharacters = 1, nameShape, dateShape, compact = false }: State = $props();
</script>
<Record>
  {#snippet leading()}{#if loading}<BoxLabel loading numeric characters={positionCharacters} />{:else}<BoxLabel numeric text={String(item!.position)} />{/if}{/snippet}
  {#if loading}<Name loading numeric shape={nameShape} />{:else}<Name numeric text={item!.filename} />{/if}
  <Caption>Added {#if loading}<DateTimeValue loading shape={dateShape} />{:else}<DateTimeValue value={item!.timeAdded} />{/if}</Caption>
  <Caption>Wait at observation {#if loading}{#if compact}<LoadingValue loading words={[1]} />{:else}<DurationValue loading />{/if}{:else}<DurationValue seconds={item!.timeInQueueSeconds} />{/if}</Caption>
</Record>
