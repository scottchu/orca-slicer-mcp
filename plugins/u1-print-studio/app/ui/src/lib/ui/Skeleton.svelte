<script lang="ts">
  let { shape, compact = false }: { shape: 'text' | 'value' | 'icon' | 'action' | 'caption' | 'fill' | 'chart'; compact?: boolean } = $props();
</script>

<span class="skeleton" class:compact data-skeleton={shape} aria-hidden="true"></span>

<style>
  .skeleton { display: inline-block; flex: none; border-radius: var(--u1-skeleton-radius); background: var(--u1-skeleton-base); animation: skeleton-pulse var(--u1-skeleton-duration) ease-in-out infinite alternate; }
  [data-skeleton='text'] { width: var(--u1-skeleton-text); height: var(--u1-type-name); }
  [data-skeleton='fill'] { width: 100%; height: .7em; }
  [data-skeleton='chart'] { display: block; width: 100%; height: 100%; }
  [data-skeleton='value'] { width: var(--u1-skeleton-value); height: var(--u1-type-value); }
  [data-skeleton='caption'] { width: var(--u1-skeleton-caption); height: var(--u1-type-label); vertical-align: middle; }
  [data-skeleton='icon'] { width: var(--u1-icon-size); height: var(--u1-icon-size); }
  [data-skeleton='action'] { width: var(--u1-action-size); height: var(--u1-action-size); border-radius: var(--u1-radius-control); }
  [data-skeleton='action'].compact { position: relative; background: transparent; }
  [data-skeleton='action'].compact::before { position: absolute; inset: 6px; border-radius: var(--u1-radius-control); background: var(--u1-skeleton-base); content: ''; }
  @keyframes skeleton-pulse { to { opacity: .5; } }
  @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
  @media (forced-colors: active) { .skeleton { outline: 1px solid CanvasText; } }
</style>
