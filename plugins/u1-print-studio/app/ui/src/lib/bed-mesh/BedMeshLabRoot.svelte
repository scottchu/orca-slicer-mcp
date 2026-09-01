<script lang="ts">
  import { onMount } from 'svelte';
  import LabControls from '../ui/LabControls.svelte';
  import ObservationLabPage from '../ui/ObservationLabPage.svelte';
  import ObservationState from '../observation/ObservationState.svelte';
  import { resolveBedMeshFixture } from '../lab/bed-mesh-fixture';
  import {
    bedMeshFields,
    bedMeshSelectionValue,
    defaultBedMeshSelection,
    setBedMeshSelection
  } from './lab-controller';
  import { currentBedMeshSelection, resetBedMeshLocation, watchBedMeshLocation, writeBedMeshSelection } from './lab-location';
  import BedMeshWidget from './BedMeshWidget.svelte';

  let selection = $state(currentBedMeshSelection());
  const change = (key: string, value: string): void => {
    selection = setBedMeshSelection(selection, key, value);
    writeBedMeshSelection(selection);
  };
  const reset = (): void => {
    selection = defaultBedMeshSelection();
    resetBedMeshLocation();
  };
  onMount(() => watchBedMeshLocation((restored) => { selection = restored; }));
</script>

<ObservationLabPage name="bed_mesh">
  {#if selection.phase === 'error' || selection.phase === 'unavailable'}
    <ObservationState view="bed_mesh" reason={selection.phase} />
  {:else if selection.phase === 'loading'}
    <BedMeshWidget loading selectedMode={selection.values.mode} onmode={(mode) => change('mode', mode)} />
  {:else}
    <BedMeshWidget
      observation={resolveBedMeshFixture(selection)}
      refreshing={selection.phase === 'refreshing'}
      selectedMode={selection.values.mode}
      onmode={(mode) => change('mode', mode)}
    />
  {/if}
  <LabControls
    fields={bedMeshFields(selection)}
    values={Object.fromEntries(bedMeshFields(selection).map(({ key }) => [key, bedMeshSelectionValue(selection, key)]))}
    onchange={change}
    onreset={reset}
  />
</ObservationLabPage>
