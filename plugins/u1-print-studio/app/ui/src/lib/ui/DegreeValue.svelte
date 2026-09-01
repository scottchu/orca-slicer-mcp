<script lang="ts">
  import { formatDegree } from './format';
  let { value, precision = 0, emphasis = 'primary', context }: { value: number | null; precision?: 0 | 1; emphasis?: 'primary' | 'secondary'; context?: 'Actual' | 'Target' } = $props();
  const degree = $derived(formatDegree(value, precision));
</script>

<span class="degree" class:secondary={emphasis === 'secondary'} role="img" aria-label={context ? `${context}: ${degree.accessible}` : degree.accessible} data-required-text>{degree.visible}</span>

<style>
  .degree { color: var(--u1-ink); font-size: var(--u1-type-value); font-weight: var(--u1-weight-strong); font-variant-numeric: tabular-nums; line-height: var(--u1-line-value); white-space: nowrap; }
  .secondary { color: var(--u1-muted); font-size: var(--u1-type-label); font-weight: normal; }
</style>
