<script lang="ts">
  import { onMount } from 'svelte';
  import CameraLabWidget from './CameraLabWidget.svelte';
  import LabControls from '../ui/LabControls.svelte';
  import PageLayout from '../ui/PageLayout.svelte';
  import { cameraFields, defaultCameraSelection, setCameraSelection } from './controller';
  import { currentCameraSelection, writeCameraSelection, resetCameraLocation, watchCameraLocation } from './lab-location';
  let selection = $state(currentCameraSelection());
  const change = (key: string, value: string): void => {
    selection = setCameraSelection(selection, key, value);
    writeCameraSelection(selection);
  };
  const reset = (): void => {
    selection = defaultCameraSelection();
    resetCameraLocation();
  };
  onMount(() => watchCameraLocation((restored) => { selection = restored; }));
</script>

<PageLayout name="camera">
  <CameraLabWidget scenario={selection.scenario} capabilityPolicy={selection.capability} />
  <LabControls fields={cameraFields} values={selection} onchange={change} onreset={reset} wideOptions />
</PageLayout>
