<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import LabControls from '../lab/LabControls.svelte';
  import ObservationLabPage from '../lab/ObservationLabPage.svelte';
  import { resolveBedMeshFixture } from '../../lib/client/lab/bed-mesh-fixture';
  import {
    bedMeshFields,
    bedMeshSelectionValue,
    defaultBedMeshSelection,
    setBedMeshSelection
  } from '../../lib/client/bed-mesh/lab-controller';
  import { currentBedMeshSelection, resetBedMeshLocation, watchBedMeshLocation, writeBedMeshSelection } from '../../lib/client/bed-mesh/lab-location';
  import BedMeshWidget from './BedMeshWidget.svelte';

  let selection = $state(currentBedMeshSelection());
  let retrying = $state(false);
  let retryWithoutData = $state(false);
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  // Phase/mode changes do not recreate the retained fixture or renderer input.
  const fixtureKey = $derived(`${selection.scenario}:${selection.freshness}`);
  const fixture = $derived.by(() => { fixtureKey; return untrack(() => resolveBedMeshFixture(selection)); });
  const hasData = $derived(['ready', 'refreshing', 'retained-error'].includes(selection.phase) && !(retrying && retryWithoutData));
  const stopRetry = () => { clearTimeout(retryTimer); retryTimer = undefined; retrying = false; retryWithoutData = false; };
  const change = (key: string, value: string): void => {
    if (key !== 'mode') stopRetry();
    selection = setBedMeshSelection(selection, key, value);
    writeBedMeshSelection(selection);
  };
  const reset = (): void => {
    stopRetry();
    selection = defaultBedMeshSelection();
    resetBedMeshLocation();
  };
  const retry = () => {
    if (retrying || !['error', 'retained-error'].includes(selection.phase)) return;
    retryWithoutData = !hasData;
    retrying = true;
    selection = setBedMeshSelection(selection, 'phase', 'refreshing');
    writeBedMeshSelection(selection);
    // Closed local demonstration only; no acquisition or automatic server retry.
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      retrying = false; retryWithoutData = false;
      selection = setBedMeshSelection(selection, 'phase', 'ready');
      writeBedMeshSelection(selection);
    }, 300);
  };
  onMount(() => {
    const stopLocation = watchBedMeshLocation((restored) => { stopRetry(); selection = restored; });
    return () => { stopRetry(); stopLocation(); };
  });
</script>

<ObservationLabPage name="bed_mesh">
  <BedMeshWidget
    observation={hasData ? fixture : undefined}
    loading={selection.phase === 'loading'}
    refreshing={selection.phase === 'refreshing'}
    failure={selection.phase === 'error' || selection.phase === 'retained-error' ? 'error' : selection.phase === 'unavailable' ? 'unavailable' : undefined}
    {retrying}
    onretry={retry}
    selectedMode={selection.values.mode}
    onmode={(mode) => change('mode', mode)}
  />
  <LabControls
    fields={bedMeshFields(selection)}
    values={Object.fromEntries(bedMeshFields(selection).map(({ key }) => [key, bedMeshSelectionValue(selection, key)]))}
    onchange={change}
    onreset={reset}
  />
</ObservationLabPage>
