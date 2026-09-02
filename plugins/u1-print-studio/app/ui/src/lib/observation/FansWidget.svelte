<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateFans, type FansObservation } from './types';
  import { titleCase } from './format';
  import { validateWidgetState, type WidgetState } from '../ui/state';
  import Stack from '../ui/Stack.svelte';
  import InfoPair from '../ui/InfoPair.svelte';
  import Label from '../ui/Label.svelte';
  import type { FailureProps } from './loading';
  import FanReadings from './FanReadings.svelte';
  import FansSkeleton from './FansSkeleton.svelte';
  type Props = FailureProps & ({ observation: FansObservation; state?: never } | { state: WidgetState<FansObservation>; observation?: never });
  let { observation, state, failure, onretry }: Props = $props();
  const resolve = (): WidgetState<FansObservation> => {
    if (state !== undefined && observation !== undefined) throw new Error('Fans accepts observation or state, not both');
    return validateWidgetState(state !== undefined ? state : { kind: 'ready', observation }, validateFans);
  };
  const current = $derived(resolve());
</script>
<ObservationFrame title="Fans & Air" iconName="fan" observedAt={current.kind === 'ready' ? current.observation.sourceObservedAt : null} freshness={current.kind === 'ready' ? current.observation.freshness : 'unknown'} stateKind={failure ?? current.kind} placeholder={current.kind !== 'ready' || !!failure} {onretry} refreshing={current.kind === 'ready' && current.refreshing}>
  {#if current.kind === 'ready' && !failure}
    <Stack>
      <InfoPair reserve="label">
        {#snippet label()}<Label text="Purifier" tone="muted" />{/snippet}
        {#snippet value()}<Label text={current.observation.purifierMode === null ? 'N/A' : titleCase(current.observation.purifierMode)} />{/snippet}
      </InfoPair>
      <FanReadings items={current.observation.items} />
    </Stack>
  {:else}<FansSkeleton />{/if}
</ObservationFrame>
