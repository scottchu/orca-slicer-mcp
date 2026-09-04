<script lang="ts">
  import type { Snippet } from 'svelte';
  import { percentageColor, percentageFill } from '../../lib/client/common/percentage';
  let { value, max, color, surface = false, children }: {
    value: number | null;
    max: number | null;
    color?: string;
    surface?: boolean;
    children: Snippet;
  } = $props();
  const fill = $derived(percentageFill(value, max));
  const tint = $derived(percentageColor(color));
  const visibleFill = $derived(tint === null ? 0 : fill ?? 0);
</script>

<div class="percentage-background" class:filled={visibleFill > 0} class:surface
  style:--u1-percentage-fill={`${visibleFill}%`} style:--u1-percentage-color={tint ?? undefined}
  data-percentage-background data-percentage-fill={visibleFill}>
  {@render children()}
</div>

<style>
  .surface { min-width: 0; overflow: hidden; padding: var(--u1-space-2) var(--u1-space-3); border-radius: var(--u1-radius-inner); }
  .filled {
    background-image: linear-gradient(100deg,
      color-mix(in srgb, var(--u1-percentage-color, var(--u1-accent)) var(--u1-percentage-tint-start), transparent) 0%,
      color-mix(in srgb, var(--u1-percentage-color, var(--u1-accent)) var(--u1-percentage-tint-end), transparent) 100%);
    background-size: var(--u1-percentage-fill) 100%;
    background-position: left top;
    background-repeat: no-repeat;
  }
  @media (forced-colors: active) { .filled { background-image: none; } }
</style>
