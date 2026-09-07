<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, label, relation, rowGap = 'regular', inset = true, reserveRows = [] }: {
    children: Snippet;
    label: string;
    relation: 'identity' | 'summary';
    rowGap?: 'compact' | 'regular';
    inset?: boolean;
    reserveRows?: readonly ('double' | 'single')[];
  } = $props();
</script>

<section
  class="group"
  class:identity={relation === 'identity'}
  class:summary={relation === 'summary'}
  class:compact={rowGap === 'compact'}
  class:inset
  class:reserved-summary={reserveRows.length > 0}
  role="group"
  aria-label={label}
  data-node-kind="Group"
  data-group-relation={relation}
>{#if reserveRows.length > 0}
  <div class="summary-content">{@render children()}</div>
  <div class="summary-reserve" aria-hidden="true">
    {#each reserveRows as size}<span class="reserve-row" class:double={size === 'double'}></span>{/each}
  </div>
{:else}{@render children()}{/if}</section>

<style>
  .group { min-width: 0; }
  .identity { display: flex; align-items: center; flex-wrap: wrap; gap: var(--u1-space-3); }
  .identity.inset { padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)) 0; }
  .summary { display: grid; gap: var(--u1-space-2); container-type: inline-size; }
  .summary.compact { gap: var(--u1-space-1); }
  /* Empty structural tracks reserve only the summary's outer frame. Visible
     readings flow naturally at the start; unused space belongs to the tail. */
  .summary.reserved-summary { gap: 0; }
  .summary-content, .summary-reserve { grid-area: 1 / 1; display: grid; gap: var(--u1-space-2); align-content: start; min-width: 0; }
  .summary-content { align-self: start; }
  .summary-reserve { visibility: hidden; pointer-events: none; }
  .reserve-row { --reserve-label-lines: 1; --reserve-value-lines: 1; --reserve-value-size: var(--u1-type-value); min-height: calc(var(--reserve-label-lines) * var(--u1-type-label) * var(--u1-line-label) + var(--u1-reading-copy-gap-compact) + var(--reserve-value-lines) * var(--reserve-value-size) * var(--u1-line-value)); }
  .reserve-row.double { --reserve-value-lines: 2; }
  @container (max-width: 8rem) { .reserve-row:not(.double) { --reserve-label-lines: 2; --reserve-value-lines: 2; } }
  .summary.inset { padding: var(--u1-space-3) var(--u1-composed-x, var(--u1-card-x)); }
</style>
