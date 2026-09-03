<script lang="ts">
  import { onMount } from 'svelte';
  let { onready }: { onready: (element: HTMLElement) => () => void } = $props();
  let element: HTMLDivElement;
  onMount(() => onready(element));
</script>
<div bind:this={element}></div>
