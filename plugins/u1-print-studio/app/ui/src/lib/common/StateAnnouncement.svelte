<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<span class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{text}</span>

<style>
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
