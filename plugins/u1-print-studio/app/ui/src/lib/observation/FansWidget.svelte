<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateFans, type FansObservation } from './types';
  import { titleCase } from './format';
  import { validateWidgetState, type WidgetState } from '../ui/state';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  import ReadingList from '../ui/ReadingList.svelte';
  import StatePanel from '../ui/StatePanel.svelte';
  import FanReading from './FanReading.svelte';
  import FansSkeleton from './FansSkeleton.svelte';
  type Props = { observation: FansObservation; state?: never } | { state: WidgetState<FansObservation>; observation?: never };
  let { observation, state }: Props = $props();
  const resolve = (): WidgetState<FansObservation> => {
    if (state !== undefined && observation !== undefined) throw new Error('Fans accepts observation or state, not both');
    return validateWidgetState(state !== undefined ? state : { kind: 'ready', observation }, validateFans);
  };
  const current = $derived(resolve());
</script>
<ObservationFrame title="Fans & Air" iconName="fan" observedAt={current.kind === 'ready' ? current.observation.sourceObservedAt : null} freshness={current.kind === 'ready' ? current.observation.freshness : 'unknown'} stateKind={current.kind} refreshing={current.kind === 'ready' && current.refreshing}>
  {#if current.kind === 'ready'}
    <Stack>
      <InfoPair reserve="label">
        {#snippet label()}<Label text="Purifier" tone="muted" />{/snippet}
        {#snippet value()}<Label text={current.observation.purifierMode === null ? 'N/A' : titleCase(current.observation.purifierMode)} />{/snippet}
      </InfoPair>
      <ReadingList label="Fan readings" columns="single">
        {#each current.observation.items as reading (reading.id)}<FanReading {reading} />{/each}
      </ReadingList>
    </Stack>
  {:else if current.kind === 'loading'}<FansSkeleton />
  {:else}<StatePanel title="Fans & Air" reason={current.kind} />{/if}
</ObservationFrame>
