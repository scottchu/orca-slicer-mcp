<script lang="ts">
  let { title, reason }: { title: 'Thermals' | 'Overview' | 'Print Progress' | 'Heads & Filaments' | 'Current Job' | 'Job History' | 'Print Queue' | 'Fans & Air' | 'Bed Mesh'; reason: 'unavailable' | 'error' } = $props();
</script>

<p class="state-panel">{reason === 'error' ? `Could not load ${title}` : `${title} unavailable`}</p>

<style>
  .state-panel { margin: 0; min-height: var(--u1-reading-height); padding: var(--u1-space-3); color: var(--u1-muted); border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); font-size: var(--u1-type-name); }
</style>
