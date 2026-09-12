<script lang="ts">
  import LiveHistoryRoot from '../../../components/live/LiveHistoryRoot.svelte';
  import { createHistoryController } from '../../../lib/client/live/focused-controllers';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createHistoryController(httpObservationPort('job_history'));
</script>
<svelte:head><title>Job History</title></svelte:head>
<LiveHistoryRoot {controller} />

