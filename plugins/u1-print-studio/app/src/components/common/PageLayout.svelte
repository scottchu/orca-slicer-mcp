<script lang="ts">
  import type { Snippet } from 'svelte';
  let { name, children }: { name: string; children: Snippet } = $props();
</script>

<main data-page={name}>{@render children()}</main>

<style>main { max-width: 720px; margin: 12px auto; padding: 0 12px; }</style>
