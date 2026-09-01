<script lang="ts">
  import BedMeshWidget from '$lib/bed-mesh/BedMeshWidget.svelte';
  import { bedMeshLabFixture } from '$lib/fixtures/bed-mesh';
</script>

<svelte:head>
  <title>Bed Mesh · U1 widget lab</title>
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="lab-page" data-private-lab="bed_mesh">
  <BedMeshWidget observation={bedMeshLabFixture} />
</main>

<style>
  .lab-page { width: min(100% - 24px, 720px); margin: 24px auto; }
  @media (min-width: 590px) { .lab-page { width: min(100% - 40px, 720px); margin-block: 40px; } }
</style>
