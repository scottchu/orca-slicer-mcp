<script lang="ts">
  import { parseColor } from '../../lib/client/common/color';
  let { color = null }: { color?: string | null } = $props();
  const valid = $derived(parseColor(color));
</script>
<span class="swatch" style:background-color={valid?.hex} aria-hidden="true"></span>
<style>
  .swatch { display: inline-block; flex: 0 0 auto; width: 17px; height: 17px; border: 1px solid var(--u1-faint); border-radius: 50%; background: var(--u1-soft); }
</style>
