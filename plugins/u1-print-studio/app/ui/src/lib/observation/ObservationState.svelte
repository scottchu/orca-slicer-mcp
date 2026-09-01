<script lang="ts">
  import ObservationFrame from './ObservationFrame.svelte';
  import StatePanel from '../ui/StatePanel.svelte';
  import type { LabView } from './types';
  const titles = { overview: 'Overview', progress: 'Print Progress', thermals: 'Thermals', heads: 'Heads & Filaments', jobs: 'Current Job', job_history: 'Job History', queue: 'Print Queue', fans: 'Fans & Air', bed_mesh: 'Bed Mesh' } as const;
  const icons = { overview: 'overview', progress: 'progress', thermals: 'thermals', heads: 'heads', jobs: 'jobs', job_history: 'history', queue: 'queue', fans: 'fan', bed_mesh: 'mesh' } as const;
  let { view, reason }: { view: LabView; reason: 'unavailable' | 'error' } = $props();
</script>

<ObservationFrame title={titles[view]} iconName={icons[view]} observedAt={null} freshness="unknown" stateKind={reason}>
  <StatePanel title={titles[view]} {reason} />
</ObservationFrame>
