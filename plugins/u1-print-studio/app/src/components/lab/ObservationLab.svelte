<script lang="ts">
  const browser = typeof window !== 'undefined';
  import { onMount } from 'svelte';
  import LabControls from './LabControls.svelte';
  import { observationProps } from '../../lib/client/lab/observation-props';
  import { defaultSelection, fieldsFor, readSelection, selectionSearch, selectionValue, setSelection, type LabSelection } from '../../lib/client/lab/controller';
  import { OBSERVATION_LAB_VIEWS, previewObservationState, type ObservationLabView } from '../../lib/client/lab/observation-fixtures';
  import CurrentJobWidget from '../observation/CurrentJobWidget.svelte';
  import FansWidget from '../observation/FansWidget.svelte';
  import HeadsWidget from '../observation/HeadsWidget.svelte';
  import JobHistoryWidget from '../observation/JobHistoryWidget.svelte';
  import LabDirectory from '../observation/LabDirectory.svelte';
  import OverviewWidget from '../observation/OverviewWidget.svelte';
  import ProgressWidget from '../observation/ProgressWidget.svelte';
  import QueueWidget from '../observation/QueueWidget.svelte';
  import ThermalsWidget from '../observation/ThermalsWidget.svelte';

  const viewFromPath = (pathname: string): ObservationLabView | null => {
    const match = pathname.match(/^\/dashboard\/lab\/([^/]+)\/?$/);
    return match && OBSERVATION_LAB_VIEWS.includes(match[1] as ObservationLabView) ? match[1] as ObservationLabView : null;
  };
  // The browser chooses its exact initial branch during component creation,
  // before mounting. SSR emits only a neutral zero-size bootstrap marker, never
  // the directory, so a child URL cannot paint the wrong widget or jump later.
  let view = $state<ObservationLabView | null | undefined>(browser ? viewFromPath(window.location.pathname) : undefined);
  let selection = $state<LabSelection | null>(view ? readSelection(view, window.location.search) : null);
  const selected = <V extends ObservationLabView>(expected: V): LabSelection<V> => {
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
  const failure = $derived(selection?.phase === 'error' || selection?.phase === 'retained-error' ? 'error' : selection?.phase === 'unavailable' ? 'unavailable' : undefined);
  const retry = () => change('phase', 'ready');
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
      {#if view === 'overview'}<OverviewWidget {...observationProps(selected('overview'))} {failure} onretry={retry} />
      {:else if view === 'progress'}<ProgressWidget {...observationProps(selected('progress'))} {failure} onretry={retry} />
      {:else if view === 'thermals'}<ThermalsWidget state={previewObservationState(selected('thermals'))} {failure} onretry={retry} />
      {:else if view === 'heads'}<HeadsWidget {...observationProps(selected('heads'))} {failure} onretry={retry} />
      {:else if view === 'jobs'}<CurrentJobWidget {...observationProps(selected('jobs'))} {failure} onretry={retry} />
      {:else if view === 'job_history'}<JobHistoryWidget {...observationProps(selected('job_history'))} {failure} onretry={retry} />
      {:else if view === 'queue'}<QueueWidget {...observationProps(selected('queue'))} {failure} onretry={retry} />
      {:else if view === 'fans'}<FansWidget state={previewObservationState(selected('fans'))} {failure} onretry={retry} />
      {/if}
      <LabControls fields={fieldsFor(selection)} values={Object.fromEntries(fieldsFor(selection).map(({ key }) => [key, selectionValue(selection!, key)]))} onchange={change} onreset={reset} />
    </main>
  </section>
{/if}
