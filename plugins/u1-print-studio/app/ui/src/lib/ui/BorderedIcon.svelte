<script lang="ts">
  import Icon from './Icon.svelte';
  import type { ComponentProps } from 'svelte';
  let { name }: { name: ComponentProps<typeof Icon>['name'] } = $props();
</script>

<span class="bordered-icon" aria-hidden="true"><Icon {name} /></span>

<style>
  .bordered-icon { display: inline-grid; place-items: center; width: var(--u1-action-size); height: var(--u1-action-size); border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); background: var(--u1-canvas); }
</style>
