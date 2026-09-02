<script lang="ts">
  import Skeleton from '../common/Skeleton.svelte';
  import Timestamp from '../common/Timestamp.svelte';
  import { type CameraScenario, type CameraMeasurement, CAMERA_FIXTURE_TIME } from './state';
  let { scenario, measurement }: { scenario: CameraScenario; measurement: CameraMeasurement } = $props();
  const live = $derived(scenario === 'live' || scenario === 'connecting');
  const auto = $derived(scenario === 'fallback');
  const label = $derived(live ? measurement.unavailable ? 'Video unavailable' : measurement.playing ? 'Simulated live' : 'Connecting' : auto ? 'Auto' : scenario === 'error' ? 'Unavailable' : scenario === 'unsupported' ? 'Display limited' : scenario === 'snapshot' ? 'Snapshot' : 'Connecting');
  const time = $derived(live || auto ? measurement.displayedAt : ['snapshot', 'unsupported'].includes(scenario) ? CAMERA_FIXTURE_TIME : null);
</script>

<div class="camera-status" data-camera-status>
  {#if scenario === 'loading'}
    <Skeleton shape="text" /><Skeleton shape="text" />
  {:else}
    <span class:live={live && measurement.playing}>{label}</span>
    <span class="metrics">{#if live && measurement.fps !== null}<span data-camera-fps>{measurement.fps} FPS</span>{/if}{#if time}<Timestamp value={time} />{/if}</span>
  {/if}
</div>

<style>
  .camera-status { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 4px; width: 8.6667em; min-height: calc(4em + 4px); color: var(--u1-muted); font-size: 12px; line-height: 1.25; font-variant-numeric: tabular-nums; }
  .live { color: var(--u1-positive); }
  .metrics { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 3px 8px; }
  @media (max-width: 420px) { .camera-status { width: 7.25em; } }
</style>
