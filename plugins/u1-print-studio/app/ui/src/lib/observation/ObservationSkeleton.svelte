<script lang="ts">
  import type { LabView } from './types';
  import OverviewWidget from './OverviewWidget.svelte';
  import ProgressWidget from './ProgressWidget.svelte';
  import HeadsWidget from './HeadsWidget.svelte';
  import CurrentJobWidget from './CurrentJobWidget.svelte';
  import JobHistoryWidget from './JobHistoryWidget.svelte';
  import QueueWidget from './QueueWidget.svelte';
  import type { MaterialLoadingShapes } from './heads-loading';
  let { view, rows, materialShapes }: { view: Exclude<LabView, 'thermals' | 'fans' | 'bed_mesh'>; rows?: number; materialShapes?: MaterialLoadingShapes } = $props();
</script>

{#if view === 'overview'}<OverviewWidget loading />
{:else if view === 'progress'}<ProgressWidget loading />
{:else if view === 'heads'}<HeadsWidget loading {materialShapes} />
{:else if view === 'jobs'}<CurrentJobWidget loading />
{:else if view === 'job_history'}<JobHistoryWidget loading {rows} />
{:else}<QueueWidget loading {rows} />{/if}
