<script lang="ts">
  import { Printer } from 'lucide-svelte';
  import type { ResolvedTextValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Badge from '../common/Badge.svelte';
  let { value, appearance = 'default', density = 'regular' }: { density?: 'regular' | 'compact'; value: ResolvedTextValue; appearance?: 'default' | 'headerBadge' } = $props();
  const display = $derived(value.state === 'known' ? value.text ?? 'Unknown' : 'Unknown');
</script>

{#if appearance === 'headerBadge'}
  <Badge label="Status" {display} state={value.state} appearance="header" />
{:else}
  <Reading {density} icon={Printer}><Badge label="Status" {display} state={value.state} /></Reading>
{/if}
