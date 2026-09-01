<script lang="ts">
  import { browser } from '$app/environment';
  import BedMeshWidget from '$lib/bed-mesh/BedMeshWidget.svelte';
  import { bedMeshLabFixture } from '$lib/fixtures/bed-mesh';
  import { currentJobLabFixture, fansLabFixture, headsLabFixture, jobHistoryLabFixture, overviewLabFixture, progressLabFixture, queueLabFixture, thermalsLabFixture } from '$lib/fixtures/observations';
  import CurrentJobWidget from '$lib/observation/CurrentJobWidget.svelte';
  import FansWidget from '$lib/observation/FansWidget.svelte';
  import HeadsWidget from '$lib/observation/HeadsWidget.svelte';
  import JobHistoryWidget from '$lib/observation/JobHistoryWidget.svelte';
  import LabDirectory from '$lib/observation/LabDirectory.svelte';
  import OverviewWidget from '$lib/observation/OverviewWidget.svelte';
  import ProgressWidget from '$lib/observation/ProgressWidget.svelte';
  import QueueWidget from '$lib/observation/QueueWidget.svelte';
  import ThermalsWidget from '$lib/observation/ThermalsWidget.svelte';
  import { LAB_VIEWS, type LabView } from '$lib/observation/types';

  function viewFromPath(pathname: string): LabView | null {
    const match = pathname.match(/^\/dashboard\/lab\/([^/]+)\/?$/);
    return match && LAB_VIEWS.includes(match[1] as LabView) ? match[1] as LabView : null;
  }
  // The browser chooses its exact initial branch during component creation,
  // before mounting. SSR emits only a neutral zero-size bootstrap marker, never
  // the directory, so a child URL cannot paint the wrong widget or jump later.
  let view = $state<LabView | null | undefined>(browser ? viewFromPath(window.location.pathname) : undefined);
</script>

{#if view === undefined}
  <div data-route-bootstrap hidden></div>
{:else if view === null}
  <section class="route-panel" data-route-panel="directory"><LabDirectory /></section>
{:else}
  <section class="route-panel" data-route-panel={view}>
    <main class="lab-page" data-private-lab={view} data-lab-view={view}>
      {#if view === 'overview'}<OverviewWidget observation={overviewLabFixture} />
      {:else if view === 'progress'}<ProgressWidget observation={progressLabFixture} />
      {:else if view === 'thermals'}<ThermalsWidget observation={thermalsLabFixture} />
      {:else if view === 'heads'}<HeadsWidget observation={headsLabFixture} />
      {:else if view === 'jobs'}<CurrentJobWidget observation={currentJobLabFixture} />
      {:else if view === 'job_history'}<JobHistoryWidget observation={jobHistoryLabFixture} />
      {:else if view === 'queue'}<QueueWidget observation={queueLabFixture} />
      {:else if view === 'fans'}<FansWidget observation={fansLabFixture} />
      {:else if view === 'bed_mesh'}<BedMeshWidget observation={bedMeshLabFixture} />
      {/if}
    </main>
  </section>
{/if}
