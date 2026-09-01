<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<span class="box-label">{text}</span>

<style>
  .box-label { display: inline-flex; align-items: center; padding: var(--u1-space-1) var(--u1-space-2); border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); font-size: var(--u1-type-label); background: var(--u1-soft); }
</style>
