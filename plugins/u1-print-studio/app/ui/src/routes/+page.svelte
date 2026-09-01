<script lang="ts">
  import { onMount } from 'svelte';
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

  let view = $state<LabView | null>(null);
  function viewFromPath(pathname: string): LabView | null {
    const match = pathname.match(/^\/dashboard\/lab\/([^/]+)\/?$/);
    return match && LAB_VIEWS.includes(match[1] as LabView) ? match[1] as LabView : null;
  }
  onMount(() => { view = viewFromPath(window.location.pathname); });
</script>

<svelte:head><title>{view ? `U1 ${view.replaceAll('_', ' ')} lab` : 'U1 observation lab'}</title></svelte:head>

{#if view === null}
  <LabDirectory />
{:else}
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
{/if}
