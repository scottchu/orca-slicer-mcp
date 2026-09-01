<script lang="ts">
  import type { LabView } from './types';
  import OverviewWidget from './OverviewWidget.svelte';
  import ProgressWidget from './ProgressWidget.svelte';
  import HeadsWidget from './HeadsWidget.svelte';
  import CurrentJobWidget from './CurrentJobWidget.svelte';
  import JobHistoryWidget from './JobHistoryWidget.svelte';
  import QueueWidget from './QueueWidget.svelte';
  import BedMeshWidget from '../bed-mesh/BedMeshWidget.svelte';
  let { view, rows }: { view: Exclude<LabView, 'thermals' | 'fans'>; rows?: number } = $props();
</script>

{#if view === 'overview'}<OverviewWidget loading />
{:else if view === 'progress'}<ProgressWidget loading />
{:else if view === 'heads'}<HeadsWidget loading />
{:else if view === 'jobs'}<CurrentJobWidget loading />
{:else if view === 'job_history'}<JobHistoryWidget loading {rows} />
{:else if view === 'queue'}<QueueWidget loading {rows} />
{:else}<BedMeshWidget loading />{/if}
