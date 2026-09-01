<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import { validateThermals, type ThermalsObservation } from './types';
  import { validateWidgetState, type WidgetState } from '../ui/state';
  import StatePanel from '../ui/StatePanel.svelte';
  import ThermalReadings from './ThermalReadings.svelte';
  import ThermalsSkeleton from './ThermalsSkeleton.svelte';
  type Props = { observation: ThermalsObservation; state?: never } | { state: WidgetState<ThermalsObservation>; observation?: never };
  let { observation, state }: Props = $props();
  const resolve = (): WidgetState<ThermalsObservation> => {
    if (state !== undefined && observation !== undefined) throw new Error('Thermals accepts observation or state, not both');
    return validateWidgetState(state !== undefined ? state : { kind: 'ready', observation }, validateThermals);
  };
  const current = $derived(resolve());
</script>

<ObservationFrame title="Thermals" iconName="thermals" observedAt={current.kind === 'ready' ? current.observation.sourceObservedAt : null} freshness={current.kind === 'ready' ? current.observation.freshness : 'unknown'} stateKind={current.kind} refreshing={current.kind === 'ready' && current.refreshing}>
  {#if current.kind === 'ready'}
    <ThermalReadings readings={current.observation.readings} />
  {:else if current.kind === 'loading'}<ThermalsSkeleton />
  {:else}<StatePanel title="Thermals" reason={current.kind} />{/if}
</ObservationFrame>
