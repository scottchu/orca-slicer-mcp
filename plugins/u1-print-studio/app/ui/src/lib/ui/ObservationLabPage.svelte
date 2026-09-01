<script lang="ts">
  import type { Snippet } from 'svelte';
  let { name, children }: { name: string; children: Snippet } = $props();
</script>

<section class="route-panel" data-route-panel={name}>
  <main data-private-lab={name} data-lab-view={name}>{@render children()}</main>
</section>

<style>
  main { width: min(100% - 24px, 720px); margin: 24px auto; }
  @media (min-width: 590px) { main { width: min(100% - 40px, 720px); margin-block: 40px; } }
</style>
