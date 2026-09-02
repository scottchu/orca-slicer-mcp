<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, minimum }: { children: Snippet; minimum?: 'color-action' } = $props();
</script>
<div class="card-grid" class:color-action={minimum === 'color-action'}>{@render children()}</div>
<style>
  .card-grid { --minimum: 8em; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, max(var(--minimum), calc(50% - 6px))), 1fr)); gap: var(--u1-space-3); font-size: var(--u1-type-name); min-width: 0; }
  /* Public nine-character RGB/A label bound, measured for the current font stack:
     6.4 × label size covers the widest hex; plus 17px swatch, two gaps,
     16px glyph and card insets. The complete row is one 44px-high Copy target,
     so a separate 44px action column is unnecessary and the row never wraps.
     This sizes the column, never reserves width in a ready color value.
     Font/token changes must renew the boundary layout tests. */
  .color-action { --minimum: calc(6.4 * var(--u1-type-label) + 17px + 16px + 2 * var(--u1-space-1) + 2 * (var(--u1-space-3) + 1px)); }
</style>
