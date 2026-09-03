<script lang="ts">
  let { text, state }: { text: string; state: 'ready' | 'loading' | 'error' } = $props();
</script>

<p class="status" data-presentation-status data-status-state={state} role="status">{text}</p>

<style>
  .status { display: flex; align-items: center; min-height: 3rem; margin: 0; padding: 7px 12px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); color: #4d535b; background: var(--u1-surface); font-size: .8125rem; line-height: 1.35; }
  .status[data-status-state='error'] { border-color: #d7dadd; color: #454a50; background: var(--u1-soft); }
</style>
