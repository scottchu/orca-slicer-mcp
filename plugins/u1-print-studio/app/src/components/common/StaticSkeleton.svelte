<script lang="ts">
  let { shape }: { shape: 'value' } = $props();
</script>

<span class="skeleton" data-skeleton={shape} data-skeleton-static aria-hidden="true"></span>

<style>
  .skeleton { display: inline-block; flex: none; width: var(--u1-skeleton-value); height: var(--u1-type-value); border-radius: var(--u1-skeleton-radius); background: var(--u1-skeleton-base); }
  @media (forced-colors: active) { .skeleton { outline: 1px solid CanvasText; } }
</style>
