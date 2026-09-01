<script lang="ts">
  import { formatTimestamp } from './format';
  let { value }: { value: string | null } = $props();
  const formatted = $derived(formatTimestamp(value));
</script>

{#if formatted}<time datetime={value ?? undefined}>{formatted}</time>{:else}<span>Time unavailable</span>{/if}
