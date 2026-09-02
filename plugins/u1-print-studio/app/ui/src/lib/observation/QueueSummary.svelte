<script lang="ts">
  import type { QueueState } from '../live/queue-presentation';
  import InfoPair from '../ui/InfoPair.svelte';
  import Caption from '../ui/Caption.svelte';
  import LoadingValue from '../ui/LoadingValue.svelte';
  import { titleCase } from './format';
  type State = { state: QueueState | null; count: number | null; loading?: false } | { loading: true; state?: never; count?: never };
  let { state, count, loading = false }: State = $props();
</script>
<InfoPair>
  {#snippet label()}<Caption><LoadingValue {loading} text={loading ? undefined : state === null ? 'State unknown' : titleCase(state!)} /></Caption>{/snippet}
  {#snippet value()}<Caption><LoadingValue {loading} text={loading ? undefined : count === null ? 'Count unknown' : `${count} ${count === 1 ? 'job' : 'jobs'}`} size="medium" /></Caption>{/snippet}
</InfoPair>
