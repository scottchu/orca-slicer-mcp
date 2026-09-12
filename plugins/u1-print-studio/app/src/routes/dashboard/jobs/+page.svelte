<script lang="ts">
  import LiveJobsRoot from '../../../components/live/LiveJobsRoot.svelte';
  import { createJobsController } from '../../../lib/client/live/focused-controllers';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createJobsController(httpObservationPort('jobs'));
</script>
<svelte:head><title>Current Job</title></svelte:head>
<LiveJobsRoot {controller} />

