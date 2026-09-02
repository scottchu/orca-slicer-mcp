<script lang="ts">
  let { message, announce = true }: { message: string; announce?: boolean } = $props();
</script>

{#if message}<div class="widget-feedback" role={announce ? 'status' : undefined}>{message}</div>{/if}

<style>
  .widget-feedback { position: absolute; right: var(--u1-card-x); bottom: 74px; z-index: 8; max-width: calc(100% - (2 * var(--u1-card-x))); padding: 8px 11px; border-radius: 10px; color: #fff; background: rgb(28 30 32 / 86%); box-shadow: 0 5px 16px rgb(28 30 32 / 16%); font-size: 12px; line-height: 1.35; pointer-events: none; }
</style>
