<script lang="ts">
  let { text, active = false }: { text: string; active?: boolean } = $props();
</script>

<span class="circle-label" class:active>{text}</span>

<style>
  .circle-label { display: inline-grid; place-items: center; width: var(--u1-action-size); height: var(--u1-action-size); border-radius: 50%; background: var(--u1-soft); font-size: var(--u1-type-name); font-weight: var(--u1-weight-strong); }
  .active { background: var(--u1-accent); }
</style>
