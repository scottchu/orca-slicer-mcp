<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateThermals, type ThermalsObservation } from './types';
  import { validateWidgetState, type WidgetState } from './state';
  import type { FailureProps } from './loading';
  import ThermalReadings from './ThermalReadings.svelte';
  import ThermalsSkeleton from './ThermalsSkeleton.svelte';
  type Props = FailureProps & ({ observation: ThermalsObservation; state?: never } | { state: WidgetState<ThermalsObservation>; observation?: never });
  let { observation, state, failure, onretry }: Props = $props();
  const resolve = (): WidgetState<ThermalsObservation> => {
    if (state !== undefined && observation !== undefined) throw new Error('Thermals accepts observation or state, not both');
    return validateWidgetState(state !== undefined ? state : { kind: 'ready', observation }, validateThermals);
  };
  const current = $derived(resolve());
</script>

<ObservationFrame title="Thermals" iconName="thermals" observedAt={current.kind === 'ready' ? current.observation.sourceObservedAt : null} freshness={current.kind === 'ready' ? current.observation.freshness : 'unknown'} stateKind={failure ?? current.kind} placeholder={current.kind !== 'ready' || !!failure} {onretry} refreshing={current.kind === 'ready' && current.refreshing}>
  {#if current.kind === 'ready' && !failure}
    <ThermalReadings readings={current.observation.readings} />
  {:else}<ThermalsSkeleton />{/if}
</ObservationFrame>
