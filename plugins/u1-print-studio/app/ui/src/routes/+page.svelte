<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import BedMeshWidget from '$lib/bed-mesh/BedMeshWidget.svelte';
  import LabControls from '$lib/ui/LabControls.svelte';
  import { defaultSelection, fieldsFor, loadingRows, readSelection, selectionSearch, selectionValue, setSelection, type LabSelection } from '$lib/lab/controller';
  import { resolveFixture, previewState } from '$lib/lab/fixtures';
  import CurrentJobWidget from '$lib/observation/CurrentJobWidget.svelte';
  import FansWidget from '$lib/observation/FansWidget.svelte';
  import HeadsWidget from '$lib/observation/HeadsWidget.svelte';
  import JobHistoryWidget from '$lib/observation/JobHistoryWidget.svelte';
  import LabDirectory from '$lib/observation/LabDirectory.svelte';
  import OverviewWidget from '$lib/observation/OverviewWidget.svelte';
  import ProgressWidget from '$lib/observation/ProgressWidget.svelte';
  import QueueWidget from '$lib/observation/QueueWidget.svelte';
  import ThermalsWidget from '$lib/observation/ThermalsWidget.svelte';
  import ObservationSkeleton from '$lib/observation/ObservationSkeleton.svelte';
  import ObservationState from '$lib/observation/ObservationState.svelte';
  import { LAB_VIEWS, type LabView } from '$lib/observation/types';

  const viewFromPath = (pathname: string): LabView | null => {
    const match = pathname.match(/^\/dashboard\/lab\/([^/]+)\/?$/);
    return match && LAB_VIEWS.includes(match[1] as LabView) ? match[1] as LabView : null;
  };
  // The browser chooses its exact initial branch during component creation,
  // before mounting. SSR emits only a neutral zero-size bootstrap marker, never
  // the directory, so a child URL cannot paint the wrong widget or jump later.
  let view = $state<LabView | null | undefined>(browser ? viewFromPath(window.location.pathname) : undefined);
  let selection = $state<LabSelection | null>(view ? readSelection(view, window.location.search) : null);
  const selected = <V extends LabView>(expected: V): LabSelection<V> => {
    if (!selection || selection.view !== expected) throw new Error('Invalid lab view selection');
    return selection as LabSelection<V>;
  };
  const change = (key: string, value: string): void => {
    if (!selection) return;
    selection = setSelection(selection, key, value);
    window.history.pushState(null, '', selectionSearch(selection));
  };
  const reset = (): void => {
    if (!view) return;
    selection = defaultSelection(view);
    window.history.pushState(null, '', window.location.pathname);
  };
  onMount(() => {
    const restore = (): void => { if (view) selection = readSelection(view, window.location.search); };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  });
</script>

{#if view === undefined}
  <div data-route-bootstrap hidden></div>
{:else if view === null}
  <section class="route-panel" data-route-panel="directory"><LabDirectory /></section>
{:else if selection}
  <section class="route-panel" data-route-panel={view}>
    <main class="lab-page" data-private-lab={view} data-lab-view={view}>
      {#if selection.phase === 'error' || selection.phase === 'unavailable'}<ObservationState {view} reason={selection.phase} />
      {:else if selection.phase === 'loading' && view !== 'thermals' && view !== 'fans'}<ObservationSkeleton {view} rows={loadingRows(selection)} />
      {:else if view === 'overview'}<OverviewWidget observation={resolveFixture(selected('overview'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'progress'}<ProgressWidget observation={resolveFixture(selected('progress'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'thermals'}<ThermalsWidget state={previewState(selected('thermals'))} />
      {:else if view === 'heads'}<HeadsWidget observation={resolveFixture(selected('heads'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'jobs'}<CurrentJobWidget observation={resolveFixture(selected('jobs'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'job_history'}<JobHistoryWidget observation={resolveFixture(selected('job_history'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'queue'}<QueueWidget observation={resolveFixture(selected('queue'))} refreshing={selection.phase === 'refreshing'} />
      {:else if view === 'fans'}<FansWidget state={previewState(selected('fans'))} />
      {:else if view === 'bed_mesh'}<BedMeshWidget observation={resolveFixture(selected('bed_mesh'))} refreshing={selection.phase === 'refreshing'} selectedMode={selected('bed_mesh').values.mode === '2d' ? '2d' : '3d'} onmode={(mode) => change('mode', mode)} />
      {/if}
      <LabControls fields={fieldsFor(selection)} values={Object.fromEntries(fieldsFor(selection).map(({ key }) => [key, selectionValue(selection!, key)]))} onchange={change} onreset={reset} />
    </main>
  </section>
{/if}
