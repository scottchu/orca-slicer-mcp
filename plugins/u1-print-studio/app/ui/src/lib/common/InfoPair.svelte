<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, value, reserve }: { label: Snippet; value: Snippet; reserve?: 'label' } = $props();
</script>
<div class="info-pair">{@render label()}<span class="value" class:reserved={reserve === 'label'}>{@render value()}</span></div>
<style>
  .info-pair { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--u1-space-2); min-width: 0; min-height: calc(var(--u1-type-label) * var(--u1-line-copy)); }
  .value { display: inline-flex; align-items: center; justify-content: flex-end; font-size: var(--u1-type-label); line-height: var(--u1-line-copy); min-height: 1lh; }
  .reserved { min-width: 14ch; }
</style>
