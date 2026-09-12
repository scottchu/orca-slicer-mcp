<script lang="ts">
  import LiveBedMeshRoot from '../../../components/live/LiveBedMeshRoot.svelte';
  import { createBedMeshController } from '../../../lib/client/live/bed-mesh-controller';
  import { httpObservationPort } from '../../../lib/client/live/http-observation-port';
  const controller = createBedMeshController(httpObservationPort('bed_mesh'));
</script>
<svelte:head><title>Bed Mesh</title></svelte:head>
<LiveBedMeshRoot {controller} />
