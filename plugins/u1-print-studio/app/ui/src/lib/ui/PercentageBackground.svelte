<script lang="ts">
  import type { Snippet } from 'svelte';
  import { percentageColor, percentageFill } from './percentage';
  let { value, max, color, children }: {
    value: number | null;
    max: number | null;
    color?: string;
    children: Snippet;
  } = $props();
  const fill = $derived(percentageFill(value, max));
  const tint = $derived(percentageColor(color));
  const visibleFill = $derived(tint === null ? 0 : fill ?? 0);
</script>

<div class="percentage-background" class:filled={visibleFill > 0}
  style:--u1-percentage-fill={`${visibleFill}%`} style:--u1-percentage-color={tint ?? undefined}
  data-percentage-background data-percentage-fill={visibleFill}>
  {@render children()}
</div>

<style>
  .filled {
    background-image: linear-gradient(90deg,
      color-mix(in srgb, var(--u1-percentage-color, var(--u1-accent)) var(--u1-percentage-tint-start), transparent) 0%,
      color-mix(in srgb, var(--u1-percentage-color, var(--u1-accent)) var(--u1-percentage-tint-end), transparent) var(--u1-percentage-fill),
      transparent var(--u1-percentage-fill));
  }
  @media (forced-colors: active) { .filled { background-image: none; } }
</style>
