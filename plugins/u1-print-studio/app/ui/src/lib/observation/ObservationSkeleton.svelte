<script lang="ts">
  import type { LabView } from './types';
  import OverviewWidget from './OverviewWidget.svelte';
  import ProgressWidget from './ProgressWidget.svelte';
  import HeadsWidget from './HeadsWidget.svelte';
  import CurrentJobWidget from './CurrentJobWidget.svelte';
  import JobHistoryWidget from './JobHistoryWidget.svelte';
  import QueueWidget from './QueueWidget.svelte';
  import type { MaterialLoadingShapes } from './heads-loading';
  import type { FailureProps } from './loading';
  let { view, rows, materialShapes, failure, onretry }: { view: Exclude<LabView, 'thermals' | 'fans' | 'bed_mesh'>; rows?: number; materialShapes?: MaterialLoadingShapes } & FailureProps = $props();
</script>

{#if view === 'overview'}<OverviewWidget loading {failure} {onretry} />
{:else if view === 'progress'}<ProgressWidget loading {failure} {onretry} />
{:else if view === 'heads'}<HeadsWidget loading {materialShapes} {failure} {onretry} />
{:else if view === 'jobs'}<CurrentJobWidget loading {failure} {onretry} />
{:else if view === 'job_history'}<JobHistoryWidget loading {rows} {failure} {onretry} />
{:else}<QueueWidget loading {rows} {failure} {onretry} />{/if}
